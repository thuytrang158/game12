import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { SaveManager } from '../systems/SaveManager';
import { RegionalExplorerGuide, ExplorationStop } from '../systems/RegionalExplorerGuide';
import { initializeRegionSystems, persistRegionCheckpoint, transitionToRegion } from '../systems/RegionRegistry';
import { DestinationActivityId, DestinationExhibition } from '../minigames/DestinationActivityMinigame';
import { ProgressionService } from '../systems/ProgressionService';
import { IDestination } from '../types/game';
import { DESTINATIONS } from '../data/destinations';

export interface RegionalChapterConfig {
  regionId: 'thai_hai' | 'den_duom' | 'bao_tang_van_hoa';
  sceneKey: string;
  guideName: string;
  stops: ExplorationStop[];
  activity: DestinationActivityId;
  stageObjectives: Record<string, string>;
}

export class RegionalChapterScene extends Phaser.Scene {
  private readonly width = 960;
  private readonly height = 720;
  private player!: Player;
  private guide?: RegionalExplorerGuide;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private controls?: AbortController;
  private nearestStop: ExplorationStop | null = null;
  private config: RegionalChapterConfig;
  private get destination(): IDestination { return DESTINATIONS[this.config.regionId]; }

  constructor(config: RegionalChapterConfig) {
    super({ key: config.sceneKey });
    this.config = config;
  }

