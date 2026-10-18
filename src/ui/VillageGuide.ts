import { UIManager } from './UIManager';
import { SaveManager } from '../systems/SaveManager';

export const VILLAGE_STOPS = [
  { id: 'garden', name: 'Nương chè xanh', icon: '🍃', x: 390, y: 350, tag: '01 · TỪ BÚP CHÈ', text: 'Quan sát búp non, lá trưởng thành và những luống chè. Ghé Bác Lâm để nhận hướng dẫn trước khi thực hành hái chè.', action: 'Đến nương chè' },
  { id: 'workshop', name: 'Nhà sao chè', icon: '🔥', x: 740, y: 200, tag: '02 · BÀN TAY NGHỆ NHÂN', text: 'Bước vào gian nhà ấm lửa. Khám phá nia tre, chảo sao, bàn vò và khu sàng chè; tìm hiểu đường đi của một mẻ chè xanh.', action: 'Đến cửa nhà sao' },
  { id: 'nursery', name: 'Vườn ươm', icon: '🌱', x: 285, y: 480, tag: '03 · ƯƠM MỘT MẦM XANH', text: 'Từ cây giống đến nương chè: quan sát cây con, tìm hiểu chăm sóc và ghé Cô Hương chọn giống cho nhiệm vụ của bạn.', action: 'Đến vườn ươm' },
  { id: 'pavilion', name: 'Hiên thưởng trà', icon: '🍵', x: 480, y: 170, tag: '04 · CHẬM LẠI MỘT CHÚT', text: 'Dừng chân bên ấm trà, ngắm nương xanh. Sau khi hoàn thành sao chè, bạn có thể ngồi tại chòi và mở trải nghiệm hoàng hôn.', action: 'Đến hiên trà' },
  { id: 'culture', name: 'Góc chuyện xứ trà', icon: '🏡', x: 180, y: 195, tag: '05 · CHUYỆN LÀNG CHÈ', text: 'Chiếc giỏ đựng búp, nia tre và ấm trà kể câu chuyện về lao động và lòng hiếu khách. Hãy trò chuyện với những người trong làng để nghe thêm.', action: 'Đến nhà vườn' },
  { id: 'river', name: 'Bến ngắm cảnh', icon: '🌿', x: 610, y: 550, tag: '06 · MANG VỀ MỘT KỶ NIỆM', text: 'Một khoảng nghỉ bên dòng nước và đồi chè. Giữ lối đi sạch, không ngắt cây ngoài khu trải nghiệm và tôn trọng sinh hoạt của người dân khi tham quan thực tế.', action: 'Đến bến ngắm cảnh' }
];

export function stampVisit(id: string): boolean {
  const manager = SaveManager.getInstance();
  const save = manager.load();
  save.passportStamps ||= {};
  if (save.passportStamps['village_' + id]) return false;
  save.passportStamps['village_' + id] = true;
  manager.save(save);
  return true;
}

