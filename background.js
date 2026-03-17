const OBFUSCATED_RUNTIME_API_CONFIG = Object.freeze({
  endpoint: Object.freeze({
    key: 23,
    bytes: [
      127, 99, 99, 103, 100, 45, 56, 56, 118, 103, 126, 57, 123, 120, 121, 112,
      116, 118, 99, 57, 116, 127, 118, 99, 56, 120, 103, 114, 121, 118, 126, 56,
      97, 38, 56, 116, 127, 118, 99, 56, 116, 120, 122, 103, 123, 114, 99, 126,
      120, 121, 100
    ]
  }),
  token: Object.freeze({
    key: 71,
    bytes: [
      38, 44, 24, 117, 9, 22, 116, 38, 33, 126, 0, 50, 116, 63, 13, 116,
      21, 112, 118, 35, 47, 115, 117, 43, 118, 47, 43, 118, 6, 31, 112, 16
    ]
  })
});
const API_ENDPOINT = decodeObfuscatedText(OBFUSCATED_RUNTIME_API_CONFIG.endpoint);
const EMBEDDED_API_KEY = decodeObfuscatedText(OBFUSCATED_RUNTIME_API_CONFIG.token);
const PRIMARY_MODEL_NAME = "LongCat-Flash-Lite";
const BACKUP_MODEL_NAME = "LongCat-Flash-Chat";
const DEFAULT_MODEL_CANDIDATES = Object.freeze([PRIMARY_MODEL_NAME, BACKUP_MODEL_NAME]);
const DEFAULT_RUNTIME_API_CONFIG = Object.freeze({
  endpoint: API_ENDPOINT,
  apiKey: EMBEDDED_API_KEY,
  primaryModel: PRIMARY_MODEL_NAME,
  backupModel: BACKUP_MODEL_NAME
});
const LEGACY_API_KEY_STORAGE_KEY = "longcatApiKey";
const LEGACY_API_ENDPOINT_STORAGE_KEY = "openaiApiEndpoint";
const LEGACY_API_KEY_STORAGE_SCOPE_KEY = "apiKeyStorageScope";
const API_CONFIG_STORAGE_KEY = "runtimeApiConfig";
const STORAGE_AREA_LOCAL = "local";
const API_CONFIG_MODE_BUILT_IN = "built-in";
const API_CONFIG_MODE_CUSTOM = "custom";
const REMOVED_SETTINGS_MESSAGE = "当前版本已移除设置页，API 地址与 Token 已固定在扩展内部。";
const GLOBAL_SWITCH_ONLY_MESSAGE = "当前版本仅支持全局总开关，不再提供按网站单独配置。";
const GLOBAL_TRANSLATION_ENABLED_KEY = "globalTranslationEnabled";
const TARGET_LANGUAGE_STORAGE_KEY = "targetTranslationLanguage";
const PERFORMANCE_SETTINGS_KEY = "translationPerformanceSettings";
const DEFAULT_TARGET_LANGUAGE_CODE = "zh-Hans";
const TARGET_LANGUAGE_CONFIGS = Object.freeze({
  "zh-Hans": Object.freeze({
    code: "zh-Hans",
    label: "简体中文",
    systemName: "简体中文",
    targetHint: "只允许输出自然简体中文，不要输出英文拼写、拼音或中英混排。",
    preserveHint: "若输入已经是自然简体中文，可保持原意并只做必要的轻微润色。",
    finalHint: "5) 译文必须是自然简体中文，不要残留大段外文。"
  }),
  en: Object.freeze({
    code: "en",
    label: "英语",
    systemName: "英语",
    targetHint: "只允许输出自然英文，不要输出中文或中英混排。",
    preserveHint: "若输入已经是自然英文，可保持原意并只做必要的轻微润色。",
    finalHint: "5) 译文必须是自然英文，不要输出非英文原文。"
  })
});

const SITE_RULES_KEY = "alwaysTranslateHosts";
const SITE_RULES_META_KEY = "alwaysTranslateHostsMeta";
const SITE_RULES_CHUNK_PREFIX = "alwaysTranslateHostsChunk_";
const SITE_RULES_STORAGE_BACKEND_KEY = "alwaysTranslateHostsStorageBackend";
const SITE_RULES_STORAGE_BACKEND_SYNC = "sync";
const SITE_RULES_STORAGE_BACKEND_LOCAL = "local";
const SITE_RULES_CHUNK_MAX_CHARS = 6800;
const DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX = "ai-translate::";
const GLOBAL_DYNAMIC_TRANSLATOR_SCRIPT_ID = `${DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX}global`;
const LEGACY_DYNAMIC_TRANSLATOR_SCRIPT_IDS = ["llm-translate-site-script"];
const DYNAMIC_TRANSLATOR_SCRIPT_FILE = "content.js";
const TAB_SYNC_MAX_CONCURRENT = 3;
const API_CONNECTION_TEST_TIMEOUT_MS = 8000;
const API_CONNECTION_TEST_MAX_TOKENS = 8;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const SAFE_MAX_OUTPUT_TOKENS = 12288;
const DEFAULT_OUTPUT_TOKENS = 4096;
const MIN_OUTPUT_TOKENS = 512;
const REQUEST_OVERHEAD_TOKENS = 320;
const CONTEXT_SAFETY_TOKENS = 1024;
const SHRINK_RATIO_ON_CONTEXT_ERROR = 0.62;
const MAX_CONTEXT_RETRY = 5;
const TRANSLATION_RECOVERY_MAX_DEPTH = 5;
const REQUEST_TIMEOUT_MS = 18000;
const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 28000;
const CIRCUIT_BREAKER_HALF_OPEN_MAX_IN_FLIGHT = 1;
const GLOBAL_API_MAX_CONCURRENT = 4;
const GLOBAL_API_MIN_INTERVAL_MS = 60;
const TRANSLATION_MEMORY_LIMIT = 1600;
const TRANSLATION_MEMORY_MAX_TEXT_CHARS = 420;
const providerCircuitBreakerStates = new Map();
const translationMemoryCache = new Map();
const inFlightTranslationRequests = new Map();
const contextRequestControllers = new Map();
const pausedTabs = new Map();
const hostScriptOperationLocks = new Map();
const tabScriptEnsureLocks = new Map();
const globalApiLimiterState = {
  activeCount: 0,
  lastStartedAt: 0,
  timer: null,
  queue: []
};
const modelApiLimiterStates = new Map();
const DEFAULT_MODEL_RATE_LIMIT_STRATEGY = Object.freeze({
  initialConcurrent: 3,
  minConcurrent: 1,
  maxConcurrent: 4,
  initialMinIntervalMs: 80,
  maxMinIntervalMs: 1500,
  slowResponseMs: 5000,
  severeSlowResponseMs: 10000,
  cooldownBaseMs: 1200,
  timeoutCooldownMs: 2400,
  recoverySuccesses: 10,
  recoveryIntervalStepMs: 60
});
const FLASH_LITE_RATE_LIMIT_STRATEGY = Object.freeze({
  initialConcurrent: 4,
  minConcurrent: 1,
  maxConcurrent: 6,
  initialMinIntervalMs: 40,
  maxMinIntervalMs: 1200,
  slowResponseMs: 4500,
  severeSlowResponseMs: 9000,
  cooldownBaseMs: 900,
  timeoutCooldownMs: 1800,
  recoverySuccesses: 14,
  recoveryIntervalStepMs: 40
});
const FLASH_CHAT_RATE_LIMIT_STRATEGY = Object.freeze({
  initialConcurrent: 2,
  minConcurrent: 1,
  maxConcurrent: 3,
  initialMinIntervalMs: 160,
  maxMinIntervalMs: 2200,
  slowResponseMs: 3000,
  severeSlowResponseMs: 7000,
  cooldownBaseMs: 1800,
  timeoutCooldownMs: 4200,
  recoverySuccesses: 8,
  recoveryIntervalStepMs: 80
});
const RECOMMENDED_PERFORMANCE_SETTINGS = Object.freeze({
  speedMode: "recommended",
  contentMaxConcurrentRequests: 4,
  longTextMaxConcurrent: 2,
  apiMaxConcurrent: GLOBAL_API_MAX_CONCURRENT,
  apiMinIntervalMs: GLOBAL_API_MIN_INTERVAL_MS,
  contentAdaptiveItemOffset: 0,
  contentAdaptiveCharOffset: 0
});
let runtimePerformanceSettings = sanitizePerformanceSettings();
let performanceSettingsLoadPromise = null;
let runtimeApiConfig = sanitizeRuntimeApiConfig();
let apiConfigLoadPromise = null;
let runtimeTargetLanguageCode = DEFAULT_TARGET_LANGUAGE_CODE;
let targetLanguageLoadPromise = null;

function sanitizePerformanceSettings(_rawSettings = null) {
  return {
    ...RECOMMENDED_PERFORMANCE_SETTINGS
  };
}

function sanitizeModelName(rawValue, fallback) {
  const value = String(rawValue ?? "").trim();
  return value || String(fallback || "").trim();
}

function sanitizeRuntimeApiConfig(rawConfig = null) {
  const raw = rawConfig && typeof rawConfig === "object" ? rawConfig : {};
  return {
    endpoint:
      normalizeApiEndpoint(raw.endpoint) || DEFAULT_RUNTIME_API_CONFIG.endpoint,
    apiKey:
      sanitizeApiKey(raw.apiKey) || DEFAULT_RUNTIME_API_CONFIG.apiKey,
    primaryModel: sanitizeModelName(raw.primaryModel, DEFAULT_RUNTIME_API_CONFIG.primaryModel),
    backupModel: sanitizeModelName(raw.backupModel, DEFAULT_RUNTIME_API_CONFIG.backupModel)
  };
}

function applyRuntimeApiConfig(nextConfig = null) {
  runtimeApiConfig = sanitizeRuntimeApiConfig(nextConfig);
  apiConfigLoadPromise = Promise.resolve(runtimeApiConfig);
  return runtimeApiConfig;
}

function sanitizeTargetLanguageCode(rawValue) {
  const value = String(rawValue ?? "").trim();
  return TARGET_LANGUAGE_CONFIGS[value] ? value : DEFAULT_TARGET_LANGUAGE_CODE;
}

function getTargetLanguageConfig(code = runtimeTargetLanguageCode) {
  return TARGET_LANGUAGE_CONFIGS[sanitizeTargetLanguageCode(code)];
}

function applyRuntimeTargetLanguage(code = DEFAULT_TARGET_LANGUAGE_CODE) {
  runtimeTargetLanguageCode = sanitizeTargetLanguageCode(code);
  targetLanguageLoadPromise = Promise.resolve(runtimeTargetLanguageCode);
  return runtimeTargetLanguageCode;
}

function applyRuntimePerformanceSettings(nextSettings) {
  runtimePerformanceSettings = sanitizePerformanceSettings(nextSettings);
  performanceSettingsLoadPromise = Promise.resolve(runtimePerformanceSettings);
  if (globalApiLimiterState.timer) {
    clearTimeout(globalApiLimiterState.timer);
    globalApiLimiterState.timer = null;
  }
  pumpGlobalApiQueue();
  return runtimePerformanceSettings;
}

async function loadPerformanceSettingsFromStorage() {
  const data = await chrome.storage.sync.get([PERFORMANCE_SETTINGS_KEY]);
  if (typeof data[PERFORMANCE_SETTINGS_KEY] !== "undefined") {
    await chrome.storage.sync.remove([PERFORMANCE_SETTINGS_KEY]);
  }
  return applyRuntimePerformanceSettings(RECOMMENDED_PERFORMANCE_SETTINGS);
}

async function loadApiConfigFromStorage() {
  const data = await chrome.storage.sync.get([API_CONFIG_STORAGE_KEY]);
  return applyRuntimeApiConfig(data?.[API_CONFIG_STORAGE_KEY]);
}

async function loadTargetLanguageFromStorage() {
  const data = await chrome.storage.sync.get([TARGET_LANGUAGE_STORAGE_KEY]);
  return applyRuntimeTargetLanguage(data?.[TARGET_LANGUAGE_STORAGE_KEY]);
}

async function ensurePerformanceSettingsLoaded() {
  if (!performanceSettingsLoadPromise) {
    performanceSettingsLoadPromise = loadPerformanceSettingsFromStorage().catch((error) => {
      performanceSettingsLoadPromise = null;
      throw error;
    });
  }
  return performanceSettingsLoadPromise;
}

async function ensureApiConfigLoaded() {
  if (!apiConfigLoadPromise) {
    apiConfigLoadPromise = loadApiConfigFromStorage().catch((error) => {
      apiConfigLoadPromise = null;
      throw error;
    });
  }
  return apiConfigLoadPromise;
}

