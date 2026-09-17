package com.oxalpha.chat;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.speech.tts.TextToSpeech;
import java.util.Locale;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

/**
 * Ox Alpha Chat — Android kabugu.
 *
 * Butun arayuz ve mantik assets/www icindeki web uygulamasinda. Bu sinif
 * yalnizca uc is yapar:
 *   1. Varliklari sanal bir https:// adresinden sunar (file:// kullanilirsa
 *      IndexedDB ve fetch kisitlanir),
 *   2. Dosya secici penceresini WebView'a baglar,
 *   3. Geri tusunu WebView gecmisine baglar.
 */
public class MainActivity extends Activity {

  /** Varliklarin sunuldugu sanal alan adi; gercek bir sunucuya gitmez. */
  private static final String HOST = "appassets.androidplatform.net";
  private static final String BASE = "https://" + HOST + "/";
  private static final int FILE_CHOOSER_REQUEST = 1001;
  private static final int SPEECH_REQUEST = 1002;

  private WebView web;
  private ValueCallback<Uri[]> pendingFileCallback;
  private TextToSpeech tts;

  private static final Map<String, String> MIME = new HashMap<>();
  static {
    MIME.put("html", "text/html");
    MIME.put("js", "application/javascript");
    MIME.put("css", "text/css");
    MIME.put("json", "application/json");
    MIME.put("svg", "image/svg+xml");
    MIME.put("png", "image/png");
    MIME.put("jpg", "image/jpeg");
    MIME.put("webp", "image/webp");
    MIME.put("ico", "image/x-icon");
    MIME.put("woff2", "font/woff2");
  }

