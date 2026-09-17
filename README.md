<p align="center">
  <img src="docs/images/logo.png" width="128" height="128" alt="ISAEV Logo" style="border-radius: 28px;">
</p>

# ISAEV — Private, Standalone AI Client for Web & Android

ISAEV is a minimalist, privacy-first AI client engineered for direct interaction with modern large language models via **OpenRouter** and **Hugging Face**. Built with a local-first philosophy, ISAEV eliminates third-party telemetry, tracking, and intermediate servers.

[🇹🇷 Türkçe Dokümantasyon için tıklayın](Turkish/README.md)

---

## Free-Tier First, With Optional Paid Scaling

ISAEV was built primarily to unleash the power of **100% free AI models**:
- **Zero Cost, Zero Subscriptions**: Models such as **Ling 3.0 Flash**, **Nemotron Super 120B**, **Dots3 Note**, **North Mini Code**, and **Free Router** allow immediate chatting, coding, and document analysis without entering a credit card or paying a dime.
- **Optional Paid Models**: If you want state-of-the-art reasoning, ultra-fast generation, or massive context windows, you can optionally top up a small balance ($1–$5) on OpenRouter or Hugging Face to unlock premium models (such as **GLM-5.3 Flash**, **DeepSeek V3.2**, etc.) seamlessly. The app displays token consumption and live remaining account balance in real-time.

---

## Screenshot Showcase

All screenshots are captured directly from the standalone Android build running on device.

| 1. Clean Home & Branding | 2. Grouped Model Picker |
|:---:|:---:|
| ![Home Screen](docs/images/01_home_screen.png) | ![Model Picker](docs/images/02_model_picker.png) |
| *Minimalist home interface with prompt templates and model indicator.* | *Live model list grouped by provider with context limits and web search badges.* |

| 3. Code Generation & Artifact Action | 4. Interactive Live Code Preview |
|:---:|:---:|
| ![Flappy Bird Chat](docs/images/03_flappy_bird_chat.png) | ![Flappy Bird Game](docs/images/04_flappy_bird_game.png) |
| *Prompt conversation with reasoning collapsible, cost metrics, and centered Preview button.* | *Live single-file Flappy Bird game running inside the isolated sandbox modal.* |

| 5. Responsive Web App Preview | 6. Sidebar & History |
|:---:|:---:|
| ![Brand Website Preview](docs/images/05_isaev_brand_preview.png) | ![Sidebar History](docs/images/06_sidebar_history.png) |
| *Interactive luxury brand website rendered with full scroll and navigation support.* | *Chronological conversation history, active model chip, and OpenRouter balance pill.* |

| 7. Settings & BYOK Architecture | 8. Composer & Multimodal Inputs |
|:---:|:---:|
| ![Settings Modal](docs/images/07_settings_modal.png) | ![Composer Features](docs/images/08_composer_features.png) |
| *Bring Your Own Key (OpenRouter & HF), language selector, custom persona, backup/restore.* | *Expanded input options: file attachments, web search toggle, voice speech-to-text.* |

---

## Key Features

### 1. Dual Runtime Architecture
- **Desktop Web**: Fast Node.js + Express service with SQLite database (`data/chat.db`) and disk-based file caching.
- **Android Standalone**: Operates completely autonomously inside the Android WebView. Intercepts `/api/*` endpoints client-side using `local-backend.js`, storing chats and attachments directly in IndexedDB.

### 2. Bring Your Own Key (BYOK) & Privacy
- Zero analytics, zero usage telemetry, and zero intermediate logging.
- Store your API keys in `.env` for self-hosted instances, or enter them directly inside the in-app **Settings** modal (`localStorage`).
- Automatic failover: configure multiple comma-separated keys in OpenRouter to rotate seamlessly on rate limits (`429`), authorization errors (`401`), or credit exhaustion (`402`).

### 3. Interactive Code Sandbox (Artifacts)
- Generates fully self-contained, single-file HTML/CSS/JavaScript applications and games.
- Execute and interact with generated code in real time via a centered **Preview** button.
- Built-in touch event normalization allows games and web applications to be played smoothly on mobile touchscreens as well as desktop keyboards.

