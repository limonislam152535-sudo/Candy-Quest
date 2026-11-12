export type BoosterType = 'hammer' | 'extra_moves' | 'color_bomb' | 'shuffle';

export interface BoosterInventory {
  hammer: number;
  extra_moves: number;
  color_bomb: number;
  shuffle: number;
}

export const INITIAL_BOOSTERS: BoosterInventory = {
  hammer: 3,
  extra_moves: 3,
  color_bomb: 2,
  shuffle: 3
};

export class BoosterManager {
  private inventory: BoosterInventory;

  constructor(savedInventory?: Partial<BoosterInventory>) {
    this.inventory = {
      hammer: savedInventory?.hammer ?? INITIAL_BOOSTERS.hammer,
      extra_moves: savedInventory?.extra_moves ?? INITIAL_BOOSTERS.extra_moves,
      color_bomb: savedInventory?.color_bomb ?? INITIAL_BOOSTERS.color_bomb,
      shuffle: savedInventory?.shuffle ?? INITIAL_BOOSTERS.shuffle
    };
  }

  getCount(type: BoosterType): number {
    return this.inventory[type] || 0;
  }

  canUse(type: BoosterType): boolean {
    return this.getCount(type) > 0;
  }

  useBooster(type: BoosterType): boolean {
    if (this.canUse(type)) {
      this.inventory[type]--;
      return true;
    }
    return false;
  }

  addBooster(type: BoosterType, count = 1): void {
    this.inventory[type] = (this.inventory[type] || 0) + count;
  }

  getInventory(): BoosterInventory {
    return { ...this.inventory };
  }

  /**
   * Reward player after completing levels (e.g., every 3 levels grants a booster)
   */
  rewardForLevelCompletion(levelCompleted: number): BoosterType | null {
    if (levelCompleted % 5 === 0) {
      this.addBooster('color_bomb', 1);
      return 'color_bomb';
    } else if (levelCompleted % 3 === 0) {
      this.addBooster('hammer', 1);
      return 'hammer';
    } else if (levelCompleted % 2 === 0) {
      this.addBooster('shuffle', 1);
      return 'shuffle';
    }
    return null;
  }
}
