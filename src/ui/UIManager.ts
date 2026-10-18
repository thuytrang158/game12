import { IItem, IQuest, IDialogueNode, IDialogueChoice, IDestination, IFavoriteTeaRecipe, ITeaBrewingSessionState } from '../types/game';
import { QuestManager } from '../systems/QuestManager';
import { InventoryManager } from '../systems/InventoryManager';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { TourismApiAdapter } from '../integrations/tourismApi';
import { DESTINATIONS } from '../data/destinations';
import { INITIAL_ITEMS } from '../data/items';
import { DIALOGUE_NODES } from '../data/dialogues';
import { TeaHarvestMinigame } from '../minigames/TeaHarvestMinigame';
import { TeaProcessingMinigame } from '../minigames/TeaProcessingMinigame';
import { TeaBrewingMinigame } from '../minigames/TeaBrewingMinigame';
import { CulturalQuizModal } from '../minigames/CulturalQuizModal';
import { LakeLegendMinigame } from '../minigames/LakeLegendMinigame';
import { HistoricalTimelineMinigame } from '../minigames/HistoricalTimelineMinigame';
import { CaveLightMinigame } from '../minigames/CaveLightMinigame';
import { RiverCrossingMinigame } from '../minigames/RiverCrossingMinigame';
import { ShopModal } from './ShopModal';

export class UIManager {
  private static instance: UIManager;
  
  // UI Elements
  private hudEl!: HTMLElement;
  private promptEl!: HTMLElement;
  private dialogueBoxEl!: HTMLElement;
  private modalContainerEl!: HTMLElement;
  
  private exhibitEl?: HTMLElement;
  private activeMinigame?: { destroy?: () => void };

  // Modals
  private journalModalEl!: HTMLElement;
  private inventoryModalEl!: HTMLElement;
  private mapModalEl!: HTMLElement;
  private destinationCardModalEl!: HTMLElement;
  private minigameModalEl!: HTMLElement;
  private shopModalEl!: HTMLElement;
  private shopModalInstance: ShopModal | null = null;

