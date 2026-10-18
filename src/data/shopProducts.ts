/**
 * Agricultural Shop Products Data for "Cửa Hàng Cây Giống & Vật Tư Xứ Trà" (Cô Hương)
 * Contains accurately verified educational information on planting materials & soil preparation.
 */

export interface IShopProduct {
  id: string;
  name: string;
  category: 'seedling' | 'seed' | 'fertilizer' | 'tool';
  price: number;
  icon: string;
  tag: string;
  shortDesc: string;
  detailedAnalysis: {
    originAndType: string;
    botanicalOrChemicalNature: string;
    suitableStage: string;
    agriculturalMechanism: string;
    caution: string;
  };
  isQuestTargetForSeedling?: boolean;
  isQuestTargetForSoil?: boolean;
  shopkeeperFeedback: string;
}

export const SHOP_PRODUCTS: Record<string, IShopProduct> = {
  // === CÂY GIỐNG & HẠT GIỐNG ===
  seedling_trung_du: {
    id: 'seedling_trung_du',
    name: 'Cây Giống Chè Trung Du (Cành Giâm Rễ Trần/Bầu Đất)',
    category: 'seedling',
    price: 40,
    icon: '🌱',
    tag: 'Giống Cổ Truyền • Đạt Chuẩn',
    shortDesc: 'Cây con nhân giống vô tính từ cành chè Trung Du thuần chủng 12-18 tháng tuổi, bộ rễ khỏe mạnh, giữ nguyên vẹn 100% đặc tính di truyền của chè Tân Cương xưa.',
    detailedAnalysis: {
      originAndType: 'Giống chè cổ truyền trung du bản địa Thái Nguyên, nhân giống bằng phương pháp giâm cành vô tính trong bầu đất.',
      botanicalOrChemicalNature: 'Nhân giống sinh dưỡng giúp giữ nguyên hương vị cốm non, hậu ngọt sâu và khả năng chống chịu điều kiện thổ nhưỡng sông Công.',
      suitableStage: 'Thích hợp trồng mới hoặc dặm vườn chè trong tiết trời lập xuân hoặc thu mát.',
      agriculturalMechanism: 'Bộ rễ mầm sinh trưởng đồng đều, tỷ lệ sống đạt trên 95%, đảm bảo mật độ luống và chất lượng búp chè thu hái sau này không bị phân ly tính trạng.',
      caution: 'Tránh làm vỡ bầu đất khi hạ gốc xuống hố trồng.'
    },
    isQuestTargetForSeedling: true,
    shopkeeperFeedback: 'Cháu tìm hiểu kỹ đấy! Đây đúng là giống chè cổ truyền trung du mà Bác Lâm đang cần cho buổi hội làng.'
  },

  seedling_ldp1: {
    id: 'seedling_ldp1',
    name: 'Cây Giống Chè Lai LDP1 (Cây Con Bầu Đất)',
    category: 'seedling',
    price: 45,
    icon: '🌿',
    tag: 'Giống Lai Hiện Đại',
    shortDesc: 'Giống chè lai chọn tạo thế hệ mới (Mẹ Đại Bạch Trà x Bố PH1), búp mập nhiều tuyết trắng, sinh trưởng rất nhanh và năng suất vượt trội.',
    detailedAnalysis: {
      originAndType: 'Giống lai chọn tạo hiện đại của Viện KHKT Nông lâm nghiệp miền núi phía Bắc.',
      botanicalOrChemicalNature: 'Cây có ưu thế lai mạnh, búp to, nhưng hương vị thiên về thanh dịu chứ không giữ đậm vị cốm truyền thống của chè trung du cổ.',
      suitableStage: 'Thích hợp vùng chuyên canh thâm canh cao sản.',
      agriculturalMechanism: 'Bộ rễ ăn nông tỏa rộng, đòi hỏi chế độ phân bón và nước tưới dồi dào hơn.',
      caution: 'Không phải là giống chè gắn bó lâu đời với người nông dân Tân Cương từ thế kỷ trước.'
    },
    isQuestTargetForSeedling: false,
    shopkeeperFeedback: 'Loại LDP1 này cho năng suất cao lắm, nhưng cháu thử nhớ lại lời Bác Lâm xem: Bác đang tìm giống chè cổ truyền gắn bó lâu đời cơ mà!'
  },

  seedling_kim_tuyen: {
    id: 'seedling_kim_tuyen',
    name: 'Cây Giống Chè Kim Tuyên (Cây Con Bầu Đất)',
    category: 'seedling',
    price: 50,
    icon: '🍃',
    tag: 'Giống Nhập Nội • Hương Quý',
    shortDesc: 'Giống chè nhập nội thích hợp sản xuất trà Ô Long và trà ướp hương hoa tự nhiên, phiến lá dày bóng, vị thanh ngọt thoang thoảng hương bơ.',
    detailedAnalysis: {
      originAndType: 'Nhập nội từ Đài Loan, khảo nghiệm và trồng thành công tại một số tiểu vùng khí hậu mát mẻ.',
      botanicalOrChemicalNature: 'Búp màu xanh phấn, hàm lượng tinh dầu thơm cao, vị chát rất nhẹ.',
      suitableStage: 'Trồng vườn trà hương hoặc các dòng trà cao cấp hữu cơ.',
      agriculturalMechanism: 'Tán cây tròn gọn, khả năng chống chịu sâu bệnh và khô hạn ở mức trung bình.',
      caution: 'Quy trình sao sấy khác biệt hoàn toàn với phương pháp sao chảo gang truyền thống của Bác Lâm.'
    },
    isQuestTargetForSeedling: false,
    shopkeeperFeedback: 'Chè Kim Tuyên rất quý và thơm mùi hoa quả, nhưng không phù hợp với mẻ trà móc câu cổ truyền Bác Lâm chuẩn bị cho ngày hội chè đâu cháu!'
  },

  seeds_tea_packet: {
    id: 'seeds_tea_packet',
    name: 'Túi Hạt Giống Chè Thực Sinh (Hạt Tròn Thuần Chủng)',
    category: 'seed',
    price: 25,
    icon: '🌰',
    tag: 'Hạt Ươm Vườn Thử Nghiệm',
    shortDesc: 'Túi hạt chè thu từ quả chín già, chuyên dùng gieo trong khay cát vườn ươm để nghiên cứu thực vật hoặc ươm gốc ghép, không dùng trồng luống trực tiếp.',
    detailedAnalysis: {
      originAndType: 'Hạt thực sinh thu hoạch từ các cây chè cổ thụ sau vụ hoa mùa đông.',
      botanicalOrChemicalNature: 'Sinh sản hữu tính qua thụ phấn chéo tự nhiên khiến hạt chè có mức độ phân ly di truyền rất cao. Cây con mọc từ hạt sẽ không giữ được tính trạng đồng nhất của cây mẹ.',
      suitableStage: 'Dùng cho các thí nghiệm nảy mầm vườn ươm hoặc lai tạo giống mới.',
      agriculturalMechanism: 'Cây mọc từ hạt tạo rễ cọc sâu nhưng mất 2-3 năm mới phân cành, năng suất và phẩm chất búp rất không đồng đều.',
      caution: 'Trồng luống chè bằng hạt sẽ khiến búp chè sau này chín lệch cữ, không thể thu hái đạt chuẩn "1 tôm 2 lá" đồng loạt.'
    },
    isQuestTargetForSeedling: false,
    shopkeeperFeedback: 'Hạt giống này để gieo trong khay ươm thí nghiệm thì rất thú vị, nhưng Bác Lâm đang cần cây giống con để hạ luống trồng ngay đấy cháu!'
  },

  // === VẬT TƯ & PHÂN BÓN CẢI TẠO ĐẤT ===
  compost_organic: {
    id: 'compost_organic',
    name: 'Phân Hữu Cơ Vi Sinh Ủ Hoai Mục (Bao 10kg)',
    category: 'fertilizer',
    price: 30,
    icon: '🤎',
    tag: 'Bón Lót Cực Tốt • Đạt Chuẩn',
    shortDesc: 'Phân chuồng kết hợp vỏ hạt cà phê và rơm rạ được ủ hoai mục bằng chế phẩm Trichoderma, giàu mùn hữu cơ và vi sinh vật đối kháng có ích cho đất.',
    detailedAnalysis: {
      originAndType: 'Phân bón hữu cơ ủ hoai mục truyền thống theo quy chuẩn nông nghiệp sạch.',
      botanicalOrChemicalNature: 'Độ pH trung tính (6.0 - 6.5), chứa hàm lượng axit humic cao, không còn mầm bệnh hay khí độc.',
      suitableStage: 'Bón lót đáy hố hoặc trộn đều với đất mặt trước khi hạ cây con xuống trồng.',
      agriculturalMechanism: 'Cải tạo kết cấu đất sỏi son pha sét của Tân Cương trở nên tơi xốp, giữ ẩm tốt, kích thích rễ tơ non mọc nhanh và an toàn tuyệt đối, không gây xót rễ.',
      caution: 'Nên đảo đều với đất tầng mặt 7-10 ngày trước khi đặt bầu cây.'
    },
    isQuestTargetForSoil: true,
    shopkeeperFeedback: 'Lựa chọn tuyệt vời! Phân hữu cơ ủ hoai mục giúp đất sỏi son tơi xốp, rễ non gặp mùn sẽ bám rễ cực nhanh mà không sợ bị nóng xót.'
  },

  fertilizer_npk_fast: {
    id: 'fertilizer_npk_fast',
    name: 'Phân Khoáng NPK Hóa Học Đậm Đặc (Công Thức Bón Thúc)',
    category: 'fertilizer',
    price: 35,
    icon: '🧪',
    tag: 'Phân Khoáng Bón Thúc',
    shortDesc: 'Hạt phân hóa học tan nhanh giàu Đạm (N) và Kali (K), chuyên dùng rải mặt đất bón thúc định kỳ cho cây chè đã trưởng thành đang kỳ đâm chồi.',
    detailedAnalysis: {
      originAndType: 'Phân vô cơ tổng hợp công nghiệp tan nhanh.',
      botanicalOrChemicalNature: 'Nồng độ muối khoáng và ion dinh dưỡng rất cao, giải phóng dưỡng chất cấp tốc khi gặp nước.',
      suitableStage: 'Bón thúc sau mỗi lứa thu hái chè trên những nương chè lâu năm đã có bộ rễ già khỏe mạnh.',
      agriculturalMechanism: 'Kích thích chồi ngọn phát triển nhanh nhưng làm chua đất nếu lạm dụng, không có tác dụng tạo mùn hay cải tạo kết cấu đất.',
      caution: 'Cực kỳ nguy hiểm nếu bón sát rễ non mới trồng: nồng độ muối khoáng cao sẽ hút ngược nước trong rễ, làm rễ non bị "xót", cháy lá và chết héo!'
    },
    isQuestTargetForSoil: false,
    shopkeeperFeedback: 'Phân NPK đậm đặc này chỉ dùng bón thúc cho nương chè lớn thôi cháu ơi! Rễ cây con non nớt mà gặp phân hóa học này sẽ bị xót cháy rễ ngay đấy.'
  },

  manure_raw_unprocessed: {
    id: 'manure_raw_unprocessed',
    name: 'Phân Chuồng Tươi Chưa Qua Xử Lý (Bao Thô)',
    category: 'fertilizer',
    price: 15,
    icon: '⚠️',
    tag: 'Chưa Xử Lý • Độc Hại',
    shortDesc: 'Chất thải chăn nuôi gia súc còn tươi nguyên, chưa trải qua quá trình ủ nhiệt lên men vi sinh, giá thành rẻ nhưng tiềm ẩn rủi ro lớn.',
    detailedAnalysis: {
      originAndType: 'Chất thải động vật thô chưa qua xử lý ủ hoai mục.',
      botanicalOrChemicalNature: 'Chứa nhiều vi khuẩn gây hại (E. coli, nấm lở cổ rễ), hạt cỏ dại và ấu trùng bọ hung phá rễ chè.',
      suitableStage: 'Bắt buộc phải gom vào hố ủ kín cùng men vi sinh từ 45-60 ngày trước khi đưa ra đồng ruộng.',
      agriculturalMechanism: 'Khi bón trực tiếp xuống đất, quá trình lên men tự nhiên sẽ sinh nhiệt độ cao (50-60°C) và tạo ra khí độc H2S, NH3 đốt cháy toàn bộ rễ cây non.',
      caution: 'Tuyệt đối không được bón trực tiếp vào luống trồng mới!'
    },
    isQuestTargetForSoil: false,
    shopkeeperFeedback: 'Ôi không được đâu cháu! Phân tươi chưa ủ hoai sẽ sinh nhiệt nóng rực và đầy nấm bệnh, cây chè mới cắm xuống sẽ bị thối rễ chết ngay.'
  }
};