async function ensureTargetLanguageLoaded() {
  if (!targetLanguageLoadPromise) {
    targetLanguageLoadPromise = loadTargetLanguageFromStorage().catch((error) => {
      targetLanguageLoadPromise = null;
      throw error;
    });
  }
  return targetLanguageLoadPromise;
}
const LANGUAGE_PROFILES = {
  en: {
    code: "en",
    name: "英语",
    role: "专业英语翻译专家",
    guidance: "准确处理时态、被动语态、术语缩写和长句结构。"
  },
  ja: {
    code: "ja",
    name: "日语",
    role: "专业日语翻译专家",
    guidance: "准确处理敬语、省略主语、和制术语与片假名外来词。"
  },
  ko: {
    code: "ko",
    name: "韩语",
    role: "专业韩语翻译专家",
    guidance: "准确处理敬语层级、词尾变化和韩语科技词汇。"
  },
  ru: {
    code: "ru",
    name: "俄语",
    role: "专业俄语翻译专家",
    guidance: "准确处理词形变化、语序和技术表达。"
  },
  fr: {
    code: "fr",
    name: "法语",
    role: "专业法语翻译专家",
    guidance: "准确处理阴阳性、时态和固定搭配。"
  },
  de: {
    code: "de",
    name: "德语",
    role: "专业德语翻译专家",
    guidance: "准确处理复合词、从句结构和专业术语。"
  },
  es: {
    code: "es",
    name: "西班牙语",
    role: "专业西班牙语翻译专家",
    guidance: "准确处理时态变化、倒装和地区常见表达。"
  },
  it: {
    code: "it",
    name: "意大利语",
    role: "专业意大利语翻译专家",
    guidance: "准确处理动词变位、冠词与语气。"
  },
  pt: {
    code: "pt",
    name: "葡萄牙语",
    role: "专业葡萄牙语翻译专家",
    guidance: "准确处理葡欧/巴葡表达差异和时态。"
  },
  ar: {
    code: "ar",
    name: "阿拉伯语",
    role: "专业阿拉伯语翻译专家",
    guidance: "准确处理词根词形、语序与正式书面表达。"
  },
  auto: {
    code: "auto",
    name: "待自动识别语言",
    role: "多语种翻译专家",
    guidance: "先识别源语言再翻译，保证术语一致和语义准确。"
  }
};
const LANGUAGE_HINT_ALIASES = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  ja: "ja",
  "ja-jp": "ja",
  jp: "ja",
  ko: "ko",
  "ko-kr": "ko",
  ru: "ru",
  "ru-ru": "ru",
  fr: "fr",
  "fr-fr": "fr",
  de: "de",
  "de-de": "de",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  it: "it",
  "it-it": "it",
  pt: "pt",
  "pt-br": "pt",
  "pt-pt": "pt",
  ar: "ar",
  "ar-sa": "ar",
  "ar-eg": "ar",
  zh: "zh",
  "zh-cn": "zh",
  "zh-hans": "zh",
  "zh-tw": "zh",
  "zh-hant": "zh"
};
const LATIN_STOPWORDS = {
  en: ["the", "and", "with", "from", "that", "this", "which", "for"],
  fr: ["le", "la", "les", "des", "avec", "dans", "pour", "est"],
  de: ["der", "die", "das", "und", "mit", "von", "ist", "nicht"],
  es: ["el", "la", "los", "las", "con", "para", "que", "una"],
  it: ["il", "lo", "gli", "con", "per", "che", "una", "sono"],
  pt: ["o", "a", "os", "as", "com", "para", "que", "uma"]
};
const ENGLISH_HINT_WORDS = new Set([
  "the",
  "and",
  "with",
  "from",
  "for",
  "this",
  "that",
  "your",
  "home",
  "shop",
  "cart",
  "sale",
  "new",
  "buy",
  "free",
  "more",
  "details",
  "search",
  "menu",
  "next",
  "previous",
  "login",
  "sign",
  "view"
]);

if (chrome.runtime?.onInstalled?.addListener) {
  chrome.runtime.onInstalled.addListener(() => {
    runStartupMaintenance().catch((error) => {
      console.warn("[LLM Translate] 安装初始化失败", error);
    });
  });
}

if (chrome.runtime?.onStartup?.addListener) {
  chrome.runtime.onStartup.addListener(() => {
    runStartupMaintenance().catch((error) => {
      console.warn("[LLM Translate] 启动初始化失败", error);
    });
  });
}

async function runStartupMaintenance() {
  await ensureStorageAccessPolicy();
  await cleanupLegacyApiConfig();
  await cleanupLegacySiteRules();
  await ensureApiConfigLoaded();
  await ensureTargetLanguageLoaded();
  await ensurePerformanceSettingsLoaded();
  await cleanupLegacyDynamicScripts();
  const globalEnabled = await getGlobalTranslationEnabled();
  await syncGlobalContentScriptRegistration(globalEnabled);
}

async function cleanupLegacyApiConfig() {
  const legacyKeys = [
    LEGACY_API_KEY_STORAGE_KEY,
    LEGACY_API_ENDPOINT_STORAGE_KEY,
    LEGACY_API_KEY_STORAGE_SCOPE_KEY
  ];
  await Promise.all([
    chrome.storage?.sync?.remove?.(legacyKeys),
    chrome.storage?.local?.remove?.(legacyKeys)
  ]);
}

async function cleanupLegacySiteRules() {
  await Promise.all([
    clearSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_SYNC),
    clearSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_LOCAL),
    chrome.storage?.local?.remove?.([SITE_RULES_STORAGE_BACKEND_KEY])
  ]);
}

if (chrome.tabs?.onUpdated?.addListener) {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const status = String(changeInfo?.status || "");
    if (status !== "complete") {
      return;
    }

    const rawUrl = tab?.url || changeInfo?.url || "";
    ensureTabScriptReadyByUrl(tabId, rawUrl).catch(() => {
      // 忽略单个标签页兜底失败，不影响整体翻译能力。
    });
  });
}

if (chrome.tabs?.onRemoved?.addListener) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    const numericTabId = Number(tabId);
    if (!Number.isInteger(numericTabId) || numericTabId < 0) {
      return;
    }
    pausedTabs.delete(numericTabId);
  });
}

