# THÁI NGUYÊN QUEST – HÀNH TRÌNH KHÁM PHÁ XỨ TRÀ

> **Game phiêu lưu khám phá 2D Pixel Art kết nối du lịch tỉnh Thái Nguyên, Việt Nam.**  
> Xây dựng bằng **Phaser 3**, **TypeScript**, và **Vite**, tuân thủ phong cách nghệ thuật pixel hoài niệm (Stardew Valley / Eastward vibes), tối ưu hóa trải nghiệm mượt mà trên cả trình duyệt máy tính và thiết bị di động.

---

## 🌟 TỔNG QUAN DỰ ÁN

**"THÁI NGUYÊN QUEST"** đưa người chơi vào vai một nhà du hành trẻ tuổi tình cờ tìm thấy cuốn sổ tay cổ mang tên **"Bí Mật Xứ Trà"**. Cuốn sổ ghi lại dấu tích của **7 Mảnh Ký Ức** linh thiêng đại diện cho bản sắc văn hóa, lịch sử và thiên nhiên của Thái Nguyên:
1. **Văn hóa trà** (Đồi chè Tân Cương)
2. **Truyền thuyết** (Hồ Núi Cốc)
3. **Lịch sử** (ATK Định Hóa – Thủ đô gió ngàn)
4. **Thiên nhiên** (Hang Phượng Hoàng & Suối Mỏ Gà)
5. **Tinh thần khám phá** (Suối Cửa Tử)
6. **Con người xứ trà**
7. **Phong tục & Lễ hội mùa xuân**

Mỗi điểm đến không chỉ là một bối cảnh game sống động mà còn tích hợp **Thẻ Điểm Đến Thực Tế (Destination Discovery Card)** kết nối trực tiếp đến các tour du lịch đời thực và cổng đặt dịch vụ của tỉnh Thái Nguyên.

---

## 🎮 TÍNH NĂNG & HỆ THỐNG TRONG GAME

### 1. Di chuyển & Tương tác thế giới (Core Controls)
- **Bàn phím PC**:
  - `W`, `A`, `S`, `D` hoặc các phím **Mũi tên**: Di chuyển nhân vật 4 hướng mượt mà.
  - `E` hoặc `Phím cách (Space)` / `Enter`: Tương tác ngữ cảnh khi đến gần NPC hoặc luống chè / vật thể.
  - `J`: Mở cuốn sổ tay hành trình **"Bí Mật Xứ Trà"** (Quest Journal & Memory Fragments).
  - `I`: Mở **Hành trang** (Inventory & Ba lô vật phẩm).
  - `M`: Mở **Bản đồ du lịch Thái Nguyên** (World Map với 5 điểm đến).
  - `Esc`: Đóng các cửa sổ đang mở.
- **Thiết bị cảm ứng / Di động**:
  - Tích hợp cụm **Virtual D-pad** và nút **Tương tác [💬]** trực tiếp trên màn hình cảm ứng.

### 2. Hệ thống NPC & Cốt truyện có chiều sâu
- **Bác Lâm – Nghệ nhân chè Tân Cương**: Người hướng dẫn truyền dạy kỹ thuật chọn búp "1 tôm 2 lá", thu hái và sao chè trên chảo gang lửa củi.
- **Bé Mai – Người hái chè thoăn thoắt**: Thiếu nữ mộc mạc chia sẻ kinh nghiệm nhận diện búp non và không khí rộn rã của lễ hội chè mùa xuân.
- **Chú Tuấn – Đại sứ du lịch Thái Nguyên**: Giới thiệu các tuyến tour thực tế ngoài đời thực và thông tin về các điểm đến tiếp theo.
- **Lão Ngư Bến Hồ (Hồ Núi Cốc)**: Kể lại thiên tình sử bi thương và bất tử của nàng Công và chàng Cốc.
- **Chị Lan (ATK Định Hóa)**: Thuyết minh viên giới thiệu dấu ấn di tích lịch sử Thủ đô gió ngàn, đồi Tỉn Keo và lán Khuôn Tát.
- **Anh Dũng (Hang Phượng Hoàng)**: Cán bộ kiểm lâm hướng dẫn thám hiểm hệ thống hang karst và dòng suối Mỏ Gà.
- **Anh Hùng (Suối Cửa Tử)**: Trưởng đoàn trekking an toàn sinh thái hướng dẫn vượt 7 tầng thác ghềnh Tam Đảo.
- Hộp thoại thiết kế theo phong cách RPG cổ điển với hiệu ứng đánh chữ (typewriter), ảnh đại diện nhân vật biểu cảm và cây lựa chọn hội thoại phân nhánh.

