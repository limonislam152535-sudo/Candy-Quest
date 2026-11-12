import { AdConfig } from './AdConfig.js';

export class AdFrequencyController {
  private lastAdTimestamp = 0;
  private lastAdLevel = 0;

  constructor(
    private readonly initialLevelsWithoutAds = AdConfig.frequency.initialLevelsWithoutAds,
    private readonly minSecondsBetween = AdConfig.frequency.minimumSecondsBetweenFullScreenAds,
    private readonly minLevelsBetween = AdConfig.frequency.minimumCompletedLevelsBetweenFullScreenAds
  ) {}

  canShowFullScreenAd(completedLevelsCount: number, now = Date.now()): { allowed: boolean; reason?: string } {
    if (completedLevelsCount < this.initialLevelsWithoutAds) {
      return {
        allowed: false,
        reason: `Initial ${this.initialLevelsWithoutAds} levels are ad-free for player onboarding (current: ${completedLevelsCount})`
      };
    }

    const elapsedSeconds = (now - this.lastAdTimestamp) / 1000;
    if (this.lastAdTimestamp > 0 && elapsedSeconds < this.minSecondsBetween) {
      return {
        allowed: false,
        reason: `Ad cooldown active (${Math.round(this.minSecondsBetween - elapsedSeconds)}s remaining)`
      };
    }

    const levelsSinceLastAd = completedLevelsCount - this.lastAdLevel;
    if (this.lastAdLevel > 0 && levelsSinceLastAd < this.minLevelsBetween) {
      return {
        allowed: false,
        reason: `Only ${levelsSinceLastAd} levels played since last ad (minimum ${this.minLevelsBetween})`
      };
    }

    return { allowed: true };
  }

  recordAdShown(completedLevelsCount: number, now = Date.now()): void {
    this.lastAdTimestamp = now;
    this.lastAdLevel = completedLevelsCount;
  }

  reset(): void {
    this.lastAdTimestamp = 0;
    this.lastAdLevel = 0;
  }
}
