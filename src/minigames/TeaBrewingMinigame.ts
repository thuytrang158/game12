import { TEA_BREWING_PROFILES } from '../data/teaBrewingProfiles';
import { AudioManager } from '../systems/AudioManager';
import { TeaBrewingEvaluator } from '../systems/TeaBrewingEvaluator';
import { IFavoriteTeaRecipe, ITeaBrewingSessionState } from '../types/game';

type BrewingStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

const TOOLS = [
  ['pot', 'Ấm trà', 'Kích thước và chất liệu ấm có thể ảnh hưởng đến cách giữ nhiệt khi pha.'],
  ['cup', 'Chén trà', 'Chén nhỏ giúp rót lượng trà vừa phải; cách mời trà có thể khác nhau giữa mỗi gia đình.'],
  ['tray', 'Khay trà', 'Khay giữ ấm chén gọn gàng và hứng những giọt nước khi pha.'],
  ['leaves', 'Trà khô', 'Đây là cánh trà đã qua chế biến. Trà khô khác với búp chè tươi và nước trà sau khi hãm.'],
  ['kettle', 'Ấm đun nước', 'Nhiệt độ nước là một yếu tố của cách pha đang học; có thể thay đổi để tự so sánh.'],
  ['scoop', 'Dụng cụ đong trà', 'Dùng muỗng để ước lượng lượng trà. Độ đậm còn phụ thuộc lượng nước và thời gian hãm.']
] as const;

/** Click/touch-driven tea brewing lesson hosted in the existing modal. */
export class TeaBrewingMinigame {
  private stage: BrewingStage = 0;
  private inspectedTools = new Set<string>();
  private teaQuantity = 5;
  private waterVolume = 100;
  private waterTemperature = 85;
  private pouredWater = 0;
  private steepingDuration = 0;
  private steepTimer: number | null = null;
  private servingTimer: number | null = null;
  private pourTimer: number | null = null;
  private timerStarted = false;
  private filledCups = 0;
  private selectedAroma = '';
  private servingActive = false;
  private selectedPrepItem = '';
  private warmingWater = 0;
  private activeToolHint = 'Chạm vào từng dụng cụ để nghe Bác Lâm giới thiệu.';
  private readonly profile = TEA_BREWING_PROFILES.tea_processed_tan_cuong;

  constructor(
    private containerEl: HTMLElement,
    private onFinish: () => void,
    private freeMode = false,
    private onProgress: (objectiveId: string) => void = () => undefined,
    private onSessionChange: (session: ITeaBrewingSessionState | null, completedSession?: ITeaBrewingSessionState) => void = () => undefined,
    private initialSession?: ITeaBrewingSessionState,
    private favorites: IFavoriteTeaRecipe[] = [],
    private onSaveFavorite: (recipe: IFavoriteTeaRecipe) => void = () => undefined
  ) {}

  public start() {
    const saved = this.initialSession;
    if (saved && saved.mode === (this.freeMode ? 'free' : 'guided') && saved.selectedTeaProductId === this.profile.teaProductId) {
      this.stage = Math.max(0, Math.min(11, Math.floor(saved.stage))) as BrewingStage;
      this.teaQuantity = this.clamp(saved.teaQuantity, 1, 8, this.profile.referenceTeaQuantity);
      this.waterVolume = this.clamp(saved.waterVolume, 50, 250, this.profile.referenceWaterVolume);
      this.waterTemperature = this.clamp(saved.waterTemperature, 60, 100, 85);
      this.pouredWater = this.clamp(saved.pouredWater, 0, this.waterVolume, 0);
      this.steepingDuration = this.clamp(saved.steepingDuration, 0, 600, 0);
      this.inspectedTools = new Set(Array.isArray(saved.inspectedTools) ? saved.inspectedTools : []);
      this.warmingWater = this.inspectedTools.has('prep-warm') ? 40 : 0;
      this.selectedAroma = ['Hương thực vật tươi', 'Hương rang nhẹ', 'Hương dịu', 'Hương đậm'].includes(saved.selectedAroma) ? saved.selectedAroma : '';
      this.filledCups = this.clamp(saved.filledCups, 0, 3, 0);
      // Restart the accelerated clock explicitly when resuming a saved steep.
      this.timerStarted = false;
    }
    this.render();
  }

  public destroy() {
    if (this.steepTimer !== null) window.clearInterval(this.steepTimer);
    if (this.servingTimer !== null) window.clearTimeout(this.servingTimer);
    if (this.pourTimer !== null) window.clearInterval(this.pourTimer);
    this.steepTimer = null;
    this.servingTimer = null;
    this.pourTimer = null;
  }

  private clamp(value: number, min: number, max: number, fallback: number) {
    return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  }

  private sessionSnapshot(): ITeaBrewingSessionState {
    return {
      mode: this.freeMode ? 'free' : 'guided',
      stage: this.stage,
      selectedTeaProductId: this.profile.teaProductId,
      teaQuantity: this.teaQuantity,
      waterVolume: this.waterVolume,
      waterTemperature: this.waterTemperature,
      pouredWater: this.pouredWater,
      steepingDuration: this.steepingDuration,
      inspectedTools: [...this.inspectedTools],
      selectedAroma: this.selectedAroma,
      filledCups: this.filledCups,
      savedAt: Date.now()
    };
  }

  private persistSession() {
    this.onSessionChange(this.sessionSnapshot());
  }

  private progress(objectiveId: string) {
    if (!this.freeMode) this.onProgress(objectiveId);
  }

  private button(selector: string, callback: () => void) {
    this.containerEl.querySelector<HTMLButtonElement>(selector)?.addEventListener('click', callback);
  }

  private setStage(stage: BrewingStage) {
    AudioManager.getInstance().playClick();
    this.stage = stage;
    this.render();
  }

