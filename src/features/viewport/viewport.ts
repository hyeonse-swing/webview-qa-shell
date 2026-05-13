import { isIndexedDbAvailable, isStorageAvailable } from '../../shared/capability';
import { detectNativeBridge } from '../../shared/nativeBridge';
import type { RuntimeSnapshot, SafeAreaInsets } from '../../shared/types';

export function guessPlatform(userAgent = navigator.userAgent): RuntimeSnapshot['platformGuess'] {
  const normalized = userAgent.toLowerCase();

  if (normalized.includes('android')) return 'android';
  if (/iphone|ipad|ipod/.test(normalized)) return 'ios';
  if (normalized.includes('mac') || normalized.includes('win') || normalized.includes('linux')) return 'desktop';

  return 'unknown';
}

export function measureSafeArea(): SafeAreaInsets {
  const probe = document.createElement('div');
  probe.style.cssText = [
    'position: fixed',
    'visibility: hidden',
    'pointer-events: none',
    'padding-top: env(safe-area-inset-top)',
    'padding-right: env(safe-area-inset-right)',
    'padding-bottom: env(safe-area-inset-bottom)',
    'padding-left: env(safe-area-inset-left)',
  ].join(';');

  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const insets = {
    top: parseFloat(style.paddingTop) || 0,
    right: parseFloat(style.paddingRight) || 0,
    bottom: parseFloat(style.paddingBottom) || 0,
    left: parseFloat(style.paddingLeft) || 0,
  };
  probe.remove();

  return insets;
}

export function collectRuntimeSnapshot(): RuntimeSnapshot {
  const visualViewport = window.visualViewport;

  return {
    timestamp: new Date().toISOString(),
    platformGuess: guessPlatform(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    devicePixelRatio: window.devicePixelRatio,
    viewport: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      visualWidth: visualViewport?.width ?? null,
      visualHeight: visualViewport?.height ?? null,
      visualOffsetTop: visualViewport?.offsetTop ?? null,
      visualOffsetLeft: visualViewport?.offsetLeft ?? null,
    },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      orientation: window.screen.orientation?.type ?? 'unknown',
    },
    safeArea: measureSafeArea(),
    storage: {
      localStorage: isStorageAvailable('localStorage'),
      sessionStorage: isStorageAvailable('sessionStorage'),
      indexedDB: isIndexedDbAvailable(),
    },
    nativeBridge: detectNativeBridge(),
  };
}
