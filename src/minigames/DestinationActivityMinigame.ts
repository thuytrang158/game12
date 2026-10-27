export type DestinationActivityId = 'thai_hai' | 'den_duom' | 'museum';
export type DestinationExhibition = { cardIds: string[]; title: string; captions: string[] };

const VIEWS: Record<DestinationActivityId, { title: string; intro: string; stages: string[] }> = {
  thai_hai: { title: 'Cùng chuẩn bị đón khách', intro: 'Tình huống gia đình này được viết riêng cho trò chơi; không đại diện cho mọi cộng đồng Tày.', stages: ['guidelines', 'ingredients', 'preparation', 'table'] },
  den_duom: { title: 'Hoàn thiện tờ giới thiệu', intro: 'Phần hội trong trò chơi là minh họa quanh năm; không mô phỏng nghi lễ thật.', stages: ['matching', 'courtyard', 'conduct'] },
  museum: { title: 'Người kết nối di sản', intro: 'Đây là mô hình triển lãm số cách điệu, không phải sơ đồ hay bộ sưu tập hiện vật cụ thể.', stages: ['matching', 'exhibition'] }
};

/** Small accessible activities. Completion is returned to the chapter layer; this class grants no quest rewards. */
export class DestinationActivityMinigame {
  private completed: Set<string>;
  private step: string;
  private order = ['wash', 'prepare', 'serve'];
  private selected = new Set<string>();
  private matches: Record<string, string> = {};
  private feedback = '';
  private titleChoice = 'Cuộc gặp gỡ';
  private readonly view: { title: string; intro: string; stages: string[] };

  constructor(
    private container: HTMLElement,
    private type: DestinationActivityId,
    private onStageComplete: (stageId: string, exhibition?: DestinationExhibition) => void,
    private onFinish: () => void,
    completedStageIds: string[] = [],
    private exhibition?: DestinationExhibition
  ) {
    this.view = VIEWS[type];
    this.titleChoice = this.exhibition?.title || 'Cuộc gặp gỡ';
    this.completed = new Set(completedStageIds);
    this.step = this.view.stages.find(id => !this.completed.has(id)) || '';
    if (type === 'den_duom') this.order = ['serve', 'wash', 'prepare'];
    this.render();
  }

  public destroy() {
    this.container.replaceChildren();
  }

  private render() {
    if (!this.step) {
      this.container.innerHTML = `<section class="destination-activity"><p>Đã hoàn thành hoạt động.</p><button class="btn btn-primary" data-finish>Tiếp tục ➜</button></section>`;
      this.container.querySelector('[data-finish]')?.addEventListener('click', this.onFinish);
      return;
    }
    const current = this.view.stages.indexOf(this.step) + 1;
    this.container.innerHTML = `<section class="destination-activity"><small>HOẠT ĐỘNG ${current}/${this.view.stages.length}</small><h3>${this.view.title}</h3><p>${this.view.intro}</p><div class="destination-activity-content">${this.renderStep()}</div>${this.feedback ? `<p class="destination-activity-feedback" role="status">${this.feedback}</p>` : ''}<button class="btn btn-primary" data-submit>${this.submitLabel()}</button></section>`;
    this.bindStep();
    this.container.querySelector<HTMLButtonElement>('[data-submit]')?.addEventListener('click', () => this.submit());
  }

  private submitLabel() {
    return this.view.stages.indexOf(this.step) === this.view.stages.length - 1 ? 'Hoàn tất hoạt động ➜' : 'Xác nhận và tiếp tục ➜';
  }

