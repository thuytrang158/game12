/** Researched landmarks; positions and activities are deliberately schematic. */
export const LAKE_SIZE = { width: 2400, height: 1600 };
export type LakeStopId = 'arrival' | 'dock' | 'history' | 'palace' | 'pagoda' | 'island' | 'exhibition' | 'birds' | 'fountain' | 'life' | 'panorama' | 'sunset';
export interface LakeStop {
  id: LakeStopId; name: string; subtitle: string; x: number; y: number;
  area: 'shore' | 'island' | 'birds'; kind: string; description: string; source?: string; activityId?: string;
}
export const LAKE_SOURCES = {
  operator: { title: 'Đơn vị du lịch Hồ Núi Cốc', url: 'https://dulichhonuicoc.vn/gioi-thieu/' },
  baCayThong: { title: 'Báo và Phát thanh, Truyền hình Thái Nguyên · Động Ba Cây Thông', url: 'https://baothainguyen.vn/file/e7837c027f6ecd14017ffa4e5f2a0e34/upload/xdata/202507/20250703215943ngay_4-7_hanhchuan-da_nen.pdf' },
  tourism: { title: 'Cục Du lịch Quốc gia Việt Nam', url: 'https://nongthon.vietnamtourism.gov.vn/ho-nui-coc-vien-ngoc-xanh-giua-nui-rung-thai-nguyen/' },
  history: { title: 'Báo Chính phủ · tư liệu hình thành hồ', url: 'https://baochinhphu.vn/thi-nhau-lan-chiem-ho-nui-coc-10286829.htm' },
  island: { title: 'Báo Công Thương · đảo Núi Cái', url: 'https://congthuong.vn/can-canh-khu-du-lich-dao-nui-cai-noi-co-dong-tien-co-hang-tram-nam-338777.html' }
};
export const LAKE_STOPS: LakeStop[] = [
  { id: 'arrival', name: 'Bến đón khách', subtitle: 'BẮT ĐẦU · MỘT NGÀY BÊN HỒ', x: 340, y: 1190, area: 'shore', kind: 'guide', description: 'Gặp Lão Ngư, nhận sổ hành trình và chọn tuyến khám phá cảnh quan, công trình cùng câu chuyện của hồ.', source: 'tourism', activityId: 'welcome' },
  { id: 'dock', name: 'Bến du thuyền', subtitle: 'LÊN THUYỀN · RA GIỮA MÀU XANH', x: 690, y: 905, area: 'shore', kind: 'boat', description: 'Chuẩn bị áo phao, vị trí ngồi, xem bến đến rồi tự lái hoặc đi cùng người lái thuyền trong sơ đồ cách điệu.', source: 'operator', activityId: 'boat_ready' },
  { id: 'history', name: 'Góc tìm hiểu đập hồ và lịch sử hồ chứa', subtitle: 'TƯ LIỆU · TỪ DÒNG SÔNG ĐẾN HỒ CHỨA', x: 2170, y: 1300, area: 'shore', kind: 'dam', description: 'Khám phá giai đoạn xây dựng 1973–1982, so sánh hai minh họa cảnh quan và tìm hiểu vai trò tưới tiêu cùng du lịch.', source: 'history', activityId: 'history' },
  { id: 'palace', name: 'Huyền Thoại Cung', subtitle: 'CÂU CHUYỆN · NÀNG CÔNG, CHÀNG CỐC', x: 300, y: 735, area: 'shore', kind: 'cave', description: 'Bước vào không gian kể chuyện, quan sát ba hoạt cảnh và ghép lại huyền tích. Câu chuyện được trình bày riêng với lịch sử xây dựng hồ.', source: 'operator', activityId: 'legend' },
  { id: 'pagoda', name: 'Chùa Thác Vàng', subtitle: 'KIẾN TRÚC · MỘT KHOẢNG LẶNG', x: 300, y: 385, area: 'shore', kind: 'pagoda', description: 'Quan sát mái chùa, tượng Phật và không gian cây xanh qua mô hình kiến trúc cách điệu; chọn cách tham quan phù hợp.', source: 'operator', activityId: 'pagoda' },
  { id: 'island', name: 'Đảo Núi Cái', subtitle: 'DU NGOẠN · DẤU VẾT VĂN HÓA', x: 1500, y: 445, area: 'island', kind: 'island', description: 'Cập bến, đi qua mô hình cổng tam quan, quan sát nhà cổ và hình minh họa đồng tiền được giới thiệu trong tư liệu về đảo.', source: 'island', activityId: 'island' },
  { id: 'exhibition', name: 'Góc trưng bày Động Ba Cây Thông', subtitle: 'QUAN SÁT · TÌM CHI TIẾT TRƯNG BÀY', x: 440, y: 535, area: 'shore', kind: 'exhibition', description: 'Khám phá một hoạt động trưng bày mô phỏng. Tư liệu địa phương giới thiệu nơi đây là không gian trưng bày hiện vật; các nhãn minh họa trong game không khẳng định xuất xứ hiện vật.', source: 'baCayThong', activityId: 'exhibition' },
  { id: 'birds', name: 'Điểm quan sát thiên nhiên', subtitle: 'THIÊN NHIÊN · GIỮ MỘT KHOẢNG CÁCH', x: 1830, y: 875, area: 'birds', kind: 'birds', description: 'Dùng ống nhòm tìm ba dáng chim minh họa và ghi chép cảnh quan. Sàn quan sát là điểm hư cấu trong trò chơi.', source: 'tourism', activityId: 'ecology' },
  { id: 'fountain', name: 'Sân khấu nhạc nước', subtitle: 'SÁNG TẠO · VẼ NHẠC BẰNG NƯỚC', x: 1150, y: 1310, area: 'shore', kind: 'fountain', description: 'Tạo một tiết mục mô phỏng gồm ba đoạn với vòi phun, màu sắc và nhịp chuyển cảnh do bạn chọn.', source: 'operator', activityId: 'fountain' },
  { id: 'life', name: 'Góc đời sống ven hồ', subtitle: 'CON NGƯỜI · CHUYỆN BÊN BẾN NƯỚC', x: 730, y: 1400, area: 'shore', kind: 'market', description: 'Trò chuyện với người bán hàng hư cấu rồi sắp bàn đón khách bằng các món minh họa trong trò chơi.', activityId: 'life' },
  { id: 'panorama', name: 'Điểm ngắm toàn cảnh · bố trí mô phỏng', subtitle: 'CẢNH QUAN · LƯU MỘT KHUNG HÌNH', x: 1380, y: 1190, area: 'shore', kind: 'panorama', description: 'Chọn một khung hình có sẵn, quan sát các lớp mặt nước, đảo và đồi, rồi lưu chú thích vào sổ. Đây là vị trí mô phỏng, không phải điểm ngắm được xác định ngoài thực địa.', activityId: 'panorama' },
  { id: 'sunset', name: 'Bến hoàng hôn và sổ kỷ niệm', subtitle: 'KỶ NIỆM · MANG THEO MỘT MÀU HỒ', x: 1780, y: 1430, area: 'shore', kind: 'sunset', description: 'Chọn ánh sáng, viết lời nhắn cho bưu thiếp và hoàn thiện trang sổ sau khi khám phá các hoạt động chính.', activityId: 'reflection' }
];
export const MAINLAND = [[0,0],[600,0],[590,350],[530,530],[600,750],[590,1000],[880,1090],[1400,1140],[1880,1070],[2400,1060],[2400,1600],[0,1600]];
export const LAKE_DOCKS = [
  { id: 'shore', name: 'Bến du thuyền', foot: { x: 690, y: 905 }, water: { x: 850, y: 905 } },
  { id: 'island', name: 'Đảo Núi Cái', foot: { x: 1500, y: 555 }, water: { x: 1500, y: 680 } },
  { id: 'birds', name: 'Bến quan sát chim', foot: { x: 1730, y: 960 }, water: { x: 1730, y: 1060 } }
] as const;
/** Irregular schematic shorelines for the landmark islands and smaller scenic islets. */
export const LAKE_ISLANDS = [
  { id: 'nui_cai', vertices: [[1285,360],[1315,298],[1380,257],[1435,270],[1470,226],[1555,247],[1590,296],[1675,319],[1692,376],[1644,405],[1618,455],[1552,470],[1512,526],[1443,509],[1400,460],[1338,452],[1303,410]] },
  { id: 'birds', vertices: [[1702,826],[1725,788],[1770,764],[1819,773],[1852,748],[1907,767],[1937,812],[1970,835],[1955,878],[1910,897],[1888,936],[1832,950],[1783,927],[1745,923],[1715,884]] },
  { id: 'islet_west', vertices: [[970,479],[994,451],[1031,449],[1060,468],[1056,502],[1023,520],[987,508]] },
  { id: 'islet_north', vertices: [[1085,258],[1112,225],[1157,230],[1180,264],[1168,299],[1125,307],[1095,289]] },
  { id: 'islet_east', vertices: [[2050,590],[2078,558],[2119,556],[2152,581],[2146,619],[2112,637],[2075,620]] },
  { id: 'islet_south', vertices: [[1504,1050],[1530,1018],[1571,1023],[1600,1052],[1585,1088],[1545,1096],[1516,1078]] }
] as const;
export function pointInPolygon(x: number, y: number, vertices: readonly (readonly number[])[]): boolean {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const [xi, yi] = vertices[i], [xj, yj] = vertices[j];
    if (((yi > y) !== (yj > y)) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function isLakeLand(x: number, y: number): boolean {
  return pointInPolygon(x, y, MAINLAND)
    || LAKE_ISLANDS.some(island => pointInPolygon(x, y, island.vertices))
    || (x >= 560 && x <= 805 && y >= 875 && y <= 940)
    || (x >= 1475 && x <= 1525 && y >= 530 && y <= 630)
    || (x >= 1705 && x <= 1755 && y >= 925 && y <= 1010);
}
export const LAKE_OBJECTIVES = [
  { id: 'obj_meet_boatman', text: 'Gặp Lão Ngư tại Bến đón khách để nhận sổ hành trình' },
  { id: 'obj_prepare_boat', text: 'Chuẩn bị áo phao và vị trí ngồi tại Bến du thuyền' },
  { id: 'obj_lake_history', text: 'Hoàn thành niên biểu và mô hình hồ chứa ở Góc đập hồ & lịch sử' },
  { id: 'obj_nui_cai', text: 'Đi thuyền đến đảo Núi Cái và đối chiếu ba chi tiết văn hóa' },
  { id: 'obj_bird_observation', text: 'Ghé bến quan sát chim, ghi nhận ba dáng chim và cách quan sát phù hợp' },
  { id: 'obj_legend_puzzle', text: 'Khám phá ba hoạt cảnh rồi ghép huyền tích tại Huyền Thoại Cung' },
  { id: 'obj_lake_reflection', text: 'Hoàn thiện bưu thiếp tại Bến ngắm hoàng hôn để nhận dấu Hồ Núi Cốc' }
];
export const MAIN_ACTIVITIES = ['welcome', 'boat_ready', 'history', 'island', 'ecology', 'legend', 'reflection'] as const;
export type LakeActivity = typeof MAIN_ACTIVITIES[number] | 'pagoda' | 'fountain' | 'life' | 'exhibition' | 'panorama';
export const LEGEND_PANELS = [
  { id: 'meeting', title: 'Bên dòng nước', text: 'Trong câu chuyện được kể ở vùng hồ, nàng Công và chàng Cốc đem lòng thương nhau. Cảnh núi, dòng sông và tiếng gọi người thương cùng mở đầu câu chuyện.', motif: 'flower', label: 'Bông hoa bên dòng nước' },
  { id: 'separation', title: 'Nỗi đợi chờ', text: 'Đôi lứa bị chia cách. Chàng Cốc vẫn chờ đợi, hình bóng người chờ được gắn với ngọn núi bên dòng sông.', motif: 'mountain', label: 'Ngọn núi đứng đợi' },
  { id: 'river', title: 'Núi và sông', text: 'Trong huyền tích, nỗi thương nhớ của nàng Công hóa thành dòng nước. Núi và sông trở thành hình ảnh gợi nhắc sự thủy chung.', motif: 'river', label: 'Dòng nước ôm chân núi' }
];
export function isExactOrder(actual: readonly string[], expected: readonly string[]): boolean {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}
export function hasLakeFinaleRequirements(activities: readonly string[]): boolean {
  return MAIN_ACTIVITIES.slice(0, -1).every(id => activities.includes(id));
}
export function nextLakeObjective(activities: readonly string[]): typeof LAKE_OBJECTIVES[number] | undefined {
  const index = MAIN_ACTIVITIES.findIndex(activity => !activities.includes(activity));
  return index >= 0 ? LAKE_OBJECTIVES[index] : undefined;
}
