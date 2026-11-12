import { AdConfig } from './AdConfig.js';
import { AdEventEmitter, AD_EVENTS } from './AdEvents.js';
import { AdState } from './AdPlatform.js';
import { SmartLinkManager } from './SmartLinkManager.js';
import { SocialBarAdapter } from './SocialBarAdapter.js';
import { PopunderAdapter } from './PopunderAdapter.js';

export class AdsterraWebAdapter {
  private static bannerState: AdState = 'NOT_READY';

  static getBannerState(): AdState {
    if (!AdConfig.banner.enabled) return 'DISABLED';
    return this.bannerState;
  }

  static getSocialBarState(): AdState {
    return SocialBarAdapter.getState();
  }

  static getPopunderState(): AdState {
    return PopunderAdapter.getState();
  }

  static openSmartLink(): boolean {
    return SmartLinkManager.openSmartLink();
  }

  static initialize(): void {
    if (AdConfig.socialBar.enabled) {
      SocialBarAdapter.initialize();
    }
    if (AdConfig.popunder.enabled) {
      PopunderAdapter.initialize();
    }
  }

  /**
   * Sets up an Adsterra Banner inside a dedicated, isolated HTML container
   * using an iframe with exact publisher key and parameters.
   */
  static renderBannerIntoElement(container: HTMLElement): () => void {
    if (!AdConfig.banner.enabled) {
      this.bannerState = 'DISABLED';
      return () => {};
    }

    try {
      this.bannerState = 'LOADING';
      AdEventEmitter.emit(AD_EVENTS.AD_REQUESTED, { format: 'banner' });

      // Clean container
      container.innerHTML = '';

      // Create sandboxed / clean iframe for the 468x60 Adsterra banner
      const iframe = document.createElement('iframe');
      iframe.width = String(AdConfig.banner.width);
      iframe.height = String(AdConfig.banner.height);
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.scrolling = 'no';
      iframe.title = 'Sponsored Advertisement';

      container.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
              </style>
            </head>
            <body>
              <script type="text/javascript">
                atOptions = {
                  'key' : '${AdConfig.banner.key}',
                  'format' : 'iframe',
                  'height' : ${AdConfig.banner.height},
                  'width' : ${AdConfig.banner.width},
                  'params' : {}
                };
              </script>
              <script type="text/javascript" src="${AdConfig.banner.scriptUrl}"></script>
            </body>
          </html>
        `);
        doc.close();

        this.bannerState = 'READY';
        AdEventEmitter.emit(AD_EVENTS.AD_LOADED, { format: 'banner' });
      }

      return () => {
        try {
          container.innerHTML = '';
          this.bannerState = 'CLOSED';
        } catch {
          // ignore
        }
      };
    } catch (err) {
      this.bannerState = 'FAILED';
      AdEventEmitter.emit(AD_EVENTS.AD_FAILED, { format: 'banner', error: err });
      return () => {};
    }
  }
}
