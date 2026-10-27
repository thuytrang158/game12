type RoundState = 'intro' | 'aim' | 'flight' | 'result';

/** A deterministic, skill-based five-throw festival game. Closing the host destroys every listener and timer. */
export class TungConMinigame {
  private state: RoundState = 'intro';
  private throws = 0;
  private hits = 0;
  private angle = 31;
  private charge = 0;
  private charging = false;
  private ball?: { x: number; y: number; vx: number; vy: number; age: number };
  private paused = false;
  private lastResult = '';
  private frame = 0;
  private previousFrame = 0;
  private shotTimer = 0;
  private completed = false;
  private abort = new AbortController();
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D;
  private powerFill?: HTMLElement;
  private statusEl?: HTMLElement;
  private results: string[] = [];
  private readonly width = 720;
  private readonly height = 300;
  private readonly groundY = 258;

  constructor(private container: HTMLElement, private onFinish: (won: boolean) => void) {
    this.renderIntro();
  }

  public destroy() {
    this.abort.abort();
    cancelAnimationFrame(this.frame);
    window.clearTimeout(this.shotTimer);
    this.container.replaceChildren();
  }

  private renderIntro() {
    this.container.innerHTML = `<section class="tungcon-game" aria-label="Trò chơi tung còn hội xuân">
      <div class="tungcon-intro"><span aria-hidden="true">🎋</span><div><small>TRÒ CHƠI DÂN GIAN · MÔ PHỎNG TRONG GAME</small><h3>Tung còn hội xuân</h3>
      <p>Canh góc ném và giữ <kbd>Space</kbd> để tích lực. Thả phím để ném qua vòng còn. Có 5 lượt; trúng 3 lượt sẽ nhận dấu hội xuân.</p>
      <p class="tungcon-note">Dùng thanh góc ném hoặc phím ← → để chỉnh hướng. Trò chơi không mô phỏng nghi lễ Đền Đuổm.</p>
      <div class="tungcon-actions"><button class="btn btn-primary" data-start>Bắt đầu</button><button class="btn btn-secondary" data-exit>Thoát về bản đồ</button></div></div></div>
    </section>`;
    this.container.querySelector('[data-start]')?.addEventListener('click', () => this.startRound(), { signal: this.abort.signal });
    this.container.querySelector('[data-exit]')?.addEventListener('click', () => this.onFinish(false), { signal: this.abort.signal });
  }

