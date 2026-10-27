import { LakeJourney } from '../systems/LakeJourney';
import { UIManager } from './UIManager';
import { LAKE_STOPS, LAKE_SOURCES, LEGEND_PANELS, LakeStop, LakeStopId, LakeActivity, isExactOrder, hasLakeFinaleRequirements } from '../data/lake';
import { lakeIllustration } from '../assets/lakeArt';
import { LakeLegendMinigame } from '../minigames/LakeLegendMinigame';

interface LakeHooks {
  onChange: () => void;
  onNavigate: (id: LakeStopId) => void;
  onBoat: () => void;
  onCruise: (dock: 'island' | 'birds' | 'shore') => void;
  onLight: (light: string) => void;
}

/** Destination-specific exhibits: each validates actual player choices before reporting a result. */
export class LakeExperience {
  private root?: HTMLElement;
  private ticker?: ReturnType<typeof setInterval>;
  constructor(private journey: LakeJourney, private hooks: LakeHooks) {}

  destroy = () => { if (this.ticker) clearInterval(this.ticker); this.ticker = undefined; };

  open(id: LakeStopId) {
    this.hooks.onChange();
    if (id !== 'arrival' && !this.journey.has('welcome')) {
      const body = this.page(LAKE_STOPS.find(stop => stop.id === id)!);
      body.innerHTML += '<p class="lake-callout">Lão Ngư đang đợi bạn ở Bến đón khách. Hãy nhận sổ hành trình trước khi bắt đầu hoạt động.</p>';
      this.button(body, 'Chỉ đường đến Lão Ngư', () => { UIManager.getInstance().closeAllModals(); this.hooks.onNavigate('arrival'); });
      return;
    }
    switch (id) {
      case 'arrival': this.arrival(); break;
      case 'dock': this.dock(); break;
      case 'history': this.history(); break;
      case 'palace': this.palace(); break;
      case 'pagoda': this.pagoda(); break;
      case 'island': this.island(); break;
      case 'exhibition': this.exhibition(); break;
      case 'birds': this.birds(); break;
      case 'fountain': this.fountain(); break;
      case 'life': this.life(); break;
      case 'panorama': this.panorama(); break;
      case 'sunset': this.sunset(); break;
    }
  }

