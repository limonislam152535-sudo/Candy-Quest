export const AD_EVENTS = {
  AD_REQUESTED: 'ad_requested',
  AD_LOADED: 'ad_loaded',
  AD_SHOWN: 'ad_shown',
  AD_CLOSED: 'ad_closed',
  AD_FAILED: 'ad_failed',
  AD_BLOCKED: 'ad_blocked'
} as const;

export type AdEventName = typeof AD_EVENTS[keyof typeof AD_EVENTS];

type AdEventListener = (payload?: any) => void;

export class AdEventEmitter {
  private static listeners: Map<string, Set<AdEventListener>> = new Map();

  static on(event: string, listener: AdEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  static off(event: string, listener: AdEventListener): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
    }
  }

  static emit(event: string, payload?: any): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(l => {
        try {
          l(payload);
        } catch {
          // ignore
        }
      });
    }
  }
}
