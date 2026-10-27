import { AudioManager } from '../systems/AudioManager';
import { QuestManager } from '../systems/QuestManager';

type Leaf = { x: number; y: number; angle: number; curl: number; dry: number; damaged: boolean; unsuitable?: boolean; removed?: boolean };

/** A short, gesture-led simulation of a single hand-crafted green-tea batch. */
export class TeaProcessingMinigame {
  private leaves: Leaf[] = [];
  private stage = 0;
  private heat = 1;
  private exposure = 0;
  private softness = 0;
  private rolling = 0;
  private evenness = 0;
  private dryness = 0;
  private damage = 0;
  private rejectedRemoved = 0;
  private basketMoved = false;
  private basketPoured = false;
  private dryingPass: 1 | 2 = 1;
  private pressure = 45;
  private strokes = 0;
  private lastPoint: { x: number; y: number } | null = null;
  private coverage = new Set<number>();
  private frameId: number | null = null;
  private lastFrame = 0;
  private onCompleteCallback?: (outcome: { firstBatch: boolean }) => void;
  private reducedMotion = false;

  constructor(private containerEl: HTMLElement, onComplete?: (outcome: { firstBatch: boolean }) => void) {
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.stage = 0;
    this.heat = 1;
    this.exposure = 0;
    this.softness = 0;
    this.rolling = 0;
    this.evenness = 0;
    this.dryness = 0;
    this.damage = 0;
    this.rejectedRemoved = 0;
    this.basketMoved = false;
    this.basketPoured = false;
    this.dryingPass = 1;
    this.pressure = 45;
    this.strokes = 0;
    this.coverage.clear();
    this.leaves = Array.from({ length: 30 }, (_, i) => ({
      x: 18 + ((i * 37) % 64), y: 20 + ((i * 53) % 58), angle: (i * 43) % 360, curl: 0, dry: 0, damaged: false, unsuitable: i < 2
    }));
    this.render();
  }

  public destroy() {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.containerEl.onpointermove = null;
    this.containerEl.onpointerup = null;
  }

  private stepNames = ['Hong chè · dàn nguyên liệu', 'Diệt men · đảo chè trên chảo tôn nóng', 'Vò chè · tạo hình cánh', 'Rũ tơi · tách cánh chè', 'Sao khô · làm giảm độ ẩm', 'Thành phẩm · kiểm tra mẻ trà'];
  private clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
  private pct(value: number) { return `${Math.round(this.clamp(value, 0, 1) * 100)}%`; }

  private leafMarkup(large = false) {
    return this.leaves.map((leaf, i) => {
      const scaleX = Math.max(.38, 1 - leaf.curl * .48);
      const shade = Math.round(leaf.dry * 45 + this.softness * 14);
      const color = leaf.damaged ? '#62503a' : `hsl(${Math.max(46, 105 - shade)}, ${Math.max(24, 40 - leaf.dry * 10)}%, ${Math.max(24, 39 - shade * .18)}%)`;
      return `<i class="process-leaf ${large ? 'large' : ''} ${leaf.damaged ? 'damaged' : ''} ${leaf.unsuitable ? 'unsuitable' : ''} ${leaf.removed ? 'removed' : ''}" data-leaf="${i}" style="left:${leaf.x}%;top:${leaf.y}%;--leaf-angle:${leaf.angle}deg;--leaf-scale:${scaleX};--leaf-color:${color}"></i>`;
    }).join('');
  }

