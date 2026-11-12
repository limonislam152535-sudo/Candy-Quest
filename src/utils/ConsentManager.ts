import { StorageManager } from './StorageManager.js';
import { AdsterraWebAdapter } from '../ads/AdsterraWebAdapter.js';

export type ConsentStatus = 'granted' | 'declined' | 'pending';

export class ConsentManager {
  static getStatus(): ConsentStatus {
    const data = StorageManager.load();
    if (data.consentGiven === true) return 'granted';
    if (data.consentGiven === false) return 'declined';
    return 'pending';
  }

  static setConsent(granted: boolean): void {
    StorageManager.save({ consentGiven: granted });
    if (granted) {
      AdsterraWebAdapter.initialize();
    }
  }

  static resetConsent(): void {
    StorageManager.save({ consentGiven: null });
  }

  static isConsentPending(): boolean {
    return this.getStatus() === 'pending';
  }
}