if (chrome.runtime?.onMessage?.addListener) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "getGlobalTranslationStatus") {
      handleGetGlobalTranslationStatus()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setGlobalTranslationEnabled") {
      handleSetGlobalTranslationEnabled(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setTargetLanguage") {
      handleSetTargetLanguage(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "testApiConnection") {
      handleTestApiConnection()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "getSiteSetting" || message.type === "setSiteSetting") {
      sendResponse({ ok: false, error: GLOBAL_SWITCH_ONLY_MESSAGE });
      return false;
    }

    if (message.type === "getApiKeyMask") {
      handleGetApiKeyMask()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "getRuntimeApiConfig") {
      handleGetRuntimeApiConfig()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setRuntimeApiConfig") {
      handleSetRuntimeApiConfig(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "resetRuntimeApiConfig") {
      handleResetRuntimeApiConfig()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (
      message.type === "getApiKeyForOptions" ||
      message.type === "setApiKey" ||
      message.type === "setApiEndpoint" ||
      message.type === "resetApiEndpoint" ||
      message.type === "testApiKey" ||
      message.type === "clearApiKey"
    ) {
      sendResponse({ ok: false, error: REMOVED_SETTINGS_MESSAGE });
      return false;
    }

    if (message.type === "getPerformanceSettings") {
      handleGetPerformanceSettings()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setPerformanceSettings") {
      handleSetPerformanceSettings(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "resetPerformanceSettings") {
      handleResetPerformanceSettings()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "ensureContentScriptForTab") {
      ensureContentScriptForTab(message.tabId, message.url)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "getTabState") {
      handleGetTabState(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setTabPaused") {
      handleSetTabPaused(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "oneShotTranslateNow") {
      handleOneShotTranslateNow(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "translateBatch") {
      handleTranslateBatch(message, sender)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "cancelPendingTranslations") {
      const canceled = cancelContextRequests(buildSenderContextKey(sender));
      sendResponse({ ok: true, canceled });
      return false;
    }

    return false;
  });
}

async function handleGetSiteSetting(message) {
  const hostname = normalizeHostname(message.hostname);
  if (!hostname) {
    return { ok: false, error: "无效的网站地址" };
  }

  const rules = await loadSiteRules();
  const matchedHost = findMatchedRule(hostname, rules);
  return { ok: true, enabled: Boolean(matchedHost), matchedHost };
}

async function handleGetGlobalTranslationStatus() {
  const targetLanguageCode = await ensureTargetLanguageLoaded();
  const targetLanguage = getTargetLanguageConfig(targetLanguageCode);
  return {
    ok: true,
    enabled: await getGlobalTranslationEnabled(),
    targetLanguageCode,
    targetLanguageLabel: targetLanguage.label
  };
}

async function handleSetGlobalTranslationEnabled(message) {
  await ensureTargetLanguageLoaded();
  const enabled = Boolean(message?.enabled);
  await chrome.storage.sync.set({
    [GLOBAL_TRANSLATION_ENABLED_KEY]: enabled
  });
  await cleanupLegacySiteRules();
  await syncGlobalContentScriptRegistration(enabled);
  const syncResults = await syncGlobalTranslationToTabs(enabled);

  return {
    ok: true,
    enabled,
    targetLanguageCode: runtimeTargetLanguageCode,
    targetLanguageLabel: getTargetLanguageConfig(runtimeTargetLanguageCode).label,
    syncedTabs: syncResults.length,
    updatedTabs: syncResults.filter((item) => item?.updated).length
  };
}

async function handleSetTargetLanguage(message) {
  const targetLanguageCode = applyRuntimeTargetLanguage(message?.targetLanguageCode);
  await chrome.storage.sync.set({
    [TARGET_LANGUAGE_STORAGE_KEY]: targetLanguageCode
  });
  const enabled = await getGlobalTranslationEnabled();
  const syncResults = await syncGlobalTranslationToTabs(enabled);
  return {
    ok: true,
    targetLanguageCode,
    targetLanguageLabel: getTargetLanguageConfig(targetLanguageCode).label,
    syncedTabs: syncResults.length,
    updatedTabs: syncResults.filter((item) => item?.updated).length
  };
}

async function handleTestApiConnection() {
  await ensureTargetLanguageLoaded();
  const apiKey = await getApiKey();
  const apiEndpoint = await getApiEndpointOrDefault();
  const testResult = await validateBuiltInApiConnection(apiKey, apiEndpoint);

  if (!testResult.ok) {
    return {
      ok: false,
      error: testResult.error || "内置 LLM 模型全部不可用",
      statusCode: Number(testResult.statusCode || 0),
      availableModels: Number(testResult.availableModels || 0),
      totalModels: Number(testResult.totalModels || getModelCandidates().length)
    };
  }

  return {
    ok: true,
    statusCode: Number(testResult.statusCode || 200),
    message: testResult.message || `${getModelCandidates().length} 个内置 LLM 模型可用`,
    availableModels: Number(testResult.availableModels || 0),
    totalModels: Number(testResult.totalModels || getModelCandidates().length)
  };
}

async function handleGetPerformanceSettings() {
  const settings = await ensurePerformanceSettingsLoaded();
  return {
    ok: true,
    settings
  };
}

async function handleSetPerformanceSettings(message) {
  const settings = applyRuntimePerformanceSettings(message?.settings);
  await chrome.storage.sync.remove([PERFORMANCE_SETTINGS_KEY]);
  await broadcastPerformanceSettingsChanged(settings);
  return {
    ok: true,
    settings
  };
}

async function handleResetPerformanceSettings() {
  await chrome.storage.sync.remove([PERFORMANCE_SETTINGS_KEY]);
  const settings = applyRuntimePerformanceSettings();
  await broadcastPerformanceSettingsChanged(settings);
  return {
    ok: true,
    settings
  };
}

async function broadcastPerformanceSettingsChanged(settings) {
  if (!chrome.tabs?.query) {
    return;
  }

  const tabs = await chrome.tabs.query({});
  await Promise.all(
    tabs.map(async (tab) => {
      const tabId = Number(tab?.id);
      if (!Number.isInteger(tabId) || tabId < 0) {
        return;
      }
      await sendTabMessageSafe(tabId, {
        type: "performanceSettingsChanged",
        settings
      });
    })
  );
}

function buildSenderContextKey(sender) {
  const tabId = Number(sender?.tab?.id);
  const frameId = Number(sender?.frameId ?? 0);
  if (!Number.isInteger(tabId) || tabId < 0) {
    return "";
  }
  return `${tabId}:${Number.isInteger(frameId) ? frameId : 0}`;
}

function registerContextController(contextKey, controller) {
  if (!contextKey || !controller) {
    return;
  }
  const existing = contextRequestControllers.get(contextKey);
  if (existing) {
    existing.add(controller);
    return;
  }
  contextRequestControllers.set(contextKey, new Set([controller]));
}

function unregisterContextController(contextKey, controller) {
  if (!contextKey || !controller) {
    return;
  }
  const existing = contextRequestControllers.get(contextKey);
  if (!existing) {
    return;
  }
  existing.delete(controller);
  if (!existing.size) {
    contextRequestControllers.delete(contextKey);
  }
}

function cancelContextRequests(contextKey) {
  if (!contextKey) {
    return 0;
  }

  const controllers = contextRequestControllers.get(contextKey);
  if (!controllers || !controllers.size) {
    return 0;
  }

  let canceled = 0;
  for (const controller of controllers) {
    if (!controller || controller.signal.aborted) {
      continue;
    }
    controller.__longcatCanceled = true;
    controller.abort();
    canceled += 1;
  }
  contextRequestControllers.delete(contextKey);
  return canceled;
}

async function handleSetSiteSetting(message) {
  const hostname = normalizeHostname(message.hostname);
  if (!hostname) {
    return { ok: false, error: "无效的网站地址" };
  }

  const tabId = normalizeTabId(message.tabId);
  const enabled = Boolean(message.enabled);
  const rules = await loadSiteRules();

  if (enabled) {
    rules[hostname] = true;
  } else {
    delete rules[hostname];
  }

  const saveResult = await saveSiteRules(rules);
  await syncDynamicContentScriptRegistration(rules);
  const syncResults = await syncSiteSettingToHostTabs(hostname, enabled);
  const currentTabSync =
    tabId === null
      ? null
      : syncResults.find((item) => normalizeTabId(item?.tabId) === tabId) || null;

  return {
    ok: true,
    enabled,
    tabUpdated: Boolean(currentTabSync?.updated),
    restored: Boolean(currentTabSync?.restored),
    reloaded: Boolean(currentTabSync?.reloaded),
    tabError: String(currentTabSync?.error || ""),
    syncedTabs: syncResults.length,
    storageArea: saveResult.storageArea,
    switchedToLocal: Boolean(saveResult.switchedToLocal)
  };
}

async function handleGetTabState(message) {
  const tabId = normalizeTabId(message.tabId);
  if (tabId === null) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  return {
    ok: true,
    paused: Boolean(pausedTabs.get(tabId))
  };
}

async function handleSetTabPaused(message) {
  const tabId = normalizeTabId(message.tabId);
  if (tabId === null) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  const paused = Boolean(message.paused);
  if (paused) {
    pausedTabs.set(tabId, true);
  } else {
    pausedTabs.delete(tabId);
  }

  const tabPauseResult = await sendTabMessageSafe(tabId, {
    type: "tabPauseChanged",
    paused
  });

  if (!paused) {
    const tab = await getTabSafe(tabId);
    const rawUrl = typeof message.tabUrl === "string" ? message.tabUrl : tab?.url || "";
    const globalEnabled = await getGlobalTranslationEnabled();
    if (globalEnabled) {
      await syncGlobalContentScriptRegistration(true);
      await ensureContentScriptForTab(tabId, rawUrl);
      await sendTabMessageSafe(tabId, {
        type: "tabPauseChanged",
        paused: false
      });
      await sendTabMessageSafe(tabId, {
        type: "triggerTranslateNow"
      });
    } else if (!tabPauseResult?.ok) {
      await handleOneShotTranslateNow({
        tabId,
        url: rawUrl
      });
    }
  }

  return {
    ok: true,
    paused
  };
}

async function handleOneShotTranslateNow(message) {
  const tabId = normalizeTabId(message.tabId);
  if (tabId === null) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  const tab = await getTabSafe(tabId);
  const rawUrl = typeof message.url === "string" ? message.url : tab?.url || "";
  const ensureResult = await ensureContentScriptForTabOneShot(tabId, rawUrl);
  if (!ensureResult?.ok) {
    return ensureResult;
  }

  pausedTabs.delete(tabId);
  await sendTabMessageSafe(tabId, {
    type: "tabPauseChanged",
    paused: false
  });
  const triggerResult = await sendTabMessageSafe(tabId, {
    type: "oneShotTranslateNow"
  });

  if (!triggerResult?.ok) {
    return {
      ok: false,
      error: triggerResult?.error || "触发本页一次性翻译失败"
    };
  }

  return {
    ok: true,
    injected: Boolean(ensureResult.injected)
  };
}

async function handleGetApiKeyMask() {
  const apiKey = await getApiKey();
  const apiEndpoint = await getApiEndpointOrDefault();
  return {
    ok: true,
    hasKey: Boolean(apiKey),
    keyMask: maskApiKey(apiKey),
    storageScope: await getApiKeyStorageScope(),
    apiEndpoint,
    defaultApiEndpoint: API_ENDPOINT
  };
}

async function handleGetRuntimeApiConfig() {
  const config = await ensureApiConfigLoaded();
  return {
    ok: true,
    config: {
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      primaryModel: config.primaryModel,
      backupModel: config.backupModel
    },
    defaults: {
      endpoint: DEFAULT_RUNTIME_API_CONFIG.endpoint,
      apiKey: DEFAULT_RUNTIME_API_CONFIG.apiKey,
      primaryModel: DEFAULT_RUNTIME_API_CONFIG.primaryModel,
      backupModel: DEFAULT_RUNTIME_API_CONFIG.backupModel
    }
  };
}

async function handleSetRuntimeApiConfig(message) {
  const config = sanitizeRuntimeApiConfig(message?.config);
  await chrome.storage.sync.set({
    [API_CONFIG_STORAGE_KEY]: config
  });
  applyRuntimeApiConfig(config);
  return {
    ok: true,
    config
  };
}

async function handleResetRuntimeApiConfig() {
  await chrome.storage.sync.remove([API_CONFIG_STORAGE_KEY]);
  const config = applyRuntimeApiConfig(DEFAULT_RUNTIME_API_CONFIG);
  return {
    ok: true,
    config
  };
}

async function handleTranslateBatch(message, sender) {
  await ensureTargetLanguageLoaded();
  const entries = normalizeTranslationEntries(message);
  if (!entries.length) {
    return { ok: true, translations: [] };
  }

  const requestOptions = {
    contextKey: buildSenderContextKey(sender)
  };
  const languageHint = normalizeLanguageHint(message.languageHint);
  const hasContextEnhancedEntry = entries.some(isContextEnhancedEntry);
  const { translations, missingEntries } = buildTranslationPlan(entries, languageHint);
  if (!missingEntries.length) {
    return { ok: true, translations };
  }

  const waitingEntries = [];
  const requestEntries = [];
  const requestDeferredByKey = new Map();

  for (const missingEntry of missingEntries) {
    const requestKey = missingEntry.requestKey;
    const existingPromise = requestKey
      ? inFlightTranslationRequests.get(requestKey)
      : null;
    if (existingPromise) {
      waitingEntries.push({
        entry: missingEntry,
        promise: existingPromise
      });
      continue;
    }

    requestEntries.push(missingEntry);
    if (requestKey) {
      const deferred = createDeferred();
      requestDeferredByKey.set(requestKey, deferred);
      inFlightTranslationRequests.set(requestKey, deferred.promise);
    }
  }

  const translationByKey = new Map();
  if (requestEntries.length) {
    const requestSourceEntries = requestEntries.map((entry) => entry.sourceEntry);
    let requestTranslations = [];
    try {
      requestTranslations = await requestMissingEntryTranslations(
        requestSourceEntries,
        languageHint,
        requestOptions,
        hasContextEnhancedEntry
      );
      if (
        !Array.isArray(requestTranslations) ||
        requestTranslations.length !== requestEntries.length
      ) {
        throw new Error("翻译返回数量与待补文本数量不一致");
      }

      for (let index = 0; index < requestEntries.length; index += 1) {
        const entry = requestEntries[index];
        const translated = sanitizeTranslatedText(
          requestTranslations[index],
          entry.sourceEntry.text
        );
        translationByKey.set(entry.requestKey, translated);

        if (entry.cacheKey && translated) {
          rememberTranslationMemory(entry.cacheKey, entry.sourceEntry.text, translated);
        }

        const deferred = requestDeferredByKey.get(entry.requestKey);
        if (deferred) {
          deferred.resolve(translated);
        }
      }
    } catch (error) {
      if (isCanceledFetchError(error)) {
        for (const entry of requestEntries) {
          const deferred = requestDeferredByKey.get(entry.requestKey);
          if (deferred) {
            deferred.resolve("");
          }
        }
        return {
          ok: false,
          canceled: true,
          error: "翻译请求已取消"
        };
      }

      for (const entry of requestEntries) {
        const deferred = requestDeferredByKey.get(entry.requestKey);
        if (deferred) {
          deferred.reject(error);
        }
      }
      throw error;
    } finally {
      for (const entry of requestEntries) {
        inFlightTranslationRequests.delete(entry.requestKey);
      }
    }
  }

  if (waitingEntries.length) {
    const waitingTranslations = await Promise.all(
      waitingEntries.map(async ({ entry, promise }) => {
        const translated = await promise;
        return {
          requestKey: entry.requestKey,
          translated: sanitizeTranslatedText(translated, entry.sourceEntry.text)
        };
      })
    );

    for (const item of waitingTranslations) {
      translationByKey.set(item.requestKey, item.translated);
    }
  }

  for (const entry of missingEntries) {
    const translated = translationByKey.get(entry.requestKey) || "";
    for (const sourceIndex of entry.indexes) {
      translations[sourceIndex] = translated;
    }
  }

  return { ok: true, translations };
}

function normalizeTranslationEntries(message) {
  if (Array.isArray(message?.entries) && message.entries.length) {
    const entries = [];
    for (const rawEntry of message.entries) {
      const normalized = normalizeTranslationEntry(rawEntry);
      if (normalized) {
        entries.push(normalized);
      }
    }
    return entries;
  }

  const texts = Array.isArray(message?.texts) ? message.texts : [];
  return texts
    .map((text) => normalizeTranslationEntry({ text }))
    .filter(Boolean);
}

function normalizeTranslationEntry(rawEntry) {
  if (rawEntry == null) {
    return null;
  }

  if (typeof rawEntry === "string") {
    return {
      text: rawEntry,
      prev: "",
      next: ""
    };
  }

  if (typeof rawEntry !== "object") {
    return {
      text: String(rawEntry),
      prev: "",
      next: ""
    };
  }

  return {
    text: String(rawEntry.text ?? ""),
    prev: String(rawEntry.prev ?? ""),
    next: String(rawEntry.next ?? "")
  };
}

function buildTranslationPlan(entries, languageHint) {
  const translations = new Array(entries.length).fill("");
  const missingByCanonical = new Map();
  const languageKey = languageHint || "auto";

  for (let index = 0; index < entries.length; index += 1) {
    const sourceEntry = entries[index];
    const normalizedText = normalizeBatchText(sourceEntry.text);
    if (!normalizedText) {
      translations[index] = sourceEntry.text;
      continue;
    }

    const cacheKey = buildTranslationMemoryKey(sourceEntry, languageKey);
    if (cacheKey) {
      const cached = readTranslationMemory(cacheKey, sourceEntry.text);
      if (cached) {
        translations[index] = cached;
        continue;
      }
    }

    const dedupeKey = buildDedupeKey(sourceEntry, languageKey);
    const existing = missingByCanonical.get(dedupeKey);
    if (existing) {
      existing.indexes.push(index);
      if (!existing.cacheKey && cacheKey) {
        existing.cacheKey = cacheKey;
      }
      continue;
    }

    missingByCanonical.set(dedupeKey, {
      sourceEntry,
      indexes: [index],
      cacheKey,
      requestKey: dedupeKey
    });
  }

  return {
    translations,
    missingEntries: Array.from(missingByCanonical.values())
  };
}

async function requestMissingEntryTranslations(
  sourceEntries,
  languageHint,
  requestOptions,
  hasContextEnhancedEntry
) {
  let translations = [];
  try {
    translations = await requestLongCatTranslation(
      sourceEntries,
      languageHint,
      requestOptions
    );
  } catch (error) {
    if (!hasContextEnhancedEntry || !shouldFallbackToLegacyByError(error)) {
      throw error;
    }
    translations = await requestLongCatTranslation(
      sourceEntries.map(stripContextFromEntry),
      languageHint,
      requestOptions
    );
  }

  if (hasContextEnhancedEntry) {
    const emptyIndexes = [];
    for (let index = 0; index < translations.length; index += 1) {
      const translated = sanitizeTranslatedText(
        translations[index],
        sourceEntries[index]?.text
      );
      if (!translated) {
        emptyIndexes.push(index);
      }
    }

    if (emptyIndexes.length) {
      const fallbackEntries = emptyIndexes.map((index) =>
        stripContextFromEntry(sourceEntries[index])
      );
      const fallbackTranslations = await requestLongCatTranslation(
        fallbackEntries,
        languageHint,
        requestOptions
      );
      for (let index = 0; index < emptyIndexes.length; index += 1) {
        const target = emptyIndexes[index];
        translations[target] = fallbackTranslations[index];
      }
    }
  }

  return translations;
}

function createDeferred() {
  let resolve = null;
  let reject = null;
  const promise = new Promise((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });
  return {
    promise,
    resolve,
    reject
  };
}

function normalizeBatchText(text) {
  return String(text ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function buildTranslationMemoryKey(entry, languageKey) {
  const normalizedText = normalizeBatchText(entry?.text || "");
  if (!normalizedText || normalizedText.length > TRANSLATION_MEMORY_MAX_TEXT_CHARS) {
    return "";
  }

  const targetPrefix = `to:${runtimeTargetLanguageCode}::`;

  if (!isContextEnhancedEntry(entry)) {
    return `${targetPrefix}${languageKey}::${normalizedText}`;
  }

  const normalizedPrev = normalizeBatchText(entry.prev).slice(-80);
  const normalizedNext = normalizeBatchText(entry.next).slice(0, 80);
  return `${targetPrefix}${languageKey}::${normalizedText}||${normalizedPrev}||${normalizedNext}`;
}

function buildDedupeKey(entry, languageKey) {
  const base = buildTranslationMemoryKey(entry, languageKey);
  if (base) {
    return base;
  }
  const normalizedText = normalizeBatchText(entry?.text || "");
  return `to:${runtimeTargetLanguageCode}::${languageKey}::${normalizedText}`;
}

function isContextEnhancedEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return false;
  }
  return Boolean(normalizeBatchText(entry.prev) || normalizeBatchText(entry.next));
}

function stripContextFromEntry(entry) {
  return {
    text: String(entry?.text ?? ""),
    prev: "",
    next: ""
  };
}

function shouldFallbackToLegacyByError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("返回内容为空") ||
    message.includes("无法解析") ||
    message.includes("数量不匹配") ||
    message.includes("JSON") ||
    message.includes("翻译请求失败")
  );
}

function readTranslationMemory(cacheKey, sourceText = "") {
  if (!cacheKey) {
    return "";
  }
  const cached = translationMemoryCache.get(cacheKey);
  if (typeof cached !== "string" || !cached) {
    return "";
  }
  if (!isAcceptableTranslatedText(sourceText, cached)) {
    translationMemoryCache.delete(cacheKey);
    return "";
  }
  translationMemoryCache.delete(cacheKey);
  translationMemoryCache.set(cacheKey, cached);
  return cached;
}

function rememberTranslationMemory(cacheKey, sourceText, translatedText) {
  if (
    !cacheKey ||
    !translatedText ||
    !isAcceptableTranslatedText(sourceText, translatedText)
  ) {
    return;
  }
  translationMemoryCache.delete(cacheKey);
  translationMemoryCache.set(cacheKey, translatedText);
  trimTranslationMemory();
}

function trimTranslationMemory() {
  while (translationMemoryCache.size > TRANSLATION_MEMORY_LIMIT) {
    const oldestKey = translationMemoryCache.keys().next().value;
    if (typeof oldestKey !== "string") {
      break;
    }
    translationMemoryCache.delete(oldestKey);
  }
}

async function ensureStorageAccessPolicy() {
  await setStorageAccessLevelSafe(chrome.storage?.sync);
  await setStorageAccessLevelSafe(chrome.storage?.local);
}

async function setStorageAccessLevelSafe(storageArea) {
  if (!storageArea || typeof storageArea.setAccessLevel !== "function") {
    return;
  }

  try {
    await storageArea.setAccessLevel({
      accessLevel: "TRUSTED_CONTEXTS"
    });
  } catch (_error) {
    // 低版本浏览器不支持或策略受限时忽略，不阻断主流程。
  }
}

function sanitizeApiKey(rawValue) {
  return String(rawValue ?? "").trim();
}

function decodeObfuscatedText(seed) {
  const bytes = Array.isArray(seed?.bytes) ? seed.bytes : [];
  const key = Number(seed?.key || 0);
  if (!bytes.length) {
    return "";
  }
  return String.fromCharCode(...bytes.map((byte) => Number(byte) ^ key));
}

function normalizeApiEndpoint(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) {
    return "";
  }

  let parsedUrl = null;
  try {
    parsedUrl = new URL(value);
  } catch (_error) {
    return "";
  }

  if (!/^https?:$/.test(parsedUrl.protocol)) {
    return "";
  }

  parsedUrl.hash = "";
  parsedUrl.search = "";

  let pathname = parsedUrl.pathname || "";
  if (!pathname || pathname === "/") {
    pathname = "/v1/chat/completions";
  } else {
    pathname = pathname.replace(/\/+$/, "");
    if (!pathname.endsWith("/chat/completions")) {
      if (pathname.endsWith("/v1")) {
        pathname = `${pathname}/chat/completions`;
      } else {
        pathname = `${pathname}/chat/completions`;
      }
    }
  }

  parsedUrl.pathname = pathname;
  return parsedUrl.toString();
}

function maskApiKey(apiKey) {
  const key = sanitizeApiKey(apiKey);
  if (!key) {
    return "";
  }
  if (key.length <= 8) {
    return `${key.slice(0, 2)}****`;
  }
  return `${key.slice(0, 4)}****${key.slice(-4)}`;
}

async function getApiKeyStorageScope() {
  const config = await ensureApiConfigLoaded();
  return (
    config.endpoint === DEFAULT_RUNTIME_API_CONFIG.endpoint &&
    config.apiKey === DEFAULT_RUNTIME_API_CONFIG.apiKey &&
    config.primaryModel === DEFAULT_RUNTIME_API_CONFIG.primaryModel &&
    config.backupModel === DEFAULT_RUNTIME_API_CONFIG.backupModel
  )
    ? API_CONFIG_MODE_BUILT_IN
    : API_CONFIG_MODE_CUSTOM;
}

async function getApiKey() {
  const config = await ensureApiConfigLoaded();
  return sanitizeApiKey(config.apiKey);
}

async function getApiEndpointOrDefault() {
  const config = await ensureApiConfigLoaded();
  return config.endpoint;
}

async function getApiKeyOrThrow() {
  const key = await getApiKey();
  if (!key) {
    throw new Error("未载入内置 API Token，请检查扩展包是否完整。");
  }
  return key;
}

async function getGlobalTranslationEnabled() {
  const data = await chrome.storage.sync.get([GLOBAL_TRANSLATION_ENABLED_KEY]);
  return Boolean(data?.[GLOBAL_TRANSLATION_ENABLED_KEY]);
}

function getModelCandidates() {
  return [runtimeApiConfig.primaryModel, runtimeApiConfig.backupModel].filter(Boolean);
}

function getBuiltInTranslationCandidates(apiKey, apiEndpoint = API_ENDPOINT) {
  const primaryEndpoint = normalizeApiEndpoint(apiEndpoint) || API_ENDPOINT;
  const primaryKey = sanitizeApiKey(apiKey);
  if (!primaryKey || !primaryEndpoint) {
    return [];
  }
  const modelCandidates = Array.from(
    new Set([runtimeApiConfig.primaryModel, runtimeApiConfig.backupModel].filter(Boolean))
  );
  return modelCandidates.map((modelName) => ({
    providerId: "longcat",
    providerKey: "longcat",
    rateLimitKey: `longcat:${modelName}`,
    modelName,
    endpoint: primaryEndpoint,
    apiKey: primaryKey,
    temperature: 0.1,
    maxOutputTokens: SAFE_MAX_OUTPUT_TOKENS,
    requestTimeoutMs: REQUEST_TIMEOUT_MS,
    healthCheckTimeoutMs: modelName === PRIMARY_MODEL_NAME ? 8000 : 12000,
    retryAttempts: 3,
    maxBatchItems: Number.MAX_SAFE_INTEGER,
    maxBatchChars: Number.MAX_SAFE_INTEGER
  }));
}

function countEntryChars(sourceEntries) {
  if (!Array.isArray(sourceEntries)) {
    return 0;
  }
  return sourceEntries.reduce((sum, entry) => sum + String(entry?.text || "").length, 0);
}

function createProviderCircuitBreakerState() {
  return {
    status: "closed",
    consecutiveFailures: 0,
    openedAt: 0,
    halfOpenInFlight: 0
  };
}

function getProviderCircuitBreakerState(providerKey = "default") {
  const key = String(providerKey || "default");
  let state = providerCircuitBreakerStates.get(key);
  if (!state) {
    state = createProviderCircuitBreakerState();
    providerCircuitBreakerStates.set(key, state);
  }
  return state;
}

function isCandidateBatchSuitable(candidate, sourceEntries) {
  if (!candidate) {
    return false;
  }
  const itemCount = Array.isArray(sourceEntries) ? sourceEntries.length : 0;
  const totalChars = countEntryChars(sourceEntries);
  return itemCount <= Number(candidate.maxBatchItems || Number.MAX_SAFE_INTEGER) &&
    totalChars <= Number(candidate.maxBatchChars || Number.MAX_SAFE_INTEGER);
}

function isAuthenticationErrorMessage(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("(401)") ||
    message.includes("(403)") ||
    message.includes("无权限") ||
    message.includes("unauthorized") ||
    message.includes("invalid_api_key") ||
    (message.includes("api key") && message.includes("无效"))
  );
}

function shouldFallbackToNextModel(error, index, totalCandidates = MODEL_CANDIDATES.length) {
  return (
    index < totalCandidates - 1 &&
    !isCanceledFetchError(error) &&
    !isAuthenticationErrorMessage(error)
  );
}

function isSuccessfulApiTestStatus(statusCode) {
  return Number(statusCode) === 429 || (Number(statusCode) >= 200 && Number(statusCode) < 300);
}

async function validateBuiltInModelConnection(candidate) {
  const apiKey = sanitizeApiKey(candidate?.apiKey);
  const endpoint = normalizeApiEndpoint(candidate?.endpoint) || "";
  const modelName = String(candidate?.modelName || "");
  const healthCheckTimeoutMs = Math.max(
    1000,
    Number(candidate?.healthCheckTimeoutMs || API_CONNECTION_TEST_TIMEOUT_MS)
  );
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), healthCheckTimeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are an API health checker. Reply with OK only."
          },
          {
            role: "user",
            content: "ok"
          }
        ],
        temperature: 0,
        max_tokens: API_CONNECTION_TEST_MAX_TOKENS,
        stream: false
      }),
      signal: controller.signal
    });

    if (response.ok || response.status === 429) {
      return {
        ok: true,
        model: modelName,
        statusCode: response.status
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        model: modelName,
        statusCode: response.status,
        error: "内置 Token 无效或无权限"
      };
    }

    const bodyText = await safeReadResponseText(response);
    return {
      ok: false,
      model: modelName,
      statusCode: response.status,
      error: bodyText
        ? `接口验证失败（HTTP ${response.status}）：${bodyText}`
        : `接口验证失败（HTTP ${response.status}）`
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        ok: false,
        model: modelName,
        statusCode: 0,
        error: `接口验证超时（>${healthCheckTimeoutMs}ms）`
      };
    }

    return {
      ok: false,
      model: modelName,
      statusCode: 0,
      error: String(error?.message || "网络错误，无法验证接口")
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function validateBuiltInApiConnection(apiKey, apiEndpoint = API_ENDPOINT) {
  const candidates = getBuiltInTranslationCandidates(apiKey, apiEndpoint);
  if (!candidates.length) {
    return {
      ok: false,
      statusCode: 0,
      error: "未配置任何可用的内置 LLM 模型",
      availableModels: 0,
      totalModels: 0,
      results: []
    };
  }
  const results = await Promise.all(
    candidates.map((candidate) => validateBuiltInModelConnection(candidate))
  );
  const availableResults = results.filter((result) => result?.ok);
  const availableModels = availableResults.length;

  if (availableModels > 0) {
    const preferredResult =
      availableResults.find((result) => isSuccessfulApiTestStatus(result?.statusCode)) ||
      availableResults[0];
    return {
      ok: true,
      statusCode: Number(preferredResult?.statusCode || 200),
      message: `${availableModels} 个内置 LLM 模型可用`,
      availableModels,
      totalModels: candidates.length,
      results
    };
  }

  const representativeFailure =
    results.find((result) => Number(result?.statusCode) === 401 || Number(result?.statusCode) === 403) ||
    results.find((result) => Number(result?.statusCode) > 0) ||
    results[0];
  return {
    ok: false,
    statusCode: Number(representativeFailure?.statusCode || 0),
    error: "内置 LLM 模型全部不可用",
    availableModels: 0,
    totalModels: candidates.length,
    results
  };
}

async function loadSiteRules() {
  const preferredBackend = await readSiteRulesBackend();
  if (preferredBackend === SITE_RULES_STORAGE_BACKEND_LOCAL) {
    return readSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_LOCAL);
  }

  const syncRules = await readSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_SYNC);
  if (Object.keys(syncRules).length) {
    return syncRules;
  }

  const localRules = await readSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_LOCAL);
  if (Object.keys(localRules).length) {
    await writeSiteRulesBackend(SITE_RULES_STORAGE_BACKEND_LOCAL);
    return localRules;
  }

  return syncRules;
}

