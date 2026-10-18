import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { INPCConfig } from '../types/game';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { InventoryManager } from '../systems/InventoryManager';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';

export class HoNuiCocScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private nearestInteractable: any = null;

  constructor() {
    super({ key: 'HoNuiCocScene' });
  }

  create() {
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('Hồ Núi Cốc');
    UIManager.getInstance().updateHUDQuest();

    this.player = new Player(this, 240, 420);
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
      UIManager.getInstance().showToast('💧 Bạn đã đến Khu du lịch sinh thái Hồ Núi Cốc!');
    }, 400);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Lake Shore Grass (Bottom/Left)
    for (let y = 0; y < this.mapHeight; y += 16) {
      for (let x = 0; x < this.mapWidth; x += 16) {
        if (x < 380 || y > 560) {
          this.add.image(x + 8, y + 8, 'env_tileset', 0).setDepth(-100);
        } else {
          // Vast Lake Water
          this.add.image(x + 8, y + 8, 'env_tileset', 4).setDepth(-90);
        }
      }
    }

    // Wooden Pier / Dock extending into the water
    for (let px = 340; px < 560; px += 16) {
      for (let py = 360; py < 400; py += 16) {
        this.add.image(px + 8, py + 8, 'env_tileset', 6).setDepth(-80);
      }
    }

    // Moored Boat at Pier
    const boat = this.add.image(580, 380, 'boat_sprite');
    boat.setDepth(380);

    // Lake Islands in the distance
    const island1 = this.add.circle(720, 200, 45, 0x355C46);
    island1.setDepth(-85);
    this.add.circle(720, 200, 42, 0x638B45).setDepth(-84);

    const island2 = this.add.circle(820, 360, 50, 0x355C46);
    island2.setDepth(-85);
    this.add.circle(820, 360, 47, 0x638B45).setDepth(-84);

    // Ambient floating water ripples
    for (let i = 0; i < 6; i++) {
      const ripple = this.add.image(
        Phaser.Math.Between(420, 900),
        Phaser.Math.Between(100, 500),
        'env_tileset',
        4
      ).setDepth(-70).setAlpha(0.6);

      this.tweens.add({
        targets: ripple,
        x: ripple.x + 20,
        alpha: { start: 0.6, end: 0.1 },
        duration: 3000,
        repeat: -1,
        yoyo: true
      });
    }

    // Direction signpost back to Tan Cuong or to ATK
    const sign = this.add.rectangle(120, 520, 30, 40, 0x5E3A26);
    sign.setDepth(520);
    this.add.text(120, 490, '⬅ Về Tân Cương | ➡ Sang ATK', {
      fontSize: '11px',
      color: '#FFF2D5',
      backgroundColor: '#1D3B2B',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setDepth(600);
  }

  private createNPCs() {
    const npcConfig: INPCConfig = {
      id: 'npc_ngu_ong',
      name: 'Lão Ngư Bến Hồ',
      role: 'Người kể chuyện Hồ Núi Cốc',
      avatar: '🛶',
      x: 360,
      y: 350,
      textureKey: 'npc_fisherman_sheet',
      startDialogueId: 'ngu_ong_intro'
    };

    const npc = new NPC(this, npcConfig);
    this.npcs.push(npc);
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    const isUIBlocking = UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen();
    this.player.setControlActive(!isUIBlocking);
    this.player.update(time, delta);

    // Check NPC interaction
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
    const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_ho_nui_coc');
    const startNode = isCompleted ? 'ngu_ong_done' : 'ngu_ong_intro';

    UIManager.getInstance().startDialogue(startNode, (action, payload) => {
      if (action === 'openMinigame' && payload === 'lake_legend') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openMiniGame('lake_legend', () => {
          this.handleNPCInteraction(npc);
        });
      } else if (action === 'openDestCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('ho_nui_coc');
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
    if (targetScene && targetScene !== 'HoNuiCocScene') {
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
