import { IDialogueNode } from '../types/game';

export const DIALOGUE_NODES: Record<string, IDialogueNode> = {
  // === Bác Lâm - Nghệ nhân trà Tân Cương ===
  bac_lam_intro: {
    id: 'bac_lam_intro',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Chào cháu! Cháu đến đúng lúc lắm! Sắp tới làng mình có một buổi hội trà. Bác đang chuẩn bị một luống chè mới nhưng còn thiếu cây giống và vật tư. Cháu có muốn giúp bác không?',
    choices: [
      {
        text: 'Dạ có! Cháu cần làm gì ạ?',
        nextDialogueId: 'bac_lam_quest_offer_note'
      },
      {
        text: 'Tại sao phải chọn đúng giống chè hả bác?',
        nextDialogueId: 'bac_lam_explain_cultivar'
      },
      {
        text: 'Cháu muốn tìm hiểu về chè Tân Cương trước.',
        nextDialogueId: 'bac_lam_explain_tea'
      },
      {
        text: 'Để cháu đi khám phá làng đã!',
        nextDialogueId: 'bac_lam_explore_village'
      }
    ]
  },

  bac_lam_explain_cultivar: {
    id: 'bac_lam_explain_cultivar',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Cây chè là gốc của chén trà. Đất sỏi son pha sét và khí hậu Tân Cương đã kết duyên cùng giống chè trung du cổ truyền hơn một thế kỷ qua. Chọn sai giống hay ham giống lạ chưa thuần, cây sẽ còi cọc và không bao giờ cho ra được vị cốm nồng nàn đặc trưng của đất này!',
    choices: [
      {
        text: 'Dạ cháu hiểu rồi, bác giao việc cho cháu đi ạ!',
        nextDialogueId: 'bac_lam_quest_offer_note'
      },
      {
        text: 'Để cháu đi ngắm nghía làng xóm một lát đã.',
        nextDialogueId: 'bac_lam_explore_village'
      }
    ]
  },

  bac_lam_explore_village: {
    id: 'bac_lam_explore_village',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Cháu cứ thong thả dạo quanh ngắm cảnh nhé! Khi nào sẵn sàng giúp bác chuẩn bị luống chè, hãy quay lại đây bất kỳ lúc nào.',
    choices: [
      {
        text: 'Dạ cháu cảm ơn Bác Lâm!',
        action: 'close'
      }
    ]
  },

  bac_lam_explain_tea: {
    id: 'bac_lam_explain_tea',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Tân Cương được trời ban cho đất đai phù sa sông Công pha sỏi son ngút ngàn, lại được dãy Tam Đảo che chắn ánh nắng gắt buổi chiều. Nhờ thế, búp chè ở đây đậm đà vị cốm non, tiền chát hậu ngọt mà không nơi nào sánh bằng.',
    choices: [
      {
        text: 'Tuyệt vời quá! Cháu muốn giúp bác chuẩn bị luống chè mới ngay.',
        nextDialogueId: 'bac_lam_quest_offer_note'
      }
    ]
  },

  bac_lam_quest_offer_note: {
    id: 'bac_lam_quest_offer_note',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Bác gửi cháu "Tờ Ghi Chú Của Bác Lâm" này và 120 Xu Xứ Trà làm kinh phí mua sắm. Cháu hãy sang bên kia đường làng, tìm đến "Cửa Hàng Cây Giống & Vật Tư Xứ Trà" của Cô Hương. Nhớ đọc kỹ gợi ý trong giấy và hỏi Cô Hương cặn kẽ trước khi quyết định mua nhé!',
    choices: [
      {
        text: 'Dạ, cháu nhận ghi chú và đi tìm Cô Hương ngay đây ạ! [Nhận Ghi Chú & 120 Xu]',
        action: 'startQuest',
        nextDialogueId: 'bac_lam_waiting_supplies'
      },
      {
        text: 'Cháu sẽ quay lại sau một chút ạ.',
        action: 'close'
      }
    ]
  },

  bac_lam_waiting_supplies: {
    id: 'bac_lam_waiting_supplies',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Cháu đã ghé qua Cửa hàng Cây giống của Cô Hương chưa? Bác dặn dò kỹ trong "Tờ Ghi Chú": Tìm giống chè cổ truyền trung du và vật tư cải tạo đất cho luống trồng mới.',
    choices: [
      {
        text: 'Cháu đã mang cây giống và vật tư về đây rồi ạ! [Bác Lâm Kiểm Tra]',
        action: 'custom',
        customPayload: 'checkSupplies'
      },
      {
        text: 'Dạ cháu đang sang cửa hàng Cô Hương bên kia đường làng.',
        action: 'close'
      }
    ]
  },

  bac_lam_supplies_success: {
    id: 'bac_lam_supplies_success',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Giỏi lắm! Cháu không chỉ mua đúng giống chè Trung Du cổ truyền với bầu rễ khỏe mạnh mà còn biết tìm hiểu trước khi lựa chọn: Phân hữu cơ ủ hoai mục giúp đất sỏi son tơi xốp, bảo vệ rễ non không bị xót nóng. Người trồng chè giỏi phải hiểu cây chè của mình ngay từ lúc bắt đầu!',
    choices: [
      {
        text: 'Bác ơi, giờ cháu học hái búp chè thế nào ạ?',
        nextDialogueId: 'bac_lam_transition_to_harvest'
      }
    ]
  },

  bac_lam_supplies_wrong: {
    id: 'bac_lam_supplies_wrong',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Chúng ta cùng xem lại tờ ghi chú một chút nhé. Cây chè non cần được nâng niu bằng giống cổ truyền gắn bó lâu đời với trung du và phân hữu cơ ủ hoai mục an toàn. Cháu có thể quay lại cửa hàng của Cô Hương để đổi lại vật tư cho phù hợp nhé, cô Hương sẽ hỗ trợ đổi trả miễn phí cho cháu.',
    choices: [
      {
        text: 'Dạ vâng, để cháu quay lại cửa hàng của Cô Hương đổi lại ngay ạ!',
        action: 'close'
      }
    ]
  },

  bac_lam_transition_to_harvest: {
    id: 'bac_lam_transition_to_harvest',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Cây chè cháu vừa mang về lát nữa chúng ta sẽ hạ luống, nhưng cây non còn cần thời gian bén rễ lớn lên. Trong lúc chờ đợi, bác sẽ dạy cháu cách hái búp trên những cây chè đã trưởng thành nhé!',
    choices: [
      {
        text: 'Tuyệt quá bác ơi! Cháu sẵn sàng học hái búp non rồi ạ.',
        nextDialogueId: 'bac_lam_waiting_harvest'
      }
    ]
  },

  bac_lam_waiting_harvest: {
    id: 'bac_lam_waiting_harvest',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Cháu đã tìm đủ 5 búp chè "1 tôm 2 lá" chưa? Hãy bấm vào các luống chè xanh mướt trên đồi để bắt đầu thử thách hái chè nhé!',
    choices: [
      {
        text: 'Cháu muốn bắt đầu thử thách hái chè ngay!',
        action: 'openMinigame',
        customPayload: 'harvest'
      },
      {
        text: 'Dạ cháu đi ngắm nghía nương chè thêm chút đã ạ.',
        action: 'close'
      }
    ]
  },

  bac_lam_harvest_done: {
    id: 'bac_lam_harvest_done',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Khá lắm! Những búp chè cháu hái xanh non mơn mởn, tôm chè mập mạp đúng chuẩn Tân Cương. Bây giờ là công đoạn quan trọng nhất: Sao chè trên chảo gang đỏ lửa để giữ trọn sắc – hương – vị – hình!',
    choices: [
      {
        text: 'Cháu muốn thử tay nghề sao chè trên chảo gang! [Bắt Đầu Sao Chè]',
        action: 'openMinigame',
        customPayload: 'process'
      }
    ]
  },

  bac_lam_process_done: {
    id: 'bac_lam_process_done',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Mùi thơm cốm non bốc lên ngào ngạt rồi! Cánh trà xoăn đều, phủ phấn trắng mốc cau tinh tế. Trước khi bác trao cho cháu phần thưởng, ta có một câu hỏi nhỏ để kiểm tra xem cháu đã thực sự hiểu hồn chè Thái Nguyên chưa nhé!',
    choices: [
      {
        text: 'Dạ xin Bác cứ ra câu hỏi ạ! [Trả Lời Đố Vui Văn Hóa]',
        action: 'openQuiz'
      }
    ]
  },

  bac_lam_quest_complete: {
    id: 'bac_lam_quest_complete',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Tuyệt vời vô cùng! Cháu quả thực có căn duyên với xứ trà. Xin tặng cháu gói "Trà Tân Cương Thượng Hạng" và đánh thức "Mảnh Ký Ức Văn Hóa Trà" đầu tiên trong cuốn sổ tay của cháu!',
    choices: [
      {
        text: 'Cháu cảm ơn Bác Lâm rất nhiều! [Nhận Mảnh Ký Ức & Thẻ Điểm Đến]',
        action: 'giveReward'
      }
    ]
  },

  bac_lam_after_quest: {
    id: 'bac_lam_after_quest',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Mỗi khi mỏi mệt, hãy nâng chén trà nóng, cháu sẽ thấy lòng mình tĩnh lặng như mặt hồ Núi Cốc. Hành trình của cháu vẫn còn nhiều vùng đất tươi đẹp phía trước, chúc cháu vạn dặm bình an!',
    choices: [
      {
        text: 'Bác ơi, cháu muốn lên chòi ngắm hoàng hôn trên đồi chè! 🌅',
        action: 'custom',
        customPayload: 'triggerSunset'
      },
      {
        text: 'Cháu muốn thử sức hái búp chè "1 tôm 2 lá" lần nữa!',
        action: 'openMinigame',
        customPayload: 'harvest'
      },
      {
        text: 'Cháu muốn tự tay sao chè lại trên chảo gang!',
        action: 'openMinigame',
        customPayload: 'process'
      },
      {
        text: 'Cháu cảm ơn bác! Cháu sẽ tiếp tục lên đường.',
        action: 'close'
      }
    ]
  },

  bac_lam_sunset_cinematic: {
    id: 'bac_lam_sunset_cinematic',
    speaker: 'Bác Lâm',
    speakerRole: 'Nghệ nhân chè Tân Cương',
    speakerAvatar: '👨‍🌾',
    text: 'Nhìn những đồi chè kia xem cháu. Mỗi búp chè là bao công sức của người trồng. Chỉ khi tự tay làm từng công đoạn, mình mới hiểu hết giá trị của chén trà.',
    choices: [
      {
        text: 'Trà Tân Cương quả thực là đệ nhất danh trà! [Tiếp tục hành trình ▶]',
        action: 'close'
      }
    ]
  },

  // === Cô Hương - Chủ Vườn Giống & Vật Tư Xứ Trà ===
  co_huong_intro: {
    id: 'co_huong_intro',
    speaker: 'Cô Hương',
    speakerRole: 'Chủ Vườn Giống & Vật Tư Xứ Trà',
    speakerAvatar: '👩‍🌾',
    text: 'Chào cháu! Cháu định trồng chè à? Ở đây có nhiều giống chè lắm, mỗi giống lại có những đặc điểm khác nhau. Cháu cứ xem kỹ rồi chọn nhé!',
    choices: [
      {
        text: 'Cô ơi, cháu muốn xem gian hàng cây giống và vật tư ạ! [Mở Cửa Hàng]',
        action: 'custom',
        customPayload: 'openShop'
      },
      {
        text: 'Cô có thể giới thiệu cho cháu về các giống chè ở đây không ạ?',
        nextDialogueId: 'co_huong_cultivars_info'
      },
      {
        text: 'Trồng chè từ hạt và từ cành giâm khác nhau thế nào hả cô?',
        nextDialogueId: 'co_huong_seeds_vs_cuttings'
      },
      {
        text: 'Cháu đang đi dạo quanh làng, cảm ơn cô ạ.',
        action: 'close'
      }
    ]
  },

  co_huong_cultivars_info: {
    id: 'co_huong_cultivars_info',
    speaker: 'Cô Hương',
    speakerRole: 'Chủ Vườn Giống & Vật Tư Xứ Trà',
    speakerAvatar: '👩‍🌾',
    text: 'Ở vùng trung du Thái Nguyên, giống chè Trung Du cổ truyền là lâu đời nhất, rễ sâu chịu hạn giỏi, vị đượm hậu ngọt sâu. Gần đây viện nghiên cứu phát triển thêm chè lai LDP1 búp to nhiều tuyết cho năng suất cao, và chè Kim Tuyên lá dày làm trà Ô Long thơm ngọt. Bác Lâm làng mình rất chuộng giống cổ truyền đấy!',
    choices: [
      {
        text: 'Cháu hiểu rồi! Cho cháu xem quầy hàng cây giống ạ. [Mở Cửa Hàng]',
        action: 'custom',
        customPayload: 'openShop'
      },
      {
        text: 'Cháu muốn hỏi thêm về cách nhân giống chè.',
        nextDialogueId: 'co_huong_seeds_vs_cuttings'
      }
    ]
  },

  co_huong_seeds_vs_cuttings: {
    id: 'co_huong_seeds_vs_cuttings',
    speaker: 'Cô Hương',
    speakerRole: 'Chủ Vườn Giống & Vật Tư Xứ Trà',
    speakerAvatar: '👩‍🌾',
    text: 'Hạt chè (thực sinh) tuy rễ cọc đâm rất sâu, nhưng do thụ phấn chéo tự nhiên nên các cây con sẽ bị phân ly di truyền, búp mọc không đồng đều. Để lập luống chè kinh doanh đồng đều đạt chuẩn "1 tôm 2 lá", người làm chè bắt buộc phải dùng cành giâm vô tính để giữ nguyên 100% hương vị cây mẹ!',
    choices: [
      {
        text: 'Kiến thức bổ ích quá! Cháu vào xem quầy hàng ngay đây. [Mở Cửa Hàng]',
        action: 'custom',
        customPayload: 'openShop'
      },
      {
        text: 'Cháu cảm ơn cô nhiều ạ!',
        action: 'close'
      }
    ]
  },

  // === Bé Mai - Người hái chè Tân Cương ===
  mai_intro: {
    id: 'mai_intro',
    speaker: 'Bé Mai',
    speakerRole: 'Thợ hái chè thoăn thoắt',
    speakerAvatar: '👧',
    text: 'Chào bạn! Bạn cũng đến trải nghiệm hái chè cùng mọi người à? Đồi chè Tân Cương lúc sớm mai đẹp như một bức tranh ngọc bích vậy!',
    choices: [
      {
        text: 'Mai ơi, chỉ cho mình mẹo nhận biết búp chè "1 tôm 2 lá" với!',
        nextDialogueId: 'mai_tip'
      },
      {
        text: 'Cảnh sắc ở đây yên bình quá Mai nhỉ.',
        nextDialogueId: 'mai_chat'
      }
    ]
  },

  mai_tip: {
    id: 'mai_tip',
    speaker: 'Bé Mai',
    speakerRole: 'Thợ hái chè thoăn thoắt',
    speakerAvatar: '👧',
    text: '"Tôm" là ngọn búp non nhọn ở giữa chưa nở, còn "2 lá" là hai lá non mềm liền kề bên dưới. Khi hái bạn nhớ dùng ngón cái và ngón trỏ ngắt dứt khoát, không làm dập búp nhé!',
    choices: [
      {
        text: 'Cảm ơn Mai, mình nhớ rồi!',
        action: 'close'
      }
    ]
  },

  mai_chat: {
    id: 'mai_chat',
    speaker: 'Bé Mai',
    speakerRole: 'Thợ hái chè thoăn thoắt',
    speakerAvatar: '👧',
    text: 'Vào mùa xuân sau Tết, lễ hội chè ở đây vui lắm bạn ạ! Có thi sao chè, rước trà, hát Sli, lượn Then của đồng bào Tày, Nùng nữa cơ.',
    choices: [
      {
        text: 'Nghe hào hứng quá, nhất định mình sẽ ghé lại vào dịp lễ hội!',
        action: 'close'
      }
    ]
  },

  // === Chú Tuấn - Hướng dẫn viên du lịch Thái Nguyên ===
  tuan_intro: {
    id: 'tuan_intro',
    speaker: 'Chú Tuấn',
    speakerRole: 'Đại sứ du lịch Thái Nguyên',
    speakerAvatar: '🧑‍💼',
    text: 'Chào mừng bạn đến với vùng đất "Thủ đô gió ngàn – Đệ nhất danh trà"! Tôi phụ trách thông tin du lịch kết nối các điểm đến tại Thái Nguyên.',
    choices: [
      {
        text: 'Thái Nguyên có những tuyến tour nào hấp dẫn ngoài đời thực ạ?',
        nextDialogueId: 'tuan_tours'
      },
      {
        text: 'Làm thế nào để khám phá các vùng đất tiếp theo trên bản đồ?',
        nextDialogueId: 'tuan_progression'
      }
    ]
  },

  tuan_tours: {
    id: 'tuan_tours',
    speaker: 'Chú Tuấn',
    speakerRole: 'Đại sứ du lịch Thái Nguyên',
    speakerAvatar: '🧑‍💼',
    text: 'Hiện tại tuyến "City Tour Tân Cương – Hồ Núi Cốc 1 Ngày" và tour "Về nguồn ATK Định Hóa – Thác Khuôn Tát" đang rất được du khách yêu thích. Bạn có thể mở thẻ điểm đến trên thanh HUD để xem thông tin đặt tour nhé!',
    choices: [
      {
        text: 'Tuyệt vời, cảm ơn chú!',
        action: 'close'
      }
    ]
  },

  tuan_progression: {
    id: 'tuan_progression',
    speaker: 'Chú Tuấn',
    speakerRole: 'Đại sứ du lịch Thái Nguyên',
    speakerAvatar: '🧑‍💼',
    text: 'Sau khi hoàn thành nhiệm vụ và thu thập Mảnh Ký Ức tại Đồi chè Tân Cương, con đường dẫn tới Hồ Núi Cốc và di tích ATK Định Hóa sẽ mở ra trên Bản đồ (phím M). Hãy cố gắng nhé!',
    choices: [
      {
        text: 'Cháu hiểu rồi ạ!',
        action: 'close'
      }
    ]
  },

  // === Hồ Núi Cốc: Lão Ngư & Truyền Thuyết Nàng Công Chàng Cốc ===
  ngu_ong_intro: {
    id: 'ngu_ong_intro',
    speaker: 'Lão Ngư Bến Hồ',
    speakerRole: 'Người kể chuyện Hồ Núi Cốc',
    speakerAvatar: '🛶',
    text: 'Chào người lữ khách! Ngọn gió mang theo hơi nước mát lành từ 89 hòn đảo giữa lòng hồ Núi Cốc đang thổi về. Ngươi đến đây tìm kiếm huyền thoại chàng Cốc – nàng Công phải không?',
    choices: [
      {
        text: 'Dạ phải thưa lão bá! Xin hãy kể cho cháu nghe về chuyện tình này.',
        nextDialogueId: 'ngu_ong_lore'
      },
      {
        text: 'Cháu muốn chèo thuyền khám phá mặt hồ ngay! [Nhận Thử Thách]',
        action: 'openMinigame',
        customPayload: 'lake_legend'
      }
    ]
  },

  ngu_ong_lore: {
    id: 'ngu_ong_lore',
    speaker: 'Lão Ngư Bến Hồ',
    speakerRole: 'Người kể chuyện Hồ Núi Cốc',
    speakerAvatar: '🛶',
    text: 'Thuở xưa, chàng Cốc nghèo khó đem lòng yêu nàng Công xinh đẹp con quan lang. Tình duyên trắc trở đôi lứa chia lìa, chàng ôm sầu hóa dãy núi Cốc sừng sững, còn nàng khóc cạn nước mắt hóa dòng sông Công ôm trọn lấy núi... Hãy chèo thuyền nan tìm 3 trang cổ thư trôi dạt để ghép lại huyền tích!',
    choices: [
      {
        text: 'Cháu xin nhận thuyền nan ra khơi! [Bắt Đầu Thử Thách]',
        action: 'openMinigame',
        customPayload: 'lake_legend'
      }
    ]
  },

  ngu_ong_done: {
    id: 'ngu_ong_done',
    speaker: 'Lão Ngư Bến Hồ',
    speakerRole: 'Người kể chuyện Hồ Núi Cốc',
    speakerAvatar: '🛶',
    text: 'Mặt hồ phẳng lặng đã chứng giám cho tấm lòng của ngươi! "Mảnh Ký Ức Truyền Thuyết" đã rực sáng, hãy giữ gìn khúc ca tình nghĩa này.',
    choices: [
      {
        text: 'Cảm ơn lão bá! [Xem Thẻ Danh Thắng Hồ Núi Cốc]',
        action: 'openDestCard',
        customPayload: 'ho_nui_coc'
      }
    ]
  },

  // === ATK Định Hóa: Chị Lan Hướng Dẫn Viên Di Tích ===
  lan_atk_intro: {
    id: 'lan_atk_intro',
    speaker: 'Chị Lan',
    speakerRole: 'Thuyết minh viên di tích ATK',
    speakerAvatar: '⭐',
    text: 'Chào mừng bạn đến với Khu di tích quốc gia đặc biệt ATK Định Hóa – "Thủ đô gió ngàn" che chở Trung ương Đảng và Bác Hồ trong 9 năm kháng chiến chống Pháp trường kỳ!',
    choices: [
      {
        text: 'Chị ơi, nơi đây lưu giữ những dấu tích lịch sử quan trọng nào ạ?',
        nextDialogueId: 'lan_atk_history'
      },
      {
        text: 'Em muốn thử thách sắp xếp niên biểu lịch sử ATK! [Bắt Đầu]',
        action: 'openMinigame',
        customPayload: 'atk_timeline'
      }
    ]
  },

  lan_atk_history: {
    id: 'lan_atk_history',
    speaker: 'Chị Lan',
    speakerRole: 'Thuyết minh viên di tích ATK',
    speakerAvatar: '⭐',
    text: 'Tại đồi Tỉn Keo, ngày 6/12/1953, Chủ tịch Hồ Chí Minh đã chủ trì cuộc họp Bộ Chính trị thông qua quyết định lịch sử mở Chiến dịch Điện Biên Phủ "Lừng lẫy năm châu, chấn động địa cầu". Rừng tre Khuôn Tát và suối nguồn nơi đây là biểu tượng bất diệt của lòng son cách mạng!',
    choices: [
      {
        text: 'Tự hào quá! Em xin tham gia thử thách niên biểu lịch sử.',
        action: 'openMinigame',
        customPayload: 'atk_timeline'
      }
    ]
  },

  lan_atk_done: {
    id: 'lan_atk_done',
    speaker: 'Chị Lan',
    speakerRole: 'Thuyết minh viên di tích ATK',
    speakerAvatar: '⭐',
    text: 'Xuất sắc lắm! Bạn đã ghi nhớ trọn vẹn những mốc son chói lọi của dân tộc. Xin trao tặng bạn "Mảnh Ký Ức Lịch Sử" của Thủ đô gió ngàn!',
    choices: [
      {
        text: 'Em cảm ơn chị Lan! [Xem Thẻ Di Tích ATK Định Hóa]',
        action: 'openDestCard',
        customPayload: 'atk_dinh_hoa'
      }
    ]
  },

  // === Hang Phượng Hoàng & Suối Mỏ Gà: Anh Dũng Kiểm Lâm ===
  dung_cave_intro: {
    id: 'dung_cave_intro',
    speaker: 'Anh Dũng',
    speakerRole: 'Kiểm lâm & Nhà nghiên cứu karst',
    speakerAvatar: '🦅',
    text: 'Chào bạn trẻ! Hang Phượng Hoàng và Suối Mỏ Gà thuộc huyện Võ Nhai là tuyệt tác karst triệu năm tuổi. Vòm hang cao hơn trăm mét và bên trong có khối thạch nhũ hình chim phượng hoàng dang cánh kỳ vĩ!',
    choices: [
      {
        text: 'Em muốn thắp đèn thám hiểm lòng hang và hóa giải câu đố thạch nhũ!',
        action: 'openMinigame',
        customPayload: 'cave_light'
      },
      {
        text: 'Nghe nói suối Mỏ Gà chảy ngầm trong lòng hang nước mát lạnh phải không anh?',
        nextDialogueId: 'dung_cave_water'
      }
    ]
  },

  dung_cave_water: {
    id: 'dung_cave_water',
    speaker: 'Anh Dũng',
    speakerRole: 'Kiểm lâm & Nhà nghiên cứu karst',
    speakerAvatar: '🦅',
    text: 'Đúng vậy! Dòng suối Mỏ Gà tuôn trào từ cửa hang ngầm tạo nên hồ nước trong vắt xanh biếc quanh năm. Nhưng trước hết, hãy thắp sáng đèn lồng để khám phá vòm hang chính nhé!',
    choices: [
      {
        text: 'Em đã chuẩn bị sẵn sàng đèn đuốc rồi ạ! [Thám Hiểm Hang]',
        action: 'openMinigame',
        customPayload: 'cave_light'
      }
    ]
  },

  dung_cave_done: {
    id: 'dung_cave_done',
    speaker: 'Anh Dũng',
    speakerRole: 'Kiểm lâm & Nhà nghiên cứu karst',
    speakerAvatar: '🦅',
    text: 'Thật tuyệt vời! Ánh sáng đã soi rọi toàn bộ vòm đá, đánh thức "Mảnh Ký Ức Thiên Nhiên" ngàn năm tuổi của vùng núi Võ Nhai!',
    choices: [
      {
        text: 'Cảm ơn anh Dũng! [Mở Thẻ Danh Thắng Hang Phượng Hoàng]',
        action: 'openDestCard',
        customPayload: 'hang_phuong_hoang'
      }
    ]
  },

  // === Suối Cửa Tử: Anh Hùng Trưởng Đoàn Trekking ===
  hung_trek_intro: {
    id: 'hung_trek_intro',
    speaker: 'Anh Hùng',
    speakerRole: 'Trưởng đoàn Trekking Cửa Tử',
    speakerAvatar: '🌊',
    text: 'Chào người bạn quả cảm! Suối Cửa Tử ở xã Hoàng Nông, Đại Từ bắt nguồn từ sườn đông dãy Tam Đảo. Dòng nước ngọc bích luồn qua 7 tầng thác ghềnh hoa cương hoang sơ tuyệt mỹ.',
    choices: [
      {
        text: 'Em muốn thử sức vượt ghềnh đá Cửa Tử! [Thử Thách Trekking]',
        action: 'openMinigame',
        customPayload: 'river_crossing'
      },
      {
        text: 'Tại sao dòng suối lại có tên gọi độc đáo là "Cửa Tử" vậy anh?',
        nextDialogueId: 'hung_trek_lore'
      }
    ]
  },

  hung_trek_lore: {
    id: 'hung_trek_lore',
    speaker: 'Anh Hùng',
    speakerRole: 'Trưởng đoàn Trekking Cửa Tử',
    speakerAvatar: '🌊',
    text: '"Cửa Tử" vì xưa kia hẻm núi chỉ có một lối vào duy nhất giữa hai vách đá dựng đứng, nước xiết quanh co; khi vượt qua được thì mở ra khung cảnh bồng lai tiên cảnh ngút ngàn của rừng nguyên sinh. Hãy nhớ trang bị áo phao và tuân thủ quy tắc an toàn nhé!',
    choices: [
      {
        text: 'Em đã mặc áo phao và sẵn sàng vượt thác! [Bắt Đầu]',
        action: 'openMinigame',
        customPayload: 'river_crossing'
      }
    ]
  },

  hung_trek_done: {
    id: 'hung_trek_done',
    speaker: 'Anh Hùng',
    speakerRole: 'Trưởng đoàn Trekking Cửa Tử',
    speakerAvatar: '🌊',
    text: 'Hoan hô! Bạn đã xuất sắc vượt qua các cửa ải ghềnh thác an toàn. "Mảnh Ký Ức Khám Phá" thuộc về bạn, chúc mừng bạn đã thấu hiểu trọn vẹn vẻ đẹp muôn màu của Thái Nguyên!',
    choices: [
      {
        text: 'Tuyệt đỉnh! [Xem Thẻ Du Lịch Trekking Suối Cửa Tử]',
        action: 'openDestCard',
        customPayload: 'suoi_cua_tu'
      }
    ]
  }
};