  private startRound() {
    this.state = 'aim';
    this.paused = false;
    this.container.innerHTML = `<section class="tungcon-game" aria-label="Sân ném còn">
      <div class="tungcon-heading"><div><small>5 QUẢ CÒN · TRÚNG 3 ĐỂ NHẬN DẤU</small><strong data-score>0 / 0 trúng</strong></div><button class="tungcon-pause" data-pause aria-label="Tạm dừng">Tạm dừng</button></div>
      <canvas class="tungcon-canvas" width="720" height="300" role="img" aria-label="Sân ném còn: điều chỉnh góc, tích lực rồi ném quả còn qua vòng trên cây nêu"></canvas>
      <div class="tungcon-controls"><label for="tungcon-angle">Góc ném <output data-angle>31°</output></label><input id="tungcon-angle" type="range" min="10" max="55" value="31" aria-label="Điều chỉnh góc ném">
      <div class="tungcon-power" aria-label="Lực ném"><span>Lực</span><div><i data-power></i></div><output data-power-label>0%</output></div>
      <button class="tungcon-throw" data-throw aria-label="Giữ để tích lực, thả để ném">Giữ để tích lực · thả để ném</button></div>
      <p class="tungcon-status" data-status role="status">Điều chỉnh góc, sau đó giữ nút ném hoặc Space.</p>
      <button class="tungcon-exit" data-exit>Thoát về bản đồ</button>
    </section>`;
    this.canvas = this.container.querySelector('.tungcon-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') || undefined;
    this.powerFill = this.container.querySelector('[data-power]') as HTMLElement;
    this.statusEl = this.container.querySelector('[data-status]') as HTMLElement;
    const angleInput = this.container.querySelector('#tungcon-angle') as HTMLInputElement;
    const angleOutput = this.container.querySelector('[data-angle]') as HTMLOutputElement;
    angleInput.addEventListener('input', () => { this.angle = Number(angleInput.value); angleOutput.value = `${this.angle}°`; }, { signal: this.abort.signal });
    const throwButton = this.container.querySelector('[data-throw]') as HTMLButtonElement;
    throwButton.addEventListener('pointerdown', event => { event.preventDefault(); throwButton.setPointerCapture?.(event.pointerId); this.beginCharge(); }, { signal: this.abort.signal });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => throwButton.addEventListener(type, () => this.releaseCharge(), { signal: this.abort.signal }));
    window.addEventListener('keydown', this.onKeyDown, { signal: this.abort.signal });
    window.addEventListener('keyup', this.onKeyUp, { signal: this.abort.signal });
    this.container.querySelector('[data-pause]')?.addEventListener('click', () => this.togglePause(), { signal: this.abort.signal });
    this.container.querySelector('[data-exit]')?.addEventListener('click', () => this.onFinish(false), { signal: this.abort.signal });
    this.frame = requestAnimationFrame(time => this.tick(time));
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.state !== 'aim' || this.paused) return;
    if (event.code === 'Space') { event.preventDefault(); this.beginCharge(); }
    if (event.code === 'ArrowLeft' || event.code === 'KeyA') this.setAngle(this.angle - 1);
    if (event.code === 'ArrowRight' || event.code === 'KeyD') this.setAngle(this.angle + 1);
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (event.code === 'Space') { event.preventDefault(); this.releaseCharge(); }
  };

  private setAngle(value: number) {
    this.angle = Math.max(10, Math.min(55, value));
    const input = this.container.querySelector<HTMLInputElement>('#tungcon-angle');
    const output = this.container.querySelector<HTMLOutputElement>('[data-angle]');
    if (input) input.value = String(this.angle);
    if (output) output.value = `${this.angle}°`;
  }

  private beginCharge() {
    if (this.state !== 'aim' || this.paused || this.charging) return;
    this.charging = true;
  }

  private releaseCharge() {
    if (!this.charging || this.state !== 'aim' || this.paused) return;
    this.charging = false;
    const radians = this.angle * Math.PI / 180;
    const speed = 5 + this.charge * 0.07;
    this.ball = { x: 94, y: this.groundY - 9, vx: speed * Math.cos(radians), vy: -speed * Math.sin(radians), age: 0 };
    this.state = 'flight';
    this.setStatus('Quả còn đang bay…');
  }

  private togglePause() {
    if (this.state !== 'aim' && this.state !== 'flight') return;
    this.paused = !this.paused;
    if (this.paused) this.charging = false;
    const button = this.container.querySelector<HTMLButtonElement>('[data-pause]');
    if (button) button.textContent = this.paused ? 'Tiếp tục' : 'Tạm dừng';
    this.setStatus(this.paused ? 'Đã tạm dừng. Nhấn Tiếp tục để chơi tiếp.' : 'Trở lại lượt ném.');
  }

  private tick(time: number) {
    const delta = this.previousFrame ? Math.min(40, time - this.previousFrame) : 16;
    this.previousFrame = time;
    if (!this.paused) {
      if (this.charging) this.charge = Math.min(100, this.charge + delta * 0.065);
      if (this.state === 'flight' && this.ball) this.updateBall(delta / 16.67);
    }
    this.updatePower();
    this.draw();
    this.frame = requestAnimationFrame(next => this.tick(next));
  }

  private updateBall(step: number) {
    const ball = this.ball;
    if (!ball) return;
    ball.x += ball.vx * step;
    ball.y += ball.vy * step;
    ball.vy += 0.14 * step;
    ball.age += step;
    const dx = ball.x - 548, dy = ball.y - 108;
    if (dx * dx + dy * dy <= 24 * 24) { this.finishShot(true); return; }
    if (ball.y >= this.groundY - 4 || ball.x > this.width + 10 || ball.age > 150) this.finishShot(false);
  }

  private finishShot(hit: boolean) {
    this.state = 'aim';
    this.throws += 1;
    if (hit) this.hits += 1;
    this.lastResult = hit ? 'Trúng vòng! Cả sân hội reo vui.' : 'Chưa trúng, hãy thử đổi góc hoặc lực ném.';
    this.ball = undefined;
    this.charge = 0;
    this.charging = false;
    const score = this.container.querySelector<HTMLElement>('[data-score]');
    if (score) score.textContent = `${this.hits} / ${this.throws} trúng`;
    if (this.throws >= 5) {
      this.shotTimer = window.setTimeout(() => this.renderResult(), 700);
    } else {
      this.setStatus(this.lastResult);
    }
  }

  private renderResult() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.state = 'result';
    this.completed = this.hits >= 3;
    this.container.innerHTML = `<section class="tungcon-game tungcon-result" role="status"><span aria-hidden="true">${this.completed ? '🏅' : '🎋'}</span><small>KẾT QUẢ 5 LƯỢT</small><h3>${this.completed ? 'Bạn đã vượt vòng còn!' : 'Lần sau sẽ tốt hơn'}</h3><p>${this.hits}/5 quả trúng vòng${this.completed ? '. Bạn nhận được dấu Hội xuân.' : '. Hãy thử lại, đổi góc và canh lực ném.'}</p>
      <div class="tungcon-actions"><button class="btn btn-primary" data-claim>${this.completed ? 'Nhận dấu hội xuân' : 'Kết thúc'}</button><button class="btn btn-secondary" data-replay>Chơi lại</button><button class="btn btn-secondary" data-exit>Thoát về bản đồ</button></div></section>`;
    this.container.querySelector('[data-claim]')?.addEventListener('click', () => this.onFinish(this.completed), { signal: this.abort.signal });
    this.container.querySelector('[data-replay]')?.addEventListener('click', () => this.resetRound(), { signal: this.abort.signal });
    this.container.querySelector('[data-exit]')?.addEventListener('click', () => this.onFinish(false), { signal: this.abort.signal });
  }

  private resetRound() {
    this.throws = 0; this.hits = 0; this.charge = 0; this.lastResult = '';
    this.previousFrame = 0;
    this.startRound();
  }

  private updatePower() {
    if (this.powerFill) this.powerFill.style.width = `${this.charge}%`;
    const label = this.container.querySelector<HTMLOutputElement>('[data-power-label]');
    if (label) label.value = `${Math.round(this.charge)}%`;
  }

  private setStatus(message: string) {
    if (this.statusEl) this.statusEl.textContent = message;
  }

  private draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#d7e4bd'; ctx.fillRect(0, 0, this.width, 196);
    ctx.fillStyle = '#71916a'; ctx.fillRect(0, 196, this.width, 64);
    ctx.fillStyle = '#58774e'; ctx.fillRect(0, 245, this.width, 15);
    // Pixel mountain ridge, festival bunting and low crowd silhouettes.
    ctx.fillStyle = '#91ad7b'; ctx.beginPath(); ctx.moveTo(0, 185); ctx.lineTo(108, 84); ctx.lineTo(200, 177); ctx.lineTo(318, 65); ctx.lineTo(440, 179); ctx.lineTo(565, 92); ctx.lineTo(720, 183); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a74937'; ctx.fillRect(34, 34, 8, 102); ctx.fillStyle = '#dfc16d'; ctx.fillRect(38, 37, 38, 6);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#3f704f' : '#b34e3a'; ctx.fillRect(43 + i * 7, 43 + (i % 2) * 9, 7, 11); }
    for (let x = 22; x < 110; x += 23) { ctx.fillStyle = '#344e3c'; ctx.fillRect(x, 208, 15, 20); ctx.fillStyle = '#e0bd6f'; ctx.fillRect(x + 4, 211, 3, 3); }
    // Cây nêu and target ring.
    ctx.fillStyle = '#694831'; ctx.fillRect(545, 44, 7, 205); ctx.fillStyle = '#a84c38'; ctx.fillRect(552, 55, 57, 8); ctx.fillStyle = '#3c6949'; ctx.fillRect(552, 71, 44, 7);
    ctx.strokeStyle = '#f3d179'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(548, 108, 24, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#fff0bd'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(548, 108, 15, 0, Math.PI * 2); ctx.stroke();
    // Thrower, shadow and a nón lá silhouette.
    ctx.fillStyle = '#405d3d'; ctx.beginPath(); ctx.ellipse(94, 251, 21, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4d7892'; ctx.fillRect(86, 215, 16, 27); ctx.fillStyle = '#252c27'; ctx.fillRect(87, 240, 6, 12); ctx.fillRect(97, 240, 6, 12);
    ctx.fillStyle = '#f1ddb1'; ctx.fillRect(88, 201, 13, 15); ctx.fillStyle = '#a64e38'; ctx.fillRect(82, 198, 25, 4);
    if (this.state === 'aim' && !this.paused) {
      const length = 60, a = this.angle * Math.PI / 180;
      ctx.strokeStyle = '#fff5c8aa'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(104, 220); ctx.lineTo(104 + Math.cos(a) * length, 220 - Math.sin(a) * length); ctx.stroke(); ctx.setLineDash([]);
    }
    if (this.ball) { ctx.fillStyle = '#c53e47'; ctx.fillRect(this.ball.x - 6, this.ball.y - 6, 12, 12); ctx.fillStyle = '#f3d27c'; ctx.fillRect(this.ball.x - 2, this.ball.y - 2, 4, 4); }
    if (this.paused) { ctx.fillStyle = '#183226cc'; ctx.fillRect(0, 0, this.width, this.height); ctx.fillStyle = '#fff2d5'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('ĐANG TẠM DỪNG', this.width / 2, this.height / 2); }
  }
}
