import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { INPCConfig } from '../types/game';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';

export class AtkDinhHoaScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private nearestInteractable: any = null;

  constructor() {
    super({ key: 'AtkDinhHoaScene' });
  }

  create() {
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('ATK Định Hóa');
    UIManager.getInstance().updateHUDQuest();

    this.player = new Player(this, 480, 520);
    this.createEnvironment();
    this.createNPCs();

    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.35);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    UIManager.getInstance().setOnTravelCallback((regionId) => {
      this.travelToRegion(regionId);
    });

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
        UIManager.getInstance().openMiniGame('atk_timeline', () => {
          this.handleNPCInteraction(npc);
        });
      } else if (action === 'openDestCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('atk_dinh_hoa');
      }
    });
  }

  private travelToRegion(regionId: string) {
    const sceneMap: Record<string, string> = {
      tan_cuong: 'TanCuongScene',
      ho_nui_coc: 'HoNuiCocScene',
      atk_dinh_hoa: 'AtkDinhHoaScene',
      hang_phuong_hoang: 'HangPhuongHoangScene',
      suoi_cua_tu: 'SuoiCuaTuScene'
    };

    const targetScene = sceneMap[regionId];
    if (targetScene && targetScene !== 'AtkDinhHoaScene') {
      let started = false;
      const launch = () => {
        if (started) return;
        started = true;
        this.scene.start(targetScene);
      };
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', launch);
      this.time.delayedCall(400, launch);
    }
  }
}
