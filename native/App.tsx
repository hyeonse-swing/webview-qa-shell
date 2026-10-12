import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { type WebViewNavigation } from 'react-native-webview';
import { getDefaultLocalUrl } from './src/localUrl';
import { reduceLoadState, type LoadState } from './src/loadState';
import { normalizeTargetUrl } from './src/targetUrl';

const injectedDiagnostics = `
  (function () {
    function post(type, payload) {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
        type: type,
        payload: payload,
        href: window.location.href,
        timestamp: new Date().toISOString()
      }));
    }

    post('WEBVIEW_QA_READY', {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        dpr: window.devicePixelRatio
      }
    });

    window.addEventListener('error', function (event) {
      if (event.target && event.target !== window) {
        post('WEBVIEW_QA_RESOURCE_ERROR', {
          url: event.target.src || event.target.href || '',
          tagName: event.target.tagName || ''
        });
        return;
      }
      post('WEBVIEW_QA_ERROR', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    }, true);

    window.addEventListener('unhandledrejection', function (event) {
      post('WEBVIEW_QA_REJECTION', {
        reason: String(event.reason)
      });
    });
  })();
  true;
`;

const FLOATING_TOGGLE_WIDTH = 52;
const FLOATING_TOGGLE_HEIGHT = 42;
const FLOATING_TOGGLE_MARGIN = 10;
const FLOATING_TOGGLE_TAP_THRESHOLD = 6;

type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type FloatingPosition = {
  x: number;
  y: number;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <WebViewShell />
    </SafeAreaProvider>
  );
}

