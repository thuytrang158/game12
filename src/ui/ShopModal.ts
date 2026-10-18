import { SHOP_PRODUCTS, IShopProduct } from '../data/shopProducts';
import { InventoryManager } from '../systems/InventoryManager';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';

export class ShopModal {
  private containerEl: HTMLElement;
  private currentTab: 'seedling' | 'fertilizer' = 'seedling';
  private selectedProductForDetail: IShopProduct | null = null;
  private currentFeedback: string = 'Chào cháu! Hãy bấm "🔍 Tìm hiểu chi tiết" để so sánh công dụng từng loại trước khi quyết định mua nhé!';
  private onCloseCallback?: () => void;

  constructor(containerEl: HTMLElement, onClose?: () => void) {
    this.containerEl = containerEl;
    this.onCloseCallback = onClose;
  }

  public open() {
    this.selectedProductForDetail = null;
    this.currentFeedback = 'Chào cháu! Hãy bấm "🔍 Tìm hiểu chi tiết" để so sánh công dụng từng loại trước khi quyết định mua nhé!';
    this.render();
    this.containerEl.classList.remove('hidden');
    AudioManager.getInstance().playClick();
  }

  public close() {
    this.containerEl.classList.add('hidden');
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }

  private render() {
    const coins = InventoryManager.getInstance().getCoins();
    const products = Object.values(SHOP_PRODUCTS);
    const displayedProducts = products.filter(p => {
      if (this.currentTab === 'seedling') {
        return p.category === 'seedling' || p.category === 'seed';
      } else {
        return p.category === 'fertilizer';
      }
    });

    this.containerEl.innerHTML = `
      <div class="shop-modal-card">
        <!-- Shop Header -->
        <div class="shop-header">
          <div class="shop-title-group">
            <span class="shop-badge-icon">🏡</span>
            <div>
              <h2 class="shop-title">Cửa Hàng Cây Giống & Vật Tư Xứ Trà</h2>
              <span class="shop-subtitle">Chủ Vườn Giống: Cô Hương • Làng Chè Tân Cương</span>
            </div>
          </div>
          <div class="shop-wallet">
            <span class="wallet-icon">🪙</span>
            <span class="wallet-text">Ví tiền:</span>
            <strong id="shop-coin-balance" class="wallet-amount">${coins} Xu Xứ Trà</strong>
          </div>
          <button id="btn-close-shop" class="modal-close" title="Rời cửa hàng">✕</button>
        </div>

        <!-- Shop Navigation Tabs -->
        <div class="shop-nav-tabs">
          <button class="shop-tab-btn ${this.currentTab === 'seedling' ? 'active' : ''}" data-tab="seedling">
            🌿 Cây Giống & Hạt Giống Chè
          </button>
          <button class="shop-tab-btn ${this.currentTab === 'fertilizer' ? 'active' : ''}" data-tab="fertilizer">
            🧪 Vật Tư & Cải Tạo Đất Trồng
          </button>
        </div>

        <!-- Shop Body (Grid + Sidebar Detail) -->
        <div class="shop-body-layout">
          <!-- Products Catalog Grid -->
          <div class="shop-products-grid">
            ${displayedProducts.map(prod => {
              const ownedCount = InventoryManager.getInstance().getItem(prod.id)?.quantity || 0;
              const canAfford = coins >= prod.price;

              return `
                <div class="shop-product-card ${prod.isQuestTargetForSeedling || prod.isQuestTargetForSoil ? 'quest-recommended' : ''}">
                  <div class="card-top">
                    <span class="prod-icon">${prod.icon}</span>
                    <div class="prod-header-info">
                      <span class="prod-tag ${prod.category}">${prod.tag}</span>
                      <h3 class="prod-name">${prod.name}</h3>
                    </div>
                  </div>

                  <p class="prod-desc">${prod.shortDesc}</p>

                  <div class="prod-meta">
                    <div class="prod-price">
                      <span class="price-label">Giá:</span>
                      <strong class="price-value">🪙 ${prod.price} Xu</strong>
                    </div>
                    <div class="prod-owned">
                      ${ownedCount > 0 ? `<span class="owned-badge">Đã có: ${ownedCount}</span>` : '<span class="unowned-badge">Chưa sở hữu</span>'}
                    </div>
                  </div>

                  <div class="card-actions">
                    <button class="btn btn-secondary btn-detail" data-id="${prod.id}">
                      🔍 Tìm hiểu chi tiết
                    </button>
                    <div class="buy-exchange-group">
                      <button 
                        class="btn btn-primary btn-buy" 
                        data-id="${prod.id}"
                        ${!canAfford ? 'disabled title="Không đủ Xu Xứ Trà"' : ''}>
                        🛒 Mua
                      </button>
                      ${ownedCount > 0 ? `
                        <button class="btn btn-warning btn-refund" data-id="${prod.id}" title="Đổi trả lại nhận lại 100% Xu">
                          🔄 Trả lại (+${prod.price} Xu)
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Detail / Inspector Sidebar -->
          <div class="shop-inspector-panel">
            <h4 class="inspector-title">📋 Hồ Sơ Khảo Cứu Nông Nghiệp</h4>
            ${this.selectedProductForDetail ? `
              <div class="inspector-content">
                <div class="inspector-header">
                  <span class="inspector-icon">${this.selectedProductForDetail.icon}</span>
                  <div>
                    <strong>${this.selectedProductForDetail.name}</strong>
                    <span class="inspector-tag">${this.selectedProductForDetail.tag}</span>
                  </div>
                </div>

                <div class="analysis-section">
                  <span class="analysis-label">🏛️ Nguồn Gốc & Phân Loại:</span>
                  <p>${this.selectedProductForDetail.detailedAnalysis.originAndType}</p>
                </div>

                <div class="analysis-section">
                  <span class="analysis-label">🧬 Đặc Tính Sinh Học & Thành Phần:</span>
                  <p>${this.selectedProductForDetail.detailedAnalysis.botanicalOrChemicalNature}</p>
                </div>

                <div class="analysis-section">
                  <span class="analysis-label">📅 Giai Đoạn Thích Hợp Sử Dụng:</span>
                  <p>${this.selectedProductForDetail.detailedAnalysis.suitableStage}</p>
                </div>

                <div class="analysis-section">
                  <span class="analysis-label">🔬 Cơ Chế Nông Nghiệp & Bộ Rễ:</span>
                  <p>${this.selectedProductForDetail.detailedAnalysis.agriculturalMechanism}</p>
                </div>

                <div class="analysis-section warning-box">
                  <span class="analysis-label">⚠️ Lưu Ý Kỹ Thuật Quan Trọng:</span>
                  <p>${this.selectedProductForDetail.detailedAnalysis.caution}</p>
                </div>
              </div>
            ` : `
              <div class="inspector-empty">
                <span class="empty-icon">📖</span>
                <p>Nhấn nút <strong>"🔍 Tìm hiểu chi tiết"</strong> trên bất kỳ sản phẩm nào để đọc phân tích khoa học nông nghiệp từ Cô Hương.</p>
              </div>
            `}
          </div>
        </div>

        <!-- Cô Hương's Live Advice Footer -->
        <div class="shop-footer-advice">
          <div class="advice-avatar">👩‍🌾</div>
          <div class="advice-content">
            <span class="advice-speaker">Cô Hương (Chủ Vườn Giống) chia sẻ:</span>
            <p id="shop-live-feedback" class="advice-text">${this.currentFeedback}</p>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Close button
    const closeBtn = this.containerEl.querySelector('#btn-close-shop');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        AudioManager.getInstance().playClick();
        this.close();
      });
    }

    // Tab buttons
    const tabBtns = this.containerEl.querySelectorAll<HTMLButtonElement>('.shop-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab') as 'seedling' | 'fertilizer';
        if (tab && tab !== this.currentTab) {
          AudioManager.getInstance().playClick();
          this.currentTab = tab;
          this.render();
        }
      });
    });

    // Detail inspector buttons
    const detailBtns = this.containerEl.querySelectorAll<HTMLButtonElement>('.btn-detail');
    detailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id && SHOP_PRODUCTS[id]) {
          AudioManager.getInstance().playClick();
          this.selectedProductForDetail = SHOP_PRODUCTS[id];
          this.currentFeedback = SHOP_PRODUCTS[id].shopkeeperFeedback;
          this.render();
        }
      });
    });

    // Buy buttons
    const buyBtns = this.containerEl.querySelectorAll<HTMLButtonElement>('.btn-buy');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id && SHOP_PRODUCTS[id]) {
          this.handlePurchase(SHOP_PRODUCTS[id]);
        }
      });
    });

    // Refund / Exchange buttons
    const refundBtns = this.containerEl.querySelectorAll<HTMLButtonElement>('.btn-refund');
    refundBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (id && SHOP_PRODUCTS[id]) {
          this.handleRefund(SHOP_PRODUCTS[id]);
        }
      });
    });
  }

  private handlePurchase(product: IShopProduct) {
    const inv = InventoryManager.getInstance();
    if (inv.getCoins() < product.price) {
      AudioManager.getInstance().playClick();
      this.currentFeedback = 'Cháu ơi, số Xu Xứ Trà hiện tại không đủ. Cháu có thể bấm nút "🔄 Trả lại" các món đồ đã mua trước đó để đổi lại Xu nhé!';
      this.render();
      return;
    }

    // Deduct coins and add item
    inv.spendCoins(product.price);
    inv.addItem(product.id, 1);
    AudioManager.getInstance().playPluck();

    // Check quest objectives
    if (product.id === 'seedling_trung_du') {
      QuestManager.getInstance().completeObjective('quest_tan_cuong', 'obj_shop_cultivar');
    }
    if (product.id === 'compost_organic') {
      QuestManager.getInstance().completeObjective('quest_tan_cuong', 'obj_shop_fertilizer');
    }

    this.currentFeedback = product.shopkeeperFeedback;
    this.selectedProductForDetail = product;
    this.render();
  }

  private handleRefund(product: IShopProduct) {
    const inv = InventoryManager.getInstance();
    if (!inv.hasItem(product.id)) return;

    inv.removeItem(product.id, 1);
    inv.addCoins(product.price);
    AudioManager.getInstance().playClick();

    this.currentFeedback = `Cô đã nhận lại "${product.name}" và hoàn lại đủ 🪙 ${product.price} Xu Xứ Trà cho cháu rồi nhé! Cứ thong thả chọn lại món phù hợp.`;
    this.render();
  }
}
