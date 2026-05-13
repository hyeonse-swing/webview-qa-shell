#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SDK_DEFAULT="$HOME/Library/Android/sdk"
ANDROID_SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$ANDROID_SDK_DEFAULT}}"
EXPO_PORT="${EXPO_PORT:-19000}"
TARGET_PORT="${TARGET_PORT:-8080}"

export ANDROID_HOME="$ANDROID_SDK"
export ANDROID_SDK_ROOT="$ANDROID_SDK"
export PATH="$ANDROID_SDK/emulator:$ANDROID_SDK/platform-tools:$PATH"

if [[ -n "${TARGET_URL:-}" ]]; then
  export EXPO_PUBLIC_TARGET_URL="$TARGET_URL"
else
  export EXPO_PUBLIC_TARGET_PORT="$TARGET_PORT"
fi

if [[ ! -x "$ANDROID_SDK/emulator/emulator" ]]; then
  echo "Android emulator not found at $ANDROID_SDK/emulator/emulator"
  exit 1
fi

if [[ ! -x "$ANDROID_SDK/platform-tools/adb" ]]; then
  echo "adb not found at $ANDROID_SDK/platform-tools/adb"
  exit 1
fi

AVD_NAME="${AVD_NAME:-$("$ANDROID_SDK/emulator/emulator" -list-avds | sed -n '1p')}"

if [[ -z "$AVD_NAME" ]]; then
  echo "No Android AVD found. Create one in Android Studio Device Manager."
  exit 1
fi

echo "Android AVD: $AVD_NAME"
echo "Expo port: $EXPO_PORT"
if [[ -n "${TARGET_URL:-}" ]]; then
  echo "WebView target: $TARGET_URL"
else
  echo "WebView target: http://10.0.2.2:$TARGET_PORT"
fi

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1, not launching emulator or Expo."
  exit 0
fi

if ! "$ANDROID_SDK/platform-tools/adb" devices | grep -qE '^emulator-[0-9]+\s+device$'; then
  "$ANDROID_SDK/emulator/emulator" -avd "$AVD_NAME" >/tmp/webview-qa-android-emulator.log 2>&1 &
fi

"$ANDROID_SDK/platform-tools/adb" wait-for-device

for _ in $(seq 1 90); do
  booted="$("$ANDROID_SDK/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
  if [[ "$booted" == "1" ]]; then
    break
  fi
  sleep 2
done

cd "$ROOT_DIR"
pnpm --dir native exec expo start --android --clear --port "$EXPO_PORT"