  private currentWorkspace() {
    const progress = [this.evenness, this.exposure, this.rolling, this.evenness, this.dryness, 1][this.stage] || 0;
    const sceneClass = ['tray', 'pan', 'roll', 'loosen', 'dry', 'final'][this.stage];
    const labels = ['Độ dàn đều', 'Lá mềm dẻo', 'Tạo hình cánh', 'Độ tơi', 'Độ khô mô phỏng', 'Mẻ trà đã hoàn tất'];
    const value = [this.evenness, this.softness, this.rolling, this.evenness, this.dryness, 1][this.stage] || 0;
    const status = this.stage === 1 ? (this.heat > 1.45 ? 'Lửa mô phỏng đang cao' : this.heat < .62 ? 'Nguồn nhiệt mô phỏng thấp' : 'Mức nhiệt mô phỏng vừa')
      : this.stage === 2 ? (this.pressure > 76 ? 'Lực tay mạnh · dễ làm dập cánh' : this.pressure < 28 ? 'Lực tay nhẹ · cánh còn mở' : 'Lực tay vừa · tiếp tục lăn đều')
      : this.stage === 4 ? `Đang mô phỏng lượt sao khô thứ ${this.dryingPass}` : 'Trạng thái nguyên liệu';
    const batchLabel = this.stage === 0 ? 'Lá chè tươi' : this.stage === 1 ? 'Lá đang xử lý nhiệt' : this.stage === 2 ? 'Lá mềm sau diệt men' : this.stage === 3 ? 'Cánh chè sau khi vò' : this.stage === 4 ? 'Cánh chè đang sao khô' : 'Trà xanh Tân Cương đã sao khô';
    return `<div class="process-workspace ${sceneClass}" id="process-workspace" aria-label="Khu vực thao tác ${batchLabel}">
      <div class="process-backdrop"><div class="process-shelf"></div><div class="process-basket"></div>${this.stage === 1 || this.stage === 4 ? '<div class="process-fire"><i></i><i></i><i></i></div>' : ''}</div>
      <div class="process-surface" id="process-surface"><div class="process-batch" id="process-batch">${this.leafMarkup(this.stage === 2 || this.stage === 5)}</div>
      ${this.stage === 1 || this.stage === 4 ? `<div class="process-steam" style="--steam-opacity:${this.stage === 1 ? this.softness : 1 - this.dryness}"><i></i><i></i><i></i></div><div class="process-pan-rim"></div>` : ''}
      ${this.stage === 2 ? '<div class="process-roll-tool" id="process-tool" aria-hidden="true">◉</div>' : ''}
      ${this.stage === 1 || this.stage === 4 ? '<div class="process-turner" aria-hidden="true">▱</div>' : ''}
      ${this.stage === 0 ? '<div class="process-basket-real" id="process-basket-real">NONG TRE<br><small>KÉO CHÈ RA NONG</small></div><div class="process-tool-label">Giữ và rê trên lớp lá để dàn chè đều</div>' : ''}
      ${this.stage === 1 || this.stage === 2 || this.stage === 3 || this.stage === 4 ? '<div class="process-tool-label">Rê ngón tay hoặc chuột qua vùng nguyên liệu để thao tác</div>' : ''}
      </div><div class="process-workbench-label">${batchLabel}</div>
    </div><div class="process-feedback"><span>${labels[this.stage]}</span><b>${this.pct(value)}</b><div><i style="width:${this.pct(value)}"></i></div><small>${status}</small></div>`;
  }