### 3. Mini-game tương tác thực thụ (Không mô phỏng tĩnh)
- 🍃 **Mini-game Hái Chè "1 Tôm 2 Lá" (Tân Cương)**: Quan sát các búp chè trên tán cây, phân biệt chính xác búp non chuẩn đạt tiêu chuẩn danh trà với lá già hoặc lá sâu trong thời gian giới hạn.
- 🍵 **Mini-game Sao Chè Thủ Công (Tân Cương)**: Trải nghiệm 3 công đoạn cổ truyền (*Làm héo diệt men ➔ Vò chè tạo móc câu ➔ Sao khô đánh hương*). Nhấn giữ và điều tiết nhịp đảo chè để giữ nhiệt độ chảo gang trong dải xanh lý tưởng (80°C - 95°C) kèm âm thanh xèo xèo chân thực.
- 💡 **Đố Vui Văn Hóa Trà Đạo (Tân Cương)**: Trả lời câu đố văn hóa của Bác Lâm về thổ nhưỡng sông Công và núi Tam Đảo để mở khóa Mảnh Ký Ức Văn Hóa Trà.
- 🛶 **Thuyền Nan & Cổ Thư Hồ Núi Cốc (Hồ Núi Cốc)**: Tìm kiếm 3 cuộn thư cổ trôi dạt giữa các hòn đảo và sắp xếp đúng trình tự thiên tình sử Chàng Cốc – Nàng Công để nhận Mảnh Ký Ức Truyền Thuyết.
- ⭐ **Niên Biểu Lịch Sử Thủ Đô Gió Ngàn (ATK Định Hóa)**: Sắp xếp các mốc son lịch sử chói lọi (1947 thành lập ATK, 1953 họp đồi Tỉn Keo quyết định mở chiến dịch Điện Biên Phủ, lán Khuôn Tát) để nhận Mảnh Ký Ức Lịch Sử.
- 🦅 **Thắp Sáng Hang Ngọc & Thạch Nhũ (Hang Phượng Hoàng)**: Thắp sáng 4 trụ thạch nhũ đá trong lòng vòm hang kỳ vĩ để đánh thức đôi cánh Phượng Hoàng và dòng suối ngọc Mỏ Gà, nhận Mảnh Ký Ức Thiên Nhiên.
- 🌊 **Chinh Phục Thác Ghềnh (Suối Cửa Tử)**: Trang bị bảo hộ an toàn và căn thời điểm nhảy qua các ghềnh đá hoa cương vượt dòng thác cuộn trào sườn đông Tam Đảo, nhận Mảnh Ký Ức Khám Phá.

### 4. Hệ thống Bản Đồ Du Lịch & Dịch Chuyển Tức Thời (World Fast Travel)
- Nhấn phím `M` hoặc nút **Bản đồ** trên thanh HUD để mở bản đồ tỉnh Thái Nguyên.
- Người chơi có thể nhấp vào bất kỳ vùng đất nào đã mở khóa để:
  - Xem thông tin du lịch và tour gợi ý ngoài đời thực.
  - Nhấn nút **"Dịch Chuyển Đến Vùng Này 🚀"** để chuyển cảnh trực tiếp sang Đồi chè Tân Cương, Hồ Núi Cốc, ATK Định Hóa, Hang Phượng Hoàng, hoặc Suối Cửa Tử.