  private equipmentArt() {
    return `<svg viewBox="0 0 440 170" role="img" aria-label="Bộ dụng cụ pha trà trên khay gỗ" shape-rendering="crispEdges">
      <rect x="28" y="125" width="384" height="20" rx="5" fill="#68452d"/><rect x="43" y="144" width="354" height="9" fill="#3e2b21"/>
      <rect x="74" y="113" width="95" height="9" fill="#8f613c"/><rect x="83" y="107" width="79" height="7" fill="#dacba8"/>
      <path d="M105 105h34v-11h8v-8h-4V64h-9v-8h-23v8h-9v22h-5v8h8z" fill="#eee4ca"/><rect x="114" y="49" width="18" height="7" fill="#b9915a"/><rect x="139" y="70" width="12" height="7" fill="#eee4ca"/>
      <path d="M214 121h44v-8h8v-20h-8v-8h-44v8h-8v20h8z" fill="#d6d1bb"/><rect x="220" y="81" width="31" height="7" fill="#a88759"/>
      <path d="M294 119h30v-8h6v-18h-6v-7h-30v7h-6v18h6z" fill="#eee4ca"/><rect x="303" y="78" width="13" height="8" fill="#ae8d61"/>
      <rect x="351" y="97" width="28" height="25" fill="#c1a16a"/><rect x="358" y="88" width="13" height="9" fill="#856342"/><rect x="356" y="103" width="18" height="4" fill="#507142"/><rect x="356" y="111" width="15" height="4" fill="#507142"/>
      <path d="M185 74h-17v17h14v18h9V91h14V74h-17v-9h-3z" fill="#c9a574"/><rect x="183" y="57" width="8" height="12" fill="#507142"/>
      <path d="M348 55c-8-9-4-16 0-20m13 22c-5-9-1-16 4-19" fill="none" stroke="#c7d3b4" stroke-width="4"/>
    </svg>`;
  }

  private prepTarget(id: string, title: string, placed: boolean) {
    const labels: Record<string, string> = { tray: 'KHAY ĐÃ TRẢI', pot: 'ẤM ĐÃ ĐẶT', cups: 'CHÉN ĐÃ XẾP', kettle: 'ẤM NƯỚC' };
    return `<button type="button" class="brew-placement-target ${placed ? 'placed' : ''}" data-prep-target="${id}" aria-label="${title}"><span>${placed ? labels[id] : 'ĐẶT TẠI ĐÂY'}</span><b>${title}</b></button>`;
  }

  private prepItem(id: string, title: string, placed: boolean) {
    const labels: Record<string, string> = { tray: 'Khay trà', pot: 'Ấm trà', cups: 'Bộ chén', kettle: 'Ấm nước' };
    return `<button class="brew-drag-item ${placed ? 'placed' : ''} ${this.selectedPrepItem === id ? 'selected' : ''}" type="button" draggable="true" data-prep-item="${id}" aria-label="Kéo ${title.toLowerCase()}"><i class="brew-glyph brew-glyph-${id === 'cups' ? 'cup' : id}">${title}</i><b>${labels[id]}</b><small>${placed ? 'Đã đặt' : 'Kéo hoặc chạm để chọn'}</small></button>`;
  }

  private header(title: string, hint: string) {
    return `<header class="brew-header"><div><small>NGHỆ THUẬT PHA TRÀ · HƯƠNG VỊ XỨ TRÀ</small><h2>${title}</h2></div><span class="brew-mode">${this.freeMode ? 'THỬ TÀI NGHỆ NHÂN' : 'HỌC CÙNG BÁC LÂM'}</span><p>${hint}</p></header>`;
  }

