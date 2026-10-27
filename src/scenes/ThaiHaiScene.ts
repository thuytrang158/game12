import { RegionalChapterScene } from './RegionalChapterScene';

export class ThaiHaiScene extends RegionalChapterScene {
  constructor() {
    super({
      regionId: 'thai_hai', sceneKey: 'ThaiHaiScene', guideName: 'Người đón khách', activity: 'thai_hai',
      stops: [
        { id: 'gate', label: 'Cổng bản', x: 480, y: 575 },
        { id: 'host', label: 'Nhà sàn đón khách', x: 480, y: 300 },
        { id: 'garden', label: 'Vườn rau', x: 700, y: 420 },
        { id: 'kitchen', label: 'Gian bếp', x: 245, y: 425 },
        { id: 'yard', label: 'Sân sinh hoạt', x: 745, y: 545 },
        { id: 'porch', label: 'Hiên kể chuyện', x: 480, y: 365 }
      ],
      stageObjectives: { guidelines: 'th_learn_guidelines', ingredients: 'th_choose_ingredients', preparation: 'th_prepare_meal', table: 'th_set_table' }
    });
  }
}
