import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';
import { SaveManager } from '../systems/SaveManager';
import { UIManager } from '../ui/UIManager';
import { getSceneKey, isRegionUnlocked } from '../systems/RegionRegistry';

export class MainMenuScene extends Phaser.Scene {
  private hasSave: boolean = false;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    this.hasSave = SaveManager.getInstance().hasSave();
    UIManager.getInstance().setHUDVisible(false);
    UIManager.getInstance().setOnTravelCallback(regionId => {
      const save = SaveManager.getInstance().load();
      if (!isRegionUnlocked(regionId, save)) return;
      const target = getSceneKey(regionId);
      if (!target) return;
      save.currentRegion = regionId;
      SaveManager.getInstance().save(save);
      this.scene.start(target, { regionId });
    });

    const { width, height } = this.scale;

    // Atmospheric Background: Rolling Green Tea Plantation Gradient & Grid
    const bgGraphics = this.add.graphics();
    // Sky gradient
    bgGraphics.fillGradientStyle(0x5CA6B1, 0x5CA6B1, 0xA8C879, 0xA8C879, 1);
    bgGraphics.fillRect(0, 0, width, height * 0.45);

    // Distant Tam Đảo Mountains
    bgGraphics.fillStyle(0x355C46, 0.7);
    bgGraphics.beginPath();
    bgGraphics.moveTo(0, height * 0.45);
    bgGraphics.lineTo(width * 0.25, height * 0.25);
    bgGraphics.lineTo(width * 0.55, height * 0.45);
    bgGraphics.lineTo(width * 0.8, height * 0.3);
    bgGraphics.lineTo(width, height * 0.45);
    bgGraphics.closePath();
    bgGraphics.fill();

    // Foreground Lush Tea Hills
    bgGraphics.fillStyle(0x638B45, 1);
    bgGraphics.beginPath();
    bgGraphics.moveTo(0, height * 0.45);
    bgGraphics.lineTo(0, height);
    bgGraphics.lineTo(width, height);
    bgGraphics.lineTo(width, height * 0.45);
    bgGraphics.closePath();
    bgGraphics.fill();

    // Decorative Tea Bush Rows
    for (let r = 0; r < 5; r++) {
      const rowY = height * 0.52 + r * 50;
      for (let c = 0; c < 14; c++) {
        const bushX = c * 70 + (r % 2) * 35 - 10;
        this.add.image(bushX, rowY, 'tea_bush').setScale(1.6);
      }
    }

    // Traditional House in background
    this.add.image(width * 0.82, height * 0.48, 'traditional_house').setScale(1.1);

    // Tea Leaves Particle Emitter
    const leafParticles = this.add.particles(0, 0, 'leaf_particle', {
      x: { min: 0, max: width },
      y: -20,
      lifespan: 7000,
      speedY: { min: 30, max: 70 },
      speedX: { min: -25, max: 25 },
      angle: { min: 0, max: 360 },
      rotate: { start: 0, end: 360 },
      scale: { start: 1.5, end: 1 },
      alpha: { start: 0.9, end: 0.2 },
      frequency: 250
    });

