import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { INPCConfig } from '../types/game';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';
import { initializeRegionSystems, persistRegionCheckpoint, transitionToRegion } from '../systems/RegionRegistry';
import { RegionalExplorerGuide, ExplorationStop } from '../systems/RegionalExplorerGuide';
import { ProgressionService } from '../systems/ProgressionService';

export class SuoiCuaTuScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private nearestInteractable: any = null;
  private explorationGuide?: RegionalExplorerGuide;

  constructor() {
    super({ key: 'SuoiCuaTuScene' });
  }

  create() {
    const save = initializeRegionSystems('suoi_cua_tu');
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('Suối Cửa Tử');
    UIManager.getInstance().updateHUDQuest();

    const savedPosition = save.regionProgress?.suoi_cua_tu?.player;
    this.player = new Player(this, savedPosition?.x ?? 180, savedPosition?.y ?? 520);
    if (savedPosition?.dir) this.player.setDirection(savedPosition.dir);
    this.createEnvironment();
    this.createNPCs();
    const stops: ExplorationStop[] = [
      { id: 'start', label: 'Trạm xuất phát', x: 180, y: 520 },
      { id: 'gear', label: 'Bàn hành trang', x: 340, y: 475 },
      { id: 'weather', label: 'Điểm đọc tình huống thời tiết', x: 610, y: 450 },
      { id: 'stream-trail', label: 'Chặng ven suối', x: 480, y: 380 },
      { id: 'rest', label: 'Điểm nghỉ', x: 245, y: 290 },
      { id: 'viewpoint', label: 'Điểm ngắm thác', x: 730, y: 220 }
    ];
    this.explorationGuide = new RegionalExplorerGuide(this, 'suoi_cua_tu', 'Suối Cửa Tử', stops, () => this.player, () => QuestManager.getInstance().getCurrentObjectiveText(), stop => {
      this.player.setPosition(stop.x, stop.y + 34);
      persistRegionCheckpoint('suoi_cua_tu', { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }, stop.id);
    });

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.35);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    UIManager.getInstance().setOnTravelCallback((regionId) => {
      transitionToRegion(this, 'suoi_cua_tu', regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => persistRegionCheckpoint('suoi_cua_tu', { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }));

    setTimeout(() => {
      UIManager.getInstance().showToast('🌊 Bạn đã đến Thiên đường Trekking Suối Cửa Tử!');
    }, 400);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Forest Banks (Left & Right)
    for (let y = 0; y < this.mapHeight; y += 16) {
      for (let x = 0; x < this.mapWidth; x += 16) {
        if (x < 300 || x > 660) {
          this.add.image(x + 8, y + 8, 'env_tileset', 0).setDepth(-100);
        } else {
          // Rushing Mountain River (Suối Cửa Tử)
          this.add.image(x + 8, y + 8, 'env_tileset', 4).setDepth(-90);
        }
      }
    }

    // Granite River Boulders forming stepping path across stream
    const boulderPositions = [
      { x: 340, y: 380 }, { x: 420, y: 340 }, { x: 500, y: 360 }, { x: 580, y: 320 },
      { x: 380, y: 480 }, { x: 480, y: 460 }, { x: 580, y: 500 }
    ];

    boulderPositions.forEach(pos => {
      const boulder = this.add.image(pos.x, pos.y, 'river_boulder').setScale(1.3);
      boulder.setDepth(pos.y);
    });

    // Waterfall cascade at top of river gorge
    for (let wy = 60; wy < 180; wy += 20) {
      for (let wx = 320; wx < 640; wx += 40) {
        const drop = this.add.text(wx, wy, '💧', { fontSize: '18px' }).setDepth(wy);
        this.tweens.add({
          targets: drop,
          y: wy + 25,
          alpha: { start: 1, end: 0.2 },
          duration: 400,
          repeat: -1
        });
      }
    }

    // Scenic Viewpoint Banner on Far Bank
    const viewpoint = this.add.rectangle(780, 260, 160, 60, 0x1D3B2B);
    viewpoint.setDepth(260);
    this.add.text(780, 260, '🏔️ ĐỈNH THÁC CỬA TỬ\n(Góc Nhìn Tam Đảo)', {
      fontSize: '11px',
      color: '#F4C978',
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(270);
  }

  private createNPCs() {
    const npcConfig: INPCConfig = {
      id: 'npc_trekker',
      name: 'Anh Hùng',
      role: 'Trưởng đoàn Trekking Cửa Tử',
      avatar: '🌊',
      x: 240,
      y: 420,
      textureKey: 'npc_guide_sheet',
      startDialogueId: 'hung_trek_intro'
    };

    const npc = new NPC(this, npcConfig);
    this.npcs.push(npc);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const isUIBlocking = UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen();
    this.player.setControlActive(!isUIBlocking);
    this.player.update(time, delta);
    this.explorationGuide?.update();

    let nearby = false;
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < 54) {
        nearby = true;
        this.nearestInteractable = npc;
        UIManager.getInstance().showPrompt(`Nhấn [E] để nói chuyện với ${npc.config.name}`);
        npc.setPlayerNearby(true);
      } else {
        npc.setPlayerNearby(false);
      }
    }

    if (!nearby) {
      this.nearestInteractable = null;
      UIManager.getInstance().hidePrompt();
    }

    if (!isUIBlocking && (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey))) {
      if (this.nearestInteractable) {
        this.handleNPCInteraction(this.nearestInteractable);
      }
    }
  }

  private handleNPCInteraction(npc: NPC) {
    AudioManager.getInstance().playClick();
    const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_suoi_cua_tu');
    const startNode = isCompleted ? 'hung_trek_done' : 'hung_trek_intro';

    UIManager.getInstance().startDialogue(startNode, (action, payload) => {
      if (action === 'openMinigame' && payload === 'river_crossing') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openMiniGame('river_crossing', () => {
          ProgressionService.completeObjective('quest_suoi_cua_tu', 'obj_cross_river', 'suoi_cua_tu');
          UIManager.getInstance().updateHUDQuest();
          this.handleNPCInteraction(npc);
        });
      } else if (action === 'openDestCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('suoi_cua_tu');
      }
    });
  }

  private travelToRegion(regionId: string) {
    transitionToRegion(this, 'suoi_cua_tu', regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
  }
}