async function saveSiteRules(rules) {
  const normalizedRules = normalizeRulesObject(rules);

  try {
    await writeSiteRulesToArea(SITE_RULES_STORAGE_BACKEND_SYNC, normalizedRules);
    await writeSiteRulesBackend(SITE_RULES_STORAGE_BACKEND_SYNC);
    await clearSiteRulesFromArea(SITE_RULES_STORAGE_BACKEND_LOCAL);
    return {
      storageArea: SITE_RULES_STORAGE_BACKEND_SYNC,
      switchedToLocal: false
    };
  } catch (error) {
    if (!isStorageQuotaExceededError(error)) {
      throw error;
    }

    await writeSiteRulesToArea(SITE_RULES_STORAGE_BACKEND_LOCAL, normalizedRules);
    await writeSiteRulesBackend(SITE_RULES_STORAGE_BACKEND_LOCAL);
    return {
      storageArea: SITE_RULES_STORAGE_BACKEND_LOCAL,
      switchedToLocal: true
    };
  }
}

async function readSiteRulesBackend() {
  const localStorage = getStorageAreaByName(SITE_RULES_STORAGE_BACKEND_LOCAL);
  const data = await localStorage.get([SITE_RULES_STORAGE_BACKEND_KEY]);
  const backend = data[SITE_RULES_STORAGE_BACKEND_KEY];
  if (backend === SITE_RULES_STORAGE_BACKEND_LOCAL) {
    return SITE_RULES_STORAGE_BACKEND_LOCAL;
  }
  return SITE_RULES_STORAGE_BACKEND_SYNC;
}

async function writeSiteRulesBackend(backend) {
  const localStorage = getStorageAreaByName(SITE_RULES_STORAGE_BACKEND_LOCAL);
  await localStorage.set({
    [SITE_RULES_STORAGE_BACKEND_KEY]:
      backend === SITE_RULES_STORAGE_BACKEND_LOCAL
        ? SITE_RULES_STORAGE_BACKEND_LOCAL
        : SITE_RULES_STORAGE_BACKEND_SYNC
  });
}

async function readSiteRulesFromArea(areaName) {
  const storageArea = getStorageAreaByName(areaName);
  const baseData = await storageArea.get([SITE_RULES_KEY, SITE_RULES_META_KEY]);
  const meta = parseSiteRulesMeta(baseData[SITE_RULES_META_KEY]);

  if (meta.mode === "chunked" && meta.chunkCount > 0) {
    const chunkKeys = Array.from({ length: meta.chunkCount }, (_, index) =>
      buildSiteRulesChunkKey(index)
    );
    const chunkData = await storageArea.get(chunkKeys);
    const hosts = [];
    for (let index = 0; index < chunkKeys.length; index += 1) {
      hosts.push(...parseSiteRulesChunk(chunkData[chunkKeys[index]]));
    }
    return normalizeRulesObject(hosts);
  }

  return normalizeRulesObject(baseData[SITE_RULES_KEY]);
}

async function writeSiteRulesToArea(areaName, rules) {
  const storageArea = getStorageAreaByName(areaName);
  const normalizedRules = normalizeRulesObject(rules);
  const hosts = Object.keys(normalizedRules).sort();
  const previousMetaRaw = await storageArea.get([SITE_RULES_META_KEY]);
  const previousMeta = parseSiteRulesMeta(previousMetaRaw[SITE_RULES_META_KEY]);
  const previousChunkKeys = Array.from(
    { length: previousMeta.chunkCount },
    (_, index) => buildSiteRulesChunkKey(index)
  );

  const inlinePayloadText = JSON.stringify(normalizedRules);
  if (inlinePayloadText.length <= SITE_RULES_CHUNK_MAX_CHARS) {
    await storageArea.set({
      [SITE_RULES_KEY]: normalizedRules,
      [SITE_RULES_META_KEY]: {
        version: 1,
        mode: "inline",
        chunkCount: 0
      }
    });
    if (previousChunkKeys.length) {
      await storageArea.remove(previousChunkKeys);
    }
    return;
  }

  const chunks = buildSiteRuleChunks(hosts, SITE_RULES_CHUNK_MAX_CHARS);
  const payload = {
    [SITE_RULES_KEY]: {},
    [SITE_RULES_META_KEY]: {
      version: 1,
      mode: "chunked",
      chunkCount: chunks.length
    }
  };

  for (let index = 0; index < chunks.length; index += 1) {
    payload[buildSiteRulesChunkKey(index)] = chunks[index];
  }
  await storageArea.set(payload);

  const staleChunkKeys = previousChunkKeys.filter((_, index) => index >= chunks.length);
  if (staleChunkKeys.length) {
    await storageArea.remove(staleChunkKeys);
  }
}

async function clearSiteRulesFromArea(areaName) {
  const storageArea = getStorageAreaByName(areaName);
  const metaData = await storageArea.get([SITE_RULES_META_KEY]);
  const meta = parseSiteRulesMeta(metaData[SITE_RULES_META_KEY]);
  const removeKeys = [SITE_RULES_KEY, SITE_RULES_META_KEY];
  for (let index = 0; index < meta.chunkCount; index += 1) {
    removeKeys.push(buildSiteRulesChunkKey(index));
  }
  await storageArea.remove(removeKeys);
}

function parseSiteRulesMeta(rawMeta) {
  if (!rawMeta || typeof rawMeta !== "object") {
    return {
      mode: "inline",
      chunkCount: 0
    };
  }

  const chunkCount = Number(rawMeta.chunkCount);
  return {
    mode: rawMeta.mode === "chunked" ? "chunked" : "inline",
    chunkCount: Number.isFinite(chunkCount) && chunkCount > 0 ? Math.floor(chunkCount) : 0
  };
}

function buildSiteRulesChunkKey(index) {
  return `${SITE_RULES_CHUNK_PREFIX}${index}`;
}

function buildSiteRuleChunks(hosts, maxChunkChars) {
  if (!Array.isArray(hosts) || !hosts.length) {
    return [];
  }

  const chunks = [];
  let currentChunk = [];

  for (const host of hosts) {
    const normalizedHost = normalizeHostname(host);
    if (!normalizedHost) {
      continue;
    }

    const candidate = currentChunk.concat(normalizedHost);
    if (currentChunk.length && JSON.stringify(candidate).length > maxChunkChars) {
      chunks.push(JSON.stringify(currentChunk));
      currentChunk = [normalizedHost];
      continue;
    }
    currentChunk = candidate;
  }

  if (currentChunk.length) {
    chunks.push(JSON.stringify(currentChunk));
  }

  return chunks;
}

