import { IAchievement } from '../types/game';

export const ACHIEVEMENTS: Record<string, IAchievement> = {
  ach_newcomer: {
    id: 'ach_newcomer',
    title: 'Người Mới Đến Xứ Trà',
    description: 'Đặt chân đến vùng đất danh trà Tân Cương mộc mạc và thanh bình.',
    icon: '🌱',
    unlocked: true
  },
  ach_tea_harvest: {
    id: 'ach_tea_harvest',
    title: 'Bàn Tay Vàng Hái Chè',
    description: 'Thu hái đủ 5 búp chè đạt tiêu chuẩn "1 tôm 2 lá" trong mini-game đồi chè.',
    icon: '🍃',
    unlocked: false
  },
  ach_tea_artisan: {
    id: 'ach_tea_artisan',
    title: 'Nghệ Nhân Trà Tập Sự',
    description: 'Tự tay hoàn thành mẻ chè móc câu trên chảo gang lửa củi cùng Bác Lâm.',
    icon: '🍵',
    unlocked: false
  },
  ach_tea_brewing_apprentice: {
    id: 'ach_tea_brewing_apprentice',
    title: 'Nghệ Nhân Pha Trà Tập Sự',
    description: 'Hoàn thành bài học pha trà và thưởng thức mẻ trà xanh Tân Cương đầu tiên.',
    icon: '🫖',
    unlocked: false
  },
  ach_quiz_master: {
    id: 'ach_quiz_master',
    title: 'Uyên Bác Xứ Trà',
    description: 'Trả lời chính xác câu hỏi về thổ nhưỡng và lịch sử trà Tân Cương.',
    icon: '💡',
    unlocked: false
  },
  ach_first_fragment: {
    id: 'ach_first_fragment',
    title: 'Khơi Dậy Ký Ức',
    description: 'Thu nhận Mảnh Ký Ức Văn Hóa Trà đầu tiên vào cuốn sổ "Bí Mật Xứ Trà".',
    icon: '✨',
    unlocked: false
  },
  ach_lake_storyteller: {
    id: 'ach_lake_storyteller',
    title: 'Người Kể Chuyện Hồ Núi Cốc',
    description: 'Lắng nghe trọn vẹn thiên tình sử nàng Công chàng Cốc bên làn nước biếc.',
    icon: '💧',
    unlocked: false
  },
  ach_history_guardian: {
    id: 'ach_history_guardian',
    title: 'Người Gìn Giữ Lịch Sử ATK',
    description: 'Tìm hiểu những căn lán tre lịch sử tại Thủ đô gió ngàn Định Hóa.',
    icon: '⭐',
    unlocked: false
  },
  ach_cave_explorer: {
    id: 'ach_cave_explorer',
    title: 'Nhà Thám Hiểm Hang Động',
    description: 'Thắp sáng bóng tối trong lòng vòm đá Hang Phượng Hoàng.',
    icon: '🦅',
    unlocked: false
  },
  ach_master_explorer: {
    id: 'ach_master_explorer',
    title: 'Chinh Phục Đại Ngàn',
    description: 'Vượt qua thác ghềnh của dòng suối Cửa Tử hoang sơ.',
    icon: '🌊',
    unlocked: false
  }
};