  private render() {
    const stages = ['Quan sát trà', 'Tìm hiểu dụng cụ', 'Sắp ấm chén', 'Đong trà', 'Chọn nhiệt độ', 'Rót nước', 'Hãm trà', 'Mời trà', 'Ngắm sắc nước', 'Cảm nhận hương', 'Nếm trà', 'Mẻ trà của bạn'];
    const progress = Math.round((this.stage / (stages.length - 1)) * 100);
    let content = '';

    if (this.stage === 0) {
      content = `${this.header('Mẻ trà xanh Tân Cương đầu tiên', 'Sau khi sao chè, cánh trà đã khô và sẵn sàng cho một cách trải nghiệm mới.')}
        <div class="brew-product"><div class="brew-product-art">${this.equipmentArt()}<span class="brew-leaf-closeup" aria-hidden="true"></span></div><div><span class="brew-status">ĐÃ HOÀN THÀNH CÔNG ĐOẠN SAO CHÈ</span><h3>Mẻ Trà Xanh Tân Cương Đầu Tiên</h3><p>Quan sát cánh trà khô trên khay. Búp vừa hái, lá đang chế biến, trà khô và nước trà sau khi hãm là những trạng thái khác nhau của hành trình này.</p><p class="brew-note">Hình thức và hương vị có thể thay đổi theo nguyên liệu và cách chế biến.</p><button class="btn btn-primary" id="brew-inspect">Quan sát mẻ trà ➜</button></div></div>`;
    } else if (this.stage === 1) {
      content = `${this.header('Làm quen với bộ trà', 'Chạm vào từng vật dụng. Bác Lâm sẽ giới thiệu ngắn gọn công dụng của chúng.')}
        <div class="brew-table-art">${this.equipmentArt()}</div><div class="brew-tools">${TOOLS.map(([id, name]) => `<button class="brew-object ${this.inspectedTools.has(id) ? 'discovered' : ''}" data-tool="${id}"><span>${this.toolGlyph(id)}</span><b>${name}</b><small>${this.inspectedTools.has(id) ? 'Đã tìm hiểu' : 'Chạm để tìm hiểu'}</small></button>`).join('')}</div>
        <div class="brew-mentor"><b>Bác Lâm</b><span>${this.activeToolHint}</span></div><button class="btn btn-primary" id="brew-tools-next" ${!this.hasInspectedAllTools() ? 'disabled' : ''}>Đã tìm hiểu xong ➜</button>`;
    } else if (this.stage === 2) {
      content = `${this.header('Chuẩn bị bàn trà', 'Kéo dụng cụ vào vị trí gợi ý. Nếu dùng thiết bị cảm ứng, chạm vào món đồ rồi chạm vào vị trí đặt.')}
        <div class="brew-interactive-table"><div class="brew-table-surface"><div class="brew-target-row">
          ${this.prepTarget('tray', 'Khay trà', this.inspectedTools.has('prep-tray'))}${this.prepTarget('pot', 'Vị trí đặt ấm', this.inspectedTools.has('prep-pot'))}${this.prepTarget('cups', 'Đặt chén bên cạnh', this.inspectedTools.has('prep-cups'))}${this.prepTarget('kettle', 'Đặt ấm nước', this.inspectedTools.has('prep-kettle'))}
        </div><div class="brew-prop-row">${this.prepItem('tray', 'KHAY TRÀ', this.inspectedTools.has('prep-tray'))}${this.prepItem('pot', 'ẤM TRÀ', this.inspectedTools.has('prep-pot'))}${this.prepItem('cups', 'BỘ CHÉN', this.inspectedTools.has('prep-cups'))}${this.prepItem('kettle', 'ẤM NƯỚC', this.inspectedTools.has('prep-kettle'))}<button class="brew-drag-item optional" type="button" data-prep-item="pitcher"><i class="brew-glyph brew-glyph-cup">TỐNG</i><b>Tống trà</b><small>Tùy chọn</small></button><button class="brew-drag-item optional" type="button" data-prep-item="cloth"><i class="brew-glyph brew-glyph-cloth">KHĂN</i><b>Khăn trà</b><small>Tùy chọn</small></button></div></div></div>
        <div class="brew-warming-row"><button class="btn btn-secondary" id="brew-warm-pot" ${!this.inspectedTools.has('prep-pot') || !this.inspectedTools.has('prep-kettle') || this.warmingWater >= 40 ? 'disabled' : ''}>${this.warmingWater ? `Đã tráng ấm · ${this.warmingWater} ml` : 'Tùy chọn: nghiêng ấm nước để tráng ấm'}</button><span>Tráng ấm là lựa chọn của bài học này; cháu có thể bỏ qua và tiếp tục.</span></div><div class="brew-mentor"><b>Bác Lâm</b><span>${this.prepStatus()}</span></div><button class="btn btn-primary" id="brew-prep-next" ${!this.prepared() ? 'disabled' : ''}>Đong trà và chọn lượng nước ➜</button>`;
    } else if (this.stage === 3) {
      const favoriteRecipes = this.favorites.map(recipe => {
        const recipeId = recipe.id.replace(/[^a-zA-Z0-9_-]/g, '');
        const recipeName = recipe.name.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] || '');
        return `<button class="brew-saved-recipe" data-favorite="${recipeId}">${recipeName} · ${this.clamp(recipe.teaQuantity, 1, 8, 5)} g / ${this.clamp(recipe.waterVolume, 50, 250, 100)} ml · ${this.clamp(recipe.waterTemperature, 60, 100, 85)}°C</button>`;
      }).join('');
      content = `${this.header('Đong trà và chọn lượng nước', 'Dùng muỗng chuyển trà khô vào ấm; chạm hoặc kéo muỗng qua miệng ấm để thêm từng phần. Có thể điều chỉnh lượng nước để thử vị.')}
        <div class="brew-scooping-scene"><div class="brew-tea-tin"><b>HỘP TRÀ KHÔ</b><span class="brew-pixel-leaves"></span><small>Cánh trà thành phẩm</small></div><button id="brew-scoop" class="brew-scoop-tool" type="button" draggable="true" aria-label="Lấy một muỗng trà"><i class="brew-glyph brew-glyph-scoop">MUỖNG</i><b>Muỗng trà</b><small>Kéo tới ấm · +1 g</small></button><div class="brew-measure-pot" id="brew-teapot-target" aria-label="Ấm trà, thả muỗng để thêm trà"><div class="brew-scooped-leaves" style="--tea-fill:${this.clamp(this.teaQuantity * 10, 10, 82, 50)}%"></div><b>Ấm trà</b><strong>${this.teaQuantity} g</strong></div></div>
        <div class="brew-controls-card"><div class="brew-ingredient"><span class="brew-pixel-leaves"></span><b>Trà khô · hiệu chỉnh</b><div class="brew-stepper"><button id="tea-minus" aria-label="Giảm lượng trà">−</button><strong>${this.teaQuantity} g</strong><button id="tea-plus" aria-label="Tăng lượng trà">+</button></div></div><div class="brew-ingredient"><span class="brew-water-jar"></span><b>Nước pha</b><div class="brew-stepper"><button id="water-minus" aria-label="Giảm lượng nước">−</button><strong>${this.waterVolume} ml</strong><button id="water-plus" aria-label="Tăng lượng nước">+</button></div></div></div>
        ${favoriteRecipes ? `<div class="brew-saved-recipes"><b>Công thức yêu thích đã lưu</b>${favoriteRecipes}</div>` : ''}<div class="brew-mentor"><b>Bác Lâm</b><span>Bỏ quá nhiều trà vào một lượng nước nhỏ có thể khiến vị trà đậm hơn mong muốn. Công thức đang học là gợi ý để bắt đầu, không phải tỷ lệ duy nhất.</span></div><p class="brew-recipe">Tham khảo trong bài học: ${this.profile.referenceTeaQuantity} g trà / ${this.profile.referenceWaterVolume} ml nước.</p><button class="btn btn-primary" id="brew-recipe-next">Chọn nhiệt độ nước ➜</button>`;
    } else if (this.stage === 4) {
      content = `${this.header('Điều chỉnh nhiệt độ nước', 'Kéo nút hoặc dùng phím mũi tên để thử các mức nhiệt khác nhau.')}
        <div class="brew-kettle-scene"><div class="brew-kettle ${this.waterTemperature >= 75 ? 'heating' : 'cooling'}" aria-hidden="true"><span></span><i></i></div><div class="brew-temp"><b id="brew-temp-value">${this.waterTemperature}°C</b><span>NHIỆT ĐỘ NƯỚC MÔ PHỎNG</span><input id="brew-temp-slider" type="range" min="60" max="100" step="1" value="${this.waterTemperature}" aria-label="Nhiệt độ nước"><div class="brew-temp-scale"><span>60°C</span><span>85°C · công thức tham khảo</span><span>100°C</span></div></div></div>
        <div class="brew-mentor"><b>Bác Lâm</b><span id="brew-temp-hint">${this.temperatureHint()}</span></div><p class="brew-note">Mốc 85°C và thời gian 25 giây là ví dụ riêng cho trà Móc Câu theo một nhà sản xuất; sản phẩm và cách pha khác có thể cần điều chỉnh.</p><button class="btn btn-primary" id="brew-temperature-next">Đã chọn nhiệt độ ➜</button>`;
    } else if (this.stage === 5) {
      const waterPct = Math.min(100, (this.pouredWater / this.waterVolume) * 100);
      content = `${this.header('Rót nước vào ấm', 'Chạm vào ấm nước để rót từng lượng nhỏ. Bạn có thể dừng bất cứ lúc nào.')}
        <div class="brew-pour-scene"><button class="brew-pour-kettle" id="brew-pour-more" aria-label="Nhấn giữ để rót thêm nước"><span class="brew-kettle mini"><i></i></span><b>${this.pouredWater >= this.waterVolume ? 'Đã rót đủ nước' : 'Nhấn giữ để rót'}</b></button><div class="brew-water-stream ${this.pouredWater > 0 ? 'flowing' : ''}"></div><div class="brew-pot-fill"><span style="height:${waterPct}%"></span></div></div>
        <div class="brew-volume-row"><b>Nước trong ấm</b><strong>${this.pouredWater} / ${this.waterVolume} ml</strong></div><div class="brew-volume-track"><span style="width:${waterPct}%"></span></div><div class="brew-mentor"><b>Bác Lâm</b><span>Rót từ tốn và quan sát lượng nước. Đã rót ${this.pouredWater} ml; lượng này sẽ được ghi vào mẻ pha của cháu.</span></div><button class="btn btn-primary" id="brew-stop-pour" ${this.pouredWater < 50 ? 'disabled' : ''}>Dừng rót, bắt đầu hãm ➜</button>`;
    } else if (this.stage === 6) {
      const infusion = Math.min(1, this.steepingDuration / 25);
      content = `${this.header('Quan sát trà đang hãm', 'Hình cắt ngang là mô phỏng: lá nở dần, sắc nước tăng dần. Đồng hồ trong game chạy nhanh hơn thời gian thật; có thể rót để dừng bất cứ lúc nào.')}
        <div class="brew-steep-scene"><div class="brew-cutaway-pot ${this.timerStarted ? 'steeping' : ''}" style="--infusion:${infusion}">${this.steamArt()}<div class="brew-cutaway-water" style="--infusion:${infusion}"></div><div class="brew-infusing-leaves">${Array.from({ length: 8 }, (_, i) => `<i style="--leaf-index:${i};--leaf-open:${Math.min(1, infusion * 1.4)}"></i>`).join('')}</div><span class="brew-cutaway-rim"></span><span class="brew-cutaway-lid"></span></div><div class="brew-clock"><span>THỜI GIAN HÃM MÔ PHỎNG</span><b id="brew-steep-time">${this.steepingDuration}s</b><small>Thời gian thật trôi qua chậm hơn đồng hồ trong game</small><div class="brew-extraction-track"><i style="width:${Math.round(infusion * 100)}%"></i></div><small>Diễn giải trực quan mức chiết xuất mô phỏng</small></div></div>
        <p class="brew-infusion-note">${this.steepingDuration === 0 ? 'Khi nước chạm lá, quá trình hãm bắt đầu.' : this.steepingDuration < 8 ? 'Lá bắt đầu hút nước và mở ra; sắc nước còn nhẹ.' : this.steepingDuration < 25 ? 'Lá tiếp tục nở, màu nước đậm dần theo mô phỏng.' : 'Đã tới mốc tham khảo 25 giây cho nước đầu của công thức này. Có thể rót hoặc tiếp tục thử để so sánh.'}</p><div class="brew-mentor"><b>Bác Lâm</b><span>Khi nước tiếp xúc với lá trà, nhiều hợp chất tạo nên màu sắc, hương và vị bắt đầu hòa vào nước. Nhiệt độ, lượng trà và thời gian hãm đều ảnh hưởng đến kết quả.</span></div><button class="btn btn-secondary" id="brew-start-steep" ${this.timerStarted ? 'disabled' : ''}>${this.timerStarted ? 'Đang hãm trà…' : 'Bắt đầu hãm'}</button><button class="btn btn-primary" id="brew-stop-steep" ${!this.timerStarted ? 'disabled' : ''}>Rót trà, dừng hãm ➜</button>`;
    } else if (this.stage === 7) {
      content = `${this.header('Rót trà mời khách', 'Chọn chén rồi rót trà. Cách mời có thể linh hoạt theo nếp nhà và hoàn cảnh.')}
        <div class="brew-serve-scene"><div class="brew-pot serving ${this.servingActive ? 'pouring' : ''}">${this.steamArt()}<span class="brew-pot-lid"></span></div><i class="brew-serving-stream ${this.servingActive ? 'active' : ''}"></i><div class="brew-cups">${[0, 1, 2].map(i => `<button class="brew-serving-cup ${i < this.filledCups ? 'filled' : ''}" data-cup="${i}" aria-label="Chọn chén ${i + 1}"><span></span><b>Chén ${i + 1}</b></button>`).join('')}</div></div><div class="brew-mentor"><b>Bác Lâm</b><span>Cháu chọn chén muốn mời. Một lời mời chân tình quý hơn việc tuân theo một nghi thức cố định.</span></div><button class="btn btn-primary" id="brew-serve-confirm" ${this.filledCups === 0 || this.servingActive ? 'disabled' : ''}>${this.servingActive ? 'Đang rót trà…' : `Rót và mời Bác Lâm (${this.filledCups} chén) ➜`}</button>`;
    } else if (this.stage === 8) {
      const result = TeaBrewingEvaluator.evaluate(this.profile, {
        teaQuantity: this.teaQuantity, waterVolume: this.pouredWater,
        waterTemperature: this.waterTemperature, steepingDuration: this.steepingDuration
      });
      const fillColor = result.color === 'vàng hổ phách' ? '#b77a32' : result.color === 'vàng xanh nhạt' ? '#d4d188' : '#b6b451';
      content = `${this.header('Ngắm sắc nước trà', 'Trước khi uống, cháu thử ngắm sắc nước xem. Màu trà cũng là một phần thú vị của trải nghiệm.')}
        <div class="brew-observe-scene"><div class="brew-cup-closeup large"><span style="background:${fillColor}"></span><i></i><b class="brew-reflection"></b></div><div class="brew-observe-copy"><span class="brew-status">SẮC NƯỚC TRONG MÔ PHỎNG</span><h3>${result.color}</h3><p>Nước trà có thể ngả xanh vàng, vàng hoặc ánh vàng đậm tùy nguyên liệu và cách pha. Không phải mẻ trà nào cũng có cùng một màu.</p><button class="btn btn-primary" id="brew-color-next">Tiếp tục cảm nhận hương ➜</button></div></div>`;
    } else if (this.stage === 9) {
      const aromas = ['Hương thực vật tươi', 'Hương rang nhẹ', 'Hương dịu', 'Hương đậm'];
      content = `${this.header('Cảm nhận hương trà', 'Chạm nút để cảm nhận làn hương. Các mô tả là gợi ý chủ quan, không có đáp án đúng sai.')}
        <div class="brew-aroma-scene"><div class="brew-aroma-cup">${this.steamArt()}<span></span></div><div class="brew-aroma-options">${aromas.map(aroma => `<button class="brew-aroma-choice ${this.selectedAroma === aroma ? 'selected' : ''}" data-aroma="${aroma}">${aroma}</button>`).join('')}</div></div>
        <div class="brew-mentor"><b>Bác Lâm</b><span>Cháu có thể nhận ra nhiều sắc thái khác nhau. Hãy chọn mô tả gần với điều cháu đang cảm nhận nhất.</span></div><button class="btn btn-primary" id="brew-aroma-next" ${!this.selectedAroma ? 'disabled' : ''}>Tiếp tục nếm trà ➜</button>`;
    } else if (this.stage === 10) {
      const result = TeaBrewingEvaluator.evaluate(this.profile, {
        teaQuantity: this.teaQuantity, waterVolume: this.pouredWater,
        waterTemperature: this.waterTemperature, steepingDuration: this.steepingDuration
      });
      content = `${this.header('Nhấp một ngụm trà', 'Để trà nguội đến mức dễ uống rồi thử cảm nhận vị đầu và hậu vị.')}
        <div class="brew-taste-scene"><div class="brew-taster" aria-hidden="true"><span class="taster-hair"></span><span class="taster-face"><i></i><b></b></span><span class="taster-clothes"></span></div><div><span class="brew-status">GỢI Ý CẢM NHẬN · MÔ PHỎNG</span><p>Vị đầu: ${result.firstTaste}. Độ chát: ${result.astringency}. Đắng: ${result.bitterness}. Hậu vị: ${result.aftertaste}. Đây là gợi ý bằng chữ; thiết bị không truyền được mùi hay vị trà.</p><button class="btn btn-primary" id="brew-taste-next">Đã nếm trà, xem lại mẻ pha ➜</button></div></div>`;
    } else {
      const result = TeaBrewingEvaluator.evaluate(this.profile, {
        teaQuantity: this.teaQuantity,
        waterVolume: this.pouredWater,
        waterTemperature: this.waterTemperature,
        steepingDuration: this.steepingDuration
      });
      const fillColor = result.color === 'vàng hổ phách' ? '#b77a32' : result.color === 'vàng xanh nhạt' ? '#d4d188' : '#b6b451';
      content = `${this.header('Mẻ trà của bạn', 'Đây là kết quả mô phỏng để gợi ý điều chỉnh, không phải dự đoán khoa học chính xác.')}
        <div class="brew-result-card"><div class="brew-cup-closeup"><span style="background:${fillColor}"></span><i></i></div><div><span class="brew-status">${this.profile.processingCategory.toUpperCase()}</span><h3>Mẻ Trà Xanh Tân Cương Đầu Tiên</h3><p>${result.summary}</p><div class="brew-result-stats"><span><b>${this.teaQuantity} g</b> trà khô</span><span><b>${this.pouredWater} ml</b> nước</span><span><b>${this.waterTemperature}°C</b> nhiệt độ</span><span><b>${this.steepingDuration}s</b> thời gian hãm</span></div></div></div>
        <div class="brew-sensory"><div><b>Màu nước</b><span>${result.color}</span></div><div><b>Hương thơm</b><span>${this.selectedAroma || result.aroma}</span></div><div><b>Vị đầu</b><span>${result.firstTaste}</span></div><div><b>Độ chát</b><span>${result.astringency}</span></div><div><b>Hậu vị</b><span>${result.aftertaste}</span></div></div><div class="brew-mentor"><b>Gợi ý của Bác Lâm</b><span>${result.suggestion} Các mô tả vị là mô phỏng giáo dục, cảm nhận thật tùy người và từng mẻ.</span></div><div class="brew-finish-actions">${this.freeMode ? '<button class="btn btn-secondary" id="brew-save-favorite">Lưu công thức yêu thích</button>' : ''}<button class="btn btn-secondary" id="brew-again">Pha thử mẻ khác</button><button class="btn btn-primary" id="brew-enjoy">Thưởng thức cùng Bác Lâm ✓</button></div>`;
    }

    this.containerEl.innerHTML = `<section class="tea-brewing-game"><div class="brew-progress"><span>${stages[this.stage]}</span><b>${progress}%</b><div><i style="width:${progress}%"></i></div></div>${this.stage > 0 ? '<button class="brew-restart" id="brew-restart">Bắt đầu lại mẻ pha</button>' : ''}${content}</section>`;
    this.bindStageEvents();
    this.button('#brew-restart', () => this.restartSession());
    this.persistSession();
  }

  private restartSession() {
    this.destroy();
    this.stage = 0;
    this.inspectedTools.clear();
    this.teaQuantity = this.profile.referenceTeaQuantity;
    this.waterVolume = this.profile.referenceWaterVolume;
    this.waterTemperature = 85;
    this.pouredWater = 0;
    this.steepingDuration = 0;
    this.timerStarted = false;
    this.filledCups = 0;
    this.selectedAroma = '';
    this.servingActive = false;
    this.selectedPrepItem = '';
    this.warmingWater = 0;
    this.render();
  }

  private toolGlyph(id: string) {
    const labels: Record<string, string> = { pot: 'ẤM', cup: 'CHÉN', tray: 'KHAY', leaves: 'TRÀ', kettle: 'NƯỚC', scoop: 'MUỖNG' };
    return `<i class="brew-glyph brew-glyph-${id}">${labels[id]}</i>`;
  }

  private prepared() {
    // Warming vessels is an optional custom; the basic recipe can continue once
    // the tray, teapot, and cups are arranged.
    return ['tray', 'pot', 'cups'].every(id => this.inspectedTools.has(`prep-${id}`));
  }

  private hasInspectedAllTools() {
    return TOOLS.every(([id]) => this.inspectedTools.has(id));
  }

  private prepStatus() {
    const labels = [
      this.inspectedTools.has('prep-tray') ? 'khay đã đặt' : 'chưa trải khay',
      this.inspectedTools.has('prep-pot') ? 'ấm đã đặt' : 'chưa đặt ấm',
      this.inspectedTools.has('prep-cups') ? 'chén đã sắp' : 'chưa sắp chén',
      this.inspectedTools.has('prep-warm') ? 'ấm đã tráng' : 'tráng ấm tùy chọn'
    ];
    return `Bác sẽ hướng dẫn từng bước: ${labels.join(' · ')}.`;
  }

  private temperatureHint() {
    if (this.waterTemperature < 77) return 'Mức nước này thấp hơn đáng kể mốc 85°C đang dùng trong công thức tham khảo. Cháu có thể thử để đối chiếu.';
    if (this.waterTemperature > 93) return 'Nước nóng hơn đáng kể mốc 85°C. Nhiệt độ tương tác với thời gian hãm; hãy thử giảm nhiệt để so sánh.';
    if (this.waterTemperature !== 85) return `Đang lệch ${Math.abs(this.waterTemperature - 85)}°C so với mốc 85°C của ví dụ. Có thể thử mức này rồi so sánh.`;
    return 'Đang ở mốc 85°C trong ví dụ pha trà Móc Câu. Đây là điểm bắt đầu để thử, không phải lựa chọn chung cho mọi loại trà.';
  }

  private steamArt() {
    return '<i class="brew-steam steam-one"></i><i class="brew-steam steam-two"></i><i class="brew-steam steam-three"></i>';
  }

  private bindStageEvents() {
    if (this.stage === 0) this.button('#brew-inspect', () => {
      this.progress('obj_inspect_finished_tea');
      this.setStage(1);
    });
    if (this.stage === 1) {
      this.containerEl.querySelectorAll<HTMLButtonElement>('[data-tool]').forEach(btn => btn.addEventListener('click', () => {
        const id = btn.dataset.tool || '';
        const tool = TOOLS.find(entry => entry[0] === id);
        if (!tool) return;
        this.inspectedTools.add(id);
        this.activeToolHint = tool[2];
        AudioManager.getInstance().playClick();
        this.render();
      }));
      this.button('#brew-tools-next', () => {
        if (!this.hasInspectedAllTools()) return;
        this.progress('obj_learn_brewing_tools');
        this.setStage(2);
      });
    }
    if (this.stage === 2) {
      const place = (item: string, target: string) => {
        const expected: Record<string, string> = { tray: 'tray', pot: 'pot', cups: 'cups', kettle: 'kettle' };
        if (expected[target] !== item) {
          this.activeToolHint = 'Thử đặt dụng cụ vào vị trí có tên phù hợp; món phụ kiện có thể để bên cạnh.';
          AudioManager.getInstance().playClick();
          return;
        }
        this.inspectedTools.add(`prep-${item}`);
        this.selectedPrepItem = '';
        this.activeToolHint = item === 'tray' ? 'Khay đã trải trên bàn để giữ dụng cụ gọn gàng.' : item === 'pot' ? 'Ấm đã nằm trên khay. Bác thường đặt ấm ở vị trí thuận tay.' : item === 'cups' ? 'Chén đã được xếp cạnh ấm, sẵn sàng nhận trà.' : 'Ấm nước đã ở gần bàn. Cháu có thể dùng một ít nước để làm ấm ấm trà.';
        AudioManager.getInstance().playPluck();
        this.render();
      };
      this.containerEl.querySelectorAll<HTMLElement>('[data-prep-item]').forEach(item => {
        item.addEventListener('click', () => {
          this.selectedPrepItem = item.dataset.prepItem || '';
          this.activeToolHint = this.selectedPrepItem === 'pitcher' || this.selectedPrepItem === 'cloth' ? 'Đây là phụ kiện tùy chọn. Bài học cơ bản vẫn thực hiện được nếu cháu chưa dùng.' : 'Đã chọn dụng cụ. Chạm vào vị trí phù hợp trên khay để đặt.';
          this.render();
        });
        item.addEventListener('dragstart', event => {
          const dragEvent = event as DragEvent;
          dragEvent.dataTransfer?.setData('text/plain', item.dataset.prepItem || '');
          if (dragEvent.dataTransfer) dragEvent.dataTransfer.effectAllowed = 'move';
        });
      });
      this.containerEl.querySelectorAll<HTMLElement>('[data-prep-target]').forEach(target => {
        target.addEventListener('click', () => {
          if (this.selectedPrepItem) place(this.selectedPrepItem, target.dataset.prepTarget || '');
        });
        target.addEventListener('dragover', event => event.preventDefault());
        target.addEventListener('drop', event => {
          event.preventDefault();
          const item = (event as DragEvent).dataTransfer?.getData('text/plain') || '';
          place(item, target.dataset.prepTarget || '');
        });
      });
      this.button('#brew-warm-pot', () => {
        if (!this.inspectedTools.has('prep-pot') || !this.inspectedTools.has('prep-kettle')) return;
        this.warmingWater = 40;
        this.inspectedTools.add('prep-warm');
        this.activeToolHint = 'Nghiêng ấm mô phỏng đã tráng lòng ấm bằng ít nước. Có thể bỏ qua bước này trong nhiều cách pha khác.';
        AudioManager.getInstance().playSizzle();
        this.render();
      });
      this.button('#brew-prep-next', () => this.setStage(3));
    }
    if (this.stage === 3) {
      const addScoop = () => {
        this.teaQuantity = Math.min(8, this.teaQuantity + 1);
        AudioManager.getInstance().playPluck();
        this.render();
      };
      this.button('#brew-scoop', addScoop);
      this.containerEl.querySelector('#brew-scoop')?.addEventListener('dragstart', event => {
        (event as DragEvent).dataTransfer?.setData('text/plain', 'tea-scoop');
      });
      const teapotTarget = this.containerEl.querySelector<HTMLElement>('#brew-teapot-target');
      teapotTarget?.addEventListener('dragover', event => event.preventDefault());
      teapotTarget?.addEventListener('drop', event => {
        event.preventDefault();
        if ((event as DragEvent).dataTransfer?.getData('text/plain') === 'tea-scoop') addScoop();
      });
      this.button('#tea-minus', () => { this.teaQuantity = Math.max(1, this.teaQuantity - 1); this.render(); });
      this.button('#tea-plus', () => { this.teaQuantity = Math.min(8, this.teaQuantity + 1); this.render(); });
      this.button('#water-minus', () => { this.waterVolume = Math.max(50, this.waterVolume - 25); this.render(); });
      this.button('#water-plus', () => { this.waterVolume = Math.min(250, this.waterVolume + 25); this.render(); });
      this.containerEl.querySelectorAll<HTMLButtonElement>('[data-favorite]').forEach(btn => btn.addEventListener('click', () => {
        const recipe = this.favorites.find(item => item.id === btn.dataset.favorite);
        if (!recipe) return;
        this.teaQuantity = recipe.teaQuantity;
        this.waterVolume = recipe.waterVolume;
        this.waterTemperature = recipe.waterTemperature;
        this.steepingDuration = recipe.steepingDuration;
        AudioManager.getInstance().playPluck();
        this.render();
      }));
      this.button('#brew-recipe-next', () => {
        this.progress('obj_prepare_brewing_set');
        this.setStage(4);
      });
    }
    if (this.stage === 4) {
      this.containerEl.querySelector<HTMLInputElement>('#brew-temp-slider')?.addEventListener('input', event => {
        this.waterTemperature = Number((event.currentTarget as HTMLInputElement).value);
        const temp = this.containerEl.querySelector('#brew-temp-value');
        if (temp) temp.textContent = `${this.waterTemperature}°C`;
        const hint = this.containerEl.querySelector('#brew-temp-hint');
        if (hint) hint.textContent = this.temperatureHint();
        const kettle = this.containerEl.querySelector('.brew-kettle:not(.mini)');
        kettle?.classList.toggle('heating', this.waterTemperature >= 75);
        kettle?.classList.toggle('cooling', this.waterTemperature < 75);
      });
      this.containerEl.querySelector<HTMLInputElement>('#brew-temp-slider')?.addEventListener('change', () => this.persistSession());
      this.button('#brew-temperature-next', () => this.setStage(5));
    }
    if (this.stage === 5) {
      const pourButton = this.containerEl.querySelector<HTMLButtonElement>('#brew-pour-more');
      const stopPour = () => {
        if (this.pourTimer !== null) window.clearInterval(this.pourTimer);
        this.pourTimer = null;
        pourButton?.classList.remove('tilting');
        this.containerEl.querySelector('.brew-water-stream')?.classList.remove('flowing');
        const nextButton = this.containerEl.querySelector<HTMLButtonElement>('#brew-stop-pour');
        if (nextButton) nextButton.disabled = this.pouredWater < 50;
        const pourLabel = pourButton?.querySelector('b');
        if (pourLabel) pourLabel.textContent = this.pouredWater >= this.waterVolume ? 'Đã rót đủ nước' : 'Nhấn giữ để rót';
        const mentor = this.containerEl.querySelector<HTMLElement>('.brew-mentor span');
        if (mentor) mentor.textContent = `Rót từ tốn và quan sát lượng nước. Đã rót ${this.pouredWater} ml; lượng này sẽ được ghi vào mẻ pha của cháu.`;
        this.persistSession();
      };
      const pourTick = () => {
        this.pouredWater = Math.min(this.waterVolume, this.pouredWater + 5);
        const label = pourButton?.querySelector('b'); if (label) label.textContent = this.pouredWater >= this.waterVolume ? 'Đã rót đủ nước' : `${this.pouredWater} / ${this.waterVolume} ml · thả để dừng`;
        const volumeLabel = this.containerEl.querySelector<HTMLElement>('.brew-volume-row strong'); if (volumeLabel) volumeLabel.textContent = `${this.pouredWater} / ${this.waterVolume} ml`;
        const fill = this.containerEl.querySelector<HTMLElement>('.brew-pot-fill span');
        if (fill) fill.style.height = `${Math.min(100, this.pouredWater / this.waterVolume * 100)}%`;
        const stream = this.containerEl.querySelector<HTMLElement>('.brew-water-stream'); stream?.classList.add('flowing');
        const nextButton = this.containerEl.querySelector<HTMLButtonElement>('#brew-stop-pour');
        if (nextButton) nextButton.disabled = this.pouredWater < 50;
        const mentor = this.containerEl.querySelector<HTMLElement>('.brew-mentor span');
        if (mentor) mentor.textContent = `Rót từ tốn và quan sát lượng nước. Đã rót ${this.pouredWater} ml; lượng này sẽ được ghi vào mẻ pha của cháu.`;
        if (this.pouredWater >= this.waterVolume) stopPour();
      };
      const beginPour = (event: Event) => {
        event.preventDefault();
        if (this.pourTimer !== null || this.pouredWater >= this.waterVolume) return;
        pourButton?.classList.add('tilting');
        pourTick();
        if (this.pouredWater < this.waterVolume) this.pourTimer = window.setInterval(pourTick, 120);
      };
      pourButton?.addEventListener('pointerdown', beginPour);
      pourButton?.addEventListener('pointerup', stopPour);
      pourButton?.addEventListener('pointercancel', stopPour);
      // Keyboard/click users receive a deliberate, measurable 15 ml pour per press.
      pourButton?.addEventListener('click', event => {
        if ((event as MouseEvent).detail !== 0) return;
        if (this.pouredWater >= this.waterVolume) return;
        this.pouredWater = Math.min(this.waterVolume, this.pouredWater + 15);
        AudioManager.getInstance().playSizzle();
        this.render();
      });
      this.button('#brew-stop-pour', () => {
        stopPour();
        if (this.pouredWater < 50) return;
        this.setStage(6);
      });
    }
    if (this.stage === 6) {
      this.button('#brew-start-steep', () => {
        if (this.timerStarted) return;
        this.timerStarted = true;
        this.render();
        this.steepTimer = window.setInterval(() => {
          this.steepingDuration += 1;
          const timer = this.containerEl.querySelector('#brew-steep-time');
          if (timer) timer.textContent = `${this.steepingDuration}s`;
          const infusion = Math.min(1, this.steepingDuration / 25);
          this.containerEl.querySelector<HTMLElement>('.brew-cutaway-pot')?.style.setProperty('--infusion', `${infusion}`);
          this.containerEl.querySelector<HTMLElement>('.brew-cutaway-water')?.style.setProperty('--infusion', `${infusion}`);
          this.containerEl.querySelector<HTMLElement>('.brew-extraction-track i')?.style.setProperty('width', `${Math.round(infusion * 100)}%`);
          this.containerEl.querySelectorAll<HTMLElement>('.brew-infusing-leaves i').forEach(leaf => leaf.style.setProperty('--leaf-open', `${Math.min(1, infusion * 1.4)}`));
          const note = this.containerEl.querySelector<HTMLElement>('.brew-infusion-note');
          if (note) note.textContent = this.steepingDuration < 8 ? 'Lá bắt đầu hút nước và mở ra; sắc nước còn nhẹ.' : this.steepingDuration < 25 ? 'Lá tiếp tục nở, màu nước đậm dần theo mô phỏng.' : 'Đã tới mốc tham khảo 25 giây cho nước đầu của công thức này. Có thể rót hoặc tiếp tục thử để so sánh.';
          if (this.steepingDuration % 10 === 0) this.persistSession();
        }, 180);
      });
      this.button('#brew-stop-steep', () => {
        if (!this.timerStarted) return;
        this.destroy();
        this.progress('obj_brew_first_pot');
        this.setStage(7);
      });
    }
    if (this.stage === 7) {
      this.containerEl.querySelectorAll<HTMLButtonElement>('[data-cup]').forEach(btn => btn.addEventListener('click', () => {
        this.filledCups = this.filledCups === Number(btn.dataset.cup) + 1 ? this.filledCups - 1 : Number(btn.dataset.cup) + 1;
        AudioManager.getInstance().playClick();
        this.render();
      }));
      this.button('#brew-serve-confirm', () => {
        if (this.filledCups === 0 || this.servingActive) return;
        this.servingActive = true;
        AudioManager.getInstance().playPluck();
        this.render();
        this.servingTimer = window.setTimeout(() => {
          this.servingActive = false;
          this.progress('obj_serve_first_pot');
          this.setStage(8);
        }, 720);
      });
    }
    if (this.stage === 8) this.button('#brew-color-next', () => this.setStage(9));
    if (this.stage === 9) {
      this.containerEl.querySelectorAll<HTMLButtonElement>('[data-aroma]').forEach(btn => btn.addEventListener('click', () => {
        this.selectedAroma = btn.dataset.aroma || '';
        AudioManager.getInstance().playClick();
        this.render();
      }));
      this.button('#brew-aroma-next', () => this.setStage(10));
    }
    if (this.stage === 10) this.button('#brew-taste-next', () => {
      this.progress('obj_evaluate_first_pot');
      this.setStage(11);
    });
    if (this.stage === 11) {
      this.button('#brew-save-favorite', () => {
        const recipe: IFavoriteTeaRecipe = {
          id: `tea-recipe-${Date.now()}`,
          name: `Công thức ${this.favorites.length + 1}`,
          teaProductId: this.profile.teaProductId,
          teaQuantity: this.teaQuantity,
          waterVolume: this.pouredWater,
          waterTemperature: this.waterTemperature,
          steepingDuration: this.steepingDuration,
          createdAt: Date.now()
        };
        this.onSaveFavorite(recipe);
        this.favorites = [...this.favorites, recipe];
        AudioManager.getInstance().playPluck();
      });
      this.button('#brew-enjoy', () => {
        this.progress('obj_enjoy_first_tea');
        this.progress('obj_unlock_tea_discovery');
        const completedSession = this.sessionSnapshot();
        this.onSessionChange(null, completedSession);
        this.onFinish();
      });
      this.button('#brew-again', () => {
        this.teaQuantity = this.profile.referenceTeaQuantity;
        this.waterVolume = this.profile.referenceWaterVolume;
        this.waterTemperature = 85;
        this.pouredWater = 0;
        this.steepingDuration = 0;
        this.timerStarted = false;
        this.filledCups = 0;
        this.selectedAroma = '';
        this.servingActive = false;
        this.selectedPrepItem = '';
        this.warmingWater = 0;
        this.setStage(3);
      });
    }
  }
}
