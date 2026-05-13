export type PlatformMode = 'auto' | 'android' | 'ios';

export type PanelId =
  | 'overview'
  | 'viewport'
  | 'permissions'
  | 'deeplink'
  | 'upload'
  | 'navigation'
  | 'forms'
  | 'storage'
  | 'logs';

export type LogLevel = 'info' | 'success' | 'warning' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  level: LogLevel;
  message: string;
  details?: unknown;
}

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface NativeBridgeInfo {
  androidObject: boolean;
  iosMessageHandlers: string[];
  reactNativeWebView: boolean;
}

export interface RuntimeSnapshot {
  timestamp: string;
  platformGuess: 'android' | 'ios' | 'desktop' | 'unknown';
  userAgent: string;
  language: string;
  online: boolean;
  cookieEnabled: boolean;
  devicePixelRatio: number;
  viewport: {
    innerWidth: number;
    innerHeight: number;
    outerWidth: number;
    outerHeight: number;
    visualWidth: number | null;
    visualHeight: number | null;
    visualOffsetTop: number | null;
    visualOffsetLeft: number | null;
  };
  screen: {
    width: number;
    height: number;
    availWidth: number;
    availHeight: number;
    orientation: string;
  };
  safeArea: SafeAreaInsets;
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
  };
  nativeBridge: NativeBridgeInfo;
}

declare global {
  interface Window {
    Android?: unknown;
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    webkit?: {
      messageHandlers?: Record<string, { postMessage: (message: unknown) => void }>;
    };
  }
}