    // Butterflies
    for (let i = 0; i < 3; i++) {
      const bf = this.add.image(
        Phaser.Math.Between(100, width - 100),
        Phaser.Math.Between(height * 0.4, height * 0.8),
        'butterfly_particle'
      ).setScale(1.5);

      this.tweens.add({
        targets: bf,
        x: bf.x + Phaser.Math.Between(-80, 80),
        y: bf.y + Phaser.Math.Between(-40, 40),
        duration: Phaser.Math.Between(2500, 4000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Title Card & Branding
    const titleContainer = this.add.container(width / 2, height * 0.22);

    // Title banner backdrop
    const bannerBg = this.add.graphics();
    bannerBg.fillStyle(0x1D3B2B, 0.85);
    bannerBg.fillRoundedRect(-280, -50, 560, 100, 16);
    bannerBg.lineStyle(3, 0xF4C978, 1);
    bannerBg.strokeRoundedRect(-280, -50, 560, 100, 16);
    titleContainer.add(bannerBg);

    const titleText = this.add.text(0, -20, 'THÁI NGUYÊN QUEST', {
      fontFamily: '"Be Vietnam Pro", sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#F4C978',
      stroke: '#355C46',
      strokeThickness: 5
    }).setOrigin(0.5);
    titleContainer.add(titleText);

    const subtitleText = this.add.text(0, 20, '🍃 HÀNH TRÌNH KHÁM PHÁ XỨ TRÀ 🍃', {
      fontFamily: '"Be Vietnam Pro", sans-serif',
      fontSize: '15px',
      fontStyle: '600',
      color: '#FFF2D5'
    }).setOrigin(0.5);
    titleContainer.add(subtitleText);

    // Subtle gentle floating title tween
    this.tweens.add({
      targets: titleContainer,
      y: height * 0.22 - 6,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Menu Options
    this.createMenuButtons(width / 2, height * 0.58);
  }

  private createMenuButtons(centerX: number, startY: number) {
    const buttons = [
      {
        label: '🌱 Bắt Đầu Hành Trình',
        callback: () => this.startNewGame()
      },
      {
        label: '📖 Tiếp Tục Khám Phá',
        disabled: !this.hasSave,
        callback: () => this.continueGame()
      },
      {
        label: '🗺️ Bản Đồ Thái Nguyên',
        callback: () => {
          AudioManager.getInstance().init();
          UIManager.getInstance().openWorldMap();
        }
      },
      {
        label: '📜 Sổ Tay "Bí Mật Xứ Trà"',
        callback: () => {
          AudioManager.getInstance().init();
          UIManager.getInstance().openJournal();
        }
      }
    ];

    buttons.forEach((btn, index) => {
      const btnY = startY + index * 52;
      this.createMenuButton(centerX, btnY, btn.label, btn.disabled || false, btn.callback);
    });
  }

  private createMenuButton(x: number, y: number, text: string, disabled: boolean, onClick: () => void) {
    const container = this.add.container(x, y);

    const btnWidth = 320;
    const btnHeight = 44;

    const bg = this.add.graphics();
    const normalColor = disabled ? 0x555555 : 0x355C46;
    const strokeColor = disabled ? 0x777777 : 0xF4C978;

    bg.fillStyle(normalColor, 0.95);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(2, strokeColor, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: '"Be Vietnam Pro", sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: disabled ? '#AAAAAA' : '#FFF2D5'
    }).setOrigin(0.5);
    container.add(label);

    if (!disabled) {
      container.setSize(btnWidth, btnHeight);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x638B45, 1);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
        bg.lineStyle(2, 0xFFFFFF, 1);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
        container.setScale(1.04);
        AudioManager.getInstance().playClick();
      });

      container.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(normalColor, 0.95);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
        bg.lineStyle(2, strokeColor, 1);
        bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
        container.setScale(1.0);
      });

      container.on('pointerdown', () => {
        AudioManager.getInstance().init();
        AudioManager.getInstance().resumeContext();
        AudioManager.getInstance().playClick();
        onClick();
      });
    }
  }

  private startNewGame() {
    AudioManager.getInstance().init();
    AudioManager.getInstance().resumeContext();
    AudioManager.getInstance().startPeacefulBGM();

    // Start with fresh save data
    const newSave = SaveManager.getInstance().getDefaultSaveData();
    SaveManager.getInstance().save(newSave);

    let started = false;
    const launch = () => {
      if (started) return;
      started = true;
      this.scene.start('TanCuongScene', { isNewGame: true });
    };

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', launch);
    this.time.delayedCall(400, launch);
  }

  private continueGame() {
    AudioManager.getInstance().init();
    AudioManager.getInstance().resumeContext();
    AudioManager.getInstance().startPeacefulBGM();

    let started = false;
    const launch = () => {
      if (started) return;
      started = true;
      const save = SaveManager.getInstance().load();
      const regionId = isRegionUnlocked(save.currentRegion, save) ? save.currentRegion : 'tan_cuong';
      this.scene.start(getSceneKey(regionId) || 'TanCuongScene', { isNewGame: false, regionId });
    };

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', launch);
    this.time.delayedCall(400, launch);
  }
}