  create() {
    const save = initializeRegionSystems(this.config.regionId);
    const position = save.regionProgress?.[this.config.regionId]?.player;
    this.player = new Player(this, position?.x ?? 480, position?.y ?? 560);
    if (position?.dir) this.player.setDirection(position.dir);
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName(this.destination.name);
    UIManager.getInstance().updateHUDQuest();
    this.createEnvironment();
    this.createGuideCharacter();
    this.createStops();
    this.physics.world.setBounds(16, 16, this.width - 32, this.height - 32);
    this.cameras.main.setBounds(0, 0, this.width, this.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.15);
    this.cameras.main.fadeIn(350);
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    this.guide = new RegionalExplorerGuide(this, this.config.regionId, this.destination.name, this.config.stops, () => this.player, () => QuestManager.getInstance().getCurrentObjectiveText(), stop => {
      this.player.setPosition(stop.x, stop.y + 42);
      this.player.setVelocity(0, 0);
      persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }, stop.id);
    });
    this.bindMobileControls();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls?.abort();
      this.player?.setVirtualMovement(0, 0);
      persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
      this.guide?.destroy();
      UIManager.getInstance().hidePrompt();
    });
    UIManager.getInstance().setOnTravelCallback(regionId => {
      transitionToRegion(this, this.config.regionId, regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
    });
    UIManager.getInstance().showToast(`Chào mừng bạn đến ${this.destination.name}. Sơ đồ trong trò chơi có tính minh họa.`);
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    const blocking = UIManager.getInstance().isAnyModalOpen() || UIManager.getInstance().isDialogueOpen();
    this.player.setControlActive(!blocking);
    this.player.update(time, delta);
    this.guide?.update();
    if (blocking) {
      this.nearestStop = null;
      UIManager.getInstance().hidePrompt();
      return;
    }
    let nearest: ExplorationStop | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const stop of this.config.stops) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, stop.x, stop.y);
      if (distance < nearestDistance) { nearest = stop; nearestDistance = distance; }
    }
    this.nearestStop = nearestDistance <= 62 ? nearest : null;
    if (this.nearestStop) UIManager.getInstance().showPrompt(`Nhấn E hoặc chạm vào điểm “${this.nearestStop.label}” để tìm hiểu`);
    else UIManager.getInstance().hidePrompt();
    if (this.nearestStop && (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey))) this.interactWithStop(this.nearestStop);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.width, this.height);
    const baseFrame = this.config.regionId === 'bao_tang_van_hoa' ? 7 : this.config.regionId === 'den_duom' ? 2 : 0;
    this.add.tileSprite(this.width / 2, this.height / 2, this.width, this.height, 'env_tileset', baseFrame).setDepth(-100);
    const walls = this.physics.add.staticGroup();
    const addWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
      this.physics.add.existing(wall, true);
      walls.add(wall);
    };
    addWall(480, 10, 960, 20); addWall(480, 710, 960, 20); addWall(10, 360, 20, 720); addWall(950, 360, 20, 720);
    if (this.config.regionId === 'thai_hai') {
      this.add.image(480, 230, 'stilt_house_atk').setScale(2.4).setDepth(230);
      this.add.image(215, 430, 'traditional_house').setScale(1.7).setDepth(430);
      for (let x = 570; x < 790; x += 64) this.add.image(x, 410, 'tea_bush').setScale(1.2).setDepth(410);
      this.add.rectangle(735, 520, 220, 100, 0x855e3a).setStrokeStyle(5, 0x533a26).setDepth(520);
      addWall(480, 275, 135, 42); addWall(215, 468, 90, 35);
      this.add.text(480, 332, 'NHÀ SÀN ĐÓN KHÁCH · TÌNH HUỐNG HƯ CẤU', { fontSize: '13px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(600);
    } else if (this.config.regionId === 'den_duom') {
      const shrine = this.add.graphics().setDepth(300);
      shrine.fillStyle(0x5e432c); shrine.fillRect(414, 248, 132, 88);
      shrine.fillStyle(0xa98953); shrine.fillTriangle(392, 250, 480, 188, 568, 250);
      shrine.fillStyle(0x7e5b35); shrine.fillTriangle(380, 245, 480, 202, 580, 245);
      shrine.fillStyle(0x725439); shrine.fillRect(400, 333, 160, 14);
      this.add.text(480, 363, 'KHU DIỄN GIẢI · KHÔNG MÔ PHỎNG NGHI LỄ', { fontSize: '12px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(600);
      this.add.image(165, 240, 'tea_bush').setScale(2.5).setDepth(240);
      this.add.image(800, 245, 'tea_bush').setScale(2.5).setDepth(245);
      addWall(480, 330, 125, 35);
      const yard = this.add.graphics().setDepth(-40); yard.lineStyle(4, 0xc8b37b, 1); yard.strokeRect(620, 430, 250, 185);
      this.add.text(745, 630, 'SÂN SINH HOẠT CỘNG ĐỒNG', { fontSize: '11px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 6, y: 4 } }).setOrigin(0.5);
    } else {
      const back = this.add.graphics().setDepth(-50); back.fillStyle(0xe4dfc8); back.fillRect(70, 70, 820, 580);
      for (let y = 122; y <= 595; y += 118) {
        this.add.rectangle(480, y, 740, 6, 0x8c7554).setDepth(y);
        for (let x = 155; x <= 805; x += 210) {
          const caseContainer = this.add.container(x, y - 36).setDepth(y - 10);
          const frame = this.add.graphics(); frame.fillStyle(0x705c43); frame.fillRect(-58, -34, 116, 72); frame.fillStyle(0xd8dfd2); frame.fillRect(-51, -27, 102, 58);
          const artifact = this.add.graphics(); artifact.fillStyle(0x946d45); artifact.fillRect(-18, -15, 36, 31); artifact.fillStyle(0xbda36b); artifact.fillRect(-8, -24, 16, 8); artifact.fillStyle(0x5a7358); artifact.fillRect(-24, 17, 48, 4);
          caseContainer.add([frame, artifact]);
        }
      }
      this.add.text(480, 92, 'PHÒNG TRƯNG BÀY SỐ CÁCH ĐIỆU · MÔ HÌNH MINH HỌA', { fontSize: '13px', color: '#263d31', backgroundColor: '#fff2d5', padding: { x: 8, y: 5 } }).setOrigin(0.5).setDepth(700);
      addWall(480, 628, 760, 24);
    }
    this.physics.add.collider(this.player, walls);
    this.add.text(480, 32, this.destination.name.toUpperCase(), { fontSize: '18px', color: '#f4c978', fontStyle: 'bold', backgroundColor: '#1d3b2b', padding: { x: 8, y: 5 } }).setOrigin(0.5).setDepth(900);
  }

  private createStops() {
    this.config.stops.forEach((stop, index) => {
      const marker = this.add.container(stop.x, stop.y).setDepth(stop.y + 1).setSize(70, 76).setInteractive({ useHandCursor: true });
      const board = this.add.graphics();
      board.fillStyle(this.config.regionId === 'bao_tang_van_hoa' ? 0x68836d : 0x8c683e); board.fillRoundedRect(-26, -25, 52, 36, 4);
      board.lineStyle(2, 0xf4c978); board.strokeRoundedRect(-26, -25, 52, 36, 4);
      board.fillStyle(0x5f4b34); board.fillRect(-3, 10, 6, 20);
      const number = this.add.text(0, -7, `${index + 1}`, { fontSize: '16px', color: '#fff2d5', fontStyle: 'bold' }).setOrigin(0.5);
      const label = this.add.text(0, 38, stop.label, { fontSize: '10px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 4, y: 3 }, align: 'center', wordWrap: { width: 130 } }).setOrigin(0.5, 0);
      marker.add([board, number, label]);
      marker.on('pointerdown', () => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, stop.x, stop.y);
        if (distance > 115) UIManager.getInstance().showToast(`Hãy đi đến “${stop.label}” trước khi tìm hiểu.`);
        else this.interactWithStop(stop);
      });
    });
  }

  private createGuideCharacter() {
    const x = 480, y = 520;
    const figure = this.add.container(x, y).setDepth(y);
    const body = this.add.ellipse(0, 12, 31, 38, 0x4e7659).setStrokeStyle(2, 0xffe2a2);
    const head = this.add.circle(0, -13, 12, 0xd7a77c).setStrokeStyle(2, 0x513c2c);
    const badge = this.add.text(0, -44, this.config.guideName, { fontSize: '12px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 6, y: 4 } }).setOrigin(0.5, 1);
    figure.add([body, head, badge]);
  }

  private interactWithStop(stop: ExplorationStop) {
    const quest = QuestManager.getInstance().getQuest(`quest_${this.config.regionId}`);
    if (!quest) return;
    if (this.config.regionId === 'thai_hai') {
      if (stop.id === 'gate') this.completeObjective('th_meet_host');
      else if (stop.id === 'garden' || stop.id === 'kitchen') this.openActivity();
      else if (stop.id === 'porch' && quest.status === 'completed') UIManager.getInstance().openChapterEnding(this.destination.name, true);
      else UIManager.getInstance().showToast('Hãy gặp người đón khách rồi làm theo từng bước của hoạt động.');
    } else if (this.config.regionId === 'den_duom') {
      const cardStops: Record<string,string> = { person: 'dd_person_card', heritage: 'dd_site_card', festival: 'dd_festival_card' };
      if (stop.id === 'gate') {
        this.completeObjective('dd_meet_guide');
        UIManager.getInstance().showToast('Tình nguyện viên đã giới thiệu ba điểm diễn giải trên sơ đồ minh họa.');
      }
      if (cardStops[stop.id]) {
        if (!quest.objectives.find(o => o.id === 'dd_meet_guide')?.completed) {
          UIManager.getInstance().showToast('Hãy gặp tình nguyện viên ở cổng trước khi đọc các thẻ diễn giải.'); return;
        }
        const completed = this.markActivity(cardStops[stop.id]);
        if (completed) QuestManager.getInstance().incrementObjective('quest_den_duom', 'dd_collect_cards', 1);
        this.showProgressToast('Đã đọc thẻ diễn giải. Việc ghé thăm và ghép thông tin được ghi nhận riêng.');
      } else if (stop.id === 'leaflet' || stop.id === 'courtyard') this.openActivity();
      else if (stop.id === 'stamp') {
        if (quest.status === 'completed') {
          UIManager.getInstance().openChapterEnding(this.destination.name, true);
          return;
        }
        const ready = quest.objectives.filter(o => o.id !== 'dd_return_stamp').every(o => o.completed);
        if (ready) this.completeObjective('dd_return_stamp');
        else UIManager.getInstance().showToast('Hãy hoàn thiện tờ giới thiệu và phần chuẩn bị trước khi tới bàn lưu dấu.');
      }
      else UIManager.getInstance().showToast('Đây là sơ đồ minh họa. Hãy ghé ba điểm thông tin rồi hoàn thiện tờ giới thiệu.');
    } else {
      if (stop.id === 'worksheet') {
        if (quest.status === 'completed') {
          UIManager.getInstance().openChapterEnding(this.destination.name, true);
          return;
        }
        this.completeObjective('bm_meet_guide');
        this.completeObjective('bm_read_label');
        UIManager.getInstance().showToast('Người hướng dẫn đã giới thiệu cách đọc nhãn trên các mô hình minh họa.');
      }
      else if (['clothing','instrument','living','architecture'].includes(stop.id)) {
        if (!quest.objectives.find(o => o.id === 'bm_read_label')?.completed) {
          UIManager.getInstance().showToast('Hãy gặp người hướng dẫn ở sảnh và đọc nhãn trước khi xem mô hình.'); return;
        }
        const stage = `bm_model_${stop.id}`;
        if (this.markActivity(stage)) QuestManager.getInstance().incrementObjective('quest_bao_tang_van_hoa', 'bm_inspect_models', 1);
        this.showProgressToast('Đã xem mô hình giáo dục số và nhãn minh họa.');
      } else if (stop.id === 'exhibition') this.openActivity();
      else UIManager.getInstance().showToast('Hãy xem phiếu hướng dẫn và bốn mô hình trước khi thiết kế triển lãm.');
    }
    this.saveState();
    UIManager.getInstance().updateHUDQuest();
  }

  private openActivity() {
    const save = SaveManager.getInstance().load();
    const progress = save.regionProgress?.[this.config.regionId];
    if (this.config.regionId === 'thai_hai' && !QuestManager.getInstance().getQuest('quest_thai_hai')?.objectives[0].completed) {
      UIManager.getInstance().showToast('Trước hết, hãy gặp người đón khách ở cổng bản.'); return;
    }
    if (this.config.regionId === 'den_duom' && (QuestManager.getInstance().getQuest('quest_den_duom')?.objectives.find(o => o.id === 'dd_collect_cards')?.currentCount || 0) < 3) {
      UIManager.getInstance().showToast('Hãy đọc đủ ba thẻ ở các điểm diễn giải trước khi ghép tờ giới thiệu.'); return;
    }
    if (this.config.regionId === 'bao_tang_van_hoa' && (QuestManager.getInstance().getQuest('quest_bao_tang_van_hoa')?.objectives.find(o => o.id === 'bm_inspect_models')?.currentCount || 0) < 4) {
      UIManager.getInstance().showToast('Hãy quan sát đủ bốn mô hình giáo dục số trước khi sắp triển lãm.'); return;
    }
    const exhibition = progress?.exhibition as DestinationExhibition | undefined;
    const activityStages = [...(progress?.completedActivities || [])];
    if (this.config.regionId === 'bao_tang_van_hoa' && QuestManager.getInstance().isQuestCompleted('quest_bao_tang_van_hoa')) {
      activityStages.splice(activityStages.indexOf('exhibition'), activityStages.includes('exhibition') ? 1 : 0);
    }
    UIManager.getInstance().openDestinationActivity(this.config.activity, activityStages, exhibition, (stageId, savedExhibition) => {
      const objective = this.config.stageObjectives[stageId];
      if (savedExhibition) {
        const state = SaveManager.getInstance().load(); state.regionProgress ||= {};
        const region = state.regionProgress[this.config.regionId] || { visitedStops: [], completedActivities: [] };
        region.exhibition = savedExhibition; state.regionProgress[this.config.regionId] = region; SaveManager.getInstance().save(state);
      }
      if (this.markActivity(stageId) && objective) this.completeObjective(objective);
      if (this.config.regionId === 'bao_tang_van_hoa' && stageId === 'exhibition') {
        this.completeObjective('bm_build_exhibit'); this.completeObjective('bm_title_exhibit');
      }
      this.saveState();
    }, () => {
      this.saveState();
      this.awardIfComplete();
      UIManager.getInstance().showToast('Hoạt động đã ghi nhận. Bạn có thể tiếp tục khám phá các điểm còn lại.');
      UIManager.getInstance().updateHUDQuest();
    });
  }

  private completeObjective(id: string) {
    ProgressionService.completeObjective(`quest_${this.config.regionId}`, id, this.config.regionId);
    this.awardIfComplete();
  }

  private markActivity(id: string) {
    const save = SaveManager.getInstance().load(); save.regionProgress ||= {};
    const progress = save.regionProgress[this.config.regionId] || { visitedStops: [], completedActivities: [] };
    if (progress.completedActivities.includes(id)) return false;
    progress.completedActivities.push(id); save.regionProgress[this.config.regionId] = progress; SaveManager.getInstance().save(save); return true;
  }

  private awardIfComplete() {
    ProgressionService.awardCompletedChapter(`quest_${this.config.regionId}`, this.config.regionId);
    if (QuestManager.getInstance().isQuestCompleted(`quest_${this.config.regionId}`) && this.markActivity('chapter_ending_seen')) {
      UIManager.getInstance().openChapterEnding(this.destination.name);
    }
  }

  private saveState() {
    persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
  }

  private showProgressToast(message: string) {
    UIManager.getInstance().showToast(message);
    this.awardIfComplete();
  }

  private bindMobileControls() {
    this.controls = new AbortController();
    const signal = this.controls.signal;
    const movement: Record<string, [number, number]> = { 'touch-up': [0,-1], 'touch-down': [0,1], 'touch-left': [-1,0], 'touch-right': [1,0] };
    Object.entries(movement).forEach(([id, vector]) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.addEventListener('pointerdown', event => { event.preventDefault(); (event.currentTarget as HTMLElement).setPointerCapture?.((event as PointerEvent).pointerId); this.player.setVirtualMovement(...vector); }, { signal });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type => button.addEventListener(type, () => this.player.setVirtualMovement(0,0), { signal }));
    });
    document.getElementById('btn-touch-interact')?.addEventListener('click', () => { if (this.nearestStop) this.interactWithStop(this.nearestStop); }, { signal });
    window.addEventListener('blur', () => this.player?.setVirtualMovement(0,0), { signal });
  }
}