  private render() {
    const isFinal = this.stage === 5;
    const hint = [
      `Kéo giỏ chè lên nong, rê trên lớp lá để dàn mỏng. Nếu muốn, cháu có thể chạm nhặt lá úa rõ rệt (${this.rejectedRemoved}/2).`,
      'Chọn mức lửa mô phỏng rồi rê dụng cụ đảo quanh chảo. Quan sát độ mềm, hơi nước và độ phủ thao tác; tránh để một vùng nóng quá lâu.',
      'Chè đã rời chảo. Lăn nhẹ qua lại trên nong tre; lực vừa giúp cánh cuộn dần, lực quá mạnh làm tăng dấu hiệu dập trong mô phỏng.',
      'Rê và tách các cụm lá đang dính, dàn chúng ra nong để thoát nhiệt trước khi sao khô.',
      this.dryingPass === 1 ? 'Lượt sao khô đầu tiên được rút gọn trong mô phỏng. Đảo mẻ chè và quan sát độ ẩm; sau đó game chuyển thời gian chờ, làm nguội và sàng trước lượt hai.' : 'Lượt hai mô phỏng hoàn thiện cánh chè sau khi đã nghỉ và sàng. Dùng nhiệt mô phỏng vừa, đảo đều và quan sát độ khô.',
      'So sánh lá tươi với cánh trà khô. Báo cáo dưới đây là đánh giá giáo dục trong game, không phải kiểm định chất lượng thật.'
    ][this.stage];
    const control = this.stage === 1 ? `<div class="process-controls"><label>Nguồn nhiệt mô phỏng <input id="process-heat" type="range" min="0" max="2" step=".05" value="${this.heat}"></label><span id="process-heat-label">${this.heat < .75 ? 'Thấp' : this.heat > 1.35 ? 'Cao' : 'Vừa'}</span></div>`
      : this.stage === 2 ? `<div class="process-controls"><label>Lực tay mô phỏng <input id="process-pressure" type="range" min="0" max="100" value="${this.pressure}"></label><span id="process-pressure-label">${this.pressure}%</span></div>`
      : this.stage === 4 ? `<div class="process-controls"><label>Nguồn nhiệt · lượt ${this.dryingPass}/2 <input id="process-heat" type="range" min="0" max="2" step=".05" value="${this.heat}"></label><span id="process-heat-label">${this.heat < .75 ? 'Thấp' : this.heat > 1.35 ? 'Cao' : 'Vừa'}</span></div>` : '';
    const report = isFinal ? `<div class="process-report"><h3>Báo cáo tay nghề · mô phỏng giáo dục</h3><div><span>Nguyên liệu đã xử lý</span><b>${this.leaves.length} cụm lá</b></div><div><span>Mức độ đồng đều</span><b>${Math.round(this.evenness * 100)}%</b></div><div><span>Tạo hình mô phỏng</span><b>${Math.round(this.rolling * 100)}% · ${Math.round(this.damage * 100)}% dấu hiệu dập</b></div><div><span>Trạng thái sao khô</span><b>${Math.round(this.dryness * 100)}%</b></div><p>${this.damage > .25 ? 'Lần sau thử giảm lực và lăn đều tay hơn để hạn chế cánh dập.' : this.evenness < .55 ? 'Lần sau rê dụng cụ qua nhiều vùng hơn để mẻ chè đồng đều hơn.' : 'Cháu đã quan sát và phối hợp thao tác khá đều. Mỗi mẻ thật còn phụ thuộc nguyên liệu và tay nghề.'}</p></div>` : '';
    const stagesLabel = `Bước ${this.stage + 1}/6`;
    this.containerEl.innerHTML = `<section class="processing-redesign"><header class="process-heading"><div><small>${stagesLabel} · LÀM CHÈ THỦ CÔNG MÔ PHỎNG</small><h2>${this.stepNames[this.stage]}${this.stage === 4 ? ` · Lượt ${this.dryingPass}/2` : ''}</h2></div><p><b>Bác Lâm:</b> ${hint}</p></header>${this.currentWorkspace()}${control}${report}<div class="process-actions">${!isFinal && this.stage < 5 ? `<button id="process-hint" class="btn btn-secondary">Gợi ý của Bác Lâm</button><button id="process-next" class="btn btn-primary" ${!this.readyToAdvance() ? 'disabled' : ''}>${this.stage === 4 ? (this.dryingPass === 1 ? 'Nghỉ mẻ, sàng và chuyển sang lượt hai ➜' : 'Để nguội và xem thành phẩm ➜') : this.stage === 0 ? 'Chuyển sang diệt men ➜' : this.stage === 1 ? 'Chuyển chè sang nong vò ➜' : this.stage === 2 ? 'Chuyển sang rũ tơi ➜' : 'Chuyển sang sao khô ➜'}</button>` : '<button id="process-finish" class="btn btn-primary">Nhận thành phẩm và tiếp tục ➜</button>'}</div><p class="process-simplification">Quy trình tham khảo được rút gọn cho gameplay: phơi héo và các khoảng nghỉ được thể hiện bằng chuyển cảnh; nhiệt, thời gian và trạng thái lá trong game chỉ là mô phỏng. Công đoạn minh họa là chảo xử lý nhiệt, vò tay trên nong, rũ tơi và sao khô.</p></section>`;
    this.bindPointers();
    this.containerEl.querySelector<HTMLInputElement>('#process-heat')?.addEventListener('input', event => {
      this.heat = Number((event.currentTarget as HTMLInputElement).value);
      const label = this.containerEl.querySelector<HTMLElement>('#process-heat-label');
      if (label) label.textContent = this.heat < .75 ? 'Thấp' : this.heat > 1.35 ? 'Cao' : 'Vừa';
    });
    this.containerEl.querySelector<HTMLInputElement>('#process-pressure')?.addEventListener('input', event => {
      this.pressure = Number((event.currentTarget as HTMLInputElement).value);
      const label = this.containerEl.querySelector<HTMLElement>('#process-pressure-label');
      if (label) label.textContent = `${this.pressure}%`;
    });
    this.containerEl.querySelector('#process-hint')?.addEventListener('click', () => {
      const workspace = this.containerEl.querySelector<HTMLElement>('#process-surface');
      workspace?.classList.toggle('show-targets');
      const hint = this.containerEl.querySelector<HTMLElement>('.process-heading p');
      if (hint) hint.textContent = this.stage === 0 ? 'Gợi ý: kéo giỏ về giữa nong, sau đó rê theo nhiều hướng để lớp chè trải đều.' : this.stage === 2 ? 'Gợi ý: dùng lực vừa và thực hiện nhiều lượt lăn ngắn; không cần nhấn mạnh.' : 'Gợi ý: thao tác ở nhiều vùng, quan sát trạng thái lá thay vì chỉ nhìn thời gian.';
    });
    this.containerEl.querySelector<HTMLButtonElement>('#process-next')?.addEventListener('click', () => this.advance());
    this.containerEl.querySelector<HTMLButtonElement>('#process-finish')?.addEventListener('click', () => this.handleSuccess());
  }

