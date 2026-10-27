import { RegionalChapterScene } from './RegionalChapterScene';

export class BaoTangVanHoaScene extends RegionalChapterScene {
  constructor() {
    super({
      regionId: 'bao_tang_van_hoa', sceneKey: 'BaoTangVanHoaScene', guideName: 'Người hướng dẫn giáo dục', activity: 'museum',
      stops: [
        { id: 'worksheet', label: 'Sảnh hướng dẫn', x: 480, y: 590 },
        { id: 'clothing', label: 'Góc trang phục · mô hình', x: 185, y: 215 },
        { id: 'instrument', label: 'Góc nhạc cụ · mô hình', x: 395, y: 330 },
        { id: 'living', label: 'Góc sinh hoạt · mô hình', x: 605, y: 445 },
        { id: 'architecture', label: 'Không gian kiến trúc · mô hình', x: 805, y: 560 },
        { id: 'exhibition', label: 'Bàn triển lãm hành trình', x: 480, y: 620 }
      ],
      stageObjectives: { matching: 'bm_match_uses', exhibition: 'bm_build_exhibit' }
    });
  }
}