  @SuppressLint("SetJavaScriptEnabled")
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      getWindow().setStatusBarColor(Color.parseColor("#212121"));
      getWindow().setNavigationBarColor(Color.parseColor("#212121"));
    }

    web = new WebView(this);
    web.setLayoutParams(new ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    web.setBackgroundColor(Color.parseColor("#212121"));
    setContentView(web);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);          // localStorage + IndexedDB
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setAllowFileAccess(false);
    s.setAllowContentAccess(false);
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);
    s.setSupportZoom(false);
    s.setBuiltInZoomControls(false);
    s.setCacheMode(WebSettings.LOAD_NO_CACHE);

    CookieManager.getInstance().setAcceptCookie(true);

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
      WebView.setWebContentsDebuggingEnabled(true);
    }

    try {
      tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
        @Override
        public void onInit(int status) {
          if (status == TextToSpeech.SUCCESS && tts != null) {
            tts.setLanguage(new Locale("tr", "TR"));
          }
        }
      });
    } catch (Exception ignored) { }

    web.addJavascriptInterface(new Object() {
      @JavascriptInterface
      public void speak(String text) {
        if (tts != null && text != null) {
          if (tts.isSpeaking()) {
            tts.stop();
          } else {
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "OX_TTS");
          }
        }
      }
      @JavascriptInterface
      public void stop() {
        if (tts != null) tts.stop();
      }
      @JavascriptInterface
      public boolean isSpeaking() {
        return tts != null && tts.isSpeaking();
      }
      @JavascriptInterface
      public void setLang(String lang) {
        if (tts != null && lang != null) {
          Locale loc = new Locale("tr", "TR");
          if ("en".equals(lang)) loc = Locale.US;
          else if ("ru".equals(lang)) loc = new Locale("ru", "RU");
          else if ("de".equals(lang)) loc = Locale.GERMANY;
          try { tts.setLanguage(loc); } catch (Exception ignored) { }
        }
      }
    }, "AndroidTTS");

    web.addJavascriptInterface(new Object() {
      @JavascriptInterface
      public void startListening(final String lang) {
        runOnUiThread(new Runnable() {
          @Override
          public void run() {
            try {
              Intent intent = new Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
              intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                  android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
              String speechLang = "tr-TR";
              String prompt = "Konuşun...";
              if ("en".equals(lang)) { speechLang = "en-US"; prompt = "Listening..."; }
              else if ("ru".equals(lang)) { speechLang = "ru-RU"; prompt = "Слушаю..."; }
              else if ("de".equals(lang)) { speechLang = "de-DE"; prompt = "Sprechen Sie..."; }
              intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, speechLang);
              intent.putExtra(android.speech.RecognizerIntent.EXTRA_PROMPT, prompt);
              startActivityForResult(intent, SPEECH_REQUEST);
            } catch (Exception e) {
              if (web != null) {
                web.evaluateJavascript("window.onAndroidSTTError && window.onAndroidSTTError('" + e.getMessage() + "')", null);
              }
            }
          }
        });
      }
    }, "AndroidSTT");

    web.setWebViewClient(new WebViewClient() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (HOST.equals(url.getHost())) {
          WebResourceResponse res = serveAsset(url.getPath());
          if (res != null) return res;
        }
        return null; // digerleri normal aga gider (OpenRouter, HuggingFace)
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (HOST.equals(url.getHost())) return false;
        // Dis baglantilar tarayicida acilsin, uygulamanin icinde degil.
        try {
          startActivity(new Intent(Intent.ACTION_VIEW, url));
        } catch (Exception ignored) { }
        return true;
      }
    });

    web.setWebChromeClient(new WebChromeClient() {
      @Override
      public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                       FileChooserParams params) {
        if (pendingFileCallback != null) pendingFileCallback.onReceiveValue(null);
        pendingFileCallback = callback;
        try {
          Intent intent = params.createIntent();
          intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
          startActivityForResult(Intent.createChooser(intent, "Dosya seç"), FILE_CHOOSER_REQUEST);
          return true;
        } catch (Exception e) {
          pendingFileCallback = null;
          return false;
        }
      }

      @Override
      public boolean onConsoleMessage(ConsoleMessage m) {
        android.util.Log.d("OxAlpha", m.message() + " @" + m.lineNumber());
        return true;
      }
    });

    if (savedInstanceState == null) web.loadUrl(BASE + "index.html");
    else web.restoreState(savedInstanceState);
  }

  /** assets/www altindaki dosyayi sanal adresten sunar. */
  private WebResourceResponse serveAsset(String path) {
    if (path == null) return null;
    String clean = path.startsWith("/") ? path.substring(1) : path;
    if (clean.isEmpty()) clean = "index.html";
    if (clean.contains("..")) return null;

    try {
      InputStream in = getAssets().open("www/" + clean);
      String ext = clean.contains(".") ? clean.substring(clean.lastIndexOf('.') + 1) : "";
      String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
      WebResourceResponse res = new WebResourceResponse(mime, "utf-8", in);
      Map<String, String> headers = new HashMap<>();
      headers.put("Cache-Control", "no-store");
      res.setResponseHeaders(headers);
      return res;
    } catch (IOException e) {
      return null;
    }
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == SPEECH_REQUEST) {
      if (resultCode == Activity.RESULT_OK && data != null) {
        java.util.ArrayList<String> matches = data.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS);
        if (matches != null && !matches.isEmpty()) {
          String text = matches.get(0).replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ");
          if (web != null) {
            web.evaluateJavascript("window.onAndroidSTTResult && window.onAndroidSTTResult('" + text + "')", null);
          }
        }
      } else {
        if (web != null) {
          web.evaluateJavascript("window.onAndroidSTTStop && window.onAndroidSTTStop()", null);
        }
      }
      return;
    }

    if (requestCode != FILE_CHOOSER_REQUEST) {
      super.onActivityResult(requestCode, resultCode, data);
      return;
    }
    if (pendingFileCallback == null) return;

    Uri[] results = null;
    if (resultCode == Activity.RESULT_OK && data != null) {
      if (data.getClipData() != null) {
        int n = data.getClipData().getItemCount();
        results = new Uri[n];
        for (int i = 0; i < n; i++) results[i] = data.getClipData().getItemAt(i).getUri();
      } else if (data.getData() != null) {
        results = new Uri[] { data.getData() };
      }
    }
    pendingFileCallback.onReceiveValue(results);
    pendingFileCallback = null;
  }

  @Override
  public void onBackPressed() {
    if (web != null && web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }

  @Override
  protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    if (web != null) web.saveState(outState);
  }

  @Override
  protected void onDestroy() {
    if (tts != null) {
      try {
        tts.stop();
        tts.shutdown();
      } catch (Exception ignored) { }
      tts = null;
    }
    if (web != null) {
      ((ViewGroup) web.getParent()).removeView(web);
      web.destroy();
      web = null;
    }
    super.onDestroy();
  }
}
