/**
 * Authentic Vietnamese Tea Cultivars Data
 * Verified agricultural, historical, and botanical facts for Thái Nguyên tea.
 */

export interface ITeaCultivar {
  id: string;
  name: string;
  scientificName: string;
  category: 'traditional' | 'hybrid' | 'imported';
  materialType: 'cutting' | 'seed';
  origin: string;
  historyAndCulture: string;
  botanicalFeatures: {
    leafShape: string;
    budColor: string;
    rootSystem: string;
    vigor: string;
  };
  processingFit: string;
  price: number;
  icon: string;
  isUnlockedInEncyclopedia: boolean;
  educationalClues: {
    isTraditionalMidland: boolean;
    isSuitableForPlotEstablishment: boolean;
    shopkeeperFeedback: string;
  };
}

export const TEA_CULTIVARS: Record<string, ITeaCultivar> = {
  trung_du: {
    id: 'trung_du',
    name: 'Chè Trung Du (Chè Cổ Truyền Thái Nguyên)',
    scientificName: 'Camellia sinensis var. sinensis (Nhóm giống Trung Du)',
    category: 'traditional',
    materialType: 'cutting',
    origin: 'Bản địa vùng trung du Bắc Bộ, gắn liền với lịch sử lập đồn điền chè Tân Cương từ những năm 1920.',
    historyAndCulture: 'Là "linh hồn" của đệ nhất danh trà Thái Nguyên. Trải qua hơn một thế kỷ, giống chè này đã thích nghi hoàn hảo với đất sỏi son pha sét và khí hậu chân núi Tam Đảo, tạo nên hương cốm non nồng nàn và hậu ngọt sâu lắng.',
    botanicalFeatures: {
      leafShape: 'Lá dày vừa, phiến lá gợn sóng nhẹ, răng cưa đều, mép lá hơi uốn cong.',
      budColor: 'Búp màu xanh ánh vàng, phủ lớp lông tơ mịn màng.',
      rootSystem: 'Rễ cọc ăn sâu vào tầng đất sỏi son, khả năng chống hạn và chịu rét rất tốt.',
      vigor: 'Cây phân cành dày, tán xòe tròn, tuổi thọ cây có thể kéo dài hàng chục đến cả trăm năm.'
    },
    processingFit: 'Chuyên sản xuất trà xanh móc câu truyền thống, trà búp đặc sản, tạo nước xanh trong ánh vàng và vị cốm đậm đà.',
    price: 40,
    icon: '🌱',
    isUnlockedInEncyclopedia: true,
    educationalClues: {
      isTraditionalMidland: true,
      isSuitableForPlotEstablishment: true,
      shopkeeperFeedback: 'Cháu tìm hiểu kỹ đấy! Đây đúng là giống chè cổ truyền trung du mà Bác Lâm đang mong tìm.'
    }
  },

  ldp1: {
    id: 'ldp1',
    name: 'Chè Lai LDP1',
    scientificName: 'Camellia sinensis (Lai: Mẹ Đại Bạch Trà x Bố PH1)',
    category: 'hybrid',
    materialType: 'cutting',
    origin: 'Viện Khoa học Kỹ thuật Nông lâm nghiệp miền núi phía Bắc (chọn tạo tại Phú Hộ, Phú Thọ).',
    historyAndCulture: 'Là giống chè lai chọn tạo hiện đại được công nhận giống quốc gia, nhân rộng mạnh tại các vùng thâm canh nhờ năng suất vượt trội và búp to mập.',
    botanicalFeatures: {
      leafShape: 'Lá to bản, màu xanh đậm bóng, chóp lá nhọn dài, phiến lá phẳng.',
      budColor: 'Búp màu xanh nõn chuối, rất mập mạp và phủ dày tuyết trắng.',
      rootSystem: 'Rễ phát triển mạnh ở tầng đất mặt, yêu cầu thâm canh nước và dinh dưỡng cao.',
      vigor: 'Sinh trưởng nhanh, đâm chồi khỏe, mật độ búp dày, năng suất cao hơn chè Trung Du 20-30%.'
    },
    processingFit: 'Thích hợp chế biến cả trà xanh búp cao cấp lẫn trà đen xuất khẩu, nước trà có màu vàng óng, vị chát dịu.',
    price: 45,
    icon: '🌿',
    isUnlockedInEncyclopedia: true,
    educationalClues: {
      isTraditionalMidland: false,
      isSuitableForPlotEstablishment: true,
      shopkeeperFeedback: 'Giống LDP1 này năng suất rất cao, búp to mập phủ tuyết, nhưng đây là giống chè lai hiện đại chứ chưa phải giống cổ truyền lâu đời Bác Lâm dặn đâu cháu nhé!'
    }
  },

  kim_tuyen: {
    id: 'kim_tuyen',
    name: 'Chè Kim Tuyên (Kim Huyên)',
    scientificName: 'Camellia sinensis cv. Tai cha No.12 (TTV-27)',
    category: 'imported',
    materialType: 'cutting',
    origin: 'Đài Loan nhập nội và khảo nghiệm tại các vùng chè Việt Nam.',
    historyAndCulture: 'Được mệnh danh là dòng chè quý phái cho các dòng trà lên men một phần. Có vị ngọt thanh và thoang thoảng hương bơ hoặc hoa quả tự nhiên.',
    botanicalFeatures: {
      leafShape: 'Phiến lá tròn hình bầu dục, màu xanh non tươi mát, lá dày dặn mềm mại.',
      budColor: 'Búp non màu xanh phấn nhạt, ít lông tuyết hơn giống LDP1.',
      rootSystem: 'Bộ rễ phát triển vừa phải, ưa đất giàu mùn thoát nước tốt.',
      vigor: 'Cây tán gọn, cành phân bố đều, chống chịu sâu bệnh trung bình.'
    },
    processingFit: 'Rất lý tưởng để chế biến trà Ô Long, trà ướp hương hoa tự nhiên và trà xanh thanh vị.',
    price: 50,
    icon: '🍃',
    isUnlockedInEncyclopedia: true,
    educationalClues: {
      isTraditionalMidland: false,
      isSuitableForPlotEstablishment: true,
      shopkeeperFeedback: 'Chè Kim Tuyên rất thơm và quý, chuyên dùng làm trà Ô Long, nhưng bác Lâm đang muốn khôi phục luống chè truyền thống xứ trà Thái Nguyên cơ!'
    }
  },

  tri777: {
    id: 'tri777',
    name: 'Chè TRI777',
    scientificName: 'Camellia sinensis (Dòng nhập nội từ Sri Lanka)',
    category: 'imported',
    materialType: 'cutting',
    origin: 'Tuyển chọn từ nguồn gốc Sri Lanka đưa vào khảo nghiệm tại Việt Nam.',
    historyAndCulture: 'Giống chè nổi tiếng với khả năng phân cành cực khỏe và hàm lượng polyphenol dồi dào, phù hợp công nghiệp chế biến hiện đại.',
    botanicalFeatures: {
      leafShape: 'Lá dày, hơi cong lượn, mép lá răng cưa sâu.',
      budColor: 'Búp màu xanh ánh tím nhẹ khi gặp thời tiết lạnh.',
      rootSystem: 'Rễ cọc phân nhánh rộng, chịu thâm canh phân bón.',
      vigor: 'Cây khỏe, cành cứng cáp, chịu cắt xén tạo tán bằng máy.'
    },
    processingFit: 'Chuyên dùng chế biến trà xanh xuất khẩu và nguyên liệu trà đóng chai.',
    price: 35,
    icon: '🎋',
    isUnlockedInEncyclopedia: false,
    educationalClues: {
      isTraditionalMidland: false,
      isSuitableForPlotEstablishment: true,
      shopkeeperFeedback: 'TRI777 cành cứng cáp, năng suất cao nhưng vị chát mạnh, không phải giống chè móc câu truyền thống Bác Lâm cần.'
    }
  },

  phuc_van_tien: {
    id: 'phuc_van_tien',
    name: 'Chè Phúc Vân Tiên',
    scientificName: 'Camellia sinensis (Chọn tạo giữa Phúc Thọ x Vân Nam)',
    category: 'hybrid',
    materialType: 'cutting',
    origin: 'Viện KHKT Nông lâm nghiệp miền núi phía Bắc lai tạo.',
    historyAndCulture: 'Dòng chè thơm thế hệ mới, nước xanh biếc, búp có hương hoa tươi mát tự nhiên được nhiều nghệ nhân trẻ yêu thích.',
    botanicalFeatures: {
      leafShape: 'Lá màu xanh sẫm, thuôn dài, bóng mượt.',
      budColor: 'Búp mập, màu trắng tuyết nổi bật.',
      rootSystem: 'Rễ tơ phát triển dày, ưa đất ẩm mát.',
      vigor: 'Phát lộc sớm vào vụ xuân, mật độ búp dầy.'
    },
    processingFit: 'Sản xuất trà xanh búp thượng phẩm và trà hữu cơ cao cấp.',
    price: 55,
    icon: '🌸',
    isUnlockedInEncyclopedia: false,
    educationalClues: {
      isTraditionalMidland: false,
      isSuitableForPlotEstablishment: true,
      shopkeeperFeedback: 'Phúc Vân Tiên hương hoa quả rất thơm, nhưng cháu hãy nhớ lại lời dặn của Bác Lâm về giống gắn bó lâu đời nhé!'
    }
  }
};
