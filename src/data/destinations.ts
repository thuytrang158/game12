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
    subtitle: '12 Điểm Dừng · Cảnh Quan, Lịch Sử & Huyền Tích',
    category: 'Danh thắng hồ',
    coordinates: { x: 30, y: 52 },
    status: 'locked',
    realWorldInfo: {
      address: 'Khu vực Hồ Núi Cốc, tỉnh Thái Nguyên · kiểm tra thông tin đường đi hiện tại với điểm đón khách trước chuyến thăm',
      bestTimeToVisit: 'Lựa chọn thời điểm theo dự báo thời tiết và thông báo của đơn vị phục vụ chuyến đi',
      highlights: [
        'Du ngoạn mặt hồ và đảo Núi Cái; quan sát cảnh quan rừng, núi và đường bờ.',
        'Khám phá Huyền Thoại Cung, Chùa Thác Vàng và sân khấu nhạc nước qua các không gian cách điệu.',
        'Tìm hiểu lịch sử hồ chứa trên sông Công, phân biệt tư liệu xây dựng với câu chuyện được kể tại khu du lịch.',
        'Tạo bưu thiếp, ghi chép thiên nhiên và hoàn thiện sổ hành trình mười hai điểm dừng trong trò chơi.'
      ],
      culturalFact: 'Hồ Núi Cốc là hồ chứa nhân tạo trên sông Công. Huyền tích nàng Công – chàng Cốc được giới thiệu trong không gian kể chuyện tại khu du lịch; đây là nội dung riêng với lịch sử công trình.',
      suggestedTours: []
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
  },

  thai_hai: {
    id: 'thai_hai',
    name: 'Làng Thái Hải',
    vietnameseTitle: 'Làng Nhà sàn Thái Hải',
    subtitle: 'Ghé thăm bản làng qua một câu chuyện hư cấu trong trò chơi',
    category: 'Du lịch cộng đồng',
    coordinates: { x: 57, y: 66 },
    status: 'locked',
    realWorldInfo: {
      address: 'Thái Nguyên',
      bestTimeToVisit: 'Giờ mở cửa và điều kiện đón khách cần được xác nhận với đơn vị quản lý trước chuyến đi.',
      highlights: ['Không gian nhà sàn và trải nghiệm du lịch cộng đồng được giới thiệu trong nguồn du lịch chính thức.'],
      culturalFact: 'Làng Thái Hải được giới thiệu như một điểm du lịch cộng đồng gắn với không gian nhà sàn Tày. Các nhân vật và sinh hoạt trong chương chơi là tình huống hư cấu, không đại diện cho mọi cộng đồng Tày.',
      suggestedTours: []
    },
    fragmentRewardId: 'fragment_people'
  },

  den_duom: {
    id: 'den_duom',
    name: 'Đền Đuổm',
    vietnameseTitle: 'Di tích Đền Đuổm',
    subtitle: 'Theo dấu câu chuyện Dương Tự Minh và không gian lễ hội',
    category: 'Di tích lịch sử - văn hóa',
    coordinates: { x: 47, y: 37 },
    status: 'locked',
    realWorldInfo: {
      address: 'Thái Nguyên',
      bestTimeToVisit: 'Lịch lễ hội và điều kiện tham quan cần được xác nhận với đơn vị quản lý trước chuyến đi.',
      highlights: ['Di tích và lễ hội Đền Đuổm gắn với nhân vật được tưởng niệm là Dương Tự Minh.'],
      culturalFact: 'Nguồn Di sản văn hóa Việt Nam ghi nhận các hoạt động lễ hội gồm cả trò chơi dân gian. Phần lễ hội tái hiện trong trò chơi là minh họa quanh năm, không phải lịch tổ chức thực tế và không mô phỏng nghi lễ.',
      suggestedTours: []
    },
    fragmentRewardId: 'fragment_tradition'
  },

  bao_tang_van_hoa: {
    id: 'bao_tang_van_hoa',
    name: 'Bảo tàng Văn hóa các dân tộc Việt Nam',
    vietnameseTitle: 'Người kết nối di sản',
    subtitle: 'Khám phá mô hình trưng bày số cách điệu',
    category: 'Bảo tàng',
    coordinates: { x: 53, y: 51 },
    status: 'locked',
    realWorldInfo: {
      address: 'Thái Nguyên',
      bestTimeToVisit: 'Giờ mở cửa, trưng bày và điều kiện tham quan cần được xác nhận với bảo tàng trước chuyến đi.',
      highlights: ['Chương bảo tàng dùng các mô hình giáo dục số được ghi nhãn minh họa, không khẳng định là hiện vật cụ thể trong sưu tập.'],
      culturalFact: 'Không gian bản đồ và triển lãm trong trò chơi là cách điệu, không phải sơ đồ mặt bằng thật của bảo tàng.',
      suggestedTours: []
    }
  }
};