function WebViewShell() {
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const defaultUrl = useMemo(() => getDefaultLocalUrl(), []);
  const [inputUrl, setInputUrl] = useState(defaultUrl);
  const [activeUrl, setActiveUrl] = useState(defaultUrl);
  const [webViewGeneration, setWebViewGeneration] = useState(0);
  const [inputError, setInputError] = useState('');
  const [loadState, setLoadState] = useState<LoadState>({ phase: 'idle', url: defaultUrl });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [useNativeSafeArea, setUseNativeSafeArea] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition>(() =>
    getDefaultFloatingPosition(window.width, window.height, insets),
  );
  const [actionStatus, setActionStatus] = useState('');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [lastMessage, setLastMessage] = useState('No WebView messages yet');
  const floatingPositionRef = useRef(floatingPosition);
  const dragStartRef = useRef(floatingPosition);
  const didMoveFloatingToggleRef = useRef(false);

  useEffect(() => {
    floatingPositionRef.current = floatingPosition;
  }, [floatingPosition]);

  useEffect(() => {
    setFloatingPosition((current) => {
      if (!didMoveFloatingToggleRef.current) {
        return getDefaultFloatingPosition(window.width, window.height, insets);
      }

      return clampFloatingPosition(current, window.width, window.height, insets);
    });
  }, [insets.bottom, insets.left, insets.right, insets.top, window.height, window.width]);

  const floatingPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
        onPanResponderGrant: () => {
          dragStartRef.current = floatingPositionRef.current;
        },
        onPanResponderMove: (_, gesture) => {
          const nextPosition = clampFloatingPosition(
            {
              x: dragStartRef.current.x + gesture.dx,
              y: dragStartRef.current.y + gesture.dy,
            },
            window.width,
            window.height,
            insets,
          );

          setFloatingPosition(nextPosition);
        },
        onPanResponderRelease: (_, gesture) => {
          const didDrag =
            Math.abs(gesture.dx) > FLOATING_TOGGLE_TAP_THRESHOLD ||
            Math.abs(gesture.dy) > FLOATING_TOGGLE_TAP_THRESHOLD;

          if (didDrag) {
            didMoveFloatingToggleRef.current = true;
            setActionStatus('QA button moved');
            return;
          }

          setIsPanelOpen(true);
        },
        onPanResponderTerminate: () => {
          setFloatingPosition((current) => clampFloatingPosition(current, window.width, window.height, insets));
        },
      }),
    [insets.bottom, insets.left, insets.right, insets.top, window.height, window.width],
  );

  const loadInputUrl = () => {
    try {
      const nextUrl = normalizeTargetUrl(inputUrl);
      setInputError('');
      Keyboard.dismiss();
      if (nextUrl === activeUrl) {
        if (loadState.url === nextUrl) webViewRef.current?.reload();
        else setWebViewGeneration((current) => current + 1);
      } else {
        setActiveUrl(nextUrl);
      }
      setActionStatus('Loading requested URL');
    } catch (error) {
      setInputError(error instanceof Error ? error.message : 'Enter a valid HTTP or HTTPS URL');
    }
  };

  const resetStart = () => {
    setInputUrl(defaultUrl);
    setInputError('');
    if (activeUrl === defaultUrl && loadState.url === defaultUrl) webViewRef.current?.reload();
    else if (activeUrl === defaultUrl) setWebViewGeneration((current) => current + 1);
    else setActiveUrl(defaultUrl);
    setActionStatus('Reset to start URL');
  };

  const onNavigationStateChange = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack);
    setCanGoForward(navigation.canGoForward);
    setLoadState((current) => reduceLoadState(current, {
      type: 'navigation', url: navigation.url, loading: navigation.loading,
    }));
  };

  const toggleNativeSafeArea = () => {
    setUseNativeSafeArea((current) => {
      const next = !current;
      setActionStatus(`Native safe area ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isPanelOpen) {
        setIsPanelOpen(false);
        return true;
      }
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [isPanelOpen, canGoBack]);

  const retryLoad = () => webViewRef.current?.reload();
  const status = loadState.phase === 'error'
    ? loadState.message
    : loadState.phase === 'idle'
      ? 'Idle'
      : `${loadState.phase === 'loading' ? 'Loading' : 'Loaded'}: ${loadState.url}`;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View
        style={[
          styles.webviewHost,
          useNativeSafeArea && {
            paddingTop: insets.top,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
          },
        ]}
      >
        <WebView
          key={webViewGeneration}
          ref={webViewRef}
          source={{ uri: activeUrl }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowsBackForwardNavigationGestures
          allowsInlineMediaPlayback
          contentInsetAdjustmentBehavior="never"
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="never"
          injectedJavaScript={injectedDiagnostics}
          onLoadStart={(event) => setLoadState((current) => reduceLoadState(current, {
            type: 'start', url: event.nativeEvent.url,
          }))}
          onLoadEnd={(event) => setLoadState((current) => reduceLoadState(current, {
            type: 'end', url: event.nativeEvent.url,
          }))}
          onError={(event) => {
            setLoadState((current) => reduceLoadState(current, {
              type: 'error', url: event.nativeEvent.url,
              message: `Error: ${event.nativeEvent.description}`,
            }));
            setLastMessage(JSON.stringify(event.nativeEvent, null, 2));
          }}
          onHttpError={(event) => {
            setLoadState((current) => reduceLoadState(current, {
              type: 'error', url: event.nativeEvent.url,
              message: `HTTP ${event.nativeEvent.statusCode}: ${event.nativeEvent.url}`,
            }));
            setLastMessage(JSON.stringify(event.nativeEvent, null, 2));
          }}
          onLoadSubResourceError={(event) => {
            setLoadState((current) => reduceLoadState(current, { type: 'subresourceError' }));
            setLastMessage(JSON.stringify(event.nativeEvent, null, 2));
          }}
          onMessage={(event) => {
            setLastMessage(event.nativeEvent.data);
          }}
          onNavigationStateChange={onNavigationStateChange}
          style={styles.webview}
        />
      </View>

      {loadState.phase === 'error' && !isPanelOpen && (
        <View style={[styles.errorBanner, { bottom: insets.bottom + 10 }]} accessibilityRole="alert">
          <Text style={styles.errorText} numberOfLines={2}>{loadState.message}</Text>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Retry loading page" onPress={retryLoad} style={styles.retryButton}>
            <Text style={styles.primaryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isPanelOpen ? (
        <ScrollView
          style={[styles.panel, { top: insets.top + 8, left: 10, right: 10,
            maxHeight: Math.max(100, window.height - insets.top - insets.bottom - 16) }]}
          contentContainerStyle={styles.panelContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Native WebView Shell</Text>
              <Text style={styles.title}>WebView QA</Text>
            </View>
            <View style={styles.platformBadge}>
              <Text style={styles.platformText}>{Platform.OS}</Text>
            </View>
          </View>

          <View style={styles.modeRow}>
            <Text style={styles.modeLabel}>WebView frame</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, !useNativeSafeArea && styles.segmentButtonActive]}
                onPress={() => setUseNativeSafeArea(false)}
                accessibilityRole="button"
                accessibilityLabel="Edge WebView frame"
                accessibilityState={{ selected: !useNativeSafeArea }}
              >
                <Text style={[styles.segmentText, !useNativeSafeArea && styles.segmentTextActive]}>Edge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, useNativeSafeArea && styles.segmentButtonActive]}
                onPress={() => setUseNativeSafeArea(true)}
                accessibilityRole="button"
                accessibilityLabel="Safe WebView frame"
                accessibilityState={{ selected: useNativeSafeArea }}
              >
                <Text style={[styles.segmentText, useNativeSafeArea && styles.segmentTextActive]}>Safe</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.urlRow}>
            <TextInput
              value={inputUrl}
              onChangeText={(value) => { setInputUrl(value); setInputError(''); }}
              accessibilityLabel="WebView URL"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={loadInputUrl}
              style={styles.input}
              placeholder="https://stage.example.com"
              placeholderTextColor="#7f8b99"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={loadInputUrl} accessibilityRole="button" accessibilityLabel="Load URL">
              <Text style={styles.primaryButtonText}>Load</Text>
            </TouchableOpacity>
          </View>
          {inputError ? <Text style={styles.inputError} accessibilityRole="alert">{inputError}</Text> : null}

          <View style={styles.controlRow}>
            <ControlButton label="Back" disabled={!canGoBack} onPress={() => webViewRef.current?.goBack()} />
            <ControlButton label="Fwd" disabled={!canGoForward} onPress={() => webViewRef.current?.goForward()} />
            <ControlButton label={loadState.phase === 'error' ? 'Retry' : 'Reload'} onPress={retryLoad} />
          </View>

          <View style={styles.controlRow}>
            <ControlButton label="Start" onPress={resetStart} />
            <ControlButton label={useNativeSafeArea ? 'Safe On' : 'Safe Off'} onPress={toggleNativeSafeArea} />
            <ControlButton label="Hide" onPress={() => setIsPanelOpen(false)} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.status} numberOfLines={loadState.phase === 'error' ? 3 : 1}>{status}</Text>
            {actionStatus ? <Text style={styles.message} numberOfLines={1}>{actionStatus}</Text> : null}
            <Text style={styles.message} numberOfLines={2}>{lastMessage}</Text>
          </View>
        </ScrollView>
      ) : (
        <View
          accessible
          accessibilityLabel="Open QA panel"
          accessibilityRole="button"
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={() => setIsPanelOpen(true)}
          style={[styles.floatingToggle, { left: floatingPosition.x, top: floatingPosition.y }]}
          {...floatingPanResponder.panHandlers}
        >
          <Text style={styles.floatingToggleText}>QA</Text>
        </View>
      )}
    </View>
  );
}

function ControlButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.controlButton, disabled && styles.controlButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.controlButtonText, disabled && styles.controlButtonTextDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

function getDefaultFloatingPosition(width: number, height: number, insets: EdgeInsets): FloatingPosition {
  return clampFloatingPosition(
    {
      x: width - insets.right - FLOATING_TOGGLE_MARGIN - FLOATING_TOGGLE_WIDTH,
      y: insets.top + FLOATING_TOGGLE_MARGIN,
    },
    width,
    height,
    insets,
  );
}

function clampFloatingPosition(
  position: FloatingPosition,
  width: number,
  height: number,
  insets: EdgeInsets,
): FloatingPosition {
  const minX = insets.left + FLOATING_TOGGLE_MARGIN;
  const maxX = Math.max(minX, width - insets.right - FLOATING_TOGGLE_MARGIN - FLOATING_TOGGLE_WIDTH);
  const minY = insets.top + FLOATING_TOGGLE_MARGIN;
  const maxY = Math.max(minY, height - insets.bottom - FLOATING_TOGGLE_MARGIN - FLOATING_TOGGLE_HEIGHT);

  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#05080b',
  },
  panel: {
    backgroundColor: 'rgba(16, 24, 32, 0.94)',
    borderColor: 'rgba(148, 168, 188, 0.35)',
    borderRadius: 8,
    borderWidth: 1,
    position: 'absolute',
  },
  panelContent: {
    gap: 10,
    padding: 10,
  },
  errorBanner: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 24, 32, 0.96)',
    borderColor: '#e68f72',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    left: 10,
    padding: 10,
    position: 'absolute',
    right: 10,
    zIndex: 10,
  },
  errorText: {
    color: '#ffe2d7',
    flex: 1,
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: '#f2b84b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputError: {
    color: '#ffe2d7',
    fontSize: 12,
  },
  webviewHost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#05080b',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  eyebrow: {
    color: '#89a4bb',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#f4f7fb',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0,
  },
  platformBadge: {
    backgroundColor: '#1f3a4d',
    borderColor: '#315a75',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  platformText: {
    color: '#d9ecf8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  modeLabel: {
    color: '#9cb1c2',
    fontSize: 12,
    fontWeight: '800',
  },
  segmentedControl: {
    backgroundColor: '#17222d',
    borderColor: '#2d4050',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 6,
    minWidth: 66,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#f2b84b',
  },
  segmentText: {
    color: '#9cb1c2',
    fontSize: 12,
    fontWeight: '900',
  },
  segmentTextActive: {
    color: '#1d1608',
  },
  urlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    backgroundColor: '#17222d',
    borderColor: '#2a3d4d',
    borderRadius: 8,
    borderWidth: 1,
    color: '#f4f7fb',
    flex: 1,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#f2b84b',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#1d1608',
    fontSize: 14,
    fontWeight: '800',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: '#233444',
    borderColor: '#355268',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 38,
    justifyContent: 'center',
  },
  controlButtonDisabled: {
    opacity: 0.45,
  },
  controlButtonText: {
    color: '#e5f0f8',
    fontSize: 12,
    fontWeight: '800',
  },
  controlButtonTextDisabled: {
    color: '#8fa0ad',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  footer: {
    backgroundColor: '#17222d',
    borderColor: '#2d4050',
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  status: {
    color: '#f4f7fb',
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    color: '#9cb1c2',
    fontSize: 11,
  },
  floatingToggle: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 24, 32, 0.92)',
    borderColor: 'rgba(148, 168, 188, 0.45)',
    borderRadius: 8,
    borderWidth: 1,
    elevation: 12,
    justifyContent: 'center',
    height: FLOATING_TOGGLE_HEIGHT,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    width: FLOATING_TOGGLE_WIDTH,
    zIndex: 20,
  },
  floatingToggleText: {
    color: '#f4f7fb',
    fontSize: 13,
    fontWeight: '900',
  },
});
