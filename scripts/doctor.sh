#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_SDK_DEFAULT="$HOME/Library/Android/sdk"
ANDROID_SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$ANDROID_SDK_DEFAULT}}"

echo "WebView QA environment"
echo "Root: $ROOT_DIR"
echo

echo "Node:"
node --version
echo

echo "pnpm:"
pnpm --version
echo

echo "Reserved/local ports:"
for port in 3000 3001 8080 8090 19000; do
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "  $port: in use"
  else
    echo "  $port: free"
  fi
done
echo

echo "iOS simulators:"
if command -v xcrun >/dev/null 2>&1; then
  xcrun simctl list devices available | sed -n '1,80p'
else
  echo "  xcrun not found"
fi
echo

echo "Android SDK:"
echo "  $ANDROID_SDK"
if [[ -x "$ANDROID_SDK/emulator/emulator" ]]; then
  echo "Android AVDs:"
  "$ANDROID_SDK/emulator/emulator" -list-avds | sed 's/^/  /'
else
  echo "  emulator binary not found"
fi
if [[ -x "$ANDROID_SDK/platform-tools/adb" ]]; then
  echo "Android devices:"
  "$ANDROID_SDK/platform-tools/adb" devices | sed 's/^/  /'
else
  echo "  adb binary not found"
fi
