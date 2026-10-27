import { RegionalChapterScene } from './RegionalChapterScene';

export class DenDuomScene extends RegionalChapterScene {
  constructor() {
    super({
      regionId: 'den_duom', sceneKey: 'DenDuomScene', guideName: 'Tình nguyện viên', activity: 'den_duom',
      stops: [
        { id: 'gate', label: 'Cổng đón khách', x: 480, y: 575 },
        { id: 'person', label: 'Bảng chuyện Dương Tự Minh', x: 270, y: 310 },
        { id: 'heritage', label: 'Tuyến quan sát kiến trúc', x: 480, y: 420 },
        { id: 'festival', label: 'Bàn tìm hiểu hội', x: 745, y: 310 },
        { id: 'courtyard', label: 'Sân trò chơi cộng đồng', x: 745, y: 525 },
        { id: 'stamp', label: 'Bàn lưu dấu', x: 480, y: 620 }
      ],
      stageObjectives: { matching: 'dd_match_leaflet', courtyard: 'dd_prepare_courtyard', conduct: 'dd_visitor_choices' }
    });
  }
}
