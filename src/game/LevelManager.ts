import { CANDY_COLORS, CandyColor } from './Candy.js';

export type LevelObjectiveType = 'score' | 'collect_colors' | 'clear_total';

export interface LevelObjective {
  type: LevelObjectiveType;
  targetScore: number;
  totalCandiesToClear?: number;
  targetColors?: { color: CandyColor; count: number; current: number }[];
  description: string;
}

export interface LevelConfig {
  levelNumber: number;
  moves: number;
  targetScore: number;
  objective: LevelObjective;
  availableColors: CandyColor[];
  starThresholds: [number, number, number]; // 1 star, 2 stars, 3 stars
}

export class LevelManager {
  /**
   * Procedurally generates balanced, solvable level configurations for any level number 1..Infinity.
   */
  static getLevel(levelNumber: number): LevelConfig {
    const num = Math.max(1, Math.floor(levelNumber));

    // Base moves start around 25-30, gradually tapering to 18-24 for higher levels
    const baseMoves = Math.max(18, 30 - Math.floor(num / 10));

    // Colors available: levels 1-3 use 4 colors, levels 4-8 use 5 colors, 9+ use 6 colors
    let colorCount = 4;
    if (num >= 4) colorCount = 5;
    if (num >= 9) colorCount = 6;
    const availableColors = CANDY_COLORS.slice(0, colorCount);

    // Target score scales progressively
    const baseTargetScore = 1500 + (num - 1) * 650;
    const star1 = baseTargetScore;
    const star2 = Math.round(baseTargetScore * 1.5);
    const star3 = Math.round(baseTargetScore * 2.2);

    // Objective types cycle pleasantly:
    // Level 1: Score objective
    // Level 2: Collect 1 color
    // Level 3: Collect 2 colors
    // Level 4: Clear total candies
    // Level 5+: Procedural combination
    let objective: LevelObjective;
    const cycle = num % 4;

    if (cycle === 1 && num === 1) {
      objective = {
        type: 'score',
        targetScore: star1,
        description: `Reach ${star1.toLocaleString()} Points`
      };
    } else if (cycle === 2 || (cycle === 0 && num > 4)) {
      // Collect 1 or 2 colors
      const color1 = availableColors[(num * 2) % availableColors.length];
      const targetCount1 = Math.min(35, 12 + Math.floor(num * 1.5));
      const targetColors = [{ color: color1, count: targetCount1, current: 0 }];

      if (num >= 5) {
        const color2 = availableColors[(num * 3 + 1) % availableColors.length];
        if (color2 !== color1) {
          const targetCount2 = Math.min(30, 10 + Math.floor(num * 1.2));
          targetColors.push({ color: color2, count: targetCount2, current: 0 });
        }
      }

      const colorNames = targetColors.map(tc => `${tc.count} ${tc.color}`).join(' & ');
      objective = {
        type: 'collect_colors',
        targetScore: star1,
        targetColors,
        description: `Collect ${colorNames} candies`
      };
    } else if (cycle === 3) {
      // Clear total candies
      const totalCandies = Math.min(120, 40 + num * 5);
      objective = {
        type: 'clear_total',
        targetScore: star1,
        totalCandiesToClear: totalCandies,
        description: `Match ${totalCandies} total candies`
      };
    } else {
      // High score challenge
      objective = {
        type: 'score',
        targetScore: star1,
        description: `Score ${star1.toLocaleString()} Points`
      };
    }

    return {
      levelNumber: num,
      moves: baseMoves,
      targetScore: star1,
      objective,
      availableColors,
      starThresholds: [star1, star2, star3]
    };
  }

  /**
   * Evaluates if the current level objective is fully achieved.
   */
  static isObjectiveComplete(objective: LevelObjective, currentScore: number, totalCleared = 0): boolean {
    if (objective.type === 'score') {
      return currentScore >= objective.targetScore;
    }
    if (objective.type === 'clear_total') {
      return totalCleared >= (objective.totalCandiesToClear || 0);
    }
    if (objective.type === 'collect_colors' && objective.targetColors) {
      return objective.targetColors.every(c => c.current >= c.count);
    }
    return currentScore >= objective.targetScore;
  }
}