function parseSiteRulesChunk(rawChunk) {
  if (typeof rawChunk !== "string" || !rawChunk.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawChunk);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map((item) => normalizeHostname(item))
      .filter(Boolean);
  } catch (_error) {
    return [];
  }
}

function normalizeRulesObject(rawRules) {
  const rules = {};

  if (Array.isArray(rawRules)) {
    for (const host of rawRules) {
      const normalized = normalizeHostname(host);
      if (normalized) {
        rules[normalized] = true;
      }
    }
    return rules;
  }

  if (!rawRules || typeof rawRules !== "object") {
    return rules;
  }

  for (const [hostname, enabled] of Object.entries(rawRules)) {
    if (!enabled) {
      continue;
    }
    const normalized = normalizeHostname(hostname);
    if (normalized) {
      rules[normalized] = true;
    }
  }
  return rules;
}

function isStorageQuotaExceededError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("QUOTA_BYTES") ||
    message.includes("quota exceeded") ||
    message.includes("QuotaExceeded")
  );
}

function getStorageAreaByName(areaName) {
  if (areaName === SITE_RULES_STORAGE_BACKEND_LOCAL || areaName === STORAGE_AREA_LOCAL) {
    return chrome.storage?.local || chrome.storage.sync;
  }
  return chrome.storage?.sync || chrome.storage.local;
}

function matchesForHost(hostname) {
  const normalized = normalizeHostname(hostname);
  if (!normalized) {
    return [];
  }
  return [`*://${normalized}/*`, `*://*.${normalized}/*`];
}

async function cleanupLegacyDynamicScripts() {
  if (!chrome.scripting?.unregisterContentScripts) {
    return;
  }
  if (!LEGACY_DYNAMIC_TRANSLATOR_SCRIPT_IDS.length) {
    return;
  }

  try {
    await chrome.scripting.unregisterContentScripts({
      ids: LEGACY_DYNAMIC_TRANSLATOR_SCRIPT_IDS
    });
  } catch (_error) {
    // 忽略历史脚本不存在的场景。
  }
}

async function syncDynamicContentScriptRegistration(rules) {
  void rules;
  const enabled = await getGlobalTranslationEnabled();
  await syncGlobalContentScriptRegistration(enabled);
}

async function syncGlobalContentScriptRegistration(enabled) {
  if (!chrome.scripting?.getRegisteredContentScripts) {
    return;
  }

  const registeredScripts = await chrome.scripting.getRegisteredContentScripts();
  const registeredIds = dedupeStrings((registeredScripts || []).map((script) => script?.id));
  const staleIds = registeredIds.filter(
    (scriptId) =>
      isManagedHostScriptId(scriptId) ||
      (scriptId === GLOBAL_DYNAMIC_TRANSLATOR_SCRIPT_ID && !enabled)
  );

  if (staleIds.length && chrome.scripting?.unregisterContentScripts) {
    try {
      await chrome.scripting.unregisterContentScripts({
        ids: staleIds
      });
    } catch (_error) {
      // 忽略脚本已不存在等场景。
    }
  }

  if (!enabled) {
    return;
  }

  if (registeredIds.includes(GLOBAL_DYNAMIC_TRANSLATOR_SCRIPT_ID)) {
    return;
  }

  if (!chrome.scripting?.registerContentScripts) {
    return;
  }

  await chrome.scripting.registerContentScripts([
    {
      id: GLOBAL_DYNAMIC_TRANSLATOR_SCRIPT_ID,
      js: [DYNAMIC_TRANSLATOR_SCRIPT_FILE],
      matches: ["<all_urls>"],
      runAt: "document_idle",
      allFrames: false,
      persistAcrossSessions: true
    }
  ]);
}

function dedupeStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function isManagedHostScriptId(scriptId) {
  const value = String(scriptId || "");
  return value.startsWith(DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX) && value !== GLOBAL_DYNAMIC_TRANSLATOR_SCRIPT_ID;
}

function withHostScriptOperationLock(hostname, task) {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) {
    return Promise.resolve();
  }

  const previous = hostScriptOperationLocks.get(normalizedHost) || Promise.resolve();
  const current = previous
    .catch(() => {
      // 忽略前一任务错误，保持串行执行。
    })
    .then(() => task());
  hostScriptOperationLocks.set(normalizedHost, current);
  return current.finally(() => {
    if (hostScriptOperationLocks.get(normalizedHost) === current) {
      hostScriptOperationLocks.delete(normalizedHost);
    }
  });
}

function withTabScriptEnsureLock(tabId, task) {
  const numericTabId = normalizeTabId(tabId);
  if (numericTabId === null) {
    return Promise.resolve({ ok: false, error: "无效的标签页 ID" });
  }

  const previous = tabScriptEnsureLocks.get(numericTabId) || Promise.resolve();
  const current = previous
    .catch(() => {
      // 忽略前一任务错误，保持串行执行。
    })
    .then(() => task());
  tabScriptEnsureLocks.set(numericTabId, current);
  return current.finally(() => {
    if (tabScriptEnsureLocks.get(numericTabId) === current) {
      tabScriptEnsureLocks.delete(numericTabId);
    }
  });
}

function scriptIdForHost(hostname) {
  const normalized = normalizeHostname(hostname);
  if (!normalized) {
    return "";
  }
  return `${DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX}${normalized}`;
}

function parseHostFromScriptId(scriptId) {
  const value = String(scriptId || "");
  if (!value.startsWith(DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX)) {
    return "";
  }
  return normalizeHostname(value.slice(DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX.length));
}

async function ensureContentScriptForTab(tabId, rawUrl = "") {
  const numericTabId = Number(tabId);
  if (!Number.isInteger(numericTabId) || numericTabId < 0) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  if (await pingContentScript(numericTabId)) {
    return { ok: true, injected: false };
  }
  if (await waitForContentScriptReady(numericTabId, 8, 100)) {
    return { ok: true, injected: false };
  }

  const tabInfo = await getTabSafe(numericTabId);
  const parsed = safeParseUrl(rawUrl || tabInfo?.url || "");
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return { ok: false, error: "当前页面不支持注入翻译脚本" };
  }

  const enabled = await getGlobalTranslationEnabled();
  if (!enabled) {
    return { ok: false, error: "自动翻译总开关未开启" };
  }

  await syncGlobalContentScriptRegistration(true);

  return ensureContentScriptForTabOneShot(numericTabId, parsed.href);
}

async function ensureContentScriptForTabOneShot(tabId, rawUrl = "") {
  const numericTabId = Number(tabId);
  if (!Number.isInteger(numericTabId) || numericTabId < 0) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  return withTabScriptEnsureLock(numericTabId, async () => {
    if (await pingContentScript(numericTabId)) {
      return { ok: true, injected: false };
    }
    if (await waitForContentScriptReady(numericTabId, 8, 100)) {
      return { ok: true, injected: false };
    }

    const tabInfo = await getTabSafe(numericTabId);
    const parsed = safeParseUrl(rawUrl || tabInfo?.url || "");
    if (!parsed || !/^https?:$/.test(parsed.protocol)) {
      return { ok: false, error: "当前页面不支持注入翻译脚本" };
    }

    if (!chrome.scripting?.executeScript) {
      return { ok: false, error: "当前浏览器不支持动态注入脚本" };
    }

    await chrome.scripting.executeScript({
      target: { tabId: numericTabId },
      files: [DYNAMIC_TRANSLATOR_SCRIPT_FILE]
    });

    const ready = await waitForContentScriptReady(numericTabId);
    if (!ready) {
      return { ok: false, error: "脚本注入后未响应" };
    }
    return { ok: true, injected: true };
  });
}

async function ensureHostScriptRegistered(hostname) {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) {
    return;
  }

  await withHostScriptOperationLock(normalizedHost, async () => {
    if (
      !chrome.scripting?.registerContentScripts ||
      !chrome.scripting?.getRegisteredContentScripts
    ) {
      return;
    }

    const scriptId = scriptIdForHost(normalizedHost);
    if (!scriptId) {
      return;
    }

    const registeredScripts = await chrome.scripting.getRegisteredContentScripts({
      ids: [scriptId]
    });
    if (Array.isArray(registeredScripts) && registeredScripts.length) {
      return;
    }

    const matches = matchesForHost(normalizedHost);
    if (!matches.length) {
      return;
    }

    await chrome.scripting.registerContentScripts([
      {
        id: scriptId,
        js: [DYNAMIC_TRANSLATOR_SCRIPT_FILE],
        matches,
        runAt: "document_idle",
        allFrames: false,
        persistAcrossSessions: true
      }
    ]);
  });
}

async function unregisterHostScript(hostname) {
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) {
    return;
  }

  await withHostScriptOperationLock(normalizedHost, async () => {
    if (!chrome.scripting?.unregisterContentScripts) {
      return;
    }

    const scriptId = scriptIdForHost(normalizedHost);
    if (!scriptId) {
      return;
    }

    try {
      await chrome.scripting.unregisterContentScripts({
        ids: [scriptId]
      });
    } catch (_error) {
      // 忽略目标脚本不存在的场景。
    }
  });
}

async function ensureTabScriptReadyByUrl(tabId, rawUrl) {
  const numericTabId = Number(tabId);
  if (!Number.isInteger(numericTabId) || numericTabId < 0) {
    return;
  }

  const parsed = safeParseUrl(rawUrl);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return;
  }

  const enabled = await getGlobalTranslationEnabled();
  const targetLanguageCode = await ensureTargetLanguageLoaded();
  if (!enabled) {
    return;
  }

  await syncGlobalContentScriptRegistration(true);
  const ensureResult = await ensureContentScriptForTab(numericTabId, parsed.href);
  if (!ensureResult?.ok) {
    return;
  }

  await sendTabMessageSafe(numericTabId, {
    type: "siteSettingChanged",
    enabled: true,
    targetLanguageCode
  });

  const paused = Boolean(pausedTabs.get(numericTabId));
  await sendTabMessageSafe(numericTabId, {
    type: "tabPauseChanged",
    paused
  });

  if (!paused) {
    await sendTabMessageSafe(numericTabId, {
      type: "triggerTranslateNow"
    });
  }
}

async function syncGlobalTranslationToTabs(enabled) {
  const targetLanguageCode = await ensureTargetLanguageLoaded();
  const tabs = await querySupportedTabs();
  if (!tabs.length) {
    return [];
  }

  return mapWithConcurrency(
    tabs,
    TAB_SYNC_MAX_CONCURRENT,
    async (tab) => {
      const tabId = normalizeTabId(tab?.id);
      if (tabId === null) {
        return {
          tabId: null,
          updated: false,
          restored: false,
          reloaded: false,
          error: "无效标签页"
        };
      }

      const tabUrl = typeof tab?.url === "string" ? tab.url : "";
      try {
        if (enabled) {
          pausedTabs.delete(tabId);
          const ensureResult = await ensureContentScriptForTab(tabId, tabUrl);
          if (!ensureResult?.ok) {
            return {
              tabId,
              updated: false,
              restored: false,
              reloaded: false,
              error: ensureResult?.error || "脚本注入失败"
            };
          }
          await sendTabMessageSafe(tabId, {
            type: "siteSettingChanged",
            enabled: true,
            targetLanguageCode
          });
          await sendTabMessageSafe(tabId, {
            type: "tabPauseChanged",
            paused: false
          });
          await sendTabMessageSafe(tabId, {
            type: "triggerTranslateNow"
          });
          return {
            tabId,
            updated: true,
            restored: false,
            reloaded: false,
            error: ""
          };
        }

        pausedTabs.delete(tabId);
        await sendTabMessageSafe(tabId, {
          type: "siteSettingChanged",
          enabled: false,
          targetLanguageCode
        });
        const restoreResult = await sendTabMessageSafe(tabId, {
          type: "restoreOriginalPage"
        });
        const restored = Boolean(restoreResult?.ok && restoreResult.restored);
        let reloaded = false;
        if (!restored) {
          reloaded = await reloadTabSafe(tabId);
        }
        return {
          tabId,
          updated: true,
          restored,
          reloaded,
          error: ""
        };
      } catch (error) {
        return {
          tabId,
          updated: false,
          restored: false,
          reloaded: false,
          error: String(error?.message || "标签页同步失败")
        };
      }
    }
  );
}

async function syncSiteSettingToHostTabs(hostname, enabled) {
  const targetLanguageCode = await ensureTargetLanguageLoaded();
  const normalizedHost = normalizeHostname(hostname);
  if (!normalizedHost) {
    return [];
  }

  const tabs = await queryTabsForHost(normalizedHost);
  if (!tabs.length) {
    return [];
  }

  return mapWithConcurrency(
    tabs,
    TAB_SYNC_MAX_CONCURRENT,
    async (tab) => {
      const tabId = normalizeTabId(tab?.id);
      if (tabId === null) {
        return {
          tabId: null,
          updated: false,
          restored: false,
          reloaded: false,
          error: "无效标签页"
        };
      }

      const tabUrl = typeof tab?.url === "string" ? tab.url : "";
      try {
        if (enabled) {
          pausedTabs.delete(tabId);
          await ensureHostScriptRegistered(normalizedHost);
          const ensureResult = await ensureContentScriptForTab(tabId, tabUrl);
          if (!ensureResult?.ok) {
            return {
              tabId,
              updated: false,
              restored: false,
              reloaded: false,
              error: ensureResult?.error || "脚本注入失败"
            };
          }
          await sendTabMessageSafe(tabId, {
            type: "siteSettingChanged",
            enabled: true,
            targetLanguageCode
          });
          await sendTabMessageSafe(tabId, {
            type: "tabPauseChanged",
            paused: false
          });
          await sendTabMessageSafe(tabId, {
            type: "triggerTranslateNow"
          });
          return {
            tabId,
            updated: true,
            restored: false,
            reloaded: false,
            error: ""
          };
        }

        pausedTabs.delete(tabId);
        await sendTabMessageSafe(tabId, {
          type: "siteSettingChanged",
          enabled: false,
          targetLanguageCode
        });
        const restoreResult = await sendTabMessageSafe(tabId, {
          type: "restoreOriginalPage"
        });
        const restored = Boolean(restoreResult?.ok && restoreResult.restored);
        let reloaded = false;
        if (!restored) {
          reloaded = await reloadTabSafe(tabId);
        }
        return {
          tabId,
          updated: true,
          restored,
          reloaded,
          error: ""
        };
      } catch (error) {
        return {
          tabId,
          updated: false,
          restored: false,
          reloaded: false,
          error: String(error?.message || "标签页同步失败")
        };
      }
    }
  );
}

