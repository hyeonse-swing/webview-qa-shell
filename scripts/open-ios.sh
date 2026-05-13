#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXPO_PORT="${EXPO_PORT:-19000}"
TARGET_PORT="${TARGET_PORT:-8080}"
SIMULATOR_NAME="${SIMULATOR_NAME:-}"

if [[ -n "${TARGET_URL:-}" ]]; then
  export EXPO_PUBLIC_TARGET_URL="$TARGET_URL"
else
  export EXPO_PUBLIC_TARGET_PORT="$TARGET_PORT"
fi

if ! command -v xcrun >/dev/null 2>&1; then
  echo "xcrun not found. Install Xcode command line tools or open Xcode once."
  exit 1
fi

SIMULATOR_ID="$(
  xcrun simctl list devices available --json | SIMULATOR_NAME="$SIMULATOR_NAME" node -e "
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8');
const data = JSON.parse(input);
const requested = process.env.SIMULATOR_NAME;
const devices = Object.values(data.devices).flat().filter((device) => device.isAvailable && device.name.includes('iPhone'));
const booted = devices.find((device) => device.state === 'Booted');
const named = requested ? devices.find((device) => device.name === requested) : null;
const chosen = named || booted || devices[0];
if (!chosen) process.exit(2);
process.stdout.write(chosen.udid);
"
)"

if [[ -z "$SIMULATOR_ID" ]]; then
  echo "No available iPhone simulator found."
  exit 1
fi

SIMULATOR_LABEL="$(xcrun simctl list devices available | grep "$SIMULATOR_ID" | sed 's/^ *//')"

echo "iOS simulator: $SIMULATOR_LABEL"
echo "Expo port: $EXPO_PORT"
if [[ -n "${TARGET_URL:-}" ]]; then
  echo "WebView target: $TARGET_URL"
else
  echo "WebView target: http://localhost:$TARGET_PORT"
fi

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  echo "DRY_RUN=1, not launching Expo."
  exit 0
fi

xcrun simctl boot "$SIMULATOR_ID" >/dev/null 2>&1 || true
open -a Simulator
xcrun simctl bootstatus "$SIMULATOR_ID" -b

cd "$ROOT_DIR"
pnpm --dir native exec expo start --ios --clear --port "$EXPO_PORT"
