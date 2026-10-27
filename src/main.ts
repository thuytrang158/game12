import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { TeaHouseScene } from './scenes/TeaHouseScene';
import { TanCuongScene } from './scenes/TanCuongScene';
import { HoNuiCocScene } from './scenes/HoNuiCocScene';
import { AtkDinhHoaScene } from './scenes/AtkDinhHoaScene';
import { HangPhuongHoangScene } from './scenes/HangPhuongHoangScene';
import { SuoiCuaTuScene } from './scenes/SuoiCuaTuScene';
import { UIManager } from './ui/UIManager';
import { AudioManager } from './systems/AudioManager';
import { ThaiHaiScene } from './scenes/ThaiHaiScene';
import { DenDuomScene } from './scenes/DenDuomScene';
import { BaoTangVanHoaScene } from './scenes/BaoTangVanHoaScene';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize UI overlay manager
  UIManager.getInstance().init();

  // 2. Initialize Phaser Game configuration
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 960,
    height: 540,
    backgroundColor: '#182A20',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false
      }
    },
    scene: [
      BootScene,
      MainMenuScene,
      TanCuongScene,
      TeaHouseScene,
      HoNuiCocScene,
      AtkDinhHoaScene,
      HangPhuongHoangScene,
      SuoiCuaTuScene,
      ThaiHaiScene,
      DenDuomScene,
      BaoTangVanHoaScene
    ]
  };

  const game = new Phaser.Game(config);

  // Initialize audio on first user gesture anywhere
  const initAudioOnFirstGesture = () => {
    AudioManager.getInstance().init();
    AudioManager.getInstance().resumeContext();
    window.removeEventListener('click', initAudioOnFirstGesture);
    window.removeEventListener('keydown', initAudioOnFirstGesture);
    window.removeEventListener('touchstart', initAudioOnFirstGesture);
  };

  window.addEventListener('click', initAudioOnFirstGesture);
  window.addEventListener('keydown', initAudioOnFirstGesture);
  window.addEventListener('touchstart', initAudioOnFirstGesture);

  // Expose global game reference for debugging or website API integration
  (window as any).__THAI_NGUYEN_QUEST__ = {
    game,
    UIManager: UIManager.getInstance(),
    AudioManager: AudioManager.getInstance()
  };
});
