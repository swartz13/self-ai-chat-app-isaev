#!/usr/bin/env bash
# ===================================================================
# ISAEV AI -> Android APK
# Compiles directly using Android SDK tools without Gradle in <3s.
# ===================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AND="$ROOT/android"
OUT="$AND/build"
SDK="${ANDROID_HOME:-/data/android-sdk}"
BT="$SDK/build-tools/${BUILD_TOOLS:-35.0.0}"
PLATFORM="$SDK/platforms/android-34/android.jar"
APK_OUT="${APK_NAME:-isaev.apk}"

rm -rf "$OUT"; mkdir -p "$OUT/res" "$OUT/classes" "$OUT/apk"

# ---------------------------------------------------------------- 1) Web assets
echo "==> Preparing web assets"
rm -rf "$AND/assets/www"; mkdir -p "$AND/assets/www"
cp "$ROOT/public/index.html" "$ROOT/public/styles.css" \
   "$ROOT/public/app.js" "$ROOT/public/markdown.js" \
   "$ROOT/public/local-backend.js" "$AND/assets/www/"
cp "$ROOT/node_modules/mammoth/mammoth.browser.min.js" "$AND/assets/www/"

# Generate config.js from .env or .env.example
node "$AND/mkconfig.mjs" "$ROOT/.env" "$AND/assets/www/config.js"

# Inject standalone offline scripts into index.html
python3 - "$AND/assets/www/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
inject = ('<script src="/mammoth.browser.min.js"></script>\n'
          '<script src="/config.js"></script>\n'
          '<script src="/local-backend.js"></script>\n')
assert '<script src="/app.js"></script>' in s, 'app.js tag not found'
s = s.replace('<script src="/app.js"></script>', inject + '<script src="/app.js"></script>')
open(p, 'w', encoding='utf-8').write(s)
print('  index.html: standalone scripts injected')
PY

# ---------------------------------------------------------------- 2) Resources
echo "==> Compiling resources"
"$BT/aapt2" compile --dir "$AND/res" -o "$OUT/res/res.zip"
"$BT/aapt2" link \
  -o "$OUT/apk/base.apk" \
  -I "$PLATFORM" \
  --manifest "$AND/AndroidManifest.xml" \
  -A "$AND/assets" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --java "$OUT/gen" \
  "$OUT/res/res.zip"

# ---------------------------------------------------------------- 3) Java -> DEX
echo "==> Compiling Java sources"
mkdir -p "$OUT/gen"
find "$AND/src" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
javac --release 11 -nowarn -classpath "$PLATFORM" \
  -d "$OUT/classes" @"$OUT/sources.txt"

CLASSES=$(find "$OUT/classes" -name '*.class' | wc -l)
[ "$CLASSES" -gt 0 ] || { echo "ERROR: No classes produced"; exit 1; }
echo "  $CLASSES classes compiled"

echo "==> Generating DEX bytecode"
find "$OUT/classes" -name '*.class' > "$OUT/classes.txt"
"$BT/d8" --lib "$PLATFORM" --min-api 24 --output "$OUT/apk" @"$OUT/classes.txt"
[ -f "$OUT/apk/classes.dex" ] || { echo "ERROR: classes.dex was not generated"; exit 1; }

# ---------------------------------------------------------------- 4) Package & Align
echo "==> Packaging APK"
cd "$OUT/apk"
zip -q -u base.apk classes.dex
cd "$OUT"
"$BT/zipalign" -f -p 4 "$OUT/apk/base.apk" "$OUT/aligned.apk"

# ---------------------------------------------------------------- 5) Sign APK
KS="$AND/isaev.keystore"
if [ ! -f "$KS" ]; then
  if [ -f "$AND/oxalpha.keystore" ]; then
    KS="$AND/oxalpha.keystore"
  else
    echo "==> Generating release signing key"
    keytool -genkeypair -v -keystore "$KS" -storepass isaev123 -keypass isaev123 \
      -alias isaev -keyalg RSA -keysize 2048 -validity 10000 \
      -dname "CN=ISAEV AI, OU=Local, O=Local, L=-, S=-, C=US" >/dev/null 2>&1
  fi
fi

PASS="isaev123"
if [ "$KS" = "$AND/oxalpha.keystore" ]; then
  PASS="oxalpha"
fi

"$BT/apksigner" sign --ks "$KS" --ks-pass pass:"$PASS" --key-pass pass:"$PASS" \
  --v1-signing-enabled true --v2-signing-enabled true \
  --out "$ROOT/$APK_OUT" "$OUT/aligned.apk"
"$BT/apksigner" verify --print-certs "$ROOT/$APK_OUT" | head -2

# Keep OxAlpha.apk updated as a symlink or copy for backward compatibility
cp "$ROOT/$APK_OUT" "$ROOT/OxAlpha.apk" 2>/dev/null || true

echo
echo "  READY -> $ROOT/$APK_OUT  ($(du -h "$ROOT/$APK_OUT" | cut -f1))"