  private page(stop: LakeStop, illustration = stop.id as string): HTMLElement {
    this.destroy();
    const root = UIManager.getInstance().openExhibit(stop.name, stop.subtitle);
    root.closest('.village-exhibit')?.classList.add('lake-exhibit');
    this.root = root;
    UIManager.getInstance().setExhibitCleanup(this.destroy);
    root.innerHTML = `<div class="lake-scene-art">${lakeIllustration(illustration)}</div><p class="lake-lead">${stop.description}</p>`;
    if (stop.source) {
      const source = LAKE_SOURCES[stop.source as keyof typeof LAKE_SOURCES];
      const note = stop.id === 'exhibition'
        ? 'Bài báo địa phương mô tả nơi đây là không gian trưng bày các vật phẩm từ nhiều nền văn hóa. Các hình và nhãn trong trò chơi là minh họa, không định danh hiện vật.'
        : stop.id === 'history'
          ? 'Thông tin lịch sử hồ chứa được trình bày riêng với huyền tích. Sơ đồ và cảnh trước/sau là minh họa do trò chơi tạo.'
          : stop.id === 'palace'
            ? 'Huyền tích là nội dung văn hóa kể chuyện, không phải lời giải thích lịch sử về công trình hồ.'
            : ['birds','panorama','life','fountain','arrival','dock'].includes(stop.id)
              ? 'Đây là không gian, tình huống hoặc cách bố trí phục vụ gameplay; không khẳng định là dịch vụ hay vị trí chính thức ngoài thực tế.'
              : 'Tên điểm tham quan và thông tin giới thiệu được đối chiếu với tư liệu. Kiến trúc và khoảng cách trong trò chơi được cách điệu.';
      root.innerHTML += `<details class="lake-source"><summary>Thông tin điểm đến & nguồn tư liệu</summary><p>${note}</p><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.title} ↗</a><p>Truy cập ngày 27/10/2026. Không dùng sơ đồ trò chơi để chỉ đường thực tế.</p></details>`;
    }
    return root;
  }
  private stop(id: LakeStopId) { return LAKE_STOPS.find(stop => stop.id === id)!; }
  private button(parent: HTMLElement, text: string, action: () => void, secondary = false): HTMLButtonElement {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'lake-btn' + (secondary ? ' secondary' : '');
    button.textContent = text; button.onclick = action; parent.append(button); return button;
  }
  private feedback(parent: HTMLElement, text: string, success = false) {
    let el = parent.querySelector<HTMLElement>('.lake-feedback');
    if (!el) { el = document.createElement('p'); el.className = 'lake-feedback'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); parent.append(el); }
    el.textContent = text; el.classList.toggle('success', success);
  }
  private finish(parent: HTMLElement, activity: LakeActivity, selections: Record<string, string | number | boolean | string[]> = {}) {
    this.journey.complete(activity, selections);
    if (!this.journey.has(activity)) { this.feedback(parent, 'Hãy hoàn thành bước hướng dẫn trước khi ghi nhận hoạt động.'); return; }
    this.feedback(parent, '✓ Đã ghi vào sổ hành trình. Bạn có thể chơi lại hoặc tiếp tục khám phá.', true);
    this.hooks.onChange();
  }
  private actions(parent: HTMLElement): HTMLElement { const el = document.createElement('div'); el.className = 'lake-actions'; parent.append(el); return el; }
  private select(parent: HTMLElement, label: string, values: [string, string][]): HTMLSelectElement {
    const row = document.createElement('label'); row.className = 'lake-select'; const text = document.createElement('span'); text.textContent = label;
    const select = document.createElement('select'); select.setAttribute('aria-label', label); const empty = document.createElement('option'); empty.value = ''; empty.textContent = 'Chọn câu trả lời…'; select.append(empty);
    values.forEach(([value, text]) => { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); });
    row.append(text, select); parent.append(row); return select;
  }

  private arrival() {
    const body = this.page(this.stop('arrival'));
    body.innerHTML += `<div class="lake-dialogue"><strong>Lão Ngư · người dẫn chuyện hư cấu</strong><p>“Chào cháu! Mặt hồ có chuyện của núi rừng, chuyện của người xây hồ và cả câu chuyện được kể qua nhiều thế hệ. Mình khám phá từng trang nhé.”</p></div><div class="lake-three"><article><b>01 · Cảnh quan và thiên nhiên</b><p>Đi thuyền đến đảo, ngắm đường bờ và rừng cây.</p></article><article><b>02 · Lịch sử hồ chứa</b><p>Tìm hiểu công trình trên sông Công và vai trò tưới tiêu, du lịch.</p></article><article><b>03 · Huyền tích và văn hóa</b><p>Khám phá câu chuyện được kể tại các điểm tham quan.</p></article></div>`;
    const interest=this.select(body,'Cháu muốn bắt đầu từ chủ đề nào?', [['landscape','Cảnh quan và thiên nhiên'],['history','Lịch sử hồ chứa'],['story','Huyền tích và văn hóa']]);
    interest.value=String(this.journey.selections.interestRoute||'landscape');
    const actions = this.actions(body);
    const start=()=>{
      if(!interest.value){this.feedback(body,'Chọn một chủ đề để Lão Ngư gợi ý tuyến tham quan.');return;}
      this.finish(body,'welcome',{interestRoute:interest.value});
      this.feedback(body,'✓ Đã ghi phần mở đầu vào sổ hành trình. Hãy chọn điểm muốn ghé; các hoạt động chính có thể hoàn thành theo thứ tự riêng.',true);
    };
    this.button(actions, 'Cháu muốn bắt đầu khám phá.', start);
    this.button(actions, 'Ở đây có những tuyến nào?', () => {
      this.feedback(body,'Lão Ngư gợi ý ba mạch: theo bờ hồ và thiên nhiên; tìm hiểu hồ chứa; hoặc ghé các không gian kể chuyện. Bạn có thể đổi thứ tự bất cứ lúc nào.');
    }, true);
    this.button(actions, 'Nhắc lại việc cần làm.', () => {
      this.feedback(body,this.journey.has('welcome')?'Sổ đã có phần mở đầu. Chọn bất kỳ điểm dừng nào trong bản đồ trải nghiệm.':'Chọn một chủ đề, nhận sổ hành trình rồi tự chọn tuyến khám phá.');
    }, true);
    this.button(actions, 'Cháu muốn tự đi dạo trước.', () => {
      this.journey.setSelection('interestRoute',interest.value||'landscape');
      this.finish(body,'welcome',{interestRoute:interest.value||'landscape'});
      this.feedback(body,'✓ Bạn có thể tự đi dạo trước; bản đồ luôn sẵn để xem lại mục tiêu và các điểm dừng.',true);
    });
    this.button(actions, 'Xem thông tin du lịch', () => UIManager.getInstance().openDestinationCard('ho_nui_coc'), true);
  }

  private dock() {
    const body = this.page(this.stop('dock'));
    if (!this.journey.has('boat_ready')) {
      body.innerHTML += '<h3>Chuẩn bị cùng người lái thuyền</h3><p>Chọn áo phao theo gợi ý và vị trí ngồi trước khi lên thuyền.</p>';
      const jacket = this.select(body, 'Trang bị trước khi lên thuyền', [['hat','Chỉ cần mũ che nắng'],['lifejacket','Áo phao được người lái hướng dẫn mặc'],['bag','Đeo ba lô là đủ']]);
      const seat = this.select(body, 'Vị trí khi thuyền khởi hành', [['bow','Đứng ở mũi thuyền'],['seat','Ngồi ở vị trí được hướng dẫn'],['edge','Ngồi trên mép thuyền']]);
      const destination=this.select(body,'Bến muốn đến trước', [['island','Đảo Núi Cái'],['birds','Bến quan sát thiên nhiên'],['shore','Ở lại tuyến ven bờ']]);
      const mode=this.select(body,'Cách di chuyển', [['manual','Tự lái thuyền'],['assisted','Đi cùng người lái']]);
      destination.value=String(this.journey.selections.boatDestination||'island');mode.value=String(this.journey.selections.boatMode||'manual');
      this.button(body, 'Kiểm tra chuẩn bị', () => {
        if (jacket.value !== 'lifejacket' || seat.value !== 'seat') { this.feedback(body,'Hãy chọn áo phao và ngồi ở vị trí được hướng dẫn trước khi khởi hành.'); return; }
        if(!destination.value||!mode.value){this.feedback(body,'Chọn bến muốn đến và cách di chuyển trước khi khởi hành.');return;}
        this.finish(body,'boat_ready',{boatDestination:destination.value,boatMode:mode.value}); this.dock();
      });
      return;
    }
    body.innerHTML += '<p class="lake-callout">✓ Đã chuẩn bị. Lái bằng phím WASD/hướng hoặc nút cảm ứng. Khi gần cầu bến, nhấn E hoặc Tương tác để cập bến. Có thể đổi bến và hủy dẫn đường bất cứ lúc nào.</p>';
    const mode=this.select(body,'Cách di chuyển', [['manual','Tự lái thuyền'],['assisted','Đi cùng người lái']]);
    const destination=this.select(body,'Bến muốn đến', [['island','Đảo Núi Cái'],['birds','Bến quan sát thiên nhiên'],['shore','Bến du thuyền · về bờ']]);
    mode.value=String(this.journey.selections.boatMode||'manual');destination.value=String(this.journey.selections.boatDestination||'island');
    mode.onchange=()=>this.journey.setSelection('boatMode',mode.value);destination.onchange=()=>this.journey.setSelection('boatDestination',destination.value);
    const actions = this.actions(body);
    this.button(actions,'Lên thuyền · bắt đầu chuyến đi', () => {
      this.journey.setSelection('boatMode',mode.value);this.journey.setSelection('boatDestination',destination.value);
      UIManager.getInstance().closeAllModals();this.hooks.onBoat();if(mode.value==='assisted')this.hooks.onCruise(destination.value as 'island'|'birds'|'shore');
    });
  }

  private history() {
    const body = this.page(this.stop('history'), 'history');
    body.innerHTML += `<h3>Từ dòng sông đến mặt hồ</h3><p>Hồ Núi Cốc là hồ chứa nhân tạo trên sông Công. Báo Chính phủ ghi công trình được xây dựng trong giai đoạn 1973–1982. Đây là lịch sử công trình, khác với huyền tích được kể ở khu du lịch.</p><div class="lake-compare">${lakeIllustration('before')}<span>CẢNH QUAN MINH HỌA · TRƯỚC KHI TẠO HỒ</span></div>`;
    let viewedAfter = false;
    const toggle = this.button(body, 'Xem minh họa sau khi tạo hồ', () => {
      viewedAfter = true; body.querySelector('.lake-compare')!.innerHTML = lakeIllustration('history') + '<span>CẢNH QUAN MINH HỌA · SAU KHI TẠO HỒ</span>';
      toggle.textContent = '✓ Đã so sánh hai cảnh quan'; toggle.disabled = true;
    }, true);
    body.insertAdjacentHTML('beforeend', '<h3 class="lake-section-heading">Ghép mốc với diễn biến</h3>');
    // Append-only DOM below preserves the comparison button listener.
    const dates = [['today','Ngày nay'],['1982','1982'],['1973','1973']] as [string,string][];
    const start = this.select(body, 'Bắt đầu giai đoạn xây dựng được tư liệu giới thiệu', dates);
    const end = this.select(body, 'Hoàn thành giai đoạn xây dựng', dates);
    const now = this.select(body, 'Tiếp tục phục vụ đời sống và du lịch', dates);
    body.insertAdjacentHTML('beforeend','<h3 class="lake-section-heading">Hồ và đời sống</h3><p>Tư liệu giới thiệu vai trò tưới tiêu và hoạt động du lịch trên hồ. Hãy nối từng hình minh họa với thông tin đã đọc.</p>');
    const functions: [string,string][] = [['irrigation','Tưới tiêu'],['tourism','Du lịch bằng tàu, xuồng'],['landscape','Ngắm mặt hồ và các đảo']];
    const field = this.select(body,'Cánh đồng canh tác',functions), boat = this.select(body,'Tuyến du thuyền',functions), view = this.select(body,'Khung ngắm cảnh',functions);
    this.button(body,'Hoàn thiện trang lịch sử', () => {
      if (!viewedAfter) { this.feedback(body,'Hãy xem cả hai minh họa trước và sau khi tạo hồ.'); return; }
      if (!isExactOrder([start.value,end.value,now.value],['1973','1982','today'])) { this.feedback(body,'Đối chiếu đoạn tư liệu: giai đoạn xây dựng 1973–1982, sau đó là vai trò của hồ trong đời sống ngày nay.'); return; }
      if (!isExactOrder([field.value,boat.value,view.value],['irrigation','tourism','landscape'])) { this.feedback(body,'Hãy nối cánh đồng với tưới tiêu, tuyến thuyền với du lịch, và khung ngắm với mặt hồ cùng các đảo.'); return; }
      this.finish(body,'history');
    });
  }

  private palace(index?: number) {
    const body = this.page(this.stop('palace'), 'palace');
    if (index === undefined) {
      body.innerHTML += '<div class="lake-callout">Huyền tích / câu chuyện kể · không phải tư liệu về thời điểm xây dựng hồ.</div><h3>Ba hoạt cảnh trong không gian kể chuyện</h3>';
      LEGEND_PANELS.forEach((panel,i) => this.button(body, `${this.journey.has('story_' + panel.id) ? '✓' : '○'} ${i+1}. ${panel.title}`, () => this.palace(i), true));
      const actions = this.actions(body);
      const ready = LEGEND_PANELS.every(panel => this.journey.has('story_' + panel.id));
      const puzzle = this.button(actions,'Ghép sổ tranh huyền tích', () => {
        const panel = this.page(this.stop('palace'),'palace');
        const puzzleRoot=document.createElement('div');panel.append(puzzleRoot);
        new LakeLegendMinigame(puzzleRoot, () => { this.finish(panel,'legend'); this.button(panel,'Trở lại không gian kể chuyện',() => this.palace(),true); }).start();
      });
      puzzle.disabled = !ready;
      if (!ready) body.insertAdjacentHTML('beforeend','<p class="lake-hint">Quan sát và ghi nhận biểu tượng ở cả ba hoạt cảnh để mở sổ tranh.</p>');
      return;
    }
    const panel = LEGEND_PANELS[index];
    body.innerHTML += `<div class="lake-story-stage scene-${index}"><span class="lake-story-mountain"></span><span class="lake-story-river"></span><span class="lake-story-person person-one"></span><span class="lake-story-person person-two"></span><span class="lake-story-flower">✦</span></div><h3>${panel.title}</h3><p>${panel.text}</p><p class="lake-hint">Tìm biểu tượng liên kết hoạt cảnh với lời kể.</p>`;
    const choices = this.actions(body);
    const motifs: [string,string][] = [['flower','Bông hoa bên dòng nước'],['mountain','Ngọn núi đứng đợi'],['river','Dòng nước ôm chân núi']];
    motifs.forEach(([id,label]) => this.button(choices,label,()=>{
      if (id !== panel.motif) { this.feedback(body,'Quan sát hoạt cảnh và đọc lại hình ảnh chính trong lời kể nhé.'); return; }
      this.journey.record('story_' + panel.id); this.feedback(body,'✓ Đã lưu tranh “' + panel.title + '” vào sổ.',true); this.hooks.onChange();
    },true));
    this.button(body,index < 2 ? 'Đến hoạt cảnh tiếp theo' : 'Về sổ tranh',()=>this.palace(index < 2 ? index+1 : undefined));
  }

  private island() {
    const body = this.page(this.stop('island'),'island');
    body.innerHTML += '<p>Tư liệu về đảo Núi Cái giới thiệu cổng tam quan, nhà cổ và đồng tiền trưng bày. Các hình bên dưới là mô hình quan sát, không xác định niên đại hay xuất xứ hiện vật.</p>';
    const found = new Set<string>();
    const labels = [['gate','Cổng tam quan','Lối vào với nhiều nhịp cổng'],['house','Nhà cổ','Không gian kiến trúc gỗ'],['coin','Đồng tiền minh họa','Dáng tròn, có lỗ vuông']] as const;
    const grid = document.createElement('div'); grid.className = 'lake-three lake-objects'; body.append(grid);
    labels.forEach(([id,label,detail]) => {
      const item = document.createElement('article'); item.innerHTML = `<div class="lake-object object-${id}" aria-hidden="true"><i></i></div><h4>${label}</h4>`; grid.append(item);
      this.button(item,'Quan sát chi tiết',()=>{ found.add(id); item.classList.add('inspected'); item.querySelector('button')!.textContent='✓ ' + detail; },true);
    });
    const meanings: [string,string][] = [['entry','Lối vào'],['wood','Kiến trúc gỗ'],['round','Hình tròn, lỗ vuông']];
    const a = this.select(body,'Cổng tam quan gợi nhắc',meanings), b=this.select(body,'Nhà cổ được nhận biết qua',meanings), c=this.select(body,'Đồng tiền minh họa có',meanings);
    this.button(body,'Ghi chép chuyến thăm đảo',()=>{
      if (found.size !== 3) { this.feedback(body,'Hãy mở quan sát cả ba mô hình trước khi đối chiếu.'); return; }
      if (!isExactOrder([a.value,b.value,c.value],['entry','wood','round'])) { this.feedback(body,'Đối chiếu các chi tiết đã quan sát: cổng – lối vào, nhà – gỗ, đồng tiền – dáng tròn và lỗ vuông.'); return; }
      this.finish(body,'island');
    });
    this.button(body,'Chỉ đường về cầu bến đảo',()=>{ UIManager.getInstance().closeAllModals();this.hooks.onNavigate('dock'); },true);
  }

  private exhibition() {
    const body=this.page(this.stop('exhibition'),'exhibition');
    body.innerHTML+='<p>Tư liệu địa phương giới thiệu Động Ba Cây Thông là không gian trưng bày nhiều vật phẩm từ các nền văn hóa. Ba khay trong game là minh họa học tập; không phải bản sao hay hồ sơ của hiện vật thật.</p><div class="lake-three lake-display-stations"></div>';
    const stations=[
      ['form','Dáng hình','Quan sát đường nét tổng thể của một vật phẩm minh họa.'],
      ['surface','Bề mặt','So sánh vùng sáng và vùng tối trong hình vẽ.'],
      ['label','Nhãn trưng bày','Tìm nhãn giải thích cách quan sát, không suy đoán xuất xứ.']
    ] as const;
    const grid=body.querySelector('.lake-display-stations')!;
    stations.forEach(([id,title,hint],index)=>{
      const article=document.createElement('article');article.className='lake-display-card';article.innerHTML=`<div class="lake-display-art display-${id}" aria-hidden="true"><i></i><b>${index+1}</b></div><h4>${title}</h4><p>${hint}</p>`;grid.append(article);
      this.button(article,this.journey.has('exhibit_'+id)?'✓ Đã quan sát':'Quan sát khay '+(index+1),()=>{
        this.journey.record('exhibit_'+id);article.classList.add('inspected');this.feedback(body,'Đã ghi nhận chi tiết nhìn thấy. Chỉ ghi điều quan sát được; không tự suy đoán niên đại hay nguồn gốc.',true);this.hooks.onChange();
      },true);
    });
    const form=this.select(body,'Đường viền nào được nhấn mạnh?', [['curve','Đường cong'],['square','Khối vuông'],['stripe','Sọc ngang']]);
    const surface=this.select(body,'Hình minh họa có bề mặt nào?', [['mottled','Đốm sáng tối'],['smooth','Một màu phẳng'],['blank','Không có bề mặt']]);
    const label=this.select(body,'Nhãn trưng bày yêu cầu điều gì?', [['observe','Mô tả điều đang nhìn thấy'],['date','Tự ghi một niên đại'],['origin','Tự gán một xuất xứ']]);
    this.button(body,'Lưu ghi chép trưng bày',()=>{
      if(!stations.every(([id])=>this.journey.has('exhibit_'+id))){this.feedback(body,'Hãy quan sát cả ba khay trước khi ghi chép.');return;}
      if(!isExactOrder([form.value,surface.value,label.value],['curve','mottled','observe'])){this.feedback(body,'Chọn những gì hình minh họa cho thấy: đường cong, vùng sáng tối và mô tả bằng quan sát.');return;}
      this.finish(body,'exhibition');
    });
  }

  private pagoda() {
    const body = this.page(this.stop('pagoda'),'pagoda');
    body.innerHTML += '<h3>Quan sát trong tĩnh lặng</h3><p>Chùa Thác Vàng thuộc quần thể được đơn vị du lịch giới thiệu. Mô hình dưới đây diễn giải ba chi tiết nhận biết; không mô tả sơ đồ thờ tự thực tế.</p>';
    const seen = new Set<string>();
    const actions = this.actions(body);
    [['roof','Mái chùa','Mái và các đường viền giúp nhận biết khối kiến trúc.'],['statue','Tượng Phật','Hình tượng lớn là một dấu nhận biết của quần thể.'],['trees','Khoảng cây xanh','Khoảng xanh tạo không gian nghỉ và quan sát.']].forEach(([id,title,text])=>this.button(actions,title,()=>{seen.add(id);this.feedback(body,text,true);},true));
    const choice=this.select(body,'Bạn chọn cách tham quan nào?', [['quiet','Đi nhẹ, nói khẽ và quan sát từ khu vực cho phép'],['touch','Chạm và di chuyển đồ thờ để xem rõ'],['climb','Leo lên tượng để chụp ảnh']]);
    this.button(body,'Lưu ghi chép kiến trúc',()=>{
      if(seen.size!==3){this.feedback(body,'Hãy quan sát cả mái chùa, tượng và khoảng xanh.');return;}
      if(choice.value!=='quiet'){this.feedback(body,'Chọn quan sát từ nơi cho phép, giữ trật tự và tôn trọng không gian thờ tự.');return;}
      this.finish(body,'pagoda');
    });
  }

  private birds() {
    const body=this.page(this.stop('birds'));
    body.innerHTML += '<p>Ba dáng chim minh họa, không phải bài nhận diện loài. Chạm vào từng dáng trong khung ngắm rồi chọn cách quan sát phù hợp.</p><div class="lake-binocular" aria-label="Khung quan sát chim"><span class="lake-reeds"></span></div>';
    const frame=body.querySelector<HTMLElement>('.lake-binocular')!;
    const poses=[['standing','Dáng chim đứng',22,67],['flying','Dáng chim đang bay',51,25],['resting','Dáng chim nghỉ trên cành',78,51]] as const;
    poses.forEach(([id,label,x,y])=>{
      const target=this.button(frame,label,()=>{
        this.journey.record('bird_'+id); target.classList.add('found');target.textContent='✓';target.setAttribute('aria-label','Đã ghi nhận ' + label);this.hooks.onChange();
      });target.className='lake-bird-target '+id+(this.journey.has('bird_'+id)?' found':'');target.style.left=x+'%';target.style.top=y+'%';target.textContent=this.journey.has('bird_'+id)?'✓':'⌁';target.setAttribute('aria-label',label);
    });
    const behavior=this.select(body,'Bạn sẽ làm gì để quan sát lâu hơn?', [['chase','Đến gần và đuổi chim ra chỗ sáng'],['distance','Giữ khoảng cách và giảm tiếng động'],['feed','Rải đồ ăn để gọi chim đến']]);
    this.button(body,'Hoàn thành ghi chép thiên nhiên',()=>{
      if(!poses.every(([id])=>this.journey.has('bird_'+id))){this.feedback(body,'Bạn còn thiếu một dáng chim trong khung ngắm.');return;}
      if(behavior.value!=='distance'){this.feedback(body,'Giữ khoảng cách và giảm tiếng động giúp quan sát mà không làm xáo trộn.');return;}
      this.finish(body,'ecology');
    });
  }

  private fountain() {
    const body=this.page(this.stop('fountain'));
    body.innerHTML += '<h3>Biên đạo một khúc nước</h3><p>Chọn ba đoạn trình diễn cho phiên bản mô phỏng của bạn. Tiết mục, âm thanh và thời gian trong trò chơi không phải lịch biểu diễn thực tế.</p><div class="lake-fountain" aria-label="Sân khấu vòi phun mô phỏng">'+Array.from({length:13},(_,i)=>`<i style="--jet:${i}"></i>`).join('')+'<span class="lake-fountain-label">Chọn tiết mục bên dưới</span></div>';
    const patterns: [string,string][]=[['wave','Làn sóng'],['fan','Cánh quạt'],['rain','Mưa ánh sáng']];
    const saved=this.journey.selections.fountainPatterns;
    const selections=[0,1,2].map(i=>{const select=this.select(body,'Đoạn '+(i+1),patterns);if(Array.isArray(saved))select.value=saved[i]||'';return select;});
    const height=this.select(body,'Độ cao vòi phun',[['low','Thấp'],['medium','Vừa'],['high','Cao']]);height.value=String(this.journey.selections.fountainHeight||'medium');
    const palette=this.select(body,'Bảng màu',[['cool','Xanh hồ'],['warm','Ánh chiều'],['silver','Bạc trăng']]);palette.value=String(this.journey.selections.fountainPalette||'cool');
    const rhythm=this.select(body,'Nhịp chuyển đoạn',[['calm','Chậm rãi'],['steady','Đều nhịp'],['bright','Rộn ràng']]);rhythm.value=String(this.journey.selections.fountainRhythm||'steady');
    let played=this.journey.has('fountain')&&Array.isArray(saved)&&saved.length===3&&saved.every(Boolean);
    const stage=body.querySelector<HTMLElement>('.lake-fountain')!;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show=(index:number)=>{stage.dataset.pattern=selections[index].value;stage.dataset.height=height.value;stage.dataset.palette=palette.value;stage.dataset.rhythm=rhythm.value;stage.querySelector('span')!.textContent=`Đoạn ${index+1} · ${patterns.find(([id])=>id===selections[index].value)![1]}`;};
    [...selections,height,palette,rhythm].forEach(select=>select.addEventListener('change',()=>{played=false;this.destroy();this.journey.setSelection('fountainPatterns',selections.map(s=>s.value));stage.removeAttribute('data-pattern');stage.querySelector('span')!.textContent='Chọn Phát để xem tiết mục mới';}));
    if(played)stage.querySelector('span')!.textContent='Đã lưu tiết mục · chọn Phát để xem lại';
    let phase=0,paused=false;
    const advance=()=>{phase++;show(phase%3);if(phase>=5){this.destroy();paused=false;}};
    this.button(body,'Phát / phát lại tiết mục',()=>{
      if(selections.some(s=>!s.value)){this.feedback(body,'Chọn hiệu ứng cho đủ ba đoạn.');return;}
      this.destroy();played=true;paused=false;phase=0;show(0);
      if(!reduced)this.ticker=setInterval(advance,1600);
      this.feedback(body,reduced?'Đã dựng tiết mục. Chọn từng đoạn để xem ảnh tĩnh theo cài đặt giảm chuyển động.':'Đang trình diễn ba đoạn do bạn chọn.',true);
    });
    const controls=this.actions(body);
    this.button(controls,'Tạm dừng / tiếp tục',()=>{if(this.ticker){clearInterval(this.ticker);this.ticker=undefined;paused=true;this.feedback(body,'Đã tạm dừng tiết mục.',true);}else if(paused){paused=false;this.ticker=setInterval(advance,1600);this.feedback(body,'Tiết mục đang tiếp tục.',true);}else this.feedback(body,'Hãy phát tiết mục trước khi tạm dừng.',false);},true);
    this.button(controls,'Dừng tiết mục',()=>{this.destroy();stage.removeAttribute('data-pattern');stage.querySelector('span')!.textContent='Tiết mục đã dừng';this.feedback(body,'Đã dừng phần xem trước.',true);},true);
    const actions=this.actions(body);[0,1,2].forEach(i=>this.button(actions,'Xem đoạn '+(i+1),()=>{if(!selections[i].value)return;show(i);},true));
    this.button(body,'Lưu tiết mục vào sổ',()=>{if(!played){this.feedback(body,'Chọn đủ ba đoạn và phát tiết mục trước khi lưu.');return;}this.finish(body,'fountain',{fountainPatterns:selections.map(s=>s.value),fountainHeight:height.value,fountainPalette:palette.value,fountainRhythm:rhythm.value});});
  }

  private life() {
    const body=this.page(this.stop('life'));
    body.innerHTML += '<div class="lake-dialogue"><strong>Cô An · người bán hàng hư cấu</strong><p>“Bến hồ là chỗ người ta gặp nhau. Một ấm trà để mời khách, một món cá hồ để kể chuyện bữa ăn, một tấm thiệp để nhớ chuyến đi.”</p></div><h3>Sắp bàn đón khách</h3><p>Chọn đúng món cho từng vị trí. Đây là hoạt động sinh hoạt hư cấu, không phải quy trình ẩm thực truyền thống.</p>';
    const items: [string,string][]=[['tea','Ấm trà'],['fish','Đĩa cá hồ minh họa'],['card','Bưu thiếp']];
    const a=this.select(body,'Mời khách một thức uống',items),b=this.select(body,'Giới thiệu món ăn',items),c=this.select(body,'Gửi một lời nhắn mang về',items);
    this.button(body,'Hoàn thiện bàn mời khách',()=>{if(!isExactOrder([a.value,b.value,c.value],['tea','fish','card'])){this.feedback(body,'Đối chiếu lời cô An: ấm trà để mời, món cá để giới thiệu và bưu thiếp để lưu kỷ niệm.');return;}this.finish(body,'life');});
  }

  private panorama() {
    const body=this.page(this.stop('panorama'),'lake');
    body.innerHTML+='<h3>Lưu một khung cảnh</h3><p>Chọn khung hình dựng sẵn rồi quan sát các lớp mặt nước, đảo và đồi. Điểm ngắm này được bố trí cho trò chơi, không phải vị trí thực tế đã xác minh.</p><div class="lake-photo-frame" role="img" aria-label="Khung hình minh họa mặt hồ, đảo và đồi"></div>';
    const art=body.querySelector<HTMLElement>('.lake-photo-frame')!;
    const savedFrame=String(this.journey.selections.panoramaFrame||'islands');
    const frameOptions:[string,string][]=[['islands','Các đảo giữa mặt hồ'],['shore','Đường bờ và bến'],['hills','Mặt nước và đồi xa']];
    const frame=this.select(body,'Bố cục ảnh',frameOptions);frame.value=savedFrame;
    const light=this.select(body,'Ánh sáng', [['morning','Sớm trong xanh'],['sunset','Chiều vàng']]);light.value=String(this.journey.selections.panoramaLight||'morning');
    const caption=this.select(body,'Chú thích', [['mat-ho','Mặt hồ và đảo xanh'],['duong-bo','Một đường bờ yên ả'],['chieu-vang','Ánh chiều trên mặt nước']]);caption.value=String(this.journey.selections.panoramaCaption||'mat-ho');
    const render=()=>{art.innerHTML=lakeIllustration('lake',light.value,caption.options[caption.selectedIndex]?.text||'');art.dataset.frame=frame.value;};
    render();[frame,light,caption].forEach(select=>select.addEventListener('change',()=>{this.journey.setSelection('panoramaFrame',frame.value);this.journey.setSelection('panoramaLight',light.value);this.journey.setSelection('panoramaCaption',caption.value);render();}));
    this.button(body,'Chụp và lưu vào sổ',()=>{if(!frame.value||!light.value||!caption.value){this.feedback(body,'Chọn bố cục, ánh sáng và chú thích trước khi lưu.');return;}this.finish(body,'panorama',{panoramaFrame:frame.value,panoramaLight:light.value,panoramaCaption:caption.value});});
  }

  private sunset() {
    const body=this.page(this.stop('sunset'),'lake');
    const art=body.querySelector('.lake-scene-art')!;
    let light=String(this.journey.selections.postcardLight||'sunset');
    let caption=String(this.journey.selections.postcardCaption||'Một ngày ở Hồ Núi Cốc');
    const draw=()=>{art.innerHTML=lakeIllustration('lake',light,caption);this.hooks.onLight(light);};draw();
    const lights=this.actions(body);
    [['morning','Sớm trong xanh'],['sunset','Chiều vàng']].forEach(([id,label])=>this.button(lights,label,()=>{light=id;draw();},true));
    const captions=this.select(body,'Lời nhắn trên bưu thiếp', [['Một ngày ở Hồ Núi Cốc','Một ngày ở Hồ Núi Cốc'],['Mang về một màu xanh','Mang về một màu xanh'],['Núi, sông và những câu chuyện','Núi, sông và những câu chuyện']]);
    captions.value=caption;captions.onchange=()=>{caption=captions.value;draw();};
    const actions=this.actions(body);
    this.button(actions,'Lưu bưu thiếp',()=>{
      this.journey.record('postcard',{postcardLight:light,postcardCaption:caption});
      this.feedback(body,'✓ Đã lưu bưu thiếp. Bạn có thể tải ảnh minh họa hoặc hoàn thiện trang sổ.',true);this.hooks.onChange();
    });
    this.button(actions,'Tải bưu thiếp SVG',()=>{
      const blob=new Blob([lakeIllustration('lake',light,caption)],{type:'image/svg+xml;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ky-niem-ho-nui-coc.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    },true);
    const ready=hasLakeFinaleRequirements(this.journey.activities);
    if(!ready)body.insertAdjacentHTML('beforeend','<p class="lake-callout">Bưu thiếp luôn có thể lưu. Để hoàn thành chương, hãy khám phá lịch sử hồ, đảo Núi Cái, thiên nhiên và ghép xong huyền tích.</p>');
    const complete=this.button(body,this.journey.has('reflection')?'Xem lại trang sổ & cảnh kết':'Hoàn thiện hành trình Hồ Núi Cốc',()=>{
      if(!this.journey.has('postcard')){this.feedback(body,'Hãy lưu bưu thiếp trước khi hoàn thiện trang sổ.');return;}
      this.finish(body,'reflection',{postcardLight:light,postcardCaption:caption});this.ending();
    });complete.disabled=!ready;
  }

  ending() {
    const body=this.page(this.stop('sunset'));
    body.classList.add('lake-ending');
    body.querySelector('.lake-scene-art')!.innerHTML=lakeIllustration('lake','sunset','Hồ Núi Cốc · một trang sổ đã đầy');
    body.innerHTML += '<span class="lake-eyebrow">HỘ CHIẾU XỨ TRÀ · HỒ NÚI CỐC</span><h3>Mang về một màu hồ</h3><p>Bạn đã tìm hiểu lịch sử công trình trên sông Công, lên đảo, quan sát thiên nhiên và nghe câu chuyện nàng Công – chàng Cốc. Mỗi trải nghiệm mở một cách nhìn khác về vùng hồ.</p><div class="lake-stamp">✓ DẤU HỒ NÚI CỐC<br><small>Mảnh ký ức Truyền thuyết</small></div>';
    this.journey.record('ending_seen');
    const actions=this.actions(body);
    this.button(actions,'Tiếp tục khám phá',()=>UIManager.getInstance().closeAllModals());
    this.button(actions,'Bỏ qua cảnh kết / trở lại bến',()=>UIManager.getInstance().closeAllModals(),true);
  }
}
