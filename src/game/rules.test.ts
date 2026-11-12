import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchDetector, GridCell } from './MatchDetector.js';
import { ScoreManager } from './ScoreManager.js';
import { LevelManager } from './LevelManager.js';
import { BoosterManager } from './BoosterManager.js';
import { AdFrequencyController } from '../ads/AdFrequencyController.js';
import { SpecialCandyManager } from './SpecialCandyManager.js';

test('MatchDetector detects horizontal 3-in-a-row', () => {
  const grid: (GridCell | null)[][] = [
    [{ color: 'red' }, { color: 'red' }, { color: 'red' }, { color: 'blue' }],
    [{ color: 'yellow' }, { color: 'green' }, { color: 'purple' }, { color: 'orange' }]
  ];
  const matches = MatchDetector.findMatches(grid);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].matchedCells.length, 3);
  assert.deepEqual(matches[0].matchedCells, [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 }
  ]);
});

test('MatchDetector detects vertical 3-in-a-row', () => {
  const grid: (GridCell | null)[][] = [
    [{ color: 'blue' }, { color: 'red' }],
    [{ color: 'blue' }, { color: 'yellow' }],
    [{ color: 'blue' }, { color: 'green' }]
  ];
  const matches = MatchDetector.findMatches(grid);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].matchedCells.length, 3);
  assert.deepEqual(matches[0].matchedCells, [
    { row: 0, col: 0 },
    { row: 1, col: 0 },
    { row: 2, col: 0 }
  ]);
});

test('MatchDetector creates striped candy for 4-in-a-row', () => {
  const grid: (GridCell | null)[][] = [
    [{ color: 'yellow' }, { color: 'yellow' }, { color: 'yellow' }, { color: 'yellow' }]
  ];
  const matches = MatchDetector.findMatches(grid);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].matchedCells.length, 4);
  assert.equal(matches[0].specialCreated?.special, 'striped_v');
});

test('MatchDetector creates color bomb for 5-in-a-row', () => {
  const grid: (GridCell | null)[][] = [
    [{ color: 'green' }, { color: 'green' }, { color: 'green' }, { color: 'green' }, { color: 'green' }]
  ];
  const matches = MatchDetector.findMatches(grid);
  assert.equal(matches.length, 1);
  assert.equal(matches[0].matchedCells.length, 5);
  assert.equal(matches[0].specialCreated?.special, 'color_bomb');
});

test('MatchDetector detects valid and invalid swaps', () => {
  const grid: (GridCell | null)[][] = [
    [{ color: 'red' }, { color: 'blue' }, { color: 'red' }, { color: 'red' }],
    [{ color: 'yellow' }, { color: 'red' }, { color: 'green' }, { color: 'purple' }]
  ];
  // Swapping (0, 1) [blue] with (1, 1) [red] aligns red at (0, 0), (0, 1), (0, 2), (0, 3) -> valid!
  assert.equal(MatchDetector.isValidSwap(grid, 0, 1, 1, 1), true);
  // Swapping non-adjacent or non-matching cells -> invalid
  assert.equal(MatchDetector.isValidSwap(grid, 0, 0, 1, 3), false);
  assert.equal(MatchDetector.isValidSwap(grid, 1, 2, 1, 3), false);
});

test('SpecialCandyManager calculates striped and wrapped areas correctly', () => {
  const grid: (GridCell | null)[][] = Array(8).fill(null).map(() => Array(8).fill({ color: 'red' }));
  const stripedH = SpecialCandyManager.getSpecialExplosionCells('striped_h', 3, 2, null, grid);
  assert.equal(stripedH.length, 8); // Entire row of 8

  const wrapped = SpecialCandyManager.getSpecialExplosionCells('wrapped', 3, 3, null, grid);
  assert.equal(wrapped.length, 9); // 3x3 box
});

test('ScoreManager calculates score and star ratings correctly', () => {
  const scoreMgr = new ScoreManager(0);
  const pts = scoreMgr.addMatchScore(3);
  assert.equal(pts, 60);

  scoreMgr.incrementCombo();
  const comboPts = scoreMgr.addMatchScore(3);
  assert.equal(comboPts, 90); // 1.5x multiplier

  assert.equal(ScoreManager.calculateStars(500, 1000), 0);
  assert.equal(ScoreManager.calculateStars(1000, 1000), 1);
  assert.equal(ScoreManager.calculateStars(1500, 1000), 2);
  assert.equal(ScoreManager.calculateStars(2200, 1000), 3);
});

test('LevelManager generates procedurally solvable levels with progressive difficulty', () => {
  const lvl1 = LevelManager.getLevel(1);
  assert.equal(lvl1.levelNumber, 1);
  assert.equal(lvl1.availableColors.length, 4);

  const lvl10 = LevelManager.getLevel(10);
  assert.equal(lvl10.levelNumber, 10);
  assert.equal(lvl10.availableColors.length, 6);
  assert.ok(lvl10.targetScore > lvl1.targetScore);
});

test('BoosterManager manages inventory and usage limits', () => {
  const bm = new BoosterManager({ hammer: 2 });
  assert.equal(bm.canUse('hammer'), true);
  assert.equal(bm.useBooster('hammer'), true);
  assert.equal(bm.getCount('hammer'), 1);
  assert.equal(bm.useBooster('hammer'), true);
  assert.equal(bm.useBooster('hammer'), false); // out of stock
});

test('AdFrequencyController strictly enforces initial 6 levels ad-free and cooldown', () => {
  const ctrl = new AdFrequencyController(6, 180, 3);
  // Level 1-5 cannot show full-screen ad
  assert.equal(ctrl.canShowFullScreenAd(3).allowed, false);
  assert.equal(ctrl.canShowFullScreenAd(5).allowed, false);

  // Level 6 completed is eligible
  const check = ctrl.canShowFullScreenAd(6);
  assert.equal(check.allowed, true);

  // Once shown, cooldown activates
  const t0 = 1000000;
  ctrl.recordAdShown(6, t0);

  // 60 seconds later -> blocked by cooldown
  assert.equal(ctrl.canShowFullScreenAd(7, t0 + 60000).allowed, false);
  // 200 seconds later, but only 1 level completed -> blocked by level interval
  assert.equal(ctrl.canShowFullScreenAd(7, t0 + 200000).allowed, false);
  // 200 seconds later AND 3 levels completed (level 9) -> allowed!
  assert.equal(ctrl.canShowFullScreenAd(9, t0 + 200000).allowed, true);
});
