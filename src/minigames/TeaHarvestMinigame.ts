import { AudioManager } from '../systems/AudioManager';

export type ShootType = 'perfect' | 'immature' | 'long_shoot' | 'overmature' | 'damaged';

export interface ILeafComponent {
  id: string;
  label: string;
  tender: boolean;
  maturity: 'young' | 'mature' | 'coarse' | 'damaged';
  description: string;
}

export interface IStemSegment {
  id: string;
  label: string;
  isTargetPoint: boolean;
  positionDescription: string;
  feedbackNote: string;
}

export interface ITeaShoot {
  id: string;
  cultivarId: 'trung_du' | 'bat_tien' | 'tri_777';
  type: ShootType;
  name: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  rotation: number; // degrees
  scale: number;
  harvested: boolean;
  partiallyHarvested?: boolean; // For long shoot: top 1 tom 2 la plucked, leaving lower mature leaf on bush

  // Botanical anatomy
  bud: {
    id: string;
    label: string;
    tender: boolean;
    description: string;
  };
  leaf1: ILeafComponent;
  leaf2?: ILeafComponent;
  lowerLeaves?: ILeafComponent[];
  stemSegments: IStemSegment[];

  maturityStage: 'immature' | 'tender' | 'mature' | 'coarse';
  healthStatus: 'healthy' | 'damaged';
  harvestEligibility: boolean;
  educationalNote: string;
}

export type MinigameMode = 'tutorial' | 'standard' | 'advanced';

export class TeaHarvestMinigame {
  private containerEl: HTMLElement;
  private onCompleteCallback?: (outcome: { harvested: number; bonusCoins: number }) => void;
  private pendingBonusCoins = 0;

  private currentMode: MinigameMode = 'tutorial';
  private shoots: ITeaShoot[] = [];
  private selectedShootId: string | null = null;
  private selectedStemPointId: string | null = null;

  // Stats & Scoring
  private harvestedCount: number = 0;
  private readonly targetHarvestCount: number = 5;
  private inspectCount: number = 0;
  private mistakeCount: number = 0;
  private correctShootSelections: number = 0;
  private correctPointSelections: number = 0;

  // Mode 3 Timer
  private timerSeconds: number = 45;
  private timerInterval: number | null = null;

  // Tutorial active hotspot
  private activeTutorialHotspot: string = 'bud';

  // Last feedback message & type
  private currentFeedback: {
    text: string;
    type: 'info' | 'success' | 'warn' | 'error';
    speaker?: string;
  } = {
    text: 'Chào cháu! Trước khi bắt đầu ra nương hái búp, bác sẽ hướng dẫn cháu quan sát cấu tạo một tôm hai lá nhé.',
    type: 'info',
    speaker: 'Bác Lâm'
  };

