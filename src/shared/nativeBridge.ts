import type { NativeBridgeInfo } from './types';

export function detectNativeBridge(): NativeBridgeInfo {
  return {
    androidObject: typeof window.Android !== 'undefined',
    iosMessageHandlers: Object.keys(window.webkit?.messageHandlers ?? {}),
    reactNativeWebView: typeof window.ReactNativeWebView?.postMessage === 'function',
  };
}

export function postToNativeBridge(message: unknown) {
  const payload = JSON.stringify(message);
  const bridge = detectNativeBridge();

  if (bridge.reactNativeWebView) {
    window.ReactNativeWebView?.postMessage(payload);
  }

  if (bridge.iosMessageHandlers.includes('webviewQA')) {
    window.webkit?.messageHandlers?.webviewQA?.postMessage(message);
  }

  return bridge;
}
