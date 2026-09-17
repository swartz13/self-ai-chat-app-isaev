# ISAEV — Android Bağımsız Kullanım Rehberi

`isaev.apk` **tamamen tek başına çalışır**. Bilgisayarınızda sunucu açık olmasına gerek yoktur; telefonunuz doğrudan OpenRouter ve Hugging Face servislerine güvenli HTTPS üzerinden bağlanır.

[🇬🇧 Click for English Android Guide](../ANDROID.md)

---

## Ücretsiz Yapay Zekalar Öncelikli Mimari

ISAEV, öncelikle OpenRouter ve Hugging Face üzerindeki **%100 ücretsiz yapay zeka modellerini** herkesin sıfır maliyetle kullanabilmesi amacıyla geliştirilmiştir:
- **Ling 3.0 Flash**, **Nemotron Super 120B**, **Dots3 Note**, **Free Router** gibi ücretsiz modeller sayesinde herhangi bir ücret ödemeden ve kart girmeden doğrudan sohbet edebilirsiniz.
- **İsteğe Bağlı Ücretli Modellere Geçiş**: Eğer daha gelişmiş akıl yürütme veya üst düzey modelleri (örneğin `z-ai/glm-5.3-flash`, `DeepSeek V3.2` vb.) kullanmak isterseniz, OpenRouter veya Hugging Face hesabınıza cüzi bir bakiye (1–5 dolar gibi) yükleyerek bu modelleri de kesintisiz kullanabilirsiniz. Uygulama harcanan token maliyetini ve kalan bakiyenizi anlık gösterir.

---

## Kurulum

### Yöntem 1: Doğrudan APK İle Yükleme
1. GitHub Releases bölümünden `isaev.apk` dosyasını telefonunuza indirin.
2. Dosya yöneticisinden dosyaya dokunun ve bilinmeyen kaynaklardan yüklemeye izin verin.
3. Uygulamayı açın, sağ üstteki **Ayarlar** (çark) simgesine tıklayarak OpenRouter veya Hugging Face anahtarınızı girin.

### Yöntem 2: USB (ADB) Üzerinden Güvenilir Kurulum
Bazı telefonlar (Oppo ColorOS, Xiaomi MIUI/HyperOS vb.) dosya yöneticisinden yüklemeyi kısıtlayabilir. USB yolu bu kısıtlamaları aşar ve hata durumunda gerçek teşhis kodunu verir:

1. Telefonda: **Ayarlar > Telefon hakkında > Sürüm** altındaki **Derleme numarası**na 7 kez dokunarak Geliştirici Seçeneklerini açın.
2. **Ayarlar > Ek ayarlar > Geliştirici seçenekleri**:
   - **USB hata ayıklama** seçeneğini açın.
   - **USB üzerinden yüklemeye izin ver** seçeneğini açın.
3. USB kablosunu bağlayın, ekranda çıkan onay penceresinde *"Bu bilgisayara her zaman izin ver"* seçeneğini işaretleyip Tamam deyin.
4. Bilgisayarınızda:
   ```bash
   export ANDROID_HOME=/data/android-sdk  # SDK yolunuzu belirtin
   bash android/install-usb.sh
   ```
   Betik telefonu otomatik olarak algılar, Android sürümünü doğrular, `isaev.apk` uygulamasını kurar ve başlatır.

---

## Nasıl Çalışıyor

| Katman | Masaüstü Sürümü | Android Bağımsız APK |
|---|---|---|
| **Arka Uç Motoru** | Node.js + Express | `local-backend.js` (WebView içi Fetch Yakalayıcı) |
| **Veritabanı** | SQLite (`data/chat.db`) | IndexedDB (`isaev`) |
| **Dosyalar** | Yerel Disk (`data/uploads`) | IndexedDB Blob / Blob URL |
| **Ağ İletişimi** | Sunucu → Sağlayıcı API | Telefon → Sağlayıcı API (Doğrudan HTTPS) |

Arayüz kodu (`app.js`, `styles.css`, `markdown.js`) iki ortamda da aynıdır.

---

## Güvenlik ve BYOK (Kendi Anahtarını Getir)

- **Cihazda Saklanan Anahtarlar**: API anahtarlarınız yalnızca telefonunuzun yerel `localStorage` alanında tutulur.
- **Sıfır Telemetri**: İstekleriniz aracı sunucu olmadan doğrudan OpenRouter / Hugging Face servislerine gider.
- **Yedekleme ve Geri Yükleme**: Tüm sohbet veritabanınızı Ayarlar penceresinden JSON olarak dışa aktarabilir veya içe aktarabilirsiniz.

---

## Kaynak Koddan 3 Saniyede Derleme (Gradle Olmadan)

Gradle ağırlığı olmadan doğrudan resmi Android SDK komut satırı araçları (`aapt2`, `javac`, `d8`, `zipalign`, `apksigner`) ile derlenir:

```bash
export ANDROID_HOME=/data/android-sdk
bash android/build.sh
```

- **Çıktı**: Proje kök dizininde `isaev.apk` üretilir.
- **Hız**: Ortalama 2-3 saniye sürer.
- **İmza**: İlk çalıştırmada yerel imza anahtarı (`android/isaev.keystore`) otomatik üretilir.
