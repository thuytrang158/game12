import Phaser from 'phaser';
import { VillageGuide, VILLAGE_STOPS } from '../ui/VillageGuide';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { INPCConfig } from '../types/game';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { InventoryManager } from '../systems/InventoryManager';
import { SaveManager } from '../systems/SaveManager';
import { AudioManager } from '../systems/AudioManager';
import { transitionToRegion } from '../systems/RegionRegistry';
import { ProgressionService } from '../systems/ProgressionService';

interface IAmbientWorker {
  id: string;
  name: string;
  role: string;
  quote: string;
  sprite: Phaser.GameObjects.Sprite;
  patrol?: { startX: number; endX: number; speed: number; dir: number };
}

export class TanCuongScene extends Phaser.Scene {
  private player!: Player;
  private villageGuide?: VillageGuide;
  private touchControls?: AbortController;
  private npcs: NPC[] = [];
  private ambientWorkers: IAmbientWorker[] = [];
  private interactiveBushes: Phaser.GameObjects.Sprite[] = [];
  private nearestInteractable: {
    type: 'npc' | 'bush' | 'ambient_worker' | 'pavilion' | 'workshop' | 'nursery';
    target: any;
  } | null = null;

  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escapeKey!: Phaser.Input.Keyboard.Key;
  private mapWidth = 960;
  private mapHeight = 720;
  private autoSaveTimer: number = 0;

  // Scenic Pavilion and Sunset State
  private isPlayerSeated: boolean = false;
  private isSunsetActive: boolean = false;
  private sunsetOverlay: Phaser.GameObjects.Graphics | null = null;
  private sunsetParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private cinematicBacLamOriginalPosition: { x: number; y: number } | null = null;

  constructor() {
    super({ key: 'TanCuongScene' });
  }

  create(data: { isNewGame?: boolean }) {
    this.isPlayerSeated = false;
    this.isSunsetActive = false;
    this.sunsetOverlay = null;
    this.sunsetParticles = null;
    this.cinematicBacLamOriginalPosition = null;
    this.nearestInteractable = null;
    this.autoSaveTimer = 0;
    // 1. Initialize systems from SaveManager
    const saveData = SaveManager.getInstance().load();
    QuestManager.getInstance().init(
      saveData.quests,
      saveData.activeQuestId,
      saveData.completedQuestIds
    );
    InventoryManager.getInstance().init(saveData.inventory);

    // 2. Setup HUD
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName('Đồi chè Tân Cương');
    UIManager.getInstance().updateHUDQuest();

    // 3. Create Player (Must be created before colliders)
    const isNew = data?.isNewGame ?? true;
    const spawnX = isNew ? 480 : (saveData.playerCoords?.x || 480);
    const spawnY = isNew ? 360 : (saveData.playerCoords?.y || 360);
    this.player = new Player(this, spawnX, spawnY);

    // 4. Build Map & Environment
    this.createMapEnvironment();

    // 5. Create NPCs & Ambient Workers
    this.createNPCs();
    this.createAmbientWorkers();

    // 6. Camera setup
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.05);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // 7. Input keys
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    // 8. Bind touch / mobile controls
    this.bindTouchControls();

    // 9. Ambient Environmental Effects (Breeze leaves, butterflies, smoke, tea steam)
    this.createAmbientEffects();

    // 10. Travel callback for World Map fast travel
    UIManager.getInstance().setOnTravelCallback((regionId) => {
      this.travelToRegion(regionId);
    });