  // Dialogue state
  private currentDialogue: IDialogueNode | null = null;
  private isTypingDialogue: boolean = false;
  private typewriterTimer: number | null = null;
  private fullDialogueText: string = '';
  private currentActionCallback?: (action: string, payload?: any) => void;

  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager();
    }
    return UIManager.instance;
  }

  public init() {
    this.hudEl = document.getElementById('game-hud')!;
    this.promptEl = document.getElementById('interaction-prompt')!;
    this.dialogueBoxEl = document.getElementById('dialogue-box')!;
    this.modalContainerEl = document.getElementById('modal-container')!;

    this.journalModalEl = document.getElementById('journal-modal')!;
    this.inventoryModalEl = document.getElementById('inventory-modal')!;
    this.mapModalEl = document.getElementById('map-modal')!;
    this.destinationCardModalEl = document.getElementById('destination-card-modal')!;
    this.minigameModalEl = document.getElementById('minigame-modal')!;
    this.shopModalEl = document.getElementById('shop-modal')!;

    this.bindEvents();
    this.bindSystemListeners();
  }

  private bindEvents() {
    // HUD Buttons
    document.getElementById('btn-journal')?.addEventListener('click', () => this.openJournal());
    document.getElementById('btn-inventory')?.addEventListener('click', () => this.openInventory());
    document.getElementById('btn-map')?.addEventListener('click', () => this.openWorldMap());
    document.getElementById('btn-audio')?.addEventListener('click', () => this.toggleAudio());

    // Close buttons on all modals
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => {
        AudioManager.getInstance().playClick();
        this.closeAllModals();
      });
    });

    // Destination card action buttons
    document.getElementById('dest-btn-continue')?.addEventListener('click', () => {
      this.closeAllModals();
    });

    document.getElementById('dest-btn-explore-more')?.addEventListener('click', () => {
      TourismApiAdapter.getInstance().onExploreDestination('tan_cuong');
    });
    document.getElementById('dest-btn-view-tours')?.addEventListener('click', () => {
      document.querySelector('.dest-tours-section')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'j' || e.key === 'J') {
        if (this.isAnyModalOpen()) this.closeAllModals();
        else this.openJournal();
      } else if (e.key === 'i' || e.key === 'I') {
        if (this.isAnyModalOpen()) this.closeAllModals();
        else this.openInventory();
      } else if (e.key === 'm' || e.key === 'M') {
        if (this.isAnyModalOpen()) this.closeAllModals();
        else this.openWorldMap();
      } else if (e.key === 'Escape') {
        if (this.isAnyModalOpen()) this.closeAllModals();
        else if (!this.dialogueBoxEl.classList.contains('hidden')) this.closeDialogue();
      }
    });

    // Stop pointer events from penetrating through dialogue box and modals to Phaser canvas
    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
      this.dialogueBoxEl.addEventListener(evt, (e) => e.stopPropagation());
      this.modalContainerEl.addEventListener(evt, (e) => e.stopPropagation());
    });

    // Dialogue container click to speed up / advance
    this.dialogueBoxEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.isTypingDialogue) {
        this.finishTypewriterImmediately();
      }
    });
  }

  private bindSystemListeners() {
    QuestManager.getInstance().addListener((event, quest) => {
      this.updateHUDQuest();
      if (event === 'quest_completed') {
        this.showToast(`🏆 Hoàn thành nhiệm vụ: "${quest.title}"!`);
        // If it's tan cuong main quest, open Destination Discovery Card!
        if (quest.id === 'quest_tan_cuong') {
          setTimeout(() => {
            this.openDestinationCard('tan_cuong');
          }, 600);
        }
      } else if (event === 'objective_updated') {
        this.showToast(`🎯 Cập nhật nhiệm vụ: ${QuestManager.getInstance().getCurrentObjectiveText()}`);
      }
    });

    InventoryManager.getInstance().addListener(() => {
      this.renderInventoryGrid();
      this.renderJournal();
    });
  }

  public setHUDVisible(visible: boolean) {
    if (this.hudEl) {
      if (visible) this.hudEl.classList.remove('hidden');
      else this.hudEl.classList.add('hidden');
    }
  }

  public updateHUDQuest() {
    const titleEl = document.getElementById('hud-quest-title');
    const objEl = document.getElementById('hud-quest-objective');
    const quest = QuestManager.getInstance().getActiveQuest();

    if (quest && titleEl && objEl) {
      titleEl.textContent = quest.title;
      objEl.textContent = QuestManager.getInstance().getCurrentObjectiveText();
    }
  }

  public setRegionName(name: string) {
    const el = document.getElementById('hud-region-name');
    if (el) el.textContent = name;
  }

  public showPrompt(text: string) {
    const textEl = document.getElementById('prompt-text');
    if (textEl) textEl.textContent = text;
    this.promptEl.classList.remove('hidden');
  }

  public hidePrompt() {
    this.promptEl.classList.add('hidden');
  }

  public toggleAudio() {
    const isMuted = AudioManager.getInstance().toggleMute();
    const iconEl = document.getElementById('audio-icon');
    if (iconEl) {
      iconEl.textContent = isMuted ? '🔇' : '🔊';
    }
    this.showToast(isMuted ? 'Đã tắt âm thanh' : 'Đã bật âm thanh');
  }

  // === Dialogue System ===
  public startDialogue(nodeId: string, onAction?: (action: string, payload?: any) => void) {
    this.currentActionCallback = onAction;
    const node = DIALOGUE_NODES[nodeId];
    if (!node) {
      console.warn(`Dialogue node not found: ${nodeId}`);
      return;
    }
    this.displayDialogueNode(node);
  }

  public displayDialogueNode(node: IDialogueNode) {
    this.currentDialogue = node;
    this.dialogueBoxEl.classList.remove('hidden');

    const avatarEl = document.getElementById('dialogue-avatar');
    const roleEl = document.getElementById('dialogue-speaker-role');
    const nameEl = document.getElementById('dialogue-speaker-name');
    const textEl = document.getElementById('dialogue-text');
    const choicesEl = document.getElementById('dialogue-choices');
    const continueEl = document.getElementById('dialogue-continue');

    if (avatarEl) avatarEl.textContent = node.speakerAvatar;
    if (roleEl) roleEl.textContent = node.speakerRole;
    if (nameEl) nameEl.textContent = node.speaker;
    if (choicesEl) choicesEl.innerHTML = '';
    if (continueEl) continueEl.classList.add('hidden');

    // Typewriter effect
    this.fullDialogueText = node.text;
    if (textEl) textEl.textContent = '';
    this.isTypingDialogue = true;

    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    let charIdx = 0;

    this.typewriterTimer = window.setInterval(() => {
      if (charIdx < this.fullDialogueText.length) {
        if (textEl) textEl.textContent += this.fullDialogueText[charIdx];
        if (charIdx % 2 === 0) AudioManager.getInstance().playDialogueBlip();
        charIdx++;
      } else {
        this.finishTypewriterImmediately();
      }
    }, 22);
  }

  private finishTypewriterImmediately() {
    if (this.typewriterTimer) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.isTypingDialogue = false;

    const textEl = document.getElementById('dialogue-text');
    if (textEl) textEl.textContent = this.fullDialogueText;

    const choicesEl = document.getElementById('dialogue-choices');
    const continueEl = document.getElementById('dialogue-continue');

    if (!this.currentDialogue) return;

    if (this.currentDialogue.choices && this.currentDialogue.choices.length > 0) {
      if (choicesEl) {
        choicesEl.innerHTML = '';
        this.currentDialogue.choices.forEach(c => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerHTML = `<span class="choice-arrow">▸</span> ${c.text}`;
          ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
            btn.addEventListener(evt, (e) => e.stopPropagation());
          });
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleChoiceClick(c);
          });
          choicesEl.appendChild(btn);
        });
      }
    } else {
      if (continueEl) {
        continueEl.classList.remove('hidden');
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
          continueEl.addEventListener(evt, (e) => e.stopPropagation());
        });
        continueEl.onclick = (e) => {
          e.stopPropagation();
          if (this.currentDialogue?.nextId) {
            this.startDialogue(this.currentDialogue.nextId, this.currentActionCallback);
          } else {
            this.closeDialogue();
          }
        };
      }
    }
  }

  private handleChoiceClick(choice: IDialogueChoice) {
    AudioManager.getInstance().playClick();

    if (choice.action) {
      if (choice.action === 'close') {
        this.closeDialogue();
        return;
      }
      if (this.currentActionCallback) {
        this.currentActionCallback(choice.action, choice.customPayload);
      }
    }

    if (choice.nextDialogueId) {
      this.startDialogue(choice.nextDialogueId, this.currentActionCallback);
    } else if (!choice.action || choice.action !== 'openMinigame') {
      this.closeDialogue();
    }
  }

  public closeDialogue() {
    if (this.typewriterTimer) clearInterval(this.typewriterTimer);
    this.dialogueBoxEl.classList.add('hidden');
    this.currentDialogue = null;
  }

  public isDialogueOpen(): boolean {
    return !this.dialogueBoxEl.classList.contains('hidden');
  }

  // === Modals ===
  public isAnyModalOpen(): boolean {
    return !this.modalContainerEl.classList.contains('hidden');
  }

  public openExhibit(title: string, subtitle: string): HTMLElement {
    this.closeAllModals();
    this.hidePrompt();
    const panel = document.createElement('section');
    panel.className = 'game-modal village-exhibit';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', title);
    panel.innerHTML = '<header class="exhibit-header"><div><small></small><h2></h2></div><button aria-label="Đóng cửa sổ">✕</button></header><div class="exhibit-body"></div>';
    panel.querySelector('small')!.textContent = subtitle;
    panel.querySelector('h2')!.textContent = title;
    const close = panel.querySelector('button')!;
    close.onclick = () => this.closeAllModals();
    panel.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...panel.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    this.exhibitEl = panel;
    this.modalContainerEl.append(panel);
    this.modalContainerEl.classList.remove('hidden');
    close.focus();
    return panel.querySelector('.exhibit-body')!;
  }

  public closeAllModals() {
    this.activeMinigame?.destroy?.();
    this.activeMinigame = undefined;
    this.exhibitEl?.remove();
    this.exhibitEl = undefined;
    this.modalContainerEl.classList.add('hidden');
    this.journalModalEl.classList.add('hidden');
    this.inventoryModalEl.classList.add('hidden');
    this.mapModalEl.classList.add('hidden');
    this.destinationCardModalEl.classList.add('hidden');
    this.minigameModalEl.classList.add('hidden');
    if (this.shopModalEl) this.shopModalEl.classList.add('hidden');
  }

  public openShop(onClose?: () => void) {
    AudioManager.getInstance().playClick();
    this.closeAllModals();
    if (!this.shopModalInstance && this.shopModalEl) {
      this.shopModalInstance = new ShopModal(this.shopModalEl, () => {
        this.closeAllModals();
        if (onClose) onClose();
      });
    }
    this.modalContainerEl.classList.remove('hidden');
    this.shopModalEl.classList.remove('hidden');
    this.shopModalInstance?.open();
  }

  public openJournal() {
    AudioManager.getInstance().playClick();
    this.closeAllModals();
    this.renderJournal();
    this.modalContainerEl.classList.remove('hidden');
    this.journalModalEl.classList.remove('hidden');
  }

  public renderJournal() {
    const listEl = document.getElementById('journal-fragments-list');
    const percentEl = document.getElementById('journal-progress-percent');
    const fillEl = document.getElementById('journal-progress-fill');
    const detailEl = document.getElementById('journal-active-detail');

    if (!listEl || !detailEl) return;

    const fragments = [
      { id: 'fragment_tea_culture', name: '1. Văn hóa trà (Tân Cương)', icon: '🍵' },
      { id: 'fragment_legend', name: '2. Truyền thuyết (Hồ Núi Cốc)', icon: '💧' },
      { id: 'fragment_history', name: '3. Lịch sử (ATK Định Hóa)', icon: '⭐' },
      { id: 'fragment_nature', name: '4. Thiên nhiên (Hang Phượng Hoàng)', icon: '🦅' },
      { id: 'fragment_exploration', name: '5. Tinh thần khám phá (Suối Cửa Tử)', icon: '🌊' },
      { id: 'fragment_people', name: '6. Con người xứ chè hiền hậu', icon: '☀️' },
      { id: 'fragment_tradition', name: '7. Phong tục & Lễ hội mùa xuân', icon: '🎋' }
    ];

    let unlockedCount = 0;
    listEl.innerHTML = '';

    fragments.forEach((frag) => {
      const isUnlocked = InventoryManager.getInstance().hasItem(frag.id);
      if (isUnlocked) unlockedCount++;

      const li = document.createElement('li');
      li.className = `fragment-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      li.innerHTML = `
        <span class="frag-icon">${isUnlocked ? frag.icon : '🔒'}</span>
        <span class="frag-title">${frag.name}</span>
        <span class="frag-badge">${isUnlocked ? 'Đã tìm thấy' : 'Chưa mở'}</span>
      `;

      li.addEventListener('click', () => {
        this.renderFragmentDetail(frag.id, isUnlocked);
      });

      listEl.appendChild(li);
    });

    const percent = Math.round((unlockedCount / fragments.length) * 100);
    if (percentEl) percentEl.textContent = `${percent}%`;
    if (fillEl) fillEl.style.width = `${percent}%`;

    // Render first available or prompt
    this.renderFragmentDetail('fragment_tea_culture', InventoryManager.getInstance().hasItem('fragment_tea_culture'));
  }

  private renderFragmentDetail(fragmentId: string, isUnlocked: boolean) {
    const detailEl = document.getElementById('journal-active-detail');
    if (!detailEl) return;

    const item = INITIAL_ITEMS[fragmentId];

    if (!isUnlocked) {
      detailEl.innerHTML = `
        <div class="locked-journal-view">
          <div class="locked-icon">🔒</div>
          <h3>Mảnh Ký Ức Còn Bị Che Phủ</h3>
          <p>Mảnh ký ức này đang ngủ say tại một vùng đất của Thái Nguyên. Hãy tiếp tục hành trình khám phá, nói chuyện với người dân địa phương và hoàn thành các thử thách để đánh thức ký ức!</p>
        </div>
      `;
      return;
    }

    detailEl.innerHTML = `
      <div class="unlocked-journal-view">
        <div class="fragment-hero-banner">
          <span class="hero-icon">${item.icon}</span>
          <div class="hero-titles">
            <span class="hero-subtitle">Bí Mật Xứ Trà – Mảnh Ký Ức</span>
            <h3>${item.name}</h3>
          </div>
        </div>

        <div class="journal-lore-card">
          <div class="card-section-title">📜 Lời Cổ Thư Ghi Lại (Truyện Dân Gian)</div>
          <p class="lore-text">${item.loreText || item.description}</p>
        </div>

        <div class="journal-real-card">
          <div class="card-section-title">🌿 Di Sản Đời Thực Thái Nguyên</div>
          <p class="real-text">${item.realWorldFact || 'Điểm đến nổi tiếng của vùng đất trung du Bắc Bộ.'}</p>
        </div>
      </div>
    `;
  }

  public openInventory() {
    AudioManager.getInstance().playClick();
    this.closeAllModals();
    this.renderInventoryGrid();
    this.modalContainerEl.classList.remove('hidden');
    this.inventoryModalEl.classList.remove('hidden');
  }

  private renderInventoryGrid() {
    const gridEl = document.getElementById('inventory-grid');
    const panelEl = document.getElementById('item-inspect-panel');
    if (!gridEl || !panelEl) return;

    const items = InventoryManager.getInstance().getItems();
    gridEl.innerHTML = '';

    // Create 12 slots
    for (let i = 0; i < 12; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';

      if (items[i]) {
        const it = items[i];
        slot.classList.add('has-item');
        slot.innerHTML = `
          <span class="slot-icon">${it.icon}</span>
          ${it.quantity && it.quantity > 1 ? `<span class="slot-qty">${it.quantity}</span>` : ''}
        `;
        slot.addEventListener('click', () => {
          this.inspectItem(it);
        });
      }

      gridEl.appendChild(slot);
    }

    if (items.length > 0) {
      this.inspectItem(items[0]);
    }
  }

  private inspectItem(item: IItem) {
    const panelEl = document.getElementById('item-inspect-panel');
    if (!panelEl) return;

    panelEl.innerHTML = `
      <div class="item-inspect-card">
        <div class="inspect-icon-wrap">${item.icon}</div>
        <h3>${item.name}</h3>
        <span class="item-cat-badge">${item.category.toUpperCase()}</span>
        <p class="item-desc">${item.description}</p>
        ${item.loreText ? `<p class="item-lore"><em>"${item.loreText}"</em></p>` : ''}
        ${item.realWorldFact ? `
          <div class="item-fact-box">
            <strong>💡 Giá trị văn hóa:</strong>
            <span>${item.realWorldFact}</span>
          </div>
        ` : ''}
      </div>
    `;

    if (item.id === 'tea_processed_tan_cuong') {
      const quest = QuestManager.getInstance().getQuest('quest_first_tea');
      const inspectObjective = quest?.objectives.find(o => o.id === 'obj_inspect_finished_tea');
      if (quest?.status === 'active' && inspectObjective && !inspectObjective.completed) {
        QuestManager.getInstance().completeObjective('quest_first_tea', 'obj_inspect_finished_tea');
        const save = SaveManager.getInstance().load();
        save.inventory = InventoryManager.getInstance().getItems();
        save.quests = QuestManager.getInstance().getAllQuests();
        save.completedQuestIds = QuestManager.getInstance().getCompletedQuestIds();
        save.activeQuestId = QuestManager.getInstance().getActiveQuest()?.id || null;
        SaveManager.getInstance().save(save);
      }
    }
  }

  public openWorldMap() {
    AudioManager.getInstance().playClick();
    this.closeAllModals();
    this.renderWorldMap();
    this.modalContainerEl.classList.remove('hidden');
    this.mapModalEl.classList.remove('hidden');
  }

  private renderWorldMap() {
    const nodesEl = document.getElementById('world-map-nodes');
    const detailEl = document.getElementById('map-region-detail');
    if (!nodesEl || !detailEl) return;

    nodesEl.innerHTML = '';

    Object.values(DESTINATIONS).forEach(dest => {
      const isTanCuong = dest.id === 'tan_cuong';
      const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_' + dest.id);
      
      const nodeBtn = document.createElement('button');
      nodeBtn.className = `map-node-pin ${isCompleted ? 'complete' : (isTanCuong ? 'active' : 'locked')}`;
      nodeBtn.style.left = `${dest.coordinates.x}%`;
      nodeBtn.style.top = `${dest.coordinates.y}%`;
      nodeBtn.innerHTML = `
        <span class="pin-icon">${isCompleted ? '⭐' : (isTanCuong ? '📍' : '🔒')}</span>
        <span class="pin-label">${dest.name}</span>
      `;

      nodeBtn.addEventListener('click', () => {
        this.renderMapRegionDetail(dest);
      });

      nodesEl.appendChild(nodeBtn);
    });

    this.renderMapRegionDetail(DESTINATIONS.tan_cuong);
  }

  private renderMapRegionDetail(dest: IDestination) {
    const detailEl = document.getElementById('map-region-detail');
    if (!detailEl) return;

    const isUnlocked = dest.id === 'tan_cuong' || InventoryManager.getInstance().hasItem('fragment_tea_culture');
    const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_' + dest.id);

    detailEl.innerHTML = `
      <div class="map-detail-card">
        <div class="dest-badge-row">
          <span class="dest-cat-tag">${dest.category}</span>
          <span class="dest-status-tag ${isCompleted ? 'complete' : (isUnlocked ? 'active' : 'locked')}">
            ${isCompleted ? '✓ Đã hoàn thành' : (isUnlocked ? '★ Vùng đã mở khóa' : '🔒 Đang khóa')}
          </span>
        </div>
        <h3>${dest.vietnameseTitle}</h3>
        <p class="dest-subtitle">${dest.subtitle}</p>
        <p class="dest-address">📍 ${dest.realWorldInfo.address}</p>

        <div class="dest-highlights-summary">
          <h4>Điểm nổi bật:</h4>
          <ul>
            ${dest.realWorldInfo.highlights.slice(0, 2).map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div class="map-actions-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button id="btn-view-dest-card" class="btn btn-secondary" style="font-size: 12px;">
            Xem Thẻ Du Lịch & Tour ➔
          </button>
          ${isUnlocked ? `
            <button id="btn-travel-to-region" class="btn btn-primary" style="font-size: 12px;">
              Dịch Chuyển Đến Vùng Này 🚀
            </button>
          ` : `
            <span class="locked-hint" style="font-size: 11px; color: #AAA;">Mở khóa sau khi thu thập Mảnh Ký Ức trước!</span>
          `}
        </div>
      </div>
    `;

    document.getElementById('btn-view-dest-card')?.addEventListener('click', () => {
      this.openDestinationCard(dest.id);
    });

    document.getElementById('btn-travel-to-region')?.addEventListener('click', () => {
      this.closeAllModals();
      this.triggerTravelToRegion(dest.id);
    });
  }

  private onTravelCallback?: (regionId: string) => void;

  public setOnTravelCallback(cb: (regionId: string) => void) {
    this.onTravelCallback = cb;
  }

  public triggerTravelToRegion(regionId: string) {
    if (this.onTravelCallback) {
      this.onTravelCallback(regionId);
    }
  }

  public openDestinationCard(destId: string, titleOverride?: string) {
    const dest = DESTINATIONS[destId];
    if (!dest) return;

    this.closeAllModals();

    const titleEl = document.getElementById('dest-card-title');
    const descEl = document.getElementById('dest-card-desc');
    const toursListEl = document.getElementById('dest-tours-list');

    if (titleEl) titleEl.textContent = titleOverride || `Khám Phá: ${dest.vietnameseTitle}`;
    if (descEl) descEl.textContent = `${dest.realWorldInfo.culturalFact} ${dest.realWorldInfo.bestTimeToVisit}.`;

    if (toursListEl) {
      toursListEl.innerHTML = '';
      dest.realWorldInfo.suggestedTours.forEach(tour => {
        const tourCard = document.createElement('div');
        tourCard.className = 'tour-card-item';
        tourCard.innerHTML = `
          <div class="tour-header">
            <span class="tour-tag">${tour.tag}</span>
            <span class="tour-rating">⭐ ${tour.rating}/5.0</span>
          </div>
          <h4 class="tour-title">${tour.title}</h4>
          <p class="tour-duration">⏱️ Thời lượng: ${tour.duration}</p>
          <p class="tour-highlight">${tour.highlight}</p>
          <button class="btn btn-book-tour" data-tour-id="${tour.id}">
            Đặt Tour Này [Website Du Lịch] ➔
          </button>
        `;

        tourCard.querySelector('.btn-book-tour')?.addEventListener('click', () => {
          TourismApiAdapter.getInstance().onBookTour(tour, dest.id);
        });

        toursListEl.appendChild(tourCard);
      });
    }

    this.modalContainerEl.classList.remove('hidden');
    this.destinationCardModalEl.classList.remove('hidden');
  }

  // === Mini-game Host ===
  public openMiniGame(type: 'harvest' | 'process' | 'quiz' | 'lake_legend' | 'atk_timeline' | 'cave_light' | 'river_crossing' | 'brewing', onFinish: () => void, freeMode = false, onProgress: () => void = () => undefined) {
    this.closeAllModals();

    const titleEl = document.getElementById('minigame-title');
    const iconEl = document.getElementById('minigame-icon');
    const bodyEl = document.getElementById('minigame-body');

    if (!bodyEl) return;

    if (type === 'harvest') {
      if (titleEl) titleEl.textContent = 'Thử Thách: Hái Búp Chè "1 Tôm 2 Lá"';
      if (iconEl) iconEl.textContent = '🍃';
      const game = new TeaHarvestMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    } else if (type === 'process') {
      if (titleEl) titleEl.textContent = 'Thử Thách: Sao Chè Thủ Công Tân Cương';
      if (iconEl) iconEl.textContent = '🍵';
      const game = new TeaProcessingMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
      this.activeMinigame = game;
    } else if (type === 'brewing') {
      if (titleEl) titleEl.textContent = 'Nghệ Thuật Pha Trà – Hương Vị Xứ Trà';
      if (iconEl) iconEl.textContent = '🫖';
      const savedData = SaveManager.getInstance().load();
      const saveSession = (session: ITeaBrewingSessionState | null, completedSession?: ITeaBrewingSessionState) => {
        const save = SaveManager.getInstance().load();
        if (session) save.teaBrewingSession = session;
        else delete save.teaBrewingSession;
        if (completedSession) {
          save.teaBrewingHistory ||= [];
          save.teaBrewingHistory.push(completedSession);
          save.teaBrewingHistory = save.teaBrewingHistory.slice(-20);
        }
        SaveManager.getInstance().save(save);
      };
      const saveFavorite = (recipe: IFavoriteTeaRecipe) => {
        const save = SaveManager.getInstance().load();
        save.favoriteTeaRecipes ||= [];
        save.favoriteTeaRecipes.push(recipe);
        save.favoriteTeaRecipes = save.favoriteTeaRecipes.slice(-20);
        SaveManager.getInstance().save(save);
        this.showToast(`Đã lưu ${recipe.name} vào công thức yêu thích.`);
      };
      const game = new TeaBrewingMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      }, freeMode, onProgress, saveSession, savedData.teaBrewingSession, savedData.favoriteTeaRecipes || [], saveFavorite);
      game.start();
      this.activeMinigame = game;
    } else if (type === 'quiz') {
      if (titleEl) titleEl.textContent = 'Đố Vui Văn Hóa: Bí Mật Đệ Nhất Danh Trà';
      if (iconEl) iconEl.textContent = '💡';
      const game = new CulturalQuizModal(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    } else if (type === 'lake_legend') {
      if (titleEl) titleEl.textContent = 'Thuyền Nan Huyền Thoại Hồ Núi Cốc';
      if (iconEl) iconEl.textContent = '🛶';
      const game = new LakeLegendMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    } else if (type === 'atk_timeline') {
      if (titleEl) titleEl.textContent = 'Dấu Ấn Lịch Sử ATK Định Hóa';
      if (iconEl) iconEl.textContent = '⭐';
      const game = new HistoricalTimelineMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    } else if (type === 'cave_light') {
      if (titleEl) titleEl.textContent = 'Ánh Sáng Hang Phượng Hoàng';
      if (iconEl) iconEl.textContent = '🦅';
      const game = new CaveLightMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    } else if (type === 'river_crossing') {
      if (titleEl) titleEl.textContent = 'Chinh Phục Thác Ghềnh Suối Cửa Tử';
      if (iconEl) iconEl.textContent = '🌊';
      const game = new RiverCrossingMinigame(bodyEl, () => {
        this.closeAllModals();
        onFinish();
      });

      game.start();
    }

    this.modalContainerEl.classList.remove('hidden');
    this.minigameModalEl.classList.remove('hidden');
  }

  public showToast(message: string) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
}

