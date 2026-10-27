import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { UIManager } from '../ui/UIManager';
import { QuestManager } from '../systems/QuestManager';
import { SaveManager } from '../systems/SaveManager';
import { RegionalExplorerGuide, ExplorationStop } from '../systems/RegionalExplorerGuide';
import { initializeRegionSystems, persistRegionCheckpoint, transitionToRegion } from '../systems/RegionRegistry';
import { DestinationActivityId, DestinationExhibition } from '../minigames/DestinationActivityMinigame';
import { ProgressionService } from '../systems/ProgressionService';
import { IDestination } from '../types/game';
import { DESTINATIONS } from '../data/destinations';

export interface RegionalChapterConfig {
  regionId: 'thai_hai' | 'den_duom' | 'bao_tang_van_hoa';
  sceneKey: string;
  guideName: string;
  stops: ExplorationStop[];
  activity: DestinationActivityId;
  stageObjectives: Record<string, string>;
}

export class RegionalChapterScene extends Phaser.Scene {
  private readonly width = 960;
  private readonly height = 720;
  private player!: Player;
  private guide?: RegionalExplorerGuide;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private controls?: AbortController;
  private nearestStop: ExplorationStop | null = null;
  private config: RegionalChapterConfig;
  private get destination(): IDestination { return DESTINATIONS[this.config.regionId]; }

  constructor(config: RegionalChapterConfig) {
    super({ key: config.sceneKey });
    this.config = config;
  }