async function queryTabsForHost(hostname) {
  if (!chrome.tabs?.query) {
    return [];
  }

  const patterns = matchesForHost(hostname);
  if (!patterns.length) {
    return [];
  }

  try {
    const tabs = await chrome.tabs.query({
      url: patterns
    });
    return Array.isArray(tabs) ? tabs : [];
  } catch (_error) {
    return [];
  }
}

async function querySupportedTabs() {
  if (!chrome.tabs?.query) {
    return [];
  }

  try {
    const tabs = await chrome.tabs.query({});
    return (Array.isArray(tabs) ? tabs : []).filter((tab) => {
      const parsed = safeParseUrl(tab?.url || "");
      return Boolean(parsed && /^https?:$/.test(parsed.protocol));
    });
  } catch (_error) {
    return [];
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return [];
  }

  const safeConcurrency = Math.max(1, Math.floor(concurrency || 1));
  const results = new Array(list.length);
  let cursor = 0;

  async function runner() {
    while (cursor < list.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(list[index], index);
    }
  }

  const workerCount = Math.min(safeConcurrency, list.length);
  const workers = [];
  for (let index = 0; index < workerCount; index += 1) {
    workers.push(runner());
  }
  await Promise.all(workers);
  return results;
}

async function findMatchedHostForUrl(rawUrl) {
  const parsed = safeParseUrl(rawUrl);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return "";
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname) {
    return "";
  }

  const rules = await loadSiteRules();
  return findMatchedRule(hostname, rules);
}

function normalizeTabId(value) {
  const tabId = Number(value);
  if (!Number.isInteger(tabId) || tabId < 0) {
    return null;
  }
  return tabId;
}

async function getTabSafe(tabId) {
  if (!chrome.tabs?.get) {
    return null;
  }
  try {
    return await chrome.tabs.get(tabId);
  } catch (_error) {
    return null;
  }
}

function safeParseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return null;
  }
  try {
    return new URL(rawUrl);
  } catch (_error) {
    return null;
  }
}

async function waitForContentScriptReady(tabId, attempts = 6, waitMs = 120) {
  for (let index = 0; index < attempts; index += 1) {
    if (await pingContentScript(tabId)) {
      return true;
    }
    await sleep(waitMs);
  }
  return false;
}

async function pingContentScript(tabId) {
  const response = await sendTabMessageSafe(tabId, {
    type: "pingTranslator"
  });
  return Boolean(response?.ok);
}

async function sendTabMessageSafe(tabId, message) {
  if (!chrome.tabs?.sendMessage) {
    return { ok: false, error: "tabs.sendMessage 不可用" };
  }
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response);
    });
  });
}

