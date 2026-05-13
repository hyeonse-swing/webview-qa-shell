#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FIRST_ARG="${1:-}"
SECOND_ARG="${2:-}"

if [[ "$FIRST_ARG" == "ios" || "$FIRST_ARG" == "android" ]]; then
  PLATFORM="$FIRST_ARG"
  RAW_URL="${SECOND_ARG:-${TARGET_URL:-}}"
else
  PLATFORM="${PLATFORM:-ios}"
  RAW_URL="${FIRST_ARG:-${TARGET_URL:-}}"
fi

if [[ -z "$RAW_URL" ]]; then
  cat <<'USAGE'
Usage:
  pnpm launch:ios https://stage.example.com
  pnpm launch:android https://stage.example.com
  pnpm launch ios https://stage.example.com
  pnpm launch android https://stage.example.com

If the URL has no scheme, https:// is added automatically.
USAGE
  exit 1
fi

if [[ "$RAW_URL" =~ ^https?:// ]]; then
  TARGET_URL="$RAW_URL"
else
  TARGET_URL="https://$RAW_URL"
fi

export TARGET_URL

echo "Platform: $PLATFORM"
echo "WebView target: $TARGET_URL"

cd "$ROOT_DIR"

case "$PLATFORM" in
  ios)
    bash scripts/open-ios.sh
    ;;
  android)
    bash scripts/open-android.sh
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    exit 1
    ;;
esac