export class VillageGuide {
  private root: HTMLElement;
  private dot: SVGCircleElement;
  private count: HTMLElement;
  private lastStampCount = -1;
  private expanded = false;
  private nextVisitCheck = 0;
  constructor(private travel: (x: number, y: number) => void) {
    this.root = document.createElement('aside');
    this.root.className = 'village-guide';
    this.root.innerHTML = `<button class="guide-heading" aria-expanded="true"><span><small>TÂN CƯƠNG · THÁI NGUYÊN</small><strong>Một ngày ở làng chè</strong></span><span class="guide-chevron">−</span></button>
      <div class="guide-body"><div class="village-minimap"><svg viewBox="0 0 960 720" role="img" aria-label="Sơ đồ làng chè và vị trí của bạn">
      <rect width="960" height="720" rx="48" fill="#254a37"/>
      <path d="M0 610 Q300 560 500 620 T960 610" stroke="#76bbc0" stroke-width="75" fill="none"/>
      <path d="M480 650V140M180 195H780M180 470H480M180 330H800" stroke="#d5ba80" stroke-width="25" fill="none"/>
      ${[235,280,370,410].map(y=>`<path d="M80 ${y}Q240 ${y-45} 405 ${y}M560 ${y}Q730 ${y-45} 890 ${y}" stroke="#6f9c58" stroke-width="18" fill="none"/>`).join('')}
      ${VILLAGE_STOPS.map((s,i)=>`<circle cx="${s.x}" cy="${s.y}" r="29" fill="#e6c58a"/><text x="${s.x}" y="${s.y+12}" text-anchor="middle" fill="#193b2b" font-size="36" font-weight="bold">${i+1}</text>`).join('')}
      <circle class="player-dot" cx="480" cy="540" r="19" fill="#fff" stroke="#153a2b" stroke-width="8"/></svg><span>BẢN ĐỒ LÀNG · MÔ PHỎNG</span></div>
      <div class="guide-progress"><span>Dấu chân khám phá</span><b>0/6</b></div><button class="guide-open">Khám phá 6 điểm đến ↗</button>
      <p class="guide-help">WASD / ↑↓←→ di chuyển · E tương tác</p></div>`;
    document.getElementById('ui-overlay')!.append(this.root);
    this.dot = this.root.querySelector('.player-dot')!;
    this.count = this.root.querySelector('.guide-progress b')!;
    this.root.querySelector('.guide-open')!.addEventListener('click', () => this.open());
    this.root.querySelector('.guide-heading')!.addEventListener('click', () => {
      this.expanded = !this.expanded;
      this.root.classList.toggle('collapsed', this.expanded);
      this.root.querySelector('.guide-heading')!.setAttribute('aria-expanded', String(!this.expanded));
      this.root.querySelector('.guide-chevron')!.textContent = this.expanded ? '+' : '−';
    });
  }
  update(x: number, y: number) {
    this.dot.setAttribute('cx', String(x));
    this.dot.setAttribute('cy', String(y));
    const ui = UIManager.getInstance();
    this.root.classList.toggle('obscured', ui.isDialogueOpen() || ui.isAnyModalOpen());
    if (performance.now() < this.nextVisitCheck) return;
    this.nextVisitCheck = performance.now() + 350;
    let changed = false;
    for (const stop of VILLAGE_STOPS) {
      if (Math.hypot(stop.x-x, stop.y-y) < 42 && stampVisit(stop.id)) {
        changed = true;
        ui.showToast(`📍 Đã ghé ${stop.name} · thêm dấu chân vào sổ khám phá`);
      }
    }
    if (changed || this.lastStampCount < 0) {
      const stamps = SaveManager.getInstance().load().passportStamps || {};
      this.lastStampCount = VILLAGE_STOPS.filter(s=>stamps['village_'+s.id]).length;
      this.count.textContent = `${this.lastStampCount}/6`;
      if (this.lastStampCount === 6 && changed) ui.showToast('🌿 Đủ 6 dấu chân! Bạn đã khám phá trọn vòng làng chè.');
    }
  }
  setVisible(visible: boolean) { this.root.hidden = !visible; }
  destroy() { this.root.remove(); }
  open() {
    const ui = UIManager.getInstance();
    if (ui.isDialogueOpen() || ui.isAnyModalOpen()) return;
    const stamps = SaveManager.getInstance().load().passportStamps || {};
    const body = ui.openExhibit('Sổ khám phá làng chè', 'Sáu điểm dừng · một hành trình từ cây chè đến chén trà');
    body.innerHTML = `<div class="trail-intro"><span>🍃</span><div><h3>Đi giữa màu xanh Tân Cương</h3><p>Chọn điểm dừng để đến tham quan. Gặp Bác Lâm gần nhà sao chè để bắt đầu nhiệm vụ chính.</p></div></div><div class="trail-grid">${VILLAGE_STOPS.map(s=>`<article class="trail-card"><small>${s.tag}</small><h3>${s.icon} ${s.name}</h3><p>${s.text}</p><div class="trail-card-footer"><span>${stamps['village_'+s.id]?'✓ Đã ghé':'○ Chưa ghé'}</span><button data-stop="${s.id}">${s.action} →</button></div></article>`).join('')}</div><button class="trail-tour">Tìm hiểu điểm đến & tour Tân Cương ↗</button><p class="trail-note">Bản đồ trải nghiệm được cách điệu, không dùng để chỉ đường ngoài thực tế.</p>`;
    body.querySelectorAll<HTMLButtonElement>('[data-stop]').forEach(btn=>btn.onclick=()=>{
      const stop = VILLAGE_STOPS.find(s=>s.id===btn.dataset.stop)!;
      ui.closeAllModals();
      this.travel(stop.x, stop.y);
    });
    body.querySelector<HTMLButtonElement>('.trail-tour')!.onclick = ()=>ui.openDestinationCard('tan_cuong');
  }
}
