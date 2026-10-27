import { LAKE_OBJECTIVES, MAIN_ACTIVITIES, LakeActivity, hasLakeFinaleRequirements } from '../data/lake';
import { SaveManager } from './SaveManager';
import { QuestManager } from './QuestManager';
import { InventoryManager } from './InventoryManager';
import { ProgressionService } from './ProgressionService';
import { IRegionProgress } from '../types/game';

/** Lake activities are saved independently of the linear main quest. */
export class LakeJourney {
  get progress(): IRegionProgress {
    return SaveManager.getInstance().load().regionProgress?.ho_nui_coc || { visitedStops: [], completedActivities: [] };
  }
  has(id: string) { return this.progress.completedActivities.includes('lake_' + id); }
  get activities(): string[] { return this.progress.completedActivities.filter(id => id.startsWith('lake_')).map(id => id.slice(5)); }
  get selections() { return this.progress.selections || {}; }
  initialize() {
    const quest = QuestManager.getInstance().getQuest('quest_ho_nui_coc');
    const legacyCompleted = quest?.status === 'completed';
    const save = SaveManager.getInstance().load();
    save.regionProgress ||= {};
    const p = save.regionProgress.ho_nui_coc ||= { visitedStops: [], completedActivities: [] };
    p.completedActivities ||= [];
    p.visitedStops ||= [];
    p.selections ||= {};
    p.selections.journalEntries = [...new Set([...(Array.isArray(p.selections.journalEntries) ? p.selections.journalEntries : []), ...p.visitedStops])];
    if (legacyCompleted) {
      for (const activity of MAIN_ACTIVITIES) if (!p.completedActivities.includes('lake_' + activity)) p.completedActivities.push('lake_' + activity);
    } else if (quest?.objectives.find(o => o.id === 'obj_meet_boatman')?.completed && !p.completedActivities.includes('lake_welcome')) {
      p.completedActivities.push('lake_welcome');
    }
    // Old 960×720 coordinates belong to a different landscape. Migrate once.
    if (!p.selections?.lakeWorldVersion) {
      p.player = { x: 340, y: 1220, dir: 'up' };
      p.selections = { ...p.selections, lakeWorldVersion: 2 };
    }
    SaveManager.getInstance().save(save);
    this.syncQuest();
  }
  record(id: string, selections: Record<string, string | number | boolean | string[]> = {}) {
    const save = SaveManager.getInstance().load();
    save.regionProgress ||= {};
    const p = save.regionProgress.ho_nui_coc ||= { visitedStops: [], completedActivities: [] };
    const fresh = !p.completedActivities.includes('lake_' + id);
    if (fresh) p.completedActivities.push('lake_' + id);
    p.selections = { ...p.selections, ...selections };
    save.passportStamps ||= {};
    save.passportStamps['ho_nui_coc_activity_' + id] = true;
    SaveManager.getInstance().save(save);
    return fresh;
  }
  setSelection(key: string, value: string | number | boolean | string[]) {
    const save = SaveManager.getInstance().load();
    save.regionProgress ||= {};
    const p = save.regionProgress.ho_nui_coc ||= { visitedStops: [], completedActivities: [] };
    p.selections = { ...p.selections, [key]: value };
    SaveManager.getInstance().save(save);
  }
  visitStop(id: string) {
    const save = SaveManager.getInstance().load();
    save.regionProgress ||= {};
    const p = save.regionProgress.ho_nui_coc ||= { visitedStops: [], completedActivities: [] };
    p.visitedStops ||= [];
    const fresh = !p.visitedStops.includes(id);
    if (fresh) p.visitedStops.push(id);
    const entries = Array.isArray(p.selections?.journalEntries) ? p.selections!.journalEntries as string[] : [];
    if (!entries.includes(id)) p.selections = { ...p.selections, journalEntries: [...entries, id] };
    save.passportStamps ||= {};
    save.passportStamps['ho_nui_coc_stop_' + id] = true;
    SaveManager.getInstance().save(save);
    return fresh;
  }
  complete(activity: LakeActivity, selections: Record<string, string | number | boolean | string[]> = {}): boolean {
    if (activity !== 'welcome' && !this.has('welcome')) return false;
    if (['island', 'ecology'].includes(activity) && !this.has('boat_ready')) return false;
    if (activity === 'legend' && !['meeting', 'separation', 'river'].every(id => this.has('story_' + id))) return false;
    if (activity === 'reflection' && (!hasLakeFinaleRequirements(this.activities) || !this.has('postcard'))) return false;
    const fresh = this.record(activity, selections);
    this.syncQuest();
    return fresh;
  }
  syncQuest() {
    const manager = QuestManager.getInstance();
    const quest = manager.getQuest('quest_ho_nui_coc');
    if (!quest) return;
    if (quest.status !== 'completed') {
      for (let i = 0; i < MAIN_ACTIVITIES.length; i++) {
        if (!this.has(MAIN_ACTIVITIES[i])) break;
        manager.completeObjective(quest.id, LAKE_OBJECTIVES[i].id);
      }
    }
    ProgressionService.saveRuntime('ho_nui_coc');
    if (quest.status === 'completed') {
      const before = SaveManager.getInstance().load();
      if (!before.passportStamps?.ho_nui_coc || !InventoryManager.getInstance().hasItem('fragment_legend')) {
        ProgressionService.awardCompletedChapter(quest.id, 'ho_nui_coc');
      }
    }
  }
}
