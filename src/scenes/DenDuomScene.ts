import { RegionalChapterScene } from './RegionalChapterScene';

export class DenDuomScene extends RegionalChapterScene {
  constructor() {
    super({
      regionId: 'den_duom', sceneKey: 'DenDuomScene', guideName: 'Tình nguyện viên', activity: 'den_duom',
      stops: [
        { id: 'gate', label: 'Tình nguyện viên ở cổng Đền Đuổm', x: 430, y: 574 },
        { id: 'person', label: 'Bia giới thiệu Dương Tự Minh', x: 385, y: 462 },
        { id: 'heritage', label: 'Không gian Đền Trung', x: 500, y: 430 },
        { id: 'festival', label: 'Gian tìm hiểu hội xuân', x: 770, y: 478 },
        { id: 'courtyard', label: 'Sân sinh hoạt cộng đồng', x: 775, y: 570 },
        { id: 'stamp', label: 'Sổ tay khám phá tại cổng', x: 572, y: 624 }
      ],
      stageObjectives: { matching: 'dd_match_leaflet', courtyard: 'dd_prepare_courtyard', conduct: 'dd_visitor_choices' }
    });
  }
}
