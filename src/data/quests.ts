import { IQuest } from '../types/game';
import { LAKE_OBJECTIVES } from './lake';

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
    title: 'Hồ Núi Cốc — Theo dấu mặt hồ',
    regionId: 'ho_nui_coc',
    giverNpcId: 'npc_ngu_ong',
    description: 'Cùng Lão Ngư khám phá mười hai điểm dừng quanh hồ: cảnh quan, lịch sử công trình, đảo Núi Cái và câu chuyện nàng Công – chàng Cốc. Hoàn thiện trang sổ và bưu thiếp để lưu dấu hành trình.',
    culturalNote: 'Lịch sử xây dựng hồ chứa trên sông Công được trình bày riêng với huyền tích tại Huyền Thoại Cung. Bản đồ và hoạt động trong trò chơi được cách điệu.',
    objectives: LAKE_OBJECTIVES.map(objective => ({ ...objective, completed: false })),
    rewards: {
      items: ['fragment_legend'],
      fragmentId: 'fragment_legend',
      achievementId: 'ach_lake_storyteller'
    },
    status: 'locked'
  },
  quest_first_tea: {
    id: 'quest_first_tea',
    title: 'Chén Trà Đầu Tiên',
    regionId: 'tan_cuong',
    giverNpcId: 'npc_bac_lam',
    description: 'Theo mẻ trà vừa sao tới Hiên thưởng trà, tìm hiểu dụng cụ rồi tự tay pha và nếm thử chén trà đầu tiên.',
    culturalNote: 'Lượng trà, lượng nước, nhiệt độ và thời gian hãm cùng góp phần tạo nên một trải nghiệm riêng. Công thức trong trò chơi chỉ là gợi ý để bắt đầu thử nghiệm.',
    objectives: [
      { id: 'obj_inspect_finished_tea', text: 'Quan sát mẻ trà xanh Tân Cương vừa sao', completed: false },
      { id: 'obj_meet_bac_lam_pavilion', text: 'Tự đi tới Hiên thưởng trà và gặp Bác Lâm', completed: false },
      { id: 'obj_learn_brewing_tools', text: 'Tìm hiểu các dụng cụ pha trà', completed: false },
      { id: 'obj_prepare_brewing_set', text: 'Chuẩn bị ấm chén và chọn lượng trà, lượng nước', completed: false },
      { id: 'obj_brew_first_pot', text: 'Điều chỉnh nhiệt độ, rót nước và canh thời gian hãm', completed: false },
      { id: 'obj_serve_first_pot', text: 'Rót trà ra chén để mời Bác Lâm', completed: false },
      { id: 'obj_evaluate_first_pot', text: 'Quan sát và xem gợi ý hương vị mô phỏng', completed: false },
      { id: 'obj_enjoy_first_tea', text: 'Thưởng thức chén trà đầu tiên cùng Bác Lâm', completed: false },
      { id: 'obj_unlock_tea_discovery', text: 'Mở khóa ghi nhận văn hóa trà Tân Cương', completed: false }
    ],
    rewards: { items: [], achievementId: 'ach_tea_brewing_apprentice' },
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
  },
  quest_thai_hai: {
    id: 'quest_thai_hai',
    title: 'Bữa cơm bên hiên bản',
    regionId: 'thai_hai',
    giverNpcId: 'thai_hai_host',
    description: 'Giúp chuẩn bị một buổi đón khách hư cấu: nhận hướng dẫn, chọn rau theo nhãn, chuyển nguyên liệu và sắp bàn.',
    culturalNote: 'Tình huống trong trò chơi là hư cấu và không đại diện cho mọi gia đình hay cộng đồng Tày.',
    objectives: [
      { id: 'th_meet_host', text: 'Gặp người đón khách tại cổng bản', completed: false },
      { id: 'th_learn_guidelines', text: 'Đọc ba hướng dẫn dành cho khách', completed: false, targetCount: 3, currentCount: 0 },
      { id: 'th_choose_ingredients', text: 'Chọn đúng ba loại rau theo nhãn và gợi ý', completed: false },
      { id: 'th_prepare_meal', text: 'Sắp xếp ba bước chuẩn bị theo hướng dẫn', completed: false },
      { id: 'th_set_table', text: 'Sắp bàn đón khách và mời mọi người ra hiên', completed: false }
    ],
    rewards: { items: ['fragment_people'], fragmentId: 'fragment_people', achievementId: 'ach_thai_hai_guest' },
    status: 'locked'
  },
  quest_den_duom: {
    id: 'quest_den_duom',
    title: 'Theo dấu hội xuân',
    regionId: 'den_duom',
    giverNpcId: 'den_duom_guide',
    description: 'Hoàn thiện tờ giới thiệu bằng cách ghép thông tin, chuẩn bị khu đón khách và chọn cách ứng xử phù hợp.',
    culturalNote: 'Hoạt động lễ hội trong trò chơi là minh họa quanh năm; không mô phỏng nghi lễ hay lịch tổ chức thật.',
    objectives: [
      { id: 'dd_meet_guide', text: 'Gặp tình nguyện viên tại cổng đón khách', completed: false },
      { id: 'dd_collect_cards', text: 'Thăm ba điểm diễn giải và thu thập thẻ thông tin', completed: false, targetCount: 3, currentCount: 0 },
      { id: 'dd_match_leaflet', text: 'Ghép ba thẻ vào đúng mục trong tờ giới thiệu', completed: false },
      { id: 'dd_prepare_courtyard', text: 'Chuẩn bị bảng chỉ dẫn và bàn thông tin ở sân sinh hoạt', completed: false },
      { id: 'dd_visitor_choices', text: 'Chọn cách ứng xử phù hợp trong ba tình huống', completed: false, targetCount: 3, currentCount: 0 },
      { id: 'dd_return_stamp', text: 'Trở lại bàn lưu dấu', completed: false }
    ],
    rewards: { items: ['fragment_tradition'], fragmentId: 'fragment_tradition', achievementId: 'ach_den_duom_guest' },
    status: 'locked'
  },
  quest_bao_tang_van_hoa: {
    id: 'quest_bao_tang_van_hoa',
    title: 'Người kết nối di sản',
    regionId: 'bao_tang_van_hoa',
    giverNpcId: 'museum_educator',
    description: 'Khám phá các mô hình giáo dục số, đối chiếu nhãn và tự tạo một triển lãm nhỏ.',
    culturalNote: 'Mặt bằng và các mô hình trong trò chơi được cách điệu, không mô tả hiện vật cụ thể hay sơ đồ thật của bảo tàng.',
    objectives: [
      { id: 'bm_meet_guide', text: 'Gặp người hướng dẫn tại sảnh', completed: false },
      { id: 'bm_read_label', text: 'Tìm hiểu cách đọc nhãn giới thiệu', completed: false },
      { id: 'bm_inspect_models', text: 'Quan sát bốn mô hình giáo dục số', completed: false, targetCount: 4, currentCount: 0 },
      { id: 'bm_match_uses', text: 'Ghép mô hình với công dụng được ghi trên nhãn', completed: false },
      { id: 'bm_build_exhibit', text: 'Chọn và sắp thứ tự ba thẻ cho triển lãm cá nhân', completed: false },
      { id: 'bm_title_exhibit', text: 'Đặt tên, chọn chú thích và lưu triển lãm', completed: false }
    ],
    rewards: { items: [], achievementId: 'ach_museum_connector' },
    status: 'locked'
  }
};
