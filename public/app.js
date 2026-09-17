/* ===================================================================
   Berk AI - istemci mantığı
   =================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  const el = {
    app: $('app'), sidebar: $('sidebar'), scrim: $('scrim'),
    history: $('history'), searchInput: $('searchInput'),
    newChatBtn: $('newChatBtn'), collapseBtn: $('collapseBtn'),
    openSidebarBtn: $('openSidebarBtn'), clearAllBtn: $('clearAllBtn'),
    thread: $('thread'), threadScroll: $('threadScroll'), toBottomBtn: $('toBottomBtn'),
    welcome: $('welcome'), suggestions: $('suggestions'),
    welcomeTitle: $('welcomeTitle'), welcomeSub: $('welcomeSub'),
    sugDoc: $('sugDoc'), sugDocTitle: $('sugDocTitle'), sugDocDesc: $('sugDocDesc'),
    sugImg: $('sugImg'), sugImgTitle: $('sugImgTitle'), sugImgDesc: $('sugImgDesc'),
    sugGen: $('sugGen'), sugGenTitle: $('sugGenTitle'), sugGenDesc: $('sugGenDesc'),
    sugCode: $('sugCode'), sugCodeTitle: $('sugCodeTitle'), sugCodeDesc: $('sugCodeDesc'),
    chatTitle: $('chatTitle'), modelName: $('modelName'), modelChip: $('modelChip'),
    balanceChip: $('balanceChip'), balanceVal: $('balanceVal'),
    themeBtn: $('themeBtn'), exportBtn: $('exportBtn'), settingsBtn: $('settingsBtn'),
    micBtn: $('micBtn'),
    input: $('input'), sendBtn: $('sendBtn'), webSearchBtn: $('webSearchBtn'),
    fileInput: $('fileInput'), attachments: $('attachments'),
    plusBtn: $('plusBtn'), plusMenu: $('plusMenu'),
    menuUpload: $('menuUpload'), menuUploadTitle: $('menuUploadTitle'), menuUploadDesc: $('menuUploadDesc'),
    menuImage: $('menuImage'), menuImageTitle: $('menuImageTitle'), menuImageDesc: $('menuImageDesc'),
    pickerBtn: $('pickerBtn'), pickerMenu: $('pickerMenu'),
    pickerHeadModel: $('pickerHeadModel'), pickerHeadEffort: $('pickerHeadEffort'),
    pickerMark: $('pickerMark'), pickerName: $('pickerName'), pickerSub: $('pickerSub'),
    modelList: $('modelList'), effortList: $('effortList'),
    welcomeMark: $('welcomeMark'),
    notice: $('notice'), composer: $('composer'), disclaimer: $('disclaimer'),
    lightbox: $('lightbox'), lightboxImg: $('lightboxImg'),
    settingsModal: $('settingsModal'), modalTitle: $('modalTitle'), closeSettingsBtn: $('closeSettingsBtn'),
    saveSettingsBtn: $('saveSettingsBtn'), settingLanguage: $('settingLanguage'),
    settingUserName: $('settingUserName'), settingCustomInstructions: $('settingCustomInstructions'),
    settingCustomApiKey: $('settingCustomApiKey'), settingCustomHfKey: $('settingCustomHfKey'),
    settingWebSearchDefault: $('settingWebSearchDefault'),
    settingsCreditsVal: $('settingsCreditsVal'), settingsUsageRow: $('settingsUsageRow'),
    settingsUsageVal: $('settingsUsageVal'), exportAllChatsBtn: $('exportAllChatsBtn'),
    artifactModal: $('artifactModal'), artifactTitle: $('artifactTitle'), artifactIframe: $('artifactIframe'),
    reloadArtifactBtn: $('reloadArtifactBtn'), closeArtifactBtn: $('closeArtifactBtn'),
    lblSettingLang: $('lblSettingLang'), lblSettingUserName: $('lblSettingUserName'), tipSettingUserName: $('tipSettingUserName'),
    lblSettingCustomInstructions: $('lblSettingCustomInstructions'), tipSettingCustomInstructions: $('tipSettingCustomInstructions'),
    lblSettingApiKey: $('lblSettingApiKey'), tipSettingApiKey: $('tipSettingApiKey'),
    lblSettingHfApiKey: $('lblSettingHfApiKey'), tipSettingHfApiKey: $('tipSettingHfApiKey'),
    lblWebSearchDefault: $('lblWebSearchDefault'), lblSecBalance: $('lblSecBalance'),
    lblRemainingCredits: $('lblRemainingCredits'), lblTotalUsage: $('lblTotalUsage'), tipBalanceNotice: $('tipBalanceNotice'),
    lblSecBackup: $('lblSecBackup'), lblExportJson: $('lblExportJson'), lblImportJson: $('lblImportJson'),
  };

  const I18N = {
    tr: {
      newChat: 'Yeni sohbet', searchPlaceholder: 'Sohbetlerde ara', clearAllHistory: 'Tüm geçmişi sil',
      exportMarkdown: 'Sohbeti indir (Markdown)', settingsTitle: 'Ayarlar ve Kişiselleştirme',
      closeModal: 'Kapat', inputPlaceholder: 'Mesaj yaz…', webSearchTitle: 'Web Araması (İnternetten canlı bilgi)',
      micTitle: 'Sesle Yazdır (Mikrofon)', sendTitle: 'Gönder', stopTitle: 'Durdur',
      disclaimer: 'Yapay zeka hata yapabilir. Önemli bilgileri doğrulayın.',
      langLabel: 'Arayüz Dili (Language)', userNameLabel: 'Adınız / Hitap Şekli',
      userNameTip: 'Yapay zeka size bu isimle hitap eder.', userNamePlaceholder: 'Örn: Berk',
      customInstructionsLabel: 'Kişiselleştirilmiş Talimatlar (Sistem İsteği)',
      customInstructionsTip: 'Tüm sohbetlerde modele arka planda iletilen kalıcı yönergelerdir.',
      customInstructionsPlaceholder: 'Örn: Cevapları doğrudan ve net ver, gereksiz nezaket cümleleri kurma.',
      apiKeyLabel: 'OpenRouter API Anahtarı',
      apiKeyTip: 'OpenRouter modelleri için kullanılır. Sadece cihazınızda güvenle saklanır.',
      hfApiKeyLabel: 'HuggingFace API Anahtarı',
      hfApiKeyTip: 'HuggingFace modelleri için kullanılır. Sadece cihazınızda güvenle saklanır.',
      webSearchDefault: 'Web aramasını varsayılan olarak açık tut',
      balanceSection: 'Hesap ve Bakiye Durumu', remainingCredits: 'OpenRouter Kalan Bakiye:',
      totalUsage: 'Toplam Kullanım:', balanceNotice: 'Bakiye yetersizse görsel üretimi ve ücretli modeller çalışmayabilir.',
      backupSection: 'Yedekleme ve İçe Aktarma', exportJson: 'Tüm Sohbetleri Yedekle (JSON)', importJson: 'Yedeği Geri Yükle (JSON)',
      save: 'Kaydet', preview: 'Önizle', copy: 'Kopyala', copied: 'Kopyalandı!', readAloud: 'Sesli oku',
      regenerate: 'Yeniden üret', retry: 'Tekrar dene', today: 'Bugün', yesterday: 'Dün',
      last7Days: 'Son 7 gün', last30Days: 'Son 30 gün', older: 'Daha eski', pinned: 'Sabitlenenler',
      noMatchingChats: 'Eşleşen sohbet yok.', noChatsYet: 'Henüz sohbet yok.', free: 'Ücretsiz',
      context: 'bağlam', vision: 'görsel okur', webSupported: 'Web Arama Destekleniyor', webUnsupported: 'Web Arama Desteklenmiyor',
      webIncompatibleNotice: 'Seçili model ({model}) web aramasını desteklemiyor. Web arama OpenRouter modellerinde çalışır.',
      webActiveNotice: 'Web arama devrede: Model internetten canlı bilgi arayacaktır.',
      webInactiveNotice: 'Web arama kapatıldı.',
      importSuccess: 'Yedek başarıyla yüklendi: {c} sohbet, {m} mesaj geri yüklendi.',
      importError: 'Yedek yükleme hatası: Dosya geçersiz.',
      sttListening: 'Dinleniyor... Konuşun.', sttError: 'Ses algılanamadı',
      welcomeTitle: 'Bugün ne yapalım?',
      sugDocTitle: 'Belge analizi', sugDocDesc: 'PDF veya Word yükle, özet ve bulguları çıkar',
      sugDocPrompt: 'Bir PDF yükleyeceğim; içindeki ana bulguları, sayıları ve varsa çelişkileri madde madde çıkar.',
      sugImgTitle: 'Görsel inceleme', sugImgDesc: 'Fotoğraf veya ekran görüntüsü üzerinde analiz',
      sugImgPrompt: 'Bir ekran görüntüsü yükleyeceğim; arayüzdeki sorunları ve iyileştirme önerilerini listele.',
      sugGenTitle: 'Görsel üret', sugGenDesc: 'Açıklamadan yeni bir görsel oluştur',
      sugGenPrompt: 'Gün batımında sisli bir dağ gölü, izometrik minyatür diorama tarzında, sıcak turuncu ve derin mavi tonları',
      sugCodeTitle: 'Kod yaz', sugCodeDesc: 'Uzun soluklu mühendislik işlerinde güçlü',
      sugCodePrompt: 'Python ile bir CSV dosyasını okuyup eksik değerleri dolduran, aykırı değerleri işaretleyen ve özet rapor üreten bir betik yaz.',
      menuUploadTitle: 'Dosya yükle', menuUploadDesc: 'Fotoğraf, PDF, Word, video, kod…',
      menuImageTitle: 'Görsel üret', menuImageDesc: 'Açıklamandan yeni görsel oluştur',
      pickerHeadModel: 'Model', pickerHeadEffort: 'Yanıt derinliği',
      thinking: 'Düşünüyor…', thoughtProcess: 'Düşünce süreci', copyFailed: 'Kopyalanamadı — tarayıcı izin vermedi.',
      effortLow: 'Hızlı', effortLowDesc: 'En az düşünme, en hızlı yanıt',
      effortHigh: 'Dengeli', effortHighDesc: 'Çoğu iş için yeterli',
      effortMax: 'Derin', effortMaxDesc: 'En çok düşünme, en yavaş',
      textLang: 'metin', artifactTitle: '👁️ Canlı Kod Önizleme (Artifact)', reloadPreview: 'Yeniden Başlat',
      openSidebar: 'Kenar çubuğunu aç', collapseSidebar: 'Kenar çubuğunu daralt',
      toggleTheme: 'Temayı değiştir', scrollToBottom: 'En alta in',
      plusButton: 'Ekle', pickerTitle: 'Model ve yanıt derinliği', activeModelTitle: 'Etkin model',
      pin: 'Sabitle', unpin: 'Sabitlemeyi kaldır', rename: 'Yeniden adlandır', delete: 'Sil',
      confirmDeleteChat: '"{title}" silinsin mi?', confirmClearAllHistory: 'Tüm sohbet geçmişi kalıcı olarak silinsin mi?',
      noMessagesToExport: 'Dışa aktarılacak mesaj yok.', chatExportedMarkdown: 'Sohbet Markdown olarak indirildi.',
      noChatsToBackup: 'Yedeklenecek sohbet bulunamadı.', allChatsBackupSuccess: 'Tüm sohbetler JSON olarak yedeklendi.',
      backupFailed: 'Yedekleme başarısız', chatOpenFailed: 'Sohbet açılamadı',
      uploading: 'yükleniyor…', remove: 'Kaldır', uploadFailed: 'Yükleme başarısız',
      promptRequiredForImage: 'Görsel için bir açıklama yazın.', generatingImage: 'Görsel üretiliyor',
      imageModePlaceholder: 'Görseli anlat…', imageModeDisclaimer: 'Görsel üretme modu açık · {model}',
      generatedImageAlt: 'Üretilen görsel',
      imageCreditExhausted: 'Görsel üretimi ücretli bir modele gidiyor ve OpenRouter bakiyeniz tükendi. openrouter.ai/credits üzerinden kredi ekleyince çalışır. Sohbet modelleri bedava.',
      ttsUnsupported: 'Tarayıcınız sesli okumayı desteklemiyor.', codeBlockSpeech: 'kod bloğu.',
      temporaryError: 'Geçici hata: ', errorPrefix: 'Hata: ', requestFailed: 'İstek başarısız',
      serverConnectError: 'Sunucuya bağlanılamadı', configLoadError: 'Sunucu yapılandırması okunamadı',
      balanceUndefined: 'Ücretsiz / Tanımsız', balanceTip: 'Bakiye bilgisi alınamadı veya ücretsiz katman',
      balanceRemainingTip: 'Kalan OpenRouter Kredisi: {amount}\nAyarları açmak için tıklayın',
      tokenUsageTip: 'Girdi: {prompt} · Çıktı: {completion} token',
      createdDate: 'Oluşturulma', you: 'Siz', codeAppFallbackTitle: 'Web Uygulaması / Oyun',
    },
    en: {
      newChat: 'New chat', searchPlaceholder: 'Search chats', clearAllHistory: 'Clear all history',
      exportMarkdown: 'Download chat (Markdown)', settingsTitle: 'Settings & Personalization',
      closeModal: 'Close', inputPlaceholder: 'Type a message…', webSearchTitle: 'Web Search (Live web info)',
      micTitle: 'Voice Typing (Microphone)', sendTitle: 'Send', stopTitle: 'Stop',
      disclaimer: 'AI can make mistakes. Verify important info.',
      langLabel: 'Interface Language', userNameLabel: 'Your Name / Salutation',
      userNameTip: 'The AI will address you by this name.', userNamePlaceholder: 'e.g., Berk',
      customInstructionsLabel: 'Custom Instructions (System Prompt)',
      customInstructionsTip: 'Permanent instructions passed to the AI in all chats.',
      customInstructionsPlaceholder: 'e.g., Be direct and concise, avoid pleasantries.',
      apiKeyLabel: 'OpenRouter API Key',
      apiKeyTip: 'Used for OpenRouter models. Stored safely on your device only.',
      hfApiKeyLabel: 'HuggingFace API Key',
      hfApiKeyTip: 'Used for HuggingFace models. Stored safely on your device only.',
      webSearchDefault: 'Keep web search enabled by default',
      balanceSection: 'Account & Credit Status', remainingCredits: 'OpenRouter Remaining Balance:',
      totalUsage: 'Total Usage:', balanceNotice: 'If balance is insufficient, image generation and paid models may fail.',
      backupSection: 'Backup & Restore', exportJson: 'Backup All Chats (JSON)', importJson: 'Restore Backup (JSON)',
      save: 'Save', preview: 'Preview', copy: 'Copy', copied: 'Copied!', readAloud: 'Read aloud',
      regenerate: 'Regenerate', retry: 'Retry', today: 'Today', yesterday: 'Yesterday',
      last7Days: 'Previous 7 days', last30Days: 'Previous 30 days', older: 'Older', pinned: 'Pinned',
      noMatchingChats: 'No matching chats.', noChatsYet: 'No chats yet.', free: 'Free',
      context: 'context', vision: 'vision', webSupported: 'Web Search Supported', webUnsupported: 'Web Search Unsupported',
      webIncompatibleNotice: 'Selected model ({model}) does not support web search. Web search works on OpenRouter models.',
      webActiveNotice: 'Web search enabled: Model will search the live web.',
      webInactiveNotice: 'Web search disabled.',
      importSuccess: 'Backup restored: {c} chats, {m} messages restored.',
      importError: 'Import failed: Invalid JSON file.',
      sttListening: 'Listening... Speak now.', sttError: 'Speech recognition failed',
      welcomeTitle: 'How can I help you today?',
      sugDocTitle: 'Document analysis', sugDocDesc: 'Review PDF or Word, extract summaries and findings',
      sugDocPrompt: 'I will upload a PDF; extract key findings, figures, and any discrepancies bullet by bullet.',
      sugImgTitle: 'Image analysis', sugImgDesc: 'Analyze photos or screenshots in detail',
      sugImgPrompt: 'I will upload a screenshot; identify UI issues and suggest concrete improvements.',
      sugGenTitle: 'Generate image', sugGenDesc: 'Create a brand new image from description',
      sugGenPrompt: 'Misty mountain lake at sunset, isometric miniature diorama style, warm orange and deep blue tones',
      sugCodeTitle: 'Write code', sugCodeDesc: 'Strong capability for software engineering tasks',
      sugCodePrompt: 'Write a Python script that reads a CSV file, fills missing values, flags outliers, and generates a summary report.',
      menuUploadTitle: 'Upload file', menuUploadDesc: 'Photo, PDF, Word, video, code…',
      menuImageTitle: 'Generate image', menuImageDesc: 'Create new image from your prompt',
      pickerHeadModel: 'Model', pickerHeadEffort: 'Reasoning effort',
      thinking: 'Thinking…', thoughtProcess: 'Thought process', copyFailed: 'Could not copy — permission denied.',
      effortLow: 'Fast', effortLowDesc: 'Minimal thinking, fastest response',
      effortHigh: 'Balanced', effortHighDesc: 'Sufficient for most tasks',
      effortMax: 'Deep', effortMaxDesc: 'Maximum thinking, slower response',
      textLang: 'text', artifactTitle: '👁️ Live Code Preview (Artifact)', reloadPreview: 'Restart Preview',
      openSidebar: 'Open sidebar', collapseSidebar: 'Collapse sidebar',
      toggleTheme: 'Toggle theme', scrollToBottom: 'Scroll to bottom',
      plusButton: 'Add', pickerTitle: 'Model & reasoning effort', activeModelTitle: 'Active model',
      pin: 'Pin', unpin: 'Unpin', rename: 'Rename', delete: 'Delete',
      confirmDeleteChat: 'Delete "{title}"?', confirmClearAllHistory: 'Delete all chat history permanently?',
      noMessagesToExport: 'No messages to export.', chatExportedMarkdown: 'Chat exported as Markdown.',
      noChatsToBackup: 'No chats found to backup.', allChatsBackupSuccess: 'All chats backed up as JSON.',
      backupFailed: 'Backup failed', chatOpenFailed: 'Failed to open chat',
      uploading: 'uploading…', remove: 'Remove', uploadFailed: 'Upload failed',
      promptRequiredForImage: 'Please enter a description for the image.', generatingImage: 'Generating image',
      imageModePlaceholder: 'Describe the image…', imageModeDisclaimer: 'Image generation mode active · {model}',
      generatedImageAlt: 'Generated image',
      imageCreditExhausted: 'Image generation requires paid credits and your OpenRouter balance is depleted. Add credits at openrouter.ai/credits. Text chat models remain free.',
      ttsUnsupported: 'Your browser does not support text-to-speech.', codeBlockSpeech: 'code block.',
      temporaryError: 'Temporary error: ', errorPrefix: 'Error: ', requestFailed: 'Request failed',
      serverConnectError: 'Could not connect to server', configLoadError: 'Could not load server configuration',
      balanceUndefined: 'Free / Undefined', balanceTip: 'Balance info unavailable or free tier',
      balanceRemainingTip: 'Remaining OpenRouter Credits: {amount}\nClick to open settings',
      tokenUsageTip: 'Prompt: {prompt} · Completion: {completion} tokens',
      createdDate: 'Created', you: 'You', codeAppFallbackTitle: 'Web App / Game',
    },
    ru: {
      newChat: 'Новый чат', searchPlaceholder: 'Поиск по чатам', clearAllHistory: 'Очистить всю историю',
      exportMarkdown: 'Скачать чат (Markdown)', settingsTitle: 'Настройки и персонализация',
      closeModal: 'Закрыть', inputPlaceholder: 'Введите сообщение…', webSearchTitle: 'Поиск в интернете',
      micTitle: 'Голосовой ввод (Микрофон)', sendTitle: 'Отправить', stopTitle: 'Остановить',
      disclaimer: 'ИИ может ошибаться. Проверяйте важную информацию.',
      langLabel: 'Язык интерфейса', userNameLabel: 'Ваше имя / Обращение',
      userNameTip: 'ИИ будет обращаться к вам по этому имени.', userNamePlaceholder: 'Напр.: Берк',
      customInstructionsLabel: 'Пользовательские инструкции (Системный промпт)',
      customInstructionsTip: 'Постоянные указания, передаваемые ИИ во всех чатах.',
      customInstructionsPlaceholder: 'Напр.: Отвечай прямо и кратко, без лишних вводных слов.',
      apiKeyLabel: 'Ключ OpenRouter API',
      apiKeyTip: 'Для моделей OpenRouter. Хранится только на вашем устройстве.',
      hfApiKeyLabel: 'Ключ HuggingFace API',
      hfApiKeyTip: 'Для моделей HuggingFace. Хранится только на вашем устройстве.',
      webSearchDefault: 'Включать веб-поиск по умолчанию',
      balanceSection: 'Аккаунт и баланс', remainingCredits: 'Остаток на OpenRouter:',
      totalUsage: 'Использовано:', balanceNotice: 'При нехватке баланса платные модели могут быть недоступны.',
      backupSection: 'Резервное копирование и восстановление', exportJson: 'Экспорт всех чатов (JSON)', importJson: 'Восстановить из файла (JSON)',
      save: 'Сохранить', preview: 'Просмотр', copy: 'Копировать', copied: 'Скопировано!', readAloud: 'Озвучить',
      regenerate: 'Перегенерировать', retry: 'Повторить', today: 'Сегодня', yesterday: 'Вчера',
      last7Days: 'Предыдущие 7 дней', last30Days: 'Предыдущие 30 дней', older: 'Ранее', pinned: 'Закрепленные',
      noMatchingChats: 'Чатов не найдено.', noChatsYet: 'Пока нет чатов.', free: 'Бесплатно',
      context: 'контекст', vision: 'зрение', webSupported: 'Веб-поиск поддерживается', webUnsupported: 'Веб-поиск не поддерживается',
      webIncompatibleNotice: 'Модель ({model}) не поддерживает веб-поиск.',
      webActiveNotice: 'Веб-поиск включён: модель ищет в интернете.',
      webInactiveNotice: 'Веб-поиск выключен.',
      importSuccess: 'Резервная копия восстановлена: {c} чатов, {m} сообщений.',
      importError: 'Ошибка восстановления: неверный файл.',
      sttListening: 'Слушаю... Говорите.', sttError: 'Не удалось распознать речь',
      welcomeTitle: 'Чем могу помочь сегодня?',
      sugDocTitle: 'Анализ документов', sugDocDesc: 'Загрузите PDF или Word, выделите тезисы и выводы',
      sugDocPrompt: 'Я загружу PDF-файл; выдели по пунктам ключевые выводы, цифры и возможные противоречия.',
      sugImgTitle: 'Анализ изображений', sugImgDesc: 'Подробный анализ фото или скриншотов',
      sugImgPrompt: 'Я загружу скриншот интерфейса; выяви ошибки и предложи конкретные улучшения.',
      sugGenTitle: 'Создать изображение', sugGenDesc: 'Создание нового изображения по текстовому описанию',
      sugGenPrompt: 'Туманное горное озеро на закате, изометрическая миниатюрная диорама, тёплые оранжевые и глубокие синие тона',
      sugCodeTitle: 'Написать код', sugCodeDesc: 'Высокая точность в решении инженерных задач',
      sugCodePrompt: 'Напиши скрипт на Python, который считывает CSV-файл, заполняет пропуски, отмечает аномалии и строит сводный отчет.',
      menuUploadTitle: 'Загрузить файл', menuUploadDesc: 'Фото, PDF, Word, видео, код…',
      menuImageTitle: 'Создать картинку', menuImageDesc: 'Создать новое изображение по описанию',
      pickerHeadModel: 'Модель', pickerHeadEffort: 'Глубина мышления',
      thinking: 'Думает…', thoughtProcess: 'Ход мыслей', copyFailed: 'Не удалось скопировать — нет разрешения.',
      effortLow: 'Быстрый', effortLowDesc: 'Минимум размышлений, быстрый ответ',
      effortHigh: 'Сбалансированный', effortHighDesc: 'Подходит для большинства задач',
      effortMax: 'Глубокий', effortMaxDesc: 'Максимум рассуждений, медленнее',
      textLang: 'текст', artifactTitle: '👁️ Живой просмотр кода (Artifact)', reloadPreview: 'Перезапустить',
      openSidebar: 'Открыть боковую панель', collapseSidebar: 'Свернуть боковую панель',
      toggleTheme: 'Переключить тему', scrollToBottom: 'Прокрутить вниз',
      plusButton: 'Добавить', pickerTitle: 'Модель и глубина рассуждений', activeModelTitle: 'Активная модель',
      pin: 'Закрепить', unpin: 'Открепить', rename: 'Переименовать', delete: 'Удалить',
      confirmDeleteChat: 'Удалить "{title}"?', confirmClearAllHistory: 'Удалить всю историю чатов навсегда?',
      noMessagesToExport: 'Нет сообщений для экспорта.', chatExportedMarkdown: 'Чат экспортирован в Markdown.',
      noChatsToBackup: 'Не найдено чатов для резервного копирования.', allChatsBackupSuccess: 'Все чаты сохранены в JSON.',
      backupFailed: 'Сбой резервного копирования', chatOpenFailed: 'Не удалось открыть чат',
      uploading: 'загрузка…', remove: 'Удалить', uploadFailed: 'Загрузка не удалась',
      promptRequiredForImage: 'Введите описание для изображения.', generatingImage: 'Генерация изображения',
      imageModePlaceholder: 'Опишите изображение…', imageModeDisclaimer: 'Режим генерации изображений · {model}',
      generatedImageAlt: 'Сгенерированное изображение',
      imageCreditExhausted: 'Генерация изображений требует платного баланса OpenRouter. Пополните счет на openrouter.ai/credits. Текстовые модели бесплатны.',
      ttsUnsupported: 'Ваш браузер не поддерживает озвучивание текста.', codeBlockSpeech: 'блок кода.',
      temporaryError: 'Временная ошибка: ', errorPrefix: 'Ошибка: ', requestFailed: 'Запрос не удался',
      serverConnectError: 'Не удалось подключиться к серверу', configLoadError: 'Не удалось загрузить конфигурацию сервера',
      balanceUndefined: 'Бесплатно / Не определен', balanceTip: 'Информация о балансе недоступна или бесплатный уровень',
      balanceRemainingTip: 'Остаток кредитов OpenRouter: {amount}\nНажмите для открытия настроек',
      tokenUsageTip: 'Вход: {prompt} · Выход: {completion} токенов',
      createdDate: 'Создано', you: 'Вы', codeAppFallbackTitle: 'Веб-приложение / Игра',
    },
    de: {
      newChat: 'Neuer Chat', searchPlaceholder: 'Chats durchsuchen', clearAllHistory: 'Gesamten Verlauf löschen',
      exportMarkdown: 'Chat herunterladen (Markdown)', settingsTitle: 'Einstellungen & Personalisierung',
      closeModal: 'Schließen', inputPlaceholder: 'Nachricht eingeben…', webSearchTitle: 'Websuche (Live-Internetdaten)',
      micTitle: 'Spracheingabe (Mikrofon)', sendTitle: 'Senden', stopTitle: 'Stoppen',
      disclaimer: 'KI kann Fehler machen. Wichtige Angaben überprüfen.',
      langLabel: 'Oberflächensprache', userNameLabel: 'Ihr Name / Anrede',
      userNameTip: 'Die KI spricht Sie mit diesem Namen an.', userNamePlaceholder: 'z.B. Berk',
      customInstructionsLabel: 'Benutzerdefinierte Anweisungen (System-Prompt)',
      customInstructionsTip: 'Dauerhafte Anweisungen für alle Unterhaltungen.',
      customInstructionsPlaceholder: 'z.B. Antworte direkt und präzise, verzichte auf Höflichkeitsfloskeln.',
      apiKeyLabel: 'OpenRouter API-Schlüssel',
      apiKeyTip: 'Wird für OpenRouter-Modelle verwendet. Bleibt sicher auf dem Gerät.',
      hfApiKeyLabel: 'HuggingFace API-Schlüssel',
      hfApiKeyTip: 'Wird für HuggingFace-Modelle verwendet. Bleibt sicher auf dem Gerät.',
      webSearchDefault: 'Websuche standardmäßig aktivieren',
      balanceSection: 'Konto- und Guthabenstatus', remainingCredits: 'Verbleibendes OpenRouter-Guthaben:',
      totalUsage: 'Gesamtnutzung:', balanceNotice: 'Bei unzureichendem Guthaben schlagen kostenpflichtige Modelle fehl.',
      backupSection: 'Sicherung & Wiederherstellung', exportJson: 'Alle Chats sichern (JSON)', importJson: 'Sicherung wiederherstellen (JSON)',
      save: 'Speichern', preview: 'Vorschau', copy: 'Kopieren', copied: 'Kopiert!', readAloud: 'Vorlesen',
      regenerate: 'Neu generieren', retry: 'Wiederholen', today: 'Heute', yesterday: 'Gestern',
      last7Days: 'Letzte 7 Tage', last30Days: 'Letzte 30 Tage', older: 'Älter', pinned: 'Angeheftet',
      noMatchingChats: 'Keine passenden Chats.', noChatsYet: 'Noch keine Chats vorhanden.', free: 'Kostenlos',
      context: 'Kontext', vision: 'Bildanalyse', webSupported: 'Websuche unterstützt', webUnsupported: 'Websuche nicht unterstützt',
      webIncompatibleNotice: 'Das Modell ({model}) unterstützt keine Websuche.',
      webActiveNotice: 'Websuche aktiv: Modell durchsucht das Internet.',
      webInactiveNotice: 'Websuche deaktiviert.',
      importSuccess: 'Sicherung importiert: {c} Chats, {m} Nachrichten.',
      importError: 'Import fehlgeschlagen: Ungültige Datei.',
      sttListening: 'Höre zu... Bitte sprechen.', sttError: 'Spracherkennung fehlgeschlagen',
      welcomeTitle: 'Wie kann ich heute helfen?',
      sugDocTitle: 'Dokumentenanalyse', sugDocDesc: 'PDF oder Word prüfen, Kernaussagen und Ergebnisse extrahieren',
      sugDocPrompt: 'Ich lade eine PDF hoch; extrahiere stichpunktartig die wichtigsten Ergebnisse, Zahlen und etwaige Widersprüche.',
      sugImgTitle: 'Bildanalyse', sugImgDesc: 'Detaillierte Analyse von Fotos oder Screenshots',
      sugImgPrompt: 'Ich lade einen UI-Screenshot hoch; liste Probleme auf und mache konkrete Verbesserungsvorschläge.',
      sugGenTitle: 'Bild generieren', sugGenDesc: 'Erstelle ein neues Bild aus deiner Beschreibung',
      sugGenPrompt: 'Nebliger Bergsee bei Sonnenuntergang, isometrischer Miniatur-Diorama-Stil, warme Orange- und tiefe Blautöne',
      sugCodeTitle: 'Code schreiben', sugCodeDesc: 'Stark bei anspruchsvollen Programmieraufgaben',
      sugCodePrompt: 'Schreibe ein Python-Skript, das eine CSV liest, fehlende Werte auffüllt, Ausreißer markiert und einen Bericht erstellt.',
      menuUploadTitle: 'Datei hochladen', menuUploadDesc: 'Foto, PDF, Word, Video, Code…',
      menuImageTitle: 'Bild generieren', menuImageDesc: 'Neues Bild aus Beschreibung generieren',
      pickerHeadModel: 'Modell', pickerHeadEffort: 'Denktiefe',
      thinking: 'Denkt nach…', thoughtProcess: 'Denkprozess', copyFailed: 'Kopieren fehlgeschlagen — keine Berechtigung.',
      effortLow: 'Schnell', effortLowDesc: 'Minimale Denkzeit, schnellste Antwort',
      effortHigh: 'Ausgewogen', effortHighDesc: 'Ausreichend für die meisten Aufgaben',
      effortMax: 'Tiefgründig', effortMaxDesc: 'Maximale Denktiefe, langsamer',
      textLang: 'Text', artifactTitle: '👁️ Live-Code-Vorschau (Artifact)', reloadPreview: 'Neu starten',
      openSidebar: 'Seitenleiste öffnen', collapseSidebar: 'Seitenleiste einklappen',
      toggleTheme: 'Design umschalten', scrollToBottom: 'Nach unten scrollen',
      plusButton: 'Hinzufügen', pickerTitle: 'Modell & Denktiefe', activeModelTitle: 'Aktives Modell',
      pin: 'Anheften', unpin: 'Lösen', rename: 'Umbenennen', delete: 'Löschen',
      confirmDeleteChat: '"{title}" löschen?', confirmClearAllHistory: 'Gesamten Chat-Verlauf unwiderruflich löschen?',
      noMessagesToExport: 'Keine Nachrichten zum Exportieren.', chatExportedMarkdown: 'Chat als Markdown exportiert.',
      noChatsToBackup: 'Keine Chats zum Sichern gefunden.', allChatsBackupSuccess: 'Alle Chats als JSON gesichert.',
      backupFailed: 'Sicherung fehlgeschlagen', chatOpenFailed: 'Chat konnte nicht geöffnet werden',
      uploading: 'wird hochgeladen…', remove: 'Entfernen', uploadFailed: 'Upload fehlgeschlagen',
      promptRequiredForImage: 'Bitte geben Sie eine Bildbeschreibung ein.', generatingImage: 'Bild wird generiert',
      imageModePlaceholder: 'Bild beschreiben…', imageModeDisclaimer: 'Bildgenerierungsmodus aktiv · {model}',
      generatedImageAlt: 'Generiertes Bild',
      imageCreditExhausted: 'Bildgenerierung erfordert OpenRouter-Guthaben. Bitte unter openrouter.ai/credits aufladen. Chat-Modelle bleiben kostenlos.',
      ttsUnsupported: 'Ihr Browser unterstützt keine Sprachausgabe.', codeBlockSpeech: 'Code-Block.',
      temporaryError: 'Vorübergehender Fehler: ', errorPrefix: 'Fehler: ', requestFailed: 'Anfrage fehlgeschlagen',
      serverConnectError: 'Verbindung zum Server fehlgeschlagen', configLoadError: 'Serverkonfiguration konnte nicht geladen werden',
      balanceUndefined: 'Kostenlos / Undefiniert', balanceTip: 'Guthabeninfo nicht verfügbar oder kostenlose Stufe',
      balanceRemainingTip: 'Verbleibendes OpenRouter-Guthaben: {amount}\nKlicken zum Öffnen der Einstellungen',
      tokenUsageTip: 'Eingabe: {prompt} · Ausgabe: {completion} Tokens',
      createdDate: 'Erstellt', you: 'Sie', codeAppFallbackTitle: 'Web-App / Spiel',
    }
  };

  const state = {
    conversations: [],
    currentId: null,
    messages: [],
    pending: [],          // { localId, name, size, kind, id?, url?, error?, uploading }
    model: 'stealth/ox-alpha',
    effort: 'high',
    imageMode: false,
    streaming: false,
    controller: null,
    config: { chatModel: 'stealth/ox-alpha', chatModels: [], imageModel: '', videoGeneration: false },
    webSearch: false,
    webSearchDefault: false,
    userName: localStorage.getItem('ox.user_name') || '',
    customInstructions: localStorage.getItem('ox.custom_instructions') || '',
    lang: localStorage.getItem('ox.lang') || 'tr',
    customApiKey: localStorage.getItem('ox.custom_openrouter_key') ||
      (window.OX_CONFIG && window.OX_CONFIG.openrouterKeys && window.OX_CONFIG.openrouterKeys[0]) || '',
    customHfKey: localStorage.getItem('ox.custom_hf_key') ||
      (window.OX_CONFIG && window.OX_CONFIG.hfKeys && window.OX_CONFIG.hfKeys[0]) || '',
    isRecording: false,
  };

  function t(key, params) {
    const lang = state.lang || 'tr';
    let str = (I18N[lang] && I18N[lang][key]) || (I18N.tr && I18N.tr[key]) || key;
    if (params) {
      for (const k of Object.keys(params)) {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      }
    }
    return str;
  }
  window.getAppI18n = (key) => t(key);

  function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('ox.lang', lang);
    if (window.AndroidTTS && typeof window.AndroidTTS.setLang === 'function') {
      window.AndroidTTS.setLang(lang);
    }
    if (el.settingLanguage) el.settingLanguage.value = lang;
    if (el.modalTitle) el.modalTitle.textContent = t('settingsTitle');
    if (el.closeSettingsBtn) el.closeSettingsBtn.title = t('closeModal');
    if (el.newChatBtn) {
      const sp = el.newChatBtn.querySelector('span');
      if (sp) sp.textContent = t('newChat');
    }
    if (el.searchInput) el.searchInput.placeholder = t('searchPlaceholder');
    if (el.clearAllBtn) el.clearAllBtn.textContent = t('clearAllHistory');
    if (el.exportBtn) el.exportBtn.title = t('exportMarkdown');
    if (el.settingsBtn) el.settingsBtn.title = t('settingsTitle');
    if (el.input) el.input.placeholder = t('inputPlaceholder');
    if (el.webSearchBtn) el.webSearchBtn.title = t('webSearchTitle');
    if (el.micBtn) el.micBtn.title = t('micTitle');
    if (el.sendBtn) el.sendBtn.title = t('sendTitle');
    if (el.disclaimer) el.disclaimer.textContent = t('disclaimer');
    if (el.lblSettingLang) el.lblSettingLang.textContent = t('langLabel');
    if (el.lblSettingUserName) el.lblSettingUserName.textContent = t('userNameLabel');
    if (el.tipSettingUserName) el.tipSettingUserName.textContent = t('userNameTip');
    if (el.settingUserName) el.settingUserName.placeholder = t('userNamePlaceholder');
    if (el.lblSettingCustomInstructions) el.lblSettingCustomInstructions.textContent = t('customInstructionsLabel');
    if (el.tipSettingCustomInstructions) el.tipSettingCustomInstructions.textContent = t('customInstructionsTip');
    if (el.settingCustomInstructions) el.settingCustomInstructions.placeholder = t('customInstructionsPlaceholder');
    if (el.lblSettingApiKey) el.lblSettingApiKey.textContent = t('apiKeyLabel');
    if (el.tipSettingApiKey) el.tipSettingApiKey.textContent = t('apiKeyTip');
    if (el.lblSettingHfApiKey) el.lblSettingHfApiKey.textContent = t('hfApiKeyLabel');
    if (el.tipSettingHfApiKey) el.tipSettingHfApiKey.textContent = t('hfApiKeyTip');
    if (el.lblWebSearchDefault) el.lblWebSearchDefault.textContent = t('webSearchDefault');
    if (el.lblSecBalance) el.lblSecBalance.textContent = t('balanceSection');
    if (el.lblRemainingCredits) el.lblRemainingCredits.textContent = t('remainingCredits');
    if (el.lblTotalUsage) el.lblTotalUsage.textContent = t('totalUsage');
    if (el.tipBalanceNotice) el.tipBalanceNotice.textContent = t('balanceNotice');
    if (el.lblSecBackup) el.lblSecBackup.textContent = t('backupSection');
    if (el.lblExportJson) el.lblExportJson.textContent = t('exportJson');
    if (el.lblImportJson) el.lblImportJson.textContent = t('importJson');
    if (el.saveSettingsBtn) el.saveSettingsBtn.textContent = t('save');

    if (el.welcomeTitle) el.welcomeTitle.textContent = t('welcomeTitle');
    if (el.sugDocTitle) el.sugDocTitle.textContent = t('sugDocTitle');
    if (el.sugDocDesc) el.sugDocDesc.textContent = t('sugDocDesc');
    if (el.sugDoc) el.sugDoc.dataset.prompt = t('sugDocPrompt');
    if (el.sugImgTitle) el.sugImgTitle.textContent = t('sugImgTitle');
    if (el.sugImgDesc) el.sugImgDesc.textContent = t('sugImgDesc');
    if (el.sugImg) el.sugImg.dataset.prompt = t('sugImgPrompt');
    if (el.sugGenTitle) el.sugGenTitle.textContent = t('sugGenTitle');
    if (el.sugGenDesc) el.sugGenDesc.textContent = t('sugGenDesc');
    if (el.sugGen) el.sugGen.dataset.prompt = t('sugGenPrompt');
    if (el.sugCodeTitle) el.sugCodeTitle.textContent = t('sugCodeTitle');
    if (el.sugCodeDesc) el.sugCodeDesc.textContent = t('sugCodeDesc');
    if (el.sugCode) el.sugCode.dataset.prompt = t('sugCodePrompt');

    if (el.menuUploadTitle) el.menuUploadTitle.textContent = t('menuUploadTitle');
    if (el.menuUploadDesc) el.menuUploadDesc.textContent = t('menuUploadDesc');
    if (el.menuImageTitle) el.menuImageTitle.textContent = t('menuImageTitle');
    if (el.menuImageDesc) el.menuImageDesc.textContent = t('menuImageDesc');

    if (el.pickerHeadModel) el.pickerHeadModel.textContent = t('pickerHeadModel');
    if (el.pickerHeadEffort) el.pickerHeadEffort.textContent = t('pickerHeadEffort');
    if (el.artifactTitle) el.artifactTitle.textContent = t('artifactTitle');
    if (el.closeArtifactBtn) el.closeArtifactBtn.title = t('closeModal');
    if (el.reloadArtifactBtn) el.reloadArtifactBtn.title = t('reloadPreview');

    if (el.collapseBtn) {
      el.collapseBtn.title = t('collapseSidebar');
      el.collapseBtn.setAttribute('aria-label', t('collapseSidebar'));
    }
    if (el.openSidebarBtn) {
      el.openSidebarBtn.title = t('openSidebar');
      el.openSidebarBtn.setAttribute('aria-label', t('openSidebar'));
    }
    if (el.themeBtn) {
      el.themeBtn.title = t('toggleTheme');
      el.themeBtn.setAttribute('aria-label', t('toggleTheme'));
    }
    if (el.toBottomBtn) {
      el.toBottomBtn.title = t('scrollToBottom');
      el.toBottomBtn.setAttribute('aria-label', t('scrollToBottom'));
    }
    if (el.plusBtn) {
      el.plusBtn.title = t('plusButton');
      el.plusBtn.setAttribute('aria-label', t('plusButton'));
    }
    if (el.pickerBtn) el.pickerBtn.title = t('pickerTitle');
    if (el.modelChip) el.modelChip.title = t('activeModelTitle');

    renderHistory();
    if (state.config && state.config.chatModels) buildPicker();
    syncPicker();
    updateWebSearchBtn();
    if (state.config) updateBalanceDisplay(state.config.credits, state.config.creditDetails);
    if (state.messages && state.messages.length) renderMessages();
  }

  /* ============================================================ yardımcılar */

  const escapeHtml = (s) => window.md.escape(String(s == null ? '' : s));

  function humanSize(bytes) {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return (n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)) + ' ' + units[i];
  }

  const KIND_ICON = { image: '🖼️', video: '🎬', pdf: '📕', text: '📄', audio: '🎵', unsupported: '⚠️' };

  /** "PDF · 1,2 MB" — ad kisalsa bile dosya turu gorunur kalsin. */
  function fileSub(f) {
    const ext = (f.name || '').includes('.') ? f.name.split('.').pop().toUpperCase().slice(0, 6) : '';
    return [ext, humanSize(f.size)].filter(Boolean).join(' · ') || f.kind || '';
  }

  const LOCALES = { tr: 'tr-TR', en: 'en-US', ru: 'ru-RU', de: 'de-DE' };
  const currentLocale = () => LOCALES[state.lang] || 'tr-TR';
  const timeFmt = (ts) => new Intl.DateTimeFormat(currentLocale(), { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
  const dateFmt = (ts) => new Intl.DateTimeFormat(currentLocale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ts));
  const fullFmt = (ts) => new Intl.DateTimeFormat(currentLocale(), { dateStyle: 'long', timeStyle: 'short' }).format(new Date(ts));

  const startOfDay = (ts) => new Date(ts).setHours(0, 0, 0, 0);

  /** "Bugün" / "Dün" / "14 Mart 2026" */
  function dayLabel(ts) {
    const diff = startOfDay(Date.now()) - startOfDay(ts);
    if (diff <= 0) return t('today');
    if (diff <= 86400000) return t('yesterday');
    return dateFmt(ts);
  }

  /** Mesaj balonlarinda gosterilen saat. */
  function timeNode(ts, cls) {
    const el2 = document.createElement('span');
    el2.className = cls;
    el2.textContent = timeFmt(ts);
    el2.title = fullFmt(ts);
    return el2;
  }

  const EFFORTS = [
    { id: 'low' },
    { id: 'high' },
    { id: 'max' },
  ];

  // Saglayiciya gore renk ve isaret; hangi modelin konustugu bir bakista bellidir.
  const BRANDS = {
    'stealth':          { name: 'Ox Alpha',   mark: '🐂', emoji: true, color: '#8b5cf6' },
    'nvidia':           { name: 'NVIDIA',     mark: 'N',  color: '#76b900' },
    'dots-studio':      { name: 'Dots Studio', mark: 'D', color: '#f59e0b' },
    'poolside':         { name: 'Poolside',   mark: 'P',  color: '#0ea5e9' },
    'cohere':           { name: 'Cohere',     mark: 'C',  color: '#39594d' },
    'liquid':           { name: 'Liquid AI',  mark: 'L',  color: '#06b6d4' },
    'openrouter':       { name: 'OpenRouter', mark: '⇄',  color: '#6366f1' },
    'google':           { name: 'Google',     mark: 'G',  color: '#4285f4' },
    'openai':           { name: 'OpenAI',     mark: 'O',  color: '#10a37f' },
    'anthropic':        { name: 'Anthropic',  mark: 'A',  color: '#d97757' },
    'deepseek':         { name: 'DeepSeek',   mark: 'S',  color: '#4d6bfe' },
    'meta-llama':       { name: 'Meta',       mark: 'M',  color: '#0064e0' },
    'mistralai':        { name: 'Mistral',    mark: 'M',  color: '#fa520f' },
    'x-ai':             { name: 'xAI',        mark: 'X',  color: '#111111' },
    'qwen':             { name: 'Qwen',       mark: 'Q',  color: '#615ced' },
    'z-ai':             { name: 'z.ai',       mark: 'Z',  color: '#3b82f6' },
    'thinkingmachines': { name: 'Thinking M.', mark: 'T', color: '#ec4899' },
    'moonshotai':       { name: 'Moonshot',   mark: 'K',  color: '#8b5cf6' },
    'minimax':          { name: 'MiniMax',    mark: 'M',  color: '#ff4d4f' },
    'inclusionai':      { name: 'inclusionAI', mark: 'L', color: '#14b8a6' },
    'minimaxai':        { name: 'MiniMax',    mark: 'M',  color: '#ff4d4f' },
  };

  // HuggingFace kimlikleri farkli yazilir: "Qwen/", "deepseek-ai/", "zai-org/".
  const VENDOR_ALIAS = {
    'deepseek-ai': 'deepseek', 'zai-org': 'z-ai', 'coherelabs': 'cohere',
    'meta': 'meta-llama', 'mistral': 'mistralai', 'xai': 'x-ai', 'moonshot': 'moonshotai',
  };

  /** Model kimliginden marka bilgisi ve gorunen ad uretir. */
  function brandFor(modelId) {
    const id = String(modelId || state.model || '');
    // "hf:google/gemma-4" -> marka "google" olmali, "hf" degil.
    const bare = id.replace(/^hf:/, '');
    const raw = bare.split('/')[0];
    // Buyuk/kucuk harf ve saglayiciya gore degisen adlari tek biçime indir.
    const key = raw.toLowerCase();
    const vendor = BRANDS[key] ? key : (VENDOR_ALIAS[key] || key);
    const brand = BRANDS[vendor]
      || { name: raw || 'Model', mark: (raw[0] || '?').toUpperCase(), color: '#6b7280' };
    // Once .env'deki gorunen adi kullan; yoksa kimlikten turet.
    const known = (state.config.chatModels || []).find((m) => m.id === id);
    const label = known ? known.label : prettyModelName(id);
    return { id, label, vendor: brand.name, mark: brand.mark, emoji: !!brand.emoji, color: brand.color };
  }

  function prettyModelName(id) {
    const tail = String(id).replace(/^hf:/, '').split('/').pop() || id;
    return tail.replace(/:free$/, '').replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 34);
  }

  /** Marka isareti dugumu olusturur. */
  function brandMark(brand, extraClass) {
    const el2 = document.createElement('span');
    el2.className = 'brand-mark' + (brand.emoji ? ' emoji' : '') + (extraClass ? ' ' + extraClass : '');
    el2.textContent = brand.mark;
    if (!brand.emoji) el2.style.setProperty('--brand', brand.color);
    el2.title = brand.id;
    return el2;
  }

  async function apiJson(url, options) {
    const res = await fetch(url, options);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || (t('requestFailed') + ' (' + res.status + ')'));
    return body;
  }

  let noticeTimer = null;
  function showNotice(text, kind) {
    clearTimeout(noticeTimer);
    el.notice.textContent = text;
    el.notice.className = 'notice' + (kind === 'warn' ? ' warn' : '');
    el.notice.hidden = false;
    noticeTimer = setTimeout(() => { el.notice.hidden = true; }, 7000);
  }

  function nearBottom(slack) {
    const s = el.threadScroll;
    return s.scrollHeight - s.scrollTop - s.clientHeight < (slack ?? 80);
  }

  /**
   * Akis sirasinda ekrani otomatik asagi cekme davranisi.
   * Kullanici yukari kaydirdigi anda takip birakilir; en alta donunce
   * kendiliginden tekrar baslar. Boylece yazarken gecmise bakilabilir.
   */
  let stickToBottom = true;
  /** En son BIZIM ayarladigimiz kaydirma konumu. */
  let lastAutoTop = -1;

  function setStick(on) {
    if (stickToBottom === on) return;
    stickToBottom = on;
    el.toBottomBtn.hidden = on;
  }

  function scrollToBottom(force) {
    if (force) setStick(true);
    if (force || stickToBottom) {
      const s = el.threadScroll;
      s.scrollTop = s.scrollHeight;
      lastAutoTop = s.scrollTop;   // tarayici sinira kirptigi icin geri oku
    }
  }

  /**
   * Kaydirmanin kimden geldigini konumu karsilastirarak anlar: konum bizim
   * ayarladigimizdan farkliysa kullanici kaydirmistir. Bu yontem tekerlek,
   * parmak, klavye ve kaydirma cubugunun hepsinde calisir.
   */
  function watchUserScroll() {
    el.threadScroll.addEventListener('scroll', () => {
      const top = el.threadScroll.scrollTop;
      if (Math.abs(top - lastAutoTop) < 2) return;   // bizim yaptigimiz
      setStick(nearBottom(40));                      // kullanicinin yaptigi
    }, { passive: true });
  }

  /* ============================================================ kenar çubuğu */

  function groupLabel(ts) {
    const d = new Date(ts);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const day = 86400000;
    const diff = today.getTime() - new Date(d).setHours(0, 0, 0, 0);
    if (diff <= 0) return t('today');
    if (diff <= day) return t('yesterday');
    if (diff <= 7 * day) return t('last7Days');
    if (diff <= 30 * day) return t('last30Days');
    return d.toLocaleDateString(currentLocale(), { month: 'long', year: 'numeric' });
  }

  function renderHistory() {
    el.history.textContent = '';
    if (!state.conversations.length) {
      const empty = document.createElement('div');
      empty.className = 'hist-empty';
      empty.textContent = el.searchInput.value.trim() ? t('noMatchingChats') : t('noChatsYet');
      el.history.appendChild(empty);
      return;
    }

    const groups = new Map();
    for (const c of state.conversations) {
      const label = c.pinned ? t('pinned') : groupLabel(c.updated_at);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(c);
    }

    for (const [label, items] of groups) {
      const g = document.createElement('div');
      g.className = 'hist-group';
      const h = document.createElement('div');
      h.className = 'hist-label';
      h.textContent = label;
      g.appendChild(h);
      for (const c of items) g.appendChild(historyRow(c));
      el.history.appendChild(g);
    }
  }

  function cleanDisplayTitle(title) {
    if (!title) return t('newChat');
    let str = String(title).trim();
    if (/^<!DOCTYPE|^<html|^<body|^<head/i.test(str) || str.includes('<!DOCTYPE') || str.startsWith('<')) {
      return t('codeAppFallbackTitle');
    }
    return str;
  }

  function historyRow(c) {
    const row = document.createElement('div');
    row.className = 'hist-item' + (c.id === state.currentId ? ' active' : '');
    row.tabIndex = 0;
    const dispTitle = cleanDisplayTitle(c.title);
    row.title = dispTitle;

    const title = document.createElement('span');
    title.className = 'h-title';
    title.textContent = dispTitle;
    row.appendChild(title);

    if (c.pinned) {
      const pin = document.createElement('span');
      pin.className = 'pin-mark';
      pin.textContent = '📌';
      row.appendChild(pin);
    }

    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.appendChild(iconAction(c.pinned ? t('unpin') : t('pin'),
      '<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3-1-6z"/>', async (e) => {
        e.stopPropagation();
        await apiJson('/api/conversations/' + c.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pinned: !c.pinned }),
        });
        await loadHistory();
      }));
    actions.appendChild(iconAction(t('rename'),
      '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>', (e) => {
        e.stopPropagation();
        startRename(row, title, c);
      }));
    const del = iconAction(t('delete'),
      '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>', async (e) => {
        e.stopPropagation();
        if (!confirm(t('confirmDeleteChat', { title: c.title }))) return;
        await apiJson('/api/conversations/' + c.id, { method: 'DELETE' });
        if (state.currentId === c.id) newChat();
        await loadHistory();
      });
    del.classList.add('del');
    actions.appendChild(del);
    row.appendChild(actions);

    row.addEventListener('click', () => openConversation(c.id));
    row.addEventListener('keydown', (e) => {
      // Ad duzenleme kutusundan kabaran tuslara dokunma; aksi halde bosluk
      // tusu "satiri ac" sayilip yazmayi engelliyor.
      if (e.target !== row) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openConversation(c.id); }
    });
    return row;
  }

  function iconAction(label, path, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.title = label;
    b.setAttribute('aria-label', label);
    b.innerHTML = '<svg viewBox="0 0 24 24">' + path + '</svg>';
    b.addEventListener('click', onClick);
    return b;
  }

  function startRename(row, titleSpan, c) {
    row.classList.add('menu-open');
    const input = document.createElement('input');
    input.className = 'rename-input';
    input.value = c.title;
    row.replaceChild(input, titleSpan);
    input.focus();
    input.select();

    let done = false;
    const finish = async (save) => {
      if (done) return;
      done = true;
      const value = input.value.trim();
      row.classList.remove('menu-open');
      if (save && value && value !== c.title) {
        await apiJson('/api/conversations/' + c.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: value }),
        });
        if (c.id === state.currentId) el.chatTitle.textContent = value;
      }
      await loadHistory();
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      if (e.key === 'Escape') { e.preventDefault(); finish(false); }
    });
    input.addEventListener('blur', () => finish(true));
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('keydown', (e) => e.stopPropagation());
    input.addEventListener('keyup', (e) => e.stopPropagation());
  }

  async function loadHistory() {
    const q = el.searchInput.value.trim();
    state.conversations = await apiJson('/api/conversations' + (q ? '?q=' + encodeURIComponent(q) : ''));
    renderHistory();
  }

  /* ============================================================ mesaj görünümü */

  /**
   * Gerekiyorsa akisin sonuna bir tarih ayraci ekler. Hem ilk cizimde hem de
   * akis sirasinda eklenen mesajlarda ayni mantik calissin diye ortak.
   * before verilirse ayrac o dugumden once eklenir.
   */
  function ensureDayDivider(ts, before) {
    if (!ts) return;
    const dividers = el.thread.querySelectorAll('.day-divider');
    const last = dividers[dividers.length - 1];
    const label = dayLabel(ts);
    if (last && last.textContent === label) return;

    const div = document.createElement('div');
    div.className = 'day-divider';
    div.textContent = label;
    if (before) el.thread.insertBefore(div, before);
    else el.thread.appendChild(div);
  }

  function renderMessages() {
    el.thread.textContent = '';
    for (const m of state.messages) {
      ensureDayDivider(m.created_at);
      el.thread.appendChild(messageNode(m));
    }
    el.welcome.hidden = state.messages.length > 0;
    scrollToBottom(true);
  }

  function messageNode(m) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + m.role;
    wrap.dataset.id = m.id || '';

    if (m.role === 'assistant') {
      // meta.model, yaniti gercekten ureten modeldir; yonlendirme yapan
      // "Bedava Router" secildiginde bile dogru modeli gosterir.
      wrap.appendChild(roleNode((m.meta && m.meta.model) || null, m.created_at));
    }

    if (m.attachments && m.attachments.length) wrap.appendChild(filesNode(m.attachments));

    if (m.reasoning) wrap.appendChild(reasoningNode(m.reasoning, false));

    if (m.images && m.images.length) {
      for (const img of m.images) {
        const image = document.createElement('img');
        image.className = 'gen-img';
        image.src = img.url;
        image.alt = t('generatedImageAlt');
        image.loading = 'lazy';
        image.addEventListener('click', () => openLightbox(img.url));
        wrap.appendChild(image);
      }
    }

    if (m.content || !(m.images && m.images.length)) {
      const body = document.createElement('div');
      body.className = 'bubble';
      if (m.role === 'user') {
        body.textContent = m.content;
      } else {
        body.classList.add('md');
        body.innerHTML = window.md.render(m.content);
      }
      wrap.appendChild(body);
    }

    if (m.role === 'user' && m.created_at) wrap.appendChild(timeNode(m.created_at, 'msg-time-user'));
    if (m.role === 'assistant' && m.id) wrap.appendChild(assistantActions(m));
    return wrap;
  }

  /** Asistan mesajinin ustundeki "kim konusuyor" satiri. */
  function roleNode(modelId, createdAt) {
    const brand = brandFor(modelId);
    const role = document.createElement('div');
    role.className = 'msg-role';
    role.appendChild(brandMark(brand));

    const name = document.createElement('span');
    name.textContent = brand.label;
    role.appendChild(name);

    // Gorunen ad kimlikle ayni degilse ham kimligi de goster.
    if (brand.label.toLowerCase() !== brand.id.toLowerCase()) {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.textContent = '·';
      role.appendChild(sep);
      const raw = document.createElement('span');
      raw.className = 'model-id';
      raw.textContent = brand.id;
      role.appendChild(raw);
    }
    if (createdAt) role.appendChild(timeNode(createdAt, 'msg-time'));
    return role;
  }

  let currentSpeakingBtn = null;
  function toggleSpeech(text, btn) {
    const clean = String(text || '')
      .replace(/```[\s\S]*?```/g, t('codeBlockSpeech'))
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_~>]/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .trim();

    if (!clean) return;

    if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
      if (window.AndroidTTS.isSpeaking()) {
        window.AndroidTTS.stop();
        if (currentSpeakingBtn) {
          currentSpeakingBtn.classList.remove('tts-playing');
          currentSpeakingBtn.title = t('readAloud');
        }
        if (currentSpeakingBtn === btn) {
          currentSpeakingBtn = null;
          return;
        }
      }
      window.AndroidTTS.speak(clean);
      currentSpeakingBtn = btn;
      btn.classList.add('tts-playing');
      btn.title = t('stopTitle');
      setTimeout(() => {
        if (currentSpeakingBtn === btn) {
          btn.classList.remove('tts-playing');
          btn.title = t('readAloud');
          currentSpeakingBtn = null;
        }
      }, 15000);
      return;
    }

    if (typeof window.speechSynthesis === 'undefined') {
      showNotice(t('ttsUnsupported'), 'warn');
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (currentSpeakingBtn) {
        currentSpeakingBtn.classList.remove('tts-playing');
        currentSpeakingBtn.title = t('readAloud');
      }
      if (currentSpeakingBtn === btn) {
        currentSpeakingBtn = null;
        return;
      }
    }

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = currentLocale();
    u.rate = 1.0;
    u.onstart = () => {
      currentSpeakingBtn = btn;
      btn.classList.add('tts-playing');
      btn.title = t('stopTitle');
    };
    u.onend = u.onerror = () => {
      btn.classList.remove('tts-playing');
      btn.title = t('readAloud');
      if (currentSpeakingBtn === btn) currentSpeakingBtn = null;
    };
    window.speechSynthesis.speak(u);
  }

  function exportCurrentChat() {
    if (!state.messages || !state.messages.length) {
      showNotice(t('noMessagesToExport'), 'warn');
      return;
    }
    const conv = state.conversations.find((c) => c.id === state.currentId);
    const title = conv?.title || t('newChat');
    let md = `# ${title}\n\n`;
    md += `*${t('createdDate')}: ${fullFmt.format(new Date(conv?.created_at || Date.now()))}*\n\n---\n\n`;

    for (const m of state.messages) {
      const time = fullFmt.format(new Date(m.created_at || Date.now()));
      if (m.role === 'user') {
        md += `### 👤 ${state.userName || t('you')} (${time})\n\n${m.content}\n\n`;
      } else {
        const model = (m.meta && m.meta.model) || state.model;
        md += `### 🤖 ISAEV [${model}] (${time})\n\n`;
        if (m.reasoning) {
          md += `> **${t('thoughtProcess')}:**\n> ${m.reasoning.replace(/\n/g, '\n> ')}\n\n`;
        }
        md += `${m.content}\n\n`;
      }
      md += `---\n\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9ığüşöçİĞÜŞÖÇ_-]/g, '_').slice(0, 40)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showNotice(t('chatExportedMarkdown'), 'ok');
  }

  async function exportAllChats() {
    try {
      const convs = state.conversations;
      if (!convs || !convs.length) {
        showNotice(t('noChatsToBackup'), 'warn');
        return;
      }
      const fullData = [];
      for (const c of convs) {
        try {
          const detail = await apiJson('/api/conversations/' + c.id);
          fullData.push(detail);
        } catch { /* atla */ }
      }
      const jsonStr = JSON.stringify(fullData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `isaev-backup-${date}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      showNotice(t('allChatsBackupSuccess'), 'ok');
    } catch (e) {
      showNotice(t('backupFailed') + ': ' + e.message, 'warn');
    }
  }

  function updateBalanceDisplay(credits, details) {
    if (!el.balanceChip || !el.balanceVal) return;
    if (credits === null || credits === undefined) {
      el.balanceVal.textContent = t('balanceUndefined');
      el.balanceChip.className = 'balance-chip';
      el.balanceChip.title = t('balanceTip');
      if (el.settingsCreditsVal) el.settingsCreditsVal.textContent = t('balanceUndefined');
      return;
    }
    const num = Number(credits);
    const text = '$' + num.toFixed(2);
    el.balanceVal.textContent = text;
    el.balanceChip.className = 'balance-chip' + (num <= 0 ? ' empty' : (num < 0.5 ? ' low' : ''));
    el.balanceChip.title = t('balanceRemainingTip', { amount: text });

    if (el.settingsCreditsVal) el.settingsCreditsVal.textContent = text;
    if (details && details.usage != null && el.settingsUsageRow && el.settingsUsageVal) {
      el.settingsUsageRow.hidden = false;
      el.settingsUsageVal.textContent = '$' + Number(details.usage).toFixed(2);
    }
  }

  async function refreshBalance() {
    try {
      const cfg = await apiJson('/api/config');
      state.config = cfg;
      updateBalanceDisplay(cfg.credits, cfg.creditDetails);
    } catch { /* sessiz */ }
  }

  function openSettings() {
    if (!el.settingsModal) return;
    if (el.settingLanguage) el.settingLanguage.value = state.lang || 'tr';
    if (el.settingUserName) el.settingUserName.value = state.userName || '';
    if (el.settingCustomInstructions) el.settingCustomInstructions.value = state.customInstructions || '';
    if (el.settingCustomApiKey) el.settingCustomApiKey.value = state.customApiKey || '';
    if (el.settingCustomHfKey) el.settingCustomHfKey.value = state.customHfKey || '';
    if (el.settingWebSearchDefault) el.settingWebSearchDefault.checked = !!state.webSearchDefault;
    refreshBalance();
    el.settingsModal.hidden = false;
  }

  function closeSettings() {
    if (el.settingsModal) el.settingsModal.hidden = true;
  }

  function saveSettings() {
    if (el.settingLanguage && el.settingLanguage.value !== state.lang) {
      applyLanguage(el.settingLanguage.value);
    }
    state.userName = el.settingUserName ? el.settingUserName.value.trim() : '';
    state.customInstructions = el.settingCustomInstructions ? el.settingCustomInstructions.value.trim() : '';
    state.customApiKey = el.settingCustomApiKey ? el.settingCustomApiKey.value.trim() : '';
    state.customHfKey = el.settingCustomHfKey ? el.settingCustomHfKey.value.trim() : '';
    state.webSearchDefault = el.settingWebSearchDefault ? el.settingWebSearchDefault.checked : false;

    localStorage.setItem('ox.user_name', state.userName);
    localStorage.setItem('ox.custom_instructions', state.customInstructions);
    localStorage.setItem('ox.custom_openrouter_key', state.customApiKey);
    localStorage.setItem('ox.custom_hf_key', state.customHfKey);
    localStorage.setItem('ox.web_search_default', state.webSearchDefault ? '1' : '0');

    state.webSearch = state.webSearchDefault;
    updateWebSearchBtn();

    closeSettings();
    refreshBalance();
  }

  function updateWebSearchBtn() {
    if (!el.webSearchBtn) return;
    el.webSearchBtn.classList.toggle('active', !!state.webSearch);
    el.webSearchBtn.setAttribute('aria-pressed', !!state.webSearch ? 'true' : 'false');
    el.webSearchBtn.title = state.webSearch
      ? t('webSearchTitle') + ' [ON]'
      : t('webSearchTitle') + ' [OFF]';
  }

  let speechRecognizer = null;
  function setMicRecording(recording) {
    state.isRecording = recording;
    if (el.micBtn) {
      el.micBtn.classList.toggle('recording', recording);
      el.micBtn.title = recording ? t('sttListening') : t('micTitle');
    }
  }

  window.onAndroidSTTResult = (text) => {
    setMicRecording(false);
    if (!text) return;
    const cur = el.input.value;
    el.input.value = cur ? cur + ' ' + text : text;
    autoGrow();
    updateSendState();
  };
  window.onAndroidSTTError = (err) => {
    setMicRecording(false);
    showNotice(t('sttError') + (err ? ': ' + err : ''), 'warn');
  };
  window.onAndroidSTTStop = () => {
    setMicRecording(false);
  };

  function toggleMic() {
    if (window.AndroidSTT && typeof window.AndroidSTT.startListening === 'function') {
      setMicRecording(true);
      window.AndroidSTT.startListening(state.lang);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      showNotice(t('sttError') + ' (API not supported)', 'warn');
      return;
    }

    if (state.isRecording) {
      if (speechRecognizer) {
        try { speechRecognizer.stop(); } catch (e) {}
      }
      setMicRecording(false);
      return;
    }

    try {
      speechRecognizer = new SpeechRec();
      let langCode = 'tr-TR';
      if (state.lang === 'en') langCode = 'en-US';
      else if (state.lang === 'ru') langCode = 'ru-RU';
      else if (state.lang === 'de') langCode = 'de-DE';
      speechRecognizer.lang = langCode;
      speechRecognizer.continuous = false;
      speechRecognizer.interimResults = false;

      speechRecognizer.onstart = () => setMicRecording(true);
      speechRecognizer.onresult = (evt) => {
        const transcript = evt.results[0][0].transcript;
        if (transcript) {
          const cur = el.input.value;
          el.input.value = cur ? cur + ' ' + transcript : transcript;
          autoGrow();
          updateSendState();
        }
      };
      speechRecognizer.onerror = () => setMicRecording(false);
      speechRecognizer.onend = () => setMicRecording(false);
      speechRecognizer.start();
    } catch (e) {
      setMicRecording(false);
      showNotice(t('sttError'), 'warn');
    }
  }

  function assistantActions(m) {
    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    actions.appendChild(iconAction(t('copy'),
      '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
      () => copyText(m.content)));

    if (m.content) {
      const ttsBtn = iconAction(t('readAloud'),
        '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.08"/>',
        () => toggleSpeech(m.content, ttsBtn));
      ttsBtn.classList.add('tts-btn');
      actions.appendChild(ttsBtn);
    }

    const isLast = state.messages.length && state.messages[state.messages.length - 1].id === m.id;
    if (isLast && !(m.meta && m.meta.mode === 'image')) {
      actions.appendChild(iconAction(t('regenerate'),
        '<path d="M21 12a9 9 0 11-2.6-6.4M21 3v6h-6"/>', () => send({ regenerate: true })));
    }

    if (m.meta && m.meta.usage && m.meta.usage.total_tokens) {
      const info = document.createElement('span');
      info.className = 'cost-tag';
      info.style.cssText = 'font-size:11px;color:var(--text-faint);align-self:center;margin-left:6px;cursor:help';
      const tot = m.meta.usage.total_tokens;
      const p = m.meta.usage.prompt_tokens || 0;
      const c = m.meta.usage.completion_tokens || 0;
      const modelId = (m.meta && m.meta.model) || state.model || '';
      let costText = '';
      if (modelId.endsWith(':free') || modelId === 'openrouter/free') {
        costText = ' · ' + t('free');
      } else {
        const cost = ((p * 0.15 + c * 0.60) / 1000000);
        costText = ' · $' + cost.toFixed(4);
      }
      info.textContent = tot.toLocaleString() + ' tkn' + costText;
      info.title = t('tokenUsageTip', { prompt: p.toLocaleString(), completion: c.toLocaleString() });
      actions.appendChild(info);
    }
    return actions;
  }

  function filesNode(list) {
    const box = document.createElement('div');
    box.className = 'msg-files';
    for (const f of list) {
      if (f.kind === 'image' && f.url) {
        const img = document.createElement('img');
        img.className = 'thumb';
        img.src = f.url;
        img.alt = f.name;
        img.loading = 'lazy';
        img.addEventListener('click', () => openLightbox(f.url));
        box.appendChild(img);
        continue;
      }
      if (f.kind === 'video' && f.url) {
        const v = document.createElement('video');
        v.className = 'thumb';
        v.src = f.url;
        v.controls = true;
        box.appendChild(v);
        continue;
      }
      const card = document.createElement('div');
      card.className = 'file-card' + (f.error ? ' bad' : '');
      card.title = f.name + (f.error ? ' — ' + f.error : '');
      card.innerHTML = '<span class="f-ico">' + (KIND_ICON[f.kind] || '📄') + '</span>'
        + '<span class="f-meta"><span class="f-name">' + escapeHtml(f.name) + '</span>'
        + '<span class="f-sub">' + escapeHtml(f.error || fileSub(f)) + '</span></span>';
      box.appendChild(card);
    }
    return box;
  }

  function reasoningNode(text, live) {
    const d = document.createElement('details');
    d.className = 'reasoning' + (live ? ' live' : '');
    d.innerHTML = '<summary><svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>'
      + '<span class="label">' + (live ? t('thinking') : t('thoughtProcess')) + '</span></summary>'
      + '<div class="r-body"></div>';
    d.querySelector('.r-body').textContent = text;
    return d;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      showNotice(t('copied'));
    } catch {
      showNotice(t('copyFailed'), 'warn');
    }
  }

  /* ============================================================ sohbet gezinme */

  function newChat() {
    if (state.streaming) stopStream();
    setHash('');
    state.currentId = null;
    state.messages = [];
    clearAttachments();
    el.chatTitle.textContent = 'ISAEV';
    renderMessages();
    renderHistory();
    el.input.focus();
  }

  async function openConversation(id) {
    if (state.streaming) stopStream();
    let data;
    try {
      data = await apiJson('/api/conversations/' + id);
    } catch (e) {
      showNotice(t('chatOpenFailed') + ': ' + e.message, 'warn');
      setHash('');
      return;
    }
    setHash('#/c/' + id);
    state.currentId = data.conversation.id;
    state.messages = data.messages;
    el.chatTitle.textContent = cleanDisplayTitle(data.conversation.title);
    // Sohbet hangi modelle yurutulduyse seciciyi ona getir.
    if (data.conversation.model
        && (state.config.chatModels || []).some((m) => m.id === data.conversation.model)) {
      state.model = data.conversation.model;
      syncPicker();
    }
    clearAttachments();
    renderMessages();
    renderHistory();
    el.app.classList.remove('sb-open');
  }

  /** Adres çubuğunu güncellerken hashchange döngüsünü engelle. */
  let ignoreHash = false;
  function setHash(value) {
    if (location.hash === value) return;
    ignoreHash = true;
    if (value) location.hash = value;
    else history.replaceState(null, '', location.pathname + location.search);
    setTimeout(() => { ignoreHash = false; }, 0);
  }

  function conversationIdFromHash() {
    const m = /^#\/c\/([A-Za-z0-9_-]+)$/.exec(location.hash);
    return m ? m[1] : null;
  }

  /* ============================================================ ekler */

  function renderAttachments() {
    el.attachments.textContent = '';
    el.attachments.hidden = state.pending.length === 0;

    for (const f of state.pending) {
      const chip = document.createElement('div');
      chip.className = 'chip' + (f.uploading ? ' uploading' : '') + (f.error ? ' bad' : '');
      chip.title = f.name + (f.error ? ' — ' + f.error : '');

      if (f.kind === 'image' && f.url) {
        const img = document.createElement('img');
        img.src = f.url;
        img.alt = '';
        chip.appendChild(img);
      } else {
        const ico = document.createElement('span');
        ico.className = 'c-ico';
        ico.textContent = KIND_ICON[f.kind] || '📄';
        chip.appendChild(ico);
      }

      const meta = document.createElement('span');
      meta.innerHTML = '<span class="c-name">' + escapeHtml(f.name) + '</span>'
        + '<br><span class="c-sub">' + escapeHtml(f.uploading ? t('uploading') : (f.error || fileSub(f))) + '</span>';
      chip.appendChild(meta);

      const x = document.createElement('button');
      x.className = 'c-x';
      x.type = 'button';
      x.textContent = '×';
      x.title = t('remove');
      x.addEventListener('click', () => {
        state.pending = state.pending.filter((p) => p !== f);
        renderAttachments();
        updateSendState();
      });
      chip.appendChild(x);
      el.attachments.appendChild(chip);
    }
  }

  function clearAttachments() {
    state.pending = [];
    renderAttachments();
    updateSendState();
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList).filter(Boolean);
    if (!files.length) return;

    const placeholders = files.map((f) => {
      const p = {
        name: f.name, size: f.size, uploading: true,
        kind: f.type.startsWith('image/') ? 'image' : f.type.startsWith('video/') ? 'video' : 'text',
        url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      };
      state.pending.push(p);
      return p;
    });
    renderAttachments();
    updateSendState();

    const form = new FormData();
    for (const f of files) form.append('files', f);

    try {
      const out = await apiJson('/api/upload', { method: 'POST', body: form });
      out.files.forEach((info, i) => {
        const p = placeholders[i];
        if (!p) return;
        Object.assign(p, info, { uploading: false });
      });
      const bad = out.files.filter((f) => f.error);
      if (bad.length) showNotice(bad.map((f) => f.name + ': ' + f.error).join(' • '), 'warn');
    } catch (e) {
      for (const p of placeholders) { p.uploading = false; p.error = e.message; }
      showNotice(t('uploadFailed') + ': ' + e.message, 'warn');
    }
    renderAttachments();
    updateSendState();
  }

  /* ============================================================ gönderme */

  function updateSendState() {
    if (state.streaming) { el.sendBtn.disabled = false; return; }
    const hasText = el.input.value.trim().length > 0;
    const hasReady = state.pending.some((p) => p.id && !p.error);
    const busy = state.pending.some((p) => p.uploading);
    el.sendBtn.disabled = busy || !(hasText || hasReady);
  }

  function stopStream() {
    if (state.controller) state.controller.abort();
    state.controller = null;
    state.streaming = false;
    el.sendBtn.classList.remove('streaming');
    updateSendState();
  }

  async function send(options) {
    const opts = options || {};
    if (state.streaming) return;

    const text = opts.regenerate ? '' : el.input.value.trim();
    const attachmentIds = opts.regenerate ? [] : state.pending.filter((p) => p.id && !p.error).map((p) => p.id);
    if (!opts.regenerate && !text && !attachmentIds.length) return;

    if (state.imageMode && !opts.regenerate) return generateImage(text, attachmentIds);

    if (!opts.regenerate) {
      el.input.value = '';
      autoGrow();
      clearAttachments();
    }

    state.streaming = true;
    state.controller = new AbortController();
    el.sendBtn.classList.add('streaming');
    el.welcome.hidden = true;
    updateSendState();

    // Akış sırasında dolacak asistan balonu.
    let reasoningEl = null;
    let bodyEl = null;
    let node = null;
    let contentBuf = '';
    let reasoningBuf = '';
    let raf = 0;
    // Kullanici mesaji sunucuda kayitliysa yeniden deneme gecmisten devam etmeli;
    // degilse metni bestecıye geri koyup kullaniciya birakmaliyiz.
    let userSaved = !!opts.regenerate;

    if (opts.regenerate) {
      const last = el.thread.lastElementChild;
      if (last && last.classList.contains('assistant')) last.remove();
      state.messages = state.messages.filter((m, i) =>
        !(i === state.messages.length - 1 && m.role === 'assistant'));
    }

    node = document.createElement('div');
    node.className = 'msg assistant';
    node.appendChild(roleNode(state.model, Date.now()));
    bodyEl = document.createElement('div');
    bodyEl.className = 'bubble md';
    bodyEl.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    node.appendChild(bodyEl);
    el.thread.appendChild(node);
    scrollToBottom(true);

    const paint = () => {
      raf = 0;
      if (reasoningEl && reasoningBuf) {
        const rb = reasoningEl.querySelector('.r-body');
        rb.textContent = reasoningBuf;
        rb.scrollTop = rb.scrollHeight;
      }
      if (contentBuf) bodyEl.innerHTML = window.md.render(contentBuf);
      scrollToBottom(false);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: state.controller.signal,
        body: JSON.stringify({
          conversationId: state.currentId,
          text: text,
          attachmentIds: attachmentIds,
          effort: state.effort,
          model: state.model,
          regenerate: !!opts.regenerate,
          webSearch: !!state.webSearch,
          userName: state.userName || '',
          customInstructions: state.customInstructions || '',
          lang: state.lang || 'tr',
        }),
      });
      if (!res.ok || !res.body) throw new Error(t('serverConnectError') + ' (' + res.status + ')');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let failed = null;

      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const raw = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!raw.startsWith('data:')) continue;

          let ev;
          try { ev = JSON.parse(raw.slice(5).trim()); } catch { continue; }

          if (ev.type === 'user_message') {
            userSaved = true;
            state.messages.push(ev.message);
            ensureDayDivider(ev.message.created_at, node);
            el.thread.insertBefore(messageNode(ev.message), node);
            scrollToBottom(true);
          } else if (ev.type === 'start') {
            if (ev.conversationId) { state.currentId = ev.conversationId; setHash('#/c/' + ev.conversationId); }
            if (ev.notes && ev.notes.length) showNotice(ev.notes.join(' • '), 'warn');
          } else if (ev.type === 'reasoning') {
            if (!reasoningEl) {
              reasoningEl = reasoningNode('', true);
              reasoningEl.open = true;
              node.insertBefore(reasoningEl, bodyEl);
            }
            reasoningBuf += ev.text;
            schedule();
          } else if (ev.type === 'content') {
            if (!contentBuf) bodyEl.innerHTML = '';
            contentBuf += ev.text;
            schedule();
          } else if (ev.type === 'error') {
            failed = ev;
          } else if (ev.type === 'done') {
            state.messages.push(ev.message);
            if (ev.conversation) {
              el.chatTitle.textContent = cleanDisplayTitle(ev.conversation.title);
              state.currentId = ev.conversation.id;
            }
          }
        }
      }

      if (raf) cancelAnimationFrame(raf);
      paint();

      if (reasoningEl) {
        reasoningEl.classList.remove('live');
        reasoningEl.open = false;
        reasoningEl.querySelector('.label').textContent = t('thoughtProcess');
      }

      if (failed) {
        if (!contentBuf) bodyEl.innerHTML = '';
        node.appendChild(errorNode(failed, { userSaved: userSaved, text: text }));
      } else {
        const last = state.messages[state.messages.length - 1];
        if (last && last.role === 'assistant') {
          node.dataset.id = last.id;
          const actual = (last.meta && last.meta.model) || state.model;
          node.replaceChild(roleNode(actual, last.created_at), node.querySelector('.msg-role'));
          node.appendChild(assistantActions(last));
        }
      }
      await loadHistory();
    } catch (e) {
      if (raf) cancelAnimationFrame(raf);
      if (e.name === 'AbortError') {
        if (!contentBuf) node.remove();
        else bodyEl.innerHTML = window.md.render(contentBuf + '\n\n_(durduruldu)_');
      } else {
        bodyEl.innerHTML = '';
        node.appendChild(errorNode({ message: e.message, retryable: true }, { userSaved: userSaved, text: text }));
      }
    } finally {
      state.streaming = false;
      state.controller = null;
      el.sendBtn.classList.remove('streaming');
      updateSendState();
      el.input.focus();
      refreshBalance();
    }
  }

  function errorNode(info, ctx) {
    const box = document.createElement('div');
    box.className = 'err-box';
    const msg = document.createElement('span');
    msg.textContent = (info.retryable ? t('temporaryError') : t('errorPrefix')) + info.message;
    box.appendChild(msg);

    // Gunluk bedava kota dolduysa, kotaya tabi olmayan bir modelle denemeyi oner.
    const quotaHit = /free-models-per-day/i.test(info.message || '');
    const spare = (state.config.unmetered || []).find((id) => id !== state.model);
    if (quotaHit && spare) {
      const alt = document.createElement('button');
      const altBrand = brandFor(spare);
      alt.type = 'button';
      alt.className = 'err-alt-btn';
      alt.innerHTML = `<span class="ico">${altBrand.mark}</span> ${altBrand.label} ile dene`;
      alt.addEventListener('click', async () => {
        state.model = spare;
        localStorage.setItem('ox.model', spare);
        syncPicker();
        box.remove();
        if (ctx && ctx.text) send({ text: ctx.text });
      });
      box.appendChild(alt);
    }

    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = t('retry');
    retry.addEventListener('click', () => {
      const host = box.closest('.msg');
      if (host) host.remove();
      if (ctx && ctx.userSaved) {
        // Mesaj sunucuda duruyor: turu geçmişten yeniden üret.
        send({ regenerate: true });
      } else {
        // Sunucuya hiç ulaşmadı: metni geri ver, kullanıcı yeniden göndersin.
        if (ctx && ctx.text) { el.input.value = ctx.text; autoGrow(); }
        updateSendState();
        el.input.focus();
      }
    });
    box.appendChild(retry);
    return box;
  }

  /* ============================================================ görsel üretimi */

  async function generateImage(prompt, attachmentIds) {
    if (!prompt) { showNotice(t('promptRequiredForImage'), 'warn'); return; }

    el.input.value = '';
    autoGrow();
    clearAttachments();
    el.welcome.hidden = true;
    state.streaming = true;
    el.sendBtn.classList.add('streaming');
    updateSendState();

    const node = document.createElement('div');
    node.className = 'msg assistant';
    node.innerHTML = '<div class="msg-role"><span class="brand-mark emoji">🎨</span>'
      + '<span>' + t('generatingImage') + '</span></div>'
      + '<div class="bubble md"><span class="typing"><i></i><i></i><i></i></span></div>';
    el.thread.appendChild(node);
    scrollToBottom(true);

    try {
      const out = await apiJson('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: state.currentId, prompt: prompt, attachmentIds: attachmentIds }),
      });
      state.currentId = out.conversation.id;
      setHash('#/c/' + out.conversation.id);
      el.chatTitle.textContent = cleanDisplayTitle(out.conversation.title);
      state.messages.push(out.userMessage, out.message);
      node.remove();
      ensureDayDivider(out.userMessage.created_at);
      el.thread.appendChild(messageNode(out.userMessage));
      el.thread.appendChild(messageNode(out.message));
      scrollToBottom(true);
      await loadHistory();
    } catch (e) {
      node.querySelector('.bubble').innerHTML = '';
      node.appendChild(errorNode({ message: e.message, retryable: true }, { userSaved: false, text: prompt }));
    } finally {
      state.streaming = false;
      el.sendBtn.classList.remove('streaming');
      updateSendState();
    }
  }

  /* ============================================================ besteci davranışı */

  function autoGrow() {
    el.input.style.height = 'auto';
    el.input.style.height = Math.min(el.input.scrollHeight, 216) + 'px';
  }

  /** Seçili model + derinliği düğmeye, karşılama ekranına ve kenar çubuğuna yansıtır. */
  function syncPicker() {
    const brand = brandFor(state.model);
    const effort = EFFORTS.find((e) => e.id === state.effort) || EFFORTS[1];
    const effortNameKey = effort.id === 'low' ? 'effortLow' : effort.id === 'high' ? 'effortHigh' : 'effortMax';
    const effortName = t(effortNameKey);

    // Besteci düğmesi
    el.pickerMark.className = 'brand-mark' + (brand.emoji ? ' emoji' : '');
    el.pickerMark.textContent = brand.mark;
    el.pickerMark.style.setProperty('--brand', brand.color);
    el.pickerName.textContent = brand.label;
    el.pickerSub.textContent = effortName;
    el.pickerBtn.title = brand.id + ' · ' + effortName;

    // Karşılama ekranı
    if (el.welcomeMark) {
      el.welcomeMark.className = 'welcome-mark brand-mark' + (brand.emoji ? ' emoji' : '');
      el.welcomeMark.textContent = brand.mark;
      el.welcomeMark.style.setProperty('--brand', brand.color);
    }
    if (el.welcomeSub) {
      el.welcomeSub.textContent = brand.label;
    }

    // Kenar çubuğu alt bilgisi
    el.modelName.textContent = brand.label;
    el.modelName.title = brand.id;
    const old = el.modelChip.querySelector('.brand-mark');
    if (old) old.remove();
    el.modelChip.insertBefore(brandMark(brand), el.modelName);

    // Menüdeki işaretler
    for (const b of el.pickerMenu.querySelectorAll('[data-model]')) {
      b.setAttribute('aria-checked', b.dataset.model === state.model ? 'true' : 'false');
    }
    for (const b of el.pickerMenu.querySelectorAll('[data-effort]')) {
      b.setAttribute('aria-checked', b.dataset.effort === state.effort ? 'true' : 'false');
    }
  }

  function openPicker(on) {
    el.pickerMenu.hidden = !on;
    el.pickerBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  function pickerOption(brand, name, desc, dataAttr, value) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'picker-opt';
    b.setAttribute('role', 'menuitemradio');
    b.dataset[dataAttr] = value;
    if (brand) b.appendChild(brandMark(brand));

    const text = document.createElement('span');
    text.className = 'po-text';
    const n = document.createElement('span');
    n.className = 'po-name';
    n.textContent = name;
    const d = document.createElement('span');
    d.className = 'po-desc';
    d.textContent = desc;
    text.append(n, d);
    b.appendChild(text);

    const check = document.createElement('span');
    check.className = 'po-check';
    check.textContent = '✓';
    b.appendChild(check);
    return b;
  }

  function formatTokens(n) {
    if (!n || n <= 0) return null;
    if (n >= 950_000) {
      const m = n / 1_000_000;
      const m2 = n / 1_048_576;
      const val = Math.abs(m - Math.round(m)) <= Math.abs(m2 - Math.round(m2)) ? m : m2;
      return (val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)) + 'M';
    }
    if (n % 1000 === 0) return (n / 1000) + 'K';
    if (n % 1024 === 0) return (n / 1024) + 'K';
    const k1000 = n / 1000;
    const k1024 = n / 1024;
    const k = Math.abs(k1000 - Math.round(k1000)) <= Math.abs(k1024 - Math.round(k1024)) ? k1000 : k1024;
    return Math.round(k) + 'K';
  }

  const DEFAULT_CONTEXTS = {
    'z-ai/glm-5.3-flash': 1310720,
    'nvidia/nemotron-3-super-120b-a12b:free': 262144,
    'nvidia/nemotron-3.5-lightning:free': 1000000,
    'dots-studio/dots-3-note-preview:free': 512000,
    'inclusionai/ling-3.0-flash-fin:free': 262144,
    'inclusionai/ling-3.0-flash-vl:free': 262144,
    'cohere/north-mini-code:free': 256000,
    'liquid/lfm-2.5-2.6b:free': 65536,
    'nex-agi/nex-n2.5-mini:free': 262144,
    'google/gemma-4-26b-a4b-it:free': 262144,
    'openrouter/free': 200000,
    'hf:Qwen/Qwen3-4B-Instruct-2507': 32768,
    'hf:openai/gpt-oss-20b': 131072,
    'hf:meta-llama/Llama-3.3-70B-Instruct': 131072,
    'hf:deepseek-ai/DeepSeek-V3.2': 163840,
    'hf:google/gemma-4-31B-it': 131072,
    'hf:Qwen/Qwen3-235B-A22B-Instruct-2507': 32768,
  };

  function isWebCompatible(id) {
    return !String(id || '').startsWith('hf:');
  }

  function modelPickerOption(m, brand) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'picker-opt';
    b.setAttribute('role', 'menuitemradio');
    b.dataset.model = m.id;
    if (brand) b.appendChild(brandMark(brand));

    const text = document.createElement('span');
    text.className = 'po-text';
    const n = document.createElement('span');
    n.className = 'po-name';
    n.textContent = m.label;

    const d = document.createElement('span');
    d.className = 'po-desc';

    // 1. Uretici ismi (nvidia, z.ai, google, cohere vb.)
    const v = document.createElement('span');
    v.className = 'po-vendor';
    v.textContent = brand.vendor || brand.name;
    d.appendChild(v);

    // 2. Baglam (1.3M, 262K, 32K vb.)
    const ctx = m.context || DEFAULT_CONTEXTS[m.id] || 0;
    const ctxFormatted = formatTokens(ctx);
    if (ctxFormatted) {
      const sep = document.createElement('span');
      sep.className = 'po-sep';
      sep.textContent = '·';
      const c = document.createElement('span');
      c.className = 'po-ctx';
      c.textContent = ctxFormatted;
      d.append(sep, c);
    }

    // 3. Web arama destegi: Destekliyorsa mavi, desteklemiyorsa kirmizi SVG kure
    const isWeb = isWebCompatible(m.id);
    const sep2 = document.createElement('span');
    sep2.className = 'po-sep';
    sep2.textContent = '·';
    const webBadge = document.createElement('span');
    webBadge.className = 'po-web-badge ' + (isWeb ? 'web-ok' : 'web-no');
    webBadge.title = isWeb ? t('webSupported') : t('webUnsupported');
    webBadge.innerHTML = '<svg viewBox="0 0 24 24" class="po-web-svg"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
    d.append(sep2, webBadge);

    text.append(n, d);
    b.appendChild(text);

    const check = document.createElement('span');
    check.className = 'po-check';
    check.textContent = '✓';
    b.appendChild(check);
    return b;
  }

  function buildPicker() {
    el.modelList.textContent = '';
    const allModels = state.config.chatModels || [];
    const openrouterModels = allModels.filter((m) => !String(m.id).startsWith('hf:'));
    const hfModels = allModels.filter((m) => String(m.id).startsWith('hf:'));

    function renderModelGroup(title, list) {
      if (!list.length) return;
      const head = document.createElement('div');
      head.className = 'picker-section-title';
      head.textContent = title;
      el.modelList.appendChild(head);

      for (const m of list) {
        const brand = brandFor(m.id);
        const opt = modelPickerOption(m, brand);
        const isWeb = isWebCompatible(m.id);
        opt.addEventListener('click', () => {
          state.model = m.id;
          localStorage.setItem('ox.model', m.id);
          syncPicker();
          openPicker(false);
          if (state.webSearch && !isWebCompatible(m.id)) {
            showNotice(t('webIncompatibleNotice', { model: m.label }), 'warn');
          } else {
            showNotice(m.label + ' (' + m.id + ')');
          }
        });
        el.modelList.appendChild(opt);
      }
    }

    renderModelGroup('OpenRouter', openrouterModels);
    renderModelGroup('Hugging Face', hfModels);

    el.effortList.textContent = '';
    for (const e of EFFORTS) {
      const nameKey = e.id === 'low' ? 'effortLow' : e.id === 'high' ? 'effortHigh' : 'effortMax';
      const descKey = e.id === 'low' ? 'effortLowDesc' : e.id === 'high' ? 'effortHighDesc' : 'effortMaxDesc';
      const opt = pickerOption(null, t(nameKey), t(descKey), 'effort', e.id);
      opt.addEventListener('click', () => {
        state.effort = e.id;
        localStorage.setItem('ox.effort', e.id);
        syncPicker();
        openPicker(false);
      });
      el.effortList.appendChild(opt);
    }
  }

  function openPlusMenu(on) {
    el.plusMenu.hidden = !on;
    el.plusBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
  }

  function setImageMode(on) {
    state.imageMode = on;
    el.menuImage.setAttribute('aria-pressed', on ? 'true' : 'false');
    el.composer.classList.toggle('image-mode', on);
    el.input.placeholder = on ? t('imageModePlaceholder') : t('inputPlaceholder');
    el.disclaimer.textContent = on
      ? t('imageModeDisclaimer', { model: state.config.imageModel || '' })
      : t('disclaimer');
    el.input.focus();
  }

  function openLightbox(url) {
    el.lightboxImg.src = url;
    el.lightbox.hidden = false;
  }

  /* ============================================================ olay bağlama */

  function bind() {
    el.newChatBtn.addEventListener('click', newChat);

    const isNarrow = () => window.matchMedia('(max-width: 860px)').matches;
    const setCollapsed = (on) => {
      el.app.classList.toggle('collapsed', on);
      localStorage.setItem('ox.collapsed', on ? '1' : '0');
    };

    // Kenar çubuğundaki düğme kapatır, üst çubuktaki düğme geri açar.
    el.collapseBtn.addEventListener('click', () => {
      if (isNarrow()) el.app.classList.remove('sb-open');
      else setCollapsed(true);
    });
    el.openSidebarBtn.addEventListener('click', () => {
      if (isNarrow()) el.app.classList.add('sb-open');
      else setCollapsed(false);
    });
    el.scrim.addEventListener('click', () => el.app.classList.remove('sb-open'));

    el.themeBtn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('ox.theme', next);
    });

    if (el.exportBtn) el.exportBtn.addEventListener('click', exportCurrentChat);
    if (el.settingsBtn) el.settingsBtn.addEventListener('click', openSettings);
    if (el.balanceChip) el.balanceChip.addEventListener('click', openSettings);
    if (el.closeSettingsBtn) el.closeSettingsBtn.addEventListener('click', closeSettings);
    if (el.saveSettingsBtn) el.saveSettingsBtn.addEventListener('click', saveSettings);
    if (el.exportAllChatsBtn) el.exportAllChatsBtn.addEventListener('click', exportAllChats);
    if (el.settingsModal) {
      el.settingsModal.addEventListener('click', (e) => {
        if (e.target === el.settingsModal) closeSettings();
      });
    }

    if (el.micBtn) el.micBtn.addEventListener('click', toggleMic);

    if (el.importAllChatsBtn) el.importAllChatsBtn.addEventListener('click', () => el.importFileInput?.click());
    if (el.importFileInput) {
      el.importFileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          const payload = Array.isArray(data) ? { conversations: data, messages: [] } : data;
          const res = await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const j = await res.json();
          if (j.ok) {
            showNotice(t('importSuccess', { c: j.conversations || 0, m: j.messages || 0 }), 'ok');
            await loadHistory();
            el.settingsModal.hidden = true;
          } else {
            showNotice(t('importError'), 'warn');
          }
        } catch {
          showNotice(t('importError'), 'warn');
        } finally {
          el.importFileInput.value = '';
        }
      });
    }

    let currentArtifactCode = '';
    function preparePreviewHtml(rawCode) {
      let code = String(rawCode || '').trim();
      const hasHtml = /<html[\s>]/i.test(code);
      const hasHead = /<head[\s>]/i.test(code);

      const mobileAdapter = `
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<style>
  html {
    width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
    scroll-behavior: smooth !important;
    -webkit-text-size-adjust: 100% !important;
  }
  body {
    width: 100% !important;
    min-height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important;
    touch-action: pan-y pinch-zoom !important;
  }
  canvas {
    max-width: 100% !important;
    max-height: 100vh !important;
    object-fit: contain !important;
    margin: 0 auto !important;
    display: block !important;
  }
</style>
<script>
(function() {
  window.focus();

  // Link navigasyonunun ana uygulamaya donmesini engelle
  document.addEventListener('click', function(e) {
    const a = e.target && e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      if (id) {
        try {
          const target = document.getElementById(id) || document.querySelector('[name="' + id + '"]') || document.querySelector('.' + id);
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {}
      }
      return;
    }
    e.preventDefault();
    console.log('[ISAEV Preview] Link navigasyonu yakalandi:', href);
  }, true);

  // Oyun kontrolleri: Sadece canvas elementine dokunuldugunda tus uret
  function triggerActionKeys() {
    try {
      const keys = [
        { key: ' ', code: 'Space', keyCode: 32, which: 32 },
        { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38, which: 38 },
        { key: 'Enter', code: 'Enter', keyCode: 13, which: 13 }
      ];
      for (const k of keys) {
        const kd = new KeyboardEvent('keydown', { ...k, bubbles: true, cancelable: true });
        const ku = new KeyboardEvent('keyup', { ...k, bubbles: true, cancelable: true });
        window.dispatchEvent(kd);
        document.dispatchEvent(kd);
        if (document.body) document.body.dispatchEvent(kd);
        setTimeout(() => {
          window.dispatchEvent(ku);
          document.dispatchEvent(ku);
          if (document.body) document.body.dispatchEvent(ku);
        }, 40);
      }
    } catch (e) {}
  }

  window.addEventListener('pointerdown', function(e) {
    if (e.target && (e.target.tagName === 'CANVAS' || e.target.closest('canvas'))) {
      triggerActionKeys();
    }
  }, { passive: true });
})();
<\/script>
`;

      if (hasHead) {
        return code.replace(/<head[\s>]/i, (m) => m + '\n' + mobileAdapter);
      } else if (hasHtml) {
        return code.replace(/<html[\s>]/i, (m) => m + '\n<head>' + mobileAdapter + '</head>');
      } else {
        return '<!DOCTYPE html>\n<html><head>' + mobileAdapter + '</head><body>\n' + code + '\n</body></html>';
      }
    }

    function openArtifactPreview(rawCode) {
      if (!el.artifactModal || !el.artifactIframe) return;
      currentArtifactCode = rawCode;
      el.artifactIframe.srcdoc = preparePreviewHtml(rawCode);
      el.artifactModal.hidden = false;
      setTimeout(() => {
        try {
          el.artifactIframe.focus();
          if (el.artifactIframe.contentWindow) el.artifactIframe.contentWindow.focus();
        } catch (e) {}
      }, 120);
    }

    function closeArtifactPreview() {
      if (!el.artifactModal) return;
      el.artifactModal.hidden = true;
      if (el.artifactIframe) el.artifactIframe.srcdoc = '';
    }

    if (el.closeArtifactBtn) el.closeArtifactBtn.addEventListener('click', closeArtifactPreview);
    if (el.reloadArtifactBtn) {
      el.reloadArtifactBtn.addEventListener('click', () => {
        if (currentArtifactCode && el.artifactIframe) {
          el.artifactIframe.srcdoc = '';
          setTimeout(() => {
            el.artifactIframe.srcdoc = preparePreviewHtml(currentArtifactCode);
            setTimeout(() => {
              try {
                el.artifactIframe.focus();
                if (el.artifactIframe.contentWindow) el.artifactIframe.contentWindow.focus();
              } catch (e) {}
            }, 100);
          }, 60);
        }
      });
    }
    if (el.artifactModal) {
      el.artifactModal.addEventListener('click', (e) => {
        if (e.target === el.artifactModal) closeArtifactPreview();
      });
    }
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preview-code]');
      if (!btn) return;
      const block = btn.closest('.code-block');
      const code = block && block.querySelector('pre code');
      if (!code) return;
      openArtifactPreview(code.textContent);
    });

    if (el.webSearchBtn) {
      el.webSearchBtn.addEventListener('click', () => {
        state.webSearch = !state.webSearch;
        updateWebSearchBtn();
        if (state.webSearch) {
          if (!isWebCompatible(state.model)) {
            showNotice(t('webIncompatibleNotice', { model: state.model }), 'warn');
          } else {
            showNotice(t('webActiveNotice'), 'ok');
          }
        } else {
          showNotice(t('webInactiveNotice'));
        }
      });
    }

    let searchTimer = null;
    el.searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(loadHistory, 220);
    });

    el.clearAllBtn.addEventListener('click', async () => {
      if (!confirm(t('confirmClearAllHistory'))) return;
      await apiJson('/api/conversations', { method: 'DELETE' });
      newChat();
      await loadHistory();
    });

    el.input.addEventListener('input', () => { autoGrow(); updateSendState(); });
    el.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        if (!el.sendBtn.disabled && !state.streaming) send({});
      }
    });

    el.sendBtn.addEventListener('click', () => (state.streaming ? stopStream() : send({})));

    el.plusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPlusMenu(el.plusMenu.hidden);
    });
    el.menuUpload.addEventListener('click', () => { openPlusMenu(false); el.fileInput.click(); });
    el.menuImage.addEventListener('click', () => {
      openPlusMenu(false);
      if (!state.imageMode && state.config.imageGeneration === false) {
        showNotice(t('imageCreditExhausted'), 'warn');
        return;
      }
      setImageMode(!state.imageMode);
    });
    // Disari tiklayinca menu kapansin.
    document.addEventListener('click', (e) => {
      if (!el.plusMenu.hidden && !el.plusMenu.contains(e.target)) openPlusMenu(false);
    });

    el.fileInput.addEventListener('change', () => {
      uploadFiles(el.fileInput.files);
      el.fileInput.value = '';
    });

    el.pickerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openPicker(el.pickerMenu.hidden);
    });
    document.addEventListener('click', (e) => {
      if (!el.pickerMenu.hidden && !el.pickerMenu.contains(e.target)) openPicker(false);
    });

    // Panodan görsel yapıştırma
    el.input.addEventListener('paste', (e) => {
      const files = Array.from(e.clipboardData ? e.clipboardData.files : []);
      if (files.length) { e.preventDefault(); uploadFiles(files); }
    });

    // Sürükle bırak
    let dragDepth = 0;
    document.addEventListener('dragenter', (e) => {
      if (!e.dataTransfer || !Array.from(e.dataTransfer.types).includes('Files')) return;
      e.preventDefault();
      dragDepth++;
      el.composer.style.borderColor = 'var(--border-strong)';
    });
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('dragleave', () => {
      if (--dragDepth <= 0) { dragDepth = 0; el.composer.style.borderColor = ''; }
    });
    document.addEventListener('drop', (e) => {
      if (!e.dataTransfer || !e.dataTransfer.files.length) return;
      e.preventDefault();
      dragDepth = 0;
      el.composer.style.borderColor = '';
      uploadFiles(e.dataTransfer.files);
    });

    // Kod bloğu kopyalama (olay yetkilendirme)
    el.thread.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy-code]');
      if (!btn) return;
      const code = btn.closest('.code-block').querySelector('pre code');
      copyText(code.textContent);
    });

    el.suggestions.addEventListener('click', (e) => {
      const btn = e.target.closest('.suggestion');
      if (!btn) return;
      setImageMode(btn.dataset.image === '1');
      el.input.value = btn.dataset.prompt;
      autoGrow();
      updateSendState();
      el.input.focus();
    });

    el.toBottomBtn.addEventListener('click', () => {
      setStick(true);
      el.threadScroll.scrollTo({ top: el.threadScroll.scrollHeight, behavior: 'smooth' });
    });
    watchUserScroll();

    el.lightbox.addEventListener('click', () => { el.lightbox.hidden = true; el.lightboxImg.src = ''; });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.settingsModal && !el.settingsModal.hidden) closeSettings();
        else if (!el.plusMenu.hidden) { openPlusMenu(false); el.input.focus(); }
        else if (!el.pickerMenu.hidden) { openPicker(false); el.input.focus(); }
        else if (!el.lightbox.hidden) { el.lightbox.hidden = true; el.lightboxImg.src = ''; }
        else if (state.streaming) stopStream();
      }
      // Ctrl/Cmd + K: aramaya odaklan, Ctrl/Cmd + Shift + O: yeni sohbet
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        el.app.classList.remove('collapsed');
        localStorage.setItem('ox.collapsed', '0');
        if (window.matchMedia('(max-width: 860px)').matches) el.app.classList.add('sb-open');
        el.searchInput.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        newChat();
      }
    });

    window.addEventListener('hashchange', () => {
      if (ignoreHash) return;
      const id = conversationIdFromHash();
      if (id && id !== state.currentId) openConversation(id);
      else if (!id) newChat();
    });

    window.addEventListener('beforeunload', () => { if (state.controller) state.controller.abort(); });
  }

  /* ============================================================ başlangıç */

  async function init() {
    document.documentElement.dataset.theme = localStorage.getItem('ox.theme') || 'dark';
    if (localStorage.getItem('ox.collapsed') === '1') el.app.classList.add('collapsed');

    state.lang = localStorage.getItem('ox.lang') || 'tr';
    state.userName = localStorage.getItem('ox.user_name') || '';
    state.customInstructions = localStorage.getItem('ox.custom_instructions') || '';
    state.customApiKey = localStorage.getItem('ox.custom_openrouter_key') || '';
    state.customHfKey = localStorage.getItem('ox.custom_hf_key') || '';
    state.webSearchDefault = localStorage.getItem('ox.web_search_default') === '1';
    state.webSearch = state.webSearchDefault;
    updateWebSearchBtn();

    bind();
    applyLanguage(state.lang);
    if (el.settingCustomApiKey) el.settingCustomApiKey.value = state.customApiKey;
    if (el.settingCustomHfKey) el.settingCustomHfKey.value = state.customHfKey;
    autoGrow();
    updateSendState();

    try {
      state.config = await apiJson('/api/config');

      const models = state.config.chatModels || [];
      const savedModel = localStorage.getItem('ox.model');
      state.model = models.some((m) => m.id === savedModel) ? savedModel : state.config.chatModel;

      const savedEffort = localStorage.getItem('ox.effort');
      state.effort = EFFORTS.some((e) => e.id === savedEffort)
        ? savedEffort
        : (state.config.defaultEffort || 'high');

      buildPicker();
      syncPicker();
      updateBalanceDisplay(state.config.credits, state.config.creditDetails);
    } catch (e) {
      showNotice(t('configLoadError') + ': ' + e.message, 'warn');
    }

    await loadHistory();

    const startId = conversationIdFromHash();
    if (startId) await openConversation(startId);
    else renderMessages();
  }

  init();
})();
