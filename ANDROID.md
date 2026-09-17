# ISAEV — Android Standalone Guide

`isaev.apk` operates **100% standalone**. There is no need to keep a server running on your computer; your phone connects directly to OpenRouter and Hugging Face over HTTPS.

[🇹🇷 Türkçe Android Rehberi için tıklayın](Turkish/ANDROID.md)

---

## Free-Tier First Architecture

ISAEV is designed from the ground up to leverage the rich ecosystem of **100% free AI models** available on OpenRouter and Hugging Face:
- Free models like **Ling 3.0 Flash**, **Nemotron Super 120B**, **Dots3 Note**, and **Free Router** allow immediate chatting without spending any money or requiring a credit card.
- **Optional Paid Scaling**: If you wish to use advanced reasoning models (e.g., `z-ai/glm-5.3-flash`, `DeepSeek V3.2`, etc.), you can optionally top up a small balance ($1–$5) on your OpenRouter/HF account. The app displays real-time token cost and your remaining credit balance automatically.

---

## Installation

### Method 1: Direct APK Sideload
1. Download `isaev.apk` (or `isaev-v1.0.0.apk`) from GitHub Releases.
2. Tap the downloaded APK in your Android File Manager.
3. If prompted, grant permission to "Install unknown apps".
4. Launch **ISAEV**, tap **Settings** (gear icon in the top right), and enter your OpenRouter or Hugging Face API key.

### Method 2: Reliable USB Installation via ADB
Some vendor systems (Oppo ColorOS, Xiaomi MIUI/HyperOS) may restrict sideloading through the file manager. The USB method bypasses these restrictions and displays true diagnostic error codes if something goes wrong:

1. On your phone: Go to **Settings > About Phone > Version**, tap **Build number** 7 times.
2. Go to **Settings > Additional Settings > Developer options**:
   - Enable **USB debugging**.
   - Enable **Install via USB**.
3. Connect the phone with a USB cable. On the popup prompt, check *"Always allow from this computer"* and tap OK.
4. On your computer:
   ```bash
   export ANDROID_HOME=/data/android-sdk  # Set your SDK path
   bash android/install-usb.sh
   ```
   The script detects your device, reports the Android version, installs `isaev.apk`, and launches the app automatically.

---

## How It Works

| Layer | Desktop Web | Android Standalone APK |
|---|---|---|
| **Backend** | Node.js + Express | `local-backend.js` (In-WebView Fetch Interceptor) |
| **Storage** | SQLite (`data/chat.db`) | IndexedDB (`isaev`) |
| **Files** | Local filesystem (`data/uploads`) | IndexedDB Blobs / Blob URLs |
| **Network** | Server → Provider API | Device → Provider API (Direct HTTPS) |

The user interface code (`app.js`, `styles.css`, `markdown.js`) is identical across both platforms.

---

## Security & BYOK (Bring Your Own Key)

- **Client-Side Keys**: API keys are saved locally in the device's secure `localStorage`.
- **Zero Telemetry**: Requests travel directly from your phone to OpenRouter / Hugging Face. No middleman servers exist.
- **Database Backup & Migration**: Easily export and restore your entire chat history via JSON through the in-app Settings modal.

---

## Building from Source in 3 Seconds (No Gradle)

This project compiles directly using native Android SDK command-line tools (`aapt2`, `javac`, `d8`, `zipalign`, `apksigner`), bypassing Gradle overhead:

```bash
export ANDROID_HOME=/data/android-sdk
bash android/build.sh
```

- **Output**: `isaev.apk` created in the project root.
- **Speed**: Compiles in ~2–3 seconds.
- **Signing**: Automatically generates a local release keystore (`android/isaev.keystore`) on the first run.
