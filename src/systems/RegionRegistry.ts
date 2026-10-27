import { IGameSaveData } from '../types/game';
import { Direction } from '../types/game';
import { InventoryManager } from './InventoryManager';
import { QuestManager } from './QuestManager';
import { SaveManager } from './SaveManager';
import { REGION_SCENE_KEYS, REGION_IDS, SUGGESTED_ROUTE, MEMORY_FRAGMENT_IDS, isRegionUnlockedFromSave, hasAllJourneyMemoriesFromSave } from '../data/regionAccess.mjs';

/** Single source of truth for region identity, scene routing, and the suggested journey. */
export { REGION_SCENE_KEYS, REGION_IDS, SUGGESTED_ROUTE, MEMORY_FRAGMENT_IDS };

export function isRegionUnlocked(regionId: string, save: Partial<IGameSaveData>): boolean {
  return isRegionUnlockedFromSave(regionId, save);
}

export function getSceneKey(regionId: string): string | undefined {
  return REGION_SCENE_KEYS[regionId];
}

export function hasAllJourneyMemories(save: Partial<IGameSaveData>): boolean {
  return hasAllJourneyMemoriesFromSave(save);
}

export function initializeRegionSystems(regionId: string) {
  const save = SaveManager.getInstance().load();
  QuestManager.getInstance().init(save.quests, save.activeQuestId, save.completedQuestIds);
  InventoryManager.getInstance().init(save.inventory);
  const questId = Object.values(save.quests).find(quest => quest.regionId === regionId && quest.status !== 'completed')?.id;
  if (questId) QuestManager.getInstance().startQuest(questId, true);
  else QuestManager.getInstance().setActiveQuest(null);
  return save;
}

export function persistRegionCheckpoint(regionId: string, position: { x: number; y: number; dir: Direction }, checkpoint?: string) {
  const save = SaveManager.getInstance().load();
  save.currentRegion = regionId;
  save.playerCoords = position;
  save.regionProgress ||= {};
  const progress = save.regionProgress[regionId] || { visitedStops: [], completedActivities: [] };
  progress.player = position;
  if (checkpoint) progress.checkpoint = checkpoint;
  save.regionProgress[regionId] = progress;
  save.quests = QuestManager.getInstance().getAllQuests();
  save.activeQuestId = QuestManager.getInstance().getActiveQuest()?.id || null;
  save.completedQuestIds = QuestManager.getInstance().getCompletedQuestIds();
  save.inventory = InventoryManager.getInstance().getItems();
  SaveManager.getInstance().save(save);
}

export function transitionToRegion(scene: Phaser.Scene, fromRegion: string, regionId: string, position: { x: number; y: number; dir: Direction }) {
  let save = SaveManager.getInstance().load();
  const targetScene = getSceneKey(regionId);
  if (!targetScene || !isRegionUnlocked(regionId, save)) {
    return false;
  }
  persistRegionCheckpoint(fromRegion, position);
  save = SaveManager.getInstance().load();
  save.currentRegion = regionId;
  SaveManager.getInstance().save(save);
  let started = false;
  const launch = () => {
    if (started) return;
    started = true;
    scene.scene.start(targetScene, { regionId });
  };
  scene.cameras.main.fadeOut(350, 0, 0, 0);
  scene.cameras.main.once('camerafadeoutcomplete', launch);
  scene.time.delayedCall(400, launch);
  return true;
}
import Phaser from 'phaser';
