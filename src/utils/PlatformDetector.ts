export class PlatformDetector {
  static isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (navigator.maxTouchPoints > 1 && window.innerWidth < 1024);
  }

  static isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  static isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/i.test(navigator.userAgent);
  }

  static isTouchDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  static isPortrait(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  }
}
