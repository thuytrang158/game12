/**
 * Procedural Pixel Art Generator for "Thái Nguyên Quest"
 * Generates crisp, handcrafted-style 2D pixel art textures and spritesheets
 * in accordance with the game's official Northern Vietnam color palette.
 */

export class PixelArtGenerator {
  // Official Color Palette
  public static readonly PALETTE = {
    teaGreen: '#638B45',
    forestGreen: '#355C46',
    darkForest: '#1D3B2B',
    lightGrass: '#A8C879',
    veryLightGrass: '#C9E298',
    warmEarth: '#A87C58',
    darkEarth: '#6D4C3D',
    lightPath: '#D1AC84',
    lakeBlue: '#5CA6B1',
    deepWater: '#3B7E89',
    waterRipple: '#96D7DF',
    goldenSun: '#F4C978',
    warmCream: '#FFF2D5',
    woodDark: '#5E3A26',
    woodLight: '#946142',
    roofTile: '#A84C38',
    roofDark: '#783223',
    skinLight: '#FBD3AC',
    skinShadow: '#D8A078',
    hairBlack: '#212121',
    shirtBlue: '#4A7FB2',
    shirtRed: '#B84545',
    amberFire: '#FF8822',
    shadow: 'rgba(20, 30, 20, 0.35)'
  };