### 4. Grouped Model Selection with Web Support Indicators
- Unifies models from **OpenRouter** and **Hugging Face Router**.
- Cleanly categorizes models by vendor with token context sizes (e.g., 256K, 512K, 1M).
- Visual status indicators show whether the selected model supports live web search grounding.

### 5. Multilingual Native Interface & Conversational Matching
- Instant UI switching across 4 languages: **English**, **Türkçe**, **Русский**, and **Deutsch**.
- Context-aware system prompt automatically detects the language of the user prompt and replies in that exact language.

### 6. Multimodal Capabilities & Tools
- **Document & Image Analysis**: Attach images, PDFs, text files, and Word documents (`.docx`).
- **Live Web Search**: Toggle real-time search grounding with query inspection.
- **Voice Speech-to-Text (STT)**: Direct microphone dictation utilizing standard browser and native Android speech engines.
- **Data Portability**: One-click JSON backup export and import to migrate entire chat databases between mobile and desktop.

---

## Architectural Comparison

| Dimension | Desktop Web | Android Standalone APK |
|---|---|---|
| **Backend Engine** | Node.js + Express | `local-backend.js` (In-WebView Fetch Interceptor) |
| **Database** | SQLite (`data/chat.db`) | Browser IndexedDB (`isaev`) |
| **File Storage** | Local Disk (`data/uploads`) | IndexedDB Blobs / Blob URLs |
| **API Connectivity** | Server → Provider API | Mobile Device → Provider API (Direct HTTPS) |
| **Prerequisites** | Node.js 18+ | None (Install standalone APK) |
| **Portability** | Multi-platform (Browser) | Android 7.0+ (API Level 24+) |

---

## Desktop Quickstart

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/swartz13/self-ai-chat-app-isaev.git
   cd self-ai-chat-app-isaev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to supply your API keys:
   ```env
   OPENROUTER_API_KEYS=sk-or-v1-your-key-here
   HF_API_KEY=hf_your-huggingface-key-here
   PORT=3000
   ```
   *(Note: You can also leave `.env` empty and enter keys directly in the application Settings modal).*

4. Start the server:
   ```bash
   npm start
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Android Standalone App

The Android version requires **no background server**. Your device communicates directly with OpenRouter and Hugging Face.

### Method 1: Sideloading Prebuilt APK
1. Download the latest `isaev.apk` (or `isaev-v1.0.0.apk`) from the GitHub Releases section.
2. Transfer the APK to your device or download directly on your phone.
3. Tap the file in your Android File Manager. When prompted, allow installation from unknown sources.
4. Launch **ISAEV**, tap the **Settings** (gear) icon in the top bar, and paste your API key.

### Method 2: One-Click USB Installation via ADB
For devices with strict sideload restrictions (e.g., ColorOS, MIUI):
1. Enable **Developer Options** on your phone:
   - Navigate to **Settings > About Phone > Version**.
   - Tap **Build Number** 7 times.
2. Under **Developer Options**, enable **USB Debugging** and **Install via USB**.
3. Connect your phone via USB cable and authorize the computer.
4. Run the install script:
   ```bash
   export ANDROID_HOME=/path/to/android-sdk
   bash android/install-usb.sh
   ```

### Method 3: Building APK from Source in 3 Seconds (No Gradle)
This project features a custom build script that bypasses Gradle completely, invoking Android SDK build tools directly (`aapt2`, `javac`, `d8`, `zipalign`, `apksigner`). It builds a fully signed APK in under 3 seconds:

```bash
export ANDROID_HOME=/data/android-sdk  # Set your Android SDK path
bash android/build.sh
```

- **Output**: `isaev.apk` generated in the root directory.
- **Build Tools**: Tested with Build-Tools `35.0.0` and Target SDK `34`.
- **Signing**: Automatically creates a local release keystore (`android/isaev.keystore`) if none exists.

---

## Security & Data Privacy

- **Local Storage First**: Conversations, settings, and uploaded files are saved exclusively on your local device (in SQLite on desktop or IndexedDB on mobile).
- **Zero Intermediaries**: Your API requests travel directly between your client and OpenRouter / Hugging Face via encrypted HTTPS.
- **No Secret Leakage**: The repository contains no hardcoded private keys or environment variables. All keys are managed via `.env` or in-app local storage.

---

## License

This project is open-source under the [ISC License](LICENSE).
