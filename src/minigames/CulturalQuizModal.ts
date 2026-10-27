import { AudioManager } from '../systems/AudioManager';

export class CulturalQuizModal {
  private containerEl!: HTMLElement;
  private onCompleteCallback?: () => void;

  constructor(containerEl: HTMLElement, onComplete?: () => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.render();
  }

  private render() {
    this.containerEl.innerHTML = `
      <div class="quiz-modal-wrapper">
        <div class="quiz-header">
          <div class="quiz-avatar">👨‍🌾</div>
          <div class="quiz-speech">
            <h3>Câu Đố Văn Hóa Trà Tân Cương</h3>
            <p>
              "Bác đố cháu nhé: Yếu tố tự nhiên độc đáo nào tại vùng Tân Cương – Thái Nguyên giúp cây chè nơi đây tích lũy được hương cốm non thanh khiết và vị ngọt hậu sâu lắng nhất?"
            </p>
          </div>
        </div>

        <div class="quiz-options-list">
          <button class="quiz-option-btn" data-correct="true">
            <span class="opt-label">A.</span>
            <span class="opt-text">Dãy núi Tam Đảo che chắn bức xạ nắng gắt buổi chiều, kết hợp đất sỏi son phù sa cổ sông Công màu mỡ</span>
          </button>

          <button class="quiz-option-btn" data-correct="false">
            <span class="opt-label">B.</span>
            <span class="opt-text">Cây chè được trồng trên đất cát pha ven biển đón gió mặn</span>
          </button>

          <button class="quiz-option-btn" data-correct="false">
            <span class="opt-label">C.</span>
            <span class="opt-text">Khí hậu quanh năm băng tuyết lạnh giá như vùng ôn đới</span>
          </button>

          <button class="quiz-option-btn" data-correct="false">
            <span class="opt-label">D.</span>
            <span class="opt-text">Cây chè được tưới hoàn toàn bằng nước mưa nhân tạo trong nhà kính</span>
          </button>
        </div>

        <div id="quiz-feedback" class="quiz-feedback-box hidden"></div>
      </div>
    `;

    const buttons = this.containerEl.querySelectorAll<HTMLButtonElement>('.quiz-option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-correct') === 'true';
        this.handleChoice(btn, isCorrect);
      });
    });
  }

  private handleChoice(chosenBtn: HTMLButtonElement, isCorrect: boolean) {
    const feedbackBox = document.getElementById('quiz-feedback');
    if (!feedbackBox) return;

    if (isCorrect) {
      chosenBtn.classList.add('correct');
      AudioManager.getInstance().playFanfare();

      feedbackBox.classList.remove('hidden');
      feedbackBox.className = 'quiz-feedback-box correct';
      feedbackBox.innerHTML = `
        <div class="feedback-inner">
          <h4>✨ Hoàn Toàn Chính Xác!</h4>
          <p>
            Vị trí địa lý đắc địa nép mình bên dãy Tam Đảo tạo nên tiểu khí hậu mát mẻ, cùng tầng đất sỏi son đỏ vàng độc nhất vô nhị đã làm nên hương vị "Đệ nhất danh trà" lưu truyền thế hệ!
          </p>
          <button id="btn-quiz-reward" class="btn btn-primary">
            Ghi nhận phần tìm hiểu ➔
          </button>
        </div>
      `;

      const rewardBtn = document.getElementById('btn-quiz-reward');
      if (rewardBtn) {
        rewardBtn.addEventListener('click', () => {
          this.handleClaimReward();
        });
      }
    } else {
      chosenBtn.classList.add('wrong');
      AudioManager.getInstance().playClick();

      feedbackBox.classList.remove('hidden');
      feedbackBox.className = 'quiz-feedback-box wrong';
      feedbackBox.innerHTML = `
        <p>⚠️ Chưa chính xác rồi! Hãy nhớ lại lời kể của Bác Lâm về dòng sông Công và dãy núi Tam Đảo nhé. Hãy thử chọn lại!</p>
      `;
    }
  }

  private handleClaimReward() {
    if (this.onCompleteCallback) {
      this.onCompleteCallback();
    }
  }
}