  constructor(containerEl: HTMLElement, onComplete?: (outcome: { harvested: number; bonusCoins: number }) => void) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onComplete;
  }

  public start() {
    this.currentMode = 'tutorial';
    this.harvestedCount = 0;
    this.pendingBonusCoins = 0;
    this.inspectCount = 0;
    this.mistakeCount = 0;
    this.correctShootSelections = 0;
    this.correctPointSelections = 0;
    this.selectedShootId = null;
    this.selectedStemPointId = null;
    this.generateShoots();
    this.render();
  }

  public switchMode(mode: MinigameMode) {
    AudioManager.getInstance().playClick();
    this.currentMode = mode;
    this.stopTimer();

    if (mode === 'standard' || mode === 'advanced') {
      this.selectedShootId = null;
      this.selectedStemPointId = null;
      this.generateShoots();
      if (mode === 'advanced') {
        this.timerSeconds = 45;
        this.startTimer();
      }
      this.currentFeedback = {
        text: 'Quan sát kỹ tán chè và chọn chồi phù hợp. Nhớ rằng: Tiêu chuẩn của bài học hôm nay là 1 tôm non và 2 lá mềm!',
        type: 'info',
        speaker: 'Bác Lâm'
      };
    } else {
      this.currentFeedback = {
        text: 'Cháu bấm vào từng bộ phận trên sơ đồ để xem bác giải thích chi tiết cấu tạo búp chè nhé.',
        type: 'info',
        speaker: 'Bác Lâm'
      };
    }

    this.render();
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = window.setInterval(() => {
      this.timerSeconds--;
      const timerEl = document.getElementById('harvest-timer-val');
      if (timerEl) {
        timerEl.textContent = `${this.timerSeconds}s`;
        if (this.timerSeconds <= 8) {
          timerEl.classList.add('timer-warning');
        }
      }

      if (this.timerSeconds <= 0) {
        this.stopTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  /**
   * Generates a botanical collection of tea shoots matching the lesson requirements
   */
  private generateShoots() {
    this.shoots = [
      // 1. Type A: Perfect Shoot
      {
        id: 'shoot_01',
        cultivarId: 'trung_du',
        type: 'perfect',
        name: 'Chồi A1: Chuẩn "Một Tôm Hai Lá"',
        x: 18,
        y: 22,
        rotation: -12,
        scale: 1,
        harvested: false,
        bud: {
          id: 'bud_01',
          label: 'Tôm chè (Búp đỉnh)',
          tender: true,
          description: 'Búp nhọn thon dài, phủ lông tuyết bạc mềm mịn, đạt độ căng mọng lý tưởng.'
        },
        leaf1: {
          id: 'leaf1_01',
          label: 'Lá non thứ nhất',
          tender: true,
          maturity: 'young',
          description: 'Nằm sát dưới búp, màu xanh nõn chuối dịu mắt, phiến lá mềm mỏng.'
        },
        leaf2: {
          id: 'leaf2_01',
          label: 'Lá non thứ hai',
          tender: true,
          maturity: 'young',
          description: 'Phiến lá mở vừa tới, xanh tươi, kết hợp hoàn hảo với tôm tạo hương cốm non.'
        },
        stemSegments: [
          {
            id: 'point_a1_target',
            label: 'Đốt cuống non (Dưới lá non 2)',
            isTargetPoint: true,
            positionDescription: 'Đoạn thân non ngay dưới lá non thứ hai',
            feedbackNote: 'Vị trí chuẩn xác! Bấm ngắt ở đây giúp thu trọn vẹn búp và 2 lá non mà không để dập nát.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Chồi đạt chuẩn vàng thu hái: 1 tôm non mập mạp và 2 lá mềm tươi tốt.'
      },

      // 2. Type B: Immature Shoot (Chồi non chưa đủ cữ)
      {
        id: 'shoot_02',
        cultivarId: 'trung_du',
        type: 'immature',
        name: 'Chồi B1: Chồi non chưa đủ cữ',
        x: 36,
        y: 16,
        rotation: 6,
        scale: 0.85,
        harvested: false,
        bud: {
          id: 'bud_02',
          label: 'Tôm non mới nhú',
          tender: true,
          description: 'Búp mới hé chồi, chưa vươn dài.'
        },
        leaf1: {
          id: 'leaf1_02',
          label: 'Lá non mới mở',
          tender: true,
          maturity: 'young',
          description: 'Chỉ có 1 lá bao nhỏ, chưa xuất hiện lá non thứ hai.'
        },
        stemSegments: [
          {
            id: 'point_b1_base',
            label: 'Đốt cuống non ngắn',
            isTargetPoint: false,
            positionDescription: 'Đoạn cuống non chưa phát triển hoàn chỉnh',
            feedbackNote: 'Chồi này chưa có đủ 2 lá non phát triển cho yêu cầu của bài học hôm nay.'
          }
        ],
        maturityStage: 'immature',
        healthStatus: 'healthy',
        harvestEligibility: false,
        educationalNote: 'Chồi non chưa đủ 2 lá. Trong bài học này ta cần để lại cho búp lớn thêm, dù ở một số dòng trà như Trà Đinh người ta có thể hái riêng tôm non.'
      },

      // 3. Type C: Long Shoot (Chồi dài có lá già bên dưới) - Can be harvested if picked at upper internode!
      {
        id: 'shoot_03',
        cultivarId: 'trung_du',
        type: 'long_shoot',
        name: 'Chồi C1: Chồi dài nhiều lá',
        x: 55,
        y: 20,
        rotation: -8,
        scale: 1.05,
        harvested: false,
        bud: {
          id: 'bud_03',
          label: 'Tôm chè tươi mập',
          tender: true,
          description: 'Búp nhọn tươi tốt ở ngọn chồi.'
        },
        leaf1: {
          id: 'leaf1_03',
          label: 'Lá non thứ nhất',
          tender: true,
          maturity: 'young',
          description: 'Xanh non mềm mượt.'
        },
        leaf2: {
          id: 'leaf2_03',
          label: 'Lá non thứ hai',
          tender: true,
          maturity: 'young',
          description: 'Xòe đều, tươi tốt.'
        },
        lowerLeaves: [
          {
            id: 'leaf3_03',
            label: 'Lá thứ ba (Lá già bên dưới)',
            tender: false,
            maturity: 'mature',
            description: 'Phiến lá xanh sẫm, dày và gân cứng. Phải giữ lại trên cây để nuôi tán chè!'
          }
        ],
        stemSegments: [
          {
            id: 'point_c1_upper',
            label: 'Đốt cuống non (Dưới lá non 2 - CHUẨN)',
            isTargetPoint: true,
            positionDescription: 'Đoạn đốt cuống non nằm giữa lá non 2 và lá thứ 3',
            feedbackNote: 'Tuyệt đỉnh kỹ thuật! Cháu đã chọn đúng vị trí đốt non ngay dưới lá thứ 2, giữ lại lá già bên dưới để cây tiếp tục sinh trưởng!'
          },
          {
            id: 'point_c1_lower',
            label: 'Gốc cuống cành (Dưới lá thứ 3 - SAI)',
            isTargetPoint: false,
            positionDescription: 'Gốc cuống chồi chè dưới lá già',
            feedbackNote: 'Vị trí này chưa chuẩn! Cháu đã hái lẫn cả lá già thứ ba. Nước trà sẽ bị chát đắng và cây bị mất lá quang hợp.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Chồi có thêm lá bên dưới, nhưng cháu vẫn thu hoạch được búp chuẩn nếu chọn đúng vị trí ngắt dưới lá non thứ hai.'
      },

      // 4. Type D: Overmature Material (Lá bánh tẻ quá già)
      {
        id: 'shoot_04',
        cultivarId: 'trung_du',
        type: 'overmature',
        name: 'Chồi D1: Lá bánh tẻ già',
        x: 74,
        y: 24,
        rotation: 14,
        scale: 1.1,
        harvested: false,
        bud: {
          id: 'bud_04',
          label: 'Búp đã nở to',
          tender: false,
          description: 'Búp đã nở xòe, mất đi độ căng mọng của tôm non.'
        },
        leaf1: {
          id: 'leaf1_04',
          label: 'Lá bánh tẻ dày',
          tender: false,
          maturity: 'coarse',
          description: 'Phiến lá dày, màu xanh sẫm, mép có răng cưa rõ và gân xơ.'
        },
        leaf2: {
          id: 'leaf2_04',
          label: 'Lá già thô',
          tender: false,
          maturity: 'coarse',
          description: 'Lá đã già, chứa nhiều chất xơ thô và vị chát gắt.'
        },
        stemSegments: [
          {
            id: 'point_d1_base',
            label: 'Cuống đã xơ hóa',
            isTargetPoint: false,
            positionDescription: 'Cuống cứng màu xanh sẫm',
            feedbackNote: 'Lá chồi này đã chuyển sang bánh tẻ, phiến lá dày thô. Nếu hái vào mẻ chè sẽ làm nước trà bị đắng khét và đỏ đục.'
          }
        ],
        maturityStage: 'coarse',
        healthStatus: 'healthy',
        harvestEligibility: false,
        educationalNote: 'Chồi đã qua độ thu hái tiêu chuẩn. Để dành lại hoặc chỉ dùng làm các loại trà thô bình dân.'
      },

      // 5. Type E: Damaged / Pest Material (Búp dập / sâu hại)
      {
        id: 'shoot_05',
        cultivarId: 'trung_du',
        type: 'damaged',
        name: 'Chồi E1: Búp dập & sâu hại',
        x: 25,
        y: 45,
        rotation: -18,
        scale: 0.95,
        harvested: false,
        bud: {
          id: 'bud_05',
          label: 'Búp bị cắn dập ngọn',
          tender: false,
          description: 'Đỉnh búp bị rầy nâu chích hút hoặc dập nát, thâm đen ở đầu.'
        },
        leaf1: {
          id: 'leaf1_05',
          label: 'Lá non bị cháy mép',
          tender: false,
          maturity: 'damaged',
          description: 'Mép lá quăn queo, có vết đốm nâu không đạt phẩm chất.'
        },
        leaf2: {
          id: 'leaf2_05',
          label: 'Lá non dập gân',
          tender: false,
          maturity: 'damaged',
          description: 'Lá bị xây xước cơ học, mất đi tinh dầu tự nhiên.'
        },
        stemSegments: [
          {
            id: 'point_e1_base',
            label: 'Đoạn cuống dập',
            isTargetPoint: false,
            positionDescription: 'Cuống non bị thâm tím',
            feedbackNote: 'Búp chè này đã bị sâu hại cắn gãy đỉnh và dập nát. Trà Tân Cương thượng hạng yêu cầu nguyên liệu nguyên vẹn không tì vết.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'damaged',
        harvestEligibility: false,
        educationalNote: 'Búp bị tổn thương cơ học hoặc sâu bệnh, không được đưa vào mẻ chế biến danh trà.'
      },

      // 6. Type A2: Another Perfect Shoot
      {
        id: 'shoot_06',
        cultivarId: 'trung_du',
        type: 'perfect',
        name: 'Chồi A2: Chuẩn "Một Tôm Hai Lá"',
        x: 46,
        y: 42,
        rotation: 4,
        scale: 1,
        harvested: false,
        bud: {
          id: 'bud_06',
          label: 'Tôm chè nõn nõn',
          tender: true,
          description: 'Tôm non mọc thẳng, búp búp mập mạp ngậm sương mai.'
        },
        leaf1: {
          id: 'leaf1_06',
          label: 'Lá non 1 mềm mịn',
          tender: true,
          maturity: 'young',
          description: 'Phiến lá uốn cong mềm mại bao quanh tôm chè.'
        },
        leaf2: {
          id: 'leaf2_06',
          label: 'Lá non 2 xanh nõn',
          tender: true,
          maturity: 'young',
          description: 'Lá mở vừa tầm, non mềm, màu xanh lục ánh vàng.'
        },
        stemSegments: [
          {
            id: 'point_a2_target',
            label: 'Đốt cuống non (Dưới lá 2)',
            isTargetPoint: true,
            positionDescription: 'Đoạn đốt cuống non ngay dưới cuống lá non thứ hai',
            feedbackNote: 'Chính xác! Cháu đã ngắt đúng đốt non, giữ búp tươi nguyên vẹn.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Chồi đạt chuẩn thu hái lý tưởng trên luống chè Tân Cương.'
      },

      // 7. Type C2: Another Long Shoot (Upper node is harvestable)
      {
        id: 'shoot_07',
        cultivarId: 'trung_du',
        type: 'long_shoot',
        name: 'Chồi C2: Chồi dài 3 lá',
        x: 68,
        y: 40,
        rotation: -10,
        scale: 1.05,
        harvested: false,
        bud: {
          id: 'bud_07',
          label: 'Tôm chè xanh non',
          tender: true,
          description: 'Búp nhọn tươi mới.'
        },
        leaf1: {
          id: 'leaf1_07',
          label: 'Lá non thứ nhất',
          tender: true,
          maturity: 'young',
          description: 'Lá non tươi mướt.'
        },
        leaf2: {
          id: 'leaf2_07',
          label: 'Lá non thứ hai',
          tender: true,
          maturity: 'young',
          description: 'Lá non thứ hai đạt chuẩn mềm mại.'
        },
        lowerLeaves: [
          {
            id: 'leaf3_07',
            label: 'Lá già thứ ba',
            tender: false,
            maturity: 'mature',
            description: 'Lá già phía dưới dày cộm, cần chừa lại nuôi cây.'
          }
        ],
        stemSegments: [
          {
            id: 'point_c2_upper',
            label: 'Đốt cuống non (Dưới lá 2 - CHUẨN)',
            isTargetPoint: true,
            positionDescription: 'Đốt non ngay dưới cuống lá thứ hai',
            feedbackNote: 'Rất khéo tay! Cháu đã tách đúng phần 1 tôm 2 lá phía trên và để lại lá già dưới cành.'
          },
          {
            id: 'point_c2_lower',
            label: 'Gốc cành dưới lá già (SAI)',
            isTargetPoint: false,
            positionDescription: 'Gốc cành búp dưới lá già thứ 3',
            feedbackNote: 'Vị trí này quá thấp, đã cắt phạm vào lá già bên dưới!'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Chồi dài vẫn thu được búp thượng hạng nếu biết bấm ngắt đúng đốt non!'
      },

      // 8. Type A3: Third Perfect Shoot
      {
        id: 'shoot_08',
        cultivarId: 'trung_du',
        type: 'perfect',
        name: 'Chồi A3: Búp ngậm sương mai',
        x: 32,
        y: 65,
        rotation: 12,
        scale: 1,
        harvested: false,
        bud: {
          id: 'bud_08',
          label: 'Tôm chè tinh hoa',
          tender: true,
          description: 'Búp đỉnh tròn đầy, ngập tràn sức sống buổi sớm.'
        },
        leaf1: {
          id: 'leaf1_08',
          label: 'Lá non 1 óng ả',
          tender: true,
          maturity: 'young',
          description: 'Màu nõn chuối non tơ.'
        },
        leaf2: {
          id: 'leaf2_08',
          label: 'Lá non 2 mềm mại',
          tender: true,
          maturity: 'young',
          description: 'Xòe cánh đón nắng mai, phiến lá mịn màng.'
        },
        stemSegments: [
          {
            id: 'point_a3_target',
            label: 'Đốt cuống non (Dưới lá 2)',
            isTargetPoint: true,
            positionDescription: 'Đốt cuống mềm ngay dưới lá thứ hai',
            feedbackNote: 'Bấm ngắt rất dứt khoát! Vết ngắt gọn gàng không dập nát.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Búp chè ngậm sương mai là thời điểm thu hái vàng trong ngày.'
      },

      // 9. Type B2: Second Immature Shoot
      {
        id: 'shoot_09',
        cultivarId: 'trung_du',
        type: 'immature',
        name: 'Chồi B2: Chồi mầm mới hé',
        x: 58,
        y: 62,
        rotation: -5,
        scale: 0.8,
        harvested: false,
        bud: {
          id: 'bud_09',
          label: 'Tôm mới nhú 1 phân',
          tender: true,
          description: 'Búp nhọn mới nhú khỏi nách lá.'
        },
        leaf1: {
          id: 'leaf1_09',
          label: 'Vảy lá mầm',
          tender: true,
          maturity: 'young',
          description: 'Vảy lá bao nhỏ xíu, chưa bung.'
        },
        stemSegments: [
          {
            id: 'point_b2_base',
            label: 'Đốt chồi non cụt',
            isTargetPoint: false,
            positionDescription: 'Cuống mầm chưa thành hình',
            feedbackNote: 'Chồi mầm này mới hé, chưa có 2 lá non xòe ra. Hãy giữ lại cho vụ hái tới.'
          }
        ],
        maturityStage: 'immature',
        healthStatus: 'healthy',
        harvestEligibility: false,
        educationalNote: 'Hãy kiên nhẫn để búp tích lũy đầy đủ dưỡng chất của đất trời Tân Cương.'
      },

      // 10. Type A4: Fourth Perfect Shoot (Ensures at least 5 harvestable shoots total: A1, C1, A2, C2, A3, A4)
      {
        id: 'shoot_10',
        cultivarId: 'trung_du',
        type: 'perfect',
        name: 'Chồi A4: Tuyệt phẩm Tân Cương',
        x: 78,
        y: 58,
        rotation: 16,
        scale: 1,
        harvested: false,
        bud: {
          id: 'bud_10',
          label: 'Tôm chè bọc tuyết',
          tender: true,
          description: 'Lông tơ trắng muốt bọc lấy tôm búp, biểu tượng trà ngon.'
        },
        leaf1: {
          id: 'leaf1_10',
          label: 'Lá non 1 tươi rói',
          tender: true,
          maturity: 'young',
          description: 'Mỏng mềm như lụa.'
        },
        leaf2: {
          id: 'leaf2_10',
          label: 'Lá non 2 tỏa sắc',
          tender: true,
          maturity: 'young',
          description: 'Cùng tôm chè tạo nên sự cân bằng hoàn mỹ.'
        },
        stemSegments: [
          {
            id: 'point_a4_target',
            label: 'Đốt cuống non (Dưới lá 2)',
            isTargetPoint: true,
            positionDescription: 'Đốt cuống non xanh mềm',
            feedbackNote: 'Tuyệt vời! Búp chè chuẩn 1 tôm 2 lá đã nằm gọn gàng trong gùi tre.'
          }
        ],
        maturityStage: 'tender',
        healthStatus: 'healthy',
        harvestEligibility: true,
        educationalNote: 'Nguyên liệu hoàn hảo để sao suốt thành những cánh chè móc câu cong vút.'
      }
    ];
  }

  /**
   * Main Render Dispatcher
   */
  private render() {
    this.containerEl.innerHTML = `
      <div class="harvest-master-container">
        <!-- Top Navigation & Mode Switcher -->
        <div class="harvest-top-bar">
          <div class="harvest-brand">
            <span class="harvest-badge-icon">🍃</span>
            <div class="harvest-title-wrap">
              <h3 class="harvest-main-title">Nghệ Thuật Hái Chè Tân Cương</h3>
              <span class="harvest-sub-title">Tiêu Chuẩn Thu Hái: "Một Tôm Hai Lá"</span>
            </div>
          </div>

          <div class="harvest-mode-tabs">
            <button class="mode-tab-btn ${this.currentMode === 'tutorial' ? 'active' : ''}" data-mode="tutorial">
              📖 1. Học Cùng Bác Lâm
            </button>
            <button class="mode-tab-btn ${this.currentMode === 'standard' ? 'active' : ''}" data-mode="standard">
              🌱 2. Thu Hoạch Đầu Tiên
            </button>
            <button class="mode-tab-btn ${this.currentMode === 'advanced' ? 'active' : ''}" data-mode="advanced">
              ⏱️ 3. Đôi Tay Hái Khéo
            </button>
          </div>
        </div>

        <!-- Mode Content Area -->
        <div class="harvest-stage-content">
          ${this.currentMode === 'tutorial' ? this.renderTutorialView() : this.renderHarvestChallengeView()}
        </div>

        <!-- Bác Lâm's Real-time Pedagogical Feedback Footer -->
        <div class="harvest-pedagogy-footer ${this.currentFeedback.type}">
          <div class="pedagogy-avatar">👨‍🌾</div>
          <div class="pedagogy-text-group">
            <div class="pedagogy-speaker">${this.currentFeedback.speaker || 'Bác Lâm'} <span class="pedagogy-role">• Nghệ nhân chè Tân Cương</span></div>
            <div class="pedagogy-msg" id="harvest-feedback-live">${this.currentFeedback.text}</div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * View 1: Guided Learning Phase (Học Cùng Bác Lâm)
   */
  private renderTutorialView(): string {
    const tutorialShoot = this.shoots.find(s => s.id === 'shoot_03') || this.shoots[0];

    const hotspotDetails: Record<string, { title: string; subtitle: string; desc: string }> = {
      bud: {
        title: '1. Tôm Chè (Búp Non Đỉnh)',
        subtitle: 'Bộ phận tinh túy bậc nhất của búp chè',
        desc: 'Tôm chè là búp non ở đỉnh chồi, cuộn chặt như mũi đinh, được bao bọc bởi một lớp lông tơ trắng mịn (tuyết trà). Đây là phần rất quan trọng quyết định hương thơm cốm non thanh khiết và vị ngọt hậu sâu lắng của trà Tân Cương.'
      },
      leaf1: {
        title: '2. Lá Non Thứ Nhất',
        subtitle: 'Lá kề sát dưới tôm chè',
        desc: 'Lá non thứ nhất nằm ngay dưới tôm chè, phiến lá nhỏ mềm mại ôm sát búp non, màu xanh nõn chuối tươi sáng. Lá này chứa hàm lượng axit amin Theanine rất cao, tạo vị êm dịu, không chát gắt.'
      },
      leaf2: {
        title: '3. Lá Non Thứ Hai',
        subtitle: 'Lá non hoàn thiện tiêu chuẩn "1 tôm 2 lá"',
        desc: 'Lá non thứ hai nằm tiếp theo trên cùng chồi, vừa xòe rộng nhưng phiến lá vẫn giữ độ non mềm. Sự kết hợp giữa 1 tôm non và 2 lá mềm tạo nên tỷ lệ cân bằng hoàn hảo giữa hương thơm, vị đậm và màu nước xanh vàng trong vắt.'
      },
      lowerLeaf: {
        title: '4. Lá Già Bên Dưới (Cần Giữ Lại Nuôi Cây)',
        subtitle: 'Lá bánh tẻ/lá già ở tầng dưới',
        desc: 'Những lá bên dưới có màu xanh sẫm, phiến lá dày và chứa nhiều sợi xơ thô. Chúng cần được giữ lại trên cây theo kỹ thuật thu hái bền vững để cây tiếp tục quang hợp, tích lũy dinh dưỡng nuôi lứa búp kế tiếp sinh trưởng.'
      },
      pickingPoint: {
        title: '5. Vị Trí Hái Chuẩn Cho Bài Học',
        subtitle: 'Đốt cuống non ngay dưới lá non thứ hai',
        desc: 'Vị trí bấm ngắt chuẩn là đoạn cuống non ngay dưới cuống lá non thứ hai. Người thợ dùng ngón cái và ngón trỏ khéo léo bấm nhẹ dứt khoát vào đốt mềm, tuyệt đối không dùng móng bấm nát hay bứt giật làm dập cành!'
      }
    };

    const currentHotspotInfo = hotspotDetails[this.activeTutorialHotspot] || hotspotDetails['bud'];

    return `
      <div class="tutorial-layout">
        <!-- Interactive Botanical Diagram -->
        <div class="tutorial-diagram-panel">
          <div class="diagram-header">
            <h4>Sơ Đồ Giải Phẫu Búp Chè "1 Tôm 2 Lá"</h4>
            <span class="diagram-tag">Khám phá chi tiết bằng cách bấm vào các bộ phận</span>
          </div>

          <div class="diagram-viewport">
            <!-- Large Botanical Vector Shoot Illustration -->
            <svg class="botanical-diagram-svg" viewBox="0 0 340 420" width="100%" height="380">
              <defs>
                <linearGradient id="tutBudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#C5E898"/>
                  <stop offset="60%" stop-color="#8BBF52"/>
                  <stop offset="100%" stop-color="#679A36"/>
                </linearGradient>
                <linearGradient id="tutLeaf1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#AEE175"/>
                  <stop offset="100%" stop-color="#72A738"/>
                </linearGradient>
                <linearGradient id="tutLeaf2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#8FCA4E"/>
                  <stop offset="100%" stop-color="#558826"/>
                </linearGradient>
                <linearGradient id="tutLowerLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3B7337"/>
                  <stop offset="100%" stop-color="#1E4A20"/>
                </linearGradient>
                <linearGradient id="tutStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#8DBF54"/>
                  <stop offset="100%" stop-color="#4E7C30"/>
                </linearGradient>
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <!-- Bush Branch Stem -->
              <path d="M 170 410 Q 172 320 170 240 Q 168 180 170 120" stroke="url(#tutStemGrad)" stroke-width="9" stroke-linecap="round" fill="none"/>
              <path d="M 170 240 Q 195 270 230 285" stroke="#4E7C30" stroke-width="6" stroke-linecap="round" fill="none"/>

              <!-- Lower Mature Leaf (Lá già bên dưới) -->
              <g class="hotspot-group ${this.activeTutorialHotspot === 'lowerLeaf' ? 'active-part' : ''}" data-hotspot="lowerLeaf" cursor="pointer">
                <path d="M 170 240 C 230 250 290 280 295 325 C 275 350 205 320 170 240 Z" fill="url(#tutLowerLeafGrad)" stroke="#173E18" stroke-width="2"/>
                <!-- Veins -->
                <path d="M 170 240 Q 235 285 290 325" stroke="#5E994D" stroke-width="2" fill="none"/>
                <path d="M 200 262 Q 225 255 240 260" stroke="#5E994D" stroke-width="1.2" fill="none"/>
                <path d="M 230 282 Q 255 280 270 290" stroke="#5E994D" stroke-width="1.2" fill="none"/>
              </g>

              <!-- Target Picking Point Segment (Vị trí hái chuẩn) -->
              <g class="hotspot-group ${this.activeTutorialHotspot === 'pickingPoint' ? 'active-part' : ''}" data-hotspot="pickingPoint" cursor="pointer">
                <!-- Highlight line & scissor marker -->
                <line x1="125" y1="195" x2="215" y2="195" stroke="#F4C978" stroke-width="3" stroke-dasharray="5,4"/>
                <circle cx="170" cy="195" r="14" fill="#F4C978" opacity="0.85" filter="url(#goldGlow)"/>
                <text x="170" y="200" font-size="14" text-anchor="middle" font-weight="bold" fill="#111A14">✂</text>
              </g>

              <!-- Leaf 2 (Lá non thứ hai) -->
              <g class="hotspot-group ${this.activeTutorialHotspot === 'leaf2' ? 'active-part' : ''}" data-hotspot="leaf2" cursor="pointer">
                <path d="M 170 180 C 105 185 55 155 45 110 C 75 95 140 135 170 180 Z" fill="url(#tutLeaf2Grad)" stroke="#3E6B20" stroke-width="2"/>
                <!-- Veins -->
                <path d="M 170 180 Q 105 145 50 115" stroke="#A6DB65" stroke-width="1.8" fill="none"/>
                <path d="M 135 160 Q 110 170 95 162" stroke="#A6DB65" stroke-width="1" fill="none"/>
                <path d="M 105 140 Q 85 145 70 135" stroke="#A6DB65" stroke-width="1" fill="none"/>
              </g>

              <!-- Leaf 1 (Lá non thứ nhất) -->
              <g class="hotspot-group ${this.activeTutorialHotspot === 'leaf1' ? 'active-part' : ''}" data-hotspot="leaf1" cursor="pointer">
                <path d="M 170 145 C 220 140 255 110 260 75 C 235 65 190 95 170 145 Z" fill="url(#tutLeaf1Grad)" stroke="#4A7E24" stroke-width="2"/>
                <!-- Veins -->
                <path d="M 170 145 Q 215 110 255 78" stroke="#CEF08E" stroke-width="1.8" fill="none"/>
                <path d="M 195 130 Q 215 132 230 120" stroke="#CEF08E" stroke-width="1" fill="none"/>
              </g>

              <!-- Apical Bud (Tôm chè đỉnh) -->
              <g class="hotspot-group ${this.activeTutorialHotspot === 'bud' ? 'active-part' : ''}" data-hotspot="bud" cursor="pointer">
                <path d="M 170 135 C 160 100 158 55 170 15 C 182 55 180 100 170 135 Z" fill="url(#tutBudGrad)" stroke="#4E7E26" stroke-width="2"/>
                <!-- Midrib & silver downy fuzz dots -->
                <path d="M 170 130 L 170 25" stroke="#E6FAD1" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="168" cy="45" r="1.5" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="172" cy="65" r="1.5" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="169" cy="85" r="1.5" fill="#FFFFFF" opacity="0.9"/>
              </g>

              <!-- Labeled Hotspot Pin Badges -->
              <!-- Hotspot 1: Bud -->
              <g class="diagram-pin ${this.activeTutorialHotspot === 'bud' ? 'active' : ''}" data-hotspot="bud" transform="translate(170, 16)" cursor="pointer">
                <circle cx="0" cy="0" r="13" fill="#F4C978" stroke="#111A14" stroke-width="2"/>
                <text x="0" y="4" font-size="11" font-weight="bold" text-anchor="middle" fill="#111A14">1</text>
              </g>

              <!-- Hotspot 2: Leaf 1 -->
              <g class="diagram-pin ${this.activeTutorialHotspot === 'leaf1' ? 'active' : ''}" data-hotspot="leaf1" transform="translate(240, 85)" cursor="pointer">
                <circle cx="0" cy="0" r="13" fill="#A8C879" stroke="#111A14" stroke-width="2"/>
                <text x="0" y="4" font-size="11" font-weight="bold" text-anchor="middle" fill="#111A14">2</text>
              </g>

              <!-- Hotspot 3: Leaf 2 -->
              <g class="diagram-pin ${this.activeTutorialHotspot === 'leaf2' ? 'active' : ''}" data-hotspot="leaf2" transform="translate(65, 125)" cursor="pointer">
                <circle cx="0" cy="0" r="13" fill="#A8C879" stroke="#111A14" stroke-width="2"/>
                <text x="0" y="4" font-size="11" font-weight="bold" text-anchor="middle" fill="#111A14">3</text>
              </g>

              <!-- Hotspot 4: Lower Leaf -->
              <g class="diagram-pin ${this.activeTutorialHotspot === 'lowerLeaf' ? 'active' : ''}" data-hotspot="lowerLeaf" transform="translate(265, 300)" cursor="pointer">
                <circle cx="0" cy="0" r="13" fill="#3B7337" stroke="#FFFFFF" stroke-width="1.5"/>
                <text x="0" y="4" font-size="11" font-weight="bold" text-anchor="middle" fill="#FFFFFF">4</text>
              </g>

              <!-- Hotspot 5: Picking Point -->
              <g class="diagram-pin ${this.activeTutorialHotspot === 'pickingPoint' ? 'active' : ''}" data-hotspot="pickingPoint" transform="translate(110, 195)" cursor="pointer">
                <circle cx="0" cy="0" r="13" fill="#FFB703" stroke="#111A14" stroke-width="2"/>
                <text x="0" y="4" font-size="11" font-weight="bold" text-anchor="middle" fill="#111A14">5</text>
              </g>
            </svg>
          </div>
        </div>

        <!-- Hotspot Pedagogical Inspector Panel -->
        <div class="tutorial-inspector-panel">
          <div class="hotspot-tabs-row">
            <button class="hotspot-select-btn ${this.activeTutorialHotspot === 'bud' ? 'active' : ''}" data-hotspot="bud">1. Tôm chè</button>
            <button class="hotspot-select-btn ${this.activeTutorialHotspot === 'leaf1' ? 'active' : ''}" data-hotspot="leaf1">2. Lá non 1</button>
            <button class="hotspot-select-btn ${this.activeTutorialHotspot === 'leaf2' ? 'active' : ''}" data-hotspot="leaf2">3. Lá non 2</button>
            <button class="hotspot-select-btn ${this.activeTutorialHotspot === 'lowerLeaf' ? 'active' : ''}" data-hotspot="lowerLeaf">4. Lá già</button>
            <button class="hotspot-select-btn ${this.activeTutorialHotspot === 'pickingPoint' ? 'active' : ''}" data-hotspot="pickingPoint">5. Điểm hái</button>
          </div>

          <div class="hotspot-card">
            <div class="hotspot-badge-title">
              <span class="hotspot-number-badge">${currentHotspotInfo.title.substring(0, 2)}</span>
              <div>
                <h4 class="hotspot-title">${currentHotspotInfo.title}</h4>
                <span class="hotspot-subtitle">${currentHotspotInfo.subtitle}</span>
              </div>
            </div>

            <p class="hotspot-description">${currentHotspotInfo.desc}</p>

            <div class="botanical-tip-box">
              <span class="tip-icon">💡</span>
              <div class="tip-text">
                <strong>Lời dặn của Bác Lâm:</strong> 
                Không phải tất cả các loại trà đều hái 1 tôm 2 lá. Ví dụ Trà Đinh chỉ lấy tôm búp, Trà Móc Câu lấy 1 tôm 2 lá non, còn Trà Búp hái 1 tôm 3 lá. Việc chọn đúng chuẩn hái là bí quyết tạo nên đẳng cấp của từng danh trà!
              </div>
            </div>
          </div>

          <div class="tutorial-actions-bar">
            <button id="btn-start-field-harvest" class="btn btn-primary btn-large-shine">
              🌱 Bác Lâm ơi, cháu đã hiểu! Ra nương thực hành ngay ➔
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * View 2: Tea Bush Challenge Screen (Mode 2 & 3)
   */
  private renderHarvestChallengeView(): string {
    const selectedShoot = this.shoots.find(s => s.id === this.selectedShootId);

    return `
      <div class="challenge-layout">
        <!-- Main Bush Area (Left Column on Desktop) -->
        <div class="bush-viewport-column">
          <!-- Bush Status Header -->
          <div class="bush-stats-bar">
            <div class="stat-pill highlight-gold">
              <span class="stat-icon">🧺</span>
              <span>Đã hái: <strong id="harvest-counter">${this.harvestedCount}/${this.targetHarvestCount}</strong> búp</span>
            </div>

            ${this.currentMode === 'advanced' ? `
              <div class="stat-pill highlight-timer">
                <span class="stat-icon">⏱️</span>
                <span>Thời gian: <strong id="harvest-timer-val">${this.timerSeconds}s</strong></span>
              </div>
            ` : `
              <div class="stat-pill">
                <span class="stat-icon">🎯</span>
                <span>Mục tiêu: <strong>5 búp "1 tôm 2 lá"</strong></span>
              </div>
            `}

            <div class="stat-pill stat-accuracy">
              <span class="stat-icon">⭐</span>
              <span>Chính xác: <strong>${this.calculateAccuracy()}%</strong></span>
            </div>
          </div>

          <!-- Interactive Bush Canvas Area -->
          <div class="tea-bush-interactive-container" id="tea-bush-interactive">
            <!-- SVG Tea Bush Foliage Background -->
            <svg class="tea-bush-bg-svg" viewBox="0 0 600 400" preserveAspectRatio="none">
              <defs>
                <radialGradient id="bushGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#4B7B34" stop-opacity="0.9"/>
                  <stop offset="65%" stop-color="#284F26" stop-opacity="0.95"/>
                  <stop offset="100%" stop-color="#152F19" stop-opacity="1"/>
                </radialGradient>
              </defs>

              <!-- Deep background foliage clumps -->
              <rect width="600" height="400" fill="url(#bushGlow)"/>
              <circle cx="150" cy="180" r="160" fill="#2E5C2D" opacity="0.6"/>
              <circle cx="450" cy="170" r="170" fill="#2E5C2D" opacity="0.6"/>
              <circle cx="300" cy="140" r="150" fill="#3D7336" opacity="0.7"/>

              <!-- Woody Bush Branches -->
              <path d="M 300 400 Q 295 330 280 260 Q 260 180 180 100" stroke="#4A3423" stroke-width="14" stroke-linecap="round" fill="none"/>
              <path d="M 280 260 Q 320 200 420 120" stroke="#4A3423" stroke-width="12" stroke-linecap="round" fill="none"/>
              <path d="M 290 280 Q 240 240 120 200" stroke="#4A3423" stroke-width="10" stroke-linecap="round" fill="none"/>
              <path d="M 320 230 Q 380 240 500 220" stroke="#4A3423" stroke-width="10" stroke-linecap="round" fill="none"/>

              <!-- Middle layer foliage leaves -->
              <path d="M 90 220 C 130 190 190 220 180 260 C 140 270 100 250 90 220 Z" fill="#265027"/>
              <path d="M 430 230 C 470 190 530 210 520 250 C 480 270 440 250 430 230 Z" fill="#265027"/>
              <path d="M 230 140 C 270 110 330 130 320 170 C 280 180 240 160 230 140 Z" fill="#366832"/>
            </svg>

            <!-- Render interactive Tea Shoots positioned on the bush -->
            ${this.shoots.map(shoot => this.renderBushShootElement(shoot)).join('')}
          </div>

          <div class="bush-quick-instruction">
            👆 <strong>Cách chơi:</strong> Quan sát các chồi trên tán chè, nhấp chọn chồi để soi kỹ cấu tạo và bấm ngắt đúng vị trí!
          </div>
        </div>

        <!-- Inspection & Harvesting Control Panel (Right Column on Desktop) -->
        <div class="inspection-column">
          ${selectedShoot ? this.renderShootInspector(selectedShoot) : this.renderEmptyInspectorPrompt()}

          <!-- Bamboo Basket Visual -->
          <div class="woven-basket-card">
            <div class="basket-header">
              <span class="basket-icon">🧺</span>
              <div>
                <strong>Chiếc Gùi Tre Tân Cương</strong>
                <span class="basket-status">${this.harvestedCount === 0 ? 'Chưa có búp nào' : `Đang chứa ${this.harvestedCount} búp chè tươi nõn`}</span>
              </div>
            </div>

            <div class="basket-leaves-visual">
              ${Array.from({ length: this.targetHarvestCount }).map((_, idx) => `
                <div class="basket-slot ${idx < this.harvestedCount ? 'filled' : 'empty'}">
                  ${idx < this.harvestedCount ? '🌱' : '⚪'}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Renders an individual shoot on the bush canvas
   */
  private renderBushShootElement(shoot: ITeaShoot): string {
    const isSelected = shoot.id === this.selectedShootId;
    const isHarvested = shoot.harvested;
    const isPartial = shoot.partiallyHarvested;

    return `
      <div 
        class="bush-shoot-node ${shoot.type} ${isSelected ? 'selected' : ''} ${isHarvested ? 'harvested' : ''} ${isPartial ? 'partially-harvested' : ''}"
        data-shoot-id="${shoot.id}"
        style="left: ${shoot.x}%; top: ${shoot.y}%; transform: rotate(${shoot.rotation}deg) scale(${shoot.scale});"
        title="${shoot.name}">
        
        <svg viewBox="0 0 70 85" width="56" height="68" class="shoot-svg-element">
          <!-- Main stem -->
          <path d="M 35 85 Q 36 55 35 30" stroke="#7CB342" stroke-width="4.5" stroke-linecap="round" fill="none"/>

          ${shoot.type === 'long_shoot' && isPartial ? `
            <!-- Only lower leaf remains on bush after harvesting top 1 tom 2 la! -->
            <path d="M 35 60 C 55 58 66 68 64 80 C 50 84 36 74 35 60 Z" fill="#295E2B" stroke="#1B421C" stroke-width="1.5"/>
            <circle cx="35" cy="45" r="3.5" fill="#C5E898" stroke="#33691E" stroke-width="1.2"/>
          ` : shoot.type === 'long_shoot' ? `
            <!-- Lower Mature Leaf (leaf 3) -->
            <path d="M 35 60 C 55 58 66 68 64 80 C 50 84 36 74 35 60 Z" fill="#295E2B" stroke="#1B421C" stroke-width="1.5"/>
            <!-- Leaf 2 -->
            <path d="M 35 45 C 15 42 6 30 8 18 C 20 18 32 30 35 45 Z" fill="#7CB342" stroke="#33691E" stroke-width="1.5"/>
            <!-- Leaf 1 -->
            <path d="M 35 35 C 50 30 58 20 54 10 C 44 10 36 20 35 35 Z" fill="#9CCC65" stroke="#33691E" stroke-width="1.5"/>
            <!-- Apical Bud -->
            <path d="M 35 30 C 32 20 32 8 35 2 C 38 8 38 20 35 30 Z" fill="#AED581" stroke="#33691E" stroke-width="1.5"/>
          ` : shoot.type === 'immature' ? `
            <!-- Only small bud + tiny unexpanded leaf -->
            <path d="M 35 48 C 25 45 20 38 22 30 C 28 30 34 38 35 48 Z" fill="#8BC34A" stroke="#33691E" stroke-width="1.2"/>
            <path d="M 35 42 C 33 32 33 22 35 16 C 37 22 37 32 35 42 Z" fill="#AED581" stroke="#33691E" stroke-width="1.2"/>
          ` : shoot.type === 'overmature' ? `
            <!-- Thick coarse dark leaves -->
            <path d="M 35 50 C 10 46 -2 30 2 15 C 18 16 30 32 35 50 Z" fill="#1B4D21" stroke="#0D2E12" stroke-width="2"/>
            <path d="M 35 45 C 58 40 68 25 64 10 C 50 12 38 25 35 45 Z" fill="#235A29" stroke="#0D2E12" stroke-width="2"/>
            <path d="M 35 35 C 30 22 30 8 35 0 C 40 8 40 22 35 35 Z" fill="#2E6B34" stroke="#0D2E12" stroke-width="1.8"/>
          ` : shoot.type === 'damaged' ? `
            <!-- Pest damaged shoot with brown edges -->
            <path d="M 35 48 C 18 45 10 32 12 22 C 22 22 32 32 35 48 Z" fill="#688B42" stroke="#4A341E" stroke-width="1.5"/>
            <path d="M 35 40 C 48 35 54 26 50 16 C 42 16 36 24 35 40 Z" fill="#759C4B" stroke="#4A341E" stroke-width="1.5"/>
            <!-- Withered brown tip -->
            <path d="M 35 32 C 32 24 32 12 35 6 C 38 12 38 24 35 32 Z" fill="#8D6E63" stroke="#4E342E" stroke-width="1.5"/>
            <circle cx="28" cy="28" r="2.5" fill="#4E342E"/>
          ` : `
            <!-- Type A: Perfect 1 Tom 2 La -->
            <!-- Leaf 2 -->
            <path d="M 35 48 C 16 45 8 32 10 20 C 22 20 32 32 35 48 Z" fill="#7CB342" stroke="#33691E" stroke-width="1.5"/>
            <!-- Leaf 1 -->
            <path d="M 35 38 C 50 32 58 22 55 12 C 44 12 36 22 35 38 Z" fill="#9CCC65" stroke="#33691E" stroke-width="1.5"/>
            <!-- Apical Bud with silver tip -->
            <path d="M 35 32 C 32 20 32 8 35 2 C 38 8 38 20 35 32 Z" fill="#C5E898" stroke="#33691E" stroke-width="1.5"/>
            <line x1="35" y1="28" x2="35" y2="4" stroke="#FFFFFF" stroke-width="1" opacity="0.8"/>
          `}
        </svg>

        <!-- Selection Target Pointer Badge -->
        <span class="shoot-tap-indicator">
          ${isHarvested ? '✓' : (isSelected ? '🔎' : '🌿')}
        </span>
      </div>
    `;
  }

  /**
   * Inspector View when a shoot is selected
   */
  private renderShootInspector(shoot: ITeaShoot): string {
    return `
      <div class="shoot-inspector-card">
        <div class="inspector-header">
          <div class="inspector-title-wrap">
            <span class="inspector-badge">${shoot.type === 'perfect' ? '⭐ Đạt chuẩn' : (shoot.type === 'long_shoot' ? '🌿 Chồi dài' : '⚠️ Cần lưu ý')}</span>
            <h4 class="inspector-name">${shoot.name}</h4>
          </div>
          <button class="btn-inspector-close" id="btn-close-inspect" title="Bỏ chọn">✕</button>
        </div>

        <!-- High-res magnified shoot inspection diagram -->
        <div class="inspector-magnified-box">
          <svg viewBox="0 0 160 200" width="130" height="160" class="magnified-svg">
            <path d="M 80 190 Q 82 130 80 70" stroke="#7CB342" stroke-width="7" stroke-linecap="round" fill="none"/>

            ${shoot.lowerLeaves && shoot.lowerLeaves.length > 0 ? `
              <path d="M 80 140 C 120 135 145 155 140 180 C 115 190 85 170 80 140 Z" fill="#295E2B" stroke="#163818" stroke-width="2"/>
              <text x="135" y="165" font-size="9" fill="#AED581" font-weight="bold">Lá già</text>
            ` : ''}

            ${shoot.leaf2 ? `
              <path d="M 80 110 C 35 105 15 80 20 50 C 45 50 70 75 80 110 Z" fill="#7CB342" stroke="#2E5A17" stroke-width="2"/>
              <text x="12" y="75" font-size="9" fill="#AED581" font-weight="bold">Lá non 2</text>
            ` : ''}

            <path d="M 80 85 C 115 75 135 50 130 25 C 105 25 85 50 80 85 Z" fill="#9CCC65" stroke="#2E5A17" stroke-width="2"/>
            <text x="125" y="45" font-size="9" fill="#C5E898" font-weight="bold">Lá non 1</text>

            <path d="M 80 70 C 72 45 72 20 80 5 C 88 20 88 45 80 70 Z" fill="#C5E898" stroke="#2E5A17" stroke-width="2"/>
            <text x="80" y="2" font-size="9" fill="#FFF2D5" font-weight="bold" text-anchor="middle">Tôm chè</text>
          </svg>

          <div class="anatomy-summary-list">
            <div class="anatomy-item">
              <span class="anatomy-dot green"></span>
              <span><strong>Tôm chè:</strong> ${shoot.bud.description}</span>
            </div>
            <div class="anatomy-item">
              <span class="anatomy-dot green"></span>
              <span><strong>Lá non 1 & 2:</strong> ${shoot.leaf1.description}</span>
            </div>
            ${shoot.lowerLeaves && shoot.lowerLeaves.length > 0 ? `
              <div class="anatomy-item">
                <span class="anatomy-dot yellow"></span>
                <span><strong>Lá già bên dưới:</strong> Cần chừa lại nuôi cây</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Picking Point Selection -->
        <div class="picking-point-section">
          <label class="section-label">📍 Chọn Vị Trí Bấm Ngắt Trên Cuống:</label>

          <div class="stem-points-list">
            ${shoot.stemSegments.map(seg => `
              <button 
                class="stem-point-btn ${this.selectedStemPointId === seg.id ? 'active' : ''}"
                data-point-id="${seg.id}">
                <span class="point-radio">${this.selectedStemPointId === seg.id ? '🔘' : '⚪'}</span>
                <div class="point-text-wrap">
                  <strong>${seg.label}</strong>
                  <span>${seg.positionDescription}</span>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="inspector-action-row">
          <button id="btn-perform-pluck" class="btn btn-primary btn-pluck-action" ${shoot.harvested ? 'disabled' : ''}>
            ${shoot.harvested ? '✓ Đã thu hái chồi này' : '🧺 Bấm Ngắt Búp Này'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Empty Inspector Prompt when no shoot is selected
   */
  private renderEmptyInspectorPrompt(): string {
    return `
      <div class="inspector-empty-card">
        <div class="empty-icon-wrap">🔍</div>
        <h4>Chưa chọn chồi chè</h4>
        <p>Hãy nhấp hoặc chạm vào một chồi chè trên tán cây bên trái để soi chi tiết cấu tạo búp và chọn điểm bấm ngắt phù hợp.</p>
        <div class="empty-tip-pill">
          💡 Gợi ý: Tìm chồi có 1 tôm nhọn mập và 2 lá non mềm mại!
        </div>
      </div>
    `;
  }

  /**
   * Attach all DOM Event Listeners
   */
  private attachEventListeners() {
    // Mode switcher buttons
    const modeButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.mode-tab-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode') as MinigameMode;
        if (mode && mode !== this.currentMode) {
          this.switchMode(mode);
        }
      });
    });

    // Tutorial Hotspots
    const hotspots = this.containerEl.querySelectorAll<SVGElement | HTMLElement>('.hotspot-group, .diagram-pin, .hotspot-select-btn');
    hotspots.forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = el.getAttribute('data-hotspot');
        if (target) {
          AudioManager.getInstance().playClick();
          this.activeTutorialHotspot = target;
          this.render();
        }
      });
    });

    // Start Field Harvest button in Tutorial
    const startFieldBtn = document.getElementById('btn-start-field-harvest');
    if (startFieldBtn) {
      startFieldBtn.addEventListener('click', () => {
        this.switchMode('standard');
      });
    }

    // Bush Shoot click
    const shootNodes = this.containerEl.querySelectorAll<HTMLElement>('.bush-shoot-node');
    shootNodes.forEach(node => {
      node.addEventListener('click', () => {
        const shootId = node.getAttribute('data-shoot-id');
        if (shootId) {
          this.handleShootSelection(shootId);
        }
      });
    });

    // Inspector close button
    const closeInspectBtn = document.getElementById('btn-close-inspect');
    if (closeInspectBtn) {
      closeInspectBtn.addEventListener('click', () => {
        AudioManager.getInstance().playClick();
        this.selectedShootId = null;
        this.selectedStemPointId = null;
        this.render();
      });
    }

    // Stem point selection buttons in inspector
    const pointButtons = this.containerEl.querySelectorAll<HTMLButtonElement>('.stem-point-btn');
    pointButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pointId = btn.getAttribute('data-point-id');
        if (pointId) {
          AudioManager.getInstance().playClick();
          this.selectedStemPointId = pointId;
          this.render();
        }
      });
    });

    // Perform Pluck button
    const pluckBtn = document.getElementById('btn-perform-pluck');
    if (pluckBtn) {
      pluckBtn.addEventListener('click', () => {
        this.handlePluckAction();
      });
    }
  }

  /**
   * Handle selecting a shoot on the bush
   */
  private handleShootSelection(shootId: string) {
    AudioManager.getInstance().playClick();
    this.selectedShootId = shootId;
    this.inspectCount++;

    const shoot = this.shoots.find(s => s.id === shootId);
    if (shoot) {
      // Default to first stem point if available
      this.selectedStemPointId = shoot.stemSegments[0]?.id || null;

      // Provide live guidance on selection
      if (shoot.harvested) {
        this.currentFeedback = {
          text: `Chồi này cháu đã bấm ngắt xong rồi. Hãy tiếp tục quan sát tán cây để tìm các búp non khác nhé!`,
          type: 'info',
          speaker: 'Bác Lâm'
        };
      } else {
        this.currentFeedback = {
          text: `Đang soi "${shoot.name}". ${shoot.educationalNote}`,
          type: 'info',
          speaker: 'Bác Lâm'
        };
      }
    }

    this.render();
  }

  /**
   * Handle plucking the selected shoot with the selected picking point
   */
  private handlePluckAction() {
    if (!this.selectedShootId) return;

    const shoot = this.shoots.find(s => s.id === this.selectedShootId);
    if (!shoot || shoot.harvested) return;

    const selectedSegment = shoot.stemSegments.find(seg => seg.id === this.selectedStemPointId);

    // Validation logic based on botanical conditions
    if (shoot.type === 'immature') {
      // Mistake: Plucking an immature shoot
      this.mistakeCount++;
      AudioManager.getInstance().playClick();
      this.currentFeedback = {
        text: 'Chồi này chưa có đủ hai lá non phát triển cho yêu cầu của bài học hôm nay. Bác Lâm khuyên nên để lại cho chồi phát triển thêm vài ngày nữa nhé!',
        type: 'warn',
        speaker: 'Bác Lâm'
      };
      this.render();
      return;
    }

    if (shoot.type === 'overmature') {
      // Mistake: Overmature coarse leaves
      this.mistakeCount++;
      AudioManager.getInstance().playClick();
      this.currentFeedback = {
        text: 'Cháu đang chọn búp có lá đã chuyển sang bánh tẻ, phiến lá dày thô. Nếu hái vào mẻ chè sẽ làm nước trà bị chát đắng và nước đỏ đục.',
        type: 'error',
        speaker: 'Bác Lâm'
      };
      this.render();
      return;
    }

    if (shoot.type === 'damaged') {
      // Mistake: Damaged material
      this.mistakeCount++;
      AudioManager.getInstance().playClick();
      this.currentFeedback = {
        text: 'Búp chè này đã bị sâu hại chích gãy đỉnh sinh trưởng hoặc dập nát. Tiêu chuẩn chè Tân Cương hảo hạng tuyệt đối không dùng búp khuyết tật.',
        type: 'error',
        speaker: 'Bác Lâm'
      };
      this.render();
      return;
    }

    if (shoot.type === 'long_shoot') {
      // Shoot is harvestable, but depends critically on picking point!
      if (!selectedSegment || !selectedSegment.isTargetPoint) {
        // Wrong picking point: picked lower node, taking mature leaf 3
        this.mistakeCount++;
        AudioManager.getInstance().playClick();
        this.currentFeedback = {
          text: 'Vị trí hái này chưa phù hợp! Cháu đã bấm ngắt ở gốc cành, làm lẫn cả lá già thứ ba. Hãy chọn đốt cuống non ngay dưới lá non thứ hai để chừa lại lá già nuôi tán cây.',
          type: 'warn',
          speaker: 'Bác Lâm'
        };
        this.render();
        return;
      }

      // Successful pick on long shoot: top 1 tom 2 la harvested, lower leaf retained!
      this.correctShootSelections++;
      this.correctPointSelections++;
      shoot.harvested = true;
      shoot.partiallyHarvested = true; // retains lower leaf on plant!
      this.harvestedCount++;

      AudioManager.getInstance().playPluck();
      this.currentFeedback = {
        text: selectedSegment.feedbackNote,
        type: 'success',
        speaker: 'Bác Lâm'
      };

      this.checkCompletion();
      return;
    }

    if (shoot.type === 'perfect') {
      // Standard 1 tom 2 la shoot
      this.correctShootSelections++;
      this.correctPointSelections++;
      shoot.harvested = true;
      this.harvestedCount++;

      AudioManager.getInstance().playPluck();
      this.currentFeedback = {
        text: 'Rất tốt! Cháu đã chọn đúng búp non và hai lá non trên cùng một chồi theo chuẩn "Một tôm hai lá" danh trà.',
        type: 'success',
        speaker: 'Bác Lâm'
      };

      this.checkCompletion();
    }
  }

  /**
   * Check if winning criteria is met
   */
  private checkCompletion() {
    if (this.harvestedCount >= this.targetHarvestCount) {
      this.stopTimer();
      AudioManager.getInstance().playFanfare();

      // Reward bonus coins based on accuracy
      const bonusCoins = this.mistakeCount === 0 ? 25 : (this.mistakeCount <= 2 ? 20 : 15);
      this.pendingBonusCoins = bonusCoins;

      this.renderScorecard(bonusCoins);
    } else {
      this.render();
    }
  }

  private calculateAccuracy(): number {
    const totalDecisions = this.correctShootSelections + this.mistakeCount;
    if (totalDecisions === 0) return 100;
    return Math.round((this.correctShootSelections / totalDecisions) * 100);
  }

  /**
   * Render Comprehensive Educational Scorecard
   */
  private renderScorecard(bonusCoins: number) {
    const accuracy = this.calculateAccuracy();

    // Educational score weighting:
    // Shoot selection: 40%
    // Identification: 30%
    // Picking point: 20%
    // Handling & consistency: 10%
    const shootScore = Math.min(40, Math.round((this.correctShootSelections / 5) * 40));
    const pointScore = Math.min(20, Math.round((this.correctPointSelections / 5) * 20));
    const identificationScore = Math.max(10, 30 - this.mistakeCount * 5);
    const handlingScore = 10;
    const totalTechnicalScore = shootScore + pointScore + identificationScore + handlingScore;

    let evaluationTitle = 'Bàn Tay Vàng Xứ Trà';
    let evaluationDesc = 'Tuyệt tác! Cháu nắm vững cấu tạo búp chè và điểm bấm ngắt chuẩn xác như một nghệ nhân hái chè thực thụ.';

    if (totalTechnicalScore < 80) {
      evaluationTitle = 'Tập Sự Xứ Trà Chăm Chỉ';
      evaluationDesc = 'Khá lắm! Cháu đã thu hoạch đủ 5 búp đạt chuẩn. Hãy nhớ luôn chừa lại lá già bên dưới để cây tiếp tục sinh trưởng nhé.';
    } else if (totalTechnicalScore < 92) {
      evaluationTitle = 'Thợ Hái Búp Khéo Léo';
      evaluationDesc = 'Rất tiến bộ! Cháu nhận biết rất nhanh tôm non và hai lá mềm, vết ngắt cuống non dứt khoát không làm dập chè.';
    }

    this.containerEl.innerHTML = `
      <div class="harvest-scorecard-screen">
        <div class="scorecard-card">
          <div class="scorecard-header">
            <span class="scorecard-icon">🏆</span>
            <div>
              <h3 class="scorecard-title">KẾT QUẢ THU HOẠCH CHÈ TÂN CƯƠNG</h3>
              <span class="scorecard-subtitle">Thử Thách: "Nghệ Thuật Hái Chè – Một Tôm Hai Lá"</span>
            </div>
          </div>

          <!-- Quick Metrics Grid -->
          <div class="scorecard-metrics-grid">
            <div class="metric-box">
              <span class="metric-label">Số búp thu hoạch đúng</span>
              <span class="metric-value highlight-gold">${this.harvestedCount}/${this.targetHarvestCount} búp</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Số lần chọn chưa chuẩn</span>
              <span class="metric-value ${this.mistakeCount === 0 ? 'highlight-green' : 'highlight-warn'}">${this.mistakeCount} lần</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Tỷ lệ chính xác</span>
              <span class="metric-value highlight-blue">${accuracy}%</span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Điểm kỹ thuật</span>
              <span class="metric-value highlight-green">${totalTechnicalScore}/100</span>
            </div>
          </div>

          <!-- Bác Lâm's Evaluation Card -->
          <div class="scorecard-evaluation-box">
            <div class="eval-avatar">👨‍🌾</div>
            <div class="eval-content">
              <strong>Đánh giá của Bác Lâm: <span class="eval-badge">${evaluationTitle}</span></strong>
              <p>"${evaluationDesc}"</p>
            </div>
          </div>

          <!-- Educational Takeaway Summary -->
          <div class="scorecard-takeaways">
            <h5 class="takeaways-title">🌱 Kiến thức nông nghiệp đã học:</h5>
            <ul class="takeaways-list">
              <li><strong>Tôm chè:</strong> Là đỉnh sinh trưởng non nhất, bọc lông tuyết trắng, giàu axit amin tạo vị ngọt hậu êm dịu.</li>
              <li><strong>Hai lá non:</strong> Lá thứ nhất và thứ hai mềm mại, cân bằng hương vị cốm non đặc trưng cho trà Tân Cương.</li>
              <li><strong>Kỹ thuật bấm ngắt:</strong> Bấm nhẹ ở đốt cuống non ngay dưới lá thứ hai; đối với chồi dài, luôn chừa lại lá bánh tẻ bên dưới để cây tiếp tục quang hợp sinh trưởng.</li>
            </ul>
          </div>

          <!-- Rewards Preview Box -->
          <div class="scorecard-rewards-box">
            <span class="reward-title">🎁 Phần thưởng nhận được:</span>
            <div class="rewards-items-row">
              <div class="reward-chip">
                <span class="reward-emoji">🌱</span>
                <span><strong>+5</strong> Búp Chè Tươi "1 Tôm 2 Lá"</span>
              </div>
              <div class="reward-chip">
                <span class="reward-emoji">🪙</span>
                <span><strong>+${bonusCoins}</strong> Xu Xứ Trà</span>
              </div>
              <div class="reward-chip">
                <span class="reward-emoji">📜</span>
                <span>Cập nhật nhiệm vụ: <strong>Đã thu hái đủ 5/5 búp chè</strong></span>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="scorecard-actions-row">
            <button id="btn-harvest-retry" class="btn btn-secondary">
              🔄 Hái thử lại để nâng cao tay nghề
            </button>
            <button id="btn-harvest-finish" class="btn btn-primary btn-large-shine">
              Mang chè về chòi Bác Lâm để sao chè ➔
            </button>
          </div>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btn-harvest-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.start();
      });
    }

    const finishBtn = document.getElementById('btn-harvest-finish');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        if (this.onCompleteCallback) {
          this.onCompleteCallback({ harvested: this.harvestedCount, bonusCoins: this.pendingBonusCoins });
        }
      });
    }
  }

  /**
   * Handle Timeout for Mode 3
   */
  private handleTimeout() {
    this.containerEl.innerHTML = `
      <div class="harvest-timeout-screen">
        <div class="timeout-card">
          <span class="timeout-icon">⏳</span>
          <h3>Hết Giờ Thử Thách!</h3>
          <p>
            Mặt trời đã lên cao, sương mai dần tan. Cháu đã hái được <strong>${this.harvestedCount}/${this.targetHarvestCount} búp</strong>.
            Đừng nản lòng nhé! Hái chè cần sự tinh mắt và bàn tay thoăn thoắt, hãy thử lại một lần nữa.
          </p>
          <div class="timeout-actions">
            <button id="btn-timeout-retry" class="btn btn-primary">Thử Lại Lần Nữa 🔄</button>
            <button id="btn-timeout-tutorial" class="btn btn-secondary">Xem Lại Hướng Dẫn 📖</button>
          </div>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('btn-timeout-retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.switchMode('advanced');
      });
    }

    const tutBtn = document.getElementById('btn-timeout-tutorial');
    if (tutBtn) {
      tutBtn.addEventListener('click', () => {
        this.switchMode('tutorial');
      });
    }
  }
}
