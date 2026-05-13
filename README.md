# WebView QA Console

Native WebView test harness for checking a web service inside Android WebView and iOS WKWebView.

The project has two layers:

- Root web app: optional QA Console served at `http://localhost:8090` by default.
- `native/`: Expo React Native app that opens the target service in `react-native-webview`.

Port ownership:

- `3000`, `3001`, and `8080` are reserved for other local services.
- The native shell opens `8080` by default because that is the target service under test.
- This project's own optional web console uses `8090` by default to avoid occupying the target port.

## Run The Web Console

```bash
pnpm install
pnpm dev:qa
```

Default URL:

```text
http://localhost:8090
```

If port `8090` is already occupied, use a temporary port for local verification:

```bash
QA_PORT=8091 pnpm dev:qa
```

The default QA console port is `8090`; `QA_PORT` is only a fallback for local conflicts.

## Run The Native App

Start the target service first. By default the native shell opens:

- iOS simulator: `http://localhost:8080`
- Android emulator: `http://10.0.2.2:8080`

The native shell can switch the WebView frame between two modes from the `QA` overlay:

- `Edge`: default mode. The WebView renders edge-to-edge so the loaded web page can test notch, status bar, and bottom gesture areas directly.
- `Safe`: native safe-area mode. The app applies native safe-area insets around the WebView, so the loaded web page is prevented from drawing under unsafe areas.

Tap `QA` to open the controls and `Hide` to return to the WebView.

Then launch the native shell:

```bash
pnpm open:ios
pnpm open:android
```

Useful checks:

```bash
pnpm run doctor
pnpm android:avds
```

Pick a specific simulator or AVD:

```bash
SIMULATOR_NAME="iPhone 16 Pro" pnpm open:ios
AVD_NAME="Pixel_8_Pro_API_36" pnpm open:android
```

Open a different local target port:

```bash
TARGET_PORT=8090 pnpm open:ios
TARGET_PORT=8090 pnpm open:android
```

Open an explicit URL:

```bash
TARGET_URL="https://example.com" pnpm open:ios
TARGET_URL="https://example.com" pnpm open:android
```

Physical device:

- iOS: enter `http://<mac-lan-ip>:8080` in the native app URL field.
- Android: enter `http://<mac-lan-ip>:8080` in the native app URL field.

For web safe-area checks, the target page should include:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Then use CSS variables such as `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

## Verify

```bash
pnpm typecheck
pnpm --dir native typecheck
pnpm test
pnpm build
pnpm e2e
```

If `8090` is occupied during E2E:

```bash
QA_PORT=8091 pnpm e2e
```

If the target service is on a different port when launching the native shell:

```bash
TARGET_PORT=8090 pnpm open:ios
TARGET_PORT=8090 pnpm open:android
```
