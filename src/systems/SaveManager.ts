import { IGameSaveData, IItem, IQuest } from '../types/game';
import { INITIAL_ITEMS } from '../data/items';
import { INITIAL_QUESTS } from '../data/quests';
import { ACHIEVEMENTS } from '../data/achievements';

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
      unlockedRegionIds: ['tan_cuong'],
      achievements: defaultAchievements,
      teaHarvestHighScore: 0,
      coins: 120,
      passportStamps: {},
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
