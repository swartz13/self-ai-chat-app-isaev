#!/usr/bin/env bash
# ===================================================================
# Installs ISAEV APK over USB via ADB.
# Bypasses device vendor sideload limitations and displays exact error codes.
# ===================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADB="${ANDROID_HOME:-/data/android-sdk}/platform-tools/adb"
APK="$ROOT/isaev.apk"
if [ ! -f "$APK" ]; then
  APK="$ROOT/OxAlpha.apk"
fi

[ -x "$ADB" ] || { echo "ERROR: adb executable not found: $ADB"; exit 1; }
[ -f "$APK" ] || { echo "ERROR: APK file not found at $APK"; exit 1; }

echo "==> Searching for connected Android device"
"$ADB" start-server >/dev/null 2>&1
DEVICES=$("$ADB" devices | tail -n +2 | grep -v '^$' || true)
echo "$DEVICES" | sed 's/^/    /'

if echo "$DEVICES" | grep -q unauthorized; then
  echo
  echo "  Device is unauthorized."
  echo "  Check your phone screen for the 'Allow USB debugging' dialog,"
  echo "  check 'Always allow from this computer', tap OK, and re-run this script."
  exit 1
fi

if ! echo "$DEVICES" | grep -q device$; then
  echo
  echo "  No authorized device found. Troubleshooting steps:"
  echo "    1) Settings > About phone > Version > tap 'Build number' 7 times"
  echo "    2) Settings > Developer options > enable 'USB debugging'"
  echo "    3) In Developer options > enable 'Install via USB'"
  echo "    4) Reconnect the USB cable and select 'File Transfer (MTP)'"
  exit 1
fi

echo
echo "==> Device information"
for k in ro.product.manufacturer ro.product.model ro.build.version.release ro.build.version.sdk; do
  printf "    %-32s %s\n" "$k" "$("$ADB" shell getprop $k 2>/dev/null | tr -d '\r')"
done

SDK=$("$ADB" shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')
if [ -n "$SDK" ] && [ "$SDK" -lt 24 ] 2>/dev/null; then
  echo
  echo "  WARNING: Device is running API level $SDK (requires Android 7.0 / API 24+)."
  exit 1
fi

echo
echo "==> Installing APK"
"$ADB" install -r -d "$APK"
CODE=$?

if [ $CODE -eq 0 ]; then
  echo
  echo "==> Launching application"
  "$ADB" shell am start -n com.oxalpha.chat/.MainActivity >/dev/null 2>&1
  echo "  Successfully installed and launched ISAEV."
else
  echo
  echo "  Installation failed. Please review the INSTALL_FAILED_... error above."
fi
