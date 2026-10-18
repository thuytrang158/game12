import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { INPCConfig } from '../types/game';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { AudioManager } from '../systems/AudioManager';

export class HangPhuongHoangScene extends Phaser.Scene {
  private player!: Player;
  private npcs: NPC[] = [];
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private nearestInteractable: any = null;

  constructor() {
    super({ key: 'HangPhuongHoangScene' });
  }

  create() {
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('Hang Phượng Hoàng');
    UIManager.getInstance().updateHUDQuest();

    this.player = new Player(this, 480, 500);
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
      UIManager.getInstance().showToast('🦅 Bạn đã bước vào Thắng cảnh quốc gia Hang Phượng Hoàng!');
    }, 400);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // Dark Cavern Floor
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1A202C, 1);
    bgGraphics.fillRect(0, 0, this.mapWidth, this.mapHeight);
    bgGraphics.setDepth(-100);

    // Underground Stream (Suối Mỏ Gà) cutting across
    for (let sy = 560; sy < 620; sy += 16) {
      for (let sx = 0; sx < this.mapWidth; sx += 16) {
        this.add.image(sx + 8, sy + 8, 'env_tileset', 4).setDepth(-80);
      }
    }

    // Wooden Bridge across cave stream
    for (let bx = 450; bx < 510; bx += 16) {
      for (let by = 550; by < 630; by += 16) {
        this.add.image(bx + 8, by + 8, 'env_tileset', 6).setDepth(-70);
      }
    }

    // Stalactite Formations & Cave Rocks
    const rockPositions = [
      { x: 180, y: 180 }, { x: 320, y: 150 }, { x: 620, y: 160 }, { x: 780, y: 220 },
      { x: 220, y: 360 }, { x: 740, y: 380 }
    ];

    rockPositions.forEach(pos => {
      const rock = this.add.image(pos.x, pos.y, 'cavern_rock').setScale(1.4);
      rock.setDepth(pos.y);
    });

    // Central Stone Phoenix Altar (Phượng Hoàng Hóa Đá)
    const altar = this.add.circle(480, 240, 36, 0x4A5568);
    altar.setDepth(235);
    this.add.text(480, 240, '🦅', { fontSize: '32px' }).setOrigin(0.5).setDepth(240);

    // Glowing Cave Torches
    const torchLeft = this.add.text(420, 240, '🔥', { fontSize: '20px' }).setOrigin(0.5).setDepth(240);
    const torchRight = this.add.text(540, 240, '🔥', { fontSize: '20px' }).setOrigin(0.5).setDepth(240);
    this.tweens.add({
      targets: [torchLeft, torchRight],
      scale: 1.2,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  private createNPCs() {
    const npcConfig: INPCConfig = {
      id: 'npc_kiem_lam',
      name: 'Anh Dũng',
      role: 'Kiểm lâm & Nhà thám hiểm hang',
      avatar: '🦅',
      x: 440,
      y: 320,
      textureKey: 'npc_guide_sheet',
      startDialogueId: 'dung_cave_intro'
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
    const isCompleted = QuestManager.getInstance().isQuestCompleted('quest_hang_phuong_hoang');
    const startNode = isCompleted ? 'dung_cave_done' : 'dung_cave_intro';

    UIManager.getInstance().startDialogue(startNode, (action, payload) => {
      if (action === 'openMinigame' && payload === 'cave_light') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openMiniGame('cave_light', () => {
          this.handleNPCInteraction(npc);
        });
      } else if (action === 'openDestCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('hang_phuong_hoang');
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
    if (targetScene && targetScene !== 'HangPhuongHoangScene') {
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