### 5. Tích hợp Cổng Du Lịch & Đặt Tour Thực Tế
- Sau khi hoàn thành nhiệm vụ tại mỗi vùng, game hiển thị **Thẻ Điểm Đến Thực Tế**:
  - Tọa độ, địa chỉ thực tế và mùa du lịch lý tưởng nhất.
  - Điểm nhấn văn hóa, kiến trúc, ẩm thực (cá hồ Núi Cốc, cơm lam Định Hóa, chè móc câu).
  - Danh sách **Tour đề xuất thực tế** kèm nút bấm liên kết trực tiếp đến hệ thống website thông qua adapter sự kiện `TourismApiAdapter` (`window.dispatchEvent` & `postMessage`).

### 6. Âm thanh Synthesizer độc bản (Web Audio API)
- Hoàn toàn tự tổng hợp âm thanh bằng mã nguồn (Procedural Synthesis), không phụ thuộc file mp3/wav ngoài và 100% không vi phạm bản quyền:
  - Giai điệu sáo trúc ngũ cung êm dịu phong cách đồng quê Bắc Bộ (*Do - Re - Fa - Sol - La*).
  - Âm thanh bước chân lạo xạo trên cỏ, tiếng ngắt búp chè thanh mảnh, tiếng lửa xèo xèo trong chảo gang, tiếng chuông fanfare ăn mừng thắng lợi.
  - Hỗ trợ nút bật/tắt âm thanh (Mute/Unmute) tức thì.

### 7. Lưu trữ tiến trình (Save / Load LocalStorage)
- Tự động lưu tiến độ (Auto-save) định kỳ và lưu lại mỗi khi hoàn thành nhiệm vụ.
- Hỗ trợ tính năng "Tiếp tục" hoặc "Bắt đầu hành trình mới" ngay tại Menu chính.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
thai-nguyen-quest/
├── src/
│   ├── assets/
│   │   └── pixelArtGenerator.ts          # Bộ tạo canvas pixel art thủ công (Spritesheet, Tileset, Props)
│   ├── data/
│   │   ├── achievements.ts               # Danh mục danh hiệu và thành tựu
│   │   ├── destinations.ts               # Dữ liệu điểm đến thực tế, địa chỉ, tour du lịch
│   │   ├── dialogues.ts                  # Cây hội thoại tiếng Việt có lựa chọn rẽ nhánh
│   │   ├── items.ts                      # Vật phẩm hành trang, búp chè và 7 Mảnh Ký Ức
│   │   └── quests.ts                     # Dữ liệu nhiệm vụ và mục tiêu từng chương
│   ├── entities/
│   │   ├── NPC.ts                        # Thực thể NPC tương tác kèm bong bóng hội thoại
│   │   └── Player.ts                     # Nhân vật người chơi di chuyển 4 hướng, va chạm physics
│   ├── integrations/
│   │   └── tourismApi.ts                 # Adapter tích hợp cổng du lịch và đặt tour
│   ├── minigames/
│   │   ├── CulturalQuizModal.ts          # Đố vui văn hóa danh trà Tân Cương
│   │   ├── TeaHarvestMinigame.ts         # Mini-game hái chè 1 tôm 2 lá
│   │   ├── TeaProcessingMinigame.ts      # Mini-game sao chè chảo gang giữ nhiệt
│   │   ├── LakeLegendMinigame.ts         # Thuyền nan và xếp cổ thư Hồ Núi Cốc
│   │   ├── HistoricalTimelineMinigame.ts # Niên biểu lịch sử ATK Định Hóa
│   │   ├── CaveLightMinigame.ts          # Thắp sáng thạch nhũ Hang Phượng Hoàng
│   │   └── RiverCrossingMinigame.ts      # Vượt ghềnh thác Suối Cửa Tử
│   ├── scenes/
│   │   ├── BootScene.ts                  # Khởi tạo animation và textures
│   │   ├── MainMenuScene.ts              # Màn hình Menu động bối cảnh đồi chè
│   │   ├── TanCuongScene.ts              # Bản đồ Đồi chè Tân Cương
│   │   ├── HoNuiCocScene.ts              # Bản đồ Hồ Núi Cốc
│   │   ├── AtkDinhHoaScene.ts            # Bản đồ Di tích ATK Định Hóa
│   │   ├── HangPhuongHoangScene.ts       # Bản đồ Hang Phượng Hoàng & Suối Mỏ Gà
│   │   └── SuoiCuaTuScene.ts             # Bản đồ Trekking Suối Cửa Tử
│   ├── systems/
│   │   ├── AudioManager.ts               # Hệ thống âm thanh procedural Web Audio API
│   │   ├── InventoryManager.ts           # Quản lý hành trang và số lượng vật phẩm
│   │   ├── QuestManager.ts               # Quản lý trạng thái và tiến độ nhiệm vụ
│   │   └── SaveManager.ts                # Quản lý lưu trữ LocalStorage an toàn
│   ├── types/
│   │   └── game.ts                       # Toàn bộ TypeScript interfaces chuẩn hóa
│   ├── ui/
│   │   └── UIManager.ts                  # Điều phối HUD, cửa sổ modal, hội thoại và toast
│   ├── main.ts                           # Khởi tạo Phaser Engine
│   └── style.css                         # Toàn bộ hệ thống giao diện, font chữ và màu sắc
├── test/
│   └── quest_and_save.test.js            # Unit tests kiểm tra logic tiến độ và lưu trữ
├── index.html                            # Khung HTML semantic, viewport responsive
├── package.json                          # Cấu hình scripts và dependencies
├── tsconfig.json                         # Cấu hình TypeScript ES2022
└── vite.config.ts                        # Cấu hình Vite bundler
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY GAME

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18+ hoặc 20+ trở lên).

