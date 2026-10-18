import Phaser from 'phaser';
import { INPCConfig } from '../types/game';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public config: INPCConfig;
  private promptIndicator!: Phaser.GameObjects.Container;
  private isPlayerNearby: boolean = false;

  constructor(scene: Phaser.Scene, config: INPCConfig) {
    super(scene, config.x, config.y, config.textureKey, 0);
    this.config = config;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body for collision

    this.setSize(18, 14);
    this.setOffset(7, 18);
    this.setDepth(this.y);

    // Floating interaction indicator bubble above NPC head
    this.createPromptIndicator(scene);

    // Idle breathing animation
    if (scene.anims.exists(`${config.textureKey}_idle`)) {
      this.play(`${config.textureKey}_idle`);
    }
  }

  private createPromptIndicator(scene: Phaser.Scene) {
    const bubbleBg = scene.add.graphics();
    bubbleBg.fillStyle(0xffffff, 0.95);
    bubbleBg.fillRoundedRect(-14, -14, 28, 18, 5);
    bubbleBg.fillTriangle(-4, 4, 4, 4, 0, 9);
    bubbleBg.lineStyle(1.5, 0x355C46, 1);
    bubbleBg.strokeRoundedRect(-14, -14, 28, 18, 5);

    const iconText = scene.add.text(0, -5, '💬', {
      fontSize: '11px'
    }).setOrigin(0.5);

    this.promptIndicator = scene.add.container(this.x, this.y - 28, [bubbleBg, iconText]);
    this.promptIndicator.setDepth(9999);
    this.promptIndicator.setVisible(false);

    // Subtle gentle bobbing tween
    scene.tweens.add({
      targets: this.promptIndicator,
      y: this.y - 32,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setPlayerNearby(nearby: boolean) {
    if (this.isPlayerNearby !== nearby) {
      this.isPlayerNearby = nearby;
      this.promptIndicator.setVisible(nearby);
    }
  }

  public getIsPlayerNearby(): boolean {
    return this.isPlayerNearby;
  }

  public destroy(fromScene?: boolean) {
    if (this.promptIndicator) {
      this.promptIndicator.destroy();
    }
    super.destroy(fromScene);
  }
}
