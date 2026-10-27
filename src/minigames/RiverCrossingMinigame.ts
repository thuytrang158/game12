import { AudioManager } from '../systems/AudioManager';

export class RiverCrossingMinigame {
  private containerEl!: HTMLElement;
  private onCompleteCallback?: () => void;
  private currentStep: number = 0;
  private targetSteps: number = 4;

  constructor(containerEl: HTMLElement, onComplete?: () => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.currentStep = 0;
    this.render();
  }

  private render() {
    this.containerEl.innerHTML = `
      <div class="river-game-wrapper">
        <div class="minigame-header-info">
          <div class="info-pill">
            <span class="info-icon">🌊</span>
            <span>Ghềnh đá đã vượt: <strong id="river-step-count">${this.currentStep}/${this.targetSteps}</strong></span>
          </div>
          <div class="harvest-hint">
            💡 Nhấp lần lượt vào các tảng đá vững chãi từ bờ bên này sang bờ bên kia!
          </div>
        </div>

        <div class="river-canvas-area" style="position: relative; height: 260px; background: linear-gradient(90deg, #2D3748 0%, #319795 30%, #4FD1C5 70%, #2D3748 100%); border-radius: 10px; overflow: hidden; border: 2px solid #319795;">
          <div style="position: absolute; left: 10px; top: 40%; font-size: 13px; color: #FFF; font-weight: 700;">Bờ xuất phát</div>
          <div style="position: absolute; right: 10px; top: 40%; font-size: 13px; color: #F4C978; font-weight: 700;">Đích đến 🏁</div>

          <!-- River Boulder Steps -->
          <button class="boulder-step" data-step="1" style="position: absolute; left: 24%; top: 38%; background: #4A5568; border: 2px solid #CBD5E0; border-radius: 50%; width: 50px; height: 50px; color: #FFF; font-weight: bold; cursor: pointer;">1</button>
          <button class="boulder-step" data-step="2" style="position: absolute; left: 42%; top: 58%; background: #4A5568; border: 2px solid #CBD5E0; border-radius: 50%; width: 50px; height: 50px; color: #FFF; font-weight: bold; cursor: pointer;">2</button>
          <button class="boulder-step" data-step="3" style="position: absolute; left: 60%; top: 28%; background: #4A5568; border: 2px solid #CBD5E0; border-radius: 50%; width: 50px; height: 50px; color: #FFF; font-weight: bold; cursor: pointer;">3</button>
          <button class="boulder-step" data-step="4" style="position: absolute; left: 78%; top: 50%; background: #4A5568; border: 2px solid #CBD5E0; border-radius: 50%; width: 50px; height: 50px; color: #FFF; font-weight: bold; cursor: pointer;">4</button>
        </div>

        <div id="river-feedback" class="harvest-feedback-msg">
          Dòng suối Cửa Tử xanh ngắt đang cuộn trào... Hãy bước lên tảng đá số 1!
        </div>

        <div id="river-action-area" style="margin-top: 14px; display: none;">
          <button id="btn-river-finish" class="btn btn-primary" style="width: 100%;">
            Chinh Phục Đại Ngàn & Nhận "Mảnh Ký Ức Khám Phá" ➔
          </button>
        </div>
      </div>
    `;

    const stepButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.boulder-step');
    stepButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const stepNum = parseInt(btn.getAttribute('data-step') || '0', 10);
        if (stepNum === this.currentStep + 1) {
          this.currentStep = stepNum;
          btn.style.background = '#38A169';
          btn.style.borderColor = '#FFF';
          btn.style.boxShadow = '0 0 12px #48BB78';
          AudioManager.getInstance().playPluck();

          const countEl = document.getElementById('river-step-count');
          if (countEl) countEl.textContent = `${this.currentStep}/${this.targetSteps}`;

          if (this.currentStep >= this.targetSteps) {
            this.handleSuccess();
          }
        } else {
          AudioManager.getInstance().playClick();
          const feedback = document.getElementById('river-feedback');
          if (feedback) {
            feedback.innerHTML = `<span class="feedback-warn">⚠️ Hãy bước theo đúng thứ tự (đá số ${this.currentStep + 1}) để giữ thăng bằng an toàn!</span>`;
          }
        }
      });
    });
  }

  private handleSuccess() {
    AudioManager.getInstance().playFanfare();

    const feedback = document.getElementById('river-feedback');
    if (feedback) {
      feedback.innerHTML = `<span class="feedback-success">🎉 Xuất sắc! Bạn đã vượt qua dòng thác Cửa Tử nguyên sơ và chiêm ngưỡng khung cảnh hùng vĩ của dãy Tam Đảo!</span>`;
    }

    const actionArea = document.getElementById('river-action-area');
    if (actionArea) actionArea.style.display = 'block';

    document.getElementById('btn-river-finish')?.addEventListener('click', () => {
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });
  }
}
