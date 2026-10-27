import { LAKE_STOPS, LAKE_SIZE, MAINLAND, LakeStopId } from '../data/lake';
import { SaveManager } from '../systems/SaveManager';
import { LakeJourney } from '../systems/LakeJourney';
import { UIManager } from './UIManager';

export class LakeFieldGuide {
  private root: HTMLElement;
  private counter: HTMLElement;
  private marker: SVGCircleElement;
  private objective: HTMLElement;
  private checkAt = 0;
  private visited = new Set<string>();
  private lastStatus = '';
  constructor(private journey: LakeJourney, private navigate: (id: LakeStopId, fast?: boolean) => void, private getObjective: () => string) {
    this.visited = new Set(journey.progress.visitedStops);
    this.root = document.createElement('aside'); this.root.className='lake-field-guide';
    this.root.setAttribute('aria-label','Sổ khám phá Hồ Núi Cốc');
    this.root.innerHTML=`<button class="lake-guide-heading" aria-expanded="true"><span><small>HỒ NÚI CỐC · THÁI NGUYÊN</small><strong>Một ngày giữa màu hồ</strong></span><b>−</b></button><div class="lake-guide-body">${this.map()}<div class="lake-guide-count"><span>Dấu chân khám phá</span><b>0/12</b></div><p class="lake-guide-objective"></p><button class="lake-btn lake-open-guide">Bản đồ & 12 điểm dừng ↗</button><small class="lake-map-note">Bản đồ trải nghiệm được cách điệu từ các điểm tham quan Hồ Núi Cốc; không dùng để chỉ đường thực tế.</small></div>`;
    document.getElementById('ui-overlay')!.append(this.root);
    this.counter=this.root.querySelector('.lake-guide-count b')!;
    this.marker=this.root.querySelector('.lake-player-dot')!;
    this.objective=this.root.querySelector('.lake-guide-objective')!;
    const header=this.root.querySelector<HTMLButtonElement>('.lake-guide-heading')!;
    const toggle=(value:boolean)=>{this.root.classList.toggle('collapsed',value);header.setAttribute('aria-expanded',String(!value));header.querySelector('b')!.textContent=value?'+':'−';};
    toggle(matchMedia('(max-width:700px), (max-height:500px)').matches);header.onclick=()=>toggle(!this.root.classList.contains('collapsed'));
    this.root.querySelector<HTMLButtonElement>('.lake-open-guide')!.onclick=()=>this.open();
    this.root.querySelectorAll<SVGGElement>('[data-lake-stop]').forEach(pin=>{
      const activate=()=>this.navigate(pin.dataset.lakeStop as LakeStopId);
      pin.addEventListener('click',activate);pin.addEventListener('keydown',event=>{if((event as KeyboardEvent).key==='Enter'||(event as KeyboardEvent).key===' '){event.preventDefault();activate();}});
    });
  }
  destroy() { this.root.remove(); }
  private map() {
    return `<svg class="lake-guide-map" viewBox="0 0 ${LAKE_SIZE.width} ${LAKE_SIZE.height}" role="group" aria-label="Sơ đồ minh họa mặt hồ, bờ hồ, các đảo và mười hai điểm dừng"><rect width="2400" height="1600" rx="90" fill="#386f72"/><path d="M30 180q300-90 580 0t580 0 580 0 600 0M20 730q350-80 650 5t620-10 570 0 520-20M0 1010q280-45 540 18t610-12 630 0 640-28" fill="none" stroke="#8fc0b1" stroke-width="9" stroke-dasharray="46 36" opacity=".35"/><polygon points="${MAINLAND.map(p=>p.join(',')).join(' ')}" fill="#748b52" stroke="#c2bd85" stroke-width="18"/><path d="M0 210q170 60 210 190t-20 245q75 125 22 255t90 240q-38 145 110 235" fill="none" stroke="#91a16a" stroke-width="34" opacity=".75"/><path d="M480 80q110 75 71 196t-28 210q20 86-37 172M600 750q140-65 279 19m367 280q120 42 237-22" fill="none" stroke="#8e9c5f" stroke-width="26"/><path d="M1220 292q50-81 154-66l57 47 60 10 28 68-38 55-82-11-44 45-96-27-39-57zm419 475q42-55 118-44l74 36-11 55-70 32-82-18-50-24zm-314-190q27-39 76-28l42 42-24 41-64 1-38-24zm-430-134q28-36 72-18l25 40-38 33-51-17zm1004 530q40-29 82 0l25 36-37 29-63-18z" fill="#6e8b50" stroke="#bdbe86" stroke-width="12"/><path d="M300 385V1300H2170M690 905V1300" fill="none" stroke="#d3bd84" stroke-width="27"/><path d="M780 905 1100 900 1500 680M1100 900 1500 1060 1730 1060" fill="none" stroke="#99c7bd" stroke-width="12" stroke-dasharray="30 20"/>${LAKE_STOPS.map((stop,i)=>`<g data-lake-stop="${stop.id}" tabindex="0" role="button" aria-label="${stop.name}${this.visited.has(stop.id)?', đã ghé':', chưa ghé'}"><circle cx="${stop.x}" cy="${stop.y}" r="52" fill="${this.visited.has(stop.id)?'#c6d69b':'#f3d092'}" stroke="#294b39" stroke-width="10"/><text x="${stop.x}" y="${stop.y+18}" text-anchor="middle" font-size="52" font-family="sans-serif" fill="#203b32" font-weight="bold">${i+1}</text></g>`).join('')}<circle class="lake-player-dot" cx="340" cy="1190" r="30" fill="#fff8d7" stroke="#243e35" stroke-width="14"/></svg>`;
  }
  update(x: number,y: number, boating: boolean) {
    const ui=UIManager.getInstance();this.root.hidden=ui.isAnyModalOpen()||ui.isDialogueOpen();
    this.marker.setAttribute('cx',String(x));this.marker.setAttribute('cy',String(y));
    if(performance.now()<this.checkAt)return;this.checkAt=performance.now()+350;
    if(!boating&&!ui.isAnyModalOpen()) for(const stop of LAKE_STOPS) {
      if(this.visited.has(stop.id)||Math.hypot(stop.x-x,stop.y-y)>62)continue;
      this.visited.add(stop.id);
      const save=SaveManager.getInstance().load();save.regionProgress||={};
      const p=save.regionProgress.ho_nui_coc||={visitedStops:[],completedActivities:[]};
      this.journey.visitStop(stop.id);
      this.root.querySelector(`[data-lake-stop="${stop.id}"] circle`)?.setAttribute('fill','#c6d69b');
      ui.showToast('Đã ghé '+stop.name+' · '+this.visited.size+'/12 điểm dừng');
    }
    this.counter.textContent=this.visited.size+'/12';const status=this.getObjective();
    if(status!==this.lastStatus){this.objective.textContent=status;this.lastStatus=status;}
  }
  open() {
    const body=UIManager.getInstance().openExhibit('Hồ Núi Cốc · bản đồ trải nghiệm','12 ĐIỂM DỪNG · CHỌN TUYẾN CỦA BẠN');
    body.closest('.village-exhibit')?.classList.add('lake-exhibit');
    body.innerHTML=`<p class="lake-lead">Đi bộ ven hồ, lên thuyền đến bến đảo và chọn thứ tự khám phá. Chỉ đường sẽ đánh dấu điểm đến; đi nhanh chỉ mở sau lần ghé đầu tiên.</p><div class="lake-map-large">${this.map()}</div><p class="lake-map-note">Bản đồ trải nghiệm được cách điệu từ các điểm tham quan Hồ Núi Cốc; không dùng để chỉ đường thực tế.</p><div class="lake-guide-legend"><span>● Đi bộ ven bờ</span><span>▰ Tuyến thuyền</span><span>✓ Đã ghé</span><span>○ Chưa ghé</span></div><p class="lake-callout">${this.getObjective()}</p><button class="lake-btn lake-next-objective">Chỉ đường tới mục tiêu chính tiếp theo →</button><h3>Trang sổ đã thu thập</h3><div class="lake-journal-list" aria-live="polite"></div><h3>12 điểm dừng</h3><div class="lake-stop-grid"></div><p class="lake-hint">Tên công trình và thông tin thực tế được dẫn nguồn ở từng điểm dừng. Các vị trí rút gọn, tuyến và điểm dịch vụ mô phỏng được ghi rõ trong game.</p>`;
    const nextIndex=[...this.journey.activities].includes('welcome')?['boat_ready','history','island','ecology','legend','reflection'].findIndex(id=>!this.journey.has(id)):-1;
    const nextStop:LakeStopId[]=['dock','history','island','birds','palace','sunset'];
    const nextButton=body.querySelector<HTMLButtonElement>('.lake-next-objective')!;
    if(nextIndex<0)nextButton.disabled=true;else nextButton.onclick=()=>{UIManager.getInstance().closeAllModals();this.navigate(nextStop[nextIndex]);};
    const entries=(this.journey.selections.journalEntries||[]) as string[];
    const journal=body.querySelector('.lake-journal-list')!;
    journal.innerHTML=entries.length?entries.map(id=>{const stop=LAKE_STOPS.find(item=>item.id===id);return stop?`<span class="lake-journal-entry">✓ ${stop.name}${stop.activityId&&this.journey.has(stop.activityId)?' · Hoạt động đã lưu':''}</span>`:'';}).join(''):'<p class="lake-hint">Chưa có trang nào. Ghé một điểm dừng để ghi trang khám phá vào sổ.</p>';
    const grid=body.querySelector('.lake-stop-grid')!;
    LAKE_STOPS.forEach((stop,index)=>{
      const visited=this.visited.has(stop.id);const card=document.createElement('article');card.className='lake-stop-card';
      const activityDone=stop.activityId?this.journey.has(stop.activityId):false;
      const source=stop.source?({operator:'Đơn vị du lịch Hồ Núi Cốc',tourism:'Cục Du lịch Quốc gia Việt Nam',history:'Báo Chính phủ',island:'Báo Công Thương',baCayThong:'Báo và Phát thanh, Truyền hình Thái Nguyên'} as Record<string,string>)[stop.source]:'';
      const url=stop.source?({operator:'https://dulichhonuicoc.vn/gioi-thieu/',tourism:'https://nongthon.vietnamtourism.gov.vn/ho-nui-coc-vien-ngoc-xanh-giua-nui-rung-thai-nguyen/',history:'https://baochinhphu.vn/thi-nhau-lan-chiem-ho-nui-coc-10286829.htm',island:'https://congthuong.vn/can-canh-khu-du-lich-dao-nui-cai-noi-co-dong-tien-co-hang-tram-nam-338777.html',baCayThong:'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/upload/xdata/202507/20250703215943ngay_4-7_hanhchuan-da_nen.pdf'} as Record<string,string>)[stop.source]:'';
      card.innerHTML=`<small>${String(index+1).padStart(2,'0')} · ${stop.area==='shore'?'ĐI BỘ VEN HỒ':'ĐẾN BẰNG THUYỀN'}</small><h3>${stop.name}</h3><p>${stop.description}</p>${source?`<details class="lake-source"><summary>Nguồn thông tin · ${source}</summary><a href="${url}" target="_blank" rel="noopener noreferrer">Mở tư liệu ↗</a></details>`:'<small>Không gian gameplay hư cấu</small>'}<span>${visited?'✓ Đã ghé':'○ Chưa ghé'} · ${activityDone?'✓ Hoạt động đã lưu':'Hoạt động chưa hoàn thành'}</span><div class="lake-actions"><button class="lake-btn secondary" data-nav="${stop.id}">Chỉ đường →</button>${visited?`<button class="lake-btn" data-fast="${stop.id}">Đến điểm đã ghé</button>`:''}<button class="lake-btn secondary" data-info="${stop.id}">Thông tin điểm dừng</button></div>`;grid.append(card);
      card.querySelector<HTMLButtonElement>('[data-nav]')!.onclick=()=>{UIManager.getInstance().closeAllModals();this.navigate(stop.id);};
      const fast=card.querySelector<HTMLButtonElement>('[data-fast]');if(fast)fast.onclick=()=>{UIManager.getInstance().closeAllModals();this.navigate(stop.id,true);};
      card.querySelector<HTMLButtonElement>('[data-info]')!.onclick=()=>{UIManager.getInstance().closeAllModals();this.navigate(stop.id);};
    });
    body.querySelectorAll<SVGGElement>('[data-lake-stop]').forEach(pin=>{
      const activate=()=>{UIManager.getInstance().closeAllModals();this.navigate(pin.dataset.lakeStop as LakeStopId);};
      pin.addEventListener('click',activate);pin.addEventListener('keydown',event=>{if((event as KeyboardEvent).key==='Enter'||(event as KeyboardEvent).key===' '){event.preventDefault();activate();}});
    });
  }
}
