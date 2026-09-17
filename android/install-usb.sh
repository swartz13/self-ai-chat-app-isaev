#!/usr/bin/env bash
# ===================================================================
# APK'yi USB uzerinden kurar. Telefonun kendi yukleyicisi "Uygulama
# yuklenmedi" gibi anlamsiz bir mesaj verdiginde, bu yol GERCEK hata
# kodunu gosterir.
# ===================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADB="${ANDROID_HOME:-/data/android-sdk}/platform-tools/adb"
APK="$ROOT/OxAlpha.apk"

[ -x "$ADB" ] || { echo "HATA: adb bulunamadi: $ADB"; exit 1; }
[ -f "$APK" ] || { echo "HATA: OxAlpha.apk bulunamadi"; exit 1; }

echo "==> telefon araniyor"
"$ADB" start-server >/dev/null 2>&1
DEVICES=$("$ADB" devices | tail -n +2 | grep -v '^$' || true)
echo "$DEVICES" | sed 's/^/    /'

if echo "$DEVICES" | grep -q unauthorized; then
  echo
  echo "  Telefonda 'USB hata ayiklamaya izin ver' penceresi cikti."
  echo "  'Bu bilgisayara her zaman izin ver' isaretleyip Tamam'a basin, sonra tekrar calistirin."
  exit 1
fi
if ! echo "$DEVICES" | grep -q device$; then
  echo
  echo "  Telefon gorunmuyor. Sirasiyla:"
  echo "    1) Ayarlar > Telefon hakkinda > Surum > 'Derleme numarasi'na 7 kez dokunun"
  echo "    2) Ayarlar > Ek ayarlar > Gelistirici secenekleri > 'USB hata ayiklama' ACIK"
  echo "    3) Ayni ekranda 'USB uzerinden yuklemeye izin ver' ACIK"
  echo "    4) USB kablosunu takin, telefonda 'Dosya aktarimi (MTP)' secin"
  exit 1
fi

echo
echo "==> telefon bilgisi"
for k in ro.product.manufacturer ro.product.model ro.build.version.release ro.build.version.sdk; do
  printf "    %-32s %s\n" "$k" "$("$ADB" shell getprop $k 2>/dev/null | tr -d '\r')"
done

SDK=$("$ADB" shell getprop ro.build.version.sdk 2>/dev/null | tr -d '\r')
if [ -n "$SDK" ] && [ "$SDK" -lt 24 ] 2>/dev/null; then
  echo
  echo "  UYARI: Telefon API $SDK (Android 7'den eski). Bu APK en az API 24 istiyor."
  echo "  Cozum icin bunu bana bildirin, daha eski surumu destekleyecek sekilde yeniden derleyeyim."
  exit 1
fi

echo
echo "==> kuruluyor (gercek hata mesaji asagida)"
"$ADB" install -r -d "$APK"
CODE=$?

if [ $CODE -eq 0 ]; then
  echo
  echo "==> baslatiliyor"
  "$ADB" shell am start -n com.oxalpha.chat/.MainActivity >/dev/null 2>&1
  echo "  Kuruldu ve acildi."
else
  echo
  echo "  Kurulum basarisiz. Yukaridaki INSTALL_FAILED_... satirini bana iletin."
fi
