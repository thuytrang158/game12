import { AudioManager } from '../systems/AudioManager';

export class CaveLightMinigame {
  private containerEl!: HTMLElement;
  private onCompleteCallback?: () => void;
  private litTorches: number = 0;
  private totalTorches: number = 4;

  constructor(containerEl: HTMLElement, onComplete?: () => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.litTorches = 0;
    this.render();
  }

  private render() {
    this.containerEl.innerHTML = `
      <div class="cave-game-wrapper">
        <div class="minigame-header-info">
          <div class="info-pill">
            <span class="info-icon">🔥</span>
            <span>Đuốc thạch nhũ đã thắp: <strong id="torches-lit-count">${this.litTorches}/${this.totalTorches}</strong></span>
          </div>
          <div class="harvest-hint">
            💡 Nhấp vào các trụ thạch nhũ cổ trong hang để thắp sáng đôi cánh Phượng Hoàng!
          </div>
        </div>

        <div class="cave-canvas-area" style="position: relative; height: 260px; background: radial-gradient(circle at center, #2D3748 0%, #1A202C 70%, #0F141C 100%); border-radius: 10px; overflow: hidden; border: 2px solid #718096;">
          <div style="position: absolute; left: 50%; top: 35%; transform: translate(-50%, -50%); font-size: 64px; opacity: 0.25; transition: opacity 0.4s;" id="phoenix-silhouette">
            🦅
          </div>

          <button class="torch-btn" data-id="1" style="position: absolute; left: 20%; top: 30%; background: none; border: none; font-size: 32px; cursor: pointer;">
            <span class="torch-icon">🪨</span>
          </button>
          <button class="torch-btn" data-id="2" style="position: absolute; left: 80%; top: 30%; background: none; border: none; font-size: 32px; cursor: pointer;">
            <span class="torch-icon">🪨</span>
          </button>
          <button class="torch-btn" data-id="3" style="position: absolute; left: 30%; top: 70%; background: none; border: none; font-size: 32px; cursor: pointer;">
            <span class="torch-icon">🪨</span>
          </button>
          <button class="torch-btn" data-id="4" style="position: absolute; left: 70%; top: 70%; background: none; border: none; font-size: 32px; cursor: pointer;">
            <span class="torch-icon">🪨</span>
          </button>
        </div>

        <div id="cave-feedback" class="harvest-feedback-msg">
          Hang Phượng Hoàng huyền bí... Hãy chạm vào 4 trụ thạch nhũ đá để thắp sáng!
        </div>

        <div id="cave-action-area" style="margin-top: 14px; display: none;">
          <button id="btn-cave-finish" class="btn btn-primary" style="width: 100%;">
            Đón Nhận "Mảnh Ký Ức Thiên Nhiên" ➔
          </button>
        </div>
      </div>
    `;

    const torchButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.torch-btn');
    torchButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const icon = btn.querySelector('.torch-icon');
        if (icon && icon.textContent === '🪨') {
          icon.textContent = '🔥';
          btn.style.filter = 'drop-shadow(0 0 10px #FF8822)';
          this.litTorches++;
          AudioManager.getInstance().playPluck();

          const countEl = document.getElementById('torches-lit-count');
          if (countEl) countEl.textContent = `${this.litTorches}/${this.totalTorches}`;

          const phoenix = document.getElementById('phoenix-silhouette');
          if (phoenix) {
            phoenix.style.opacity = `${0.25 + (this.litTorches / this.totalTorches) * 0.75}`;
          }

          if (this.litTorches >= this.totalTorches) {
            this.handleSuccess();
          }
        }
      });
    });
  }

  private handleSuccess() {
    AudioManager.getInstance().playFanfare();

    const feedback = document.getElementById('cave-feedback');
    if (feedback) {
      feedback.innerHTML = `<span class="feedback-success">✨ Toàn bộ vòm đá rực sáng! Cánh Phượng Hoàng và dòng suối ngọc Mỏ Gà đã hiện ra!</span>`;
    }

    const actionArea = document.getElementById('cave-action-area');
    if (actionArea) actionArea.style.display = 'block';

    document.getElementById('btn-cave-finish')?.addEventListener('click', () => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });
  }
}