  private renderStep(): string {
    if (this.type === 'thai_hai') {
      if (this.step === 'guidelines') return this.checkboxList('guideline', [
        ['ask', 'Hỏi trước khi chụp ảnh hoặc bước vào không gian riêng'],
        ['follow', 'Đi theo hướng dẫn của người đón khách'],
        ['leave', 'Giữ gìn không gian chung và mang rác về đúng nơi']
      ]);
      if (this.step === 'ingredients') return this.checkboxList('ingredient', [
        ['greens', 'Rau cải có nhãn “thu hoạch hôm nay”'],
        ['pumpkin', 'Bí đỏ theo gợi ý trong phiếu'],
        ['herbs', 'Rau thơm được người làm vườn giới thiệu'],
        ['wild', 'Cây mọc tự nhiên ngoài khu vườn được mời']
      ]);
      if (this.step === 'preparation') return this.reorderList([['wash','Rửa nguyên liệu'],['prepare','Sơ chế trên thớt'],['serve','Chuyển món đã chuẩn bị tới bàn']]);
      return this.checkboxList('place', [
        ['tray', 'Đặt khay tiếp khách'], ['cups', 'Đặt đủ ba chén'], ['water', 'Đặt bình nước'], ['seats', 'Sắp ba chỗ ngồi cho khách']
      ]);
    }
    if (this.type === 'den_duom') {
      if (this.step === 'matching') return this.matchList([
        ['person', 'Người được tưởng niệm', ['Nhân vật được tưởng niệm','Không gian di tích','Hoạt động hội']],
        ['place', 'Bối cảnh di tích', ['Nhân vật được tưởng niệm','Không gian di tích','Hoạt động hội']],
        ['festival', 'Hoạt động hội', ['Nhân vật được tưởng niệm','Không gian di tích','Hoạt động hội']]
      ], { person: 'Nhân vật được tưởng niệm', place: 'Không gian di tích', festival: 'Hoạt động hội' });
      if (this.step === 'courtyard') return this.checkboxList('courtyard', [
        ['signs', 'Đặt bảng chỉ dẫn trong sân sinh hoạt'], ['table', 'Sắp bàn thông tin'], ['sort', 'Phân loại tài liệu phát cho khách']
      ]);
      return this.matchList([
        ['quiet', 'Ở khu vực cần sự yên tĩnh', ['Nói nhỏ và làm theo biển hướng dẫn','Đi vào khu vực hạn chế để chụp ảnh','Để rác cạnh lối đi']],
        ['space', 'Khi đi qua không gian thờ tự', ['Nói nhỏ và làm theo biển hướng dẫn','Đi vào khu vực hạn chế để chụp ảnh','Để rác cạnh lối đi']],
        ['clean', 'Khi dùng đồ ăn, nước uống', ['Nói nhỏ và làm theo biển hướng dẫn','Đi vào khu vực hạn chế để chụp ảnh','Để rác cạnh lối đi']]
      ], { quiet: 'Nói nhỏ và làm theo biển hướng dẫn', space: 'Nói nhỏ và làm theo biển hướng dẫn', clean: 'Nói nhỏ và làm theo biển hướng dẫn' });
    }
    if (this.step === 'matching') return this.matchList([
      ['woven', 'Mô hình sợi đan (minh họa)', ['Đồ dùng chứa/đựng','Nhạc cụ','Không gian ở','Trang phục']],
      ['instrument', 'Mô hình nhạc cụ dây (minh họa)', ['Đồ dùng chứa/đựng','Nhạc cụ','Không gian ở','Trang phục']],
      ['house', 'Mô hình nhà sàn (minh họa)', ['Đồ dùng chứa/đựng','Nhạc cụ','Không gian ở','Trang phục']],
      ['cloth', 'Mô hình hoa văn vải (minh họa)', ['Đồ dùng chứa/đựng','Nhạc cụ','Không gian ở','Trang phục']]
    ], { woven: 'Đồ dùng chứa/đựng', instrument: 'Nhạc cụ', house: 'Không gian ở', cloth: 'Trang phục' });
    const savedCards = this.exhibition?.cardIds || [];
    const initial = new Set(savedCards);
    const captions = ['Hình dáng', 'Chất liệu', 'Công dụng'];
    return `<fieldset><legend>Chọn đúng ba thẻ và đặt tiêu đề</legend>${[['woven','Mô hình sợi đan'],['instrument','Mô hình nhạc cụ dây'],['house','Mô hình nhà sàn'],['cloth','Mô hình hoa văn vải']].map(([id,label]) => `<label><input type="checkbox" data-select="${id}" ${initial.has(id) ? 'checked' : ''}> ${label} · minh họa</label>`).join('')}<label>Tiêu đề<select data-title><option ${this.titleChoice==='Cuộc gặp gỡ'?'selected':''}>Cuộc gặp gỡ</option><option ${this.titleChoice==='Quan sát và tìm hiểu'?'selected':''}>Quan sát và tìm hiểu</option><option ${this.titleChoice==='Điều tôi muốn kể'?'selected':''}>Điều tôi muốn kể</option></select></label><p>${captions.map(x=>`Chú thích sẽ tập trung vào: ${x.toLowerCase()}`).join(' · ')}</p></fieldset>`;
  }

  private checkboxList(name: string, rows: string[][]) {
    return `<fieldset><legend>Chọn những mục cần thiết</legend>${rows.map(([id,label]) => `<label><input type="checkbox" name="${name}" value="${id}"> ${label}</label>`).join('')}</fieldset>`;
  }