  create() {
    const save = initializeRegionSystems(this.config.regionId);
    const position = save.regionProgress?.[this.config.regionId]?.player;
    this.player = new Player(this, position?.x ?? 480, position?.y ?? (this.config.regionId === 'den_duom' ? 670 : 560));
    if (position?.dir) this.player.setDirection(position.dir);
    UIManager.getInstance().setHUDVisible(true);
    UIManager.getInstance().setRegionName(this.destination.name);
    UIManager.getInstance().updateHUDQuest();
    this.createEnvironment();
    this.createGuideCharacter();
    this.createStops();
    this.physics.world.setBounds(16, 16, this.width - 32, this.height - 32);
    this.cameras.main.setBounds(0, 0, this.width, this.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.15);
    this.cameras.main.fadeIn(350);
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    this.guide = new RegionalExplorerGuide(this, this.config.regionId, this.destination.name, this.config.stops, () => this.player, () => QuestManager.getInstance().getCurrentObjectiveText(), stop => {
      this.player.setPosition(stop.x, stop.y + 42);
      this.player.setVelocity(0, 0);
      persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() }, stop.id);
    });
    this.bindMobileControls();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.controls?.abort();
      this.player?.setVirtualMovement(0, 0);
      persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
      this.guide?.destroy();
      UIManager.getInstance().hidePrompt();
    });
    UIManager.getInstance().setOnTravelCallback(regionId => {
      transitionToRegion(this, this.config.regionId, regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
    });
    UIManager.getInstance().showToast(`Chào mừng bạn đến ${this.destination.name}. Sơ đồ trong trò chơi có tính minh họa.`);
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    const blocking = UIManager.getInstance().isAnyModalOpen() || UIManager.getInstance().isDialogueOpen();
    this.player.setControlActive(!blocking);
    this.player.update(time, delta);
    this.guide?.update();
    if (blocking) {
      this.nearestStop = null;
      UIManager.getInstance().hidePrompt();
      return;
    }
    let nearest: ExplorationStop | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const stop of this.config.stops) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, stop.x, stop.y);
      if (distance < nearestDistance) { nearest = stop; nearestDistance = distance; }
    }
    this.nearestStop = nearestDistance <= 62 ? nearest : null;
    if (this.nearestStop) UIManager.getInstance().showPrompt(`Nhấn E hoặc chạm vào điểm “${this.nearestStop.label}” để tìm hiểu`);
    else UIManager.getInstance().hidePrompt();
    if (this.nearestStop && (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey))) this.interactWithStop(this.nearestStop);
  }

  private createEnvironment() {
    this.physics.world.setBounds(0, 0, this.width, this.height);
    const baseFrame = this.config.regionId === 'bao_tang_van_hoa' ? 7 : 0;
    this.add.tileSprite(this.width / 2, this.height / 2, this.width, this.height, 'env_tileset', baseFrame).setDepth(-100);
    const walls = this.physics.add.staticGroup();
    const addWall = (x: number, y: number, w: number, h: number) => {
      const wall = this.add.rectangle(x, y, w, h, 0x000000, 0);
      this.physics.add.existing(wall, true);
      walls.add(wall);
    };
    addWall(480, 10, 960, 20); addWall(480, 710, 960, 20); addWall(10, 360, 20, 720); addWall(950, 360, 20, 720);
    if (this.config.regionId === 'thai_hai') {
      this.add.image(480, 230, 'stilt_house_atk').setScale(2.4).setDepth(230);
      this.add.image(215, 430, 'traditional_house').setScale(1.7).setDepth(430);
      for (let x = 570; x < 790; x += 64) this.add.image(x, 410, 'tea_bush').setScale(1.2).setDepth(410);
      this.add.rectangle(735, 520, 220, 100, 0x855e3a).setStrokeStyle(5, 0x533a26).setDepth(520);
      addWall(480, 275, 135, 42); addWall(215, 468, 90, 35);
      this.add.text(480, 332, 'NHÀ SÀN ĐÓN KHÁCH · TÌNH HUỐNG HƯ CẤU', { fontSize: '13px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 7, y: 4 } }).setOrigin(0.5).setDepth(600);
    } else if (this.config.regionId === 'den_duom') {
      this.createDenDuomEnvironment(addWall);
    } else {
      const back = this.add.graphics().setDepth(-50); back.fillStyle(0xe4dfc8); back.fillRect(70, 70, 820, 580);
      for (let y = 122; y <= 595; y += 118) {
        this.add.rectangle(480, y, 740, 6, 0x8c7554).setDepth(y);
        for (let x = 155; x <= 805; x += 210) {
          const caseContainer = this.add.container(x, y - 36).setDepth(y - 10);
          const frame = this.add.graphics(); frame.fillStyle(0x705c43); frame.fillRect(-58, -34, 116, 72); frame.fillStyle(0xd8dfd2); frame.fillRect(-51, -27, 102, 58);
          const artifact = this.add.graphics(); artifact.fillStyle(0x946d45); artifact.fillRect(-18, -15, 36, 31); artifact.fillStyle(0xbda36b); artifact.fillRect(-8, -24, 16, 8); artifact.fillStyle(0x5a7358); artifact.fillRect(-24, 17, 48, 4);
          caseContainer.add([frame, artifact]);
        }
      }
      this.add.text(480, 92, 'PHÒNG TRƯNG BÀY SỐ CÁCH ĐIỆU · MÔ HÌNH MINH HỌA', { fontSize: '13px', color: '#263d31', backgroundColor: '#fff2d5', padding: { x: 8, y: 5 } }).setOrigin(0.5).setDepth(700);
      addWall(480, 628, 760, 24);
    }
    this.physics.add.collider(this.player, walls);
    this.add.text(480, 32, this.destination.name.toUpperCase(), { fontSize: '18px', color: '#f4c978', fontStyle: 'bold', backgroundColor: '#1d3b2b', padding: { x: 8, y: 5 } }).setOrigin(0.5).setDepth(900);
  }

  /** A stylized visitor map based on the documented three-level shrine complex. */
  private createDenDuomEnvironment(addWall: (x: number, y: number, w: number, h: number) => void) {
    const terrain = this.add.graphics().setDepth(-80);
    // Mossy foothills frame the heritage grounds and echo the Duom mountain ridge.
    terrain.fillStyle(0x6f9660, 1);
    terrain.fillPoints([new Phaser.Geom.Point(0, 0), new Phaser.Geom.Point(960, 0), new Phaser.Geom.Point(960, 186), new Phaser.Geom.Point(820, 160), new Phaser.Geom.Point(690, 190), new Phaser.Geom.Point(550, 145), new Phaser.Geom.Point(390, 185), new Phaser.Geom.Point(240, 150), new Phaser.Geom.Point(0, 200)], true);
    terrain.fillStyle(0x587d52, 1);
    terrain.fillPoints([new Phaser.Geom.Point(0, 0), new Phaser.Geom.Point(330, 0), new Phaser.Geom.Point(270, 116), new Phaser.Geom.Point(164, 163), new Phaser.Geom.Point(64, 120)], true);
    terrain.fillPoints([new Phaser.Geom.Point(590, 0), new Phaser.Geom.Point(960, 0), new Phaser.Geom.Point(960, 136), new Phaser.Geom.Point(844, 176), new Phaser.Geom.Point(730, 112)], true);
    terrain.fillStyle(0x3f6447, 1);
    terrain.fillTriangle(92, 142, 186, 16, 283, 142);
    terrain.fillTriangle(626, 137, 754, 8, 900, 145);
    terrain.fillStyle(0x93ad6d, 0.9);
    terrain.fillTriangle(145, 75, 186, 16, 224, 75);
    terrain.fillTriangle(696, 66, 754, 8, 809, 66);

    // Quiet green lawns with planted shade trees; the ritual grounds remain open.
    const grove = this.add.graphics().setDepth(-30);
    grove.fillStyle(0x345b43, 0.18);
    grove.fillEllipse(183, 370, 138, 58);
    grove.fillEllipse(850, 344, 124, 52);
    this.drawDuomTree(132, 342, 1.1);
    this.drawDuomTree(847, 340, 1.05);
    this.drawDuomTree(242, 235, 0.78);
    this.drawDuomTree(908, 246, 0.78);
    this.drawDuomTree(85, 530, 0.8);
    this.drawDuomTree(655, 208, 0.68);

    // Stone walk from the tam-quan gate into the stepped shrine sequence.
    const path = this.add.graphics().setDepth(-20);
    path.fillStyle(0x9e9b81, 1);
    path.fillPoints([new Phaser.Geom.Point(432, 720), new Phaser.Geom.Point(528, 720), new Phaser.Geom.Point(532, 602), new Phaser.Geom.Point(552, 526), new Phaser.Geom.Point(535, 450), new Phaser.Geom.Point(560, 374), new Phaser.Geom.Point(536, 274), new Phaser.Geom.Point(510, 204), new Phaser.Geom.Point(454, 204), new Phaser.Geom.Point(466, 284), new Phaser.Geom.Point(474, 373), new Phaser.Geom.Point(456, 450), new Phaser.Geom.Point(468, 526), new Phaser.Geom.Point(448, 600)], true);
    path.fillStyle(0xc0b99b, 0.9);
    for (let y = 636; y >= 248; y -= 27) {
      const half = y > 475 ? 43 : y > 365 ? 34 : 25;
      const x = y > 475 ? 480 : y > 365 ? 497 : 500;
      path.lineStyle(2, 0x777b68, 0.52).lineBetween(x - half, y, x + half, y);
      path.fillStyle(0xd4c9a8, 0.38).fillRect(x - half + 4, y + 3, half * 2 - 8, 3);
      path.fillStyle(0xc0b99b, 0.9);
    }
    // Branch into the festival yard, visually distinct from the sacred approach.
    path.fillStyle(0xa9a187, 1);
    path.fillPoints([new Phaser.Geom.Point(520, 518), new Phaser.Geom.Point(587, 516), new Phaser.Geom.Point(666, 491), new Phaser.Geom.Point(729, 475), new Phaser.Geom.Point(741, 510), new Phaser.Geom.Point(677, 531), new Phaser.Geom.Point(590, 552), new Phaser.Geom.Point(519, 557)], true);
    path.lineStyle(2, 0x747966, 0.48).lineBetween(551, 539, 725, 493);

    // Tam quan visitor entrance: three bays, timber red posts, tiled roof and name plaque.
    this.drawTamQuan();

    // The lower, middle and upper shrines follow the historic stepped arrangement.
    this.drawDuomShrine(326, 487, 146, 82, 'ĐỀN HẠ', 'PHỦ HAI CÔNG CHÚA', false);
    this.drawDuomShrine(482, 354, 174, 100, 'ĐỀN TRUNG', 'THỜ DƯƠNG TỰ MINH', true);
    this.drawDuomShrine(494, 213, 118, 70, 'ĐỀN THƯỢNG', 'THỜ THÂN MẪU', false);
    // Two compact side halls make the lower shrine read as a pair of phủ.
    this.drawDuomShrine(213, 489, 91, 57, 'PHỦ', '', false);
    addWall(482, 397, 144, 23);
    addWall(326, 519, 120, 20);
    addWall(494, 239, 98, 18);

    // A stone stela stands beside the main approach, not on top of a building.
    const stele = this.add.graphics().setDepth(430);
    stele.fillStyle(0x555b4b).fillEllipse(350, 451, 48, 12);
    stele.fillStyle(0x777b68).fillRect(338, 397, 24, 50);
    stele.fillStyle(0x9c9b7e).fillTriangle(336, 400, 350, 382, 364, 400);
    stele.fillStyle(0xbdb99a).fillRect(342, 406, 2, 35);
    stele.fillRect(350, 406, 2, 35);
    stele.fillRect(358, 406, 2, 35);
    stele.fillStyle(0x686d5c).fillRect(331, 447, 38, 7);

    // The festival yard is an open, separate community space on the east branch.
    const festival = this.add.graphics().setDepth(475);
    festival.fillStyle(0x8d9271, 1).fillRoundedRect(705, 503, 196, 145, 16);
    festival.lineStyle(4, 0xc9b77f, 0.9).strokeRoundedRect(705, 503, 196, 145, 16);
    festival.lineStyle(2, 0xe0d2a8, 0.6);
    for (let x = 724; x < 890; x += 25) festival.lineBetween(x, 516, x, 635);
    for (let y = 523; y < 642; y += 24) festival.lineBetween(718, y, 889, y);
    festival.fillStyle(0x6c4a35).fillRect(784, 516, 8, 112);
    festival.fillStyle(0xa34c3d).fillTriangle(792, 520, 829, 528, 792, 538);
    festival.fillStyle(0x355c46).fillTriangle(792, 540, 825, 548, 792, 558);
    festival.fillStyle(0x6c4a35).fillRect(742, 553, 28, 16); // low festival drum
    festival.fillStyle(0xd5b47b).fillRect(744, 551, 24, 4);
    festival.fillStyle(0x6c4a35).fillRect(843, 553, 24, 14); // game booth/table
    festival.fillStyle(0xcfa873).fillRect(841, 550, 28, 4);

    // Small visitor cues, lanterns and courtyard edging add texture without crowds of labels.
    this.drawStoneLantern(578, 450);
    this.drawStoneLantern(449, 450);
    this.drawStoneLantern(607, 300);
    const fence = this.add.graphics().setDepth(455);
    fence.lineStyle(4, 0x6b5940, 0.9);
    fence.lineBetween(639, 518, 694, 508);
    fence.lineBetween(642, 551, 700, 538);
    for (let x = 644; x <= 690; x += 18) {
      fence.fillStyle(0x725d40).fillRect(x, 511, 4, 43);
    }
  }

  private drawDuomTree(x: number, y: number, scale: number) {
    const tree = this.add.graphics().setDepth(y + 1);
    tree.fillStyle(0x263f2e, 0.28).fillEllipse(x + 4 * scale, y + 9 * scale, 72 * scale, 26 * scale);
    tree.fillStyle(0x594832).fillRect(x - 5 * scale, y - 2 * scale, 10 * scale, 35 * scale);
    tree.fillStyle(0x47623d).fillCircle(x, y - 13 * scale, 29 * scale);
    tree.fillStyle(0x5f7d49).fillCircle(x - 18 * scale, y - 18 * scale, 18 * scale);
    tree.fillCircle(x + 17 * scale, y - 21 * scale, 19 * scale);
    tree.fillStyle(0x78945a).fillCircle(x - 5 * scale, y - 31 * scale, 13 * scale);
    tree.fillStyle(0x8ea66a, 0.8).fillRect(x - 20 * scale, y - 26 * scale, 7 * scale, 4 * scale);
    tree.setDepth(y + 40);
  }

  private drawTamQuan() {
    const gate = this.add.graphics().setDepth(635);
    gate.fillStyle(0x303b2e, 0.25).fillEllipse(480, 652, 190, 28);
    // Stone plinth and three open bays.
    gate.fillStyle(0x817a64).fillRect(393, 608, 174, 17);
    gate.fillStyle(0x9f967b).fillRect(386, 602, 188, 8);
    gate.fillStyle(0x704333).fillRect(398, 548, 11, 62);
    gate.fillRect(451, 541, 11, 69);
    gate.fillRect(498, 541, 11, 69);
    gate.fillRect(551, 548, 11, 62);
    gate.fillStyle(0xa85a3d).fillRect(394, 540, 19, 9);
    gate.fillRect(447, 533, 19, 9);
    gate.fillRect(494, 533, 19, 9);
    gate.fillRect(547, 540, 19, 9);
    // Layered Vietnamese tiled roof with modest upturned corners.
    gate.fillStyle(0x743c31).fillTriangle(380, 545, 480, 491, 580, 545);
    gate.fillStyle(0xa34f3b).fillTriangle(389, 536, 480, 487, 571, 536);
    gate.fillStyle(0x743c31).fillTriangle(370, 545, 389, 536, 395, 549);
    gate.fillTriangle(571, 536, 590, 545, 565, 549);
    gate.fillStyle(0x61382e).fillRect(390, 541, 180, 8);
    gate.lineStyle(2, 0xc07850, 0.9);
    for (let x = 407; x < 558; x += 12) gate.lineBetween(x, 533 + Math.abs(480 - x) * 0.52, x + 2, 541 + Math.abs(480 - x) * 0.52);
    // The central bay carries a clear, small name plaque.
    gate.fillStyle(0x5e382a).fillRect(441, 507, 78, 18);
    gate.lineStyle(1, 0xd7b876).strokeRect(441, 507, 78, 18);
    this.add.text(480, 516, 'ĐỀN ĐUỔM', { fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#f8e4b4', fontStyle: 'bold', letterSpacing: 1 }).setOrigin(0.5).setDepth(636);
  }

  private drawDuomShrine(x: number, y: number, w: number, h: number, title: string, subtitle: string, central: boolean) {
    const g = this.add.graphics().setDepth(y + h);
    const half = w / 2;
    const roofY = y - h * 0.4;
    // Broad brick-and-stone steps.
    g.fillStyle(0x47483d, 0.2).fillEllipse(x, y + h * 0.42, w + 34, 24);
    g.fillStyle(0x756a52).fillRect(x - half - 12, y + h * 0.26, w + 24, 12);
    g.fillStyle(0xa1987b).fillRect(x - half - 7, y + h * 0.16, w + 14, 9);
    g.fillStyle(0xc0b28e).fillRect(x - half, y + h * 0.08, w, 7);
    // Dark timber frame, visible open doorway, and red-brown posts.
    g.fillStyle(0x4a3328).fillRect(x - half + 10, y - h * 0.04, w - 20, h * 0.34);
    g.fillStyle(0xb18c62).fillRect(x - half + 17, y - h * 0.01, w - 34, h * 0.27);
    g.fillStyle(0x4d382b).fillRect(x - 13, y + h * 0.02, 26, h * 0.29);
    g.fillStyle(0x8f5238);
    for (let px = x - half + 9; px <= x + half - 14; px += Math.max(20, w / 5)) g.fillRect(px, y - h * 0.05, 7, h * 0.33);
    g.fillStyle(0x5f3a2c).fillRect(x - half + 5, y - h * 0.08, w - 10, 7);
    // Two compact tiled roof layers and slightly lifted eaves.
    g.fillStyle(0x67392e).fillTriangle(x - half - 20, roofY + 28, x, roofY - 12, x + half + 20, roofY + 28);
    g.fillStyle(central ? 0xa94c38 : 0x98503b).fillTriangle(x - half - 13, roofY + 21, x, roofY - 15, x + half + 13, roofY + 21);
    g.fillStyle(0x6e3a2f).fillRect(x - half - 17, roofY + 20, w + 34, 8);
    g.fillStyle(0xc47b4e, 0.8).fillRect(x - half - 12, roofY + 22, w + 24, 2);
    g.fillStyle(0x6b402d).fillTriangle(x - half - 22, roofY + 23, x - half - 8, roofY + 17, x - half - 13, roofY + 32);
    g.fillTriangle(x + half + 22, roofY + 23, x + half + 8, roofY + 17, x + half + 13, roofY + 32);
    // Quiet blank timber plaque: the place name appears in the contextual prompt nearby.
    g.fillStyle(0x70503a).fillRect(x - 18, y - h * 0.03, 36, 7);
    g.lineStyle(1, 0xc5a36c).strokeRect(x - 18, y - h * 0.03, 36, 7);
  }

  private drawStoneLantern(x: number, y: number) {
    const g = this.add.graphics().setDepth(y + 2);
    g.fillStyle(0x4d4738, 0.24).fillEllipse(x + 2, y + 15, 27, 9);
    g.fillStyle(0x797560).fillRect(x - 10, y + 7, 20, 5);
    g.fillStyle(0x89866e).fillRect(x - 7, y - 13, 14, 19);
    g.fillStyle(0xd4ba7b, 0.8).fillRect(x - 4, y - 9, 8, 10);
    g.fillStyle(0x6c6957).fillRect(x - 12, y - 17, 24, 5);
    g.fillStyle(0x77735f).fillTriangle(x - 13, y - 17, x, y - 25, x + 13, y - 17);
    g.fillStyle(0x6b6653).fillRect(x - 8, y - 25, 16, 3);
  }

  private createStops() {
    if (this.config.regionId === 'den_duom') {
      this.createDenDuomStops();
      return;
    }
    this.config.stops.forEach((stop, index) => {
      const marker = this.add.container(stop.x, stop.y).setDepth(stop.y + 1).setSize(70, 76).setInteractive({ useHandCursor: true });
      const board = this.add.graphics();
      board.fillStyle(this.config.regionId === 'bao_tang_van_hoa' ? 0x68836d : 0x8c683e); board.fillRoundedRect(-26, -25, 52, 36, 4);
      board.lineStyle(2, 0xf4c978); board.strokeRoundedRect(-26, -25, 52, 36, 4);
      board.fillStyle(0x5f4b34); board.fillRect(-3, 10, 6, 20);
      const number = this.add.text(0, -7, `${index + 1}`, { fontSize: '16px', color: '#fff2d5', fontStyle: 'bold' }).setOrigin(0.5);
      const label = this.add.text(0, 38, stop.label, { fontSize: '10px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 4, y: 3 }, align: 'center', wordWrap: { width: 130 } }).setOrigin(0.5, 0);
      marker.add([board, number, label]);
      marker.on('pointerdown', () => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, stop.x, stop.y);
        if (distance > 115) UIManager.getInstance().showToast(`Hãy đi đến “${stop.label}” trước khi tìm hiểu.`);
        else this.interactWithStop(stop);
      });
    });
  }

  private createDenDuomStops() {
    const glyphs: Record<string, string> = { gate: '!', person: 'i', heritage: '✦', festival: '♪', courtyard: '◇', stamp: '✓' };
    this.config.stops.forEach(stop => {
      // Compact, unnumbered interaction seals sit beside real landmarks; names are shown only nearby.
      const marker = this.add.container(stop.x, stop.y).setDepth(stop.y + 8).setSize(54, 58).setInteractive({ useHandCursor: true });
      const seal = this.add.graphics();
      seal.fillStyle(0x273d2d, 0.24).fillEllipse(0, 15, 28, 10);
      seal.fillStyle(stop.id === 'gate' ? 0x537a4c : 0x8a7045).fillCircle(0, 0, 11);
      seal.lineStyle(2, 0xf0d28c).strokeCircle(0, 0, 11);
      const glyph = this.add.text(0, 0, glyphs[stop.id] || '•', {
        fontFamily: 'Arial, sans-serif', fontSize: stop.id === 'heritage' ? '12px' : '11px', color: '#fff2d5', fontStyle: 'bold'
      }).setOrigin(0.5);
      marker.add([seal, glyph]);
      marker.on('pointerdown', () => {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, stop.x, stop.y);
        if (distance > 115) UIManager.getInstance().showToast(`Hãy đến gần ${stop.label.toLowerCase()} để tìm hiểu.`);
        else this.interactWithStop(stop);
      });
    });
  }

  private createGuideCharacter() {
    const x = this.config.regionId === 'den_duom' ? 430 : 480;
    const y = this.config.regionId === 'den_duom' ? 574 : 520;
    if (this.config.regionId === 'den_duom') {
      const guide = this.add.sprite(x, y, 'npc_guide_sheet', 0).setScale(1.45).setDepth(y);
      if (this.anims.exists('npc_guide_sheet_idle')) guide.play('npc_guide_sheet_idle');
      this.add.circle(x + 13, y - 31, 8, 0xe0b75e).setStrokeStyle(2, 0xfff0bd).setDepth(y + 1);
      this.add.text(x + 13, y - 31, '!', { fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#453522', fontStyle: 'bold' }).setOrigin(0.5).setDepth(y + 2);
      return;
    }
    const figure = this.add.container(x, y).setDepth(y);
    const body = this.add.ellipse(0, 12, 31, 38, 0x4e7659).setStrokeStyle(2, 0xffe2a2);
    const head = this.add.circle(0, -13, 12, 0xd7a77c).setStrokeStyle(2, 0x513c2c);
    const badge = this.add.text(0, -44, this.config.guideName, { fontSize: '12px', color: '#fff2d5', backgroundColor: '#1d3b2b', padding: { x: 6, y: 4 } }).setOrigin(0.5, 1);
    figure.add([body, head, badge]);
  }

  private interactWithStop(stop: ExplorationStop) {
    const quest = QuestManager.getInstance().getQuest(`quest_${this.config.regionId}`);
    if (!quest) return;
    if (this.config.regionId === 'thai_hai') {
      if (stop.id === 'gate') this.completeObjective('th_meet_host');
      else if (stop.id === 'garden' || stop.id === 'kitchen') this.openActivity();
      else if (stop.id === 'porch' && quest.status === 'completed') UIManager.getInstance().openChapterEnding(this.destination.name, true);
      else UIManager.getInstance().showToast('Hãy gặp người đón khách rồi làm theo từng bước của hoạt động.');
    } else if (this.config.regionId === 'den_duom') {
      const cardStops: Record<string,string> = { person: 'dd_person_card', heritage: 'dd_site_card', festival: 'dd_festival_card' };
      if (stop.id === 'gate') {
        this.completeObjective('dd_meet_guide');
        UIManager.getInstance().startDialogue('den_duom_guide_intro');
      }
      if (cardStops[stop.id]) {
        if (!quest.objectives.find(o => o.id === 'dd_meet_guide')?.completed) {
          UIManager.getInstance().showToast('Hãy gặp tình nguyện viên ở cổng trước khi đọc các thẻ diễn giải.'); return;
        }
        const completed = this.markActivity(cardStops[stop.id]);
        if (completed) QuestManager.getInstance().incrementObjective('quest_den_duom', 'dd_collect_cards', 1);
        this.showProgressToast('Thẻ đã mở trong Sổ tay khám phá. Việc ghé thăm và ghép thông tin được ghi nhận riêng.');
        const noteId: Record<string, string> = { person: 'den_duom_card_person', heritage: 'den_duom_card_site', festival: 'den_duom_card_festival' };
        UIManager.getInstance().startDialogue(noteId[stop.id], action => {
          if (action === 'openMinigame') this.openTungConGame();
        });
      } else if (stop.id === 'leaflet' || stop.id === 'courtyard') this.openActivity();
      else if (stop.id === 'stamp') {
        if (quest.status === 'completed') {
          UIManager.getInstance().openChapterEnding(this.destination.name, true);
          return;
        }
        const ready = quest.objectives.filter(o => o.id !== 'dd_return_stamp').every(o => o.completed);
        if (ready) this.completeObjective('dd_return_stamp');
        else UIManager.getInstance().showToast('Hãy hoàn thiện tờ giới thiệu và phần chuẩn bị trước khi tới bàn lưu dấu.');
      }
      else UIManager.getInstance().showToast('Đây là sơ đồ minh họa. Hãy ghé ba điểm thông tin rồi hoàn thiện tờ giới thiệu.');
    } else {
      if (stop.id === 'worksheet') {
        if (quest.status === 'completed') {
          UIManager.getInstance().openChapterEnding(this.destination.name, true);
          return;
        }
        this.completeObjective('bm_meet_guide');
        this.completeObjective('bm_read_label');
        UIManager.getInstance().showToast('Người hướng dẫn đã giới thiệu cách đọc nhãn trên các mô hình minh họa.');
      }
      else if (['clothing','instrument','living','architecture'].includes(stop.id)) {
        if (!quest.objectives.find(o => o.id === 'bm_read_label')?.completed) {
          UIManager.getInstance().showToast('Hãy gặp người hướng dẫn ở sảnh và đọc nhãn trước khi xem mô hình.'); return;
        }
        const stage = `bm_model_${stop.id}`;
        if (this.markActivity(stage)) QuestManager.getInstance().incrementObjective('quest_bao_tang_van_hoa', 'bm_inspect_models', 1);
        this.showProgressToast('Đã xem mô hình giáo dục số và nhãn minh họa.');
      } else if (stop.id === 'exhibition') this.openActivity();
      else UIManager.getInstance().showToast('Hãy xem phiếu hướng dẫn và bốn mô hình trước khi thiết kế triển lãm.');
    }
    this.saveState();
    UIManager.getInstance().updateHUDQuest();
  }

  private openActivity() {
    const save = SaveManager.getInstance().load();
    const progress = save.regionProgress?.[this.config.regionId];
    if (this.config.regionId === 'thai_hai' && !QuestManager.getInstance().getQuest('quest_thai_hai')?.objectives[0].completed) {
      UIManager.getInstance().showToast('Trước hết, hãy gặp người đón khách ở cổng bản.'); return;
    }
    if (this.config.regionId === 'den_duom' && (QuestManager.getInstance().getQuest('quest_den_duom')?.objectives.find(o => o.id === 'dd_collect_cards')?.currentCount || 0) < 3) {
      UIManager.getInstance().showToast('Hãy đọc đủ ba thẻ ở các điểm diễn giải trước khi ghép tờ giới thiệu.'); return;
    }
    if (this.config.regionId === 'bao_tang_van_hoa' && (QuestManager.getInstance().getQuest('quest_bao_tang_van_hoa')?.objectives.find(o => o.id === 'bm_inspect_models')?.currentCount || 0) < 4) {
      UIManager.getInstance().showToast('Hãy quan sát đủ bốn mô hình giáo dục số trước khi sắp triển lãm.'); return;
    }
    const exhibition = progress?.exhibition as DestinationExhibition | undefined;
    const activityStages = [...(progress?.completedActivities || [])];
    if (this.config.regionId === 'bao_tang_van_hoa' && QuestManager.getInstance().isQuestCompleted('quest_bao_tang_van_hoa')) {
      activityStages.splice(activityStages.indexOf('exhibition'), activityStages.includes('exhibition') ? 1 : 0);
    }
    UIManager.getInstance().openDestinationActivity(this.config.activity, activityStages, exhibition, (stageId, savedExhibition) => {
      const objective = this.config.stageObjectives[stageId];
      if (savedExhibition) {
        const state = SaveManager.getInstance().load(); state.regionProgress ||= {};
        const region = state.regionProgress[this.config.regionId] || { visitedStops: [], completedActivities: [] };
        region.exhibition = savedExhibition; state.regionProgress[this.config.regionId] = region; SaveManager.getInstance().save(state);
      }
      if (this.markActivity(stageId) && objective) this.completeObjective(objective);
      if (this.config.regionId === 'bao_tang_van_hoa' && stageId === 'exhibition') {
        this.completeObjective('bm_build_exhibit'); this.completeObjective('bm_title_exhibit');
      }
      this.saveState();
    }, () => {
      this.saveState();
      this.awardIfComplete();
      UIManager.getInstance().showToast('Hoạt động đã ghi nhận. Bạn có thể tiếp tục khám phá các điểm còn lại.');
      UIManager.getInstance().updateHUDQuest();
    });
  }

  private openTungConGame() {
    UIManager.getInstance().openTungConMinigame(won => {
      if (!won) return;
      const firstWin = this.markActivity('den_duom_tung_con');
      const save = SaveManager.getInstance().load();
      save.passportStamps ||= {};
      save.achievements ||= {};
      save.passportStamps.den_duom_tung_con = true;
      save.achievements.ach_den_duom_tung_con = true;
      SaveManager.getInstance().save(save);
      UIManager.getInstance().showToast(firstWin ? 'Bạn nhận dấu Hội xuân và huy hiệu Cao thủ tung còn!' : 'Dấu Hội xuân của bạn đã được lưu từ lần trước.');
    });
  }

  private completeObjective(id: string) {
    ProgressionService.completeObjective(`quest_${this.config.regionId}`, id, this.config.regionId);
    this.awardIfComplete();
  }

  private markActivity(id: string) {
    const save = SaveManager.getInstance().load(); save.regionProgress ||= {};
    const progress = save.regionProgress[this.config.regionId] || { visitedStops: [], completedActivities: [] };
    if (progress.completedActivities.includes(id)) return false;
    progress.completedActivities.push(id); save.regionProgress[this.config.regionId] = progress; SaveManager.getInstance().save(save); return true;
  }

  private awardIfComplete() {
    ProgressionService.awardCompletedChapter(`quest_${this.config.regionId}`, this.config.regionId);
    if (QuestManager.getInstance().isQuestCompleted(`quest_${this.config.regionId}`) && this.markActivity('chapter_ending_seen')) {
      UIManager.getInstance().openChapterEnding(this.destination.name);
    }
  }

  private saveState() {
    persistRegionCheckpoint(this.config.regionId, { x: this.player.x, y: this.player.y, dir: this.player.getDirection() });
  }

  private showProgressToast(message: string) {
    UIManager.getInstance().showToast(message);
    this.awardIfComplete();
  }

  private bindMobileControls() {
    this.controls = new AbortController();
    const signal = this.controls.signal;
    const movement: Record<string, [number, number]> = { 'touch-up': [0,-1], 'touch-down': [0,1], 'touch-left': [-1,0], 'touch-right': [1,0] };
    Object.entries(movement).forEach(([id, vector]) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.addEventListener('pointerdown', event => { event.preventDefault(); (event.currentTarget as HTMLElement).setPointerCapture?.((event as PointerEvent).pointerId); this.player.setVirtualMovement(...vector); }, { signal });
      ['pointerup','pointercancel','lostpointercapture'].forEach(type => button.addEventListener(type, () => this.player.setVirtualMovement(0,0), { signal }));
    });
    document.getElementById('btn-touch-interact')?.addEventListener('click', () => { if (this.nearestStop) this.interactWithStop(this.nearestStop); }, { signal });
    window.addEventListener('blur', () => this.player?.setVirtualMovement(0,0), { signal });
  }
}