  private readyToAdvance() {
    return [this.basketMoved && this.basketPoured && this.evenness >= .45, this.exposure >= .5 && this.softness >= .32, this.rolling >= .46, this.evenness >= .62, this.dryness >= (this.dryingPass === 1 ? .4 : .88)][this.stage] ?? false;
  }

  private bindPointers() {
    const surface = this.containerEl.querySelector<HTMLElement>('#process-surface');
    if (!surface || this.stage === 5) return;
    const point = (event: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return { x: this.clamp((event.clientX - rect.left) / rect.width, 0, 1) * 100, y: this.clamp((event.clientY - rect.top) / rect.height, 0, 1) * 100 };
    };
    surface.addEventListener('pointerdown', event => {
      event.preventDefault();
      const badLeafEl = (event.target as HTMLElement).closest<HTMLElement>('.process-leaf.unsuitable:not(.removed)');
      if (badLeafEl && this.stage === 0) {
        const leafIndex = Number(badLeafEl.dataset.leaf);
        const leaf = this.leaves[leafIndex];
        if (leaf && !leaf.removed) {
          leaf.removed = true;
          this.rejectedRemoved += 1;
          badLeafEl.classList.add('removed');
          const next = this.containerEl.querySelector<HTMLButtonElement>('#process-next');
          if (next) next.disabled = !this.readyToAdvance();
          const small = this.containerEl.querySelector<HTMLElement>('.process-feedback small');
          if (small) small.textContent = `Lá không phù hợp đã nhặt riêng · ${this.rejectedRemoved}/2.`;
          AudioManager.getInstance().playPluck();
          return;
        }
      }
      surface.setPointerCapture(event.pointerId);
      this.lastPoint = point(event);
      surface.classList.add('working');
      const basket = (event.target as HTMLElement).closest<HTMLElement>('#process-basket-real');
      if (this.stage === 0 && basket) {
        this.basketMoved = true;
        basket.classList.add('picked');
      }
      this.moveLeaves(this.lastPoint, this.lastPoint);
    });
    surface.addEventListener('pointermove', event => {
      if (!this.lastPoint) return;
      const next = point(event);
      const turner = this.containerEl.querySelector<HTMLElement>('.process-turner');
      if (turner) { turner.style.left = `${next.x}%`; turner.style.top = `${next.y}%`; }
      if (this.stage === 0 && this.containerEl.querySelector('#process-basket-real.picked')) {
        const basket = this.containerEl.querySelector<HTMLElement>('#process-basket-real');
        if (basket) { basket.style.left = `${this.clamp(next.x - 10, 5, 85)}%`; basket.style.top = `${this.clamp(next.y - 8, 28, 65)}%`; }
      }
      this.moveLeaves(this.lastPoint, next);
      this.lastPoint = next;
    });
    const end = () => {
      if (this.stage === 0 && this.containerEl.querySelector('#process-basket-real.picked')) {
        this.basketPoured = true;
        this.containerEl.querySelector('#process-basket-real')?.classList.add('poured');
        const label = this.containerEl.querySelector<HTMLElement>('.process-tool-label');
        if (label) label.textContent = 'Lá đã được trút lên nong · tiếp tục rê để dàn đều';
        const next = this.containerEl.querySelector<HTMLButtonElement>('#process-next');
        if (next) next.disabled = !this.readyToAdvance();
      }
      this.lastPoint = null; surface.classList.remove('working');
    };
    surface.addEventListener('pointerup', end);
    surface.addEventListener('pointercancel', end);
  }

