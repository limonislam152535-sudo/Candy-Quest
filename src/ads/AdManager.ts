import { AdConfig } from './AdConfig.js';
import { AdEventEmitter, AD_EVENTS } from './AdEvents.js';
import { AdFrequencyController } from './AdFrequencyController.js';
import { AdState } from './AdPlatform.js';
import { AdsterraWebAdapter } from './AdsterraWebAdapter.js';
import { StorageManager } from '../utils/StorageManager.js';

export class AdManager {
  private static frequencyController = new AdFrequencyController();
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Check consent before loading non-essential advertising scripts
    const saveData = StorageManager.load();
    if (saveData.consentGiven === true) {
      AdsterraWebAdapter.initialize();
    }
  }

  static getFrequencyController(): AdFrequencyController {
    return this.frequencyController;
  }

  static isSmartLinkEnabled(): boolean {
    return AdConfig.smartlink.enabled;
  }

  static isBannerEnabledForPlacement(placement: 'home' | 'level-selection'): boolean {
    const saveData = StorageManager.load();
    // Do not load banner if user explicitly declined consent
    if (saveData.consentGiven === false) return false;
    return AdConfig.banner.enabled && AdConfig.banner.placements.includes(placement);
  }

  static openSponsoredOffer(): boolean {
    return AdsterraWebAdapter.openSmartLink();
  }

  static renderBanner(container: HTMLElement, placement: 'home' | 'level-selection'): () => void {
    if (!this.isBannerEnabledForPlacement(placement)) {
      return () => {};
    }
    return AdsterraWebAdapter.renderBannerIntoElement(container);
  }

  static getBannerState(): AdState {
    return AdsterraWebAdapter.getBannerState();
  }

  static onAdEvent(event: string, callback: (data?: any) => void): () => void {
    return AdEventEmitter.on(event, callback);
  }
}
