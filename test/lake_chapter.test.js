import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from '../node_modules/typescript/lib/typescript.js';

const source = await readFile(new URL('../src/data/lake.ts', import.meta.url), 'utf8');
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const lake = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`);

test('lake map defines twelve stable, visitable stops with journal activities', () => {
  assert.equal(lake.LAKE_STOPS.length, 12);
  assert.equal(new Set(lake.LAKE_STOPS.map(stop => stop.id)).size, 12);
  for (const stop of lake.LAKE_STOPS) {
    assert.ok(stop.name.length > 0);
    assert.ok(stop.activityId);
    assert.equal(lake.isLakeLand(stop.x, stop.y), true, `${stop.id} should have a walkable arrival point`);
  }
});

test('boat docks separate walkable landing points from open-water positions', () => {
  for (const dock of lake.LAKE_DOCKS) {
    assert.equal(lake.isLakeLand(dock.foot.x, dock.foot.y), true, `${dock.id} landing should be walkable`);
    assert.equal(lake.isLakeLand(dock.water.x, dock.water.y), false, `${dock.id} boat position should be water`);
  }
  for (const point of [{ x: 1100, y: 900 }, { x: 1300, y: 850 }, { x: 1650, y: 850 }]) {
    assert.equal(lake.isLakeLand(point.x, point.y), false, 'assisted travel waypoint should remain in open water');
  }
});

test('optional stops do not gate the main ending and story ordering is validated', () => {
  const required = [...lake.MAIN_ACTIVITIES.slice(0, -1)];
  assert.equal(lake.hasLakeFinaleRequirements(required), true);
  assert.equal(lake.hasLakeFinaleRequirements([...required, 'fountain', 'exhibition']), true);
  assert.equal(lake.hasLakeFinaleRequirements(required.filter(id => id !== 'ecology')), false);
  assert.equal(lake.isExactOrder(['meeting', 'separation', 'river'], ['meeting', 'separation', 'river']), true);
  assert.equal(lake.isExactOrder(['river', 'meeting', 'separation'], ['meeting', 'separation', 'river']), false);
});