  private moveLeaves(from: { x: number; y: number }, to: { x: number; y: number }) {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    if (dist < 1.4) return;
    this.strokes += 1;
    const sector = Math.floor(Math.atan2(to.y - 50, to.x - 50) / (Math.PI / 4)) + 4;
    this.coverage.add(sector);
    const coverage = Math.min(1, this.coverage.size / 8);
    const force = Math.min(5.5, dist * .28);
    const near = this.leaves.filter(leaf => Math.hypot(leaf.x - to.x, leaf.y - to.y) < (this.stage === 2 ? 28 : 22));
    for (const leaf of near) {
      leaf.x = this.clamp(leaf.x + (to.x - from.x) * .12 + (to.x - leaf.x) * .035, 7, 93);
      leaf.y = this.clamp(leaf.y + (to.y - from.y) * .12 + (to.y - leaf.y) * .035, 8, 90);
      leaf.angle = (leaf.angle + force * 4) % 360;
      if (this.stage === 2) {
        leaf.curl = Math.min(1, leaf.curl + Math.max(0, this.pressure - 18) / 9500 * Math.min(4, dist));
        if (this.pressure > 78) { leaf.damaged = true; this.damage = Math.min(1, this.damage + .0009 * dist); }
      }
      if (this.stage === 4) leaf.dry = this.dryness;
    }
    if (this.stage === 0) {
      this.evenness = Math.min(1, this.evenness + Math.min(.06, dist * .006) * Math.max(.45, coverage));
      // Spreading gradually widens the leaf bed and softens an initially dense pile.
      for (const leaf of this.leaves) {
        leaf.x = this.clamp(50 + (leaf.x - 50) * 1.002, 7, 93);
        leaf.y = this.clamp(50 + (leaf.y - 50) * 1.002, 8, 90);
      }
    } else if (this.stage === 1) {
      const goodHeat = this.heat >= .7 && this.heat <= 1.35;
      const tooHot = this.heat > 1.55;
      if (goodHeat) {
        this.exposure = Math.min(1, this.exposure + .009 * Math.min(3, dist));
        this.softness = Math.min(1, this.softness + .006 * Math.min(3, dist));
      } else if (tooHot) this.damage = Math.min(1, this.damage + .001 * Math.min(3, dist));
      this.evenness = Math.max(this.evenness, coverage);
      AudioManager.getInstance().playSizzle();
    } else if (this.stage === 2) {
      this.rolling = Math.min(1, this.rolling + .009 * Math.min(4, dist) * (this.pressure >= 28 && this.pressure <= 76 ? 1 : .45));
    } else if (this.stage === 3) {
      this.evenness = Math.min(1, this.evenness + .012 * Math.min(4, dist));
    } else if (this.stage === 4) {
      const suitable = this.heat >= .5 && this.heat <= 1.2;
      this.dryness = Math.min(1, this.dryness + .008 * Math.min(4, dist) * (suitable ? 1 : .48));
      this.evenness = Math.max(this.evenness, coverage);
      if (this.heat > 1.6) this.damage = Math.min(1, this.damage + .001 * dist);
    }
    if (this.stage === 2 && this.strokes % 3 === 0) AudioManager.getInstance().playPluck();
    this.updateLeafDOM();
    const feedback = this.containerEl.querySelector<HTMLElement>('.process-feedback');
    if (feedback) {
      const val = [this.evenness, this.softness, this.rolling, this.evenness, this.dryness, 1][this.stage];
      const b = feedback.querySelector('b'); if (b) b.textContent = this.pct(val);
      const fill = feedback.querySelector('i'); if (fill) fill.style.width = this.pct(val);
      const small = feedback.querySelector('small'); if (small) small.textContent = this.stage === 1 && this.heat > 1.55 ? 'Cảnh báo: nguồn nhiệt cao, giảm lửa và tiếp tục đảo đều.' : this.stage === 2 && this.pressure > 78 ? 'Lực mạnh làm tăng dấu hiệu dập. Hạ lực để giữ cánh chè.' : this.stage === 4 && this.heat > 1.6 ? 'Nguồn nhiệt cao có thể làm hỏng cánh trong mô phỏng.' : 'Lá đang thay đổi theo thao tác của cháu.';
    }
    const next = this.containerEl.querySelector<HTMLButtonElement>('#process-next');
    if (next) next.disabled = !this.readyToAdvance();
  }