  private matchList(rows: Array<[string,string,string[]]>, correct: Record<string,string>) {
    return `<fieldset><legend>Chọn mục ghép cho từng thẻ</legend>${rows.map(([id,label,choices]) => `<label>${label}<select data-match="${id}"><option value="">— Chọn một mục —</option>${choices.map(choice => `<option>${choice}</option>`).join('')}</select></label>`).join('')}</fieldset>`;
  }

  private reorderList(rows: string[][]) {
    const labels: Record<string,string> = Object.fromEntries(rows);
    return `<fieldset><legend>Sắp xếp thứ tự bằng nút lên/xuống</legend><ol>${this.order.map((id,index) => `<li>${labels[id]} <button type="button" data-move="${index}" data-dir="-1" aria-label="Di chuyển lên">↑</button><button type="button" data-move="${index}" data-dir="1" aria-label="Di chuyển xuống">↓</button></li>`).join('')}</ol></fieldset>`;
  }

  private bindStep() {
    if (this.type === 'museum' && this.step === 'exhibition') {
      this.container.querySelectorAll<HTMLInputElement>('input[data-select]:checked').forEach(input => {
        if (input.dataset.select) this.selected.add(input.dataset.select);
      });
    }
    this.container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(input => input.addEventListener('change', () => {
      const key = input.dataset.select || input.value;
      if (input.checked) this.selected.add(key); else this.selected.delete(key);
    }));
    this.container.querySelectorAll<HTMLSelectElement>('[data-match]').forEach(select => select.addEventListener('change', () => {
      if (select.dataset.match) this.matches[select.dataset.match] = select.value;
    }));
    this.container.querySelectorAll<HTMLButtonElement>('[data-move]').forEach(button => button.addEventListener('click', () => {
      const from = Number(button.dataset.move), to = from + Number(button.dataset.dir);
      if (to < 0 || to >= this.order.length) return;
      [this.order[from], this.order[to]] = [this.order[to], this.order[from]];
      this.render();
    }));
    this.container.querySelector<HTMLSelectElement>('[data-title]')?.addEventListener('change', event => {
      this.titleChoice = (event.currentTarget as HTMLSelectElement).value;
    });
  }

  private submit() {
    let valid = false;
    if (this.type === 'thai_hai') {
      if (this.step === 'guidelines') valid = ['ask','follow','leave'].every(id => this.selected.has(id));
      if (this.step === 'ingredients') valid = this.selected.size === 3 && ['greens','pumpkin','herbs'].every(id => this.selected.has(id));
      if (this.step === 'preparation') valid = this.order.join(',') === 'wash,prepare,serve';
      if (this.step === 'table') valid = ['tray','cups','water','seats'].every(id => this.selected.has(id));
    } else if (this.type === 'den_duom') {
      if (this.step === 'matching') valid = ['person','place','festival'].every(id => this.matches[id] === ({person:'Nhân vật được tưởng niệm',place:'Không gian di tích',festival:'Hoạt động hội'} as Record<string,string>)[id]);
      if (this.step === 'courtyard') valid = ['signs','table','sort'].every(id => this.selected.has(id));
      if (this.step === 'conduct') valid = ['quiet','space','clean'].every(id => this.matches[id] === 'Nói nhỏ và làm theo biển hướng dẫn');
    } else {
      if (this.step === 'matching') valid = ['woven','instrument','house','cloth'].every(id => this.matches[id] === ({woven:'Đồ dùng chứa/đựng',instrument:'Nhạc cụ',house:'Không gian ở',cloth:'Trang phục'} as Record<string,string>)[id]);
      if (this.step === 'exhibition') valid = this.selected.size === 3;
    }
    if (!valid) {
      this.feedback = 'Chưa khớp hết các yêu cầu. Hãy xem lại nhãn và thử lại; bạn có thể thử không giới hạn.';
      this.render();
      return;
    }
    const done = this.step;
    let exhibit: DestinationExhibition | undefined;
    if (this.type === 'museum' && done === 'exhibition') {
      const cards = [...this.selected];
      exhibit = { cardIds: cards, title: this.titleChoice, captions: cards.map(() => 'Quan sát mô hình minh họa') };
      this.exhibition = exhibit;
    }
    this.completed.add(done);
    this.onStageComplete(done, exhibit);
    this.step = this.view.stages.find(id => !this.completed.has(id)) || '';
    this.selected.clear();
    this.matches = {};
    this.feedback = '';
    if (this.step) this.render();
    else this.render();
  }
}