// The existing demo contained unverified tour ratings, booking links, schedules,
// and changing address details. Keep the tourism card useful without presenting
// invented services as current listings.
for (const destination of Object.values(DESTINATIONS)) {
  destination.realWorldInfo.suggestedTours = [];
  destination.realWorldInfo.address = 'Thái Nguyên';
  destination.realWorldInfo.bestTimeToVisit = 'Giờ mở cửa, tuyến tham quan và điều kiện tiếp cận có thể thay đổi; hãy xác nhận với đơn vị quản lý trước chuyến đi.';
}

DESTINATIONS.tan_cuong.realWorldInfo.highlights = ['Vùng chè Tân Cương là bối cảnh của chương trải nghiệm văn hóa trà trong trò chơi.'];
DESTINATIONS.tan_cuong.realWorldInfo.culturalFact = 'Các thao tác hái và chế biến trong trò chơi là mô phỏng; cách làm thực tế tùy vùng nguyên liệu và người sản xuất.';
DESTINATIONS.ho_nui_coc.realWorldInfo.highlights = ['Hồ Núi Cốc là bối cảnh của một chương du lịch và truyền thuyết dân gian.'];
DESTINATIONS.ho_nui_coc.realWorldInfo.culturalFact = 'Ba bến kể chuyện và tuyến thuyền trong trò chơi được sắp đặt hư cấu, không đại diện vị trí các đảo thật.';
DESTINATIONS.atk_dinh_hoa.realWorldInfo.highlights = ['ATK Định Hóa là di tích gắn với nơi ở, làm việc và hoạt động của Chủ tịch Hồ Chí Minh, Trung ương Đảng và Chính phủ trong kháng chiến chống Pháp.'];
DESTINATIONS.atk_dinh_hoa.realWorldInfo.culturalFact = 'Mốc 1947 trong trò chơi là bối cảnh kháng chiến; cuộc họp tại Tỉn Keo ngày 6/12/1953 và việc xếp hạng di tích năm 2012 là các mốc khác nhau.';
DESTINATIONS.hang_phuong_hoang.realWorldInfo.highlights = ['Hang Phượng Hoàng và Suối Mỏ Gà được ghi nhận là quần thể danh thắng và di tích lịch sử.'];
DESTINATIONS.hang_phuong_hoang.realWorldInfo.culturalFact = 'Ánh sáng, sơ đồ hang và mô hình quan sát trong trò chơi là cách điệu; không khuyến khích chạm, bẻ hoặc lấy nhũ đá.';
DESTINATIONS.suoi_cua_tu.realWorldInfo.highlights = ['Chương Suối Cửa Tử dùng một tuyến đi bộ mô phỏng dành cho gia đình.'];
DESTINATIONS.suoi_cua_tu.realWorldInfo.culturalFact = 'Các chặng, thời tiết và thao tác trong trò chơi không phải tuyến trekking thật; điều kiện đường đi ngoài đời cần xác nhận trước chuyến đi.';
DESTINATIONS.bao_tang_van_hoa.realWorldInfo.address = 'Số 1, đường Đội Cấn, phường Phan Đình Phùng, tỉnh Thái Nguyên';
DESTINATIONS.bao_tang_van_hoa.realWorldInfo.highlights = ['Bảo tàng được xây dựng từ năm 1960, nghiên cứu, sưu tầm, bảo quản, trưng bày và giáo dục về di sản văn hóa các dân tộc Việt Nam.'];
DESTINATIONS.bao_tang_van_hoa.realWorldInfo.culturalFact = 'Bộ Văn hóa, Thể thao và Du lịch giới thiệu bảo tàng như không gian lưu giữ và phát huy giá trị văn hóa của 54 dân tộc. Các mô hình trong trò chơi vẫn là minh họa, không đại diện cho hiện vật cụ thể.';
