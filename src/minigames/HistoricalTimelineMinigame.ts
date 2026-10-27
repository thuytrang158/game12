import { AudioManager } from '../systems/AudioManager';

/** Matching activity reports a validated answer; quest rewards stay in the progression layer. */
export class HistoricalTimelineMinigame {
  private matches = ['', '', ''];
  constructor(private containerEl: HTMLElement, private onCompleteCallback?: () => void) {}

  public start() {
    this.render();
  }

  private render(feedback = '') {
    const options = ['Bối cảnh kháng chiến và hoạt động của ATK', 'Cuộc họp tại Tỉn Keo quyết định mở Chiến dịch Điện Biên Phủ', 'Di tích được xếp hạng di tích lịch sử quốc gia đặc biệt'];
    const rows = [
      ['1947', 'Giai đoạn đầu của ATK trong kháng chiến'],
      ['1953', 'Ngày 6 tháng 12: cuộc họp tại Tỉn Keo'],
      ['2012', 'Mốc ghi nhận di tích cấp quốc gia đặc biệt']
    ];
    this.containerEl.innerHTML = `<section class="atk-game-wrapper"><div class="minigame-header-info"><h3>Ghép tư liệu với mốc thời gian</h3><p>Chọn một mô tả cho mỗi mốc. Đây là hoạt động giáo dục trong trò chơi; tư liệu gốc không phải đồ sưu tầm.</p></div><div class="timeline-questions">${rows.map(([year, prompt], index) => `<label class="timeline-card"><strong>${year} · ${prompt}</strong><select data-match="${index}"><option value="">— Chọn nội dung —</option>${options.map((option, optionIndex) => `<option value="${optionIndex}" ${this.matches[index] === String(optionIndex) ? 'selected' : ''}>${option}</option>`).join('')}</select></label>`).join('')}</div>${feedback ? `<p class="timeline-feedback" role="status">${feedback}</p>` : ''}<button id="btn-atk-submit" class="btn btn-primary">Kiểm tra phần ghép ➜</button></section>`;
    this.containerEl.querySelectorAll<HTMLSelectElement>('[data-match]').forEach(select => select.addEventListener('change', () => { this.matches[Number(select.dataset.match)] = select.value; }));
    this.containerEl.querySelector<HTMLButtonElement>('#btn-atk-submit')?.addEventListener('click', () => {
      if (this.matches.some(value => !value)) { this.render('Hãy ghép đủ cả ba mốc rồi xác nhận.'); return; }
      if (this.matches.join(',') !== '0,1,2') { AudioManager.getInstance().playClick(); this.render('Có cặp chưa đúng. Hãy xem lại ghi chú và thử lại; bạn có thể thử không giới hạn.'); return; }
      AudioManager.getInstance().playFanfare();
      this.containerEl.innerHTML = `<section class="atk-game-wrapper"><h3>Phần ghép đã đúng</h3><p>Ba mốc được đặt theo thứ tự: bối cảnh ATK, quyết định tại Tỉn Keo năm 1953, rồi sự ghi nhận di tích năm 2012.</p><button id="btn-atk-finish" class="btn btn-primary">Ghi vào trang nhật ký ➜</button></section>`;
      this.containerEl.querySelector('#btn-atk-finish')?.addEventListener('click', () => this.onCompleteCallback?.());
    });
  }
}
