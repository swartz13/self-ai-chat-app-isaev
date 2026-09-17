# ISAEV — Android

`OxAlpha.apk` **tek başına çalışır**. Bilgisayarınızda sunucu açık olmasına
gerek yoktur; telefon doğrudan OpenRouter ve HuggingFace'e bağlanır.

## Kurulum

### En güvenilir yol: USB

Bazı telefonlar (Oppo/ColorOS, Xiaomi/MIUI) kendi yükleyicileriyle sideload'u
engelleyip yalnızca *"Uygulama yüklenmedi"* der; sebebi söylemez. USB yolu bu
kısıtlamaları atlar ve sorun çıkarsa **gerçek hata kodunu** gösterir.

1. Telefonda: **Ayarlar > Telefon hakkında > Sürüm**, *"Derleme numarası"*na 7 kez dokunun.
2. **Ayarlar > Ek ayarlar > Geliştirici seçenekleri**: *USB hata ayıklama* ve
   *USB üzerinden yüklemeye izin ver* açık olsun.
3. USB kablosunu takın, telefonda çıkan izin penceresinde
   *"Bu bilgisayara her zaman izin ver"* işaretleyip onaylayın.
4. Bilgisayarda:

```bash
export ANDROID_HOME=/data/android-sdk
bash android/install-usb.sh
```

Betik telefonu bulur, Android sürümünü yazar, kurar ve uygulamayı açar.

### Dosyaya dokunarak (telefon izin veriyorsa)

`OxAlpha.apk`'yı telefona kopyalayıp dosya yöneticisinden dokunun. Android
*"bilinmeyen kaynaklardan uygulamaya izin ver"* diye sorarsa izin verin.
ColorOS'ta ayrıca **Ayarlar > Güvenlik > Harici kaynaklardan uygulama yükle**
altında dosya yöneticisine tek tek izin vermek gerekebilir.

## Nasıl çalışıyor

Masaüstü sürümde arayüz `/api/...` adreslerine istek atar, Node sunucusu yanıtlar.
Telefonda Node yok. `local-backend.js` tarayıcının `fetch` işlevini sarmalayıp
aynı adresleri uygulamanın **içinde** karşılar:

| | Masaüstü | Android |
|---|---|---|
| Arka uç | Node + Express | `local-backend.js` (WebView içinde) |
| Depolama | SQLite (`data/chat.db`) | IndexedDB |
| Dosyalar | Diskte (`data/uploads`) | Blob olarak IndexedDB'de |
| Ağ | Sunucu → OpenRouter / HF | Telefon → OpenRouter / HF (doğrudan) |

Arayüz kodu (`app.js`, `styles.css`, `markdown.js`) **iki ortamda da aynıdır**.

## Güvenlik ve Anahtarlar (BYOK)

* **Kendi Anahtarını Getir (BYOK)**: Uygulamayı telefonda açtıktan sonra sağ üstteki **Ayarlar** (çark) simgesine dokunarak OpenRouter veya Hugging Face anahtarlarınızı doğrudan girebilirsiniz. Anahtarlar cihazın yerel `localStorage` alanında saklanır.
* İsteğe bağlı olarak, derleme esnasında `.env` dosyasında anahtar bırakırsanız bu anahtarlar derleme anında `config.js` içine gömülebilir.
* Sohbet geçmişi ve yüklenen dosyalar yalnızca telefonun yerel IndexedDB alanında tutulur; sunucuya iletilmez.
* Veritabanınızı yedeklemek veya başka cihaza aktarmak için Ayarlar menüsündeki **Dışa Aktar** / **İçe Aktar** özelliğini kullanabilirsiniz.

## Yeniden derleme

```bash
export ANDROID_HOME=/data/android-sdk
bash android/build.sh          # -> OxAlpha.apk
```

`.env` içindeki anahtarlar ve `CHAT_MODELS` listesi derleme sırasında
`assets/www/config.js` dosyasına yazılır; ayrıca elle düzenlemeye gerek yoktur.

### Derleme notları

* Gradle kullanılmaz; doğrudan `aapt2` + `javac` + `d8` + `apksigner` çağrılır.
* `build-tools 34.0.0` içindeki `d8`, JDK 21 altında anonim iç sınıflarda
  çöküyor (`NullPointerException`). Bu yüzden **35.0.0** kullanılır.
  Başka sürüm denemek için: `BUILD_TOOLS=36.0.0 bash android/build.sh`
