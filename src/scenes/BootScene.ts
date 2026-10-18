import Phaser from 'phaser';
import { PixelArtGenerator } from '../assets/pixelArtGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // 1. Generate and register procedural pixel art textures
    this.createProceduralTextures();

    // 2. Create player animations
    this.createPlayerAnimations();

    // 3. Create NPC animations
    this.createNPCAnimations();

    // 4. Transition to Main Menu Scene
    this.scene.start('MainMenuScene');
  }

  private createProceduralTextures() {
    // Player Spritesheet
    const playerCanvas = PixelArtGenerator.generatePlayerSpritesheet();
    this.textures.addSpriteSheet('player_sheet', playerCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Artisan Bác Lâm Spritesheet
    const artisanCanvas = PixelArtGenerator.generateArtisanSprite();
    this.textures.addSpriteSheet('npc_artisan_sheet', artisanCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Bé Mai Tea Picker Spritesheet
    const pickerCanvas = PixelArtGenerator.generateTeaPickerSprite();
    this.textures.addSpriteSheet('npc_picker_sheet', pickerCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Chú Tuấn Guide Spritesheet
    const guideCanvas = PixelArtGenerator.generateGuideSprite();
    this.textures.addSpriteSheet('npc_guide_sheet', guideCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Tea Bush Variants (Standard, Dense, Young, Flowering)
    const teaBushCanvas = PixelArtGenerator.generateTeaBushSprite(true);
    this.textures.addCanvas('tea_bush', teaBushCanvas);
    this.textures.addCanvas('tea_bush_standard', teaBushCanvas);
    this.textures.addCanvas('tea_bush_dense', PixelArtGenerator.generateTeaBushVariant('dense'));
    this.textures.addCanvas('tea_bush_young', PixelArtGenerator.generateTeaBushVariant('young'));
    this.textures.addCanvas('tea_bush_flowering', PixelArtGenerator.generateTeaBushVariant('flowering'));

    // Traditional House
    const houseCanvas = PixelArtGenerator.generateTraditionalHouse();
    this.textures.addCanvas('traditional_house', houseCanvas);

    // Enhanced Tea Processing Workshop & Pavilion
    const workshopCanvas = PixelArtGenerator.generateTeaWorkshop();
    this.textures.addCanvas('tea_workshop', workshopCanvas);
    this.textures.addCanvas('tea_workshop_enhanced', PixelArtGenerator.generateTeaWorkshopEnhanced());
    this.textures.addCanvas('tea_pavilion', PixelArtGenerator.generateTeaPavilion());

    // Enhanced Nursery Shop
    const nurseryShopCanvas = PixelArtGenerator.generateNurseryShop();
    this.textures.addCanvas('shop_nursery', nurseryShopCanvas);
    this.textures.addCanvas('shop_nursery_enhanced', PixelArtGenerator.generateNurseryShopEnhanced());

    // Environmental Props
    this.textures.addCanvas('tea_basket_prop', PixelArtGenerator.generateTeaBasketProp());
    this.textures.addCanvas('tea_drying_tray', PixelArtGenerator.generateTeaDryingTray());
    this.textures.addCanvas('water_jar_prop', PixelArtGenerator.generateWaterJarProp());
    this.textures.addCanvas('bamboo_fence_prop', PixelArtGenerator.generateBambooFence());
    this.textures.addCanvas('mountain_backdrop', PixelArtGenerator.generateMountainBackdrop());

    // Environment Tileset
    const tilesetCanvas = PixelArtGenerator.generateEnvironmentTileset();
    this.textures.addSpriteSheet('env_tileset', tilesetCanvas as unknown as HTMLImageElement, {
      frameWidth: 16,
      frameHeight: 16
    });

    // Particle Textures
    const leafCanvas = PixelArtGenerator.generateLeafParticle();
    this.textures.addCanvas('leaf_particle', leafCanvas);

    const butterflyCanvas = PixelArtGenerator.generateButterflyParticle();
    this.textures.addCanvas('butterfly_particle', butterflyCanvas);

    // Regional Props
    const boatCanvas = PixelArtGenerator.generateBoatSprite();
    this.textures.addCanvas('boat_sprite', boatCanvas);

    const atkHouseCanvas = PixelArtGenerator.generateStiltHouseATK();
    this.textures.addCanvas('stilt_house_atk', atkHouseCanvas);

    const caveRockCanvas = PixelArtGenerator.generateCavernRock();
    this.textures.addCanvas('cavern_rock', caveRockCanvas);

    const riverBoulderCanvas = PixelArtGenerator.generateRiverBoulder();
    this.textures.addCanvas('river_boulder', riverBoulderCanvas);

    // Fisherman NPC Spritesheet
    const fishermanCanvas = PixelArtGenerator.generateFishermanSprite();
    this.textures.addSpriteSheet('npc_fisherman_sheet', fishermanCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Cô Hương Nursery Shopkeeper Spritesheet
    const shopkeeperCanvas = PixelArtGenerator.generateShopkeeperSprite();
    this.textures.addSpriteSheet('npc_shopkeeper_sheet', shopkeeperCanvas as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });

    // Ambient Tea Worker Spritesheets
    this.textures.addSpriteSheet('worker_picker_sheet', PixelArtGenerator.generateAmbientWorkerSpritesheet('picker') as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.textures.addSpriteSheet('worker_carrier_sheet', PixelArtGenerator.generateAmbientWorkerSpritesheet('carrier') as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });
    this.textures.addSpriteSheet('worker_sorter_sheet', PixelArtGenerator.generateAmbientWorkerSpritesheet('sorter') as unknown as HTMLImageElement, {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  private createPlayerAnimations() {
    // Down walk (frames 0, 1, 2)
    this.anims.create({
      key: 'walk_down',
      frames: this.anims.generateFrameNumbers('player_sheet', { frames: [1, 0, 2, 0] }),
      frameRate: 8,
      repeat: -1
    });

    // Left walk (frames 3, 4, 5)
    this.anims.create({
      key: 'walk_left',
      frames: this.anims.generateFrameNumbers('player_sheet', { frames: [4, 3, 5, 3] }),
      frameRate: 8,
      repeat: -1
    });

    // Right walk (frames 6, 7, 8)
    this.anims.create({
      key: 'walk_right',
      frames: this.anims.generateFrameNumbers('player_sheet', { frames: [7, 6, 8, 6] }),
      frameRate: 8,
      repeat: -1
    });

    // Up walk (frames 9, 10, 11)
    this.anims.create({
      key: 'walk_up',
      frames: this.anims.generateFrameNumbers('player_sheet', { frames: [10, 9, 11, 9] }),
      frameRate: 8,
      repeat: -1
    });
  }

  private createNPCAnimations() {
    this.anims.create({
      key: 'npc_artisan_sheet_idle',
      frames: this.anims.generateFrameNumbers('npc_artisan_sheet', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'npc_picker_sheet_idle',
      frames: this.anims.generateFrameNumbers('npc_picker_sheet', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'npc_guide_sheet_idle',
      frames: this.anims.generateFrameNumbers('npc_guide_sheet', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'npc_fisherman_sheet_idle',
      frames: this.anims.generateFrameNumbers('npc_fisherman_sheet', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'npc_shopkeeper_sheet_idle',
      frames: this.anims.generateFrameNumbers('npc_shopkeeper_sheet', { frames: [0, 1] }),
      frameRate: 2,
      repeat: -1
    });

    // Ambient Tea Workers
    this.anims.create({
      key: 'worker_picker_anim',
      frames: this.anims.generateFrameNumbers('worker_picker_sheet', { frames: [0, 1, 2, 3] }),
      frameRate: 2.5,
      repeat: -1
    });

    this.anims.create({
      key: 'worker_carrier_anim',
      frames: this.anims.generateFrameNumbers('worker_carrier_sheet', { frames: [0, 1, 2, 3] }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'worker_sorter_anim',
      frames: this.anims.generateFrameNumbers('worker_sorter_sheet', { frames: [0, 1, 2, 3] }),
      frameRate: 2,
      repeat: -1
    });
  }
}
