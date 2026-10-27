import { IGameSaveData, IItem, IQuest } from '../types/game';
import { INITIAL_ITEMS } from '../data/items';
import { INITIAL_QUESTS } from '../data/quests';
import { ACHIEVEMENTS } from '../data/achievements';
import { REGION_IDS } from '../data/regionAccess.mjs';

const SAVE_KEY = 'thai_nguyen_quest_save_v1';

export class SaveManager {
  private static instance: SaveManager;

  public static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  /**
   * Generates default new game save state
   */
  public getDefaultSaveData(playerName: string = 'Nhà Khám Phá'): IGameSaveData {
    const defaultQuests: Record<string, IQuest> = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    
    // Initial inventory starts with Travel Journal, Tea Basket, and Xu Xu Tra currency
    const defaultInventory: IItem[] = [
      JSON.parse(JSON.stringify(INITIAL_ITEMS.travel_journal)),
      JSON.parse(JSON.stringify(INITIAL_ITEMS.tea_basket)),
      JSON.parse(JSON.stringify(INITIAL_ITEMS.coin_xu_tra))
    ];

    const defaultAchievements: Record<string, boolean> = {};
    Object.keys(ACHIEVEMENTS).forEach((id) => {
      defaultAchievements[id] = ACHIEVEMENTS[id].unlocked;
    });

    return {
      version: 1,
      playerName,
      currentRegion: 'tan_cuong',
      playerCoords: { x: 260, y: 340, dir: 'down' },
      inventory: defaultInventory,
      quests: defaultQuests,
      activeQuestId: 'quest_tan_cuong',
      completedQuestIds: [],
      collectedFragmentIds: [],
      unlockedRegionIds: [...REGION_IDS],
      achievements: defaultAchievements,
      teaHarvestHighScore: 0,
      coins: 120,
      passportStamps: {},
      regionProgress: {},
      journeyEndingPresented: false,
      timestamp: Date.now()
    };
  }

  /**
   * Loads saved game or creates default
   */
  public load(): IGameSaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return this.getDefaultSaveData();
      }
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 1) {
        return this.getDefaultSaveData();
      }
      // Safe migrations for newly added fields
      if (parsed.coins === undefined) parsed.coins = 120;
      if (!parsed.passportStamps) parsed.passportStamps = {};
      if (!parsed.regionProgress || typeof parsed.regionProgress !== 'object') parsed.regionProgress = {};
      if (typeof parsed.journeyEndingPresented !== 'boolean') parsed.journeyEndingPresented = false;
      if (!Array.isArray(parsed.inventory)) parsed.inventory = [];
      if (!Array.isArray(parsed.collectedFragmentIds)) parsed.collectedFragmentIds = [];
      if (!Array.isArray(parsed.unlockedRegionIds)) parsed.unlockedRegionIds = ['tan_cuong'];
      const unlockedBeforeMigration = parsed.unlockedRegionIds.length;
      parsed.unlockedRegionIds = [...new Set([...parsed.unlockedRegionIds, ...REGION_IDS])];
      const needsUnlockMigration = parsed.unlockedRegionIds.length !== unlockedBeforeMigration;
      if (!Array.isArray(parsed.completedQuestIds)) parsed.completedQuestIds = [];
      if (!Array.isArray(parsed.teaBrewingHistory)) parsed.teaBrewingHistory = [];
      if (!Array.isArray(parsed.favoriteTeaRecipes)) parsed.favoriteTeaRecipes = [];
      if (parsed.teaBrewingSession && typeof parsed.teaBrewingSession !== 'object') delete parsed.teaBrewingSession;
      parsed.quests ||= {};
      // Merge new stable objectives into v1 saves without discarding completed progress.
      for (const [questId, quest] of Object.entries(INITIAL_QUESTS)) {
        const existing = parsed.quests[questId] as IQuest | undefined;
        if (!existing) {
          parsed.quests[questId] = JSON.parse(JSON.stringify(quest));
          continue;
        }
        const merged: IQuest = { ...quest, ...existing, objectives: [] };
        const oldById = new Map((existing.objectives || []).map(objective => [objective.id, objective]));
        merged.objectives = quest.objectives.map(objective => {
          const old = oldById.get(objective.id);
          return old ? { ...objective, ...old } : { ...objective };
        });
        for (const old of existing.objectives || []) {
          if (!quest.objectives.some(objective => objective.id === old.id)) merged.objectives.push(old);
        }
        if (existing.status === 'completed' || parsed.completedQuestIds.includes(questId)) {
          merged.status = 'completed';
          merged.objectives = merged.objectives.map(objective => ({ ...objective, completed: true }));
          if (!parsed.completedQuestIds.includes(questId)) parsed.completedQuestIds.push(questId);
        }
        parsed.quests[questId] = merged;
      }
      parsed.achievements ||= {};
      for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
        if (parsed.achievements[achievementId] === undefined) {
          parsed.achievements[achievementId] = achievement.unlocked;
        }
      }
      if (needsUnlockMigration) this.save(parsed);
      return parsed;
    } catch (e) {
      console.warn('Failed to load save data, resetting to default', e);
      return this.getDefaultSaveData();
    }
  }

  /**
   * Saves current state to LocalStorage
   */
  public save(data: IGameSaveData): boolean {
    try {
      data.timestamp = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save game state', e);
      return false;
    }
  }

  /**
   * Clears saved state (Restart journey)
   */
  public clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  /**
   * Checks if an active save file exists
   */
  public hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }
}
