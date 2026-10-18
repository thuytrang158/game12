import Phaser from 'phaser';
import { Direction } from '../types/game';
import { AudioManager } from '../systems/AudioManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private currentDirection: Direction = 'down';
  private moveSpeed: number = 130;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private stepTimer: number = 0;
  private virtualMovement: { x: number; y: number } = { x: 0, y: 0 };
  private canMove: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_sheet', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Collision physics box on the feet for natural depth sorting
    this.setSize(16, 12);
    this.setOffset(8, 20);
    this.setCollideWorldBounds(true);

    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };
    }
  }

  public setControlActive(active: boolean) {
    this.canMove = active;
    if (!active && this.body) {
      this.setVelocity(0, 0);
      this.anims.stop();
    }
  }

  public setVirtualMovement(x: number, y: number) {
    this.virtualMovement = { x, y };
  }

  public getDirection(): Direction {
    return this.currentDirection;
  }

  public setDirection(dir: Direction) {
    this.currentDirection = dir;
    this.anims.stop();
    switch (dir) {
      case 'down': this.setFrame(0); break;
      case 'left': this.setFrame(3); break;
      case 'right': this.setFrame(6); break;
      case 'up': this.setFrame(9); break;
    }
  }

  public update(time: number, delta: number) {
    if (!this.canMove) {
      return;
    }

    let vx = 0;
    let vy = 0;

    // Check keyboard input
    if (this.cursors && this.wasdKeys) {
      if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
        vx -= 1;
      }
      if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
        vx += 1;
      }
      if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
        vy -= 1;
      }
      if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
        vy += 1;
      }
    }

    // Merge virtual touchscreen input
    if (this.virtualMovement.x !== 0 || this.virtualMovement.y !== 0) {
      vx = this.virtualMovement.x;
      vy = this.virtualMovement.y;
    }

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.setVelocity(vx * this.moveSpeed, vy * this.moveSpeed);

    // Update animations and direction
    if (vx !== 0 || vy !== 0) {
      if (Math.abs(vx) > Math.abs(vy)) {
        if (vx < 0) {
          this.currentDirection = 'left';
          this.anims.play('walk_left', true);
        } else {
          this.currentDirection = 'right';
          this.anims.play('walk_right', true);
        }
      } else {
        if (vy < 0) {
          this.currentDirection = 'up';
          this.anims.play('walk_up', true);
        } else {
          this.currentDirection = 'down';
          this.anims.play('walk_down', true);
        }
      }

      // Footstep sound tick
      this.stepTimer += delta;
      if (this.stepTimer >= 320) {
        this.stepTimer = 0;
        AudioManager.getInstance().playFootstep();
      }
    } else {
      this.stepTimer = 0;
      this.anims.stop();
      // Set to idle frame for current direction
      switch (this.currentDirection) {
        case 'down': this.setFrame(0); break;
        case 'left': this.setFrame(3); break;
        case 'right': this.setFrame(6); break;
        case 'up': this.setFrame(9); break;
      }
    }

    // Dynamic depth sorting: characters lower on screen render in front
    this.setDepth(this.y);
  }
}
