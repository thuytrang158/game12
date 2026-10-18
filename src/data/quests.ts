import { IQuest } from '../types/game';

export const INITIAL_QUESTS: Record<string, IQuest> = {
  quest_tan_cuong: {
    id: 'quest_tan_cuong',
    title: 'Hương Trà Đầu Tiên',
    regionId: 'tan_cuong',
    giverNpcId: 'npc_bac_lam',
    description: 'Học hỏi bí quyết hái và sao chè Tân Cương từ Nghệ nhân Bác Lâm, tự tay hoàn thành mẻ chè móc câu thượng hạng để đánh thức mảnh ký ức đầu tiên.',
    culturalNote: 'Người làm trà Tân Cương ví búp chè non như hạt ngọc của đất trời; hái chè phải hái đúng cữ "1 tôm 2 lá" và nâng niu từng búp.',
    objectives: [
      {
        id: 'obj_meet_bac_lam',
        text: 'Tìm gặp Nghệ nhân trà Bác Lâm tại chòi chè Tân Cương',
        completed: false
      },
      {
        id: 'obj_shop_cultivar',
        text: 'Đến Vườn Giống Cô Hương, đối chiếu gợi ý trong Tờ ghi chú để chọn đúng Cây giống chè cổ truyền',
        completed: false
      },
      {
        id: 'obj_shop_fertilizer',
        text: 'Chọn vật tư hữu cơ hoai mục an toàn để chuẩn bị đất cho rễ non',
        completed: false
      },
      {
        id: 'obj_return_bac_lam_supplies',
        text: 'Mang cây giống và vật tư về giao cho Bác Lâm kiểm tra chuẩn bị hạ luống',
        completed: false
      },
      {
        id: 'obj_harvest_tea',
        text: 'Tham gia thử thách: Thu hoạch 5 búp chè đạt chuẩn "1 tôm 2 lá"',
        completed: false,
        targetCount: 5,
        currentCount: 0
      },
      {
        id: 'obj_process_tea',
        text: 'Hoàn thành mini-game sao chè thủ công trên chảo gang lửa củi',
        completed: false
      },
      {
        id: 'obj_quiz_tea',
        text: 'Vượt qua thử thách đố vui văn hóa trà đạo cùng Bác Lâm',
        completed: false
      },
      {
        id: 'obj_claim_fragment',
        text: 'Thu nhận Hộ Chiếu Xứ Trà, đóng Dấu Ấn Tân Cương và thức tỉnh Mảnh Ký Ức Văn Hóa Trà',
        completed: false
      }
    ],
    rewards: {
      items: ['fragment_tea_culture', 'tea_processed_tan_cuong'],
      fragmentId: 'fragment_tea_culture',
      achievementId: 'ach_tea_artisan'
    },
    status: 'available'
  },
  quest_ho_nui_coc: {
    id: 'quest_ho_nui_coc',
    title: 'Lời Thì Thầm Của Mặt Hồ',
    regionId: 'ho_nui_coc',
    giverNpcId: 'npc_ngu_ong',
    description: 'Gặp gỡ lão ngư bên bến thuyền Hồ Núi Cốc, khám phá câu chuyện tình huyền thoại của nàng Công và chàng Cốc gắn liền với danh thắng này.',
    culturalNote: 'Huyền thoại chàng Cốc ôm nỗi nhớ người thương hóa núi, nàng Công khóc cạn nước mắt hóa dòng sông là biểu tượng bất tử của tình yêu son sắt.',
    objectives: [
      {
        id: 'obj_meet_boatman',
        text: 'Nói chuyện với lão ngư bên bến đò Hồ Núi Cốc',
        completed: false
      },
      {
        id: 'obj_legend_puzzle',
        text: 'Khám phá 3 đảo huyền tích và ghép mảnh cổ thư',
        completed: false,
        targetCount: 3,
        currentCount: 0
      }
    ],
    rewards: {
      items: ['fragment_legend'],
      fragmentId: 'fragment_legend',
      achievementId: 'ach_lake_storyteller'
    },
    status: 'locked'
  },
  quest_atk_dinh_hoa: {
    id: 'quest_atk_dinh_hoa',
    title: 'Theo Dấu Lịch Sử',
    regionId: 'atk_dinh_hoa',
    giverNpcId: 'npc_huong_dan_vien',
    description: 'Men theo bóng rừng di tích ATK Định Hóa – Thủ đô gió ngàn, tìm hiểu dấu ấn lịch sử hào hùng của chiến khu cách mạng.',
    culturalNote: 'ATK Định Hóa từng là nơi Chủ tịch Hồ Chí Minh và Trung ương Đảng đưa ra nhiều quyết sách lịch sử mang tính bước ngoặt giải phóng dân tộc.',
    objectives: [
      {
        id: 'obj_meet_historian',
        text: 'Gặp hướng dẫn viên tại Nhà truyền thống ATK',
        completed: false
      },
      {
        id: 'obj_timeline_puzzle',
        text: 'Sắp xếp niên biểu sự kiện lịch sử chiến khu ATK',
        completed: false
      }
    ],
    rewards: {
      items: ['fragment_history'],
      fragmentId: 'fragment_history',
      achievementId: 'ach_history_guardian'
    },
    status: 'locked'
  },
  quest_hang_phuong_hoang: {
    id: 'quest_hang_phuong_hoang',
    title: 'Ánh Sáng Trong Hang Động',
    regionId: 'hang_phuong_hoang',
    giverNpcId: 'npc_kiem_lam',
    description: 'Thắp sáng đèn lồng, vượt qua thạch nhũ kỳ ảo trong lòng hang Phượng Hoàng và dòng suối ngọc Mỏ Gà.',
    culturalNote: 'Hang Phượng Hoàng và suối Mỏ Gà là thắng cảnh cấp quốc gia với hệ thống nhũ đá tự nhiên triệu năm tuổi tuyệt mỹ.',
    objectives: [
      {
        id: 'obj_light_lantern',
        text: 'Thắp sáng đèn thám hiểm và khám phá hang đá',
        completed: false
      }
    ],
    rewards: {
      items: ['fragment_nature'],
      fragmentId: 'fragment_nature',
      achievementId: 'ach_cave_explorer'
    },
    status: 'locked'
  },
  quest_suoi_cua_tu: {
    id: 'quest_suoi_cua_tu',
    title: 'Dòng Chảy Bí Ẩn',
    regionId: 'suoi_cua_tu',
    giverNpcId: 'npc_trekker',
    description: 'Vượt qua vách đá và dòng thác trong vắt của Suối Cửa Tử để chiêm ngưỡng thiên nhiên hùng vĩ của dãy Tam Đảo.',
    culturalNote: 'Cửa Tử mang tên gọi độc đáo gợi mở lòng quả cảm, với dòng nước mát lạnh quanh năm và cảnh quan rừng nguyên sinh rực rỡ.',
    objectives: [
      {
        id: 'obj_cross_river',
        text: 'Vượt thác ghềnh và tìm dấu tích khám phá',
        completed: false
      }
    ],
    rewards: {
      items: ['fragment_exploration'],
      fragmentId: 'fragment_exploration',
      achievementId: 'ach_master_explorer'
    },
    status: 'locked'
  }
};
