import { AdConfig } from './AdConfig.js';
import { AdEventEmitter, AD_EVENTS } from './AdEvents.js';

export class SmartLinkManager {
  static openSmartLink(): boolean {
    if (!AdConfig.smartlink.enabled) {
      return false;
    }

    try {
      AdEventEmitter.emit(AD_EVENTS.AD_REQUESTED, { format: 'smartlink' });
      const win = window.open(AdConfig.smartlink.url, '_blank', 'noopener,noreferrer');
      if (win) {
        AdEventEmitter.emit(AD_EVENTS.AD_SHOWN, { format: 'smartlink' });
        return true;
      } else {
        AdEventEmitter.emit(AD_EVENTS.AD_BLOCKED, { format: 'smartlink' });
        return false;
      }
    } catch (e) {
      AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'smartlink', error: e });
      return false;
    }
  }

  static getUrl(): string {
    return AdConfig.smartlink.url;
  }

  static isEnabled(): boolean {
    return AdConfig.smartlink.enabled;
  }
}