  /**
   * Helper to draw a pixel on a 2D canvas context
   */
  private static setPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
  }

  /**
   * Generates 4-directional Player Spritesheet
   * 3 frames per direction: Down (0,1,2), Left (3,4,5), Right (6,7,8), Up (9,10,11)
   * Size: 32x32 per frame, total width: 384x32
   */
  public static generatePlayerSpritesheet(): HTMLCanvasElement {
    const frameW = 32;
    const frameH = 32;
    const totalFrames = 12;
    const canvas = document.createElement('canvas');
    canvas.width = frameW * totalFrames;
    canvas.height = frameH;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < totalFrames; f++) {
      const offsetX = f * frameW;
      const dirIndex = Math.floor(f / 3); // 0: down, 1: left, 2: right, 3: up
      const stepPhase = f % 3; // 0: idle, 1: step left, 2: step right

      // Draw shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(offsetX + 16, 29, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head position
      const headX = offsetX + 11;
      const headY = 6;
      const headW = 10;
      const headH = 9;

      // Draw Traditional Nón Lá (Conical Palm Hat)
      ctx.fillStyle = this.PALETTE.warmCream;
      ctx.beginPath();
      ctx.moveTo(offsetX + 16, 2);
      ctx.lineTo(offsetX + 8, 10);
      ctx.lineTo(offsetX + 24, 10);
      ctx.closePath();
      ctx.fill();
      // Hat outline & shadow
      ctx.strokeStyle = this.PALETTE.warmEarth;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Face
      ctx.fillStyle = this.PALETTE.skinLight;
      ctx.fillRect(headX + 1, headY + 3, headW - 2, headH - 2);

      // Facial features according to direction
      ctx.fillStyle = this.PALETTE.hairBlack;
      if (dirIndex === 0) {
        // Down
        ctx.fillRect(offsetX + 13, headY + 5, 2, 2); // left eye
        ctx.fillRect(offsetX + 17, headY + 5, 2, 2); // right eye
      } else if (dirIndex === 1) {
        // Left
        ctx.fillRect(offsetX + 12, headY + 5, 2, 2); // left eye
      } else if (dirIndex === 2) {
        // Right
        ctx.fillRect(offsetX + 18, headY + 5, 2, 2); // right eye
      } else {
        // Up - back of hair
        ctx.fillStyle = this.PALETTE.hairBlack;
        ctx.fillRect(headX + 1, headY + 3, headW - 2, 4);
      }

      // Torso (Traveler Shirt: Forest/Tea accented blue)
      const torsoY = 14;
      ctx.fillStyle = this.PALETTE.shirtBlue;
      ctx.fillRect(offsetX + 11, torsoY, 10, 8);

      // Backpack / Khăn rằn
      if (dirIndex === 3) {
        // Back view: Traveler Backpack
        ctx.fillStyle = this.PALETTE.warmEarth;
        ctx.fillRect(offsetX + 12, torsoY + 1, 8, 7);
        ctx.fillStyle = this.PALETTE.goldenSun;
        ctx.fillRect(offsetX + 14, torsoY + 3, 4, 2);
      } else {
        // Front/side collar
        ctx.fillStyle = this.PALETTE.warmCream;
        ctx.fillRect(offsetX + 15, torsoY, 2, 3);
      }

      // Legs / Walking animation
      const legY = 22;
      ctx.fillStyle = this.PALETTE.darkForest;
      let leftLegOffset = 0;
      let rightLegOffset = 0;

      if (stepPhase === 1) {
        leftLegOffset = -2;
        rightLegOffset = 1;
      } else if (stepPhase === 2) {
        leftLegOffset = 1;
        rightLegOffset = -2;
      }

      // Left leg
      ctx.fillRect(offsetX + 12, legY, 3, 6 + leftLegOffset);
      // Right leg
      ctx.fillRect(offsetX + 17, legY, 3, 6 + rightLegOffset);

      // Boots
      ctx.fillStyle = this.PALETTE.darkEarth;
      ctx.fillRect(offsetX + 11, legY + 5 + leftLegOffset, 4, 3);
      ctx.fillRect(offsetX + 17, legY + 5 + rightLegOffset, 4, 3);
    }

    return canvas;
  }

  /**
   * Generates NPC Spritesheet (Elder Artisan Bác Lâm)
   */
  public static generateArtisanSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair (Elderly silver grey)
      ctx.fillStyle = '#D6D6D6';
      ctx.fillRect(ox + 11, 6 + breathe, 10, 7);

      // Face
      ctx.fillStyle = this.PALETTE.skinShadow;
      ctx.fillRect(ox + 12, 9 + breathe, 8, 7);
      // Eyes (kind smile)
      ctx.fillStyle = '#333333';
      ctx.fillRect(ox + 14, 11 + breathe, 1, 2);
      ctx.fillRect(ox + 17, 11 + breathe, 1, 2);
      // White beard
      ctx.fillStyle = '#EEEEEE';
      ctx.fillRect(ox + 14, 14 + breathe, 4, 3);

      // Traditional Vietnamese Brown Tunic (Áo nâu sồng)
      ctx.fillStyle = this.PALETTE.darkEarth;
      ctx.fillRect(ox + 10, 16 + breathe, 12, 8);
      // Buttons
      ctx.fillStyle = this.PALETTE.warmCream;
      ctx.fillRect(ox + 15, 17 + breathe, 2, 2);
      ctx.fillRect(ox + 15, 20 + breathe, 2, 2);

      // Pants
      ctx.fillStyle = '#2A2A2A';
      ctx.fillRect(ox + 11, 24, 4, 5);
      ctx.fillRect(ox + 17, 24, 4, 5);
    }

    return canvas;
  }

  /**
   * Generates NPC Spritesheet (Bé Mai - Young tea picker)
   */
  public static generateTeaPickerSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nón lá
      ctx.fillStyle = this.PALETTE.warmCream;
      ctx.beginPath();
      ctx.moveTo(ox + 16, 4 + breathe);
      ctx.lineTo(ox + 9, 11 + breathe);
      ctx.lineTo(ox + 23, 11 + breathe);
      ctx.closePath();
      ctx.fill();

      // Face
      ctx.fillStyle = this.PALETTE.skinLight;
      ctx.fillRect(ox + 12, 10 + breathe, 8, 5);
      // Eyes & blushing cheeks
      ctx.fillStyle = '#222';
      ctx.fillRect(ox + 13, 12 + breathe, 1, 2);
      ctx.fillRect(ox + 18, 12 + breathe, 1, 2);
      ctx.fillStyle = '#FF9999';
      ctx.fillRect(ox + 12, 13 + breathe, 1, 1);
      ctx.fillRect(ox + 19, 13 + breathe, 1, 1);

      // Colorful floral / light pink shirt
      ctx.fillStyle = '#E87A90';
      ctx.fillRect(ox + 11, 16 + breathe, 10, 7);

      // Bamboo tea basket on side/back
      ctx.fillStyle = this.PALETTE.warmEarth;
      ctx.fillRect(ox + 20, 16 + breathe, 4, 6);
      ctx.fillStyle = this.PALETTE.lightGrass;
      ctx.fillRect(ox + 20, 15 + breathe, 4, 2); // Tea leaves in basket

      // Pants
      ctx.fillStyle = '#1D3B2B';
      ctx.fillRect(ox + 12, 23, 3, 6);
      ctx.fillRect(ox + 17, 23, 3, 6);
    }

    return canvas;
  }

  /**
   * Generates NPC Spritesheet (Chú Tuấn - Tourism guide)
   */
  public static generateGuideSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = this.PALETTE.hairBlack;
      ctx.fillRect(ox + 11, 6 + breathe, 10, 4);

      // Face
      ctx.fillStyle = this.PALETTE.skinLight;
      ctx.fillRect(ox + 11, 9 + breathe, 10, 6);
      // Friendly eyes
      ctx.fillStyle = '#111';
      ctx.fillRect(ox + 13, 11 + breathe, 2, 2);
      ctx.fillRect(ox + 17, 11 + breathe, 2, 2);

      // Guide Vest (Khaki / Green with Badge)
      ctx.fillStyle = '#5A7D50';
      ctx.fillRect(ox + 10, 15 + breathe, 12, 8);
      // ID Badge & Camera strap
      ctx.fillStyle = this.PALETTE.goldenSun;
      ctx.fillRect(ox + 17, 17 + breathe, 3, 4);
      ctx.fillStyle = '#222';
      ctx.fillRect(ox + 11, 16 + breathe, 2, 6);

      // Pants
      ctx.fillStyle = '#3F4E4F';
      ctx.fillRect(ox + 12, 23, 3, 6);
      ctx.fillRect(ox + 17, 23, 3, 6);
    }

    return canvas;
  }

  /**
   * Generates Lush Pixel Art Tea Bush (32x32)
   */
  public static generateTeaBushSprite(hasHarvestableBuds: boolean = true): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Bush shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.beginPath();
    ctx.ellipse(16, 28, 14, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Base deep foliage
    ctx.fillStyle = this.PALETTE.darkForest;
    ctx.beginPath();
    ctx.ellipse(16, 19, 13, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Medium tea foliage
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.beginPath();
    ctx.ellipse(16, 17, 12, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top lush light foliage highlights
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.beginPath();
    ctx.ellipse(16, 13, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clusters of leaves
    ctx.fillStyle = this.PALETTE.veryLightGrass;
    ctx.fillRect(10, 10, 3, 2);
    ctx.fillRect(18, 9, 4, 2);
    ctx.fillRect(14, 14, 3, 2);

    // Harvestable young shoots ("1 tôm 2 lá") shining in the morning sun
    if (hasHarvestableBuds) {
      ctx.fillStyle = this.PALETTE.goldenSun;
      // Shoot 1
      ctx.fillRect(9, 7, 2, 4);
      ctx.fillStyle = '#D6FF79';
      ctx.fillRect(8, 9, 1, 2);
      ctx.fillRect(11, 9, 1, 2);

      // Shoot 2
      ctx.fillStyle = this.PALETTE.goldenSun;
      ctx.fillRect(19, 6, 2, 4);
      ctx.fillStyle = '#D6FF79';
      ctx.fillRect(18, 8, 1, 2);
      ctx.fillRect(21, 8, 1, 2);

      // Shoot 3
      ctx.fillStyle = this.PALETTE.goldenSun;
      ctx.fillRect(15, 8, 2, 4);
      ctx.fillStyle = '#D6FF79';
      ctx.fillRect(14, 10, 1, 2);
      ctx.fillRect(17, 10, 1, 2);
    }

    return canvas;
  }

  /**
   * Generates Traditional Northern House (Nhà ngói / nhà sàn Bắc Bộ)
   * Size: 96x96
   */
  public static generateTraditionalHouse(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    // Ground shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.fillRect(8, 70, 80, 24);

    // Stone base / porch
    ctx.fillStyle = '#8C8C8C';
    ctx.fillRect(12, 64, 72, 10);
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(12, 72, 72, 3);

    // Wooden walls (Vách gỗ mộc mạc)
    ctx.fillStyle = this.PALETTE.woodLight;
    ctx.fillRect(16, 36, 64, 30);

    // Wooden pillars
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.fillRect(16, 36, 4, 30);
    ctx.fillRect(36, 36, 4, 30);
    ctx.fillRect(56, 36, 4, 30);
    ctx.fillRect(76, 36, 4, 30);

    // Wooden Door & Windows with lattice
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(43, 44, 10, 20); // Central door
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(44, 46, 3, 5); // Window light inside
    ctx.fillRect(49, 46, 3, 5);

    // Windows
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(23, 44, 8, 10);
    ctx.fillRect(65, 44, 8, 10);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(24, 45, 6, 8);
    ctx.fillRect(66, 45, 6, 8);

    // Traditional Curved Clay Tile Roof (Mái ngói âm dương / ngói mũi hài)
    ctx.fillStyle = this.PALETTE.roofDark;
    ctx.beginPath();
    ctx.moveTo(48, 8);
    ctx.lineTo(4, 38);
    ctx.lineTo(92, 38);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = this.PALETTE.roofTile;
    ctx.beginPath();
    ctx.moveTo(48, 11);
    ctx.lineTo(8, 36);
    ctx.lineTo(88, 36);
    ctx.closePath();
    ctx.fill();

    // Tile ridge details
    ctx.fillStyle = this.PALETTE.warmCream;
    ctx.fillRect(44, 6, 8, 4); // Roof crest decoration
    ctx.strokeStyle = this.PALETTE.roofDark;
    ctx.lineWidth = 1;
    for (let i = 16; i < 80; i += 8) {
      ctx.beginPath();
      ctx.moveTo(48, 11);
      ctx.lineTo(i, 36);
      ctx.stroke();
    }

    // Traditional red lantern hanging on porch
    ctx.fillStyle = this.PALETTE.shirtRed;
    ctx.fillRect(26, 36, 4, 6);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(27, 42, 2, 3); // tassel

    ctx.fillStyle = this.PALETTE.shirtRed;
    ctx.fillRect(66, 36, 4, 6);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(67, 42, 2, 3);

    return canvas;
  }

  /**
   * Generates Tea Processing Workshop / Chòi Chế Biến Trà
   * Features a wood stove with cast iron wok (Chảo sao chè)
   */
  public static generateTeaWorkshop(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Platform
    ctx.fillStyle = this.PALETTE.warmEarth;
    ctx.fillRect(4, 42, 56, 18);

    // Bamboo pavilion posts
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.fillRect(6, 16, 4, 28);
    ctx.fillRect(54, 16, 4, 28);

    // Thatch roof (Mái lá cọ vùng trung du Thái Nguyên)
    ctx.fillStyle = this.PALETTE.warmCream;
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.lineTo(0, 18);
    ctx.lineTo(64, 18);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = this.PALETTE.warmEarth;
    ctx.fillRect(2, 17, 60, 2);

    // Brick wood-fired stove (Bếp củi sao chè)
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(20, 36, 24, 18);
    // Cast iron wok (Chảo gang)
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.ellipse(32, 36, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fire opening
    ctx.fillStyle = '#111111';
    ctx.fillRect(27, 44, 10, 8);
    // Glowing amber fire
    ctx.fillStyle = this.PALETTE.amberFire;
    ctx.fillRect(29, 47, 6, 5);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(30, 48, 4, 3);

    // Green tea leaves being rolled/roasted in wok
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.fillRect(26, 34, 12, 2);
    ctx.fillStyle = this.PALETTE.veryLightGrass;
    ctx.fillRect(28, 34, 4, 1);

    return canvas;
  }

  /**
   * Generates NPC Spritesheet (Cô Hương - Nursery Shopkeeper)
   * Size: 128x32 (4 frames: 32x32 each)
   */
  public static generateShopkeeperSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair (Neat black bun with green headband)
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(ox + 10, 5 + breathe, 12, 7);
      // Green patterned headband
      ctx.fillStyle = '#2A7B5E';
      ctx.fillRect(ox + 11, 7 + breathe, 10, 2);

      // Face
      ctx.fillStyle = this.PALETTE.skinLight;
      ctx.fillRect(ox + 12, 9 + breathe, 8, 6);
      // Bright kind eyes & friendly smile
      ctx.fillStyle = '#222';
      ctx.fillRect(ox + 13, 11 + breathe, 1, 2);
      ctx.fillRect(ox + 18, 11 + breathe, 1, 2);
      ctx.fillStyle = '#FF9988';
      ctx.fillRect(ox + 12, 13 + breathe, 1, 1);
      ctx.fillRect(ox + 19, 13 + breathe, 1, 1);

      // Jade-green traditional shirt
      ctx.fillStyle = '#2E6F54';
      ctx.fillRect(ox + 10, 15 + breathe, 12, 9);

      // Gardener Linen Apron
      ctx.fillStyle = '#C4A482';
      ctx.fillRect(ox + 12, 17 + breathe, 8, 7);
      ctx.fillStyle = '#8B6B4A';
      ctx.fillRect(ox + 13, 19 + breathe, 6, 4); // Pocket with small wooden tag

      // Holding a small wooden seedling tray with green shoots
      ctx.fillStyle = '#5A3825';
      ctx.fillRect(ox + 11, 20 + breathe, 10, 3);
      ctx.fillStyle = '#88D840';
      ctx.fillRect(ox + 12, 18 + breathe, 2, 2);
      ctx.fillRect(ox + 15, 18 + breathe, 2, 2);
      ctx.fillRect(ox + 18, 18 + breathe, 2, 2);

      // Pants & shoes
      ctx.fillStyle = '#263238';
      ctx.fillRect(ox + 12, 24, 3, 5);
      ctx.fillRect(ox + 17, 24, 3, 5);
    }

    return canvas;
  }

  /**
   * Generates Village Tea Nursery Shop (Cửa Hàng Cây Giống & Vật Tư Xứ Trà)
   * Size: 96x80
   */
  public static generateNurseryShop(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Ground shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.fillRect(6, 60, 84, 18);

    // Stone foundation / wooden platform
    ctx.fillStyle = '#8D7B68';
    ctx.fillRect(10, 56, 76, 8);
    ctx.fillStyle = '#5E4B3C';
    ctx.fillRect(10, 62, 76, 2);

    // Timber posts & back wall
    ctx.fillStyle = '#B89065';
    ctx.fillRect(14, 28, 68, 30);
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.fillRect(14, 26, 4, 32);
    ctx.fillRect(46, 26, 4, 32);
    ctx.fillRect(78, 26, 4, 32);

    // Display Shelves with Seedlings and Supplies
    // Lower counter
    ctx.fillStyle = '#6D4C3D';
    ctx.fillRect(18, 44, 60, 14);
    ctx.fillStyle = '#8B5A2B';
    ctx.fillRect(18, 43, 60, 2);

    // Shelf items:
    // 1. Seedling pots (green shoots)
    for (let bx = 22; bx < 42; bx += 7) {
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(bx, 46, 5, 4); // Terra cotta pots
      ctx.fillStyle = '#76C043';
      ctx.fillRect(bx + 1, 42, 3, 4); // Green shoot
      ctx.fillStyle = '#9FE855';
      ctx.fillRect(bx + 2, 40, 2, 2); // Tiny tender leaf
    }

    // 2. Burlap sacks of organic compost
    ctx.fillStyle = '#C8AD7F';
    ctx.beginPath();
    ctx.ellipse(56, 50, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5A3E26';
    ctx.fillRect(54, 46, 4, 2); // Bag tie
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(55, 49, 3, 3); // Organic Leaf badge

    ctx.fillStyle = '#BFA070';
    ctx.beginPath();
    ctx.ellipse(68, 51, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper Shelf with Seed jars & gardening shears
    ctx.fillStyle = '#5E3A26';
    ctx.fillRect(20, 32, 56, 2);
    // Seed jars
    ctx.fillStyle = '#D6EAF8';
    ctx.fillRect(24, 27, 4, 5);
    ctx.fillStyle = '#784212';
    ctx.fillRect(25, 29, 2, 3); // Seeds inside jar
    ctx.fillStyle = '#D6EAF8';
    ctx.fillRect(32, 27, 4, 5);
    ctx.fillStyle = '#27AE60';
    ctx.fillRect(33, 29, 2, 3);

    // Green tiled eaves / awning
    ctx.fillStyle = '#1D3B2B';
    ctx.beginPath();
    ctx.moveTo(48, 6);
    ctx.lineTo(4, 26);
    ctx.lineTo(92, 26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#355C46';
    ctx.beginPath();
    ctx.moveTo(48, 9);
    ctx.lineTo(8, 24);
    ctx.lineTo(88, 24);
    ctx.closePath();
    ctx.fill();

    // Wooden shop signboard: "VƯỜN GIỐNG XỨ TRÀ"
    ctx.fillStyle = '#4A2E18';
    ctx.fillRect(22, 14, 52, 9);
    ctx.fillStyle = '#F4C978';
    ctx.fillRect(23, 15, 50, 7);
    ctx.fillStyle = '#1D3B2B';
    // Simplified pixel glyphs for signboard
    ctx.fillRect(26, 17, 44, 3);

    return canvas;
  }

  /**
   * Generates 16x16 Environment Tileset
   * Size: 128x64 (8x4 tiles)
   */
  public static generateEnvironmentTileset(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Tile 0: Light Green Grass (Base ground)
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.fillRect(0, 0, 16, 16);
    // Subtle grass blades
    ctx.fillStyle = this.PALETTE.veryLightGrass;
    ctx.fillRect(3, 4, 1, 2);
    ctx.fillRect(11, 9, 1, 2);
    ctx.fillRect(7, 13, 1, 2);

    // Tile 1: Tea Hill Terraced Grass (Slightly darker ridge)
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.fillRect(16, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.forestGreen;
    ctx.fillRect(16, 14, 16, 2); // Contour shadow
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.fillRect(18, 3, 2, 2);

    // Tile 2: Dirt Country Path (Đường đất liên thôn)
    ctx.fillStyle = this.PALETTE.lightPath;
    ctx.fillRect(32, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.warmEarth;
    ctx.fillRect(34, 3, 2, 2);
    ctx.fillRect(42, 10, 3, 2);
    ctx.fillRect(37, 12, 2, 1);

    // Tile 3: Dirt Path Edge
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.fillRect(48, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.lightPath;
    ctx.fillRect(48, 4, 16, 12);

    // Tile 4: Deep River Water (Suối / Hồ Núi Cốc)
    ctx.fillStyle = this.PALETTE.lakeBlue;
    ctx.fillRect(64, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.waterRipple;
    ctx.fillRect(66, 4, 6, 1);
    ctx.fillRect(71, 11, 7, 1);

    // Tile 5: Deep Forest Foliage (Border Trees)
    ctx.fillStyle = this.PALETTE.darkForest;
    ctx.fillRect(80, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.forestGreen;
    ctx.fillRect(82, 3, 12, 10);
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.fillRect(85, 5, 6, 6);

    // Tile 6: Wooden Bridge Plank
    ctx.fillStyle = this.PALETTE.woodLight;
    ctx.fillRect(96, 0, 16, 16);
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.fillRect(96, 0, 16, 1);
    ctx.fillRect(96, 15, 16, 1);
    ctx.fillStyle = '#4A2E1B';
    ctx.fillRect(98, 4, 2, 8);
    ctx.fillRect(108, 4, 2, 8);

    // Tile 7: Stone Paving / Landmark Step
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(112, 0, 16, 16);
    ctx.fillStyle = '#757575';
    ctx.fillRect(112, 7, 16, 2);
    ctx.fillRect(119, 0, 2, 7);
    ctx.fillRect(115, 9, 2, 7);

    // Row 2: Flower details, rocks, water borders
    // Tile 8: Wild Yellow Flowers on Grass
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.fillRect(0, 16, 16, 16);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(4, 20, 2, 2);
    ctx.fillRect(10, 25, 2, 2);
    ctx.fillStyle = '#FFF';
    ctx.fillRect(5, 21, 1, 1);

    // Tile 9: Rock / Pebble
    ctx.fillStyle = this.PALETTE.lightGrass;
    ctx.fillRect(16, 16, 16, 16);
    ctx.fillStyle = '#78909C';
    ctx.fillRect(20, 22, 6, 4);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(21, 21, 4, 2);

    // Tile 10: Bamboo Grove Stems
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.fillRect(32, 16, 16, 16);
    ctx.fillStyle = this.PALETTE.veryLightGrass;
    ctx.fillRect(35, 16, 2, 16);
    ctx.fillRect(43, 16, 2, 16);
    ctx.fillStyle = this.PALETTE.forestGreen;
    ctx.fillRect(35, 22, 2, 1);
    ctx.fillRect(43, 27, 2, 1);

    return canvas;
  }

  /**
   * Generates Floating Ambient Leaf Particle
   */
  public static generateLeafParticle(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 6;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = this.PALETTE.veryLightGrass;
    ctx.beginPath();
    ctx.ellipse(3, 3, 2.5, 1.5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Generates Floating Butterfly Particle
   */
  public static generateButterflyParticle(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = this.PALETTE.warmCream;
    ctx.fillRect(1, 1, 3, 3);
    ctx.fillRect(5, 1, 3, 3);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillRect(6, 2, 1, 1);
    ctx.fillStyle = '#222';
    ctx.fillRect(4, 2, 1, 4);

    return canvas;
  }

  /**
   * Generates Wooden Boat Sprite for Lake Ho Nui Coc (48x24)
   */
  public static generateBoatSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    // Water ripple shadow
    ctx.fillStyle = 'rgba(30, 80, 90, 0.4)';
    ctx.beginPath();
    ctx.ellipse(24, 18, 22, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden hull (Thuyền nan mộc mạc)
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.beginPath();
    ctx.moveTo(4, 10);
    ctx.lineTo(44, 10);
    ctx.lineTo(38, 18);
    ctx.lineTo(10, 18);
    ctx.closePath();
    ctx.fill();

    // Wood planks
    ctx.fillStyle = this.PALETTE.woodLight;
    ctx.fillRect(8, 7, 32, 4);

    // Oar / Mái chèo
    ctx.fillStyle = this.PALETTE.warmEarth;
    ctx.fillRect(20, 3, 2, 14);
    ctx.fillRect(18, 15, 6, 3);

    return canvas;
  }

  /**
   * Generates ATK Historical Bamboo Lán / Stilt House (64x64)
   */
  public static generateStiltHouseATK(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Bamboo pillars
    ctx.fillStyle = this.PALETTE.woodDark;
    ctx.fillRect(8, 30, 4, 30);
    ctx.fillRect(26, 30, 4, 30);
    ctx.fillRect(44, 30, 4, 30);
    ctx.fillRect(56, 30, 4, 30);

    // Bamboo floor
    ctx.fillStyle = this.PALETTE.woodLight;
    ctx.fillRect(4, 28, 56, 4);

    // Walls of woven bamboo (Vách nứa)
    ctx.fillStyle = this.PALETTE.warmEarth;
    ctx.fillRect(8, 14, 48, 16);

    // Palm leaf thatch roof (Mái lá cọ chiến khu ATK)
    ctx.fillStyle = this.PALETTE.teaGreen;
    ctx.beginPath();
    ctx.moveTo(32, 2);
    ctx.lineTo(0, 16);
    ctx.lineTo(64, 16);
    ctx.closePath();
    ctx.fill();

    // Red flag with yellow star small insignia
    ctx.fillStyle = this.PALETTE.shirtRed;
    ctx.fillRect(29, 6, 6, 4);
    ctx.fillStyle = this.PALETTE.goldenSun;
    ctx.fillRect(31, 7, 2, 2);

    return canvas;
  }

  /**
   * Generates Stalactite / Cave Boulder for Hang Phuong Hoang (32x32)
   */
  public static generateCavernRock(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Stalactite / limestone boulder
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.moveTo(16, 2);
    ctx.lineTo(28, 28);
    ctx.lineTo(4, 28);
    ctx.closePath();
    ctx.fill();

    // Crystalline highlights & glowing moss
    ctx.fillStyle = '#CBD5E0';
    ctx.fillRect(14, 8, 3, 10);
    ctx.fillStyle = '#48BB78'; // Glowing cave moss
    ctx.fillRect(8, 22, 6, 3);
    ctx.fillRect(20, 24, 4, 2);

    return canvas;
  }

  /**
   * Generates Granite River Boulder for Suoi Cua Tu (32x32)
   */
  public static generateRiverBoulder(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Rounded water-carved granite stone
    ctx.fillStyle = '#718096';
    ctx.beginPath();
    ctx.ellipse(16, 18, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sunlit edge
    ctx.fillStyle = '#A0AEC0';
    ctx.beginPath();
    ctx.ellipse(14, 15, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Moss patch
    ctx.fillStyle = this.PALETTE.forestGreen;
    ctx.fillRect(10, 16, 5, 2);

    return canvas;
  }

  /**
   * Generates Fisherman NPC (Lão Ngư Hồ Núi Cốc)
   */
  public static generateFishermanSprite(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nón lá
      ctx.fillStyle = this.PALETTE.warmCream;
      ctx.beginPath();
      ctx.moveTo(ox + 16, 4 + breathe);
      ctx.lineTo(ox + 9, 11 + breathe);
      ctx.lineTo(ox + 23, 11 + breathe);
      ctx.closePath();
      ctx.fill();

      // Face
      ctx.fillStyle = this.PALETTE.skinShadow;
      ctx.fillRect(ox + 12, 10 + breathe, 8, 5);
      // Grey beard
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(ox + 14, 13 + breathe, 4, 3);

      // Blue tunic (Áo chàm sông nước)
      ctx.fillStyle = '#2B6CB0';
      ctx.fillRect(ox + 11, 16 + breathe, 10, 7);

      // Fishing rod
      ctx.fillStyle = this.PALETTE.warmEarth;
      ctx.fillRect(ox + 21, 8, 2, 18);

      // Pants
      ctx.fillStyle = '#1A202C';
      ctx.fillRect(ox + 12, 23, 3, 6);
      ctx.fillRect(ox + 17, 23, 3, 6);
    }

    return canvas;
  }

  /**
   * Generates Tea Bush Variants (Standard, Dense, Young, Flowering)
   */
  public static generateTeaBushVariant(type: 'standard' | 'dense' | 'young' | 'flowering'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Bush ground shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.beginPath();
    ctx.ellipse(16, 28, type === 'dense' ? 15 : 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'dense') {
      // Broad lush dome
      ctx.fillStyle = '#163124';
      ctx.beginPath();
      ctx.ellipse(16, 19, 14, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.forestGreen;
      ctx.beginPath();
      ctx.ellipse(16, 17, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.teaGreen;
      ctx.beginPath();
      ctx.ellipse(16, 14, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top highlights
      ctx.fillStyle = this.PALETTE.lightGrass;
      ctx.fillRect(8, 11, 4, 2);
      ctx.fillRect(15, 9, 5, 2);
      ctx.fillRect(22, 12, 3, 2);

      // Young shoots
      ctx.fillStyle = '#D6FF79';
      ctx.fillRect(11, 6, 2, 4);
      ctx.fillRect(18, 5, 2, 4);
      ctx.fillRect(23, 7, 2, 3);
    } else if (type === 'young') {
      // Slighter, brighter spring shoots
      ctx.fillStyle = '#1D3B2B';
      ctx.beginPath();
      ctx.ellipse(16, 21, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.teaGreen;
      ctx.beginPath();
      ctx.ellipse(16, 18, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.lightGrass;
      ctx.beginPath();
      ctx.ellipse(16, 15, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Golden young buds
      ctx.fillStyle = '#E8FF88';
      ctx.fillRect(10, 10, 2, 3);
      ctx.fillRect(15, 8, 2, 4);
      ctx.fillRect(20, 9, 2, 3);
      ctx.fillRect(13, 12, 2, 2);
    } else if (type === 'flowering') {
      // Lush bush with blooming white tea flowers
      ctx.fillStyle = this.PALETTE.darkForest;
      ctx.beginPath();
      ctx.ellipse(16, 19, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.teaGreen;
      ctx.beginPath();
      ctx.ellipse(16, 16, 12, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = this.PALETTE.lightGrass;
      ctx.beginPath();
      ctx.ellipse(16, 13, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // White flowers with yellow stamens (Hoa chè trắng nhụy vàng)
      const flowers = [{ x: 9, y: 11 }, { x: 21, y: 10 }, { x: 15, y: 16 }, { x: 12, y: 7 }];
      flowers.forEach(f => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(f.x - 1, f.y, 3, 1);
        ctx.fillRect(f.x, f.y - 1, 1, 3);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(f.x, f.y, 1, 1);
      });
    } else {
      return this.generateTeaBushSprite(true);
    }

    return canvas;
  }

  /**
   * Generates Chòi Thưởng Trà Tân Cương (Scenic Tea Pavilion)
   * Size: 96x96
   */
  public static generateTeaPavilion(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    // Foundation shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.fillRect(4, 68, 88, 24);

    // Stone terrace platform
    ctx.fillStyle = '#5A5A5A';
    ctx.fillRect(8, 64, 80, 16);
    ctx.fillStyle = '#8E8E8E';
    ctx.fillRect(8, 62, 80, 4);
    ctx.fillStyle = '#3E3E3E';
    ctx.fillRect(8, 78, 80, 2);

    // Stone Steps leading up (central entrance)
    ctx.fillStyle = '#BDBDBD';
    ctx.fillRect(36, 72, 24, 6);
    ctx.fillStyle = '#757575';
    ctx.fillRect(36, 78, 24, 2);

    // Wooden pavilion floor
    ctx.fillStyle = '#8D5B36';
    ctx.fillRect(12, 54, 72, 10);
    ctx.fillStyle = '#A06D44';
    ctx.fillRect(12, 53, 72, 2);

    // Four carved wooden pillars
    ctx.fillStyle = '#4A2A18';
    ctx.fillRect(14, 20, 5, 36);
    ctx.fillRect(77, 20, 5, 36);
    ctx.fillRect(28, 22, 4, 34);
    ctx.fillRect(64, 22, 4, 34);

    // Wooden crossbeams
    ctx.fillStyle = '#5E3820';
    ctx.fillRect(12, 22, 72, 4);

    // Low wooden tea table (Bàn trà bệt)
    ctx.fillStyle = '#6D4428';
    ctx.fillRect(38, 48, 20, 8);
    ctx.fillStyle = '#8C5A37';
    ctx.fillRect(37, 46, 22, 3);
    // Table legs
    ctx.fillStyle = '#3E2415';
    ctx.fillRect(39, 54, 2, 4);
    ctx.fillRect(55, 54, 2, 4);

    // Traditional Ceramic Teapot & Cups
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(44, 42, 6, 4);
    ctx.fillStyle = '#5C2E0B';
    ctx.fillRect(43, 43, 1, 2); // spout
    ctx.fillRect(50, 43, 2, 3); // handle
    ctx.fillRect(46, 41, 2, 1); // lid
    // Two small tea cups with green tea infusion
    ctx.fillStyle = '#FFF8E7';
    ctx.fillRect(40, 44, 3, 2);
    ctx.fillRect(53, 44, 3, 2);
    ctx.fillStyle = '#A8C879';
    ctx.fillRect(41, 44, 1, 1);
    ctx.fillRect(54, 44, 1, 1);

    // Low wooden benches on sides
    ctx.fillStyle = '#6D4428';
    ctx.fillRect(18, 50, 8, 6);
    ctx.fillRect(70, 50, 8, 6);

    // Traditional Curved Eaves Roof
    ctx.fillStyle = '#2A4D38';
    ctx.beginPath();
    ctx.moveTo(48, 2);
    ctx.lineTo(2, 24);
    ctx.lineTo(94, 24);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3B6B4E';
    ctx.beginPath();
    ctx.moveTo(48, 4);
    ctx.lineTo(6, 22);
    ctx.lineTo(90, 22);
    ctx.closePath();
    ctx.fill();

    // Curved roof horns & finial
    ctx.fillStyle = '#F4C978';
    ctx.fillRect(45, 0, 6, 4);
    ctx.fillRect(2, 20, 4, 3);
    ctx.fillRect(90, 20, 4, 3);

    // Hanging lantern
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(46, 25, 4, 5);
    ctx.fillStyle = '#F4C978';
    ctx.fillRect(47, 30, 2, 2);

    return canvas;
  }

  /**
   * Generates Enhanced Tea Processing Workshop
   * Size: 88x80
   */
  public static generateTeaWorkshopEnhanced(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 88;
    canvas.height = 80;
    const ctx = canvas.getContext('2d')!;

    // Ground shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.fillRect(4, 56, 80, 22);

    // Stone/earth platform
    ctx.fillStyle = '#825838';
    ctx.fillRect(6, 52, 76, 14);
    ctx.fillStyle = '#9C6F48';
    ctx.fillRect(6, 50, 76, 3);

    // Wooden timber posts
    ctx.fillStyle = '#4A2A18';
    ctx.fillRect(8, 22, 5, 34);
    ctx.fillRect(75, 22, 5, 34);
    ctx.fillRect(42, 22, 4, 34);

    // Traditional Brick Wood-fired Stove (Bếp lò sao chè)
    ctx.fillStyle = '#8B3A22';
    ctx.fillRect(18, 40, 32, 20);
    ctx.fillStyle = '#682512';
    ctx.fillRect(18, 58, 32, 2);

    // Cast iron roasting wok
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.ellipse(34, 40, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.ellipse(34, 41, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fresh tea leaves inside wok
    ctx.fillStyle = '#4E8A38';
    ctx.fillRect(26, 39, 16, 3);
    ctx.fillStyle = '#A3E048';
    ctx.fillRect(28, 40, 6, 1);
    ctx.fillRect(36, 39, 4, 1);

    // Stove firebox opening & glowing firewood
    ctx.fillStyle = '#0D0D0D';
    ctx.fillRect(27, 49, 14, 9);
    ctx.fillStyle = '#FF5500';
    ctx.fillRect(29, 52, 10, 6);
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(31, 54, 6, 3);

    // Chimney pipe on left
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(14, 12, 6, 30);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(13, 10, 8, 3);

    // Stack of firewood logs
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4 - row; col++) {
        ctx.fillStyle = '#5E3A26';
        ctx.fillRect(54 + col * 5 + row * 2, 54 - row * 4, 4, 3);
        ctx.fillStyle = '#946142';
        ctx.fillRect(55 + col * 5 + row * 2, 54 - row * 4, 1, 3);
      }
    }

    // Shelves with Tea jars
    ctx.fillStyle = '#4A2A18';
    ctx.fillRect(54, 34, 24, 3);
    ctx.fillStyle = '#D4A373';
    ctx.fillRect(56, 26, 6, 8);
    ctx.fillStyle = '#588157';
    ctx.fillRect(64, 26, 6, 8);
    ctx.fillStyle = '#CCD5AE';
    ctx.fillRect(72, 26, 5, 8);

    // Traditional Thatch/Palm Eaves Roof
    ctx.fillStyle = '#5A3E26';
    ctx.beginPath();
    ctx.moveTo(44, 4);
    ctx.lineTo(2, 22);
    ctx.lineTo(86, 22);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#7A5435';
    ctx.beginPath();
    ctx.moveTo(44, 6);
    ctx.lineTo(6, 20);
    ctx.lineTo(82, 20);
    ctx.closePath();
    ctx.fill();

    return canvas;
  }

  /**
   * Generates Enhanced Nursery Shop (Vườn Giống Cô Hương)
   * Size: 96x88
   */
  public static generateNurseryShopEnhanced(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 88;
    const ctx = canvas.getContext('2d')!;

    // Ground shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.fillRect(4, 66, 88, 20);

    // Stone footing
    ctx.fillStyle = '#786C5E';
    ctx.fillRect(8, 62, 80, 8);
    ctx.fillStyle = '#5A4E42';
    ctx.fillRect(8, 68, 80, 2);

    // Timber frame & back wall
    ctx.fillStyle = '#B0885E';
    ctx.fillRect(12, 30, 72, 34);
    ctx.fillStyle = '#4A2E18';
    ctx.fillRect(12, 28, 5, 36);
    ctx.fillRect(45, 28, 5, 36);
    ctx.fillRect(79, 28, 5, 36);

    // Tiered Seedling Display Counters
    ctx.fillStyle = '#6E472A';
    ctx.fillRect(16, 48, 64, 16);
    ctx.fillStyle = '#8B5A34';
    ctx.fillRect(16, 46, 64, 3);

    // Ceramic seedling pots with green shoots
    for (let i = 0; i < 4; i++) {
      const px = 20 + i * 8;
      ctx.fillStyle = '#A85A32';
      ctx.fillRect(px, 50, 6, 5);
      ctx.fillStyle = '#5A2A14';
      ctx.fillRect(px, 49, 6, 1);
      ctx.fillStyle = '#55A826';
      ctx.fillRect(px + 2, 44, 2, 5);
      ctx.fillStyle = '#9FE855';
      ctx.fillRect(px + 1, 43, 4, 2);
    }

    // Burlap Sacks of Organic Compost
    ctx.fillStyle = '#D2B48C';
    ctx.beginPath();
    ctx.ellipse(60, 54, 7, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(59, 52, 3, 3);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(58, 47, 4, 2);

    ctx.fillStyle = '#C8AD7F';
    ctx.beginPath();
    ctx.ellipse(72, 55, 6, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(70, 49, 4, 2);

    // Upper shelf with seed jars
    ctx.fillStyle = '#4A2E18';
    ctx.fillRect(18, 36, 60, 2);
    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(22, 30, 5, 6);
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(23, 32, 3, 3);
    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(30, 30, 5, 6);
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(31, 32, 3, 3);

    // Hanging copper lantern
    ctx.fillStyle = '#B87333';
    ctx.fillRect(72, 32, 4, 6);
    ctx.fillStyle = '#F4C978';
    ctx.fillRect(73, 34, 2, 3);

    // Wooden Eaves & Green Tiled Roof
    ctx.fillStyle = '#1D3B2B';
    ctx.beginPath();
    ctx.moveTo(48, 4);
    ctx.lineTo(2, 26);
    ctx.lineTo(94, 26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2D5A40';
    ctx.beginPath();
    ctx.moveTo(48, 7);
    ctx.lineTo(6, 24);
    ctx.lineTo(90, 24);
    ctx.closePath();
    ctx.fill();

    // Wooden signboard
    ctx.fillStyle = '#3E2415';
    ctx.fillRect(18, 14, 60, 11);
    ctx.fillStyle = '#F4C978';
    ctx.fillRect(19, 15, 58, 9);
    ctx.fillStyle = '#1D3B2B';
    ctx.font = 'bold 7px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VƯỜN GIỐNG', 48, 22);

    return canvas;
  }

  /**
   * Generates Tea Harvesting Basket Prop (Gùi tre hái chè)
   * Size: 24x24
   */
  public static generateTeaBasketProp(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    // Basket shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.beginPath();
    ctx.ellipse(12, 21, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Woven bamboo basket body
    ctx.fillStyle = '#A67B48';
    ctx.beginPath();
    ctx.moveTo(5, 8);
    ctx.lineTo(19, 8);
    ctx.lineTo(17, 20);
    ctx.lineTo(7, 20);
    ctx.closePath();
    ctx.fill();

    // Woven pattern lines
    ctx.strokeStyle = '#6E4E28';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Rim
    ctx.fillStyle = '#785328';
    ctx.fillRect(4, 7, 16, 2);

    // Mound of fresh green tea leaves overflowing
    ctx.fillStyle = '#4E8A38';
    ctx.beginPath();
    ctx.ellipse(12, 7, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9FE855';
    ctx.fillRect(9, 4, 3, 2);
    ctx.fillRect(13, 5, 4, 2);

    return canvas;
  }

  /**
   * Generates Tea Drying Bamboo Tray Prop (Nia tre phơi chè)
   * Size: 32x24
   */
  public static generateTeaDryingTray(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.beginPath();
    ctx.ellipse(16, 18, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Low wooden support trestle
    ctx.fillStyle = '#5A3825';
    ctx.fillRect(8, 14, 3, 6);
    ctx.fillRect(21, 14, 3, 6);

    // Large circular bamboo tray
    ctx.fillStyle = '#C4A46C';
    ctx.beginPath();
    ctx.ellipse(16, 12, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7D5A2E';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Thin layer of green tea leaves spread out to wither
    ctx.fillStyle = '#5E9944';
    ctx.beginPath();
    ctx.ellipse(16, 12, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8CD94B';
    ctx.fillRect(10, 10, 4, 2);
    ctx.fillRect(18, 11, 5, 2);

    return canvas;
  }

  /**
   * Generates Water Jar Prop (Chum sành trữ nước pha trà)
   * Size: 20x24
   */
  public static generateWaterJarProp(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 24;
    const ctx = canvas.getContext('2d')!;

    // Shadow
    ctx.fillStyle = this.PALETTE.shadow;
    ctx.beginPath();
    ctx.ellipse(10, 21, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Terracotta ceramic urn body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.ellipse(10, 13, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.ellipse(8, 11, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jar neck and rim
    ctx.fillStyle = '#5C2E0B';
    ctx.fillRect(6, 4, 8, 3);
    ctx.fillRect(5, 3, 10, 2);

    // Bamboo ladle (Gáo múc nước bằng tre)
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(12, 1, 2, 8);
    ctx.fillRect(10, 6, 4, 3);

    return canvas;
  }

  /**
   * Generates Rustic Bamboo Fence (Hàng rào tre mộc)
   * Size: 32x20
   */
  public static generateBambooFence(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 20;
    const ctx = canvas.getContext('2d')!;

    // Bamboo vertical posts
    for (let x = 4; x <= 28; x += 8) {
      ctx.fillStyle = '#8FBC8F';
      ctx.fillRect(x, 2, 3, 17);
      ctx.fillStyle = '#556B2F';
      ctx.fillRect(x, 7, 3, 1);
      ctx.fillRect(x, 13, 3, 1);
    }

    // Horizontal rails
    ctx.fillStyle = '#C2A649';
    ctx.fillRect(0, 6, 32, 2);
    ctx.fillRect(0, 12, 32, 2);
    ctx.fillStyle = '#8A6D2B';
    ctx.fillRect(0, 7, 32, 1);
    ctx.fillRect(0, 13, 32, 1);

    return canvas;
  }

  /**
   * Generates Distant Mountain Backdrop (Dãy núi Tam Đảo mù sương)
   * Size: 320x64
   */
  public static generateMountainBackdrop(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Sky soft atmospheric gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 64);
    skyGrad.addColorStop(0, '#BEE3DB');
    skyGrad.addColorStop(1, '#89B0AE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 320, 64);

    // Far mountain silhouettes (Cool hazy blue-grey)
    ctx.fillStyle = '#557B83';
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(0, 32);
    ctx.lineTo(40, 16);
    ctx.lineTo(90, 38);
    ctx.lineTo(140, 12);
    ctx.lineTo(200, 35);
    ctx.lineTo(260, 14);
    ctx.lineTo(320, 28);
    ctx.lineTo(320, 64);
    ctx.closePath();
    ctx.fill();

    // Mid-range lush hills (Tea green haze)
    ctx.fillStyle = '#395B64';
    ctx.beginPath();
    ctx.moveTo(0, 64);
    ctx.lineTo(0, 42);
    ctx.lineTo(60, 28);
    ctx.lineTo(120, 46);
    ctx.lineTo(180, 26);
    ctx.lineTo(240, 42);
    ctx.lineTo(290, 24);
    ctx.lineTo(320, 38);
    ctx.lineTo(320, 64);
    ctx.closePath();
    ctx.fill();

    // Soft morning mist layer along valleys
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(0, 46, 320, 8);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(0, 36, 320, 10);

    return canvas;
  }

  /**
   * Generates Ambient Tea Worker Spritesheet
   * Size: 128x32 (4 frames: 32x32 each)
   * Types: 'picker' (Bác Tám / Chị Lan), 'carrier' (Anh Hải), 'sorter' (Bác Ba)
   */
  public static generateAmbientWorkerSpritesheet(type: 'picker' | 'carrier' | 'sorter'): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 32 * 4;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    for (let f = 0; f < 4; f++) {
      const ox = f * 32;
      const breathe = f % 2 === 0 ? 0 : 1;

      // Shadow
      ctx.fillStyle = this.PALETTE.shadow;
      ctx.beginPath();
      ctx.ellipse(ox + 16, 29, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      if (type === 'picker') {
        // Tea Picker Worker (Brown traditional cotton clothes, nón lá, picking motion)
        const bend = (f === 1 || f === 2) ? 3 : 0;

        // Nón lá
        ctx.fillStyle = this.PALETTE.warmCream;
        ctx.beginPath();
        ctx.moveTo(ox + 16, 3 + breathe + bend);
        ctx.lineTo(ox + 8, 10 + breathe + bend);
        ctx.lineTo(ox + 24, 10 + breathe + bend);
        ctx.closePath();
        ctx.fill();

        // Face
        ctx.fillStyle = this.PALETTE.skinShadow;
        ctx.fillRect(ox + 12, 9 + breathe + bend, 8, 5);
        ctx.fillStyle = '#222';
        ctx.fillRect(ox + 13, 11 + breathe + bend, 1, 2);
        ctx.fillRect(ox + 18, 11 + breathe + bend, 1, 2);

        // Brown shirt (Áo nâu sồng)
        ctx.fillStyle = '#6D4C3D';
        ctx.fillRect(ox + 11, 15 + breathe + bend, 10, 8);

        // Reaching arm plucking leaves
        if (f === 1 || f === 2) {
          ctx.fillStyle = this.PALETTE.skinShadow;
          ctx.fillRect(ox + 20, 18, 5, 2);
          ctx.fillRect(ox + 24, 19, 2, 3);
          // Green leaf plucked in fingers
          ctx.fillStyle = '#A3E048';
          ctx.fillRect(ox + 25, 21, 2, 2);
        }

        // Bamboo side basket
        ctx.fillStyle = '#A67B48';
        ctx.fillRect(ox + 6, 17 + breathe + bend, 5, 7);
        ctx.fillStyle = '#638B45';
        ctx.fillRect(ox + 6, 16 + breathe + bend, 5, 2);

        // Pants & boots
        ctx.fillStyle = '#212121';
        ctx.fillRect(ox + 12, 23 + (bend > 0 ? 1 : 0), 3, 6);
        ctx.fillRect(ox + 17, 23 + (bend > 0 ? 1 : 0), 3, 6);
      } else if (type === 'carrier') {
        // Basket Carrier with Shoulder Pole (Đòn gánh hai bồ chè)
        const legOffset = (f === 1) ? 2 : (f === 3 ? -2 : 0);

        // Nón lá
        ctx.fillStyle = this.PALETTE.warmCream;
        ctx.beginPath();
        ctx.moveTo(ox + 16, 4 + breathe);
        ctx.lineTo(ox + 9, 11 + breathe);
        ctx.lineTo(ox + 23, 11 + breathe);
        ctx.closePath();
        ctx.fill();

        // Face
        ctx.fillStyle = this.PALETTE.skinLight;
        ctx.fillRect(ox + 12, 10 + breathe, 8, 5);
        ctx.fillStyle = '#222';
        ctx.fillRect(ox + 14, 12 + breathe, 1, 2);
        ctx.fillRect(ox + 18, 12 + breathe, 1, 2);

        // Indigo shirt (Áo chàm lam)
        ctx.fillStyle = '#3F51B5';
        ctx.fillRect(ox + 11, 15 + breathe, 10, 8);

        // Bamboo Shoulder Pole (Đòn gánh vắt ngang vai)
        ctx.fillStyle = '#C2A649';
        ctx.fillRect(ox + 2, 14 + breathe, 28, 2);

        // Two swaying tea baskets
        // Left basket
        ctx.fillStyle = '#8B6B4A';
        ctx.fillRect(ox + 2, 19 + breathe + (f === 1 ? -1 : 1), 6, 6);
        ctx.fillStyle = '#638B45';
        ctx.fillRect(ox + 2, 18 + breathe + (f === 1 ? -1 : 1), 6, 2);
        // Right basket
        ctx.fillStyle = '#8B6B4A';
        ctx.fillRect(ox + 24, 19 + breathe + (f === 1 ? 1 : -1), 6, 6);
        ctx.fillStyle = '#638B45';
        ctx.fillRect(ox + 24, 18 + breathe + (f === 1 ? 1 : -1), 6, 2);

        // Legs walking
        ctx.fillStyle = '#1D3B2B';
        ctx.fillRect(ox + 12, 23, 3, 6 + legOffset);
        ctx.fillRect(ox + 17, 23, 3, 6 - legOffset);
      } else {
        // Sorter / Artisan tending drying trays (Áo bà ba xám tro)
        ctx.fillStyle = this.PALETTE.warmCream;
        ctx.beginPath();
        ctx.moveTo(ox + 16, 5 + breathe);
        ctx.lineTo(ox + 9, 12 + breathe);
        ctx.lineTo(ox + 23, 12 + breathe);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.PALETTE.skinLight;
        ctx.fillRect(ox + 12, 11 + breathe, 8, 5);
        ctx.fillStyle = '#222';
        ctx.fillRect(ox + 13, 13 + breathe, 1, 2);
        ctx.fillRect(ox + 18, 13 + breathe, 1, 2);

        // Grey tunic
        ctx.fillStyle = '#78909C';
        ctx.fillRect(ox + 11, 16 + breathe, 10, 8);

        // Sorting hands moving over leaves
        ctx.fillStyle = this.PALETTE.skinLight;
        ctx.fillRect(ox + (f % 2 === 0 ? 8 : 10), 20 + breathe, 4, 3);
        ctx.fillRect(ox + (f % 2 === 0 ? 20 : 18), 20 + breathe, 4, 3);

        // Legs
        ctx.fillStyle = '#263238';
        ctx.fillRect(ox + 12, 24, 3, 5);
        ctx.fillRect(ox + 17, 24, 3, 5);
      }
    }

    return canvas;
  }
}

