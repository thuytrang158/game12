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
import { TungConMinigame } from '../minigames/TungConMinigame';
import { ShopModal } from './ShopModal';
import { getSceneKey, hasAllJourneyMemories, isRegionUnlocked, MEMORY_FRAGMENT_IDS } from '../systems/RegionRegistry';
import { DestinationActivityId, DestinationActivityMinigame, DestinationExhibition } from '../minigames/DestinationActivityMinigame';
import { SUGGESTED_ROUTE } from '../systems/RegionRegistry';

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
  private currentDestinationCardId = 'tan_cuong';
  private explorationGuideEl?: HTMLElement;
  private explorationGuideRegionId = '';
  private explorationGuideCollapsed = false;

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
    const existingSave = SaveManager.getInstance().load();
    if (hasAllJourneyMemories(existingSave) && !existingSave.journeyEndingPresented) {
      existingSave.journeyEndingPresented = true;
      SaveManager.getInstance().save(existingSave);
      window.setTimeout(() => this.openJourneyEnding(), 0);
    }
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
      TourismApiAdapter.getInstance().onExploreDestination(this.currentDestinationCardId);
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
    window.addEventListener('thai-nguyen-journey-ending', () => this.openJourneyEnding());
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

  /** Own transient exhibit timers with the same lifecycle as hosted mini-games. */
  public setExhibitCleanup(cleanup: () => void) {
    this.activeMinigame = { destroy: cleanup };
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
    if (hasAllJourneyMemories(SaveManager.getInstance().load())) {
      const button = document.createElement('button');
      button.className = 'btn btn-primary';
      button.textContent = 'Mở Cuốn sổ xứ trà · Xem lại hành trình';
      button.addEventListener('click', () => this.openJourneyEnding(true));
      detailEl.appendChild(button);
    }
  }

  public openJourneyEnding(replay = false) {
    if (!hasAllJourneyMemories(SaveManager.getInstance().load())) return;
    const slides = [
      { title: 'Đất và mặt nước', text: 'Từ nương chè Tân Cương tới truyền thuyết dân gian bên Hồ Núi Cốc, hành trình bắt đầu bằng cách lắng nghe cảnh quan và câu chuyện.' },
      { title: 'Dấu tích và ánh sáng', text: 'Những trang sử ở ATK, hình đá trong hang và con đường ven suối gợi nhắc cách con người tìm hiểu, gìn giữ và bước đi cẩn trọng.' },
      { title: 'Con người và ký ức', text: 'Những cuộc gặp ở Thái Hải, câu chuyện tại Đền Đuổm và các mô hình giáo dục trong bảo tàng nối thành cuốn sổ riêng của bạn.' }
    ];
    const save = SaveManager.getInstance().load();
    const collected = new Set([...(save.collectedFragmentIds || []), ...(save.inventory || []).map(item => item.id)]);
    let slide = 0;
    const render = () => {
      const body = this.openExhibit('Cuốn sổ xứ trà', 'Hành trình qua cảnh quan, con người và trải nghiệm · nội dung trò chơi');
      body.innerHTML = `<article class="journey-ending"><span class="brew-status">${slide + 1} / ${slides.length}</span><h3>${slides[slide].title}</h3><p>${slides[slide].text}</p><div class="journey-memory-list">${MEMORY_FRAGMENT_IDS.map(id => `<span>${collected.has(id) ? '✓' : '○'} ${id.replace('fragment_','').replaceAll('_',' ')}</span>`).join('')}</div><footer><button class="btn btn-secondary" data-continue>Tiếp tục khám phá</button><button class="btn btn-primary" data-next>${slide === slides.length - 1 ? 'Xem lại hành trình' : 'Tiếp ➜'}</button></footer></article>`;
      body.querySelector('[data-continue]')?.addEventListener('click', () => this.closeAllModals());
      body.querySelector('[data-next]')?.addEventListener('click', () => {
        if (slide === slides.length - 1) slide = 0;
        else slide += 1;
        render();
      });
    };
    if (!replay) slide = 0;
    render();
  }

  public openChapterEnding(title: string, replay = false) {
    const slides = [
      { title: 'Chặng đường đã hoàn thành', text: `Bạn đã hoàn thành nhiệm vụ chính tại ${title}. Dấu lưu của chương đã được thêm vào hộ chiếu.` },
      { title: 'Một điều mang theo', text: 'Những điểm đã ghé thăm và hoạt động đã hoàn thành được lưu riêng. Bạn có thể quay lại để khám phá thêm hoặc xem lại triển lãm của mình.' }
    ];
    let slide = replay ? slides.length - 1 : 0;
    const render = () => {
      const body = this.openExhibit(title, 'Kết chương · Hành trình khám phá Thái Nguyên');
      const article = document.createElement('article');
      article.className = 'journey-ending';
      const count = document.createElement('span'); count.className = 'brew-status'; count.textContent = `${slide + 1} / ${slides.length}`;
      const heading = document.createElement('h3'); heading.textContent = slides[slide].title;
      const paragraph = document.createElement('p'); paragraph.textContent = slides[slide].text;
      const controls = document.createElement('footer');
      const skip = document.createElement('button'); skip.className = 'btn btn-secondary'; skip.textContent = 'Bỏ qua';
      skip.addEventListener('click', () => this.closeAllModals());
      const next = document.createElement('button'); next.className = 'btn btn-primary'; next.textContent = slide === slides.length - 1 ? 'Xem lại kết chương' : 'Tiếp ➜';
      next.addEventListener('click', () => { slide = slide === slides.length - 1 ? 0 : slide + 1; render(); });
      controls.append(skip, next); article.append(count, heading, paragraph, controls); body.replaceChildren(article);
    };
    render();
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

  public renderExplorationGuide(data: {
    regionId: string;
    title: string;
    subtitle: string;
    stops: Array<{ id: string; label: string; x: number; y: number; visited: boolean; highlighted: boolean }>;
    objective: string;
    player: { x: number; y: number };
    visible: boolean;
    onFastTravel: (stopId: string) => void;
    onOpenCard: () => void;
  }) {
    if (!this.explorationGuideEl || this.explorationGuideRegionId !== data.regionId) {
      this.explorationGuideEl?.remove();
      this.explorationGuideEl = document.createElement('aside');
      this.explorationGuideEl.className = `regional-exploration-guide ${data.regionId === 'den_duom' ? 'den-duom-guide' : ''}`;
      this.explorationGuideEl.setAttribute('aria-label', `Bản đồ khám phá ${data.title}`);
      document.body.appendChild(this.explorationGuideEl);
      this.explorationGuideRegionId = data.regionId;
      this.explorationGuideCollapsed = false;
    }
    const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');
    const width = 960, height = 720;
    const isDuom = data.regionId === 'den_duom';
    const glyphs: Record<string, string> = { gate: '!', person: 'i', heritage: '✦', festival: '♪', courtyard: '◇', stamp: '✓' };
    const stopPins = data.stops.map((stop, index) => `<button class="regional-guide-pin ${stop.visited ? 'visited' : ''} ${stop.highlighted ? 'next' : ''}" style="left:${Math.max(2, Math.min(98, stop.x / width * 100))}%;top:${Math.max(2, Math.min(98, stop.y / height * 100))}%" aria-label="${stop.visited ? 'Đã thăm' : 'Chưa thăm'}: ${stop.label}" ${stop.visited ? `data-fast-travel="${safeId(stop.id)}"` : 'disabled'}>${isDuom ? (stop.visited ? '✓' : glyphs[stop.id] || '•') : index + 1}</button>`).join('');
    const rows = data.stops.map((stop, index) => `<li class="${stop.visited ? 'visited' : ''} ${stop.highlighted ? 'next' : ''}"><span>${stop.visited ? '✓' : stop.highlighted ? '●' : '○'} ${isDuom ? '' : `${index + 1}. `}${stop.label}</span>${stop.visited ? `<button data-fast-travel="${safeId(stop.id)}" aria-label="Đi nhanh tới ${stop.label}">Đi nhanh</button>` : '<small>Chưa thăm</small>'}</li>`).join('');
    const listTag = isDuom ? 'ul' : 'ol';
    this.explorationGuideEl.innerHTML = `<header><div><b>${data.title}</b><small>${data.subtitle}</small></div><button class="regional-guide-toggle" aria-expanded="${!this.explorationGuideCollapsed}">${this.explorationGuideCollapsed ? 'Mở bản đồ +' : 'Thu gọn −'}</button></header>${this.explorationGuideCollapsed ? '' : `<div class="regional-guide-schematic" role="img" aria-label="Sơ đồ tuyến minh họa, không theo tỷ lệ thực tế"><span class="regional-guide-player" style="left:${Math.max(1, Math.min(99, data.player.x / width * 100))}%;top:${Math.max(1, Math.min(99, data.player.y / height * 100))}%">Bạn</span>${stopPins}</div><div class="regional-guide-objective"><strong>Mục tiêu</strong><span>${data.objective}</span></div><${listTag}>${rows}</${listTag}><button class="regional-guide-info">Thông tin điểm đến</button>`}`;
    this.explorationGuideEl.classList.toggle('hidden', !data.visible);
    this.explorationGuideEl.classList.toggle('collapsed', this.explorationGuideCollapsed);
    this.explorationGuideEl.querySelector('.regional-guide-toggle')?.addEventListener('click', () => {
      this.explorationGuideCollapsed = !this.explorationGuideCollapsed;
      this.renderExplorationGuide(data);
    }, { once: true });
    this.explorationGuideEl.querySelectorAll<HTMLButtonElement>('[data-fast-travel]').forEach(button => {
      button.addEventListener('click', () => data.onFastTravel(button.dataset.fastTravel || ''), { once: true });
    });
    this.explorationGuideEl.querySelector('.regional-guide-info')?.addEventListener('click', data.onOpenCard, { once: true });
  }

  public clearExplorationGuide(regionId: string) {
    if (this.explorationGuideRegionId !== regionId) return;
    this.explorationGuideEl?.remove();
    this.explorationGuideEl = undefined;
    this.explorationGuideRegionId = '';
  }

  private renderWorldMap() {
    const nodesEl = document.getElementById('world-map-nodes');
    const detailEl = document.getElementById('map-region-detail');
    if (!nodesEl || !detailEl) return;

    nodesEl.innerHTML = '';

    Object.values(DESTINATIONS).forEach(dest => {
      const isUnlocked = isRegionUnlocked(dest.id, SaveManager.getInstance().load());
      const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_' + dest.id);
      
      const nodeBtn = document.createElement('button');
      nodeBtn.className = `map-node-pin ${isCompleted ? 'complete' : (isUnlocked ? 'active' : 'locked')}`;
      nodeBtn.style.left = `${dest.coordinates.x}%`;
      nodeBtn.style.top = `${dest.coordinates.y}%`;
      nodeBtn.innerHTML = `
        <span class="pin-icon">${isCompleted ? '⭐' : (isUnlocked ? '📍' : '🔒')}</span>
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

    const isUnlocked = isRegionUnlocked(dest.id, SaveManager.getInstance().load());
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
        ${SUGGESTED_ROUTE.includes(dest.id) ? `<p class="suggested-route">${dest.id === 'tan_cuong' ? 'Điểm khởi đầu gợi ý' : `Chặng ${SUGGESTED_ROUTE.indexOf(dest.id) + 1} trong tuyến gợi ý`}. Bạn có thể tự chọn thứ tự tham quan.</p>` : '<p class="suggested-route">Có thể ghé thăm sau khi mở khóa các vùng.</p>'}
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
            <span class="locked-hint" style="font-size: 11px; color: #AAA;">Mở khóa khi nhận Mảnh Ký Ức Văn Hóa Trà tại Tân Cương.</span>
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
    if (!isRegionUnlocked(regionId, SaveManager.getInstance().load())) {
      this.showToast('Hãy nhận Mảnh Ký Ức Văn Hóa Trà tại Tân Cương để mở hành trình này.');
      return;
    }
    if (getSceneKey(regionId) && this.onTravelCallback) this.onTravelCallback(regionId);
  }

  public openDestinationCard(destId: string, titleOverride?: string) {
    const dest = DESTINATIONS[destId];
    if (!dest) return;

    this.closeAllModals();
    this.currentDestinationCardId = dest.id;

    const titleEl = document.getElementById('dest-card-title');
    const descEl = document.getElementById('dest-card-desc');
    const toursListEl = document.getElementById('dest-tours-list');
    const heroBadge = document.getElementById('dest-hero-badge');
    const exploreMoreButton = document.getElementById('dest-btn-explore-more');

    if (titleEl) titleEl.textContent = titleOverride || `Khám Phá: ${dest.vietnameseTitle}`;
    if (descEl) descEl.textContent = `${dest.realWorldInfo.culturalFact} ${dest.realWorldInfo.bestTimeToVisit}.`;
    if (heroBadge) heroBadge.textContent = dest.category;
    if (exploreMoreButton) exploreMoreButton.textContent = dest.id === 'den_duom' ? 'Tìm hiểu thêm về Đền Đuổm' : 'Khám Phá Tân Cương';

    if (dest.id === 'den_duom') {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('.highlight-card'));
      const highlights = [
        { icon: '🏛️', title: 'Ba không gian thờ tự', copy: 'Đền Hạ thờ hai công chúa Diên Bình và Thiều Dung; Đền Trung gắn với Dương Tự Minh; Đền Thượng thờ thân mẫu ông.' },
        { icon: '📜', title: 'Dương Tự Minh', copy: 'Di tích tưởng niệm danh tướng Dương Tự Minh, nhân vật lịch sử gắn với vùng đất Phú Lương.' },
        { icon: '🎋', title: 'Hội xuân', copy: 'Lễ hội có hoạt động văn hóa và trò chơi dân gian. Phần hội trong game là minh họa, không phải lịch lễ hội thực tế.' }
      ];
      cards.forEach((card, index) => {
        const item = highlights[index];
        if (!item) return;
        const icon = card.querySelector<HTMLElement>('.highlight-icon');
        const heading = card.querySelector<HTMLElement>('[data-dest-highlight-title]');
        const copy = card.querySelector<HTMLElement>('[data-dest-highlight-copy]');
        if (icon) icon.textContent = item.icon;
        if (heading) heading.textContent = item.title;
        if (copy) copy.textContent = item.copy;
      });
    }

    if (toursListEl) {
      toursListEl.replaceChildren();
      const empty = document.createElement('p');
      empty.className = 'tour-empty-state';
      empty.textContent = 'Trò chơi chưa có danh sách tour được xác minh. Hãy xác nhận giờ mở cửa, điều kiện tham quan và dịch vụ trực tiếp với điểm đến trước chuyến đi.';
      toursListEl.appendChild(empty);
    }

    this.modalContainerEl.classList.remove('hidden');
    this.destinationCardModalEl.classList.remove('hidden');
  }

  public openDestinationActivity(
    type: DestinationActivityId,
    completedStages: string[],
    exhibition: DestinationExhibition | undefined,
    onStageComplete: (stageId: string, exhibition?: DestinationExhibition) => void,
    onFinish: () => void
  ) {
    this.closeAllModals();
    const titleEl = document.getElementById('minigame-title');
    const iconEl = document.getElementById('minigame-icon');
    const bodyEl = document.getElementById('minigame-body');
    if (!bodyEl) return;
    const titles: Record<DestinationActivityId, string> = {
      thai_hai: 'Làng Thái Hải · Cùng chuẩn bị đón khách',
      den_duom: 'Đền Đuổm · Theo dấu hội xuân',
      museum: 'Bảo tàng · Người kết nối di sản'
    };
    if (titleEl) titleEl.textContent = titles[type];
    if (iconEl) iconEl.textContent = type === 'thai_hai' ? '🏡' : type === 'den_duom' ? '🎋' : '🏛️';
    const game = new DestinationActivityMinigame(bodyEl, type, onStageComplete, () => {
      this.closeAllModals();
      onFinish();
    }, completedStages, exhibition);
    this.activeMinigame = game;
    this.modalContainerEl.classList.remove('hidden');
    this.minigameModalEl.classList.remove('hidden');
  }

  public openTungConMinigame(onFinish: (won: boolean) => void) {
    this.closeDialogue();
    this.closeAllModals();
    const titleEl = document.getElementById('minigame-title');
    const iconEl = document.getElementById('minigame-icon');
    const bodyEl = document.getElementById('minigame-body');
    if (!bodyEl) return;
    if (titleEl) titleEl.textContent = 'Sân hội xuân · Tung còn';
    if (iconEl) iconEl.textContent = '🎋';
    this.activeMinigame = new TungConMinigame(bodyEl, won => {
      this.closeAllModals();
      onFinish(won);
    });
    this.modalContainerEl.classList.remove('hidden');
    this.minigameModalEl.classList.remove('hidden');
  }

  // === Mini-game Host ===
  public openMiniGame(type: 'harvest' | 'process' | 'quiz' | 'lake_legend' | 'atk_timeline' | 'cave_light' | 'river_crossing' | 'brewing', onFinish: (outcome?: any) => void, freeMode = false, onProgress: (objectiveId?: string) => void = () => undefined) {
    this.closeAllModals();

    const titleEl = document.getElementById('minigame-title');
    const iconEl = document.getElementById('minigame-icon');
    const bodyEl = document.getElementById('minigame-body');

    if (!bodyEl) return;

    if (type === 'harvest') {
      if (titleEl) titleEl.textContent = 'Thử Thách: Hái Búp Chè "1 Tôm 2 Lá"';
      if (iconEl) iconEl.textContent = '🍃';
      const game = new TeaHarvestMinigame(bodyEl, (outcome) => {
        this.closeAllModals();
        onFinish(outcome);
      });

      game.start();
    } else if (type === 'process') {
      if (titleEl) titleEl.textContent = 'Thử Thách: Sao Chè Thủ Công Tân Cương';
      if (iconEl) iconEl.textContent = '🍵';
      const game = new TeaProcessingMinigame(bodyEl, (outcome) => {
        this.closeAllModals();
        onFinish(outcome);
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

