import { AdConfig } from './AdConfig.js';
import { AdEventEmitter, AD_EVENTS } from './AdEvents.js';
import { AdState } from './AdPlatform.js';

export class PopunderAdapter {
  private static injected = false;
  private static state: AdState = 'DISABLED';

  static getState(): AdState {
    if (!AdConfig.popunder.enabled) {
      return 'DISABLED';
    }
    return this.state;
  }

  static initialize(): void {
    if (!AdConfig.popunder.enabled) {
      this.state = 'DISABLED';
      return;
    }

    if (this.injected) {
      return;
    }

    try {
      this.state = 'LOADING';
      AdEventEmitter.emit(AD_EVENTS.AD_REQUESTED, { format: 'popunder' });

      const script = document.createElement('script');
      script.setAttribute('data-cfasync', 'false');
      script.src = AdConfig.popunder.scriptUrl;
      script.async = true;

      script.onload = () => {
        this.injected = true;
        this.state = 'READY';
        AdEventEmitter.emit(AD_EVENTS.AD_LOADED, { format: 'popunder' });
      };

      script.onerror = (err) => {
        this.state = 'FAILED';
        AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'popunder', error: err });
      };

      document.body.appendChild(script);
    } catch (e) {
      this.state = 'FAILED';
      AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'popunder', error: e });
    }
  }

  static destroy(): void {
    // Adapter cleanup
  }
}
