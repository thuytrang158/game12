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

export class AtkDinhHoaScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private nearestInteractable: any = null;
  private explorationGuide?: RegionalExplorerGuide;

  constructor() {
    super({ key: 'AtkDinhHoaScene' });
  }

  create() {
    const save = initializeRegionSystems('atk_dinh_hoa');
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('ATK Định Hóa');
    UIManager.getInstance().updateHUDQuest();

    const savedPosition = save.regionProgress?.atk_dinh_hoa?.player;
    this.player = new Player(this, savedPosition?.x ?? 480, savedPosition?.y ?? 520);
    if (savedPosition?.dir) this.player.setDirection(savedPosition.dir);
    this.createEnvironment();
    this.createNPCs();
    const stops: ExplorationStop[] = [
      { id: 'welcome', label: 'Khu đón tiếp', x: 360, y: 520 },
      { id: 'exhibition', label: 'Nhà trưng bày', x: 480, y: 260 },
      { id: 'tin-keo', label: 'Điểm diễn giải Tỉn Keo', x: 680, y: 320 },
      { id: 'khuon-tat', label: 'Điểm diễn giải Khuôn Tát', x: 250, y: 305 },
      { id: 'forest', label: 'Đường rừng ký ức', x: 770, y: 530 },
      { id: 'journal', label: 'Bàn hoàn thiện sổ', x: 480, y: 590 }
    ];
    this.explorationGuide = new RegionalExplorerGuide(this, 'atk_dinh_hoa', 'ATK Định Hóa', stops, () => this.player, () => QuestManager.getInstance().getCurrentObjectiveText(), stop => {
      this.player.setPosition(stop.x, stop.y + 38);
      persistRegionCheckpoint('atk_dinh_hoa', { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }, stop.id);
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
      transitionToRegion(this, 'atk_dinh_hoa', regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => persistRegionCheckpoint('atk_dinh_hoa', { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }));

    setTimeout(() => {
      UIManager.getInstance().showToast('⭐ Bạn đã đến Di tích quốc gia đặc biệt ATK Định Hóa!');
    }, 400);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Forest Grass Ground
    for (let y = 0; y < this.mapHeight; y += 16) {
      for (let x = 0; x < this.mapWidth; x += 16) {
        this.add.image(x + 8, y + 8, 'env_tileset', 0).setDepth(-100);
      }
    }

    // Cobblestone / Stone path in historical area
    for (let py = 380; py < 620; py += 16) {
      for (let px = 440; px < 520; px += 16) {
        this.add.image(px + 8, py + 8, 'env_tileset', 7).setDepth(-80);
      }
    }

    // Bamboo Grove Borders (Tile 10)
    for (let x = 20; x < this.mapWidth - 20; x += 32) {
      this.add.image(x, 50, 'env_tileset', 10).setDepth(50);
      this.add.image(x, 100, 'env_tileset', 10).setDepth(100);
    }

    // Historical Lán Khuôn Tát / Stilt House with Red Flag
    const stiltHouse = this.add.image(480, 220, 'stilt_house_atk').setScale(1.5);
    stiltHouse.setDepth(220);

    // Stone Memorial Monument
    const monument = this.add.rectangle(680, 320, 40, 60, 0x8C8C8C);
    monument.setDepth(320);
    this.add.text(680, 280, '⭐ BIA DI TÍCH ĐỒI TỈN KEO', {
      fontSize: '10px',
      color: '#F4C978',
      backgroundColor: '#1D3B2B',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(500);

    // Leaves falling
    this.add.particles(0, 0, 'leaf_particle', {
      x: { min: 0, max: this.mapWidth },
      y: -20,
      lifespan: 8000,
      speedY: { min: 25, max: 60 },
      frequency: 300
    });
  }

  private createNPCs() {
    const npcConfig: INPCConfig = {
      id: 'npc_huong_dan_vien',
      name: 'Chị Lan',
      role: 'Thuyết minh viên di tích ATK',
      avatar: '⭐',
      x: 440,
      y: 350,
      textureKey: 'npc_guide_sheet',
      startDialogueId: 'lan_atk_intro'
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
    const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_atk_dinh_hoa');
    const startNode = isCompleted ? 'lan_atk_done' : 'lan_atk_intro';

    UIManager.getInstance().startDialogue(startNode, (action, payload) => {
      if (action === 'openMinigame' && payload === 'atk_timeline') {
        UIManager.getInstance().closeDialogue();
        ProgressionService.completeObjective('quest_atk_dinh_hoa', 'obj_meet_historian', 'atk_dinh_hoa');
        UIManager.getInstance().openMiniGame('atk_timeline', () => {
          ProgressionService.completeObjective('quest_atk_dinh_hoa', 'obj_timeline_puzzle', 'atk_dinh_hoa');
          UIManager.getInstance().updateHUDQuest();
          this.handleNPCInteraction(npc);
        });
      } else if (action === 'openDestCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('atk_dinh_hoa');
      }
    });
  }

  private travelToRegion(regionId: string) {
    transitionToRegion(this, 'atk_dinh_hoa', regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
  }
}
