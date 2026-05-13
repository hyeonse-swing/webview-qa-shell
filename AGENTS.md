# Agent Runbook

This repository is a native WebView tester for non-developers.

Read `SETUP-KO.md` when the user is missing Node.js, pnpm, Xcode, iOS Simulator, Android Studio, or an Android Virtual Device.

## Default Task

When a user gives a staging URL and asks to open or test it, launch the native WebView shell with that URL.

Prefer these commands:

```bash
pnpm install
pnpm run doctor
pnpm launch:ios https://stage.example.com
pnpm launch:android https://stage.example.com
```

Use the exact staging URL provided by the user. If the URL does not start with `http://` or `https://`, the `launch` script will add `https://`.

## Important Behavior

- Do not ask the user to run a local web service unless they specifically want local testing.
- For staging URLs, do not use `TARGET_PORT` or localhost.
- `pnpm launch:ios <url>` opens the iOS simulator.
- `pnpm launch:android <url>` opens the Android emulator.
- The in-app `QA` button exposes the WebView frame mode:
  - `Edge`: WebView draws edge-to-edge.
  - `Safe`: native safe-area insets are applied around the WebView.

## If Something Fails

Run:

```bash
pnpm run doctor
```

Then report the missing prerequisite in plain language, usually one of:

- Node.js or pnpm is unavailable.
- Xcode or iOS Simulator is unavailable.
- Android Studio has no AVD.
- Android SDK tools are not on the expected path.
- Dependencies were not installed.