  private updateLeafDOM() {
    this.leaves.forEach((leaf, index) => {
      const el = this.containerEl.querySelector<HTMLElement>(`[data-leaf="${index}"]`);
      if (!el) return;
      el.style.left = `${leaf.x}%`; el.style.top = `${leaf.y}%`;
      el.style.setProperty('--leaf-angle', `${leaf.angle}deg`);
      el.style.setProperty('--leaf-scale', `${Math.max(.38, 1 - leaf.curl * .48)}`);
      const shade = Math.round(leaf.dry * 45 + this.softness * 14);
      el.style.setProperty('--leaf-color', leaf.damaged ? '#62503a' : `hsl(${Math.max(46, 105 - shade)}, ${Math.max(24, 40 - leaf.dry * 10)}%, ${Math.max(24, 39 - shade * .18)}%)`);
      el.classList.toggle('curled', leaf.curl > .15);
    });
    const batch = this.containerEl.querySelector<HTMLElement>('#process-batch');
    if (batch) {
      batch.style.setProperty('--softness', `${this.softness}`);
      batch.style.setProperty('--dryness', `${this.dryness}`);
      batch.style.setProperty('--steam-opacity', `${this.stage === 1 ? this.softness : 1 - this.dryness}`);
    }
  }

  private advance() {
    if (!this.readyToAdvance()) return;
    AudioManager.getInstance().playFanfare();
    if (this.stage === 4 && this.dryingPass === 1) {
      this.dryingPass = 2;
      this.heat = .72;
      this.coverage.clear();
      this.render();
      return;
    }
    this.stage += 1;
    this.coverage.clear();
    if (this.stage === 1) {
      this.evenness = Math.max(this.evenness, .6);
      // Visible pause for the simplified ambient withering period.
      this.containerEl.dataset.processTransition = 'Đang mô phỏng thời gian hong thoáng nguyên liệu…';
    }
    if (this.stage === 2) {
      this.softness = Math.max(this.softness, .42);
      this.leaves.forEach(leaf => { leaf.x = this.clamp(50 + (leaf.x - 50) * .72, 14, 86); leaf.y = this.clamp(50 + (leaf.y - 50) * .72, 14, 86); });
    }
    if (this.stage === 3) this.evenness = 0;
    if (this.stage === 4) { this.evenness = 0; this.heat = .88; this.dryingPass = 1; }
    if (this.stage === 5) {
      this.leaves.forEach(leaf => { leaf.dry = 1; leaf.curl = Math.max(.35, leaf.curl); });
      this.evenness = Math.max(.58, this.evenness);
    }
    this.render();
  }

  private handleSuccess() {
    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const processObjective = quest?.objectives.find(o => o.id === 'obj_process_tea');
    const isFirstBatch = !processObjective?.completed;
    this.containerEl.innerHTML = `<div class="minigame-result-screen success"><div class="result-icon">🍵</div><h3>Mẻ trà đã sẵn sàng</h3><p class="result-desc">Cháu đã dàn lá, xử lý nhiệt, vò tay, rũ tơi và sao khô qua những không gian riêng. Độ đều và hình cánh ở đây là kết quả mô phỏng để học quan sát, không phải tiêu chuẩn chấm trà thật.</p><div class="reward-preview-box"><span class="reward-icon">🍵</span><div class="reward-text"><strong>${isFirstBatch ? '+1 Mẻ Trà Xanh Tân Cương Đầu Tiên' : 'Mẻ trà đã có trong hành trang'}</strong><span>${isFirstBatch ? 'Có thể mang mẻ trà tới hiên để học pha.' : 'Cháu vừa luyện tập lại quy trình.'}</span></div></div><button id="btn-process-finish" class="btn btn-primary">${isFirstBatch ? 'Tiếp tục: Gặp Bác Lâm để học pha trà ➔' : 'Tiếp tục khám phá ➔'}</button></div>`;
    this.containerEl.querySelector('#btn-process-finish')?.addEventListener('click', () => this.onCompleteCallback?.({ firstBatch: isFirstBatch }));
  }
}
