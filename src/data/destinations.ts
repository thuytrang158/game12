import { IDestination } from '../types/game';

export const DESTINATIONS: Record<string, IDestination> = {
  tan_cuong: {
    id: 'tan_cuong',
    name: 'Đồi Chè Tân Cương',
    vietnameseTitle: 'Vùng Chè Đặc Sản Tân Cương',
    subtitle: 'Đệ Nhất Danh Trà Xứ Bắc',
    category: 'Văn hóa trà',
    coordinates: { x: 42, y: 58 }, // Percentage on interactive map
    status: 'unlocked',
    realWorldInfo: {
      address: 'Xã Tân Cương, TP. Thái Nguyên, tỉnh Thái Nguyên (cách trung tâm TP khoảng 11km)',
      bestTimeToVisit: 'Quanh năm, đặc biệt từ tháng 9 đến tháng 12 (mùa thu hái chè chính hương vị đậm đà nhất)',
      highlights: [
        'Những đồi chè bát úp trải dài tít tắp, phủ sương mờ ảo buổi sớm bình minh.',
        'Trải nghiệm tự tay hái "1 tôm 2 lá" và học nghệ thuật sao chè truyền thống cùng nghệ nhân địa phương.',
        'Không gian văn hóa trà Tân Cương, thưởng thức chén trà đắng chát dịu êm, hậu ngọt sâu và hương cốm ngào ngạt.',
        'Hệ thống homestay sinh thái giữa nương chè mộc mạc và thân thiện.'
      ],
      culturalFact: 'Cây chè du nhập về Tân Cương từ những năm 1920 bởi cụ Đội Năm (Võ Văn Thiệt), sau hơn một thế kỷ đã trở thành Di sản văn hóa phi vật thể quốc gia.',
      suggestedTours: [
        {
          id: 'tour_tc_1day',
          title: 'Tour 1 Ngày: Hương Sắc Tân Cương – Tự Tay Làm Nghệ Nhân Trà',
          duration: '1 Ngày (8h00 - 17h30)',
          highlight: 'Hái chè cùng thợ bản địa, học sao sấy bằng chảo gang, thưởng trà đạo và ẩm thực xứ Thái.',
          rating: 4.9,
          tag: 'Tour Trải Nghiệm Văn Hóa',
          websiteUrl: 'https://thainguyentourism.vn/tours/huong-sac-tan-cuong-1-ngay'
        },
        {
          id: 'tour_tc_hnc_2d1n',
          title: 'Tour 2N1Đ: Tân Cương Xanh Mướt & Du Thuyền Huyền Thoại Hồ Núi Cốc',
          duration: '2 Ngày 1 Đêm',
          highlight: 'Nghỉ dưỡng homestay đồi chè, ngắm hoàng hôn trên hồ Núi Cốc, thưởng thức cá hồ nướng.',
          rating: 4.8,
          tag: 'Tour Nghỉ Dưỡng Sinh Thái',
          websiteUrl: 'https://thainguyentourism.vn/tours/tan-cuong-ho-nui-coc-2n1d'
        }
      ]
    },
    fragmentRewardId: 'fragment_tea_culture'
  },

  ho_nui_coc: {
    id: 'ho_nui_coc',
    name: 'Hồ Núi Cốc',
    vietnameseTitle: 'Khu Du Lịch Sinh Thái Hồ Núi Cốc',
    subtitle: 'Huyền Thoại Chuyện Tình Chàng Cốc – Nàng Công',
    category: 'Danh thắng hồ',
    coordinates: { x: 30, y: 52 },
    status: 'locked',
    realWorldInfo: {
      address: 'Xã Tân Thái, huyện Đại Từ & xã Phúc Trìu, TP. Thái Nguyên (cách TP khoảng 16km)',
      bestTimeToVisit: 'Tháng 3 đến tháng 11 (thời tiết khô ráo, mặt hồ phẳng lặng, cảnh sắc thơ mộng)',
      highlights: [
        'Hồ nước ngọt nhân tạo rộng hơn 25km² với 89 hòn đảo lớn nhỏ rải rác.',
        'Du thuyền khám phá đảo khỉ, đảo cò, động Huyền Thoại Cung và chùa Thác Vàng uy nghiêm.',
        'Chiêm ngưỡng tượng Phật Thích Ca Mâu Ni cao 45m ẩn chứa ngôi chùa trong lòng tượng.',
        'Thưởng thức các món đặc sản: cá mè hồ Núi Cốc, tôm hồ nướng muối ớt, cơm lam Định Hóa.'
      ],
      culturalFact: 'Hồ Núi Cốc là chứng nhân cho câu chuyện tình dân gian đầy xúc động được nhạc sĩ Phó Đức Phương phổ nhạc thành bài ca bất hủ "Huyền Thoại Hồ Núi Cốc".',
      suggestedTours: [
        {
          id: 'tour_hnc_cruise',
          title: 'Tour Du Thuyền Khám Phá Hồ Núi Cốc & 89 Hòn Đảo',
          duration: 'Trong ngày (Buổi sáng hoặc chiều)',
          highlight: 'Du thuyền ca nô, nghe thuyết minh huyền tích nàng Công chàng Cốc, dạo bước rừng thông.',
          rating: 4.7,
          tag: 'Tour Khám Phá Sông Nước',
          websiteUrl: 'https://thainguyentourism.vn/tours/du-thuyen-ho-nui-coc'
        }
      ]
    },
    fragmentRewardId: 'fragment_legend'
  },

  atk_dinh_hoa: {
    id: 'atk_dinh_hoa',
    name: 'ATK Định Hóa',
    vietnameseTitle: 'Khu Di Tích Quốc Gia Đặc Biệt ATK Định Hóa',
    subtitle: 'Thủ Đô Gió Ngàn – Chiến Khu Lịch Sử',
    category: 'Di tích lịch sử',
    coordinates: { x: 28, y: 22 },
    status: 'locked',
    realWorldInfo: {
      address: 'Huyện Định Hóa, tỉnh Thái Nguyên (cách TP Thái Nguyên khoảng 50km về phía Tây Bắc)',
      bestTimeToVisit: 'Mùa thu – đông (tháng 9 đến tháng 4) không khí mát lành giữa tán rừng già chiến khu.',
      highlights: [
        'Hơn 128 điểm di tích ghi dấu ấn sống và làm việc của Bác Hồ cùng các đồng chí lãnh đạo Trung ương.',
        'Đồi Tỉn Keo - nơi Bộ Chính trị ra quyết định mở Chiến dịch Điện Biên Phủ lịch sử 1954.',
        'Lán Khuôn Tát, cây đa Khuôn Tát và suối nước mát dưới rặng tre ngút ngàn.',
        'Giao lưu văn hóa hát Then, đàn Tính với đồng bào Tày vùng cao ATK.'
      ],
      culturalFact: 'Nhà thơ Tố Hữu đã viết trong bài thơ Việt Bắc: "Ở đâu u ám quân thù / Nhìn lên Việt Bắc Cụ Hồ sáng soi / Ở đâu đau đớn giống nòi / Trông về Việt Bắc mà nuôi chí bền".',
      suggestedTours: [
        {
          id: 'tour_atk_heritage',
          title: 'Hành Trình Về Nguồn: ATK Định Hóa – Thác Khuôn Tát',
          duration: '1 Ngày trọn gói',
          highlight: 'Dâng hương tưởng niệm Bác Hồ, tham quan đồi Tỉn Keo, thưởng thức cơm lam gà đồi.',
          rating: 4.9,
          tag: 'Tour Lịch Sử Văn Hóa',
          websiteUrl: 'https://thainguyentourism.vn/tours/ve-nguon-atk-dinh-hoa'
        }
      ]
    },
    fragmentRewardId: 'fragment_history'
  },

  hang_phuong_hoang: {
    id: 'hang_phuong_hoang',
    name: 'Hang Phượng Hoàng & Suối Mỏ Gà',
    vietnameseTitle: 'Thắng Cảnh Quốc Gia Hang Phượng Hoàng',
    subtitle: 'Bí Mật Kỳ Vĩ Trong Lòng Núi Đá Vôi',
    category: 'Thiên nhiên hang động',
    coordinates: { x: 74, y: 35 },
    status: 'locked',
    realWorldInfo: {
      address: 'Xã Phú Thượng, huyện Võ Nhai, tỉnh Thái Nguyên (cách TP Thái Nguyên khoảng 45km theo QL1B)',
      bestTimeToVisit: 'Mùa hè và thu (tháng 4 đến tháng 10), suối Mỏ Gà trong vắt, nước mát lành sảng khoái.',
      highlights: [
        'Hệ thống hang động karst triệu năm với 3 tầng hang kỳ vĩ: Hang Dơi, Hang Sáng, Hang Tối.',
        'Cột nhũ đá hình cánh chim Phượng Hoàng khổng lồ vút cao giữa vòm hang tráng lệ.',
        'Dòng suối Mỏ Gà tuôn trào từ cửa hang ngầm tạo nên hồ nước tự nhiên xanh như ngọc bích.',
        'Thưởng thức đặc sản vùng cao Võ Nhai: na La Hiên, ổi lê, bánh chưng bờ đậu.'
      ],
      culturalFact: 'Truyền thuyết dân gian kể về đôi chim Phượng Hoàng thủy chung hóa đá giữ gìn dòng suối ngọc nuôi sống bản làng người Tày, Nùng.',
      suggestedTours: [
        {
          id: 'tour_vo_nhai_cave',
          title: 'Khám Phá Hang Phượng Hoàng & Trải Nghiệm Bản Làng Võ Nhai',
          duration: '1 Ngày khám phá',
          highlight: 'Leo 1.200 bậc đá, tắm suối Mỏ Gà mát lạnh, thưởng thức tiệc nướng nhà sàn.',
          rating: 4.8,
          tag: 'Tour Khám Phá Mạo Hiểm Nhẹ',
          websiteUrl: 'https://thainguyentourism.vn/tours/hang-phuong-hoang-mo-ga'
        }
      ]
    },
    fragmentRewardId: 'fragment_nature'
  },

  suoi_cua_tu: {
    id: 'suoi_cua_tu',
    name: 'Suối Cửa Tử',
    vietnameseTitle: 'Thiên Đường Trekking Suối Cửa Tử',
    subtitle: 'Chinh Phục 7 Tầng Thác Giữa Rừng Tam Đảo',
    category: 'Khám phá sinh thái',
    coordinates: { x: 18, y: 70 },
    status: 'locked',
    realWorldInfo: {
      address: 'Xã Hoàng Nông, huyện Đại Từ, tỉnh Thái Nguyên (sườn đông dãy núi Tam Đảo)',
      bestTimeToVisit: 'Tháng 5 đến tháng 9 (mùa hè lý tưởng cho trải nghiệm lội suối, trượt thác và bơi lội)',
      highlights: [
        '7 cửa ải thác nước thiên nhiên tuyệt đẹp chảy qua hẻm núi đá hoa cương sừng sững.',
        'Trải nghiệm trượt máng đá tự nhiên (water slide), nhảy vách đá (cliff jumping) có bảo hộ an toàn.',
        'Băng qua những nương chè Hoàng Nông xanh ngát trước khi bước vào thung lũng nguyên sinh.',
        'Đội ngũ Porter và Guide địa phương tận tâm, giàu kinh nghiệm hướng dẫn bảo đảm an toàn sinh thái.'
      ],
      culturalFact: 'Tên gọi Cửa Tử bắt nguồn từ việc chỉ có một lối vào duy nhất giữa hai vách đá cao dựng đứng, tạo cảm giác mạo hiểm đầy lôi cuốn.',
      suggestedTours: [
        {
          id: 'tour_cua_tu_trekking',
          title: 'Tour Trekking Suối Cửa Tử: Chinh Phục Cửa 1, 2, 3 Cùng Chuyên Gia',
          duration: '1 Ngày (Kèm áo phao, mũ bảo hộ & bảo hiểm du lịch)',
          highlight: 'Trượt máng đá tự nhiên, bơi trong hồ ngọc bích, thưởng thức ẩm thực gà nướng lá chè.',
          rating: 5.0,
          tag: 'Tour Trekking Cảm Giác Mạnh',
          websiteUrl: 'https://thainguyentourism.vn/tours/trekking-suoi-cua-tu'
        }
      ]
    },
    fragmentRewardId: 'fragment_exploration'
  }
};
