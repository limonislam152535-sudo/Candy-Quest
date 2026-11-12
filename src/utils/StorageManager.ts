import { BoosterInventory, INITIAL_BOOSTERS } from '../game/BoosterManager.js';

export interface GameSaveData {
  highestLevelUnlocked: number;
  currentLevel: number;
  totalScore: number;
  levelStars: Record<number, number>; // levelNumber -> stars (1..3)
  levelHighScores: Record<number, number>; // levelNumber -> score
  boosters: BoosterInventory;
  soundEnabled: boolean;
  musicEnabled: boolean;
  consentGiven: boolean | null; // null = pending choice
  lastPlayedAt: number;
}

const STORAGE_KEY = 'candy_quest_save_v1';

export const DEFAULT_SAVE_DATA: GameSaveData = {
  highestLevelUnlocked: 1,
  currentLevel: 1,
  totalScore: 0,
  levelStars: {},
  levelHighScores: {},
  boosters: INITIAL_BOOSTERS,
  soundEnabled: true,
  musicEnabled: true,
  consentGiven: null,
  lastPlayedAt: Date.now()
};

export class StorageManager {
  private static cache: GameSaveData | null = null;

  static load(): GameSaveData {
    if (this.cache) return this.cache;

    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { ...DEFAULT_SAVE_DATA };
      }

      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.cache = { ...DEFAULT_SAVE_DATA };
        return this.cache;
      }

      const parsed = JSON.parse(raw);
      // Validate schema and merge with defaults to handle any missing fields
      this.cache = {
        highestLevelUnlocked: typeof parsed.highestLevelUnlocked === 'number' && parsed.highestLevelUnlocked >= 1 ? parsed.highestLevelUnlocked : 1,
        currentLevel: typeof parsed.currentLevel === 'number' && parsed.currentLevel >= 1 ? parsed.currentLevel : 1,
        totalScore: typeof parsed.totalScore === 'number' ? parsed.totalScore : 0,
        levelStars: typeof parsed.levelStars === 'object' && parsed.levelStars !== null ? parsed.levelStars : {},
        levelHighScores: typeof parsed.levelHighScores === 'object' && parsed.levelHighScores !== null ? parsed.levelHighScores : {},
        boosters: {
          hammer: typeof parsed.boosters?.hammer === 'number' ? parsed.boosters.hammer : INITIAL_BOOSTERS.hammer,
          extra_moves: typeof parsed.boosters?.extra_moves === 'number' ? parsed.boosters.extra_moves : INITIAL_BOOSTERS.extra_moves,
          color_bomb: typeof parsed.boosters?.color_bomb === 'number' ? parsed.boosters.color_bomb : INITIAL_BOOSTERS.color_bomb,
          shuffle: typeof parsed.boosters?.shuffle === 'number' ? parsed.boosters.shuffle : INITIAL_BOOSTERS.shuffle
        },
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
        consentGiven: typeof parsed.consentGiven === 'boolean' ? parsed.consentGiven : null,
        lastPlayedAt: typeof parsed.lastPlayedAt === 'number' ? parsed.lastPlayedAt : Date.now()
      };

      return this.cache;
    } catch {
      // Graceful fallback on corrupted or blocked LocalStorage
      this.cache = { ...DEFAULT_SAVE_DATA };
      return this.cache;
    }
  }

  static save(data: Partial<GameSaveData>): GameSaveData {
    const current = this.load();
    const updated: GameSaveData = {
      ...current,
      ...data,
      lastPlayedAt: Date.now()
    };
    this.cache = updated;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      // Storage quota exceeded or disabled in private window
    }

    return updated;
  }

  static recordLevelResult(levelNumber: number, score: number, stars: number): GameSaveData {
    const data = this.load();
    const prevStars = data.levelStars[levelNumber] || 0;
    const prevScore = data.levelHighScores[levelNumber] || 0;

    data.levelStars[levelNumber] = Math.max(prevStars, stars);
    data.levelHighScores[levelNumber] = Math.max(prevScore, score);

    if (stars > 0 && levelNumber >= data.highestLevelUnlocked) {
      data.highestLevelUnlocked = levelNumber + 1;
    }

    data.totalScore += score;
    return this.save(data);
  }

  static resetProgress(): GameSaveData {
    this.cache = { ...DEFAULT_SAVE_DATA };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    return this.cache;
  }
}
