import { IItem } from '../types/game';

export const INITIAL_ITEMS: Record<string, IItem> = {
  travel_journal: {
    id: 'travel_journal',
    name: 'Sổ Tay "Bí Mật Xứ Trà"',
    description: 'Cuốn sổ hành trình ghi chép lại những truyền thuyết và di sản văn hóa của Thái Nguyên.',
    category: 'tool',
    icon: '📖',
    loreText: 'Trang giấy ngả vàng lưu lại dấu tích của 7 mảnh ký ức thiêng liêng.',
    realWorldFact: 'Thái Nguyên là cái nôi của văn hóa trà Việt Nam với danh xưng "Đệ Nhất Danh Trà".'
  },
  tea_basket: {
    id: 'tea_basket',
    name: 'Gùi Tre Hái Chè',
    description: 'Chiếc gùi tre mộc mạc đan thủ công của người dân vùng Tân Cương.',
    category: 'tool',
    icon: '🧺',
    loreText: 'Dùng để chứa những búp chè tươi non vừa mới hái trong sương sớm.'
  },
  tea_buds_fresh: {
    id: 'tea_buds_fresh',
    name: 'Búp Chè Tươi "1 Tôm 2 Lá"',
    description: 'Búp chè ngậm sương tinh khiết chuẩn tiêu chí danh trà Tân Cương.',
    category: 'tea',
    icon: '🌱',
    quantity: 0,
    loreText: 'Thu hái lúc bình minh khi sương còn đọng trên lá để giữ trọn vị cốm non.',
    realWorldFact: 'Quy chuẩn "1 tôm 2 lá" là bí quyết tạo nên vị đắng chát dịu êm và hậu ngọt lắng sâu trứ danh của chè Thái.'
  },
  tea_processed_tan_cuong: {
    id: 'tea_processed_tan_cuong',
    name: 'Mẻ Trà Xanh Tân Cương Đầu Tiên',
    description: 'Mẻ trà xanh khô do chính tay bạn hái và sao. Có thể quan sát cánh trà trước khi đem pha.',
    category: 'tea',
    icon: '🍵',
    quantity: 0,
    loreText: 'Cánh trà khô xoăn cong, lưu lại dấu ấn của công đoạn làm héo, vò và sao. Hình dáng cùng hương thơm có thể thay đổi theo nguyên liệu và cách chế biến.',
    realWorldFact: 'Chè Tân Cương được bảo hộ chỉ dẫn địa lý từ năm 2007 và là Di sản văn hóa phi vật thể quốc gia.'
  },
  fragment_tea_culture: {
    id: 'fragment_tea_culture',
    name: 'Mảnh Ký Ức Văn Hóa Trà',
    description: 'Mảnh ký ức đầu tiên phản chiếu tình yêu đất và người xứ chè ngàn năm.',
    category: 'fragment',
    icon: '✨',
    loreText: '"Đất sinh cây chè, người dốc trọn tâm tình thành hương vị." Mảnh ghép tỏa hương thơm dịu mát của búp non.',
    realWorldFact: 'Xã Tân Cương, TP. Thái Nguyên nằm bên dòng sông Công và chân núi Tam Đảo có chất đất sỏi son pha sét đặc biệt.'
  },
  fragment_legend: {
    id: 'fragment_legend',
    name: 'Mảnh Ký Ức Truyền Thuyết',
    description: 'Mảnh ký ức về chuyện tình đẫm lệ của nàng Công và chàng Cốc.',
    category: 'fragment',
    icon: '💧',
    loreText: '"Nước mắt nàng Công hóa dòng sông Công, thân chàng Cốc hóa dãy núi Cốc hùng vĩ."',
    realWorldFact: 'Hồ Núi Cốc là hồ nước ngọt nhân tạo hình thành từ việc đắp đập ngăn sông Công, gắn liền với huyền thoại dân gian.'
  },
  fragment_history: {
    id: 'fragment_history',
    name: 'Mảnh Ký Ức Lịch Sử',
    description: 'Mảnh ký ức hào hùng về "Thủ đô gió ngàn" ATK Định Hóa.',
    category: 'fragment',
    icon: '⭐',
    loreText: 'Những căn lán tre dưới bóng rừng đại ngàn chở che cách mạng và Bác Hồ.',
    realWorldFact: 'An toàn khu (ATK) Định Hóa là trung tâm đầu não kháng chiến chống Pháp (1947 - 1954).'
  },
  fragment_nature: {
    id: 'fragment_nature',
    name: 'Mảnh Ký Ức Thiên Nhiên',
    description: 'Mảnh ký ức về nhũ đá lấp lánh và dòng suối ngọc Hang Phượng Hoàng.',
    category: 'fragment',
    icon: '🦅',
    loreText: 'Hang động kỳ vĩ với hình tượng chim Phượng Hoàng dang cánh giữa lưng chừng trời.',
    realWorldFact: 'Hang Phượng Hoàng và Suối Mỏ Gà nằm ở huyện Võ Nhai, sở hữu hệ sinh thái karst tuyệt đẹp.'
  },
  fragment_exploration: {
    id: 'fragment_exploration',
    name: 'Mảnh Ký Ức Khám Phá',
    description: 'Mảnh ký ức về tinh thần dũng cảm chinh phục dòng suối Cửa Tử nguyên sơ.',
    category: 'fragment',
    icon: '🌊',
    loreText: 'Dòng nước xanh ngọc luồn qua vách đá hoa cương hoang sơ và kỳ bí.',
    realWorldFact: 'Suối Cửa Tử (xã Hoàng Nông, huyện Đại Từ) bắt nguồn từ sườn đông Tam Đảo, là điểm trekking nổi tiếng.'
  },
  fragment_people: {
    id: 'fragment_people',
    name: 'Mảnh Ký Ức Con Người Xứ Trà',
    description: 'Ghi dấu bàn tay khéo léo và nụ cười hiền hậu của người nghệ nhân Thái Nguyên.',
    category: 'fragment',
    icon: '☀️',
    loreText: 'Sự tỉ mỉ, kiên nhẫn và lòng hiếu khách của người dân vùng đất chè.',
    realWorldFact: 'Người làm trà Thái Nguyên gìn giữ nghệ thuật đánh hương truyền thống qua nhiều thế hệ.'
  },
  fragment_tradition: {
    id: 'fragment_tradition',
    name: 'Mảnh Ký Ức Phong Tục & Lễ Hội',
    description: 'Âm vang điệu Then, tiếng đàn Tính và hội thi hái chè mùa xuân rộn rã.',
    category: 'fragment',
    icon: '🎋',
    loreText: 'Hương trà mời khách mở đầu câu chuyện, kết nối tình làng nghĩa xóm.',
    realWorldFact: 'Lễ hội chè Tân Cương diễn ra vào ngày 11 tháng Giêng âm lịch hằng năm thu hút hàng vạn du khách.'
  },

  // === VẬT PHẨM NHIỆM VỤ & VƯỜN GIỐNG (CHƯƠNG TÂN CƯƠNG) ===
  note_bac_lam: {
    id: 'note_bac_lam',
    name: 'Tờ Ghi Chú Của Bác Lâm',
    description: 'Mảnh giấy viết tay dặn dò tỉ mỉ của nghệ nhân Bác Lâm về tiêu chuẩn chọn cây giống chè và vật tư làm đất.',
    category: 'quest',
    icon: '📜',
    loreText: '"Bác muốn trồng thêm giống chè truyền thống đã gắn bó lâu đời với vùng trung du Thái Nguyên. Cháu hãy tìm loại cây giống phù hợp ở cửa hàng. Nhân tiện, nhớ tìm vật tư giúp bác chuẩn bị đất cho luống trồng mới. Đừng mua vội nhé, hãy hỏi người bán và đọc kỹ công dụng!"',
    realWorldFact: 'Người xưa truyền miệng kinh nghiệm chọn chè: "Nhất nước, nhì trà, tam pha, tứ ấm" - nhưng gốc rễ khởi đầu luôn là giống chè chuẩn thổ nhưỡng.'
  },

  seedling_trung_du: {
    id: 'seedling_trung_du',
    name: 'Cây Giống Chè Trung Du',
    description: 'Cành giâm chè Trung Du thuần chủng rễ khỏe, chuẩn bị sẵn sàng để hạ luống trồng.',
    category: 'collectible',
    icon: '🌱',
    quantity: 0,
    loreText: 'Giống chè gắn bó với đất sỏi son Tân Cương cả trăm năm, tạo nên giọt trà tiền chát hậu ngọt.',
    realWorldFact: 'Chè Trung du lá dày, răng cưa mịn, rễ ăn sâu giúp cây chống chịu khô hạn và giữ hương vị bền vững.'
  },

  seedling_ldp1: {
    id: 'seedling_ldp1',
    name: 'Cây Giống Chè Lai LDP1',
    description: 'Cây con chè lai thế hệ mới, búp mập nhiều tuyết trắng.',
    category: 'collectible',
    icon: '🌿',
    quantity: 0,
    loreText: 'Giống chè lai năng suất cao của nông nghiệp hiện đại.'
  },

  seedling_kim_tuyen: {
    id: 'seedling_kim_tuyen',
    name: 'Cây Giống Chè Kim Tuyên',
    description: 'Cây giống chè nhập nội lá bóng, chuyên dùng làm trà hương và trà Ô Long.',
    category: 'collectible',
    icon: '🍃',
    quantity: 0,
    loreText: 'Lá mềm mỏng, thoang thoảng hương bơ sữa tự nhiên.'
  },

  seeds_tea_packet: {
    id: 'seeds_tea_packet',
    name: 'Túi Hạt Giống Chè Thực Sinh',
    description: 'Túi hạt chè tròn dùng cho vườn ươm thí nghiệm hoặc nghiên cứu thực vật.',
    category: 'collectible',
    icon: '🌰',
    quantity: 0,
    loreText: 'Hạt giống tạo rễ cọc sâu nhưng tính trạng búp có sự phân ly tự nhiên cao.'
  },

  compost_organic: {
    id: 'compost_organic',
    name: 'Phân Hữu Cơ Vi Sinh Ủ Hoai Mục',
    description: 'Bao phân hữu cơ ủ hoai mục giàu mùn, an toàn tuyệt đối cho rễ non mới trồng.',
    category: 'tool',
    icon: '🤎',
    quantity: 0,
    loreText: 'Mùi đất ủ hoai thơm mát, giúp giữ ẩm và làm đất sỏi son tơi xốp.'
  },

  fertilizer_npk_fast: {
    id: 'fertilizer_npk_fast',
    name: 'Phân Khoáng NPK Hóa Học',
    description: 'Hạt phân hóa học tan nhanh bón thúc định kỳ cho cây lớn, dễ làm xót rễ non.',
    category: 'tool',
    icon: '🧪',
    quantity: 0,
    loreText: 'Nồng độ khoáng đậm đặc chỉ thích hợp khi cây đã bén rễ vững chắc.'
  },

  manure_raw_unprocessed: {
    id: 'manure_raw_unprocessed',
    name: 'Phân Chuồng Tươi Chưa Xử Lý',
    description: 'Chất thải thô chưa qua ủ hoai, sinh nhiệt nóng và chứa nhiều mầm bệnh.',
    category: 'tool',
    icon: '⚠️',
    quantity: 0,
    loreText: 'Bón trực tiếp sẽ làm nóng cháy rễ cây non.'
  },

  coin_xu_tra: {
    id: 'coin_xu_tra',
    name: 'Xu Xứ Trà',
    description: 'Đồng tiền đồng khắc họa tiết lá chè dùng trao đổi nông sản và vật tư tại làng chè.',
    category: 'tool',
    icon: '🪙',
    quantity: 120,
    loreText: 'Vật phẩm lưu niệm độc đáo của các hội chợ văn hóa trà Thái Nguyên.'
  }
};
