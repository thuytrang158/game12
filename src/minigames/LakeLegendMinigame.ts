import { AudioManager } from '../systems/AudioManager';
import { InventoryManager } from '../systems/InventoryManager';
import { QuestManager } from '../systems/QuestManager';

export class LakeLegendMinigame {
  private containerEl!: HTMLElement;
  private onCompleteCallback?: () => void;
  private collectedFragments: number = 0;
  private totalFragments: number = 3;

  constructor(containerEl: HTMLElement, onComplete?: () => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.collectedFragments = 0;
    this.renderBoatPhase();
  }

  private renderBoatPhase() {
    this.containerEl.innerHTML = `
      <div class="lake-game-wrapper">
        <div class="minigame-header-info">
          <div class="info-pill">
            <span class="info-icon">🛶</span>
            <span>Trang cổ thư: <strong id="lake-scroll-count">${this.collectedFragments}/${this.totalFragments}</strong></span>
          </div>
          <div class="harvest-hint">
            💡 Nhấp vào các hòn đảo và con sóng để tìm 3 cuộn thư cổ nàng Công để lại!
          </div>
        </div>

        <div class="lake-canvas-area" style="position: relative; height: 260px; background: linear-gradient(180deg, #3B7E89 0%, #5CA6B1 100%); border-radius: 10px; overflow: hidden; border: 2px solid #5CA6B1;">
          <div class="island-node" style="position: absolute; left: 18%; top: 25%; font-size: 32px;">🏝️</div>
          <div class="island-node" style="position: absolute; left: 75%; top: 35%; font-size: 36px;">🏝️</div>
          <div class="island-node" style="position: absolute; left: 45%; top: 60%; font-size: 40px;">🏝️</div>

          <button class="scroll-target" data-id="1" style="position: absolute; left: 28%; top: 32%; background: none; border: none; font-size: 28px; cursor: pointer; animation: floatBounce 1.8s infinite;">📜</button>
          <button class="scroll-target" data-id="2" style="position: absolute; left: 68%; top: 48%; background: none; border: none; font-size: 28px; cursor: pointer; animation: floatBounce 1.6s infinite 0.3s;">📜</button>
          <button class="scroll-target" data-id="3" style="position: absolute; left: 40%; top: 70%; background: none; border: none; font-size: 28px; cursor: pointer; animation: floatBounce 2.0s infinite 0.6s;">📜</button>
        </div>

        <div id="lake-feedback" class="harvest-feedback-msg">
          Mặt hồ Núi Cốc mênh mông... Hãy nhấp vào 3 cuộn thư cổ đang trôi dạt!
        </div>
      </div>
    `;

    const scrollButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.scroll-target');
    scrollButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.style.display = 'none';
        this.collectedFragments++;
        AudioManager.getInstance().playPluck();

        const countEl = document.getElementById('lake-scroll-count');
        if (countEl) countEl.textContent = `${this.collectedFragments}/${this.totalFragments}`;

        if (this.collectedFragments >= this.totalFragments) {
          this.renderPuzzlePhase();
        }
      });
    });
  }

  private renderPuzzlePhase() {
    AudioManager.getInstance().playFanfare();

    this.containerEl.innerHTML = `
      <div class="lake-puzzle-wrapper">
        <h3 style="color: #F4C978; margin-bottom: 8px;">Ghép Huyền Tích Chàng Cốc – Nàng Công</h3>
        <p style="font-size: 13px; color: #DDD; margin-bottom: 14px;">
          Hãy sắp xếp 3 đoạn ký ức theo đúng trình tự diễn biến của thiên tình sử bất tử:
        </p>

        <div class="story-drag-list" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="story-card" data-order="1" style="background: rgba(14, 24, 18, 0.9); border: 1.5px solid #F4C978; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5;">
            <strong>Khởi đầu:</strong> Chàng Cốc nghèo khó đem lòng yêu nàng Công xinh đẹp nết na con quan lang vùng đất Thái Nguyên.
          </div>
          <div class="story-card" data-order="2" style="background: rgba(14, 24, 18, 0.9); border: 1.5px solid #F4C978; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5;">
            <strong>Trắc trở:</strong> Quan lang chia rẽ đôi lứa, chàng Cốc ngóng đợi người thương mòn mỏi rồi hóa thành dãy núi Cốc sừng sững.
          </div>
          <div class="story-card" data-order="3" style="background: rgba(14, 24, 18, 0.9); border: 1.5px solid #F4C978; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5;">
            <strong>Hóa thân:</strong> Nàng Công ở nhà đau đớn khóc cạn nước mắt, dòng lệ nàng tuôn trào hóa thành dòng sông Công ôm ấp lấy núi ngàn đời.
          </div>
        </div>

        <button id="btn-complete-legend" class="btn btn-primary" style="margin-top: 18px; width: 100%;">
          Xác Nhận & Đón Nhận "Mảnh Ký Ức Truyền Thuyết" ➔
        </button>
      </div>
    `;

    document.getElementById('btn-complete-legend')?.addEventListener('click', () => {
      AudioManager.getInstance().playFanfare();
      InventoryManager.getInstance().addItem('fragment_legend', 1);
      QuestManager.getInstance().completeQuest('quest_ho_nui_coc');

      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });
  }
}
