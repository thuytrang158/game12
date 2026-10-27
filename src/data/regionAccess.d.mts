export const REGION_SCENE_KEYS: Readonly<Record<string, string>>;
export const REGION_IDS: readonly string[];
export const SUGGESTED_ROUTE: readonly string[];
export const MEMORY_FRAGMENT_IDS: readonly string[];
export function isRegionUnlockedFromSave(regionId: string, save?: { inventory?: Array<{ id: string; quantity?: number }>; collectedFragmentIds?: string[]; unlockedRegionIds?: string[] }): boolean;
export function hasAllJourneyMemoriesFromSave(save?: { inventory?: Array<{ id: string }>; collectedFragmentIds?: string[] }): boolean;