async function reloadTabSafe(tabId) {
  if (!chrome.tabs?.reload) {
    return false;
  }

  return new Promise((resolve) => {
    chrome.tabs.reload(tabId, {}, () => {
      if (chrome.runtime.lastError) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
}

function normalizeHostname(hostname) {
  if (!hostname || typeof hostname !== "string") {
    return "";
  }
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

function findMatchedRule(hostname, rules) {
  if (!hostname || !rules || typeof rules !== "object") {
    return "";
  }

  const segments = hostname.split(".").filter(Boolean);
  for (let index = 0; index < segments.length; index += 1) {
    const candidate = segments.slice(index).join(".");
    if (rules[candidate]) {
      return candidate;
    }
  }

  return "";
}

async function requestLongCatTranslation(sourceEntries, languageHint = "", requestOptions = {}) {
  try {
    return await requestLongCatTranslationCore(sourceEntries, languageHint, { requestOptions });
  } catch (error) {
    if (!isRecoverableTranslationError(error)) {
      throw error;
    }
    return requestLongCatTranslationBySplit(sourceEntries, languageHint, 0, { requestOptions });
  }
}

function createCandidateBatchSplitError(candidate, sourceEntries) {
  const itemCount = Array.isArray(sourceEntries) ? sourceEntries.length : 0;
  const totalChars = countEntryChars(sourceEntries);
  const error = new Error(
    `${candidate?.modelName || "后备模型"} 需要拆分批次（items=${itemCount}, chars=${totalChars}）`
  );
  error.code = "batch_split_required";
  error.modelName = candidate?.modelName || "";
  return error;
}

function buildCandidateTranslationPayload(candidate, systemPrompt, userPrompt, maxTokens) {
  return {
    model: candidate.modelName,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: userPrompt
      }
    ],
    temperature: Number(candidate.temperature ?? 0.1),
    max_tokens: Math.min(maxTokens, Number(candidate.maxOutputTokens || SAFE_MAX_OUTPUT_TOKENS)),
    stream: false
  };
}

async function executeTranslationCandidateRequest(candidate, payload, requestOptions = {}) {
  return runWithGlobalApiLimiter(
    () =>
      fetchWithRetry(
        candidate.endpoint,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${candidate.apiKey}`
          },
          body: JSON.stringify(payload)
        },
        Number(candidate.retryAttempts || 3),
        {
          ...requestOptions,
          providerKey: candidate.providerKey || candidate.providerId || "default",
          modelName: candidate.rateLimitKey || candidate.modelName,
          requestTimeoutMs: Number(candidate.requestTimeoutMs || REQUEST_TIMEOUT_MS)
        }
      ),
    {
      modelName: candidate.rateLimitKey || candidate.modelName
    }
  );
}

function createTranslationCandidateRequestHandle(candidate, context, overrideCandidate = null) {
  const activeCandidate = overrideCandidate || candidate;
  const abortController = new AbortController();
  const promise = requestTranslationViaCandidate(activeCandidate, {
    ...context,
    requestOptions: {
      ...(context.requestOptions || {}),
      externalSignal: abortController.signal
    }
  });

  return {
    candidate: activeCandidate,
    promise,
    cancel() {
      if (!abortController.signal.aborted) {
        abortController.abort();
      }
    }
  };
}

async function parseTranslationCandidateResponse(
  response,
  sourceTexts,
  normalizedEntries,
  languageHint,
  options,
  requestOptions
) {
  const result = await response.json();
  const content = result?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("LongCat 返回内容为空");
  }

  const parsed = parseModelTranslations(content.trim(), sourceTexts);
  if (options.skipMissingBackfill || !parsed.missingIndexes.length) {
    return parsed.translations;
  }
  return recoverMissingTranslations({
    sourceEntries: normalizedEntries,
    translations: parsed.translations,
    missingIndexes: parsed.missingIndexes,
    languageHint,
    requestOptions
  });
}

async function requestTranslationViaCandidate(candidate, context) {
  if (!candidate) {
    throw new Error("无可用翻译候选");
  }

  const {
    normalizedEntries,
    sourceTexts,
    languageHint,
    requestOptions,
    systemPrompt,
    userPrompt,
    maxTokens,
    options
  } = context;

  if (!isCandidateBatchSuitable(candidate, normalizedEntries)) {
    throw createCandidateBatchSplitError(candidate, normalizedEntries);
  }

  const payload = buildCandidateTranslationPayload(candidate, systemPrompt, userPrompt, maxTokens);
  const response = await executeTranslationCandidateRequest(candidate, payload, requestOptions);
  return parseTranslationCandidateResponse(
    response,
    sourceTexts,
    normalizedEntries,
    languageHint,
    options,
    requestOptions
  );
}

async function requestTranslationWithBuiltInCandidates(candidates, context) {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return await requestTranslationViaCandidate(candidate, context);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("LongCat 请求失败");
}

async function requestLongCatTranslationCore(sourceEntries, languageHint = "", options = {}) {
  const requestOptions = options.requestOptions || {};
  const normalizedEntries = Array.isArray(sourceEntries)
    ? sourceEntries.map((entry) => normalizeTranslationEntry(entry)).filter(Boolean)
    : [];
  if (!normalizedEntries.length) {
    return [];
  }
  const sourceTexts = normalizedEntries.map((entry) => entry.text);
  const languageProfile = detectLanguageProfile(normalizedEntries, languageHint);
  const systemPrompt = buildSystemPrompt(languageProfile);
  const userPrompt = buildUserPrompt(normalizedEntries, languageProfile);
  const apiKey = await getApiKey();
  const apiEndpoint = await getApiEndpointOrDefault();
  const translationCandidates = getBuiltInTranslationCandidates(apiKey, apiEndpoint);
  if (!translationCandidates.length) {
    throw new Error("未配置任何可用的内置翻译服务");
  }

  let maxTokens = estimateBestEffortMaxTokens(systemPrompt, userPrompt, normalizedEntries);
  let lastError = null;
  const requestContext = {
    normalizedEntries,
    sourceTexts,
    languageHint,
    requestOptions,
    systemPrompt,
    userPrompt,
    options
  };

  for (let attempt = 1; attempt <= MAX_CONTEXT_RETRY; attempt += 1) {
    let attemptError = null;

    try {
      return await requestTranslationWithBuiltInCandidates(translationCandidates, {
        ...requestContext,
        maxTokens
      });
    } catch (error) {
      lastError = error;
      attemptError = error;
    }

    if (!shouldShrinkMaxTokens(attemptError) || maxTokens <= MIN_OUTPUT_TOKENS) {
      throw attemptError || lastError || new Error("LongCat 请求失败");
    }

    maxTokens = Math.max(
      MIN_OUTPUT_TOKENS,
      Math.floor(maxTokens * SHRINK_RATIO_ON_CONTEXT_ERROR)
    );
  }

  throw lastError || new Error("LongCat 请求失败");
}

async function recoverMissingTranslations({
  sourceEntries,
  translations,
  missingIndexes,
  languageHint,
  requestOptions
}) {
  const sourceTexts = Array.isArray(sourceEntries)
    ? sourceEntries.map((entry) => String(entry?.text ?? ""))
    : [];
  const uniqueMissingIndexes = Array.from(
    new Set(
      (missingIndexes || []).filter(
        (index) => Number.isInteger(index) && index >= 0 && index < sourceTexts.length
      )
    )
  );

  if (!uniqueMissingIndexes.length) {
    return translations;
  }

  const missingEntries = uniqueMissingIndexes.map((index) => sourceEntries[index]);
  let recovered = [];
  try {
    recovered = await requestLongCatTranslationResilient(
      missingEntries,
      languageHint,
      1,
      {
        skipMissingBackfill: true,
        requestOptions
      }
    );
  } catch (_error) {
    recovered = missingEntries.map((item) => String(item?.text ?? ""));
  }

  const merged = [...translations];
  uniqueMissingIndexes.forEach((sourceIndex, subsetIndex) => {
    merged[sourceIndex] = sanitizeTranslatedText(recovered[subsetIndex], sourceTexts[sourceIndex]);
  });
  return merged;
}

function buildSystemPrompt(languageProfile) {
  const targetLanguage = getTargetLanguageConfig();
  return [
    `你是一个${languageProfile.role}。`,
    `当前源语言优先按「${languageProfile.name}」处理。`,
    `任务：将用户提供的文本准确翻译为自然、流畅的${targetLanguage.systemName}（${targetLanguage.code}）。`,
    `目标语言强制要求：${targetLanguage.targetHint}`,
    targetLanguage.preserveHint,
    `翻译要点：${languageProfile.guidance}`,
    "硬性要求：",
    "1) 只输出 JSON 数组，不要输出解释、标题、Markdown 代码块。",
    "2) 输出数组长度必须与输入数组完全一致，并严格一一对应。",
    "3) 保留原文中的专有名词、缩写、数字、单位和链接格式。",
    "4) 保持原有语气，不要扩写或删减事实信息。",
    targetLanguage.finalHint
  ].join("\n");
}

function buildUserPrompt(entries, languageProfile) {
  const targetLanguage = getTargetLanguageConfig();
  const indexedTexts = entries.map((entry, index) => {
    const item = {
      id: index,
      text: String(entry?.text ?? "")
    };
    const prev = normalizeBatchText(entry?.prev || "");
    const next = normalizeBatchText(entry?.next || "");
    if (prev) {
      item.prev = prev;
    }
    if (next) {
      item.next = next;
    }
    return item;
  });

  return [
    `请将下面 JSON 数组中的每个字符串从${languageProfile.name}翻译为${targetLanguage.systemName}（${targetLanguage.code}）。`,
    `若个别条目语言与主语言不同，也需自动识别后翻译为${targetLanguage.systemName}。`,
    "要求：",
    "1) 输出必须是 JSON 数组。",
    "2) 输出数组元素必须是对象，格式为 {\"id\":数字, \"translation\":\"译文\"}。",
    "3) 每个 id 必须与输入一一对应，不可遗漏、不可重复。",
    "4) prev/next 仅作为语境参考，translation 只翻译 text 字段本身，不要把 prev/next 拼进译文。",
    "5) 不要输出解释、前后缀、Markdown 代码块。",
    "6) 保留原本语气和标点符号。",
    `7) 每条译文必须是自然${targetLanguage.systemName}。`,
    "输入：",
    JSON.stringify(indexedTexts)
  ].join("\n");
}

function detectLanguageProfile(sourceEntries, languageHint) {
  const hintedCode = normalizeLanguageHint(languageHint);

  const sample = buildLanguageSample(sourceEntries);
  const scriptDetectedCode = detectScriptLanguage(sample);
  if (scriptDetectedCode && LANGUAGE_PROFILES[scriptDetectedCode]) {
    return LANGUAGE_PROFILES[scriptDetectedCode];
  }

  const latinDetectedCode = detectLatinLanguage(sample);
  if (latinDetectedCode && LANGUAGE_PROFILES[latinDetectedCode]) {
    return LANGUAGE_PROFILES[latinDetectedCode];
  }

  if (hintedCode && LANGUAGE_PROFILES[hintedCode]) {
    return LANGUAGE_PROFILES[hintedCode];
  }

  if (hintedCode === "zh") {
    return LANGUAGE_PROFILES.auto;
  }

  return LANGUAGE_PROFILES.en;
}

function normalizeLanguageHint(languageHint) {
  if (!languageHint || typeof languageHint !== "string") {
    return "";
  }

  const normalized = languageHint.trim().toLowerCase().replace(/_/g, "-");
  if (!normalized) {
    return "";
  }

  if (LANGUAGE_HINT_ALIASES[normalized]) {
    return LANGUAGE_HINT_ALIASES[normalized];
  }

  const shortCode = normalized.split("-")[0];
  return LANGUAGE_HINT_ALIASES[shortCode] || shortCode;
}

function buildLanguageSample(sourceEntries) {
  return sourceEntries
    .map((item) => String(item?.text || ""))
    .join(" ")
    .slice(0, 14000);
}

function detectScriptLanguage(text) {
  if (!text) {
    return "";
  }

  const kanaCount = countMatches(text, /[\u3040-\u30ff]/g);
  const hangulCount = countMatches(text, /[\uac00-\ud7af]/g);
  const cyrillicCount = countMatches(text, /[\u0400-\u04ff]/g);
  const arabicCount = countMatches(text, /[\u0600-\u06ff]/g);

  if (kanaCount >= 4) {
    return "ja";
  }

  if (hangulCount >= 4) {
    return "ko";
  }

  if (cyrillicCount >= 4) {
    return "ru";
  }

  if (arabicCount >= 4) {
    return "ar";
  }

  return "";
}

function detectLatinLanguage(text) {
  if (!text) {
    return "";
  }

  const latinLetters = countMatches(text, /[A-Za-z]/g);
  if (latinLetters < 16) {
    return "";
  }

  let topCode = "";
  let topScore = -1;
  let secondScore = -1;

  for (const [code, stopwords] of Object.entries(LATIN_STOPWORDS)) {
    let score = 0;
    for (const word of stopwords) {
      score += countWordOccurrences(text, word);
    }

    if (score > topScore) {
      secondScore = topScore;
      topScore = score;
      topCode = code;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  if (topScore < 2) {
    return "en";
  }

  if (secondScore > 0 && topScore < secondScore * 1.2) {
    return "en";
  }

  return topCode || "en";
}

function countWordOccurrences(text, word) {
  const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
  return countMatches(text, pattern);
}

function countMatches(text, regex) {
  if (!text || !regex) {
    return 0;
  }

  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function requestLongCatTranslationBySplit(
  texts,
  languageHint,
  depth,
  options = {}
) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  if (texts.length <= 1 || depth >= TRANSLATION_RECOVERY_MAX_DEPTH) {
    return translateTextsIndividually(texts, languageHint, options);
  }

  const midpoint = Math.ceil(texts.length / 2);
  const leftTexts = texts.slice(0, midpoint);
  const rightTexts = texts.slice(midpoint);

  const [leftTranslations, rightTranslations] = await Promise.all([
    requestLongCatTranslationResilient(
      leftTexts,
      languageHint,
      depth + 1,
      options
    ),
    requestLongCatTranslationResilient(
      rightTexts,
      languageHint,
      depth + 1,
      options
    )
  ]);

  return leftTranslations.concat(rightTranslations);
}

async function requestLongCatTranslationResilient(
  texts,
  languageHint,
  depth,
  options = {}
) {
  try {
    return await requestLongCatTranslationCore(texts, languageHint, options);
  } catch (error) {
    if (!isRecoverableTranslationError(error)) {
      throw error;
    }
    return requestLongCatTranslationBySplit(texts, languageHint, depth, options);
  }
}

async function translateTextsIndividually(texts, languageHint, options = {}) {
  return Promise.all(
    texts.map(async (entry) => {
      const normalizedEntry = normalizeTranslationEntry(entry);
      const sourceText = String(normalizedEntry?.text ?? "");
      try {
        const single = await requestLongCatTranslationCore(
          [normalizedEntry || { text: sourceText, prev: "", next: "" }],
          languageHint,
          options
        );
        return single[0] || sourceText;
      } catch (_error) {
        return sourceText;
      }
    })
  );
}

function isRecoverableTranslationError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("返回内容为空") ||
    message.includes("无法解析") ||
    message.includes("数量不匹配") ||
    message.includes("JSON") ||
    message.includes("拆分批次")
  );
}

function parseModelTranslations(content, sourceTexts) {
  const candidates = collectJsonCandidates(content);
  const expectedCount = sourceTexts.length;

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const translations = normalizeParsedTranslations(parsed, expectedCount);
      if (!translations) {
        continue;
      }

      const sanitizedTranslations = translations.map((item, index) =>
        sanitizeTranslatedText(item, sourceTexts[index])
      );
      const missingIndexes = collectMissingIndexes(sanitizedTranslations);
      return {
        translations: sanitizedTranslations,
        missingIndexes
      };
    } catch (_error) {
      // 忽略单次解析错误，继续尝试其他候选。
    }
  }

  throw new Error("模型返回内容无法解析为有效翻译数组");
}

function collectMissingIndexes(translations) {
  const missingIndexes = [];
  for (let index = 0; index < translations.length; index += 1) {
    const value = translations[index];
    if (typeof value !== "string" || !value.trim()) {
      missingIndexes.push(index);
    }
  }
  return missingIndexes;
}

function collectJsonCandidates(content) {
  const candidates = [content];

  const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    candidates.push(codeBlockMatch[1].trim());
  }

  const bracketMatch = content.match(/\[[\s\S]*\]/);
  if (bracketMatch && bracketMatch[0]) {
    candidates.push(bracketMatch[0].trim());
  }

  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch && objectMatch[0]) {
    candidates.push(objectMatch[0].trim());
  }

  return candidates;
}

function normalizeParsedTranslations(parsed, expectedCount) {
  if (Array.isArray(parsed)) {
    return normalizeTranslationArray(parsed, expectedCount);
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const containerKeys = ["translations", "items", "results", "data", "output"];
  for (const key of containerKeys) {
    if (Array.isArray(parsed[key])) {
      const normalized = normalizeTranslationArray(parsed[key], expectedCount);
      if (normalized) {
        return normalized;
      }
    }
  }

  return null;
}

function normalizeTranslationArray(items, expectedCount) {
  if (!Array.isArray(items) || expectedCount <= 0) {
    return null;
  }

  const primitiveMode = items.every(
    (item) => item == null || ["string", "number", "boolean"].includes(typeof item)
  );
  if (primitiveMode) {
    return fillBySequence(items, expectedCount);
  }

  const byId = fillById(items, expectedCount);
  if (byId) {
    return byId;
  }

  const byObjectOrder = fillByObjectOrder(items, expectedCount);
  if (byObjectOrder) {
    return byObjectOrder;
  }

  return null;
}

function fillBySequence(items, expectedCount) {
  const normalized = new Array(expectedCount).fill("");
  const limit = Math.min(expectedCount, items.length);
  for (let index = 0; index < limit; index += 1) {
    normalized[index] = String(items[index] ?? "");
  }
  return normalized;
}

function fillById(items, expectedCount) {
  const normalized = new Array(expectedCount).fill("");
  let filled = 0;

  for (const item of items) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const id = readTranslationItemId(item);
    if (!Number.isInteger(id) || id < 0 || id >= expectedCount) {
      continue;
    }

    const translation = readTranslationItemText(item);
    if (translation == null) {
      continue;
    }

    if (!normalized[id]) {
      filled += 1;
    }
    normalized[id] = String(translation);
  }

  if (filled === expectedCount) {
    return normalized;
  }

  if (filled >= Math.max(1, Math.floor(expectedCount * 0.6))) {
    return normalized;
  }

  return null;
}

function fillByObjectOrder(items, expectedCount) {
  const normalized = new Array(expectedCount).fill("");
  let filled = 0;
  const limit = Math.min(items.length, expectedCount);

  for (let index = 0; index < limit; index += 1) {
    const item = items[index];
    if (!item || typeof item !== "object") {
      continue;
    }

    const translation = readTranslationItemText(item);
    if (translation == null) {
      continue;
    }

    normalized[index] = String(translation);
    filled += 1;
  }

  if (filled >= Math.max(1, Math.floor(expectedCount * 0.7))) {
    return normalized;
  }

  return null;
}

function readTranslationItemId(item) {
  const idKeys = ["id", "index", "idx", "i"];
  for (const key of idKeys) {
    const value = item[key];
    if (value == null) {
      continue;
    }
    const numeric = Number(value);
    if (Number.isInteger(numeric)) {
      return numeric;
    }
  }
  return -1;
}

function readTranslationItemText(item) {
  const textKeys = [
    "translation",
    "translated",
    "result",
    "text",
    "value",
    "output",
    "target"
  ];

  for (const key of textKeys) {
    const value = item[key];
    if (value == null) {
      continue;
    }
    if (["string", "number", "boolean"].includes(typeof value)) {
      return value;
    }
  }

  return null;
}

function sanitizeTranslatedText(translated, sourceText) {
  const translatedText = String(translated ?? "").trim();
  if (!translatedText) {
    return "";
  }
  if (!isAcceptableTranslatedText(sourceText, translatedText)) {
    return "";
  }
  return translatedText;
}

function normalizeComparisonText(text) {
  if (text == null) {
    return "";
  }
  return String(text)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function containsChineseChar(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ""));
}

function hasLatinLetters(text) {
  return /[A-Za-z]/.test(String(text || ""));
}

function hasNonEnglishScript(text) {
  return /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/i.test(
    String(text || "")
  );
}

function isLikelyEnglishPhrase(text) {
  const words = String(text || "").match(/[A-Za-z]+/g) || [];
  if (!words.length) {
    return false;
  }
  const latinChars = words.join("").length;
  return words.length >= 2 || latinChars >= 10;
}

function isLikelyTargetChineseText(text) {
  return containsChineseChar(normalizeComparisonText(text));
}

function isAcceptableSameChineseLikeText(text) {
  return isLikelyTargetChineseText(text);
}

function containsNonEnglishScript(text) {
  return /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u4e00-\u9fff]/i.test(
    String(text || "")
  );
}

function isLikelyTargetEnglishText(text) {
  const normalized = normalizeComparisonText(text);
  if (!normalized || containsChineseChar(normalized) || containsNonEnglishScript(normalized)) {
    return false;
  }
  return isLikelyEnglishPhrase(normalized) || hasLatinLetters(normalized);
}

function isAcceptableTranslatedText(sourceText, translatedText) {
  const normalizedSource = normalizeComparisonText(sourceText);
  const normalizedTranslated = normalizeComparisonText(translatedText);

  if (!normalizedTranslated) {
    return false;
  }

  if (!normalizedSource) {
    return true;
  }

  const targetLanguageCode = runtimeTargetLanguageCode;
  const sourceLooksTarget =
    targetLanguageCode === "en"
      ? isLikelyTargetEnglishText(normalizedSource)
      : isLikelyTargetChineseText(normalizedSource);
  if (normalizedSource === normalizedTranslated) {
    if (targetLanguageCode === "en") {
      return sourceLooksTarget;
    }
    return sourceLooksTarget || isAcceptableSameChineseLikeText(normalizedSource);
  }

  if (targetLanguageCode === "en") {
    if (containsChineseChar(normalizedTranslated) || containsNonEnglishScript(normalizedTranslated)) {
      return false;
    }
    return hasLatinLetters(normalizedTranslated);
  }

  if (!containsChineseChar(normalizedTranslated) && !sourceLooksTarget) {
    return false;
  }

  return true;
}

function estimateBestEffortMaxTokens(systemPrompt, userPrompt, sourceEntries = []) {
  const estimatedPromptTokens =
    estimateTokenCount(systemPrompt) +
    estimateTokenCount(userPrompt) +
    REQUEST_OVERHEAD_TOKENS;
  const estimatedSourceTokens = Array.isArray(sourceEntries)
    ? sourceEntries.reduce((sum, entry) => sum + estimateTokenCount(entry?.text || ""), 0)
    : 0;
  const estimatedStructureTokens = Math.max(
    120,
    Math.ceil((Array.isArray(sourceEntries) ? sourceEntries.length : 0) * 24)
  );

  const promptPenalty = Math.max(
    0,
    Math.floor((estimatedPromptTokens + CONTEXT_SAFETY_TOKENS - 2200) * 0.1)
  );
  const baselineTarget = DEFAULT_OUTPUT_TOKENS - promptPenalty;
  const sourceAwareTarget = Math.ceil(estimatedSourceTokens * 1.35 + estimatedStructureTokens);
  const dynamicTarget = Math.max(baselineTarget, sourceAwareTarget);
  return clampInt(dynamicTarget, MIN_OUTPUT_TOKENS, SAFE_MAX_OUTPUT_TOKENS);
}

function estimateTokenCount(text) {
  if (!text) {
    return 0;
  }

  let tokenCount = 0;
  for (const char of text) {
    if (/[\u4e00-\u9fff]/.test(char)) {
      tokenCount += 1;
    } else if (/\s/.test(char)) {
      tokenCount += 0.25;
    } else if (/[A-Za-z0-9]/.test(char)) {
      tokenCount += 0.3;
    } else {
      tokenCount += 0.6;
    }
  }

  return Math.ceil(tokenCount);
}

function shouldShrinkMaxTokens(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("context_length_exceeded") ||
    message.includes("maximum context length") ||
    message.includes("max_tokens") ||
    (message.includes("token") && message.includes("exceed"))
  );
}

function clampInt(value, min, max) {
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function resolveModelRateLimitStrategy(modelName) {
  const normalized = String(modelName || "").trim().toLowerCase();
  if (normalized.includes("flash-lite")) {
    return FLASH_LITE_RATE_LIMIT_STRATEGY;
  }
  if (normalized.includes("flash-chat")) {
    return FLASH_CHAT_RATE_LIMIT_STRATEGY;
  }
  return DEFAULT_MODEL_RATE_LIMIT_STRATEGY;
}

function getModelApiLimiterState(modelName) {
  const key = String(modelName || "").trim().toLowerCase() || "__default__";
  let state = modelApiLimiterStates.get(key);
  if (state) {
    return state;
  }

  const strategy = resolveModelRateLimitStrategy(modelName);
  state = {
    modelName: String(modelName || ""),
    strategy,
    activeCount: 0,
    lastStartedAt: 0,
    currentMaxConcurrent: strategy.initialConcurrent,
    currentMinIntervalMs: strategy.initialMinIntervalMs,
    cooldownUntil: 0,
    consecutive429: 0,
    consecutiveTimeouts: 0,
    slowStreak: 0,
    successStreak: 0
  };
  modelApiLimiterStates.set(key, state);
  return state;
}

function applyModelApiLimiterBackoff(state, strategy, options = {}) {
  if (!state || !strategy) {
    return;
  }

  const nowMs = Date.now();
  const severity = options.severity === "hard" ? "hard" : "soft";
  const retryAfterMs = Math.max(0, Number(options.retryAfterMs || 0));
  const cooldownBaseMs =
    severity === "hard" ? strategy.cooldownBaseMs : strategy.timeoutCooldownMs;
  const cooldownFactor =
    severity === "hard"
      ? Math.min(4, Math.max(1, Number(state.consecutive429 || 0)))
      : Math.min(3, Math.max(1, Number(state.consecutiveTimeouts || 0)));

  if (severity === "hard") {
    state.currentMaxConcurrent = Math.max(
      strategy.minConcurrent,
      state.currentMaxConcurrent <= 2 ? 1 : Math.ceil(state.currentMaxConcurrent / 2)
    );
    state.currentMinIntervalMs = Math.min(
      strategy.maxMinIntervalMs,
      Math.max(strategy.initialMinIntervalMs * 2, state.currentMinIntervalMs * 2 + 40)
    );
  } else {
    state.currentMaxConcurrent = Math.max(
      strategy.minConcurrent,
      state.currentMaxConcurrent - 1
    );
    state.currentMinIntervalMs = Math.min(
      strategy.maxMinIntervalMs,
      state.currentMinIntervalMs + strategy.recoveryIntervalStepMs * 2
    );
  }

  state.cooldownUntil = Math.max(
    state.cooldownUntil,
    nowMs + Math.max(retryAfterMs, cooldownBaseMs * cooldownFactor)
  );
  state.successStreak = 0;
  state.slowStreak = 0;
}

function noteModelApiLimiterOutcome(modelName, outcome = {}) {
  const state = getModelApiLimiterState(modelName);
  const strategy = state.strategy || resolveModelRateLimitStrategy(modelName);
  const latencyMs = Math.max(0, Number(outcome.latencyMs || 0));
  const statusCode = Number(outcome.statusCode || 0);
  const is429 = statusCode === 429;
  const isTimeout = Boolean(outcome.timeout) || latencyMs >= strategy.severeSlowResponseMs;
  const isSlow = !is429 && !isTimeout && latencyMs >= strategy.slowResponseMs;

  if (is429) {
    state.consecutive429 += 1;
    state.consecutiveTimeouts = 0;
    applyModelApiLimiterBackoff(state, strategy, {
      severity: "hard",
      retryAfterMs: outcome.retryAfterMs
    });
    return;
  }

  if (isTimeout) {
    state.consecutiveTimeouts += 1;
    state.consecutive429 = 0;
    applyModelApiLimiterBackoff(state, strategy, {
      severity: "soft",
      retryAfterMs: outcome.retryAfterMs
    });
    return;
  }

  if (isSlow) {
    state.slowStreak += 1;
    state.successStreak = 0;
    state.consecutive429 = 0;
    state.consecutiveTimeouts = 0;
    if (state.slowStreak >= 2) {
      applyModelApiLimiterBackoff(state, strategy, {
        severity: "soft"
      });
      state.slowStreak = 0;
    }
    return;
  }

  state.consecutive429 = 0;
  state.consecutiveTimeouts = 0;
  state.slowStreak = 0;
  state.successStreak += 1;

  if (
    Date.now() >= state.cooldownUntil &&
    state.successStreak >= strategy.recoverySuccesses
  ) {
    if (state.currentMaxConcurrent < strategy.maxConcurrent) {
      state.currentMaxConcurrent += 1;
    }
    state.currentMinIntervalMs = Math.max(
      strategy.initialMinIntervalMs,
      state.currentMinIntervalMs - strategy.recoveryIntervalStepMs
    );
    state.successStreak = 0;
  }
}

function readRetryAfterMs(response) {
  const retryAfterMsHeader = String(response?.headers?.get?.("retry-after-ms") || "").trim();
  if (retryAfterMsHeader) {
    const numericMs = Number(retryAfterMsHeader);
    if (Number.isFinite(numericMs) && numericMs > 0) {
      return Math.ceil(numericMs);
    }
  }

  const retryAfterHeader = String(response?.headers?.get?.("retry-after") || "").trim();
  if (!retryAfterHeader) {
    return 0;
  }

  const numeric = Number(retryAfterHeader);
  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.ceil(numeric * 1000);
  }

  const retryAt = Date.parse(retryAfterHeader);
  if (!Number.isNaN(retryAt)) {
    return Math.max(0, retryAt - Date.now());
  }
  return 0;
}

function isApiLimiterTimeoutError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return message.includes("timeout") || message.includes("超时") || message.includes("aborted");
}

function runWithGlobalApiLimiter(task, meta = {}) {
  return new Promise((resolve, reject) => {
    globalApiLimiterState.queue.push({
      task,
      modelName: String(meta.modelName || ""),
      resolve,
      reject
    });
    pumpGlobalApiQueue();
  });
}

function pumpGlobalApiQueue() {
  const maxConcurrent = Math.max(1, Number(runtimePerformanceSettings.apiMaxConcurrent || 1));
  const minIntervalMs = Math.max(0, Number(runtimePerformanceSettings.apiMinIntervalMs || 0));

  if (globalApiLimiterState.activeCount >= maxConcurrent) {
    return;
  }

  if (!globalApiLimiterState.queue.length) {
    return;
  }

  const nowMs = Date.now();
  const elapsedSinceLast = nowMs - globalApiLimiterState.lastStartedAt;
  const globalWaitMs = Math.max(0, minIntervalMs - elapsedSinceLast);
  let queuedIndex = -1;
  let queued = null;
  let earliestWaitMs = Number.POSITIVE_INFINITY;

  for (let index = 0; index < globalApiLimiterState.queue.length; index += 1) {
    const candidate = globalApiLimiterState.queue[index];
    const modelState = getModelApiLimiterState(candidate?.modelName);
    if (modelState.activeCount >= modelState.currentMaxConcurrent) {
      continue;
    }

    const modelElapsed = nowMs - modelState.lastStartedAt;
    const modelWaitMs = Math.max(0, modelState.currentMinIntervalMs - modelElapsed);
    const cooldownWaitMs = Math.max(0, modelState.cooldownUntil - nowMs);
    const waitMs = Math.max(globalWaitMs, modelWaitMs, cooldownWaitMs);
    if (waitMs <= 0) {
      queuedIndex = index;
      queued = candidate;
      break;
    }
    earliestWaitMs = Math.min(earliestWaitMs, waitMs);
  }

  if (!queued) {
    if (Number.isFinite(earliestWaitMs) && earliestWaitMs > 0) {
      if (globalApiLimiterState.timer) {
        return;
      }
      globalApiLimiterState.timer = setTimeout(() => {
        globalApiLimiterState.timer = null;
        pumpGlobalApiQueue();
      }, earliestWaitMs);
    }
    return;
  }

  globalApiLimiterState.queue.splice(queuedIndex, 1);

  const modelState = getModelApiLimiterState(queued.modelName);

  globalApiLimiterState.activeCount += 1;
  globalApiLimiterState.lastStartedAt = Date.now();
  modelState.activeCount += 1;
  modelState.lastStartedAt = globalApiLimiterState.lastStartedAt;
  const requestStartedAt = globalApiLimiterState.lastStartedAt;
  Promise.resolve()
    .then(() => queued.task())
    .then((result) => {
      noteModelApiLimiterOutcome(queued.modelName, {
        statusCode: Number(result?.status || 200),
        latencyMs: Date.now() - requestStartedAt
      });
      queued.resolve(result);
    })
    .catch((error) => {
      if (
        !isCanceledFetchError(error) &&
        (!Number(error?.statusCode || 0) || Number(error?.statusCode || 0) !== 429)
      ) {
        noteModelApiLimiterOutcome(queued.modelName, {
          statusCode: Number(error?.statusCode || 0),
          latencyMs: Date.now() - requestStartedAt,
          timeout: isApiLimiterTimeoutError(error)
        });
      }
      queued.reject(error);
    })
    .finally(() => {
      globalApiLimiterState.activeCount = Math.max(0, globalApiLimiterState.activeCount - 1);
      modelState.activeCount = Math.max(0, modelState.activeCount - 1);
      pumpGlobalApiQueue();
    });

  if (globalApiLimiterState.activeCount < maxConcurrent) {
    pumpGlobalApiQueue();
  }
}

async function fetchWithRetry(url, options, maxAttempts = 3, runtimeOptions = {}) {
  const providerKey = runtimeOptions?.providerKey || "default";
  const contextKey = runtimeOptions?.contextKey || "";
  const requestTimeoutMs = Math.max(
    1000,
    Number(runtimeOptions?.requestTimeoutMs || REQUEST_TIMEOUT_MS)
  );
  const externalSignal = runtimeOptions?.externalSignal || null;
  if (externalSignal?.aborted) {
    const canceledError = new Error("翻译请求已取消");
    canceledError.name = "AbortError";
    throw canceledError;
  }
  const circuitContext = beginCircuitRequest(providerKey);
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let timeoutId = null;
    let controller = null;
    let detachExternalAbort = null;
    const requestStartedAt = Date.now();
    try {
      if (externalSignal?.aborted) {
        const canceledError = new Error("翻译请求已取消");
        canceledError.name = "AbortError";
        throw canceledError;
      }

      controller = new AbortController();
      if (externalSignal) {
        const onExternalAbort = () => {
          controller.__longcatCanceled = true;
          controller.abort();
        };
        externalSignal.addEventListener("abort", onExternalAbort, { once: true });
        detachExternalAbort = () => {
          externalSignal.removeEventListener("abort", onExternalAbort);
        };
      }
      registerContextController(contextKey, controller);
      timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      timeoutId = null;

      if (response.ok) {
        markCircuitRequestSuccess(circuitContext);
        return response;
      }

      const bodyText = await safeReadResponseText(response);
      if (response.status === 429 && runtimeOptions?.modelName) {
        noteModelApiLimiterOutcome(runtimeOptions.modelName, {
          statusCode: 429,
          latencyMs: Date.now() - requestStartedAt,
          retryAfterMs: readRetryAfterMs(response)
        });
      }
      if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts) {
        await sleep(backoffDelay(attempt));
        continue;
      }

      const httpError = new Error(`LongCat 接口错误 (${response.status}): ${bodyText}`);
      httpError.statusCode = response.status;
      throw httpError;
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const normalizedError = normalizeFetchError(error, controller, url);
      lastError = normalizedError;
      if (isCanceledFetchError(normalizedError)) {
        releaseCircuitRequest(circuitContext);
        throw normalizedError;
      }
      if (shouldRetryFetchError(normalizedError, attempt, maxAttempts)) {
        await sleep(backoffDelay(attempt));
        continue;
      }

      markCircuitRequestFailure(circuitContext);
      throw normalizedError;
    } finally {
      unregisterContextController(contextKey, controller);
      if (detachExternalAbort) {
        detachExternalAbort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  markCircuitRequestFailure(circuitContext);
  throw lastError || new Error("LongCat 请求失败");
}

function beginCircuitRequest(providerKey = "default") {
  const state = getProviderCircuitBreakerState(providerKey);
  const nowMs = Date.now();
  if (state.status === "open") {
    const cooldownLeft = CIRCUIT_BREAKER_COOLDOWN_MS - (nowMs - state.openedAt);
    if (cooldownLeft > 0) {
      throw new Error(`翻译服务冷却中，请${Math.ceil(cooldownLeft / 1000)}秒后重试`);
    }
    state.status = "half-open";
    state.halfOpenInFlight = 0;
  }

  if (
    state.status === "half-open" &&
    state.halfOpenInFlight >= CIRCUIT_BREAKER_HALF_OPEN_MAX_IN_FLIGHT
  ) {
    throw new Error("翻译服务正在恢复，请稍后再试");
  }

  if (state.status === "half-open") {
    state.halfOpenInFlight += 1;
  }

  return {
    providerKey,
    startedInHalfOpen: state.status === "half-open"
  };
}

function markCircuitRequestSuccess(context) {
  const state = getProviderCircuitBreakerState(context?.providerKey);
  if (context?.startedInHalfOpen) {
    state.halfOpenInFlight = Math.max(0, state.halfOpenInFlight - 1);
  }
  state.status = "closed";
  state.consecutiveFailures = 0;
  state.openedAt = 0;
}

function markCircuitRequestFailure(context) {
  const state = getProviderCircuitBreakerState(context?.providerKey);
  if (context?.startedInHalfOpen) {
    state.halfOpenInFlight = Math.max(0, state.halfOpenInFlight - 1);
  }
  state.consecutiveFailures += 1;

  if (
    context?.startedInHalfOpen ||
    state.consecutiveFailures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD
  ) {
    state.status = "open";
    state.openedAt = Date.now();
    state.halfOpenInFlight = 0;
  }
}

function releaseCircuitRequest(context) {
  const state = getProviderCircuitBreakerState(context?.providerKey);
  if (context?.startedInHalfOpen) {
    state.halfOpenInFlight = Math.max(0, state.halfOpenInFlight - 1);
  }
}

function normalizeFetchError(error, controller, url = "") {
  if (controller?.__longcatCanceled) {
    return new Error("翻译请求已取消");
  }
  if (error && typeof error === "object" && error.name === "AbortError") {
    return new Error(`LongCat 请求超时`);
  }
  if (isLikelyBrowserNetworkError(error)) {
    return new Error(buildReadableNetworkErrorMessage(url));
  }
  return error instanceof Error ? error : new Error(String(error || "LongCat 请求失败"));
}

function isLikelyBrowserNetworkError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("load failed") ||
    message.includes("networkerror") ||
    message.includes("network error")
  );
}

function buildReadableNetworkErrorMessage(url) {
  let endpointHost = String(url || "").trim();
  try {
    endpointHost = new URL(url).host || endpointHost;
  } catch (_error) {
    // 保留原始地址片段用于诊断。
  }

  return `LongCat 网络连接失败（${endpointHost || "未知接口"}），请检查 API 地址、代理/网络、TLS 证书或服务端可用性。插件当前已固定使用推荐性能模式。`;
}

function isCanceledFetchError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("已取消") ||
    message.includes("cancel") ||
    message.includes("aborted")
  );
}

function shouldRetryFetchError(error, attempt, maxAttempts) {
  if (attempt >= maxAttempts) {
    return false;
  }
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("超时") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("load failed")
  );
}

async function safeReadResponseText(response) {
  try {
    const text = await response.text();
    return text.slice(0, 500);
  } catch (_error) {
    return "读取响应失败";
  }
}

function backoffDelay(attempt) {
  return 400 * Math.pow(2, attempt - 1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
