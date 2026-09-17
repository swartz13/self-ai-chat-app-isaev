#!/usr/bin/env bash
# ===================================================================
# Ox Alpha Chat -> APK
# Gradle kullanmadan dogrudan SDK araclariyla derler.
# ===================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AND="$ROOT/android"
OUT="$AND/build"
SDK="${ANDROID_HOME:-/data/android-sdk}"
# 34.0.0'in d8'i JDK 21 altinda anonim ic siniflarda cokuyor; 35 sorunsuz.
BT="$SDK/build-tools/${BUILD_TOOLS:-35.0.0}"
PLATFORM="$SDK/platforms/android-34/android.jar"

rm -rf "$OUT"; mkdir -p "$OUT/res" "$OUT/classes" "$OUT/apk"

# ---------------------------------------------------------------- 1) web varliklari
echo "==> web varliklari hazirlaniyor"
rm -rf "$AND/assets/www"; mkdir -p "$AND/assets/www"
cp "$ROOT/public/index.html" "$ROOT/public/styles.css" \
   "$ROOT/public/app.js" "$ROOT/public/markdown.js" \
   "$ROOT/public/local-backend.js" "$AND/assets/www/"
cp "$ROOT/node_modules/mammoth/mammoth.browser.min.js" "$AND/assets/www/"

# .env -> config.js  (anahtarlar ve model listesi uygulamaya gomulur)
node "$AND/mkconfig.mjs" "$ROOT/.env" "$AND/assets/www/config.js"

# index.html: sunucusuz calisma icin ek betikleri app.js'ten ONCE ekle
python3 - "$AND/assets/www/index.html" <<'PY'
import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
inject = ('<script src="/mammoth.browser.min.js"></script>\n'
          '<script src="/config.js"></script>\n'
          '<script src="/local-backend.js"></script>\n')
assert '<script src="/app.js"></script>' in s, 'app.js etiketi bulunamadi'
s = s.replace('<script src="/app.js"></script>', inject + '<script src="/app.js"></script>')
open(p, 'w', encoding='utf-8').write(s)
print('  index.html: sunucusuz betikler eklendi')
PY

# ---------------------------------------------------------------- 2) kaynaklar
echo "==> kaynaklar derleniyor"
"$BT/aapt2" compile --dir "$AND/res" -o "$OUT/res/res.zip"
"$BT/aapt2" link \
  -o "$OUT/apk/base.apk" \
  -I "$PLATFORM" \
  --manifest "$AND/AndroidManifest.xml" \
  -A "$AND/assets" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --java "$OUT/gen" \
  "$OUT/res/res.zip"

# ---------------------------------------------------------------- 3) java -> dex
echo "==> java derleniyor"
mkdir -p "$OUT/gen"
find "$AND/src" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
# --release 11: hem d8'in kabul ettigi sinif dosyasi surumu, hem de
# -bootclasspath ile cakismayan tek secenek.
javac --release 11 -nowarn -classpath "$PLATFORM" \
  -d "$OUT/classes" @"$OUT/sources.txt"

CLASSES=$(find "$OUT/classes" -name '*.class' | wc -l)
[ "$CLASSES" -gt 0 ] || { echo "HATA: hic sinif uretilmedi"; exit 1; }
echo "  $CLASSES sinif derlendi"

echo "==> dex uretiliyor"
find "$OUT/classes" -name '*.class' > "$OUT/classes.txt"
"$BT/d8" --lib "$PLATFORM" --min-api 24 --output "$OUT/apk" @"$OUT/classes.txt"
[ -f "$OUT/apk/classes.dex" ] || { echo "HATA: classes.dex uretilmedi"; exit 1; }

# ---------------------------------------------------------------- 4) paketle
echo "==> apk paketleniyor"
cd "$OUT/apk"
zip -q -u base.apk classes.dex
cd "$OUT"
"$BT/zipalign" -f -p 4 "$OUT/apk/base.apk" "$OUT/aligned.apk"

# ---------------------------------------------------------------- 5) imzala
KS="$AND/oxalpha.keystore"
if [ ! -f "$KS" ]; then
  echo "==> imza anahtari uretiliyor"
  keytool -genkeypair -v -keystore "$KS" -storepass oxalpha -keypass oxalpha \
    -alias oxalpha -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Ox Alpha Chat, OU=Local, O=Local, L=-, S=-, C=TR" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:oxalpha --key-pass pass:oxalpha \
  --v1-signing-enabled true --v2-signing-enabled true \
  --out "$ROOT/OxAlpha.apk" "$OUT/aligned.apk"
"$BT/apksigner" verify --print-certs "$ROOT/OxAlpha.apk" | head -2

echo
echo "  HAZIR -> $ROOT/OxAlpha.apk  ($(du -h "$ROOT/OxAlpha.apk" | cut -f1))"
