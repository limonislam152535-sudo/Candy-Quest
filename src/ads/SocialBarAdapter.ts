import { AdConfig } from './AdConfig.js';
import { AdEventEmitter, AD_EVENTS } from './AdEvents.js';
import { AdState } from './AdPlatform.js';

export class SocialBarAdapter {
  private static injected = false;
  private static state: AdState = 'DISABLED';

  static getState(): AdState {
    if (!AdConfig.socialBar.enabled) {
      return 'DISABLED';
    }
    return this.state;
  }

  static initialize(): void {
    if (!AdConfig.socialBar.enabled) {
      this.state = 'DISABLED';
      return;
    }

    if (this.injected) {
      return;
    }

    try {
      this.state = 'LOADING';
      AdEventEmitter.emit(AD_EVENTS.AD_REQUESTED, { format: 'socialBar' });

      const script = document.createElement('script');
      script.setAttribute('data-cfasync', 'false');
      script.src = AdConfig.socialBar.scriptUrl;
      script.async = true;

      script.onload = () => {
        this.injected = true;
        this.state = 'READY';
        AdEventEmitter.emit(AD_EVENTS.AD_LOADED, { format: 'socialBar' });
      };

      script.onerror = (err) => {
        this.state = 'FAILED';
        AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'socialBar', error: err });
      };

      document.head.appendChild(script);
    } catch (e) {
      this.state = 'FAILED';
      AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'socialBar', error: e });
    }
  }

  static destroy(): void {
    // Adapter cleanup
  }
}