    this.villageGuide = new VillageGuide((x, y) => {
      if (this.isSunsetActive) return;
      this.standUpFromPavilion();
      this.player.setVirtualMovement(0, 0);
      this.player.setPosition(x, y);
      this.player.setVelocity(0, 0);
      this.cameras.main.fadeIn(300);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.villageGuide?.destroy();
      this.touchControls?.abort();
      UIManager.getInstance().hidePrompt();
    });
    this.createVillageLandmarks();
    // Intro toast for player
    this.time.delayedCall(500, () => {
      UIManager.getInstance().showToast('🍃 Chào mừng bạn đến với Làng Chè Tân Cương thơ mộng!');
    });
  }

  private travelToRegion(regionId: string) {
    transitionToRegion(this, 'tan_cuong', regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
  }

  private createMapEnvironment() {
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // 1. Distant Mountain Silhouette Backdrop (Tam Đảo Range sheltering Tân Cương)
    for (let mx = 0; mx < this.mapWidth; mx += 320) {
      this.add.image(mx + 160, 32, 'mountain_backdrop').setDepth(-98).setAlpha(0.9);
    }

    // 2. Base Grass Ground (Tile 0)
    this.add.tileSprite(this.mapWidth / 2, this.mapHeight / 2, this.mapWidth, this.mapHeight, 'env_tileset', 0).setDepth(-100);

    // 3. Bamboo Grove along the northern ridge (Tile 10)
    for (let x = 20; x < 940; x += 32) {
      this.add.image(x, 48, 'env_tileset', 10).setDepth(48);
    }

    // 4. River Stream (Sông Công) along the southern edge (Tile 4)
    const riverY = 590;
    for (let rx = 0; rx < this.mapWidth; rx += 16) {
      for (let ry = riverY; ry < riverY + 80; ry += 16) {
        this.add.image(rx + 8, ry + 8, 'env_tileset', 4).setDepth(-80);
      }
    }

    // 5. Wooden Bridge across River (Tile 6)
    for (let bx = 450; bx < 510; bx += 16) {
      for (let by = riverY - 10; by < riverY + 90; by += 16) {
        this.add.image(bx + 8, by + 8, 'env_tileset', 6).setDepth(-70);
      }
    }

    // 6. Central Stone-Paved Country Path (leading from Bridge up to Scenic Tea Pavilion)
    for (let py = 160; py < riverY; py += 16) {
      for (let px = 450; px < 510; px += 16) {
        const tileIdx = (py % 32 === 0) ? 7 : 2; // Mixed flagstone steps & compacted earth
        this.add.image(px + 8, py + 8, 'env_tileset', tileIdx).setDepth(-75);
      }
    }

    // 7. Horizontal Terrace Pathways
    // Path toward Nursery Shop (West)
    for (let px = 160; px < 450; px += 16) {
      for (let py = 450; py < 482; py += 16) {
        this.add.image(px + 8, py + 8, 'env_tileset', 2).setDepth(-75);
      }
    }
    // Path toward Tea Workshop & Bác Lâm (East)
    for (let px = 510; px < 820; px += 16) {
      for (let py = 180; py < 212; py += 16) {
        this.add.image(px + 8, py + 8, 'env_tileset', 2).setDepth(-75);
      }
    }
    // Mid-terrace walkway crossing
    for (let px = 180; px < 780; px += 16) {
      for (let py = 320; py < 340; py += 16) {
        this.add.image(px + 8, py + 8, 'env_tileset', 2).setDepth(-75);
      }
    }

    // Static Obstacles Group for Physics Collisions
    const staticGroup = this.physics.add.staticGroup();

    // River Colliders (except bridge opening: 440 to 520)
    const leftRiverBank = this.add.rectangle(220, riverY + 40, 440, 70);
    this.physics.add.existing(leftRiverBank, true);
    staticGroup.add(leftRiverBank);

    const rightRiverBank = this.add.rectangle(740, riverY + 40, 440, 70);
    this.physics.add.existing(rightRiverBank, true);
    staticGroup.add(rightRiverBank);

    // North border wall to prevent walking off mountains
    const northWall = this.add.rectangle(480, 50, 960, 20);
    this.physics.add.existing(northWall, true);
    staticGroup.add(northWall);

    // Wooden Signpost near Bridge
    const signpost = this.add.rectangle(535, 530, 20, 28, 0x5E3A26);
    signpost.setDepth(530);
    const signText = this.add.text(535, 505, '🗺️ BIỂN CHỈ ĐƯỜNG\n[Mở Bản Đồ M]', {
      fontSize: '10px',
      color: '#F4C978',
      backgroundColor: '#1D3B2B',
      padding: { x: 4, y: 2 },
      align: 'center'
    }).setOrigin(0.5).setDepth(600).setInteractive({ useHandCursor: true });

    signText.on('pointerdown', () => {
      if (UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen()) {
        return;
      }
      UIManager.getInstance().openWorldMap();
    });

    // =========================================================================
    // LANDMARK 1: Chòi Thưởng Trà Tân Cương (Scenic Tea Pavilion) - North-Center
    // =========================================================================
    const pavilion = this.add.image(480, 125, 'tea_pavilion');
    pavilion.setDepth(125);

    // Pavilion Side and Back Colliders (Leaving front steps & table accessible)
    const pavLeftCol = this.add.rectangle(438, 120, 14, 38);
    this.physics.add.existing(pavLeftCol, true);
    staticGroup.add(pavLeftCol);

    const pavRightCol = this.add.rectangle(522, 120, 14, 38);
    this.physics.add.existing(pavRightCol, true);
    staticGroup.add(pavRightCol);

    const pavBackCol = this.add.rectangle(480, 96, 76, 16);
    this.physics.add.existing(pavBackCol, true);
    staticGroup.add(pavBackCol);

    // Steaming Teapot Particle effect on low table (480, 134)
    this.add.particles(480, 134, 'leaf_particle', {
      lifespan: 1600,
      speedY: { min: -10, max: -24 },
      speedX: { min: -3, max: 3 },
      scale: { start: 0.4, end: 1.1 },
      alpha: { start: 0.5, end: 0 },
      tint: 0xFFFFFF,
      frequency: 600
    }).setDepth(140);

    // =========================================================================
    // LANDMARK 2: Traditional Country House (Nhà Ngói Bắc Bộ) - North-West
    // =========================================================================
    const house = this.add.image(180, 135, 'traditional_house');
    house.setDepth(135);
    const houseCollider = this.add.rectangle(180, 145, 80, 40);
    this.physics.add.existing(houseCollider, true);
    staticGroup.add(houseCollider);

    // Water Jar & Bamboo Fences near House
    this.add.image(130, 155, 'water_jar_prop').setDepth(155);
    this.add.image(140, 175, 'bamboo_fence_prop').setDepth(175);
    this.add.image(220, 175, 'bamboo_fence_prop').setDepth(175);

    // =========================================================================
    // LANDMARK 3: Enhanced Tea Processing Workshop (Nhà Sao Chè) - North-East
    // =========================================================================
    const workshop = this.add.image(740, 145, 'tea_workshop_enhanced');
    workshop.setDepth(145);
    const workshopCollider = this.add.rectangle(740, 155, 78, 38);
    this.physics.add.existing(workshopCollider, true);
    staticGroup.add(workshopCollider);

    // Chimney Smoke Particles
    this.add.particles(712, 115, 'leaf_particle', {
      lifespan: 2500,
      speedY: { min: -18, max: -35 },
      speedX: { min: -5, max: 8 },
      scale: { start: 0.8, end: 1.8 },
      alpha: { start: 0.45, end: 0 },
      tint: 0xE0E0E0,
      frequency: 450
    }).setDepth(200);

    // Glowing warm fire flicker at wood-fired stove
    const fireGlow = this.add.circle(730, 168, 8, 0xFF7700, 0.55).setDepth(169);
    this.tweens.add({
      targets: fireGlow,
      alpha: 0.25,
      scale: 1.3,
      duration: 350,
      yoyo: true,
      repeat: -1
    });

    // Workshop Props: Bamboo drying trays & fresh baskets
    this.add.image(690, 185, 'tea_drying_tray').setDepth(185);
    this.add.image(795, 190, 'tea_drying_tray').setDepth(190);
    this.add.image(725, 180, 'tea_basket_prop').setDepth(180);
    this.add.image(755, 180, 'tea_basket_prop').setDepth(180);
    this.add.image(770, 165, 'water_jar_prop').setDepth(165);

    // =========================================================================
    // LANDMARK 4: Enhanced Nursery Shop (Vườn Giống Cô Hương) - South-West
    // =========================================================================
    const nursery = this.add.image(230, 435, 'shop_nursery_enhanced');
    nursery.setDepth(435);
    const nurseryCollider = this.add.rectangle(230, 442, 80, 28);
    this.physics.add.existing(nurseryCollider, true);
    staticGroup.add(nurseryCollider);

    // Fencing & garden border around Nursery Shop
    this.add.image(150, 465, 'bamboo_fence_prop').setDepth(465);
    this.add.image(310, 465, 'bamboo_fence_prop').setDepth(465);
    this.add.image(325, 435, 'tea_drying_tray').setDepth(435);

    // =========================================================================
    // NATURALLY ARRANGED DENSE TEA PLANTATIONS & TERRACES
    // =========================================================================
    this.interactiveBushes = [];

    // Distinct terraced rows with elevation shading
    const terraceRows = [
      // Upper West Terrace
      { y: 225, startX: 90, endX: 410, step: 32 },
      { y: 265, startX: 100, endX: 410, step: 32 },
      { y: 305, startX: 90, endX: 410, step: 32 },
      // Upper East Terrace
      { y: 225, startX: 550, endX: 870, step: 32 },
      { y: 265, startX: 550, endX: 860, step: 32 },
      { y: 305, startX: 550, endX: 870, step: 32 },
      // Lower West Terrace
      { y: 350, startX: 90, endX: 410, step: 32 },
      { y: 395, startX: 90, endX: 410, step: 32 },
      // Lower East Terrace
      { y: 350, startX: 550, endX: 860, step: 32 },
      { y: 395, startX: 550, endX: 870, step: 32 }
    ];

    const bushVariantKeys = [
      'tea_bush_standard',
      'tea_bush_dense',
      'tea_bush_young',
      'tea_bush_flowering'
    ];

    terraceRows.forEach((row, rowIndex) => {
      // Draw terraced contour shadow underneath each row
      for (let tx = row.startX - 10; tx <= row.endX + 10; tx += 16) {
        this.add.image(tx, row.y + 12 - Math.sin((tx-row.startX)/(row.endX-row.startX)*Math.PI)*13, 'env_tileset', 1).setDepth(-85);
      }

      for (let bx = row.startX; bx <= row.endX; bx += row.step) {
        // Deterministic bush variant selection
        const variantKey = bushVariantKeys[(Math.floor((bx-row.startX)/row.step) + rowIndex) % 4];
        const contourY = row.y - Math.sin((bx - row.startX) / (row.endX - row.startX) * Math.PI) * 13;
        const bush = this.add.sprite(bx, contourY, variantKey);
        bush.setDepth(contourY);
        bush.setInteractive({ useHandCursor: true });

        // Pointer click on bush: respects UI state & proximity
        bush.on('pointerdown', () => {
          if (UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen()) {
            return;
          }
          if (!this.player) return;
          const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, bush.x, bush.y);
          if (dist > 55) {
            UIManager.getInstance().showToast('🍃 Hãy tiến lại gần nương chè để tương tác nhé!');
            return;
          }
          this.handleTeaBushInteraction();
        });

        // Subtle leaf sway on a curated portion of bushes
        if ((bx + rowIndex) % 3 === 0) {
          this.tweens.add({
            targets: bush,
            scaleY: 1.03,
            duration: 2000 + (bx % 600),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }

        this.interactiveBushes.push(bush);
      }
    });

    // Scattered Harvesting Baskets & Props along rows
    this.add.image(415, 265, 'tea_basket_prop').setDepth(265);
    this.add.image(545, 305, 'tea_basket_prop').setDepth(305);
    this.add.image(865, 350, 'tea_basket_prop').setDepth(350);
    this.add.image(115, 395, 'tea_basket_prop').setDepth(395);
    this.add.image(525, 145, 'water_jar_prop').setDepth(145);

    // Wildflowers & River Stones details
    const flowerCoords = [
      { x: 120, y: 490 }, { x: 380, y: 520 }, { x: 650, y: 530 },
      { x: 790, y: 510 }, { x: 440, y: 560 }, { x: 530, y: 565 }
    ];
    flowerCoords.forEach(c => {
      this.add.image(c.x, c.y, 'env_tileset', 8).setDepth(-80);
    });

    // Add collision between player and static obstacles
    this.physics.add.collider(this.player, staticGroup);
  }

  private createNPCs() {
    const npcConfigs: INPCConfig[] = [
      {
        id: 'npc_bac_lam',
        name: 'Bác Lâm',
        role: 'Nghệ nhân chè Tân Cương',
        avatar: '👨‍🌾',
        x: 680,
        y: 205,
        textureKey: 'npc_artisan_sheet',
        startDialogueId: 'bac_lam_intro'
      },
      {
        id: 'npc_co_huong',
        name: 'Cô Hương',
        role: 'Chủ Vườn Giống & Vật Tư Xứ Trà',
        avatar: '👩‍🌾',
        x: 230,
        y: 475,
        textureKey: 'npc_shopkeeper_sheet',
        startDialogueId: 'co_huong_intro'
      },
      {
        id: 'npc_mai',
        name: 'Bé Mai',
        role: 'Thợ hái chè thoăn thoắt',
        avatar: '👧',
        x: 340,
        y: 330,
        textureKey: 'npc_picker_sheet',
        startDialogueId: 'mai_intro'
      },
      {
        id: 'npc_tuan',
        name: 'Chú Tuấn',
        role: 'Đại sứ du lịch Thái Nguyên',
        avatar: '🧑‍💼',
        x: 530,
        y: 490,
        textureKey: 'npc_guide_sheet',
        startDialogueId: 'tuan_intro'
      }
    ];

    this.npcs = npcConfigs.map(config => {
      const npc = new NPC(this, config);
      this.physics.add.collider(this.player, npc);
      return npc;
    });
  }

  private createAmbientWorkers() {
    this.ambientWorkers = [];

    // Worker 1: Bác Tám – Thợ Hái Chè (West Upper Terrace)
    const tamSprite = this.add.sprite(250, 265, 'worker_picker_sheet');
    tamSprite.play('worker_picker_anim');
    tamSprite.setDepth(265);
    this.physics.add.existing(tamSprite, true);
    this.physics.add.collider(this.player, tamSprite);

    this.ambientWorkers.push({
      id: 'worker_tam',
      name: 'Bác Tám',
      role: 'Thợ hái chè',
      quote: 'Mỗi sáng sớm khi sương mai chưa tan hết là lúc búp chè ngậm trọn tinh hoa của đất trời đấy cháu!',
      sprite: tamSprite
    });

    // Worker 2: Anh Hải – Người Gánh Chè (Patrols along East path)
    const haiSprite = this.add.sprite(620, 320, 'worker_carrier_sheet');
    haiSprite.play('worker_carrier_anim');
    haiSprite.setDepth(320);

    this.ambientWorkers.push({
      id: 'worker_hai',
      name: 'Anh Hải',
      role: 'Người gánh chè',
      quote: 'Mẻ chè non vừa hái xong, phải gánh nhanh về chòi để Bác Lâm kịp làm héo và sao lửa mới giữ được hương cốm!',
      sprite: haiSprite,
      patrol: { startX: 590, endX: 720, speed: 28, dir: 1 }
    });

    // Worker 3: Chị Lan – Thợ Chọn Búp (East Terrace)
    const lanSprite = this.add.sprite(740, 365, 'worker_picker_sheet');
    lanSprite.play('worker_picker_anim');
    lanSprite.setDepth(365);
    this.physics.add.existing(lanSprite, true);
    this.physics.add.collider(this.player, lanSprite);

    this.ambientWorkers.push({
      id: 'worker_lan',
      name: 'Chị Lan',
      role: 'Thợ chọn búp non',
      quote: 'Hái chè phải nâng niu từng búp, đúng chuẩn "1 tôm 2 lá" không được dập nát thì nước trà mới trong xanh thơm ngát!',
      sprite: lanSprite
    });

    // Worker 4: Bác Ba – Người Hong Chè (Processing Workshop Drying Trays)
    const baSprite = this.add.sprite(785, 190, 'worker_sorter_sheet');
    baSprite.play('worker_sorter_anim');
    baSprite.setDepth(190);
    this.physics.add.existing(baSprite, true);
    this.physics.add.collider(this.player, baSprite);

    this.ambientWorkers.push({
      id: 'worker_ba',
      name: 'Bác Ba',
      role: 'Người hong chè truyền thống',
      quote: 'Lá chè tươi sau khi hái phải rải đều trên nia tre trong bóng râm cho ráo sương mai thì khi sao chảo gang mới đượm vị!',
      sprite: baSprite
    });
  }

  private createAmbientEffects() {
    // Drifting Tea Leaves in the Breeze
    this.add.particles(0, 0, 'leaf_particle', {
      x: { min: 0, max: this.mapWidth },
      y: -20,
      lifespan: 8000,
      speedY: { min: 20, max: 55 },
      speedX: { min: -20, max: 20 },
      angle: { min: 0, max: 360 },
      rotate: { start: 0, end: 360 },
      scale: { start: 1.4, end: 0.9 },
      alpha: { start: 0.8, end: 0.2 },
      frequency: 350
    });

    // Fluttering Butterflies over tea terraces
    for (let i = 0; i < 4; i++) {
      const bf = this.add.image(
        Phaser.Math.Between(150, 800),
        Phaser.Math.Between(200, 420),
        'butterfly_particle'
      ).setScale(1.4).setDepth(800);

      this.tweens.add({
        targets: bf,
        x: bf.x + Phaser.Math.Between(-70, 70),
        y: bf.y + Phaser.Math.Between(-35, 35),
        duration: Phaser.Math.Between(2400, 3800),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private bindTouchControls() {
    this.touchControls?.abort();
    this.touchControls = new AbortController();
    const signal = this.touchControls.signal;
    document.querySelectorAll<HTMLButtonElement>('.dpad-btn').forEach(btn => {
      btn.addEventListener('pointerdown', e => {
        if (!this.scene.isActive()) return;
        e.preventDefault();
        btn.setPointerCapture(e.pointerId);
        const dir = btn.dataset.dir;
        this.player.setVirtualMovement(dir === 'left' ? -1 : dir === 'right' ? 1 : 0, dir === 'up' ? -1 : dir === 'down' ? 1 : 0);
      }, { signal });
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        btn.addEventListener(event, () => this.player?.setVirtualMovement(0, 0), { signal });
      }
    });
    document.getElementById('btn-touch-interact')?.addEventListener('click', () => {
      if (!this.scene.isActive()) return;
      if (this.isPlayerSeated) this.standUpFromPavilion();
      else this.triggerInteraction();
    }, { signal });
    window.addEventListener('blur', () => this.player?.setVirtualMovement(0, 0), { signal });
  }

  private createVillageLandmarks() {
    const g = this.add.graphics().setDepth(-90);
    // Broad, soft contours make the plantation read as connected hills.
    for (const [x,y,w,h] of [[240,285,410,290],[730,280,400,285],[720,460,360,130]]) {
      g.fillStyle(0x365d38, .18); g.fillEllipse(x,y,w,h);
      g.lineStyle(3,0xb5cb7b,.22);g.strokeEllipse(x,y-5,w-14,h-12);
    }
    // Small seedling beds beside the nursery, kept off the footpath.
    for(let row=0;row<3;row++) for(let col=0;col<5;col++) {
      const x=135+col*24,y=500+row*18;
      this.add.rectangle(x,y+5,18,12,0x765239).setDepth(y);
      this.add.image(x,y,'tea_bush_young').setScale(.55).setDepth(y+1);
    }
    // Riverside seating and a quiet courtyard.
    this.add.rectangle(610,565,72,9,0x9d7448).setDepth(565);
    this.add.rectangle(582,574,6,17,0x59412b).setDepth(574);
    this.add.rectangle(638,574,6,17,0x59412b).setDepth(574);
    VILLAGE_STOPS.forEach((stop,index) => {
      const label = this.add.text(stop.x,stop.y-30, (index+1) + ' · ' + stop.name, {
        fontFamily:'sans-serif',fontSize:'10px',color:'#fff2ce',backgroundColor:'#234634',padding:{x:6,y:4}
      }).setOrigin(.5).setDepth(800).setInteractive({useHandCursor:true});
      label.on('pointerdown',()=>{
        const ui=UIManager.getInstance();
        if(ui.isAnyModalOpen()||ui.isDialogueOpen()||this.isSunsetActive)return;
        if(Math.hypot(this.player.x-stop.x,this.player.y-stop.y)>75){ui.showToast('Hãy đến gần điểm dừng hoặc chọn điểm trong sổ khám phá.');return;}
        if(stop.id==='workshop'){this.enterTeaHouse();return;}
        const body=ui.openExhibit(stop.name,stop.tag);
        body.innerHTML='<div class="trail-intro"><span>'+stop.icon+'</span><div><h3>'+stop.name+'</h3><p>'+stop.text+'</p></div></div><button class="trail-tour">Tiếp tục khám phá →</button>';
        body.querySelector('button')!.onclick=()=>ui.closeAllModals();
      });
    });
  }

  private enterTeaHouse() {
    const ui=UIManager.getInstance();
    if(ui.isAnyModalOpen()||ui.isDialogueOpen()||this.isSunsetActive)return;
    this.performAutoSave();
    this.player.setVelocity(0,0);
    this.player.setVirtualMovement(0,0);
    this.touchControls?.abort();
    this.villageGuide?.setVisible(false);
    ui.hidePrompt();
    this.scene.pause();
    this.scene.launch('TeaHouseScene', {
      practice: () => this.handleWorkshopPractice(),
      onReturn: () => {
        this.player.setPosition(740,205);
        this.player.setDirection('down');
        this.bindTouchControls();
        this.villageGuide?.setVisible(true);
        ui.setRegionName('Đồi chè Tân Cương');
        ui.setOnTravelCallback(region => this.travelToRegion(region));
        this.cameras.main.fadeIn(300);
        this.performAutoSave();
      }
    });
  }

  update(time: number, delta: number) {
    if (!this.player) return;

    if (this.isSunsetActive && Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      UIManager.getInstance().closeDialogue();
      this.closeSunsetCinematic();
    }

    // Update patrol for ambient workers
    this.ambientWorkers.forEach(worker => {
      if (worker.patrol) {
        const p = worker.patrol;
        worker.sprite.x += p.dir * p.speed * (delta / 1000);
        if (worker.sprite.x >= p.endX) {
          worker.sprite.x = p.endX;
          p.dir = -1;
          worker.sprite.setFlipX(true);
        } else if (worker.sprite.x <= p.startX) {
          worker.sprite.x = p.startX;
          p.dir = 1;
          worker.sprite.setFlipX(false);
        }
        worker.sprite.setDepth(worker.sprite.y);
      }
    });

    // Don't move player while dialogue, modal, or seated at pavilion
    const isUIBlocking = UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen();
    const canMove = !isUIBlocking && !this.isPlayerSeated && !this.isSunsetActive;
    this.player.setControlActive(canMove);

    this.player.update(time, delta);

    this.villageGuide?.update(this.player.x, this.player.y);
    // Check interaction proximity
    if (!isUIBlocking) this.checkInteractionProximity();
    else UIManager.getInstance().hidePrompt();

    // Check keyboard interaction triggers
    if (!isUIBlocking) {
      if (this.isPlayerSeated) {
        // Space triggers sunset cinematic if quest completed/roasted
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
          const objProcess = quest?.objectives.find(o => o.id === 'obj_process_tea');
          if (objProcess?.completed || quest?.status === 'completed') {
            this.triggerSunsetCinematic();
          } else {
            this.standUpFromPavilion();
          }
        } else if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
          this.standUpFromPavilion();
        }
      } else {
        if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          this.triggerInteraction();
        }
      }
    }

    // Auto-save periodically every 15 seconds
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer > 15000) {
      this.autoSaveTimer = 0;
      this.performAutoSave();
    }
  }

  private checkInteractionProximity() {
    if (this.isPlayerSeated || this.isSunsetActive) {
      return;
    }

    let closestInteractable: {
      type: 'npc' | 'bush' | 'ambient_worker' | 'pavilion' | 'workshop' | 'nursery';
      target: any;
      dist: number;
    } | null = null;

    const playerX = this.player.x;
    const playerY = this.player.y;

    // 1. Check Story NPCs (Bác Lâm, Cô Hương, Bé Mai, Chú Tuấn)
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(playerX, playerY, npc.x, npc.y);
      if (dist < 60) {
        if (!closestInteractable || dist < closestInteractable.dist) {
          closestInteractable = { type: 'npc', target: npc, dist };
        }
      }
    }

    // 2. Check Scenic Tea Pavilion seating zone (x: 480, y: 150)
    if (!closestInteractable) {
      const distToPavilion = Phaser.Math.Distance.Between(playerX, playerY, 480, 150);
      if (distToPavilion < 42) {
        closestInteractable = { type: 'pavilion', target: null, dist: distToPavilion };
      }
    }

    // 3. Check Tea Processing Workshop (x: 740, y: 180)
    if (!closestInteractable) {
      const distToWorkshop = Phaser.Math.Distance.Between(playerX, playerY, 740, 180);
      if (distToWorkshop < 55) {
        closestInteractable = { type: 'workshop', target: null, dist: distToWorkshop };
      }
    }

    // 4. Check Nursery Shop (x: 230, y: 465)
    if (!closestInteractable) {
      const distToNursery = Phaser.Math.Distance.Between(playerX, playerY, 230, 465);
      if (distToNursery < 50) {
        closestInteractable = { type: 'nursery', target: null, dist: distToNursery };
      }
    }

    // 5. Check Ambient Workers
    if (!closestInteractable) {
      for (const worker of this.ambientWorkers) {
        const dist = Phaser.Math.Distance.Between(playerX, playerY, worker.sprite.x, worker.sprite.y);
        if (dist < 48) {
          if (!closestInteractable || dist < closestInteractable.dist) {
            closestInteractable = { type: 'ambient_worker', target: worker, dist };
          }
        }
      }
    }

    // 6. Check closest Tea Bush (Harvesting)
    if (!closestInteractable) {
      for (const bush of this.interactiveBushes) {
        const dist = Phaser.Math.Distance.Between(playerX, playerY, bush.x, bush.y);
        if (dist < 40) {
          if (!closestInteractable || dist < closestInteractable.dist) {
            closestInteractable = { type: 'bush', target: bush, dist };
          }
        }
      }
    }

    if (closestInteractable) {
      this.nearestInteractable = {
        type: closestInteractable.type,
        target: closestInteractable.target
      };

      if (closestInteractable.type === 'npc') {
        const npc: NPC = closestInteractable.target;
        UIManager.getInstance().showPrompt(`Nhấn [E] để nói chuyện với ${npc.config.name}`);
      } else if (closestInteractable.type === 'ambient_worker') {
        const worker: IAmbientWorker = closestInteractable.target;
        UIManager.getInstance().showPrompt(`Nhấn [E] để trò chuyện với ${worker.name}`);
      } else if (closestInteractable.type === 'pavilion') {
        const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
        const processed = quest?.objectives.find(o => o.id === 'obj_process_tea')?.completed || quest?.status === 'completed';
        const brewing = QuestManager.getInstance().getQuest('quest_first_tea');
        if (processed && brewing?.status === 'active') {
          UIManager.getInstance().showPrompt('Hiên thưởng trà · Nhấn [E] để pha trà cùng Bác Lâm');
        } else if (processed && brewing?.status === 'locked') {
          UIManager.getInstance().showPrompt('Hiên thưởng trà · Nhấn [E] để bắt đầu bài học pha trà');
        } else if (processed && brewing?.status === 'completed') {
          UIManager.getInstance().showPrompt('Hiên thưởng trà · Nhấn [E] để thử pha trà tự do');
        } else {
          UIManager.getInstance().showPrompt('Nhấn [E] để ngồi thưởng trà Tân Cương');
        }
      } else if (closestInteractable.type === 'workshop') {
        UIManager.getInstance().showPrompt('Nhà sao chè · Nhấn [E] để vào tham quan');
      } else if (closestInteractable.type === 'nursery') {
        UIManager.getInstance().showPrompt('Vườn Giống Cô Hương – Nhấn [E] để ghé thăm');
      } else {
        // Bush interaction text based on quest state
        const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
        const objReturn = quest?.objectives.find(o => o.id === 'obj_return_bac_lam_supplies');
        const objHarvest = quest?.objectives.find(o => o.id === 'obj_harvest_tea');
        const objProcess = quest?.objectives.find(o => o.id === 'obj_process_tea');

        if (!objReturn?.completed) {
          UIManager.getInstance().showPrompt('Nhấn [E] để ngắm nương chè Tân Cương');
        } else if (!objHarvest?.completed) {
          UIManager.getInstance().showPrompt('Nhấn [E] để thu hoạch búp chè "1 tôm 2 lá"');
        } else if (!objProcess?.completed && quest?.status !== 'completed') {
          UIManager.getInstance().showPrompt('Nhấn [E] để ngắm nương chè Tân Cương');
        } else {
          UIManager.getInstance().showPrompt('Nhấn [E] để trải nghiệm hái chè "1 tôm 2 lá"');
        }
      }
    } else {
      this.nearestInteractable = null;
      UIManager.getInstance().hidePrompt();
    }
  }

  private triggerInteraction() {
    if (!this.nearestInteractable || this.isSunsetActive || UIManager.getInstance().isAnyModalOpen() || UIManager.getInstance().isDialogueOpen()) return;

    AudioManager.getInstance().playClick();

    if (this.nearestInteractable.type === 'npc') {
      const npc: NPC = this.nearestInteractable.target;
      this.handleNPCInteraction(npc);
    } else if (this.nearestInteractable.type === 'ambient_worker') {
      const worker: IAmbientWorker = this.nearestInteractable.target;
      UIManager.getInstance().showToast(`💬 ${worker.name} (${worker.role}): "${worker.quote}"`);
    } else if (this.nearestInteractable.type === 'pavilion') {
      this.handlePavilionInteraction();
    } else if (this.nearestInteractable.type === 'workshop') {
      this.enterTeaHouse();
    } else if (this.nearestInteractable.type === 'nursery') {
      const coHuong = this.npcs.find(n => n.config.id === 'npc_co_huong');
      if (coHuong) this.handleNPCInteraction(coHuong);
    } else if (this.nearestInteractable.type === 'bush') {
      this.handleTeaBushInteraction();
    }
  }

  private ensureFinishedTea() {
    if (!InventoryManager.getInstance().hasItem('tea_processed_tan_cuong')) {
      InventoryManager.getInstance().addItem('tea_processed_tan_cuong', 1);
    }
  }

  private startBrewingQuest() {
    this.ensureFinishedTea();
    const quest = QuestManager.getInstance().getQuest('quest_first_tea');
    if (quest && quest.status !== 'completed' && quest.status !== 'active') {
      QuestManager.getInstance().startQuest('quest_first_tea', false);
    }
    this.performAutoSave();
  }

  private handlePavilionInteraction() {
    const chapter = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const processed = chapter?.objectives.find(o => o.id === 'obj_process_tea')?.completed || chapter?.status === 'completed';
    if (!processed) {
      this.sitAtPavilion();
      return;
    }

    this.ensureFinishedTea();
    const quest = QuestManager.getInstance().getQuest('quest_first_tea');
    if (quest?.status === 'locked' || quest?.status === 'available' || !quest) {
      UIManager.getInstance().startDialogue('bac_lam_brewing_intro', (action, payload) => this.handleDialogueAction(action, payload));
      return;
    }

    const freeMode = quest.status === 'completed';
    if (!freeMode) ProgressionService.completeObjective('quest_first_tea', 'obj_meet_bac_lam_pavilion', 'tan_cuong');
    UIManager.getInstance().openMiniGame('brewing', () => {
      this.performAutoSave();
      if (freeMode) {
        UIManager.getInstance().showToast('Ấm trà mới đã sẵn sàng để thử nghiệm.');
      } else {
        UIManager.getInstance().showToast('Bạn và Bác Lâm đã cùng thưởng thức mẻ trà đầu tiên.');
        this.beginSunsetEnding();
      }
    }, freeMode, objectiveId => {
      if (objectiveId) ProgressionService.completeObjective('quest_first_tea', objectiveId, 'tan_cuong');
      this.performAutoSave();
    });
    this.performAutoSave();
  }

  private beginSunsetEnding() {
    this.isPlayerSeated = true;
    this.player.setControlActive(false);
    this.player.setPosition(454, 151);
    this.player.setVelocity(0, 0);
    this.player.setDirection('right');
    const bacLam = this.npcs.find(npc => npc.config.id === 'npc_bac_lam');
    if (bacLam) {
      this.cinematicBacLamOriginalPosition = { x: bacLam.x, y: bacLam.y };
      bacLam.setPosition(506, 151);
      bacLam.setDepth(151);
      bacLam.body?.updateFromGameObject();
    }
    this.time.delayedCall(500, () => this.triggerSunsetCinematic());
  }

  private sitAtPavilion() {
    this.isPlayerSeated = true;
    this.player.setControlActive(false);
    this.player.x = 480;
    this.player.y = 150;
    this.player.setDirection('up');

    // Camera zooms in smoothly toward the tea table
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.6,
      duration: 800,
      ease: 'Power2'
    });

    AudioManager.getInstance().playClick();
    UIManager.getInstance().showToast('☕ Nhấp một ngụm trà Tân Cương ấm nóng... Vị tiền chát dịu êm, hậu ngọt sâu lắng lan tỏa nơi đầu lưỡi.');

    // Check if player has finished processing tea or quest
    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const objProcess = quest?.objectives.find(o => o.id === 'obj_process_tea');
    if (objProcess?.completed || quest?.status === 'completed') {
      UIManager.getInstance().showPrompt('Nhấn [Space] để Ngắm Hoàng Hôn Xứ Trà 🌅  |  Nhấn [E] để Đứng dậy');
    } else {
      UIManager.getInstance().showPrompt('Nhấn [E] hoặc phím di chuyển để Đứng dậy');
    }
  }

  private standUpFromPavilion() {
    if (!this.isPlayerSeated) return;
    this.isPlayerSeated = false;
    this.player.setControlActive(true);
    this.player.y = 162; // Step down from bench

    this.tweens.add({
      targets: this.cameras.main,
      zoom: 1.05,
      duration: 600,
      ease: 'Power2'
    });

    UIManager.getInstance().hidePrompt();
  }

  public triggerSunsetCinematic() {
    if (this.isSunsetActive) return;
    this.isSunsetActive = true;
    UIManager.getInstance().hidePrompt();

    // 1. Create sunset atmospheric warm orange overlay
    if (!this.sunsetOverlay) {
      this.sunsetOverlay = this.add.graphics().setDepth(900).setScrollFactor(0);
      this.sunsetOverlay.fillStyle(0xE65100, 0.35); // Warm golden-orange twilight
      this.sunsetOverlay.fillRect(0, 0, this.scale.width, this.scale.height);
      this.sunsetOverlay.setAlpha(0);
    }

    this.tweens.add({
      targets: this.sunsetOverlay,
      alpha: 1,
      duration: 1500,
      ease: 'Cubic.easeInOut'
    });

    // 2. Evening glowing pollen / fireflies particle emitter
    if (!this.sunsetParticles) {
      this.sunsetParticles = this.add.particles(0, 0, 'leaf_particle', {
        x: { min: 0, max: this.mapWidth },
        y: { min: 100, max: 550 },
        lifespan: 4000,
        speedY: { min: -10, max: 10 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.6, end: 1.3 },
        alpha: { start: 0.7, end: 0 },
        tint: 0xFFD54F,
        frequency: 400
      }).setDepth(905);
    }

    // 3. Camera smooth panoramic drift overlooking the tea hills
    this.tweens.add({
      targets: this.cameras.main,
      scrollX: 480 - this.cameras.main.width / 2,
      scrollY: 240 - this.cameras.main.height / 2,
      zoom: 1.45,
      duration: 2500,
      ease: 'Sine.easeInOut'
    });

    // 4. Play discovery sound
    AudioManager.getInstance().playDiscovery();

    // 5. Show poetic dialogue with Bác Lâm
    this.time.delayedCall(1600, () => {
      UIManager.getInstance().startDialogue('bac_lam_sunset_cinematic', action => {
        if (action === 'custom') this.closeSunsetCinematic();
      });
    });
  }

  private closeSunsetCinematic() {
    this.tweens.add({
      targets: this.sunsetOverlay,
      alpha: 0,
      duration: 1200,
      onComplete: () => {
        this.isSunsetActive = false;
        if (this.sunsetParticles) {
          this.sunsetParticles.destroy();
          this.sunsetParticles = null;
        }
        if (this.cinematicBacLamOriginalPosition) {
          const bacLam = this.npcs.find(npc => npc.config.id === 'npc_bac_lam');
          if (bacLam) {
            bacLam.setPosition(this.cinematicBacLamOriginalPosition.x, this.cinematicBacLamOriginalPosition.y);
            bacLam.setDepth(bacLam.y);
            bacLam.body?.updateFromGameObject();
          }
          this.cinematicBacLamOriginalPosition = null;
        }
      }
    });

    this.standUpFromPavilion();
    UIManager.getInstance().showToast('🌅 Bạn vừa chiêm ngưỡng trọn vẹn cảnh sắc Hoàng Hôn Đồi Chè Tân Cương!');
    this.performAutoSave();
    const cinematicSave = SaveManager.getInstance().load();
    cinematicSave.passportStamps ||= {};
    cinematicSave.passportStamps.tan_cuong_sunset_cinematic = true;
    SaveManager.getInstance().save(cinematicSave);
    this.time.delayedCall(1250, () => {
      UIManager.getInstance().startDialogue('bac_lam_sunset_discovery', (action, payload) => this.handleDialogueAction(action, payload));
    });
  }

  private handleWorkshopPractice() {
    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const objHarvest = quest?.objectives.find(o => o.id === 'obj_harvest_tea');
    const objProcess = quest?.objectives.find(o => o.id === 'obj_process_tea');

    if (objProcess?.completed || quest?.status === 'completed') {
      this.ensureFinishedTea();
      UIManager.getInstance().openMiniGame('process', outcome => {
        this.applyProcessingOutcome(outcome);
        UIManager.getInstance().showToast('🍃 Mẻ chè Tân Cương của bạn đã được sao thơm nồng hương cốm non!');
        this.performAutoSave();
      });
    } else if (objHarvest?.completed) {
      UIManager.getInstance().openMiniGame('process', outcome => {
        this.applyProcessingOutcome(outcome);
        this.ensureFinishedTea();
        this.startBrewingQuest();
        this.performAutoSave();
        UIManager.getInstance().showToast('🍵 Mẻ trà đã xong! Hãy tự đi tới Hiên thưởng trà để bắt đầu pha cùng Bác Lâm.');
      });
    } else {
      UIManager.getInstance().showToast('🍃 Bác Lâm dặn: Cần hái đủ 5 búp chè tươi đạt chuẩn "1 tôm 2 lá" trước khi nhóm lò sao chè nhé!');
    }
  }

  private handleNPCInteraction(npc: NPC) {
    let startNodeId = npc.config.startDialogueId;

    // Check quest state for Bác Lâm
    if (npc.config.id === 'npc_bac_lam') {
      const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
      if (quest) {
        const objReturn = quest.objectives.find(o => o.id === 'obj_return_bac_lam_supplies');
        const objHarvest = quest.objectives.find(o => o.id === 'obj_harvest_tea');
        const objProcess = quest.objectives.find(o => o.id === 'obj_process_tea');
        const objQuiz = quest.objectives.find(o => o.id === 'obj_quiz_tea');
        const brewingQuest = QuestManager.getInstance().getQuest('quest_first_tea');

        if (objProcess?.completed && (brewingQuest?.status === 'locked' || brewingQuest?.status === 'available')) {
          this.ensureFinishedTea();
          startNodeId = 'bac_lam_brewing_intro';
        } else if (objProcess?.completed && brewingQuest?.status === 'active') {
          this.ensureFinishedTea();
          startNodeId = 'bac_lam_brewing_active';
        } else if (quest.status === 'completed') {
          startNodeId = 'bac_lam_after_quest';
        } else if (objProcess?.completed && brewingQuest?.status === 'completed' && !objQuiz?.completed) {
          startNodeId = 'bac_lam_brewing_complete';
        } else if (objQuiz?.completed) {
          startNodeId = 'bac_lam_quest_complete';
        } else if (objProcess?.completed) {
          startNodeId = 'bac_lam_process_done';
        } else if (objHarvest?.completed) {
          startNodeId = 'bac_lam_harvest_done';
        } else if (objReturn?.completed) {
          startNodeId = 'bac_lam_waiting_harvest';
        } else if (quest.status === 'active') {
          startNodeId = 'bac_lam_waiting_supplies';
        }
      }
    }

    UIManager.getInstance().startDialogue(startNodeId, (action, payload) => {
      this.handleDialogueAction(action, payload);
    });
  }

  private handleDialogueAction(action: string, payload?: any) {
    if (action === 'startQuest') {
      QuestManager.getInstance().startQuest('quest_tan_cuong');
      QuestManager.getInstance().completeObjective('quest_tan_cuong', 'obj_meet_bac_lam');
      InventoryManager.getInstance().addItem('note_bac_lam', 1);
      if (InventoryManager.getInstance().getCoins() === 0) {
        InventoryManager.getInstance().addCoins(120);
      }
      UIManager.getInstance().showToast('📜 Nhận "Tờ Ghi Chú Của Bác Lâm" & 120 Xu Xứ Trà!');
      this.performAutoSave();
    } else if (action === 'custom') {
      if (payload === 'checkSupplies') {
        const hasCultivar = InventoryManager.getInstance().hasItem('seedling_trung_du');
        const hasSoil = InventoryManager.getInstance().hasItem('compost_organic');

        if (hasCultivar && hasSoil) {
          QuestManager.getInstance().completeObjective('quest_tan_cuong', 'obj_return_bac_lam_supplies');
          UIManager.getInstance().showToast('🎉 Bác Lâm đã duyệt cây giống & phân hữu cơ hoai mục!');
          this.performAutoSave();
          UIManager.getInstance().startDialogue('bac_lam_supplies_success', (a, p) => {
            this.handleDialogueAction(a, p);
          });
        } else {
          UIManager.getInstance().startDialogue('bac_lam_supplies_wrong', (a, p) => {
            this.handleDialogueAction(a, p);
          });
        }
      } else if (payload === 'openShop') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openShop(() => {
          const coHuong = this.npcs.find(n => n.config.id === 'npc_co_huong');
          if (coHuong) this.handleNPCInteraction(coHuong);
        });
      } else if (payload === 'triggerSunset') {
        UIManager.getInstance().closeDialogue();
        this.beginSunsetEnding();
      } else if (payload === 'startBrewingQuest') {
        UIManager.getInstance().closeDialogue();
        this.startBrewingQuest();
        UIManager.getInstance().showToast('🍵 Mẻ trà đã sẵn sàng. Hãy tự đi tới Hiên thưởng trà để gặp Bác Lâm.');
      } else if (payload === 'startBrewingTemperatureLesson') {
        this.startBrewingQuest();
        window.setTimeout(() => UIManager.getInstance().startDialogue('bac_lam_brewing_temperature'), 0);
      } else if (payload === 'inspectFinishedTea') {
        UIManager.getInstance().closeDialogue();
        this.startBrewingQuest();
        UIManager.getInstance().openInventory();
      } else if (payload === 'openTeaDiscoveryCard') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openDestinationCard('tan_cuong', 'Trải Nghiệm Văn Hóa Trà Tân Cương Ngoài Đời Thực');
      }
    } else if (action === 'openMinigame') {
      if (payload === 'harvest') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openMiniGame('harvest', outcome => {
          this.applyHarvestOutcome(outcome);
          const bacLam = this.npcs.find(n => n.config.id === 'npc_bac_lam');
          if (bacLam) this.handleNPCInteraction(bacLam);
        });
      } else if (payload === 'process') {
        UIManager.getInstance().closeDialogue();
        UIManager.getInstance().openMiniGame('process', outcome => {
          this.applyProcessingOutcome(outcome);
          const bacLam = this.npcs.find(n => n.config.id === 'npc_bac_lam');
          if (bacLam) this.handleNPCInteraction(bacLam);
        });
      }
    } else if (action === 'openQuiz') {
      UIManager.getInstance().closeDialogue();
      UIManager.getInstance().openMiniGame('quiz', () => {
        ProgressionService.completeObjective('quest_tan_cuong', 'obj_quiz_tea', 'tan_cuong');
        ProgressionService.completeObjective('quest_tan_cuong', 'obj_claim_fragment', 'tan_cuong');
        const bacLam = this.npcs.find(n => n.config.id === 'npc_bac_lam');
        if (bacLam) this.handleNPCInteraction(bacLam);
      });
    } else if (action === 'giveReward') {
      UIManager.getInstance().closeDialogue();
      ProgressionService.completeObjective('quest_tan_cuong', 'obj_claim_fragment', 'tan_cuong');
      this.performAutoSave();
    }
  }

  private handleTeaBushInteraction() {
    // If dialogue or modal is open, ignore interaction completely
    if (UIManager.getInstance().isDialogueOpen() || UIManager.getInstance().isAnyModalOpen()) {
      return;
    }

    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const objReturn = quest?.objectives.find(o => o.id === 'obj_return_bac_lam_supplies');
    const objHarvest = quest?.objectives.find(o => o.id === 'obj_harvest_tea');
    const objProcess = quest?.objectives.find(o => o.id === 'obj_process_tea');

    // Scenario 1: Player hasn't returned verified seedling and fertilizer supplies to Bác Lâm yet
    if (!objReturn?.completed) {
      AudioManager.getInstance().playClick();
      UIManager.getInstance().showToast('🍃 Bác Lâm dặn: Cần chuẩn bị giống chè và vật tư trước đã. Hãy tìm Cô Hương để chọn mua giống chè phù hợp!');
      return;
    }

    // Scenario 2: Player has already harvested 5/5 buds, needs to roast them on wok with Bác Lâm
    if (objHarvest?.completed && !objProcess?.completed && quest?.status !== 'completed') {
      AudioManager.getInstance().playClick();
      UIManager.getInstance().showToast('🧺 Bạn đã thu hoạch đủ 5 búp chè tươi "1 tôm 2 lá" rồi! Hãy mang về chòi để Bác Lâm hướng dẫn sao chè nhé.');
      return;
    }

    // Scenario 3: Harvesting is required (obj_harvest_tea active) OR quest is completed (replayable for enjoyment)
    UIManager.getInstance().openMiniGame('harvest', outcome => {
      this.applyHarvestOutcome(outcome);
      UIManager.getInstance().showToast('🍃 Đã hoàn thành đợt thu hoạch búp chè "1 tôm 2 lá"! Hãy mang về chòi cho Bác Lâm.');
      this.performAutoSave();
    });
  }

  private applyHarvestOutcome(outcome?: { harvested?: number; bonusCoins?: number }) {
    if (!outcome || outcome.harvested !== 5) return;
    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    const objective = quest?.objectives.find(item => item.id === 'obj_harvest_tea');
    if (!quest || quest.status === 'completed' || objective?.completed) return;
    InventoryManager.getInstance().addItem('tea_buds_fresh', 5);
    if (outcome.bonusCoins && outcome.bonusCoins > 0) InventoryManager.getInstance().addCoins(outcome.bonusCoins);
    QuestManager.getInstance().incrementObjective('quest_tan_cuong', 'obj_harvest_tea', 5);
    ProgressionService.saveRuntime('tan_cuong');
  }

  private applyProcessingOutcome(outcome?: { firstBatch?: boolean }) {
    if (!outcome?.firstBatch) return;
    const quest = QuestManager.getInstance().getQuest('quest_tan_cuong');
    if (!quest || quest.status === 'completed' || quest.objectives.find(item => item.id === 'obj_process_tea')?.completed) return;
    if (!InventoryManager.getInstance().hasItem('tea_processed_tan_cuong')) InventoryManager.getInstance().addItem('tea_processed_tan_cuong', 1);
    ProgressionService.completeObjective('quest_tan_cuong', 'obj_process_tea', 'tan_cuong');
  }

  private performAutoSave() {
    if (!this.player) return;
    const currentSave = SaveManager.getInstance().load();
    currentSave.playerCoords = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      dir: this.player.getDirection()
    };
    currentSave.currentRegion = 'tan_cuong';
    currentSave.regionProgress ||= {};
    currentSave.regionProgress.tan_cuong ||= { visitedStops: [], completedActivities: [] };
    currentSave.regionProgress.tan_cuong.player = currentSave.playerCoords;
    currentSave.inventory = InventoryManager.getInstance().getItems();
    currentSave.quests = QuestManager.getInstance().getAllQuests();
    currentSave.completedQuestIds = QuestManager.getInstance().getCompletedQuestIds();
    currentSave.activeQuestId = QuestManager.getInstance().getActiveQuest()?.id || null;
    if (QuestManager.getInstance().isQuestCompleted('quest_first_tea')) {
      currentSave.achievements ||= {};
      currentSave.achievements.ach_tea_brewing_apprentice = true;
      currentSave.passportStamps ||= {};
      currentSave.passportStamps.tan_cuong_brewing_tutorial = true;
      currentSave.passportStamps.tan_cuong_first_batch_brewed = true;
      currentSave.passportStamps.tan_cuong_tasting_completed = true;
      currentSave.passportStamps.tan_cuong_brewing_achievement = true;
      if (QuestManager.getInstance().isQuestCompleted('quest_tan_cuong')) {
        currentSave.passportStamps.tan_cuong = true;
      }
    }

    SaveManager.getInstance().save(currentSave);
  }
}
