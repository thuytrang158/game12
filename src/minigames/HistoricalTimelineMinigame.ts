import { AudioManager } from '../systems/AudioManager';
import { InventoryManager } from '../systems/InventoryManager';
import { QuestManager } from '../systems/QuestManager';

export class HistoricalTimelineMinigame {
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
      <div class="atk-game-wrapper">
        <div class="minigame-header-info">
          <div class="info-pill">
            <span class="info-icon">⭐</span>
            <span>Di Tích Lịch Sử: <strong>Thủ Đô Gió Ngàn ATK</strong></span>
          </div>
          <div class="harvest-hint">
            💡 Ghép nối chính xác các mốc thời gian hào hùng của chiến khu cách mạng!
          </div>
        </div>

        <div class="timeline-questions" style="display: flex; flex-direction: column; gap: 12px; margin-top: 14px;">
          <div class="timeline-card" style="background: rgba(14, 24, 18, 0.85); border: 1.5px solid #A8C879; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #F4C978; margin-bottom: 4px;">1. Năm 1947: Sự kiện gì gắn liền với Định Hóa?</div>
            <label style="display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer;">
              <input type="radio" name="atk_q1" value="correct" checked />
              Bác Hồ và Trung ương chọn Định Hóa làm An Toàn Khu (ATK) đầu não kháng chiến
            </label>
          </div>

          <div class="timeline-card" style="background: rgba(14, 24, 18, 0.85); border: 1.5px solid #A8C879; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #F4C978; margin-bottom: 4px;">2. Ngày 6/12/1953: Cuộc họp lịch sử tại Đồi Tỉn Keo quyết định điều gì?</div>
            <label style="display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer;">
              <input type="radio" name="atk_q2" value="correct" checked />
              Bộ Chính trị phê chuẩn chủ trương mở Chiến dịch Điện Biên Phủ lịch sử
            </label>
          </div>

          <div class="timeline-card" style="background: rgba(14, 24, 18, 0.85); border: 1.5px solid #A8C879; border-radius: 8px; padding: 12px;">
            <div style="font-weight: 700; color: #F4C978; margin-bottom: 4px;">3. Ý nghĩa văn hóa - lịch sử của Lán Khuôn Tát và rặng tre chiến khu?</div>
            <label style="display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer;">
              <input type="radio" name="atk_q3" value="correct" checked />
              Nơi Bác Hồ sống giản dị, hòa cùng thiên nhiên và tấm lòng chở che của đồng bào Tày
            </label>
          </div>
        </div>

        <button id="btn-atk-submit" class="btn btn-primary" style="margin-top: 18px; width: 100%;">
          Ghi Danh Sử Sách & Nhận "Mảnh Ký Ức Lịch Sử" ➔
        </button>
      </div>
    `;

    document.getElementById('btn-atk-submit')?.addEventListener('click', () => {
      AudioManager.getInstance().playFanfare();
      InventoryManager.getInstance().addItem('fragment_history', 1);
      QuestManager.getInstance().completeQuest('quest_atk_dinh_hoa');

      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });
  }
}
