import test from 'node:test';
import assert from 'node:assert/strict';
import {
  REGION_IDS,
  REGION_SCENE_KEYS,
  SUGGESTED_ROUTE,
  isRegionUnlockedFromSave,
  hasAllJourneyMemoriesFromSave
} from '../src/data/regionAccess.mjs';

test('registry contains eight stable regions and the requested optional route', () => {
  assert.deepEqual(REGION_IDS, [
    'tan_cuong', 'ho_nui_coc', 'atk_dinh_hoa', 'hang_phuong_hoang',
    'suoi_cua_tu', 'thai_hai', 'den_duom', 'bao_tang_van_hoa'
  ]);
  assert.deepEqual(SUGGESTED_ROUTE, REGION_IDS.slice(0, 7));
  assert.equal(REGION_SCENE_KEYS.bao_tang_van_hoa, 'BaoTangVanHoaScene');
});

test('all other regions share the tea-memory unlock gate, including the museum', () => {
  const lockedSave = { collectedFragmentIds: [], inventory: [] };
  assert.equal(isRegionUnlockedFromSave('tan_cuong', lockedSave), true);
  for (const regionId of REGION_IDS.slice(1)) assert.equal(isRegionUnlockedFromSave(regionId, lockedSave), false);
  const collected = { ...lockedSave, collectedFragmentIds: ['fragment_tea_culture'] };
  for (const regionId of REGION_IDS.slice(1)) assert.equal(isRegionUnlockedFromSave(regionId, collected), true);
  const inInventory = { ...lockedSave, inventory: [{ id: 'fragment_tea_culture', quantity: 1 }] };
  assert.equal(isRegionUnlockedFromSave('bao_tang_van_hoa', inInventory), true);
  assert.equal(isRegionUnlockedFromSave('not_a_region', collected), false);
});

test('the journey ending requires all seven distinct memory fragments', () => {
  const ids = [
    'fragment_tea_culture', 'fragment_legend', 'fragment_history', 'fragment_nature',
    'fragment_exploration', 'fragment_people', 'fragment_tradition'
  ];
  assert.equal(hasAllJourneyMemoriesFromSave({ collectedFragmentIds: ids.slice(0, 6) }), false);
  assert.equal(hasAllJourneyMemoriesFromSave({ collectedFragmentIds: ids }), true);
  assert.equal(hasAllJourneyMemoriesFromSave({ inventory: ids.map(id => ({ id })) }), true);
});
