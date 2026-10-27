export const REGION_SCENE_KEYS = Object.freeze({
  tan_cuong: 'TanCuongScene',
  ho_nui_coc: 'HoNuiCocScene',
  atk_dinh_hoa: 'AtkDinhHoaScene',
  hang_phuong_hoang: 'HangPhuongHoangScene',
  suoi_cua_tu: 'SuoiCuaTuScene',
  thai_hai: 'ThaiHaiScene',
  den_duom: 'DenDuomScene',
  bao_tang_van_hoa: 'BaoTangVanHoaScene'
});

export const REGION_IDS = Object.freeze(Object.keys(REGION_SCENE_KEYS));
export const SUGGESTED_ROUTE = Object.freeze([
  'tan_cuong', 'ho_nui_coc', 'atk_dinh_hoa', 'hang_phuong_hoang',
  'suoi_cua_tu', 'thai_hai', 'den_duom'
]);
export const MEMORY_FRAGMENT_IDS = Object.freeze([
  'fragment_tea_culture', 'fragment_legend', 'fragment_history',
  'fragment_nature', 'fragment_exploration', 'fragment_people', 'fragment_tradition'
]);

export function isRegionUnlockedFromSave(regionId, save = {}) {
  if (regionId === 'tan_cuong') return true;
  if (!Object.hasOwn(REGION_SCENE_KEYS, regionId)) return false;
  if ((save.unlockedRegionIds || []).includes(regionId)) return true;
  const teaMemoryInInventory = (save.inventory || []).some(item => item.id === 'fragment_tea_culture' && (item.quantity === undefined || item.quantity > 0));
  return (save.collectedFragmentIds || []).includes('fragment_tea_culture') || teaMemoryInInventory;
}

export function hasAllJourneyMemoriesFromSave(save = {}) {
  const collected = new Set([...(save.collectedFragmentIds || []), ...(save.inventory || []).map(item => item.id)]);
  return MEMORY_FRAGMENT_IDS.every(id => collected.has(id));
}
