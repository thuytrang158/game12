import { AudioManager } from '../systems/AudioManager';
import { InventoryManager } from '../systems/InventoryManager';
import { QuestManager } from '../systems/QuestManager';

export class TeaProcessingMinigame {
  private containerEl!: HTMLElement;
  private currentStage: number = 1; // 1: Làm héo & diệt men, 2: Vò chè móc câu, 3: Sao khô & Đánh hương
  private progress: number = 0;
  private heatLevel: number = 50; // Ideal zone: 45 - 65
  private animFrameId: number | null = null;
  private onCompleteCallback?: () => void;
  private isStirring: boolean = false;
  private stageComplete: boolean = false;

  constructor(containerEl: HTMLElement, onComplete?: () => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.currentStage = 1;
    this.progress = 0;
    this.heatLevel = 50;
    this.stageComplete = false;
    this.render();
    this.startLoop();
  }

  private startLoop() {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      this.updatePhysics(delta);
      this.updateDOM();

      if (!this.stageComplete) {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = requestAnimationFrame(loop);
  }

  private updatePhysics(delta: number) {
    // Fire naturally heats the wok up
    this.heatLevel += delta * 12;

    // Stirring cools/moderates and advances tea processing
    if (this.isStirring) {
      this.heatLevel -= delta * 24;
      AudioManager.getInstance().playSizzle();
    }

    // Clamp heat
    this.heatLevel = Math.max(10, Math.min(95, this.heatLevel));

    // If heat is in the sweet spot (40 - 70), processing progress increases rapidly
    if (this.heatLevel >= 38 && this.heatLevel <= 72) {
      this.progress += delta * 22;
    } else {
      // Suboptimal temperature slows progress
      this.progress += delta * 4;
    }

    if (this.progress >= 100) {
      this.progress = 100;
      this.advanceStage();
    }
  }

  private advanceStage() {
    AudioManager.getInstance().playFanfare();
    if (this.currentStage < 3) {
      this.currentStage++;
      this.progress = 0;
      this.heatLevel = 45;
      this.render();
    } else {
      this.stageComplete = true;
      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.handleSuccess();
    }
  }

  private render() {
    const stageNames = [
      'Công đoạn 1: Làm héo & Diệt men lá chè',
      'Công đoạn 2: Vò chè tạo hình móc câu',
      'Công đoạn 3: Sao khô & Đánh hương bí truyền'
    ];

    const stageHints = [
      'Đảo đều tay trên lửa ấm để lá chè mềm dẻo và giữ sắc xanh tự nhiên.',
      'Dùng lực vừa phải để cánh chè xoăn chặt như lưỡi câu mà không nát búp.',
      'Lửa nhỏ liu riu, giữ nhiệt chuẩn để hương cốm thơm ngào ngạt phủ phấn trắng!'
    ];

    this.containerEl.innerHTML = `
      <div class="processing-game-wrapper">
        <div class="processing-stage-badge">
          <span class="stage-tag">Bước ${this.currentStage}/3</span>
          <h4>${stageNames[this.currentStage - 1]}</h4>
        </div>
        <p class="processing-hint">${stageHints[this.currentStage - 1]}</p>

        <!-- Wok Visual Simulation -->
        <div class="wok-simulation-container">
          <div class="wok-graphic">
            <div id="wok-tea-content" class="wok-tea stage-${this.currentStage} ${this.isStirring ? 'stirring' : ''}">
              <span class="wok-tea-emoji">${this.currentStage === 1 ? '🍃' : (this.currentStage === 2 ? '🌿' : '🍵')}</span>
            </div>
            <div id="steam-puffs" class="steam-puffs ${this.heatLevel > 60 ? 'active' : ''}">♨️</div>
          </div>
        </div>

        <!-- Heat Thermometer & Progress -->
        <div class="gauges-panel">
          <div class="gauge-block">
            <div class="gauge-header">
              <span>Nhiệt độ chảo gang: <strong id="heat-temp-text">${Math.round(this.heatLevel * 2 + 50)}°C</strong></span>
              <span id="heat-status-tag" class="heat-tag optimal">Lý tưởng</span>
            </div>
            <div class="heat-track">
              <div class="heat-sweet-zone"></div>
              <div id="heat-needle" class="heat-needle" style="left: ${this.heatLevel}%"></div>
            </div>
            <div class="heat-legend">
              <span>Quá nguội (30°C)</span>
              <span class="legend-target">Vùng chuẩn (80-95°C)</span>
              <span>Quá nóng (150°C)</span>
            </div>
          </div>

          <div class="gauge-block">
            <div class="gauge-header">
              <span>Độ hoàn thành mẻ chè:</span>
              <strong id="progress-percent">${Math.round(this.progress)}%</strong>
            </div>
            <div class="progress-track">
              <div id="process-fill-bar" class="progress-fill" style="width: ${this.progress}%"></div>
            </div>
          </div>
        </div>

        <!-- Action Control Button -->
        <div class="stir-control-area">
          <button id="btn-stir-tea" class="btn btn-stir">
            <span class="stir-icon">🥄</span>
            <span class="stir-text">Nhấn giữ / Nhấp nhịp nhàng để ĐẢO CHÈ</span>
          </button>
        </div>
      </div>
    `;

    // Bind touch & mouse events for stirring
    const stirBtn = document.getElementById('btn-stir-tea');
    if (stirBtn) {
      const startStir = (e: Event) => {
        e.preventDefault();
        this.isStirring = true;
        stirBtn.classList.add('active');
      };

      const stopStir = (e: Event) => {
        e.preventDefault();
        this.isStirring = false;
        stirBtn.classList.remove('active');
      };

      stirBtn.addEventListener('mousedown', startStir);
      window.addEventListener('mouseup', stopStir);
      stirBtn.addEventListener('touchstart', startStir, { passive: false });
      window.addEventListener('touchend', stopStir);
    }
  }

  private updateDOM() {
    const heatNeedle = document.getElementById('heat-needle');
    const heatText = document.getElementById('heat-temp-text');
    const heatTag = document.getElementById('heat-status-tag');
    const progressFill = document.getElementById('process-fill-bar');
    const progressPercent = document.getElementById('progress-percent');
    const steamPuffs = document.getElementById('steam-puffs');

    if (heatNeedle) heatNeedle.style.left = `${this.heatLevel}%`;
    if (heatText) heatText.textContent = `${Math.round(this.heatLevel * 2 + 50)}°C`;
    if (progressFill) progressFill.style.width = `${this.progress}%`;
    if (progressPercent) progressPercent.textContent = `${Math.round(this.progress)}%`;

    if (heatTag) {
      if (this.heatLevel < 38) {
        heatTag.textContent = 'Hơi nguội';
        heatTag.className = 'heat-tag cold';
      } else if (this.heatLevel > 72) {
        heatTag.textContent = 'Quá nóng! Hãy đảo chè';
        heatTag.className = 'heat-tag hot';
      } else {
        heatTag.textContent = 'Nhiệt độ chuẩn ★';
        heatTag.className = 'heat-tag optimal';
      }
    }

    if (steamPuffs) {
      steamPuffs.style.opacity = this.heatLevel > 65 ? '1' : '0.4';
    }
  }

  private handleSuccess() {
    InventoryManager.getInstance().addItem('tea_processed_tan_cuong', 1);
    QuestManager.getInstance().completeObjective('quest_tan_cuong', 'obj_process_tea');

    this.containerEl.innerHTML = `
      <div class="minigame-result-screen success">
        <div class="result-icon">🍵</div>
        <h3>Sao Chè Thành Công Xuất Sắc!</h3>
        <p class="result-desc">
          Mùi hương cốm non ngào ngạt tỏa khắp chòi! Từng cánh trà xoăn tít như móc câu, ánh lên màu mốc cau chuẩn chỉ dẫn địa lý <strong>Trà Tân Cương</strong> trứ danh.
        </p>
        <div class="reward-preview-box">
          <span class="reward-icon">🍵</span>
          <div class="reward-text">
            <strong>+1 Hộp Trà Tân Cương Thượng Hạng</strong>
            <span>Đặc sản số 1 đã sẵn sàng để pha thưởng thức!</span>
          </div>
        </div>
        <button id="btn-process-finish" class="btn btn-primary">
          Tiếp tục: Báo cáo với Bác Lâm và đón nhận câu đố ➔
        </button>
      </div>
    `;

    const finishBtn = document.getElementById('btn-process-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        if (this.onCompleteCallback) this.onCompleteCallback();
      });
    }
  }

  public destroy() {
    this.stageComplete = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
