import { IQuest, IQuestObjective } from '../types/game';
import { SaveManager } from './SaveManager';
import { AudioManager } from './AudioManager';

export type QuestEventListener = (event: 'quest_started' | 'objective_updated' | 'quest_completed', quest: IQuest) => void;

export class QuestManager {
  private static instance: QuestManager;
  private quests: Record<string, IQuest> = {};
  private activeQuestId: string | null = null;
  private completedQuestIds: string[] = [];
  private listeners: QuestEventListener[] = [];

  public static getInstance(): QuestManager {
    if (!QuestManager.instance) {
      QuestManager.instance = new QuestManager();
    }
    return QuestManager.instance;
  }

  public init(initialQuests: Record<string, IQuest>, activeQuestId: string | null, completedQuestIds: string[]) {
    this.quests = JSON.parse(JSON.stringify(initialQuests));
    this.activeQuestId = activeQuestId;
    this.completedQuestIds = [...completedQuestIds];
  }

  public addListener(listener: QuestEventListener) {
    this.listeners.push(listener);
  }

  public removeListener(listener: QuestEventListener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notify(event: 'quest_started' | 'objective_updated' | 'quest_completed', quest: IQuest) {
    this.listeners.forEach(l => l(event, quest));
  }

  public getActiveQuest(): IQuest | null {
    if (!this.activeQuestId || !this.quests[this.activeQuestId]) return null;
    return this.quests[this.activeQuestId];
  }

  public getQuest(questId: string): IQuest | undefined {
    return this.quests[questId];
  }

  public getAllQuests(): Record<string, IQuest> {
    return this.quests;
  }

  public getCompletedQuestIds(): string[] {
    return this.completedQuestIds;
  }

  public isQuestCompleted(questId: string): boolean {
    return this.completedQuestIds.includes(questId);
  }

  public startQuest(questId: string, makeActive: boolean = true): boolean {
    const quest = this.quests[questId];
    if (!quest || quest.status === 'completed') return false;

    quest.status = 'active';
    if (makeActive) this.activeQuestId = questId;
    this.notify('quest_started', quest);
    return true;
  }

  public completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests[questId];
    if (!quest) return false;

    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return false;

    obj.completed = true;
    if (obj.targetCount) {
      obj.currentCount = obj.targetCount;
    }

    AudioManager.getInstance().playPluck();
    this.notify('objective_updated', quest);

    // Check if all objectives are completed
    const allDone = quest.objectives.every(o => o.completed);
    if (allDone) {
      this.completeQuest(questId);
    }

    return true;
  }

  public incrementObjective(questId: string, objectiveId: string, amount: number = 1): boolean {
    const quest = this.quests[questId];
    if (!quest) return false;

    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return false;

    if (obj.targetCount !== undefined) {
      obj.currentCount = Math.min(obj.targetCount, (obj.currentCount || 0) + amount);
      if (obj.currentCount >= obj.targetCount) {
        obj.completed = true;
      }
    } else {
      obj.completed = true;
    }

    AudioManager.getInstance().playPluck();
    this.notify('objective_updated', quest);

    const allDone = quest.objectives.every(o => o.completed);
    if (allDone) {
      this.completeQuest(questId);
    }

    return true;
  }

  public completeQuest(questId: string): boolean {
    const quest = this.quests[questId];
    if (!quest || quest.status === 'completed') return false;

    quest.status = 'completed';
    quest.objectives.forEach(o => o.completed = true);

    if (!this.completedQuestIds.includes(questId)) {
      this.completedQuestIds.push(questId);
    }

    AudioManager.getInstance().playFanfare();
    this.notify('quest_completed', quest);
    return true;
  }

  public getCurrentObjectiveText(): string {
    const quest = this.getActiveQuest();
    if (!quest) return 'Thong thả dạo ngắm cảnh sắc Thái Nguyên';
    
    const uncompletedObj = quest.objectives.find(o => !o.completed);
    if (!uncompletedObj) return 'Nhiệm vụ đã hoàn thành!';

    if (uncompletedObj.targetCount) {
      return `${uncompletedObj.text} (${uncompletedObj.currentCount || 0}/${uncompletedObj.targetCount})`;
    }
    return uncompletedObj.text;
  }
}
