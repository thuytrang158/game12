/**
 * Types and interfaces for "Thái Nguyên Quest – Hành Trình Khám Phá Xứ Trà"
 */

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface IItem {
  id: string;
  name: string;
  description: string;
  category: 'fragment' | 'quest' | 'tea' | 'collectible' | 'tool';
  icon: string;
  quantity?: number;
  obtainedAt?: string;
  loreText?: string;
  realWorldFact?: string;
}

export interface IQuestObjective {
  id: string;
  text: string;
  completed: boolean;
  targetCount?: number;
  currentCount?: number;
}

export interface IQuest {
  id: string;
  title: string;
  regionId: string;
  giverNpcId: string;
  description: string;
  culturalNote?: string;
  objectives: IQuestObjective[];
  rewards: {
    items: string[];
    exp?: number;
    fragmentId?: string;
    achievementId?: string;
  };
  status: 'locked' | 'available' | 'active' | 'completed';
}

export interface IDialogueChoice {
  text: string;
  nextDialogueId?: string;
  action?: 'startQuest' | 'openMinigame' | 'openQuiz' | 'giveReward' | 'openDestCard' | 'close' | 'custom';
  customPayload?: any;
}

export interface IDialogueNode {
  id: string;
  speaker: string;
  speakerRole: string;
  speakerAvatar: string;
  text: string;
  choices?: IDialogueChoice[];
  nextId?: string;
  actionOnShow?: string;
}

export interface INPCConfig {
  id: string;
  name: string;
  role: string;
  avatar: string;
  x: number;
  y: number;
  textureKey: string;
  startDialogueId: string;
  activeQuestId?: string;
  idleDialogueId?: string;
  completedQuestDialogueId?: string;
}

export interface IDestination {
  id: string;
  name: string;
  vietnameseTitle: string;
  subtitle: string;
  category: 'Văn hóa trà' | 'Danh thắng hồ' | 'Di tích lịch sử' | 'Thiên nhiên hang động' | 'Khám phá sinh thái';
  coordinates: { x: number; y: number };
  status: 'locked' | 'unlocked' | 'completed';
  realWorldInfo: {
    address: string;
    bestTimeToVisit: string;
    highlights: string[];
    culturalFact: string;
    suggestedTours: ITourRecommendation[];
  };
  fragmentRewardId: string;
}

export interface ITourRecommendation {
  id: string;
  title: string;
  duration: string;
  highlight: string;
  rating: number;
  tag: string;
  websiteUrl: string;
}

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface IGameSaveData {
  version: number;
  playerName: string;
  currentRegion: string;
  playerCoords: { x: number; y: number; dir: Direction };
  inventory: IItem[];
  quests: Record<string, IQuest>;
  activeQuestId: string | null;
  completedQuestIds: string[];
  collectedFragmentIds: string[];
  unlockedRegionIds: string[];
  achievements: Record<string, boolean>;
  teaHarvestHighScore: number;
  coins?: number;
  passportStamps?: Record<string, boolean>;
  timestamp: number;
}
