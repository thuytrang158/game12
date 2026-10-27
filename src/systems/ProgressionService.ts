import { InventoryManager } from './InventoryManager';
import { QuestManager } from './QuestManager';
import { SaveManager } from './SaveManager';
import { hasAllJourneyMemories } from './RegionRegistry';

/** Quest-layer validation and idempotent chapter rewards; activity panels only report outcomes. */
export class ProgressionService {
  public static completeObjective(questId: string, objectiveId: string, regionId: string): boolean {
    const completed = QuestManager.getInstance().completeObjective(questId, objectiveId);
    this.saveRuntime(regionId);
    this.awardCompletedChapter(questId, regionId);
    return completed;
  }

  public static awardCompletedChapter(questId: string, regionId: string): boolean {
    const quest = QuestManager.getInstance().getQuest(questId);
    if (!quest || quest.status !== 'completed') return false;
    const save = SaveManager.getInstance().load();
    save.collectedFragmentIds ||= [];
    save.passportStamps ||= {};
    save.unlockedRegionIds ||= ['tan_cuong'];
    save.achievements ||= {};
    if (quest.rewards.fragmentId && !save.collectedFragmentIds.includes(quest.rewards.fragmentId)) {
      if (!InventoryManager.getInstance().hasItem(quest.rewards.fragmentId)) InventoryManager.getInstance().addItem(quest.rewards.fragmentId, 1);
      save.collectedFragmentIds.push(quest.rewards.fragmentId);
    }
    for (const itemId of quest.rewards.items || []) {
      if (itemId.startsWith('fragment_') && !save.collectedFragmentIds.includes(itemId)) {
        if (!InventoryManager.getInstance().hasItem(itemId)) InventoryManager.getInstance().addItem(itemId, 1);
        save.collectedFragmentIds.push(itemId);
      } else if (!InventoryManager.getInstance().hasItem(itemId)) {
        InventoryManager.getInstance().addItem(itemId, 1);
      }
    }
    if (quest.rewards.achievementId) save.achievements[quest.rewards.achievementId] = true;
    save.passportStamps[regionId] = true;
    if (save.collectedFragmentIds.includes('fragment_tea_culture')) {
      save.unlockedRegionIds = [...new Set([...save.unlockedRegionIds, 'tan_cuong', 'ho_nui_coc', 'atk_dinh_hoa', 'hang_phuong_hoang', 'suoi_cua_tu', 'thai_hai', 'den_duom', 'bao_tang_van_hoa'])];
    }
    this.saveRuntime(regionId, save);
    const updated = SaveManager.getInstance().load();
    if (hasAllJourneyMemories(updated) && !updated.journeyEndingPresented) {
      updated.journeyEndingPresented = true;
      SaveManager.getInstance().save(updated);
      window.dispatchEvent(new CustomEvent('thai-nguyen-journey-ending'));
    }
    return true;
  }

  public static saveRuntime(regionId: string, current = SaveManager.getInstance().load()) {
    current.currentRegion = regionId;
    current.quests = QuestManager.getInstance().getAllQuests();
    current.completedQuestIds = QuestManager.getInstance().getCompletedQuestIds();
    current.activeQuestId = QuestManager.getInstance().getActiveQuest()?.id || null;
    current.inventory = InventoryManager.getInstance().getItems();
    SaveManager.getInstance().save(current);
  }
}