### 2. Khởi chạy máy chủ phát triển (Development Server)
```bash
npm run dev
```
Mở trình duyệt tại địa chỉ: **`http://localhost:3000/`**

### 3. Chạy kiểm thử tự động (Unit Tests)
```bash
npm test
```

### 4. Đóng gói sản phẩm (Production Build)
```bash
npm run build
```
Thư mục xuất xưởng `dist/` có thể được đưa trực tiếp lên hosting (Vercel, Netlify, Nginx, hoặc nhúng vào website du lịch hiện có).

## Cập nhật khám phá làng chè Tân Cương

- Góc nhìn mở rộng, luống chè cong với nhiều loại bụi chè, vườn cây giống và biển tên điểm dừng. Nền cỏ dùng một TileSprite thay cho hàng nghìn sprite riêng.
- Bảng “Một ngày ở làng chè” hiển thị vị trí người chơi, sổ sáu điểm dừng và di chuyển nhanh trong làng. Có thể thu gọn bảng bằng tiêu đề.
- Đến cửa nhà sao chè rồi nhấn **E** hoặc nút tương tác để vào gian nhà riêng. Di chuyển giữa năm bàn dụng cụ, nhấn **E** để xem và thử thao tác; trở về bằng cửa phía dưới hoặc nút “Trở về làng chè”.
- Tham quan miễn phí ngay từ đầu. Minigame sao chè vẫn yêu cầu hoàn thành thu hái theo nhiệm vụ. Các thao tác thử dụng cụ không tự hoàn thành nhiệm vụ chính.
- Dấu khám phá lưu trong `passportStamps` của bản lưu hiện có với tiền tố `village_`. Tải lại vẫn giữ dấu, bắt đầu hành trình mới sẽ đặt lại.
- Đóng minigame sao chè dừng vòng lặp mô phỏng. Điều khiển cảm ứng được gỡ và gắn lại theo vòng đời cảnh, tránh xử lý lặp khi ra/vào nhà.
- Sổ khám phá có nút mở thẻ điểm đến/tour hiện có. Tích hợp booking vẫn sử dụng `TourismApiAdapter`; cần kiểm tra riêng trong website booking_tour thực tế.
- Đây là không gian mô phỏng cách điệu, không phải bản đồ địa lý hoặc hướng dẫn chế biến thương mại.

Kiểm tra: `npm run build`, `npm test`. Kiểm thử trình duyệt bổ sung tại `scripts/check-village.cjs` cần Playwright và Microsoft Edge, chạy khi dev server hoạt động (`node scripts/check-village.cjs`). Có thể đặt `GAME_URL` để đổi URL và `NODE_PATH` nếu dùng Playwright từ runtime ngoài dự án. Ảnh kiểm tra nằm trong `artifacts/village/`.
