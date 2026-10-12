#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "${BASH_SOURCE[0]%/*}/.." && pwd)"
ANDROID_SDK_DEFAULT="$HOME/Library/Android/sdk"
ANDROID_SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$ANDROID_SDK_DEFAULT}}"
COMMON_MISSING=0

print_setup_hint() {
  printf '  See SETUP-KO.md for setup instructions.\n'
}

echo "WebView QA environment"
echo "Root: $ROOT_DIR"
echo

echo "Node:"
if command -v node >/dev/null 2>&1; then
  if NODE_VERSION="$(node --version 2>&1)"; then
    printf '  %s\n' "$NODE_VERSION"
  else
    printf '  node --version failed: %s\n' "$NODE_VERSION"
    echo "  Repair or install Node.js."
    print_setup_hint
    COMMON_MISSING=1
  fi
else
  echo "  node not found. Install Node.js."
  print_setup_hint
  COMMON_MISSING=1
fi
echo

echo "pnpm:"
if command -v pnpm >/dev/null 2>&1; then
  if PNPM_VERSION="$(pnpm --version 2>&1)"; then
    printf '  %s\n' "$PNPM_VERSION"
  else
    printf '  pnpm --version failed: %s\n' "$PNPM_VERSION"
    echo "  Repair or install pnpm after installing Node.js."
    print_setup_hint
    COMMON_MISSING=1
  fi
else
  echo "  pnpm not found. Install pnpm after installing Node.js."
  print_setup_hint
  COMMON_MISSING=1
fi
echo

echo "Project dependencies:"
if [[ -x "$ROOT_DIR/node_modules/.bin/vite" ]]; then
  echo "  Root Vite CLI: installed"
else
  echo "  Root Vite CLI: missing. Run pnpm install."
  print_setup_hint
  COMMON_MISSING=1
fi
if [[ -x "$ROOT_DIR/native/node_modules/.bin/expo" ]]; then
  echo "  Native Expo CLI: installed"
else
  echo "  Native Expo CLI: missing. Run pnpm --dir native install."
  print_setup_hint
  COMMON_MISSING=1
fi
echo

echo "Reserved/local ports:"
for port in 3000 3001 8080 8090 19000; do
  if ! command -v lsof >/dev/null 2>&1; then
    echo "  $port: unknown (lsof not found)"
  elif lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "  $port: in use"
  else
    LSOF_STATUS=$?
    if [[ "$LSOF_STATUS" -eq 1 ]]; then
      echo "  $port: free"
    else
      echo "  $port: unknown (lsof exited with status $LSOF_STATUS)"
    fi
  fi
done
echo

echo "iOS simulators:"
if ! command -v xcrun >/dev/null 2>&1; then
  echo "  xcrun not found; iOS simulator availability could not be checked."
  echo "  Install Xcode and an iOS Simulator runtime."
  print_setup_hint
elif IOS_DEVICES="$(xcrun simctl list devices available 2>&1)"; then
  IOS_DEVICE_COUNT=0
  IOS_LINE_COUNT=0
  while IFS= read -r line; do
    IOS_LINE_COUNT=$((IOS_LINE_COUNT + 1))
    if [[ "$line" =~ \([[:xdigit:]-]{36}\) ]]; then
      IOS_DEVICE_COUNT=$((IOS_DEVICE_COUNT + 1))
    fi
    if [[ "$IOS_LINE_COUNT" -le 80 ]]; then
      printf '%s\n' "$line"
    fi
  done <<< "$IOS_DEVICES"
  if [[ "$IOS_DEVICE_COUNT" -eq 0 ]]; then
    echo "  No available iOS simulator devices found. Install an iOS Simulator runtime and create or restore a simulator in Xcode."
    print_setup_hint
  fi
else
  printf '  xcrun simctl list devices available failed: %s\n' "$IOS_DEVICES"
  echo "  Check Xcode command line tools and install an iOS Simulator runtime."
  print_setup_hint
fi
echo

echo "Android SDK:"
echo "  $ANDROID_SDK"
ANDROID_EMULATOR="$ANDROID_SDK/emulator/emulator"
ANDROID_ADB="$ANDROID_SDK/platform-tools/adb"
if [[ -x "$ANDROID_EMULATOR" ]]; then
  echo "Android AVDs:"
  if ANDROID_AVDS="$("$ANDROID_EMULATOR" -list-avds 2>&1)"; then
    ANDROID_AVD_COUNT=0
    while IFS= read -r line; do
      if [[ -n "${line//[[:space:]]/}" ]]; then
        ANDROID_AVD_COUNT=$((ANDROID_AVD_COUNT + 1))
        printf '  %s\n' "$line"
      fi
    done <<< "$ANDROID_AVDS"
    if [[ "$ANDROID_AVD_COUNT" -eq 0 ]]; then
      echo "  No Android AVD found. Create one in Android Studio Device Manager."
      print_setup_hint
    fi
  else
    printf '  emulator -list-avds failed: %s\n' "$ANDROID_AVDS"
    echo "  Check Android Studio and the Android Emulator installation."
    print_setup_hint
  fi
else
  echo "  emulator binary not found. Install Android Studio and the Android Emulator."
  print_setup_hint
fi

if [[ -x "$ANDROID_ADB" ]]; then
  echo "Android devices:"
  if ! command -v lsof >/dev/null 2>&1; then
    echo "  unknown; lsof is unavailable, so adb was not queried to avoid starting its server."
  elif lsof -nP -iTCP:5037 -sTCP:LISTEN >/dev/null 2>&1; then
    if ANDROID_DEVICES="$("$ANDROID_ADB" -H 127.0.0.1 -P 5037 devices 2>&1)"; then
      ANDROID_DEVICE_COUNT=0
      while IFS= read -r line; do
        if [[ "$line" =~ ^[^[:space:]]+[[:space:]]+device([[:space:]]|$) ]]; then
          ANDROID_DEVICE_COUNT=$((ANDROID_DEVICE_COUNT + 1))
        fi
        printf '  %s\n' "$line"
      done <<< "$ANDROID_DEVICES"
      if [[ "$ANDROID_DEVICE_COUNT" -eq 0 ]]; then
        echo "  No Android device is connected to the running ADB server. Start an AVD or connect a device with USB debugging enabled."
        print_setup_hint
      fi
    else
      printf '  adb devices failed: %s\n' "$ANDROID_DEVICES"
      echo "  Check the running ADB server or connect a device with USB debugging enabled."
      print_setup_hint
    fi
  else
    ADB_PORT_STATUS=$?
    if [[ "$ADB_PORT_STATUS" -eq 1 ]]; then
      echo "  No running ADB server; connected devices were not queried. Start an AVD or connect a device when ready to launch."
    else
      echo "  unknown (lsof exited with status $ADB_PORT_STATUS); adb was not queried to avoid starting its server."
    fi
  fi
else
  echo "Android devices:"
  echo "  adb binary not found. Install Android SDK Platform-Tools."
  print_setup_hint
fi

echo
echo "Exit status: 1 if Node.js or pnpm is missing/unusable, or either project CLI is missing; iOS/Android platform gaps are informational and do not affect the status."
if [[ "$COMMON_MISSING" -ne 0 ]]; then
  exit 1
fi
