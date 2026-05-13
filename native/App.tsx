import { useMemo, useRef, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView, { type WebViewNavigation } from 'react-native-webview';
import { getDefaultLocalUrl } from './src/localUrl';

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
      post('WEBVIEW_QA_ERROR', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });

    window.addEventListener('unhandledrejection', function (event) {
      post('WEBVIEW_QA_REJECTION', {
        reason: String(event.reason)
      });
    });
  })();
  true;
`;

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
  const defaultUrl = useMemo(() => getDefaultLocalUrl(), []);
  const [inputUrl, setInputUrl] = useState(defaultUrl);
  const [activeUrl, setActiveUrl] = useState(defaultUrl);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [useNativeSafeArea, setUseNativeSafeArea] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [lastMessage, setLastMessage] = useState('No WebView messages yet');

  const loadInputUrl = () => {
    setActiveUrl(normalizeUrl(inputUrl));
    setStatus('Loading requested URL');
  };

  const resetLocal = () => {
    setInputUrl(defaultUrl);
    setActiveUrl(defaultUrl);
    setStatus('Reset to local QA URL');
  };

  const onNavigationStateChange = (navigation: WebViewNavigation) => {
    setCanGoBack(navigation.canGoBack);
    setCanGoForward(navigation.canGoForward);
    setStatus(`${navigation.loading ? 'Loading' : 'Loaded'}: ${navigation.url}`);
  };

  const toggleNativeSafeArea = () => {
    setUseNativeSafeArea((current) => {
      const next = !current;
      setStatus(`Native safe area ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

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
          onLoadStart={() => setStatus('Load started')}
          onLoadEnd={() => setStatus(`Load ended: ${activeUrl}`)}
          onError={(event) => {
            setStatus(`Error: ${event.nativeEvent.description}`);
            setLastMessage(JSON.stringify(event.nativeEvent, null, 2));
          }}
          onHttpError={(event) => {
            setStatus(`HTTP ${event.nativeEvent.statusCode}: ${event.nativeEvent.url}`);
          }}
          onMessage={(event) => {
            setLastMessage(event.nativeEvent.data);
          }}
          onNavigationStateChange={onNavigationStateChange}
          style={styles.webview}
        />
      </View>

      {isPanelOpen ? (
        <View style={[styles.panel, { top: insets.top + 8, left: 10, right: 10 }]}>
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
              >
                <Text style={[styles.segmentText, !useNativeSafeArea && styles.segmentTextActive]}>Edge</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentButton, useNativeSafeArea && styles.segmentButtonActive]}
                onPress={() => setUseNativeSafeArea(true)}
              >
                <Text style={[styles.segmentText, useNativeSafeArea && styles.segmentTextActive]}>Safe</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.urlRow}>
            <TextInput
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={loadInputUrl}
              style={styles.input}
              placeholder="http://localhost:8080"
              placeholderTextColor="#7f8b99"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={loadInputUrl}>
              <Text style={styles.primaryButtonText}>Load</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.controlRow}>
            <ControlButton label="Back" disabled={!canGoBack} onPress={() => webViewRef.current?.goBack()} />
            <ControlButton label="Fwd" disabled={!canGoForward} onPress={() => webViewRef.current?.goForward()} />
            <ControlButton label="Reload" onPress={() => webViewRef.current?.reload()} />
          </View>

          <View style={styles.controlRow}>
            <ControlButton label="8080" onPress={resetLocal} />
            <ControlButton label={useNativeSafeArea ? 'Safe On' : 'Safe Off'} onPress={toggleNativeSafeArea} />
            <ControlButton label="Hide" onPress={() => setIsPanelOpen(false)} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.status} numberOfLines={1}>{status}</Text>
            <Text style={styles.message} numberOfLines={2}>{lastMessage}</Text>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.floatingToggle, { top: insets.top + 8, right: 10 }]}
          onPress={() => setIsPanelOpen(true)}
        >
          <Text style={styles.floatingToggleText}>QA</Text>
        </TouchableOpacity>
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
    >
      <Text style={[styles.controlButtonText, disabled && styles.controlButtonTextDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return getDefaultLocalUrl();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return `http://${trimmed}`;
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
    gap: 10,
    padding: 10,
    position: 'absolute',
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
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 52,
    position: 'absolute',
  },
  floatingToggleText: {
    color: '#f4f7fb',
    fontSize: 13,
    fontWeight: '900',
  },
});
