# AItranslate 全量代码（最新）

## background.js
```
const API_ENDPOINT = "https://api.longcat.chat/openai/v1/chat/completions";
const MODEL_NAME = "LongCat-Flash-Lite";
const API_KEY_STORAGE_KEY = "longcatApiKey";
const API_KEY_STORAGE_SCOPE_KEY = "apiKeyStorageScope";
const API_KEY_STORAGE_SCOPE_SYNC = "sync";
const API_KEY_STORAGE_SCOPE_LOCAL = "local";

const SITE_RULES_KEY = "alwaysTranslateHosts";
const SITE_RULES_META_KEY = "alwaysTranslateHostsMeta";
const SITE_RULES_CHUNK_PREFIX = "alwaysTranslateHostsChunk_";
const SITE_RULES_STORAGE_BACKEND_KEY = "alwaysTranslateHostsStorageBackend";
const SITE_RULES_STORAGE_BACKEND_SYNC = "sync";
const SITE_RULES_STORAGE_BACKEND_LOCAL = "local";
const SITE_RULES_CHUNK_MAX_CHARS = 6800;
const DYNAMIC_TRANSLATOR_SCRIPT_ID_PREFIX = "ai-translate::";
const LEGACY_DYNAMIC_TRANSLATOR_SCRIPT_IDS = ["llm-translate-site-script"];
const DYNAMIC_TRANSLATOR_SCRIPT_FILE = "content.js";
const TAB_SYNC_MAX_CONCURRENT = 3;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const SAFE_MAX_OUTPUT_TOKENS = 3072;
const DEFAULT_OUTPUT_TOKENS = 2048;
const MIN_OUTPUT_TOKENS = 512;
const REQUEST_OVERHEAD_TOKENS = 320;
const CONTEXT_SAFETY_TOKENS = 1024;
const SHRINK_RATIO_ON_CONTEXT_ERROR = 0.62;
const MAX_CONTEXT_RETRY = 5;
const TRANSLATION_RECOVERY_MAX_DEPTH = 5;
const REQUEST_TIMEOUT_MS = 12000;
const CIRCUIT_BREAKER_FAILURE_THRESHOLD = 5;
const CIRCUIT_BREAKER_COOLDOWN_MS = 28000;
const CIRCUIT_BREAKER_HALF_OPEN_MAX_IN_FLIGHT = 1;
const GLOBAL_API_MAX_CONCURRENT = 2;
const GLOBAL_API_MIN_INTERVAL_MS = 220;
const TRANSLATION_MEMORY_LIMIT = 1600;
const TRANSLATION_MEMORY_MAX_TEXT_CHARS = 420;
const circuitBreakerState = {
  status: "closed",
  consecutiveFailures: 0,
  openedAt: 0,
  halfOpenInFlight: 0
};
const translationMemoryCache = new Map();
const contextRequestControllers = new Map();
const pausedTabs = new Map();
const hostScriptOperationLocks = new Map();
const globalApiLimiterState = {
  activeCount: 0,
  lastStartedAt: 0,
  timer: null,
  queue: []
};
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
  await cleanupLegacyDynamicScripts();
  const rules = await loadSiteRules();
  await syncDynamicContentScriptRegistration(rules);
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
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || typeof message !== "object") {
      return false;
    }

    if (message.type === "getSiteSetting") {
      handleGetSiteSetting(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setSiteSetting") {
      handleSetSiteSetting(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "getApiKeyMask") {
      handleGetApiKeyMask()
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "setApiKey") {
      handleSetApiKey(message)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "clearApiKey") {
      handleClearApiKey()
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
      handleTranslateBatch(message, _sender)
        .then(sendResponse)
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message.type === "cancelPendingTranslations") {
      const canceled = cancelContextRequests(buildSenderContextKey(_sender));
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
    const matchedHost = await findMatchedHostForUrl(rawUrl);
    if (matchedHost) {
      await ensureHostScriptRegistered(matchedHost);
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
  return {
    ok: true,
    hasKey: Boolean(apiKey),
    keyMask: maskApiKey(apiKey),
    storageScope: await getApiKeyStorageScope()
  };
}

async function handleSetApiKey(message) {
  const apiKey = sanitizeApiKey(message?.apiKey);
  if (!apiKey) {
    return { ok: false, error: "API Key 不能为空" };
  }

  await ensureStorageAccessPolicy();
  await chrome.storage.sync.set({
    [API_KEY_STORAGE_KEY]: apiKey,
    [API_KEY_STORAGE_SCOPE_KEY]: API_KEY_STORAGE_SCOPE_SYNC
  });
  await chrome.storage.local.remove([API_KEY_STORAGE_KEY, API_KEY_STORAGE_SCOPE_KEY]);

  return {
    ok: true,
    hasKey: true,
    keyMask: maskApiKey(apiKey),
    storageScope: API_KEY_STORAGE_SCOPE_SYNC
  };
}

async function handleClearApiKey() {
  await chrome.storage.sync.remove([API_KEY_STORAGE_KEY, API_KEY_STORAGE_SCOPE_KEY]);
  await chrome.storage.local.remove([API_KEY_STORAGE_KEY, API_KEY_STORAGE_SCOPE_KEY]);
  return {
    ok: true,
    hasKey: false,
    keyMask: ""
  };
}

async function handleTranslateBatch(message, sender) {
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

  const missingSourceEntries = missingEntries.map((entry) => entry.sourceEntry);
  let missingTranslations = [];
  try {
    missingTranslations = await requestLongCatTranslation(
      missingSourceEntries,
      languageHint,
      requestOptions
    );
  } catch (error) {
    if (!hasContextEnhancedEntry || !shouldFallbackToLegacyByError(error)) {
      throw error;
    }
    missingTranslations = await requestLongCatTranslation(
      missingSourceEntries.map(stripContextFromEntry),
      languageHint,
      requestOptions
    );
  }

  if (hasContextEnhancedEntry) {
    const emptyIndexes = [];
    for (let index = 0; index < missingTranslations.length; index += 1) {
      const translated = sanitizeTranslatedText(
        missingTranslations[index],
        missingSourceEntries[index]?.text
      );
      if (!translated) {
        emptyIndexes.push(index);
      }
    }

    if (emptyIndexes.length) {
      const fallbackEntries = emptyIndexes.map((index) =>
        stripContextFromEntry(missingSourceEntries[index])
      );
      const fallbackTranslations = await requestLongCatTranslation(
        fallbackEntries,
        languageHint,
        requestOptions
      );
      for (let index = 0; index < emptyIndexes.length; index += 1) {
        const target = emptyIndexes[index];
        missingTranslations[target] = fallbackTranslations[index];
      }
    }
  }

  if (!Array.isArray(missingTranslations) || missingTranslations.length !== missingEntries.length) {
    throw new Error("翻译返回数量与待补文本数量不一致");
  }

  for (let index = 0; index < missingEntries.length; index += 1) {
    const entry = missingEntries[index];
    const translated = sanitizeTranslatedText(
      missingTranslations[index],
      entry.sourceEntry.text
    );
    if (entry.cacheKey && translated) {
      rememberTranslationMemory(entry.cacheKey, entry.sourceEntry.text, translated);
    }
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
      cacheKey
    });
  }

  return {
    translations,
    missingEntries: Array.from(missingByCanonical.values())
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

  if (!isContextEnhancedEntry(entry)) {
    return `${languageKey}::${normalizedText}`;
  }

  const normalizedPrev = normalizeBatchText(entry.prev).slice(-80);
  const normalizedNext = normalizeBatchText(entry.next).slice(0, 80);
  return `${languageKey}::${normalizedText}||${normalizedPrev}||${normalizedNext}`;
}

function buildDedupeKey(entry, languageKey) {
  const base = buildTranslationMemoryKey(entry, languageKey);
  if (base) {
    return base;
  }
  const normalizedText = normalizeBatchText(entry?.text || "");
  return `${languageKey}::${normalizedText}`;
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
  const syncData = await chrome.storage.sync.get([API_KEY_STORAGE_KEY]);
  if (sanitizeApiKey(syncData[API_KEY_STORAGE_KEY])) {
    return API_KEY_STORAGE_SCOPE_SYNC;
  }

  const localStorage = getStorageAreaByName(API_KEY_STORAGE_SCOPE_LOCAL);
  const localData = await localStorage.get([API_KEY_STORAGE_KEY]);
  if (sanitizeApiKey(localData[API_KEY_STORAGE_KEY])) {
    return API_KEY_STORAGE_SCOPE_LOCAL;
  }

  return "";
}

async function getApiKey() {
  const syncData = await chrome.storage.sync.get([API_KEY_STORAGE_KEY]);
  const syncKey = sanitizeApiKey(syncData[API_KEY_STORAGE_KEY]);
  if (syncKey) {
    return syncKey;
  }

  const localStorage = getStorageAreaByName(API_KEY_STORAGE_SCOPE_LOCAL);
  const localData = await localStorage.get([API_KEY_STORAGE_KEY]);
  return sanitizeApiKey(localData[API_KEY_STORAGE_KEY]);
}

async function getApiKeyOrThrow() {
  const key = await getApiKey();
  if (!key) {
    throw new Error("未配置 API Key，请先在扩展设置页填写。");
  }
  return key;
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
  if (areaName === SITE_RULES_STORAGE_BACKEND_LOCAL || areaName === API_KEY_STORAGE_SCOPE_LOCAL) {
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
  if (!chrome.scripting?.getRegisteredContentScripts) {
    return;
  }

  const enabledHosts = Object.keys(normalizeRulesObject(rules));
  const targetHostSet = new Set(enabledHosts);
  const registeredScripts = await chrome.scripting.getRegisteredContentScripts();
  const managedHosts = dedupeStrings(
    (registeredScripts || [])
      .map((script) => parseHostFromScriptId(script?.id))
      .filter(Boolean)
  );

  const staleHosts = managedHosts.filter((host) => !targetHostSet.has(host));
  for (const staleHost of staleHosts) {
    await unregisterHostScript(staleHost);
  }

  for (const enabledHost of enabledHosts) {
    await ensureHostScriptRegistered(enabledHost);
  }
}

function dedupeStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
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

  const tabInfo = await getTabSafe(numericTabId);
  const parsed = safeParseUrl(rawUrl || tabInfo?.url || "");
  if (!parsed || !/^https?:$/.test(parsed.protocol)) {
    return { ok: false, error: "当前页面不支持注入翻译脚本" };
  }

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname) {
    return { ok: false, error: "无法识别当前页面域名" };
  }

  const rules = await loadSiteRules();
  const matchedHost = findMatchedRule(hostname, rules);
  if (!matchedHost) {
    return { ok: false, error: "当前网站未开启自动翻译" };
  }

  await ensureHostScriptRegistered(matchedHost);

  return ensureContentScriptForTabOneShot(numericTabId, parsed.href);
}

async function ensureContentScriptForTabOneShot(tabId, rawUrl = "") {
  const numericTabId = Number(tabId);
  if (!Number.isInteger(numericTabId) || numericTabId < 0) {
    return { ok: false, error: "无效的标签页 ID" };
  }

  if (await pingContentScript(numericTabId)) {
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

  const hostname = normalizeHostname(parsed.hostname);
  if (!hostname) {
    return;
  }

  const matchedHost = await findMatchedHostForUrl(parsed.href);
  if (!matchedHost) {
    return;
  }

  await ensureHostScriptRegistered(matchedHost);
  const ensureResult = await ensureContentScriptForTab(numericTabId, parsed.href);
  if (!ensureResult?.ok) {
    return;
  }

  await sendTabMessageSafe(numericTabId, {
    type: "siteSettingChanged",
    enabled: true
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

async function syncSiteSettingToHostTabs(hostname, enabled) {
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
            enabled: true
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
          enabled: false
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
  const apiKey = await getApiKeyOrThrow();

  let maxTokens = estimateBestEffortMaxTokens(systemPrompt, userPrompt);
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_CONTEXT_RETRY; attempt += 1) {
    const payload = {
      model: MODEL_NAME,
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
      temperature: 0.1,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await runWithGlobalApiLimiter(() =>
        fetchWithRetry(
          API_ENDPOINT,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
          },
          3,
          requestOptions
        )
      );

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
    } catch (error) {
      lastError = error;
      if (!shouldShrinkMaxTokens(error) || maxTokens <= MIN_OUTPUT_TOKENS) {
        throw error;
      }

      maxTokens = Math.max(
        MIN_OUTPUT_TOKENS,
        Math.floor(maxTokens * SHRINK_RATIO_ON_CONTEXT_ERROR)
      );
    }
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
  return [
    `你是一个${languageProfile.role}。`,
    `当前源语言优先按「${languageProfile.name}」处理。`,
    "任务：将用户提供的文本准确翻译为简体中文（zh-Hans）。",
    "目标语言强制要求：只允许输出简体中文，严禁输出繁体中文或繁简混用。",
    "若输入文本本身是中文，也必须统一转换为简体中文后再输出。",
    `翻译要点：${languageProfile.guidance}`,
    "硬性要求：",
    "1) 只输出 JSON 数组，不要输出解释、标题、Markdown 代码块。",
    "2) 输出数组长度必须与输入数组完全一致，并严格一一对应。",
    "3) 保留原文中的专有名词、缩写、数字、单位和链接格式。",
    "4) 保持原有语气，不要扩写或删减事实信息。",
    "5) 严禁出现繁体字（例如「請、為、與、網、點擊」这类字符）。"
  ].join("\n");
}

function buildUserPrompt(entries, languageProfile) {
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
    `请将下面 JSON 数组中的每个字符串从${languageProfile.name}翻译为简体中文（zh-Hans）。`,
    "若个别条目语言与主语言不同，也需自动识别后翻译为简体中文。",
    "要求：",
    "1) 输出必须是 JSON 数组。",
    "2) 输出数组元素必须是对象，格式为 {\"id\":数字, \"translation\":\"译文\"}。",
    "3) 每个 id 必须与输入一一对应，不可遗漏、不可重复。",
    "4) prev/next 仅作为语境参考，translation 只翻译 text 字段本身，不要把 prev/next 拼进译文。",
    "5) 不要输出解释、前后缀、Markdown 代码块。",
    "6) 保留原本语气和标点符号。",
    "7) 每条译文必须是简体中文，禁止繁体字与繁简混排。",
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

  const leftTranslations = await requestLongCatTranslationResilient(
    leftTexts,
    languageHint,
    depth + 1,
    options
  );
  const rightTranslations = await requestLongCatTranslationResilient(
    rightTexts,
    languageHint,
    depth + 1,
    options
  );

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
  const translations = [];

  for (const entry of texts) {
    const normalizedEntry = normalizeTranslationEntry(entry);
    const sourceText = String(normalizedEntry?.text ?? "");
    try {
      const single = await requestLongCatTranslationCore(
        [normalizedEntry || { text: sourceText, prev: "", next: "" }],
        languageHint,
        options
      );
      translations.push(single[0] || sourceText);
    } catch (_error) {
      translations.push(sourceText);
    }
  }

  return translations;
}

function isRecoverableTranslationError(error) {
  const message = String(error?.message || "");
  return (
    message.includes("返回内容为空") ||
    message.includes("无法解析") ||
    message.includes("数量不匹配") ||
    message.includes("JSON")
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

function isLikelyEnglishPhrase(text) {
  const words = String(text || "").match(/[A-Za-z]+/g) || [];
  if (!words.length) {
    return false;
  }
  const latinChars = words.join("").length;
  return words.length >= 2 || latinChars >= 10;
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

  const sourceHasLatin = hasLatinLetters(normalizedSource);
  if (sourceHasLatin && normalizedSource === normalizedTranslated) {
    return false;
  }

  if (
    sourceHasLatin &&
    isLikelyEnglishPhrase(normalizedSource) &&
    !containsChineseChar(normalizedTranslated)
  ) {
    return false;
  }

  return true;
}

function estimateBestEffortMaxTokens(systemPrompt, userPrompt) {
  const estimatedPromptTokens =
    estimateTokenCount(systemPrompt) +
    estimateTokenCount(userPrompt) +
    REQUEST_OVERHEAD_TOKENS;

  const promptPenalty = Math.max(
    0,
    Math.floor((estimatedPromptTokens + CONTEXT_SAFETY_TOKENS - 2200) * 0.1)
  );
  const dynamicTarget = DEFAULT_OUTPUT_TOKENS - promptPenalty;
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

function runWithGlobalApiLimiter(task) {
  return new Promise((resolve, reject) => {
    globalApiLimiterState.queue.push({
      task,
      resolve,
      reject
    });
    pumpGlobalApiQueue();
  });
}

function pumpGlobalApiQueue() {
  if (globalApiLimiterState.activeCount >= GLOBAL_API_MAX_CONCURRENT) {
    return;
  }

  if (!globalApiLimiterState.queue.length) {
    return;
  }

  const nowMs = Date.now();
  const elapsedSinceLast = nowMs - globalApiLimiterState.lastStartedAt;
  const waitMs = Math.max(0, GLOBAL_API_MIN_INTERVAL_MS - elapsedSinceLast);
  if (waitMs > 0) {
    if (globalApiLimiterState.timer) {
      return;
    }

    globalApiLimiterState.timer = setTimeout(() => {
      globalApiLimiterState.timer = null;
      pumpGlobalApiQueue();
    }, waitMs);
    return;
  }

  const queued = globalApiLimiterState.queue.shift();
  if (!queued) {
    return;
  }

  globalApiLimiterState.activeCount += 1;
  globalApiLimiterState.lastStartedAt = Date.now();
  Promise.resolve()
    .then(() => queued.task())
    .then(queued.resolve)
    .catch(queued.reject)
    .finally(() => {
      globalApiLimiterState.activeCount = Math.max(0, globalApiLimiterState.activeCount - 1);
      pumpGlobalApiQueue();
    });

  if (globalApiLimiterState.activeCount < GLOBAL_API_MAX_CONCURRENT) {
    pumpGlobalApiQueue();
  }
}

async function fetchWithRetry(url, options, maxAttempts = 3, runtimeOptions = {}) {
  const circuitContext = beginCircuitRequest();
  const contextKey = runtimeOptions?.contextKey || "";
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let timeoutId = null;
    let controller = null;
    try {
      controller = new AbortController();
      registerContextController(contextKey, controller);
      timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
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
      if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts) {
        await sleep(backoffDelay(attempt));
        continue;
      }

      throw new Error(`LongCat 接口错误 (${response.status}): ${bodyText}`);
    } catch (error) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const normalizedError = normalizeFetchError(error, controller);
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
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  markCircuitRequestFailure(circuitContext);
  throw lastError || new Error("LongCat 请求失败");
}

function beginCircuitRequest() {
  const nowMs = Date.now();
  if (circuitBreakerState.status === "open") {
    const cooldownLeft = CIRCUIT_BREAKER_COOLDOWN_MS - (nowMs - circuitBreakerState.openedAt);
    if (cooldownLeft > 0) {
      throw new Error(`翻译服务冷却中，请${Math.ceil(cooldownLeft / 1000)}秒后重试`);
    }
    circuitBreakerState.status = "half-open";
    circuitBreakerState.halfOpenInFlight = 0;
  }

  if (
    circuitBreakerState.status === "half-open" &&
    circuitBreakerState.halfOpenInFlight >= CIRCUIT_BREAKER_HALF_OPEN_MAX_IN_FLIGHT
  ) {
    throw new Error("翻译服务正在恢复，请稍后再试");
  }

  if (circuitBreakerState.status === "half-open") {
    circuitBreakerState.halfOpenInFlight += 1;
  }

  return {
    startedInHalfOpen: circuitBreakerState.status === "half-open"
  };
}

function markCircuitRequestSuccess(context) {
  if (context?.startedInHalfOpen) {
    circuitBreakerState.halfOpenInFlight = Math.max(0, circuitBreakerState.halfOpenInFlight - 1);
  }
  circuitBreakerState.status = "closed";
  circuitBreakerState.consecutiveFailures = 0;
  circuitBreakerState.openedAt = 0;
}

function markCircuitRequestFailure(context) {
  if (context?.startedInHalfOpen) {
    circuitBreakerState.halfOpenInFlight = Math.max(0, circuitBreakerState.halfOpenInFlight - 1);
  }
  circuitBreakerState.consecutiveFailures += 1;

  if (
    context?.startedInHalfOpen ||
    circuitBreakerState.consecutiveFailures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD
  ) {
    circuitBreakerState.status = "open";
    circuitBreakerState.openedAt = Date.now();
    circuitBreakerState.halfOpenInFlight = 0;
  }
}

function releaseCircuitRequest(context) {
  if (context?.startedInHalfOpen) {
    circuitBreakerState.halfOpenInFlight = Math.max(0, circuitBreakerState.halfOpenInFlight - 1);
  }
}

function normalizeFetchError(error, controller) {
  if (controller?.__longcatCanceled) {
    return new Error("翻译请求已取消");
  }
  if (error && typeof error === "object" && error.name === "AbortError") {
    return new Error(`LongCat 请求超时（>${REQUEST_TIMEOUT_MS}ms）`);
  }
  return error instanceof Error ? error : new Error(String(error || "LongCat 请求失败"));
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
```

## content.js
```
const VIEWPORT_MARGIN = 0;
const MAX_BATCH_ITEMS = 18;
const MAX_BATCH_CHARS = 2200;
const MAX_PENDING_NODES = 500;
const MAX_PENDING_OVERLAY_BOOST = 160;
const MAX_RESTORE_NODE_TRACK = 1800;
const RESTORE_STALE_SWEEP_INTERVAL = 24;
const QUEUE_COALESCE_MS = 140;
const REQUEST_CANCEL_DEBOUNCE_MS = 120;
const SHORT_CONTEXT_MAX_CHARS = 20;
const CONTEXT_SNIPPET_MAX_CHARS = 64;
const MAX_SELECTION_ENQUEUE_NODES = 12;
const MAX_SELECTION_PREEMPT_PER_BATCH = 8;
const SCAN_DEBOUNCE_MS = 240;
const SCAN_THROTTLE_MIN_MS = 200;
const SCAN_THROTTLE_MAX_MS = 400;
const SCROLL_IDLE_MS = 320;
const HOVER_SCAN_DELAY_MS = 140;
const SELECTION_SCAN_DELAY_MS = 120;
const SELECTION_PRIORITY_WINDOW_MS = 9000;
const ADAPTIVE_BATCH_MIN_ITEMS = Math.max(8, Math.floor(MAX_BATCH_ITEMS * 0.5));
const ADAPTIVE_BATCH_MAX_ITEMS = MAX_BATCH_ITEMS + 16;
const ADAPTIVE_BATCH_MIN_CHARS = Math.max(1200, Math.floor(MAX_BATCH_CHARS * 0.7));
const ADAPTIVE_BATCH_MAX_CHARS = MAX_BATCH_CHARS + 3000;
const ADAPTIVE_BATCH_INITIAL_ITEMS = MAX_BATCH_ITEMS + 4;
const ADAPTIVE_BATCH_INITIAL_CHARS = MAX_BATCH_CHARS + 1200;
const PRIORITY_BATCH_MAX_ITEMS = Math.min(10, MAX_BATCH_ITEMS);
const PRIORITY_BATCH_MAX_CHARS = Math.max(2000, Math.floor(MAX_BATCH_CHARS * 1.05));
const FAST_RESPONSE_THRESHOLD_MS = 1300;
const SLOW_RESPONSE_THRESHOLD_MS = 3400;
const MAIN_CONTENT_HINT_SELECTORS = [
  "main",
  "article",
  "[role='main']",
  "#main",
  "#main-content",
  "#content",
  "#bodyContent",
  "#mw-content-text",
  ".mw-parser-output",
  ".article-content",
  ".post-content",
  ".entry-content",
  ".markdown-body",
  ".docs-content",
  ".content"
].join(", ");
const LOW_PRIORITY_HINT_SELECTORS = [
  "nav",
  "aside",
  "footer",
  "[role='navigation']",
  ".sidebar",
  ".nav",
  ".navbar",
  ".menu",
  ".breadcrumb",
  ".toc",
  ".infobox",
  ".related",
  ".recommend",
  "#toc",
  "#mw-panel",
  "#mw-navigation"
].join(", ");
const OVERLAY_CONTENT_SELECTORS = [
  "[role='tooltip']",
  "[role='dialog']",
  "[role='alertdialog']",
  "[role='alert']",
  "[role='status']",
  "[role='menu']",
  "[role='listbox']",
  "[aria-live='polite']",
  "[aria-live='assertive']",
  "[aria-modal='true']",
  "dialog[open]",
  "[popover]",
  ".tooltip",
  ".toast",
  ".snackbar",
  ".popover",
  ".popup",
  ".dialog",
  ".modal",
  ".notification",
  ".mwe-popups",
  ".mwe-popups-container"
].join(", ");
const HOVER_TRIGGER_SELECTORS = [
  "a",
  "[title]",
  "[data-tooltip]",
  "[data-popover]",
  "[aria-describedby]",
  "[aria-haspopup='dialog']",
  "[aria-haspopup='true']"
].join(", ");
const SESSION_CACHE_KEY = "__longcat_translate_cache_v1";
const SESSION_CACHE_LIMIT = 300;
const CACHE_SAVE_DEBOUNCE_MS = 400;
const OVERLAY_HINT_PATTERN =
  /(tooltip|toast|snackbar|popover|popup|dialog|modal|notification|tippy|mwe-popups|hint|hovercard|float|dropdown|menu|drawer|flyout|lightbox|sheet|overlay)/i;
const CONTEXT_SUSPECT_SELECTORS = [
  "nav",
  "header",
  "aside",
  "[role='navigation']",
  "ul",
  "li",
  "a",
  "button",
  "[role='menu']",
  "[role='menuitem']",
  "[role='tab']"
].join(", ");
const BLOCK_CANDIDATE_SELECTORS = [
  "main",
  "article",
  "section",
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "figcaption",
  "td",
  "th",
  "summary",
  "div"
].join(", ");
const BLOCK_CANDIDATE_SELECTORS_LIGHT = [
  "main",
  "article",
  "section",
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "figcaption",
  "td",
  "th",
  "summary"
].join(", ");
const BLOCK_OBSERVER_ROOT_MARGIN = "220px 0px 260px 0px";
const MAX_OBSERVED_BLOCKS = 2800;
const BLOCK_OBSERVE_BATCH_LIMIT = 420;
const BLOCK_CANDIDATE_REGISTER_CHUNK = 140;
const MAX_PENDING_BLOCK_CANDIDATES = MAX_OBSERVED_BLOCKS * 2;
const LARGE_ROOT_CHILD_THRESHOLD = 220;
const BLOCK_SAMPLE_TEXT_CHARS = 280;
const BLOCK_MIN_TEXT_CHARS = 14;
const BODY_BLOCK_OBSERVE_INTERVAL_MS = 900;
const INVALID_TRANSLATION_RETRY_MIN_MS = 1200;
const INVALID_TRANSLATION_RETRY_MAX_MS = 20000;
const INVALID_TRANSLATION_RETRY_FACTOR = 1.9;
const INVALID_TRANSLATION_MAX_REJECTS = 4;
const FAILED_PHRASE_CACHE_LIMIT = 420;
const FAILED_PHRASE_CACHE_TTL_MS = 12 * 60 * 1000;
const FAILED_PHRASE_STALE_SWEEP_INTERVAL = 24;
const FAILED_CONTEXT_ANCESTOR_DEPTH = 3;
const FAILED_CONTEXT_CLASS_TOKENS = 2;
const BALANCED_SPEED_PROFILE = Object.freeze({
  id: "balanced",
  label: "均衡",
  maxConcurrentRequests: 2,
  scanDebounceMs: SCAN_DEBOUNCE_MS,
  scrollIdleMs: SCROLL_IDLE_MS,
  hoverScanDelayMs: HOVER_SCAN_DELAY_MS,
  selectionScanDelayMs: SELECTION_SCAN_DELAY_MS,
  adaptiveItemOffset: 0,
  adaptiveCharOffset: 0,
  selectionPreemptPerBatch: MAX_SELECTION_PREEMPT_PER_BATCH
});

let siteEnabled = false;
let tabPaused = false;
let mutationObserver = null;
let listenersBound = false;
let isApplyingTranslation = false;
let persistCacheTimer = null;
let scrollIdleTimer = null;
let hoverScanTimer = null;
let selectionScanTimer = null;
let queuePumpTimer = null;
let cancelRequestTimer = null;
let retryScanTimer = null;
let retryScanAt = 0;
let isScrolling = false;
let runtimeContextInvalidated = false;
let queueSerial = 0;
let pageLanguageHint = "";
let adaptiveBatchItemLimit = ADAPTIVE_BATCH_INITIAL_ITEMS;
let adaptiveBatchCharLimit = ADAPTIVE_BATCH_INITIAL_CHARS;
let currentSpeedProfile = BALANCED_SPEED_PROFILE;
let activeWorkerCount = 0;
let restoreTrimSerial = 0;
let scanRafId = null;
let scanThrottleTimer = null;
let scanForceImmediate = false;
let lastScanAt = 0;
let viewportBlockObserver = null;
let blockObserveTimer = null;
let blockCandidateFlushRafId = null;
let observedBlockCount = 0;
let observedBlockEpoch = 1;
let lastBodyObserveQueuedAt = 0;
let routeBound = false;
let routeLastHref = "";
let originalPushState = null;
let originalReplaceState = null;
let characterDataObserver = null;
let characterObserverRefreshTimer = null;

const pendingNodes = new Set();
let translatedNodeMarks = new WeakSet();
const restorableNodes = new Map();
const nodeStates = new WeakMap();
const translationCache = new Map();
const failedTranslationCache = new Map();
const dirtyRoots = new Set();
const visibleBlockRoots = new Set();
const observedBlockNodes = new WeakMap();
const observedBlockLru = new Map();
const pendingBlockObserveRoots = new Set();
const pendingBlockCandidates = [];
const rootLanguageCache = new WeakMap();
let fullRescanNeeded = true;
let measureEpoch = 1;
let failedPhraseSweepSerial = 0;
const elementMeasureCache = new WeakMap();
const elementVisualCache = new WeakMap();
const elementFailedContextCache = new WeakMap();

bootstrap().catch((error) => {
  console.warn("[LongCat Translate] 初始化失败", error);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  if (message.type === "pingTranslator") {
    sendResponse({
      ok: true,
      siteEnabled,
      paused: tabPaused
    });
    return false;
  }

  if (message.type === "siteSettingChanged") {
    if (message.enabled) {
      enableTranslation();
    } else {
      disableTranslation();
    }
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "triggerTranslateNow") {
    if (!siteEnabled) {
      sendResponse({ ok: false, error: "当前站点未开启自动翻译" });
      return false;
    }
    if (tabPaused) {
      sendResponse({ ok: false, error: "当前页面处于暂停状态，请先继续翻译" });
      return false;
    }

    scheduleScan(true);
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "oneShotTranslateNow") {
    enableTranslation();
    tabPaused = false;
    scheduleScan(true);
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "tabPauseChanged") {
    const paused = Boolean(message.paused);
    if (paused) {
      pauseTranslationForTab();
    } else {
      resumeTranslationForTab();
    }
    sendResponse({
      ok: true,
      paused: tabPaused
    });
    return false;
  }

  if (message.type === "pauseTranslationForTab") {
    if (!siteEnabled) {
      sendResponse({ ok: false, error: "当前站点未开启自动翻译" });
      return false;
    }
    pauseTranslationForTab();
    sendResponse({ ok: true, paused: true });
    return false;
  }

  if (message.type === "resumeTranslationForTab") {
    if (!siteEnabled) {
      sendResponse({ ok: false, error: "当前站点未开启自动翻译" });
      return false;
    }
    resumeTranslationForTab();
    sendResponse({ ok: true, paused: false });
    return false;
  }

  if (message.type === "restoreOriginalPage") {
    const restored = restoreOriginalPage();
    sendResponse({
      ok: true,
      restored
    });
    return false;
  }

  if (message.type === "getRuntimeState") {
    sendResponse({
      ok: true,
      siteEnabled,
      paused: tabPaused,
      restorableCount: restorableNodes.size,
      pendingCount: pendingNodes.size
    });
    return false;
  }

  return false;
});

async function bootstrap() {
  pageLanguageHint = detectPageLanguageHint();
  loadSessionCache();
  applyBalancedSpeedProfile();
  if (!document?.body || typeof document.body.children === "undefined") {
    return;
  }
  enableTranslation();
}

function enableTranslation() {
  tabPaused = false;
  if (siteEnabled) {
    fullRescanNeeded = true;
    scheduleScan(true);
    return;
  }

  runtimeContextInvalidated = false;
  siteEnabled = true;
  fullRescanNeeded = true;
  bindListeners();
  bindRouteListeners();
  initViewportBlockObserver();
  queueObserveBlockCandidates(document.body || document.documentElement);
  scheduleScan(true);
}

function disableTranslation() {
  if (!siteEnabled) {
    return;
  }

  siteEnabled = false;
  tabPaused = false;
  requestCancelPendingTranslations(true);
  if (scanRafId != null) {
    cancelAnimationFrame(scanRafId);
    scanRafId = null;
  }
  clearTimeout(scanThrottleTimer);
  scanThrottleTimer = null;
  scanForceImmediate = false;
  lastScanAt = 0;
  clearTimeout(persistCacheTimer);
  persistCacheTimer = null;
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = null;
  clearTimeout(hoverScanTimer);
  hoverScanTimer = null;
  clearTimeout(selectionScanTimer);
  selectionScanTimer = null;
  clearTimeout(queuePumpTimer);
  queuePumpTimer = null;
  clearTimeout(cancelRequestTimer);
  cancelRequestTimer = null;
  clearTimeout(retryScanTimer);
  retryScanTimer = null;
  retryScanAt = 0;
  clearTimeout(blockObserveTimer);
  blockObserveTimer = null;
  clearTimeout(characterObserverRefreshTimer);
  characterObserverRefreshTimer = null;
  if (blockCandidateFlushRafId != null) {
    cancelFrame(blockCandidateFlushRafId);
    blockCandidateFlushRafId = null;
  }
  pendingBlockObserveRoots.clear();
  pendingBlockCandidates.length = 0;
  visibleBlockRoots.clear();
  observedBlockLru.clear();
  observedBlockCount = 0;
  observedBlockEpoch += 1;
  lastBodyObserveQueuedAt = 0;
  if (viewportBlockObserver) {
    viewportBlockObserver.disconnect();
    viewportBlockObserver = null;
  }
  if (characterDataObserver) {
    characterDataObserver.disconnect();
    characterDataObserver = null;
  }
  isScrolling = false;
  queueSerial = 0;
  resetAdaptiveBatchLimits();
  activeWorkerCount = 0;
  dirtyRoots.clear();
  fullRescanNeeded = true;
  pendingNodes.clear();
  failedTranslationCache.clear();
  failedPhraseSweepSerial = 0;
  restoreOriginalTexts();

  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  if (listenersBound) {
    window.removeEventListener("scroll", onScrollActivity);
    window.removeEventListener("resize", onResizeViewport);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    document.removeEventListener("mouseover", onHoverCandidate, true);
    document.removeEventListener("mouseup", onMouseSelectionEnd, true);
    listenersBound = false;
  }

  unbindRouteListeners();
}

function pauseTranslationForTab() {
  if (!siteEnabled || tabPaused) {
    return;
  }

  tabPaused = true;
  requestCancelPendingTranslations(true);
  clearPendingNodeQueue();
  clearTimeout(queuePumpTimer);
  queuePumpTimer = null;
}

function resumeTranslationForTab() {
  if (!siteEnabled || !tabPaused) {
    return;
  }

  tabPaused = false;
  fullRescanNeeded = true;
  scheduleScan(true);
}

function restoreOriginalPage() {
  requestCancelPendingTranslations(true);
  clearPendingNodeQueue();
  dirtyRoots.clear();
  visibleBlockRoots.clear();
  pendingBlockObserveRoots.clear();
  pendingBlockCandidates.length = 0;
  fullRescanNeeded = true;
  queueSerial = 0;
  failedTranslationCache.clear();
  return restoreOriginalTexts();
}

function clearPendingNodeQueue() {
  for (const node of pendingNodes) {
    if (!node || !node.isConnected) {
      continue;
    }
    const state = nodeStates.get(node);
    if (!state) {
      continue;
    }
    nodeStates.set(node, {
      ...state,
      pending: false
    });
  }
  pendingNodes.clear();
}

function bindListeners() {
  if (listenersBound) {
    return;
  }

  listenersBound = true;
  window.addEventListener("scroll", onScrollActivity, { passive: true });
  window.addEventListener("resize", onResizeViewport, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("mouseover", onHoverCandidate, {
    passive: true,
    capture: true
  });
  document.addEventListener("mouseup", onMouseSelectionEnd, {
    passive: true,
    capture: true
  });

  mutationObserver = new MutationObserver((mutations) => {
    if (!siteEnabled || isApplyingTranslation) {
      return;
    }

    let shouldRescan = false;
    let shouldImmediateScan = false;
    let rootCountHint = 0;

    for (const mutation of mutations) {
      if (mutation.type === "characterData" && mutation.target?.nodeType === Node.TEXT_NODE) {
        const textNode = mutation.target;
        const state = nodeStates.get(textNode);
        if (
          state &&
          (state.translated || translatedNodeMarks.has(textNode)) &&
          textNode.nodeValue !== state.translatedText
        ) {
          removeTranslationTracking(textNode);
          nodeStates.delete(textNode);
        }
      }

      if (mutation.type === "attributes" && !shouldHandleAttributeMutation(mutation)) {
        continue;
      }

      if (mutation.type === "childList" || mutation.type === "characterData" || mutation.type === "attributes") {
        shouldRescan = true;
        if (mutation.type === "childList") {
          rootCountHint += mutation.addedNodes?.length || 0;
          const addedNodes = Array.from(mutation.addedNodes || []);
          for (const added of addedNodes) {
            queueObserveBlockCandidates(getElementFromNode(added));
          }
        }
        markDirtyFromMutation(mutation);
      }

      if (isOverlayRelatedMutation(mutation)) {
        shouldImmediateScan = true;
      }
    }

    if (rootCountHint > 60) {
      fullRescanNeeded = true;
    }

    if (shouldImmediateScan) {
      scheduleScan(true);
      return;
    }

    if (shouldRescan) {
      scheduleScan();
    }
  });

  const root = document.body || document.documentElement;
  if (root) {
    mutationObserver.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "hidden",
        "aria-hidden",
        "aria-expanded",
        "open",
        "data-state"
      ]
    });
  }

  characterDataObserver = new MutationObserver(handleCharacterDataMutations);
  scheduleCharacterObserverRefresh(true);
}

function handleCharacterDataMutations(mutations) {
  if (!siteEnabled || isApplyingTranslation) {
    return;
  }

  let shouldRescan = false;
  for (const mutation of mutations || []) {
    if (!mutation || mutation.type !== "characterData") {
      continue;
    }

    const textNode = mutation.target;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      continue;
    }

    const parent = textNode.parentElement;
    if (!parent) {
      continue;
    }

    const state = nodeStates.get(textNode);
    if (
      state &&
      (state.translated || translatedNodeMarks.has(textNode)) &&
      textNode.nodeValue !== state.translatedText
    ) {
      removeTranslationTracking(textNode);
      nodeStates.delete(textNode);
    } else if (
      state &&
      state.translated &&
      typeof state.translatedText === "string" &&
      textNode.nodeValue === state.translatedText
    ) {
      continue;
    }

    const nearViewport = isLikelyOverlayElement(parent)
      ? isElementNearViewport(parent, { ignoreVisualState: true })
      : isElementNearViewport(parent);
    if (!nearViewport) {
      continue;
    }

    markDirtyRoot(parent);
    shouldRescan = true;
  }

  if (shouldRescan) {
    scheduleScan();
  }
}

function scheduleCharacterObserverRefresh(immediate = false) {
  if (!siteEnabled) {
    return;
  }

  if (immediate) {
    clearTimeout(characterObserverRefreshTimer);
    characterObserverRefreshTimer = null;
    refreshCharacterObserverTargets();
    return;
  }

  if (characterObserverRefreshTimer) {
    return;
  }

  characterObserverRefreshTimer = setTimeout(() => {
    characterObserverRefreshTimer = null;
    refreshCharacterObserverTargets();
  }, 120);
}

function refreshCharacterObserverTargets() {
  if (!siteEnabled || !characterDataObserver) {
    return;
  }

  startMeasureEpoch();
  const roots = collectCharacterObserverRoots();
  characterDataObserver.disconnect();
  if (!roots.length) {
    return;
  }

  for (const root of roots) {
    characterDataObserver.observe(root, {
      characterData: true,
      subtree: true
    });
  }
}

function collectCharacterObserverRoots() {
  const body = document.body;
  if (!body) {
    return [];
  }

  const roots = [];
  for (const root of visibleBlockRoots) {
    if (isValidScanRoot(root) && shouldScanDirtyRoot(root)) {
      roots.push(root);
    }
  }

  for (const root of dirtyRoots) {
    if (isValidScanRoot(root) && shouldScanDirtyRoot(root)) {
      roots.push(root);
    }
  }

  if (roots.length < 12) {
    const overlayRoots = document.querySelectorAll(OVERLAY_CONTENT_SELECTORS);
    for (const root of overlayRoots) {
      if (isValidScanRoot(root) && shouldScanDirtyRoot(root)) {
        roots.push(root);
      }
    }
  }

  if (!roots.length) {
    roots.push(body);
  }

  return sortRoots(deduplicateRoots(roots)).slice(0, 40);
}

function applyBalancedSpeedProfile() {
  currentSpeedProfile = BALANCED_SPEED_PROFILE;
  resetAdaptiveBatchLimits();
}

function resetAdaptiveBatchLimits() {
  adaptiveBatchItemLimit = clampNumber(
    ADAPTIVE_BATCH_INITIAL_ITEMS + (currentSpeedProfile.adaptiveItemOffset || 0),
    ADAPTIVE_BATCH_MIN_ITEMS,
    ADAPTIVE_BATCH_MAX_ITEMS
  );
  adaptiveBatchCharLimit = clampNumber(
    ADAPTIVE_BATCH_INITIAL_CHARS + (currentSpeedProfile.adaptiveCharOffset || 0),
    ADAPTIVE_BATCH_MIN_CHARS,
    ADAPTIVE_BATCH_MAX_CHARS
  );
}

function initViewportBlockObserver() {
  if (viewportBlockObserver || !siteEnabled) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      let changed = false;
      for (const entry of entries) {
        const target = entry.target;
        if (!(target instanceof Element)) {
          continue;
        }
        touchObservedBlock(target);

        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          if (!visibleBlockRoots.has(target)) {
            visibleBlockRoots.add(target);
            changed = true;
          }
        } else if (visibleBlockRoots.delete(target)) {
          changed = true;
        }
      }

      if (changed) {
        scheduleCharacterObserverRefresh();
        scheduleScan();
      }
    },
    {
      root: null,
      rootMargin: BLOCK_OBSERVER_ROOT_MARGIN,
      threshold: 0
    }
  );

  viewportBlockObserver = observer;
}

function queueObserveBlockCandidates(root) {
  if (!siteEnabled || !viewportBlockObserver || !root) {
    return;
  }

  const element = root instanceof Element ? root : getElementFromNode(root);
  if (!element) {
    return;
  }

  if (element === document.body || element === document.documentElement) {
    const nowMs = Date.now();
    if (nowMs - lastBodyObserveQueuedAt < BODY_BLOCK_OBSERVE_INTERVAL_MS) {
      return;
    }
    lastBodyObserveQueuedAt = nowMs;
  }

  pendingBlockObserveRoots.add(element);
  if (blockObserveTimer) {
    return;
  }

  blockObserveTimer = setTimeout(() => {
    blockObserveTimer = null;
    flushObserveBlockCandidates();
  }, 60);
}

function flushObserveBlockCandidates() {
  if (!viewportBlockObserver || !pendingBlockObserveRoots.size) {
    return;
  }

  const roots = Array.from(pendingBlockObserveRoots);
  pendingBlockObserveRoots.clear();
  for (const root of roots) {
    registerBlockCandidatesInRoot(root);
  }
}

function registerBlockCandidatesInRoot(root) {
  if (!viewportBlockObserver || !root || !root.isConnected) {
    return;
  }

  const candidates = [];
  const selectors = pickBlockCandidateSelector(root);

  if (root.matches?.(selectors)) {
    candidates.push(root);
  }

  if (root.querySelectorAll) {
    try {
      const descendants = root.querySelectorAll(selectors);
      for (const element of descendants) {
        candidates.push(element);
      }
    } catch (_error) {
      // 忽略选择器查询异常。
    }
  }

  enqueueBlockCandidateRegistration(candidates);
}

function pickBlockCandidateSelector(root) {
  if (!root || !(root instanceof Element)) {
    return BLOCK_CANDIDATE_SELECTORS;
  }

  if (
    root === document.body ||
    root === document.documentElement ||
    root.childElementCount >= LARGE_ROOT_CHILD_THRESHOLD
  ) {
    return BLOCK_CANDIDATE_SELECTORS_LIGHT;
  }

  return BLOCK_CANDIDATE_SELECTORS;
}

function enqueueBlockCandidateRegistration(candidates) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return;
  }

  const cap = Math.min(BLOCK_OBSERVE_BATCH_LIMIT, candidates.length);
  for (let index = 0; index < cap; index += 1) {
    pendingBlockCandidates.push(candidates[index]);
  }

  if (pendingBlockCandidates.length > MAX_PENDING_BLOCK_CANDIDATES) {
    pendingBlockCandidates.splice(
      0,
      pendingBlockCandidates.length - MAX_PENDING_BLOCK_CANDIDATES
    );
  }

  if (blockCandidateFlushRafId != null) {
    return;
  }

  blockCandidateFlushRafId = requestFrame(flushPendingBlockCandidates);
}

function flushPendingBlockCandidates() {
  blockCandidateFlushRafId = null;
  if (!siteEnabled || !viewportBlockObserver || !pendingBlockCandidates.length) {
    return;
  }

  let processed = 0;
  while (processed < BLOCK_CANDIDATE_REGISTER_CHUNK && pendingBlockCandidates.length) {
    const candidate = pendingBlockCandidates.shift();
    processed += 1;
    observeBlockCandidate(candidate);
  }

  if (pendingBlockCandidates.length) {
    blockCandidateFlushRafId = requestFrame(flushPendingBlockCandidates);
  }
}

function observeBlockCandidate(element) {
  if (
    !viewportBlockObserver ||
    !shouldObserveBlockCandidate(element)
  ) {
    return false;
  }

  ensureObservedBlockCapacity(1);
  if (observedBlockCount >= MAX_OBSERVED_BLOCKS) {
    return false;
  }

  observedBlockNodes.set(element, observedBlockEpoch);
  observedBlockCount += 1;
  touchObservedBlock(element);
  viewportBlockObserver.observe(element);

  if (isElementNearViewport(element, { ignoreVisualState: isLikelyOverlayElement(element) })) {
    visibleBlockRoots.add(element);
  }
  return true;
}

function touchObservedBlock(element) {
  if (!element || !(element instanceof Element)) {
    return;
  }
  if (observedBlockLru.has(element)) {
    observedBlockLru.delete(element);
  }
  observedBlockLru.set(element, Date.now());
}

function ensureObservedBlockCapacity(incoming = 1) {
  const needed = Math.max(1, Number(incoming) || 1);
  if (observedBlockCount + needed <= MAX_OBSERVED_BLOCKS) {
    return;
  }

  while (observedBlockCount + needed > MAX_OBSERVED_BLOCKS && observedBlockLru.size) {
    const oldestEntry = observedBlockLru.entries().next().value;
    if (!oldestEntry) {
      break;
    }
    dropObservedBlock(oldestEntry[0]);
  }
}

function dropObservedBlock(element) {
  if (!element) {
    return;
  }

  observedBlockLru.delete(element);
  visibleBlockRoots.delete(element);
  observedBlockNodes.delete(element);
  if (viewportBlockObserver) {
    viewportBlockObserver.unobserve(element);
  }
  observedBlockCount = Math.max(0, observedBlockCount - 1);
}

function shouldObserveBlockCandidate(element) {
  if (!element || !(element instanceof Element) || !element.isConnected) {
    return false;
  }

  if (observedBlockNodes.get(element) === observedBlockEpoch) {
    return false;
  }

  if (!isValidScanRoot(element)) {
    return false;
  }

  if (isLikelyOverlayElement(element)) {
    return true;
  }

  if (isEditableContext(element)) {
    return false;
  }

  const sample = getElementTextSample(element, BLOCK_SAMPLE_TEXT_CHARS);
  if (sample.length < BLOCK_MIN_TEXT_CHARS) {
    return false;
  }

  if (shouldSkipChineseText(sample)) {
    return false;
  }

  if (
    element.tagName === "DIV" &&
    element.childElementCount > 80 &&
    sample.length < BLOCK_SAMPLE_TEXT_CHARS * 0.75
  ) {
    return false;
  }

  return true;
}

function cleanupVisibleBlockRoots() {
  for (const root of visibleBlockRoots) {
    if (!isValidScanRoot(root)) {
      if (observedBlockLru.has(root)) {
        dropObservedBlock(root);
      } else {
        visibleBlockRoots.delete(root);
      }
    }
  }
}

function bindRouteListeners() {
  if (routeBound) {
    return;
  }

  routeBound = true;
  routeLastHref = window.location.href;

  originalPushState = history.pushState;
  originalReplaceState = history.replaceState;

  history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    handleRouteChanged("pushState");
    return result;
  };

  history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    handleRouteChanged("replaceState");
    return result;
  };

  window.addEventListener("popstate", handleRouteChanged, { passive: true });
  window.addEventListener("hashchange", handleRouteChanged, { passive: true });
}

function unbindRouteListeners() {
  if (!routeBound) {
    return;
  }

  routeBound = false;
  window.removeEventListener("popstate", handleRouteChanged);
  window.removeEventListener("hashchange", handleRouteChanged);

  if (originalPushState) {
    history.pushState = originalPushState;
    originalPushState = null;
  }
  if (originalReplaceState) {
    history.replaceState = originalReplaceState;
    originalReplaceState = null;
  }
}

function handleRouteChanged() {
  if (!siteEnabled) {
    return;
  }

  const href = window.location.href;
  if (href === routeLastHref) {
    return;
  }
  routeLastHref = href;
  pageLanguageHint = detectPageLanguageHint();
  resetPageRuntimeState();
  queueObserveBlockCandidates(document.body || document.documentElement);
  scheduleCharacterObserverRefresh(true);
  scheduleScan(true);
}

function resetPageRuntimeState() {
  requestCancelPendingTranslations(true);
  pendingNodes.clear();
  dirtyRoots.clear();
  visibleBlockRoots.clear();
  observedBlockLru.clear();
  pendingBlockObserveRoots.clear();
  pendingBlockCandidates.length = 0;
  queueSerial = 0;
  fullRescanNeeded = true;
  activeWorkerCount = 0;
  restoreTrimSerial = 0;
  observedBlockCount = 0;
  observedBlockEpoch += 1;
  lastBodyObserveQueuedAt = 0;
  clearTimeout(retryScanTimer);
  retryScanTimer = null;
  retryScanAt = 0;
  clearTimeout(characterObserverRefreshTimer);
  characterObserverRefreshTimer = null;
  if (blockCandidateFlushRafId != null) {
    cancelFrame(blockCandidateFlushRafId);
    blockCandidateFlushRafId = null;
  }
  if (viewportBlockObserver) {
    viewportBlockObserver.disconnect();
    viewportBlockObserver = null;
  }
  if (characterDataObserver) {
    characterDataObserver.disconnect();
    characterDataObserver = null;
  }
  initViewportBlockObserver();
  translatedNodeMarks = new WeakSet();
  restorableNodes.clear();
  failedTranslationCache.clear();
  failedPhraseSweepSerial = 0;
}

function onScrollActivity() {
  if (!siteEnabled || tabPaused) {
    return;
  }

  isScrolling = true;
  fullRescanNeeded = true;
  requestCancelPendingTranslations();
  queueObserveBlockCandidates(document.body || document.documentElement);
  clearTimeout(scrollIdleTimer);
  scrollIdleTimer = setTimeout(() => {
    scrollIdleTimer = null;
    isScrolling = false;
    scheduleCharacterObserverRefresh();
    scheduleScan(true);
  }, currentSpeedProfile.scrollIdleMs);
}

function onResizeViewport() {
  if (!siteEnabled || tabPaused) {
    return;
  }
  fullRescanNeeded = true;
  scheduleScan();
}

function onVisibilityChange() {
  if (!siteEnabled || tabPaused) {
    return;
  }
  if (!document.hidden) {
    isScrolling = false;
    fullRescanNeeded = true;
    scheduleCharacterObserverRefresh(true);
    scheduleScan(true);
  }
}

function onHoverCandidate(event) {
  if (!siteEnabled || tabPaused) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  if (isLikelyHoverTrigger(target) || isLikelyOverlayElement(target)) {
    clearTimeout(hoverScanTimer);
    hoverScanTimer = setTimeout(() => {
      hoverScanTimer = null;
      markDirtyRoot(target.closest(OVERLAY_CONTENT_SELECTORS) || target);
      scheduleScan(true);
    }, currentSpeedProfile.hoverScanDelayMs);
  }
}

function isLikelyHoverTrigger(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  if (target.matches(HOVER_TRIGGER_SELECTORS) || target.closest(HOVER_TRIGGER_SELECTORS)) {
    return true;
  }

  const interactiveContainer = target.closest(
    "button, [role='button'], [role='menuitem'], summary, li, [data-toggle], [data-trigger], [aria-expanded]"
  );
  if (interactiveContainer) {
    return true;
  }

  const idText = typeof target.id === "string" ? target.id : "";
  const classText = typeof target.className === "string" ? target.className : "";
  return OVERLAY_HINT_PATTERN.test(`${idText} ${classText}`);
}

function onMouseSelectionEnd(event) {
  if (!siteEnabled || tabPaused || !event || event.button !== 0) {
    return;
  }

  clearTimeout(selectionScanTimer);
  selectionScanTimer = setTimeout(() => {
    selectionScanTimer = null;
    enqueueSelectedTextNodes();
  }, currentSpeedProfile.selectionScanDelayMs);
}

function scheduleScan(immediate = false) {
  if (!siteEnabled || tabPaused) {
    return;
  }

  if (immediate) {
    scanForceImmediate = true;
  }

  if (scanRafId != null) {
    return;
  }

  const raf = window.requestAnimationFrame || ((callback) => setTimeout(callback, 16));
  scanRafId = raf(() => {
    scanRafId = null;
    if (!siteEnabled || tabPaused) {
      scanForceImmediate = false;
      return;
    }

    const throttleMs = scanForceImmediate ? 0 : getScanThrottleMs();
    const elapsed = now() - lastScanAt;
    const waitMs = Math.max(0, throttleMs - elapsed);

    if (waitMs <= 0) {
      runScheduledScan();
      return;
    }

    if (scanThrottleTimer) {
      return;
    }

    scanThrottleTimer = setTimeout(() => {
      scanThrottleTimer = null;
      runScheduledScan();
    }, waitMs);
  });
}

function runScheduledScan() {
  if (!siteEnabled || tabPaused) {
    scanForceImmediate = false;
    return;
  }

  scanForceImmediate = false;
  lastScanAt = now();
  scanVisibleTextNodes();
}

function getScanThrottleMs() {
  return clampNumber(
    currentSpeedProfile.scanDebounceMs,
    SCAN_THROTTLE_MIN_MS,
    SCAN_THROTTLE_MAX_MS
  );
}

function requestCancelPendingTranslations(immediate = false) {
  const sendCancel = () => {
    sendRuntimeMessage({ type: "cancelPendingTranslations" }).catch(() => {
      // 忽略取消通知失败，不影响后续翻译。
    });
  };

  if (immediate) {
    if (cancelRequestTimer) {
      clearTimeout(cancelRequestTimer);
      cancelRequestTimer = null;
    }
    sendCancel();
    return;
  }

  if (cancelRequestTimer) {
    return;
  }

  cancelRequestTimer = setTimeout(() => {
    cancelRequestTimer = null;
    sendCancel();
  }, REQUEST_CANCEL_DEBOUNCE_MS);
}

function isCancellationError(errorMessage) {
  const text = extractErrorText(errorMessage).toLowerCase();
  return (
    text.includes("取消") ||
    text.includes("cancel") ||
    text.includes("aborted") ||
    text.includes("abort")
  );
}

function isExtensionContextInvalidatedError(errorMessage) {
  const text = extractErrorText(errorMessage).toLowerCase();
  return (
    text.includes("extension context invalidated") ||
    text.includes("context invalidated") ||
    text.includes("receiving end does not exist") ||
    text.includes("message port closed") ||
    text.includes("the message port closed before a response was received")
  );
}

function handleExtensionContextInvalidated(errorMessage = "") {
  if (runtimeContextInvalidated) {
    return;
  }

  runtimeContextInvalidated = true;
  console.info(
    "[LongCat Translate] 扩展上下文失效，已停止当前页面翻译任务。",
    errorMessage || ""
  );
  disableTranslation();
}

function extractErrorText(errorLike) {
  if (errorLike == null) {
    return "";
  }

  if (typeof errorLike === "string") {
    return errorLike;
  }

  if (errorLike instanceof Error) {
    return errorLike.message || String(errorLike);
  }

  if (typeof errorLike?.message === "string" && errorLike.message) {
    return errorLike.message;
  }

  if (typeof errorLike?.error === "string" && errorLike.error) {
    return errorLike.error;
  }

  try {
    const json = JSON.stringify(errorLike);
    if (json && json !== "{}") {
      return json;
    }
  } catch (_error) {
    // 忽略 JSON 序列化失败，继续兜底。
  }

  return String(errorLike || "");
}

function scanVisibleTextNodes() {
  if (!siteEnabled || tabPaused || document.hidden || isScrolling) {
    return;
  }

  cleanupDisconnectedTrackedNodes();
  startMeasureEpoch();
  const roots = collectScanRoots();
  if (!roots.length) {
    return;
  }
  scheduleCharacterObserverRefresh();

  const seenNodes = new Set();
  for (const root of roots) {
    const isOverlayRoot = isLikelyOverlayElement(root);
    if (!isOverlayRoot && shouldSkipChineseRoot(root)) {
      continue;
    }
    const pendingLimit = MAX_PENDING_NODES + (isOverlayRoot ? MAX_PENDING_OVERLAY_BOOST : 0);
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return isEligibleTextNode(node)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    let node = walker.nextNode();
    while (node) {
      if (pendingNodes.size >= pendingLimit) {
        break;
      }

      if (seenNodes.has(node)) {
        node = walker.nextNode();
        continue;
      }
      seenNodes.add(node);

      const state = getNodeState(node);
      if (!state || !state.coreText) {
        node = walker.nextNode();
        continue;
      }

      if (isSourceTextRetrySuppressed(state.coreText, state)) {
        node = walker.nextNode();
        continue;
      }

      if (state.translated && node.nodeValue === state.translatedText) {
        node = walker.nextNode();
        continue;
      }

      if (isRetryCoolingDown(state)) {
        node = walker.nextNode();
        continue;
      }

      const cachedTranslation = getCachedTranslation(state.coreText, state);
      if (cachedTranslation) {
        applyTranslationToNode(node, state, cachedTranslation);
        node = walker.nextNode();
        continue;
      }

      if (!state.pending) {
        pendingNodes.add(node);
        nodeStates.set(node, {
          ...state,
          pending: true,
          translated: false,
          queueOrder: queueSerial
        });
        queueSerial += 1;
      }

      node = walker.nextNode();
    }
  }

  dirtyRoots.clear();
  fullRescanNeeded = false;

  if (pendingNodes.size > 0) {
    processQueue();
  }
}

function collectScanRoots() {
  const body = document.body;
  if (!body) {
    return [];
  }

  cleanupVisibleBlockRoots();

  if (fullRescanNeeded) {
    const viewportRoots = collectViewportScanRoots(body);
    if (viewportRoots.length) {
      return sortRoots(viewportRoots);
    }
    return [body];
  }

  const roots = [];

  for (const visibleRoot of visibleBlockRoots) {
    if (isValidScanRoot(visibleRoot) && shouldScanDirtyRoot(visibleRoot)) {
      roots.push(visibleRoot);
    }
  }

  for (const root of dirtyRoots) {
    if (isValidScanRoot(root) && shouldScanDirtyRoot(root)) {
      roots.push(root);
    }
  }

  if (!roots.length) {
    return collectViewportScanRoots(body);
  }

  return sortRoots(deduplicateRoots(roots));
}

function shouldScanDirtyRoot(root) {
  if (!root) {
    return false;
  }
  if (isLikelyOverlayElement(root)) {
    return isElementNearViewport(root, { ignoreVisualState: true });
  }
  return isElementNearViewport(root);
}

function collectViewportScanRoots(body) {
  const roots = [];

  if (visibleBlockRoots.size) {
    for (const visibleRoot of visibleBlockRoots) {
      if (isValidScanRoot(visibleRoot) && shouldScanDirtyRoot(visibleRoot)) {
        roots.push(visibleRoot);
      }
    }
  }

  if (!roots.length) {
    for (const child of body.children) {
      if (!(child instanceof Element)) {
        continue;
      }
      if (isElementNearViewport(child)) {
        roots.push(child);
      }
    }
  }

  if (roots.length < 40) {
    const prioritySelectors = `${MAIN_CONTENT_HINT_SELECTORS}, ${OVERLAY_CONTENT_SELECTORS}`;
    const priorityElements = document.querySelectorAll(prioritySelectors);
    for (const element of priorityElements) {
      const nearViewport = isLikelyOverlayElement(element)
        ? isElementNearViewport(element, { ignoreVisualState: true })
        : isElementNearViewport(element);
      if (nearViewport) {
        roots.push(element);
      }
    }
  }

  if (!roots.length) {
    roots.push(body);
  }

  return sortRoots(deduplicateRoots(roots));
}

function sortRoots(roots) {
  return [...roots].sort((left, right) => {
    const leftPriority = computeRootPriority(left);
    const rightPriority = computeRootPriority(right);
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftMeasure = getElementMeasure(left);
    const rightMeasure = getElementMeasure(right);
    if (leftMeasure.top !== rightMeasure.top) {
      return leftMeasure.top - rightMeasure.top;
    }
    return leftMeasure.left - rightMeasure.left;
  });
}

function computeRootPriority(root) {
  if (isLikelyOverlayElement(root)) {
    return 0;
  }
  if (root.matches?.(MAIN_CONTENT_HINT_SELECTORS) || root.closest?.(MAIN_CONTENT_HINT_SELECTORS)) {
    return 1;
  }
  return 2;
}

function deduplicateRoots(roots) {
  const unique = [];
  const seen = new Set();

  for (const root of roots) {
    if (!isValidScanRoot(root)) {
      continue;
    }
    if (seen.has(root)) {
      continue;
    }
    seen.add(root);
    unique.push(root);
  }

  const depthCache = new WeakMap();
  unique.sort((left, right) => {
    const leftDepth = getElementDepth(left, depthCache);
    const rightDepth = getElementDepth(right, depthCache);
    if (leftDepth !== rightDepth) {
      return leftDepth - rightDepth;
    }

    const leftMeasure = getElementMeasure(left);
    const rightMeasure = getElementMeasure(right);
    if (leftMeasure.top !== rightMeasure.top) {
      return leftMeasure.top - rightMeasure.top;
    }
    return leftMeasure.left - rightMeasure.left;
  });

  const deduped = [];
  const ancestorRoots = new Set();
  for (const root of unique) {
    if (hasAncestorInRootSet(root, ancestorRoots)) {
      continue;
    }
    deduped.push(root);
    ancestorRoots.add(root);
  }

  return deduped;
}

function getElementDepth(element, depthCache) {
  if (!element || !(element instanceof Element)) {
    return Number.MAX_SAFE_INTEGER;
  }

  const cached = depthCache.get(element);
  if (typeof cached === "number") {
    return cached;
  }

  let depth = 0;
  let cursor = element;
  while (cursor?.parentElement) {
    depth += 1;
    cursor = cursor.parentElement;
  }
  depthCache.set(element, depth);
  return depth;
}

function hasAncestorInRootSet(element, rootSet) {
  let cursor = element?.parentElement || null;
  while (cursor) {
    if (rootSet.has(cursor)) {
      return true;
    }
    cursor = cursor.parentElement;
  }
  return false;
}

function isValidScanRoot(root) {
  return Boolean(
    root &&
      root.isConnected &&
      root.nodeType === Node.ELEMENT_NODE &&
      !shouldIgnoreElement(root)
  );
}

function markDirtyFromMutation(mutation) {
  if (!mutation) {
    return;
  }

  if (mutation.type === "childList") {
    markDirtyRoot(getElementFromNode(mutation.target));
    const addedNodes = Array.from(mutation.addedNodes || []);
    for (const node of addedNodes) {
      markDirtyRoot(getElementFromNode(node));
    }
    return;
  }

  if (mutation.type === "characterData") {
    markDirtyRoot(getElementFromNode(mutation.target));
    return;
  }

  if (mutation.type === "attributes") {
    markDirtyRoot(getElementFromNode(mutation.target));
  }
}

function shouldHandleAttributeMutation(mutation) {
  if (!mutation || mutation.type !== "attributes") {
    return false;
  }

  const attributeName = String(mutation.attributeName || "");
  if (!attributeName) {
    return false;
  }

  if (attributeName === "hidden" || attributeName === "open") {
    return true;
  }

  if (attributeName === "aria-hidden" || attributeName === "aria-expanded") {
    return true;
  }

  const target = getElementFromNode(mutation.target);
  if (!target || !target.isConnected) {
    return false;
  }

  if (isLikelyOverlayElement(target) || target.closest?.(OVERLAY_CONTENT_SELECTORS)) {
    return true;
  }

  if (attributeName !== "class" && attributeName !== "data-state") {
    return false;
  }

  if (
    !target.matches?.(HOVER_TRIGGER_SELECTORS) &&
    !target.closest?.(HOVER_TRIGGER_SELECTORS) &&
    !target.matches?.(MAIN_CONTENT_HINT_SELECTORS) &&
    !target.closest?.(MAIN_CONTENT_HINT_SELECTORS)
  ) {
    return false;
  }

  return isElementNearViewport(target, { ignoreVisualState: true });
}

function markDirtyRoot(element) {
  if (!element || !element.isConnected) {
    return;
  }

  let root = element;
  const scopedRoot = element.closest(
    `${MAIN_CONTENT_HINT_SELECTORS}, ${OVERLAY_CONTENT_SELECTORS}, section, article, main, [role='main']`
  );
  if (scopedRoot) {
    root = scopedRoot;
  }

  if (root === document.body || root === document.documentElement) {
    fullRescanNeeded = true;
    return;
  }

  dirtyRoots.add(root);
  if (dirtyRoots.size > 80) {
    dirtyRoots.clear();
    fullRescanNeeded = true;
  }
}

function enqueueSelectedTextNodes() {
  if (!siteEnabled || document.hidden) {
    return;
  }

  startMeasureEpoch();
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return;
  }

  if (shouldIgnoreSelection(selection)) {
    return;
  }

  if (!selection.toString().trim()) {
    return;
  }

  const selectedAt = Date.now();
  let touchedCount = 0;

  for (let index = 0; index < selection.rangeCount; index += 1) {
    if (touchedCount >= MAX_SELECTION_ENQUEUE_NODES) {
      break;
    }

    const range = selection.getRangeAt(index);
    const selectedNodes = getTextNodesFromRange(range);
    for (const node of selectedNodes) {
      if (touchedCount >= MAX_SELECTION_ENQUEUE_NODES) {
        break;
      }

      const state = getNodeState(node);
      if (!state || !state.coreText) {
        continue;
      }

      if (!isEligibleForSelectionPriority(node, state)) {
        continue;
      }

      const cachedTranslation = getCachedTranslation(state.coreText, state);
      if (cachedTranslation) {
        applyTranslationToNode(node, state, cachedTranslation);
        continue;
      }

      const selectedState = {
        ...state,
        selectedAt
      };

      if (state.pending) {
        nodeStates.set(node, selectedState);
        touchedCount += 1;
        continue;
      }

      pendingNodes.add(node);
      nodeStates.set(node, {
        ...selectedState,
        pending: true,
        translated: false,
        queueOrder: queueSerial
      });
      queueSerial += 1;
      touchedCount += 1;
    }
  }

  if (touchedCount > 0) {
    processQueue(true);
  }
}

function shouldIgnoreSelection(selection) {
  const anchorElement = getElementFromNode(selection.anchorNode);
  const focusElement = getElementFromNode(selection.focusNode);
  return isEditableContext(anchorElement) || isEditableContext(focusElement);
}

function getElementFromNode(node) {
  if (!node) {
    return null;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    return node;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return node.parentElement;
  }
  return null;
}

function isEditableContext(element) {
  if (!element) {
    return false;
  }
  return Boolean(
    element.closest("input, textarea, select, option, [contenteditable], [role='textbox']")
  );
}

function getTextNodesFromRange(range) {
  if (!range) {
    return [];
  }

  const nodes = [];
  const root = range.commonAncestorContainer;
  if (!root) {
    return nodes;
  }

  if (root.nodeType === Node.TEXT_NODE) {
    if (rangeIntersectsNode(range, root)) {
      nodes.push(root);
    }
    return nodes;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    if (rangeIntersectsNode(range, node)) {
      nodes.push(node);
    }
    node = walker.nextNode();
  }
  return nodes;
}

function rangeIntersectsNode(range, node) {
  try {
    return range.intersectsNode(node);
  } catch (_error) {
    return false;
  }
}

function isEligibleForSelectionPriority(node, state) {
  if (!node || !state || !node.isConnected) {
    return false;
  }

  if (isRetryCoolingDown(state)) {
    return false;
  }

  if (state.pending) {
    return true;
  }

  if (state.translated && node.nodeValue === state.translatedText) {
    return false;
  }

  if (!state.coreText || state.coreText.length < 1) {
    return false;
  }

  if (isSourceTextRetrySuppressed(state.coreText, state)) {
    return false;
  }

  if (isMostlyChinese(state.coreText)) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/.test(state.coreText)) {
    return false;
  }

  const parent = node.parentElement;
  if (!parent || shouldIgnoreElement(parent)) {
    return false;
  }

  if (isLikelyOverlayElement(parent)) {
    return isElementNearViewport(parent, { ignoreVisualState: true });
  }

  return isElementNearViewport(parent);
}

function isRetryCoolingDown(state) {
  if (!state) {
    return false;
  }
  if (state.giveUp) {
    return true;
  }
  if (typeof state.retryAfterAt !== "number") {
    return false;
  }
  return Date.now() < state.retryAfterAt;
}

function isEligibleTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  const parent = node.parentElement;
  if (!parent || shouldIgnoreElement(parent)) {
    return false;
  }

  const rawText = node.nodeValue;
  if (!rawText || !rawText.trim()) {
    return false;
  }

  const coreText = rawText.trim();

  if (coreText.length < 2) {
    return false;
  }

  if (isMostlyChinese(coreText)) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/.test(coreText)) {
    return false;
  }

  const nearViewport = isLikelyOverlayElement(parent)
    ? isElementNearViewport(parent, { ignoreVisualState: true })
    : isElementNearViewport(parent);
  if (!nearViewport) {
    return false;
  }

  const state = nodeStates.get(node);
  const failedContextMeta = state || getFailedPhraseContextMeta(parent);
  if (isSourceTextRetrySuppressed(coreText, failedContextMeta)) {
    return false;
  }

  if (state?.pending) {
    return false;
  }

  if (isRetryCoolingDown(state)) {
    return false;
  }

  if (state?.translated && node.nodeValue === state.translatedText) {
    return false;
  }

  return true;
}

function shouldIgnoreElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return true;
  }

  const ignoredByTag = element.closest(
    "script, style, noscript, iframe, svg, canvas, pre, code, kbd, samp"
  );
  if (ignoredByTag) {
    return true;
  }

  const editableArea = element.closest(
    "input, textarea, select, option, [contenteditable], [role='textbox']"
  );
  if (editableArea) {
    return true;
  }

  return false;
}

function startMeasureEpoch() {
  measureEpoch += 1;
  if (measureEpoch > 1000000000) {
    measureEpoch = 1;
  }
}

function getElementMeasure(element) {
  if (!element) {
    return {
      top: Number.MAX_SAFE_INTEGER,
      left: Number.MAX_SAFE_INTEGER,
      right: Number.MIN_SAFE_INTEGER,
      bottom: Number.MIN_SAFE_INTEGER,
      width: 0,
      height: 0
    };
  }

  const cached = elementMeasureCache.get(element);
  if (cached && cached.epoch === measureEpoch) {
    return cached;
  }

  const rect = element.getBoundingClientRect();
  const measured = {
    epoch: measureEpoch,
    top: Number.isFinite(rect.top) ? rect.top : Number.MAX_SAFE_INTEGER,
    left: Number.isFinite(rect.left) ? rect.left : Number.MAX_SAFE_INTEGER,
    right: Number.isFinite(rect.right) ? rect.right : Number.MIN_SAFE_INTEGER,
    bottom: Number.isFinite(rect.bottom) ? rect.bottom : Number.MIN_SAFE_INTEGER,
    width: Number.isFinite(rect.width) ? rect.width : 0,
    height: Number.isFinite(rect.height) ? rect.height : 0
  };
  elementMeasureCache.set(element, measured);
  return measured;
}

function getElementVisualState(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return { epoch: measureEpoch, hidden: true };
  }

  const cached = elementVisualCache.get(element);
  if (cached && cached.epoch === measureEpoch) {
    return cached;
  }

  const style = window.getComputedStyle(element);
  const visual = {
    epoch: measureEpoch,
    hidden:
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
  };
  elementVisualCache.set(element, visual);
  return visual;
}

function isElementNearViewport(element, options = {}) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const measure = getElementMeasure(element);
  if (measure.width === 0 && measure.height === 0) {
    return false;
  }

  if (!options.ignoreVisualState) {
    const visual = getElementVisualState(element);
    if (visual.hidden) {
      return false;
    }
  }

  return (
    measure.bottom > -VIEWPORT_MARGIN &&
    measure.top < window.innerHeight + VIEWPORT_MARGIN &&
    measure.right > -VIEWPORT_MARGIN &&
    measure.left < window.innerWidth + VIEWPORT_MARGIN
  );
}

function getNodeState(node) {
  const rawText = node.nodeValue;
  if (!rawText) {
    return null;
  }

  const split = splitText(rawText);
  if (!split.coreText) {
    return null;
  }

  const previous = nodeStates.get(node) || {};
  const failedContextMeta = getFailedPhraseContextMeta(node.parentElement);
  const shouldResetRetryMeta =
    typeof previous.coreText === "string" &&
    (previous.coreText !== split.coreText ||
      previous.failedContextKey !== failedContextMeta.contextKey ||
      previous.failedLanguageKey !== failedContextMeta.languageKey);
  const positionMeta = computePositionMeta(node.parentElement);
  const importanceLane = computeImportanceLane(
    node.parentElement,
    split.coreText,
    previous.selectedAt
  );
  return {
    ...previous,
    ...(shouldResetRetryMeta
      ? {
          rejectedCount: 0,
          retryAfterAt: 0,
          giveUp: false
        }
      : {}),
    originalText: previous.originalText || rawText,
    coreText: split.coreText,
    prefix: split.prefix,
    suffix: split.suffix,
    failedLanguageKey: failedContextMeta.languageKey,
    failedContextKey: failedContextMeta.contextKey,
    viewportTop: positionMeta.top,
    viewportLeft: positionMeta.left,
    importanceLane
  };
}

function splitText(rawText) {
  const match = rawText.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const prefix = match ? match[1] : "";
  const coreText = match ? match[2].trim() : rawText.trim();
  const suffix = match ? match[3] : "";

  return {
    prefix,
    coreText,
    suffix
  };
}

function isMostlyChinese(text) {
  if (!text) {
    return false;
  }

  const chineseMatches = text.match(/[\u4e00-\u9fff]/g);
  const chineseCount = chineseMatches ? chineseMatches.length : 0;

  return chineseCount > 0 && chineseCount / text.length > 0.45;
}

function getElementTextSample(element, maxChars = BLOCK_SAMPLE_TEXT_CHARS) {
  if (!element) {
    return "";
  }
  const raw = String(element.textContent || "");
  if (!raw) {
    return "";
  }
  return raw
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, Math.max(32, maxChars));
}

function shouldSkipChineseText(text) {
  if (!text) {
    return false;
  }

  const chineseCount = countMatches(text, /[\u4e00-\u9fff]/g);
  if (chineseCount < 14) {
    return false;
  }

  const foreignCount = countMatches(
    text,
    /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/g
  );
  const chineseRatio = chineseCount / Math.max(1, text.length);
  return chineseRatio > 0.4 && foreignCount < chineseCount * 0.22;
}

function shouldSkipChineseRoot(root) {
  if (!root || isLikelyOverlayElement(root)) {
    return false;
  }

  const cached = rootLanguageCache.get(root);
  if (cached && cached.epoch === measureEpoch) {
    return cached.skip;
  }

  const sample = getElementTextSample(root, BLOCK_SAMPLE_TEXT_CHARS);
  const skip = shouldSkipChineseText(sample);
  rootLanguageCache.set(root, {
    epoch: measureEpoch,
    skip
  });
  return skip;
}

function isLikelyOverlayElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (element.closest(OVERLAY_CONTENT_SELECTORS)) {
    return true;
  }

  const className = typeof element.className === "string" ? element.className : "";
  const id = typeof element.id === "string" ? element.id : "";
  const role = element.getAttribute("role") || "";
  const ariaLive = element.getAttribute("aria-live") || "";
  const combined = `${className} ${id} ${role} ${ariaLive}`.toLowerCase();
  return OVERLAY_HINT_PATTERN.test(combined);
}

function isOverlayRelatedMutation(mutation) {
  if (!mutation) {
    return false;
  }

  if (mutation.type === "attributes") {
    return isLikelyOverlayElement(mutation.target);
  }

  if (mutation.type === "childList") {
    if (isLikelyOverlayElement(mutation.target)) {
      return true;
    }
    return nodeListContainsOverlayHint(mutation.addedNodes);
  }

  if (mutation.type === "characterData") {
    return isLikelyOverlayElement(mutation.target?.parentElement || null);
  }

  return false;
}

function nodeListContainsOverlayHint(nodes) {
  if (!nodes || !nodes.length) {
    return false;
  }

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const element = node;
    if (isLikelyOverlayElement(element)) {
      return true;
    }
    try {
      if (element.querySelector(OVERLAY_CONTENT_SELECTORS)) {
        return true;
      }
    } catch (_error) {
      // 忽略无效选择器导致的查询异常。
    }
  }

  return false;
}

function computePositionMeta(element) {
  if (!element) {
    return {
      top: Number.MAX_SAFE_INTEGER,
      left: Number.MAX_SAFE_INTEGER
    };
  }

  return {
    top: getElementMeasure(element).top,
    left: getElementMeasure(element).left
  };
}

function computeImportanceLane(element, coreText, selectedAt = 0) {
  if (!element) {
    return 3;
  }

  if (selectedAt && Date.now() - selectedAt <= SELECTION_PRIORITY_WINDOW_MS) {
    return 0;
  }

  if (isLikelyOverlayElement(element)) {
    return 1;
  }

  let lane = 3;
  if (element.closest(MAIN_CONTENT_HINT_SELECTORS)) {
    lane -= 1;
  }
  if (element.closest("h1, h2, h3, strong, b")) {
    lane -= 1;
  }
  if (element.closest("p, li, blockquote, figcaption, td, th, summary")) {
    lane -= 0.5;
  }
  if (element.closest(LOW_PRIORITY_HINT_SELECTORS)) {
    lane += 1;
  }

  const measure = getElementMeasure(element);
  if (measure.top >= -40 && measure.top <= window.innerHeight * 0.55) {
    lane -= 0.5;
  }

  if (typeof coreText === "string" && coreText.length >= 100) {
    lane -= 0.5;
  } else if (typeof coreText === "string" && coreText.length <= 10) {
    lane += 0.3;
  }

  return clampNumber(lane, 1, 5);
}

function processQueue(immediate = false) {
  if (!siteEnabled || tabPaused || document.hidden || isScrolling) {
    return;
  }

  if (!immediate && activeWorkerCount === 0) {
    if (queuePumpTimer) {
      return;
    }
    queuePumpTimer = setTimeout(() => {
      queuePumpTimer = null;
      processQueue(true);
    }, QUEUE_COALESCE_MS);
    return;
  }

  if (queuePumpTimer) {
    clearTimeout(queuePumpTimer);
    queuePumpTimer = null;
  }

  const maxConcurrent = currentSpeedProfile.maxConcurrentRequests;
  if (maxConcurrent <= 0) {
    return;
  }

  while (activeWorkerCount < maxConcurrent && pendingNodes.size > 0) {
    activeWorkerCount += 1;
    runQueueWorker()
      .catch((error) => {
        const errorText = extractErrorText(error);
        if (runtimeContextInvalidated || isExtensionContextInvalidatedError(errorText)) {
          handleExtensionContextInvalidated(errorText);
          return;
        }
        if (isCancellationError(errorText)) {
          return;
        }
        lowerAdaptiveBatchLimits();
        console.warn("[LongCat Translate] 翻译队列异常", errorText || error);
      })
      .finally(() => {
        activeWorkerCount = Math.max(0, activeWorkerCount - 1);
        if (siteEnabled && pendingNodes.size > 0) {
          scheduleScan();
        }
      });
  }
}

async function runQueueWorker() {
  while (siteEnabled && !tabPaused && !document.hidden) {
    if (isScrolling) {
      await waitForScrollIdle();
      if (!siteEnabled || tabPaused || isScrolling) {
        return;
      }
    }

    const batchPlan = await buildBatchPlan();
    if (!batchPlan) {
      return;
    }

    const { batchNodes, batchEntries, totalChars, batchLimits } = batchPlan;

    const requestStartedAt = now();
    const response = await sendRuntimeMessage({
      type: "translateBatch",
      entries: batchEntries,
      texts: batchEntries.map((entry) => entry.text),
      languageHint: pageLanguageHint
    });
    const elapsedMs = now() - requestStartedAt;

    if (!response?.ok) {
      requeueBatchNodes(batchNodes);
      const responseErrorText = extractErrorText(response?.error);
      if (runtimeContextInvalidated || isExtensionContextInvalidatedError(responseErrorText)) {
        handleExtensionContextInvalidated(responseErrorText);
        return;
      }
      if (isCancellationError(responseErrorText)) {
        await sleep(18);
        return;
      }
      lowerAdaptiveBatchLimits();
      throw new Error(responseErrorText || "翻译请求失败");
    }

    const translations = Array.isArray(response.translations)
      ? response.translations
      : [];

    if (!siteEnabled || tabPaused) {
      requeueBatchNodes(batchNodes);
      return;
    }

    if (translations.length !== batchNodes.length) {
      requeueBatchNodes(batchNodes);
      lowerAdaptiveBatchLimits();
      throw new Error("翻译返回数量与请求不一致");
    }

    tuneAdaptiveBatchLimits(elapsedMs, batchLimits.priorityMode, batchNodes.length, totalChars);

    if (isScrolling) {
      await waitForScrollIdle();
      if (!siteEnabled || tabPaused || isScrolling) {
        requeueBatchNodes(batchNodes);
        return;
      }
    }

    for (let index = 0; index < batchNodes.length; index += 1) {
      const node = batchNodes[index];
      if (!node || !node.isConnected) {
        continue;
      }

      const state = nodeStates.get(node);
      if (!state) {
        continue;
      }

      const translatedCore = String(translations[index] ?? "").trim();
      if (!isAcceptableTranslatedResult(state.coreText, translatedCore)) {
        markNodeTranslationRejected(node, state);
        continue;
      }

      rememberTranslation(state.coreText, translatedCore, state);
      applyTranslationToNode(node, state, translatedCore);
    }

    await sleep(35);
    if (pendingNodes.size <= 0) {
      return;
    }
  }
}

async function buildBatchPlan() {
  startMeasureEpoch();
  const batchNodes = [];
  const batchEntries = [];
  let totalChars = 0;

  const orderedCandidates = applyLimitedSelectionPreemption(
    collectOrderedPendingCandidates()
  );
  if (!orderedCandidates.length) {
    return null;
  }

  const batchLimits = pickBatchLimits(orderedCandidates);

  for (const candidate of orderedCandidates) {
    if (batchNodes.length >= batchLimits.maxItems) {
      break;
    }

    const { node, state } = candidate;

    if (!state.coreText) {
      pendingNodes.delete(node);
      nodeStates.delete(node);
      removeTranslationTracking(node);
      continue;
    }

    const failedPhraseState = getFailedPhraseState(state.coreText, state);
    if (failedPhraseState) {
      pendingNodes.delete(node);
      nodeStates.set(node, {
        ...state,
        pending: false,
        translated: false,
        translatedText: "",
        rejectedCount: Math.max(Number(state.rejectedCount || 0), Number(failedPhraseState.count || 0)),
        retryAfterAt: Number(failedPhraseState.retryAfterAt || 0),
        giveUp: Boolean(failedPhraseState.giveUp)
      });
      removeTranslationTracking(node);
      continue;
    }

    const cachedTranslation = getCachedTranslation(state.coreText, state);
    if (cachedTranslation) {
      pendingNodes.delete(node);
      applyTranslationToNode(node, state, cachedTranslation);
      continue;
    }

    const requestEntry = buildTranslationRequestEntry(node, state);

    if (requestEntry.text.length > batchLimits.maxChars) {
      pendingNodes.delete(node);
      try {
        const translatedLong = await translateLongText(
          state.coreText,
          Math.max(1200, batchLimits.maxChars - 200)
        );
        if (!isAcceptableTranslatedResult(state.coreText, translatedLong)) {
          markNodeTranslationRejected(node, state);
          continue;
        }
        rememberTranslation(state.coreText, translatedLong, state);
        applyTranslationToNode(node, state, translatedLong);
      } catch (error) {
        pendingNodes.add(node);
        nodeStates.set(node, {
          ...state,
          pending: true,
          queueOrder:
            typeof state.queueOrder === "number" ? state.queueOrder : queueSerial++
        });
        throw error;
      }
      continue;
    }

    if (batchNodes.length > 0 && totalChars + requestEntry.text.length > batchLimits.maxChars) {
      break;
    }

    pendingNodes.delete(node);
    batchNodes.push(node);
    batchEntries.push(requestEntry);
    totalChars += requestEntry.text.length;
  }

  if (!batchNodes.length) {
    return null;
  }

  return {
    batchNodes,
    batchEntries,
    totalChars,
    batchLimits
  };
}

function buildTranslationRequestEntry(node, state) {
  const entry = {
    text: state.coreText
  };

  if (!shouldUseContextEnhancement(node, state)) {
    return entry;
  }

  const context = collectNeighborContext(node);
  if (context.prev) {
    entry.prev = context.prev;
  }
  if (context.next) {
    entry.next = context.next;
  }
  return entry;
}

function shouldUseContextEnhancement(node, state) {
  if (!node || !state || !state.coreText) {
    return false;
  }
  if (state.coreText.length > SHORT_CONTEXT_MAX_CHARS) {
    return false;
  }

  const parent = node.parentElement;
  if (!parent || shouldIgnoreElement(parent)) {
    return false;
  }

  if (isLikelyOverlayElement(parent)) {
    return true;
  }

  return Boolean(parent.closest(CONTEXT_SUSPECT_SELECTORS));
}

function collectNeighborContext(node) {
  const parent = node?.parentNode;
  if (!parent) {
    return { prev: "", next: "" };
  }

  const prev = findNeighborContextText(node, "prev");
  const next = findNeighborContextText(node, "next");
  return { prev, next };
}

function findNeighborContextText(node, direction) {
  const isPrev = direction === "prev";
  let sibling = isPrev ? node.previousSibling : node.nextSibling;
  let hops = 0;

  while (sibling && hops < 7) {
    let candidate = "";
    if (sibling.nodeType === Node.TEXT_NODE) {
      candidate = normalizeContextText(sibling.nodeValue || "", isPrev);
    } else if (sibling.nodeType === Node.ELEMENT_NODE) {
      const element = sibling;
      if (!shouldIgnoreElement(element)) {
        candidate = normalizeContextText(getElementTextSample(element, 150), isPrev);
      }
    }

    if (candidate) {
      return candidate;
    }

    sibling = isPrev ? sibling.previousSibling : sibling.nextSibling;
    hops += 1;
  }

  return "";
}

function normalizeContextText(rawText, isPrev) {
  const text = String(rawText || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) {
    return "";
  }

  if (text.length <= CONTEXT_SNIPPET_MAX_CHARS) {
    return text;
  }

  if (isPrev) {
    return text.slice(-CONTEXT_SNIPPET_MAX_CHARS);
  }
  return text.slice(0, CONTEXT_SNIPPET_MAX_CHARS);
}

function pickBatchLimits(orderedCandidates) {
  const topCandidate = Array.isArray(orderedCandidates) ? orderedCandidates[0] : null;
  const topLane = topCandidate?.state?.importanceLane ?? 3;

  if (topLane <= 1) {
    return {
      maxItems: Math.min(PRIORITY_BATCH_MAX_ITEMS, adaptiveBatchItemLimit),
      maxChars: Math.min(PRIORITY_BATCH_MAX_CHARS, adaptiveBatchCharLimit),
      priorityMode: true
    };
  }

  return {
    maxItems: adaptiveBatchItemLimit,
    maxChars: adaptiveBatchCharLimit,
    priorityMode: false
  };
}

function tuneAdaptiveBatchLimits(elapsedMs, priorityMode, usedItems, usedChars) {
  if (priorityMode) {
    return;
  }

  if (elapsedMs <= FAST_RESPONSE_THRESHOLD_MS && usedItems >= Math.max(8, adaptiveBatchItemLimit - 2)) {
    adaptiveBatchItemLimit = Math.min(ADAPTIVE_BATCH_MAX_ITEMS, adaptiveBatchItemLimit + 2);
    adaptiveBatchCharLimit = Math.min(ADAPTIVE_BATCH_MAX_CHARS, adaptiveBatchCharLimit + 600);
    return;
  }

  if (elapsedMs >= SLOW_RESPONSE_THRESHOLD_MS || usedChars >= adaptiveBatchCharLimit * 0.98) {
    adaptiveBatchItemLimit = Math.max(ADAPTIVE_BATCH_MIN_ITEMS, adaptiveBatchItemLimit - 2);
    adaptiveBatchCharLimit = Math.max(ADAPTIVE_BATCH_MIN_CHARS, adaptiveBatchCharLimit - 700);
  }
}

function lowerAdaptiveBatchLimits() {
  adaptiveBatchItemLimit = Math.max(
    ADAPTIVE_BATCH_MIN_ITEMS,
    Math.floor(adaptiveBatchItemLimit * 0.88)
  );
  adaptiveBatchCharLimit = Math.max(
    ADAPTIVE_BATCH_MIN_CHARS,
    Math.floor(adaptiveBatchCharLimit * 0.84)
  );
}

function requeueBatchNodes(batchNodes) {
  if (!Array.isArray(batchNodes)) {
    return;
  }

  for (const node of batchNodes) {
    if (!node || !node.isConnected) {
      continue;
    }

    const state = nodeStates.get(node);
    if (!state) {
      continue;
    }

    pendingNodes.add(node);
    nodeStates.set(node, {
      ...state,
      pending: true,
      queueOrder: typeof state.queueOrder === "number" ? state.queueOrder : queueSerial++
    });
  }
}

function now() {
  if (typeof performance !== "undefined" && typeof performance.now === "function") {
    return performance.now();
  }
  return Date.now();
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

function getFailedPhraseCacheKey(sourceText, contextMeta = null) {
  const normalizedText = normalizeComparisonText(sourceText);
  if (!normalizedText) {
    return "";
  }

  const languageKey = resolveFailedPhraseLanguageKey(contextMeta);
  const contextKey = resolveFailedPhraseContextKey(contextMeta);
  return `${languageKey}|${contextKey}|${normalizedText}`;
}

function resolveFailedPhraseLanguageKey(contextMeta) {
  const hinted =
    contextMeta?.failedLanguageKey ||
    contextMeta?.languageKey ||
    contextMeta?.languageHint ||
    pageLanguageHint ||
    "";
  const normalized = sanitizeLanguageHint(hinted);
  return normalized || "auto";
}

function resolveFailedPhraseContextKey(contextMeta) {
  const contextKey = contextMeta?.failedContextKey || contextMeta?.contextKey;
  if (typeof contextKey === "string" && contextKey) {
    return contextKey;
  }
  return "ctx:global";
}

function getFailedPhraseContextMeta(element) {
  const languageKey = resolveFailedPhraseLanguageKey(null);
  if (!element || !(element instanceof Element)) {
    return {
      languageKey,
      contextKey: "ctx:root"
    };
  }

  const cached = elementFailedContextCache.get(element);
  if (cached && cached.languageKey === languageKey) {
    return cached;
  }

  const bucket = detectFailedContextBucket(element);
  const signature = buildFailedContextSignature(element, bucket);
  const contextHash = hashShortText(signature);
  const meta = {
    languageKey,
    contextKey: `${bucket}:${contextHash}`
  };
  elementFailedContextCache.set(element, meta);
  return meta;
}

function detectFailedContextBucket(element) {
  if (!element) {
    return "ctx";
  }

  if (isLikelyOverlayElement(element)) {
    return "overlay";
  }
  if (element.closest?.(MAIN_CONTENT_HINT_SELECTORS)) {
    return "main";
  }
  if (element.closest?.(LOW_PRIORITY_HINT_SELECTORS)) {
    return "nav";
  }
  if (element.closest?.("table, thead, tbody, tfoot, tr")) {
    return "table";
  }
  return "misc";
}

function buildFailedContextSignature(element, bucket) {
  const tokens = [bucket];
  let cursor = element;
  let depth = 0;
  while (cursor && depth < FAILED_CONTEXT_ANCESTOR_DEPTH) {
    tokens.push(compactElementSignatureToken(cursor));
    cursor = cursor.parentElement;
    depth += 1;
  }

  const prevTag = element.previousElementSibling?.tagName?.toLowerCase() || "";
  const nextTag = element.nextElementSibling?.tagName?.toLowerCase() || "";
  if (prevTag || nextTag) {
    tokens.push(`sib:${prevTag}|${nextTag}`);
  }

  return tokens.join(">");
}

function compactElementSignatureToken(element) {
  const tag = element.tagName?.toLowerCase() || "el";
  const id = sanitizeSignatureToken(element.id || "", 22);
  const classNames =
    typeof element.className === "string" && element.className
      ? element.className
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, FAILED_CONTEXT_CLASS_TOKENS)
          .map((item) => sanitizeSignatureToken(item, 16))
          .filter(Boolean)
          .join(".")
      : "";
  const role = sanitizeSignatureToken(element.getAttribute("role") || "", 14);

  let token = tag;
  if (id) {
    token += `#${id}`;
  }
  if (classNames) {
    token += `.${classNames}`;
  }
  if (role) {
    token += `[${role}]`;
  }
  return token;
}

function sanitizeSignatureToken(value, maxLength = 24) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, Math.max(4, maxLength));
}

function hashShortText(text) {
  let hash = 2166136261;
  const input = String(text || "");
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return (hash >>> 0).toString(36);
}

function getFailedPhraseState(sourceText, contextMeta = null) {
  const key = getFailedPhraseCacheKey(sourceText, contextMeta);
  if (!key) {
    return null;
  }

  const state = failedTranslationCache.get(key);
  if (!state) {
    return null;
  }

  if (state.expiresAt && Date.now() > state.expiresAt) {
    failedTranslationCache.delete(key);
    return null;
  }
  return state;
}

function isSourceTextRetrySuppressed(sourceText, contextMeta = null) {
  const state = getFailedPhraseState(sourceText, contextMeta);
  if (!state) {
    return false;
  }

  if (state.giveUp) {
    return true;
  }
  return Date.now() < Number(state.retryAfterAt || 0);
}

function rememberFailedTranslationAttempt(sourceText, contextMeta = null) {
  const key = getFailedPhraseCacheKey(sourceText, contextMeta);
  if (!key) {
    return null;
  }

  const previous = getFailedPhraseState(sourceText, contextMeta);
  const count = Math.max(0, Number(previous?.count || 0)) + 1;
  const giveUp = count >= INVALID_TRANSLATION_MAX_REJECTS;
  const retryDelay = Math.min(
    INVALID_TRANSLATION_RETRY_MAX_MS,
    Math.floor(
      INVALID_TRANSLATION_RETRY_MIN_MS * Math.pow(INVALID_TRANSLATION_RETRY_FACTOR, count - 1)
    )
  );
  const retryAfterAt = giveUp ? Number.MAX_SAFE_INTEGER : Date.now() + retryDelay;
  const nextState = {
    count,
    giveUp,
    retryAfterAt,
    expiresAt: Date.now() + FAILED_PHRASE_CACHE_TTL_MS
  };

  failedTranslationCache.delete(key);
  failedTranslationCache.set(key, nextState);
  trimFailedPhraseCache();
  return nextState;
}

function clearFailedPhraseState(sourceText, contextMeta = null) {
  const key = getFailedPhraseCacheKey(sourceText, contextMeta);
  if (!key) {
    return;
  }
  failedTranslationCache.delete(key);
}

function trimFailedPhraseCache() {
  while (failedTranslationCache.size > FAILED_PHRASE_CACHE_LIMIT) {
    const oldestKey = failedTranslationCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    failedTranslationCache.delete(oldestKey);
  }
}

function sweepFailedPhraseCache() {
  failedPhraseSweepSerial += 1;
  if (failedPhraseSweepSerial % FAILED_PHRASE_STALE_SWEEP_INTERVAL !== 0) {
    return;
  }

  const nowMs = Date.now();
  for (const [key, state] of failedTranslationCache) {
    if (!state || (state.expiresAt && nowMs > state.expiresAt)) {
      failedTranslationCache.delete(key);
    }
  }
}

function containsChineseChar(text) {
  return /[\u4e00-\u9fff]/.test(String(text || ""));
}

function hasLatinLetters(text) {
  return /[A-Za-z]/.test(String(text || ""));
}

function isLikelyEnglishPhrase(text) {
  const words = String(text || "").match(/[A-Za-z]+/g) || [];
  if (!words.length) {
    return false;
  }
  const latinChars = words.join("").length;
  return words.length >= 2 || latinChars >= 10;
}

function isAcceptableTranslatedResult(sourceText, translatedText) {
  const normalizedSource = normalizeComparisonText(sourceText);
  const normalizedTranslated = normalizeComparisonText(translatedText);

  if (!normalizedTranslated) {
    return false;
  }

  if (!normalizedSource) {
    return true;
  }

  const sourceHasLatin = hasLatinLetters(normalizedSource);
  if (sourceHasLatin && normalizedSource === normalizedTranslated) {
    return false;
  }

  if (
    sourceHasLatin &&
    isLikelyEnglishPhrase(normalizedSource) &&
    !containsChineseChar(normalizedTranslated)
  ) {
    return false;
  }

  return true;
}

function markNodeTranslationRejected(node, state) {
  if (!node || !state) {
    return;
  }

  pendingNodes.delete(node);
  const nodeRejectedCount = Math.max(0, Number(state.rejectedCount || 0)) + 1;
  const phraseState = rememberFailedTranslationAttempt(state.coreText, state);
  const phraseRejectedCount = Number(phraseState?.count || 0);
  const rejectedCount = Math.max(nodeRejectedCount, phraseRejectedCount);
  const giveUp =
    rejectedCount >= INVALID_TRANSLATION_MAX_REJECTS || Boolean(phraseState?.giveUp);
  const nowMs = Date.now();
  const retryAfterAt = giveUp
    ? Number.MAX_SAFE_INTEGER
    : Math.max(
        nowMs + INVALID_TRANSLATION_RETRY_MIN_MS,
        Number(phraseState?.retryAfterAt || 0)
      );
  nodeStates.set(node, {
    ...state,
    pending: false,
    translated: false,
    translatedText: "",
    rejectedCount,
    retryAfterAt,
    giveUp
  });
  removeTranslationTracking(node);
  if (!giveUp) {
    scheduleRetryScan(Math.max(INVALID_TRANSLATION_RETRY_MIN_MS, retryAfterAt - nowMs));
  }
}

function scheduleRetryScan(delayMs) {
  if (!siteEnabled) {
    return;
  }

  const safeDelay = Math.max(INVALID_TRANSLATION_RETRY_MIN_MS, Number(delayMs) || 0);
  const dueAt = Date.now() + safeDelay;
  if (retryScanTimer && dueAt >= retryScanAt) {
    return;
  }

  clearTimeout(retryScanTimer);
  retryScanAt = dueAt;
  retryScanTimer = setTimeout(() => {
    retryScanTimer = null;
    retryScanAt = 0;
    fullRescanNeeded = true;
    scheduleScan(true);
  }, safeDelay);
}

function applyTranslationToNode(node, state, translatedCore) {
  if (!node || !state || !node.isConnected) {
    return;
  }

  clearFailedPhraseState(state.coreText, state);
  const finalText = `${state.prefix || ""}${translatedCore}${state.suffix || ""}`;

  isApplyingTranslation = true;
  node.nodeValue = finalText;
  isApplyingTranslation = false;

  nodeStates.set(node, {
    ...state,
    translated: true,
    pending: false,
    translatedText: finalText,
    selectedAt: 0,
    rejectedCount: 0,
    retryAfterAt: 0,
    giveUp: false
  });
  translatedNodeMarks.add(node);
  touchRestorableNode(node);
}

function collectOrderedPendingCandidates() {
  const ordered = [];

  for (const node of pendingNodes) {
    const state = nodeStates.get(node);
    if (!state || !state.pending || !node.isConnected) {
      pendingNodes.delete(node);
      if (!node.isConnected) {
        nodeStates.delete(node);
        removeTranslationTracking(node);
      }
      continue;
    }

    const refreshed = getNodeState(node);
    if (!refreshed || !refreshed.coreText) {
      pendingNodes.delete(node);
      nodeStates.delete(node);
      removeTranslationTracking(node);
      continue;
    }

    const mergedState = {
      ...state,
      ...refreshed,
      pending: true,
      queueOrder: state.queueOrder,
      selectedAt: state.selectedAt || 0
    };
    nodeStates.set(node, mergedState);
    ordered.push({ node, state: mergedState });
  }

  ordered.sort((left, right) => {
    const leftLane = left.state.importanceLane ?? 3;
    const rightLane = right.state.importanceLane ?? 3;
    if (leftLane !== rightLane) {
      return leftLane - rightLane;
    }

    const leftTop = left.state.viewportTop ?? Number.MAX_SAFE_INTEGER;
    const rightTop = right.state.viewportTop ?? Number.MAX_SAFE_INTEGER;
    if (leftTop !== rightTop) {
      return leftTop - rightTop;
    }

    const leftLeft = left.state.viewportLeft ?? Number.MAX_SAFE_INTEGER;
    const rightLeft = right.state.viewportLeft ?? Number.MAX_SAFE_INTEGER;
    if (leftLeft !== rightLeft) {
      return leftLeft - rightLeft;
    }

    const leftOrder = left.state.queueOrder ?? 0;
    const rightOrder = right.state.queueOrder ?? 0;
    return leftOrder - rightOrder;
  });

  return ordered;
}

function applyLimitedSelectionPreemption(orderedCandidates) {
  if (!Array.isArray(orderedCandidates) || !orderedCandidates.length) {
    return [];
  }

  const now = Date.now();
  const selectedCandidates = [];
  const normalCandidates = [];

  for (const candidate of orderedCandidates) {
    const selectedAt = candidate?.state?.selectedAt || 0;
    if (selectedAt && now - selectedAt <= SELECTION_PRIORITY_WINDOW_MS) {
      selectedCandidates.push(candidate);
      continue;
    }

    if (selectedAt) {
      nodeStates.set(candidate.node, {
        ...candidate.state,
        selectedAt: 0
      });
    }
    normalCandidates.push(candidate);
  }

  if (!selectedCandidates.length) {
    return orderedCandidates;
  }

  selectedCandidates.sort((left, right) => {
    const rightSelectedAt = right.state.selectedAt || 0;
    const leftSelectedAt = left.state.selectedAt || 0;
    if (rightSelectedAt !== leftSelectedAt) {
      return rightSelectedAt - leftSelectedAt;
    }

    const leftTop = left.state.viewportTop ?? Number.MAX_SAFE_INTEGER;
    const rightTop = right.state.viewportTop ?? Number.MAX_SAFE_INTEGER;
    if (leftTop !== rightTop) {
      return leftTop - rightTop;
    }

    const leftLeft = left.state.viewportLeft ?? Number.MAX_SAFE_INTEGER;
    const rightLeft = right.state.viewportLeft ?? Number.MAX_SAFE_INTEGER;
    return leftLeft - rightLeft;
  });

  const preemptLimit = clampNumber(
    currentSpeedProfile.selectionPreemptPerBatch || MAX_SELECTION_PREEMPT_PER_BATCH,
    1,
    Math.max(1, MAX_SELECTION_ENQUEUE_NODES)
  );
  const promoted = selectedCandidates.slice(0, preemptLimit);
  const deferredSelected = selectedCandidates.slice(preemptLimit);
  return [...promoted, ...normalCandidates, ...deferredSelected];
}

function touchRestorableNode(node) {
  if (!node) {
    return;
  }

  if (restorableNodes.has(node)) {
    restorableNodes.delete(node);
  }
  restorableNodes.set(node, Date.now());
  trimRestorableNodes();
}

function cleanupDisconnectedTrackedNodes() {
  for (const node of pendingNodes) {
    if (!node || !node.isConnected) {
      pendingNodes.delete(node);
      nodeStates.delete(node);
      removeTranslationTracking(node);
    }
  }

  for (const node of restorableNodes.keys()) {
    if (!node || !node.isConnected) {
      restorableNodes.delete(node);
    }
  }

  for (const root of visibleBlockRoots) {
    if (!root || !root.isConnected) {
      visibleBlockRoots.delete(root);
    }
  }

  for (const root of dirtyRoots) {
    if (!root || !root.isConnected) {
      dirtyRoots.delete(root);
    }
  }

  for (const [root] of observedBlockLru) {
    if (!root || !root.isConnected) {
      dropObservedBlock(root);
    }
  }

  sweepFailedPhraseCache();
}

function removeTranslationTracking(node) {
  if (!node) {
    return;
  }
  translatedNodeMarks.delete(node);
  restorableNodes.delete(node);
}

function trimRestorableNodes() {
  restoreTrimSerial += 1;
  if (restoreTrimSerial % RESTORE_STALE_SWEEP_INTERVAL === 0) {
    for (const node of restorableNodes.keys()) {
      if (!node || !node.isConnected) {
        restorableNodes.delete(node);
      }
    }
  }

  while (restorableNodes.size > MAX_RESTORE_NODE_TRACK) {
    const oldestNode = restorableNodes.keys().next().value;
    if (!oldestNode) {
      break;
    }
    restorableNodes.delete(oldestNode);
  }
}

function restoreOriginalTexts() {
  if (!restorableNodes.size) {
    return false;
  }

  isApplyingTranslation = true;
  for (const node of restorableNodes.keys()) {
    if (!node || !node.isConnected) {
      continue;
    }

    const state = nodeStates.get(node);
    if (state && typeof state.originalText === "string") {
      node.nodeValue = state.originalText;
    }
    translatedNodeMarks.delete(node);
  }
  isApplyingTranslation = false;

  restorableNodes.clear();
  restoreTrimSerial = 0;
  translatedNodeMarks = new WeakSet();
  return true;
}

async function translateLongText(
  text,
  chunkChars = Math.max(1200, adaptiveBatchCharLimit - 200)
) {
  const segments = splitLongText(text, chunkChars);
  const response = await sendRuntimeMessage({
    type: "translateBatch",
    texts: segments,
    languageHint: pageLanguageHint
  });

  if (!response?.ok) {
    throw new Error(response?.error || "长文本翻译失败");
  }

  const translations = Array.isArray(response.translations)
    ? response.translations
    : [];

  if (translations.length !== segments.length) {
    throw new Error("长文本翻译返回数量不一致");
  }

  return translations
    .map((value, index) => {
      const translated = String(value ?? "");
      return translated || segments[index];
    })
    .join("");
}

function splitLongText(text, maxChunkChars) {
  const chunks = [];
  let cursor = 0;
  const safeChunkSize = Math.max(400, maxChunkChars);

  while (cursor < text.length) {
    const targetEnd = Math.min(cursor + safeChunkSize, text.length);
    let end = targetEnd;

    if (targetEnd < text.length) {
      const newlineIdx = text.lastIndexOf("\n", targetEnd);
      const periodIdx = text.lastIndexOf(". ", targetEnd);
      const chineseStopIdx = text.lastIndexOf("。", targetEnd);
      const commaIdx = text.lastIndexOf(", ", targetEnd);
      const chineseCommaIdx = text.lastIndexOf("，", targetEnd);
      const candidate = Math.max(
        newlineIdx,
        periodIdx >= 0 ? periodIdx + 1 : -1,
        chineseStopIdx >= 0 ? chineseStopIdx + 1 : -1,
        commaIdx >= 0 ? commaIdx + 1 : -1,
        chineseCommaIdx >= 0 ? chineseCommaIdx + 1 : -1
      );

      if (candidate > cursor + Math.floor(safeChunkSize * 0.55)) {
        end = candidate;
      }
    }

    const segment = text.slice(cursor, end);
    if (segment) {
      chunks.push(segment);
    }
    cursor = end;
  }

  return chunks.length ? chunks : [text];
}

function rememberTranslation(sourceText, translatedText, contextMeta = null) {
  if (!isAcceptableTranslatedResult(sourceText, translatedText)) {
    return false;
  }

  const cacheKey = getTranslationCacheKey(sourceText, contextMeta);
  if (!cacheKey) {
    return false;
  }

  clearFailedPhraseState(sourceText, contextMeta);
  translationCache.set(cacheKey, {
    sourceText: String(sourceText ?? ""),
    translatedText: String(translatedText ?? "")
  });
  trimCacheSize();
  schedulePersistSessionCache();
  return true;
}

function getCachedTranslation(sourceText, contextMeta = null) {
  const cacheKey = getTranslationCacheKey(sourceText, contextMeta);
  if (!cacheKey) {
    return "";
  }
  const cached = translationCache.get(cacheKey);
  if (!cached || typeof cached !== "object") {
    return "";
  }

  const translatedText = String(cached.translatedText ?? "");
  if (!translatedText) {
    translationCache.delete(cacheKey);
    schedulePersistSessionCache();
    return "";
  }

  if (!isAcceptableTranslatedResult(sourceText, translatedText)) {
    translationCache.delete(cacheKey);
    schedulePersistSessionCache();
    return "";
  }

  return translatedText;
}

function getTranslationCacheKey(sourceText, contextMeta = null) {
  if (!sourceText || typeof sourceText !== "string") {
    return "";
  }

  const normalizedText = sourceText.trim().replace(/\s+/g, " ");
  if (!normalizedText) {
    return "";
  }

  if (normalizedText.length <= SHORT_CONTEXT_MAX_CHARS) {
    const languageKey = resolveFailedPhraseLanguageKey(contextMeta);
    const contextKey = resolveFailedPhraseContextKey(contextMeta);
    return `${languageKey}|${contextKey}|${normalizedText}`;
  }

  return normalizedText;
}

function trimCacheSize() {
  while (translationCache.size > SESSION_CACHE_LIMIT) {
    const oldestKey = translationCache.keys().next().value;
    if (typeof oldestKey !== "string") {
      break;
    }
    translationCache.delete(oldestKey);
  }
}

function loadSessionCache() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) {
      return;
    }

    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) {
      return;
    }

    let hasInvalidEntry = false;
    for (const entry of entries) {
      if (!Array.isArray(entry) || (entry.length !== 2 && entry.length !== 3)) {
        hasInvalidEntry = true;
        continue;
      }

      const cacheKey = typeof entry[0] === "string" ? entry[0] : "";
      const sourceText =
        entry.length === 3
          ? (typeof entry[1] === "string" ? entry[1] : "")
          : cacheKey;
      const translatedText =
        entry.length === 3
          ? (typeof entry[2] === "string" ? entry[2] : "")
          : (typeof entry[1] === "string" ? entry[1] : "");
      if (cacheKey && sourceText && isAcceptableTranslatedResult(sourceText, translatedText)) {
        translationCache.set(cacheKey, {
          sourceText,
          translatedText
        });
      } else if (cacheKey || sourceText || translatedText) {
        hasInvalidEntry = true;
      }
    }

    trimCacheSize();
    if (hasInvalidEntry) {
      schedulePersistSessionCache();
    }
  } catch (_error) {
    // 忽略 sessionStorage 读取失败。
  }
}

function schedulePersistSessionCache() {
  clearTimeout(persistCacheTimer);
  persistCacheTimer = setTimeout(() => {
    persistCacheTimer = null;
    persistSessionCache();
  }, CACHE_SAVE_DEBOUNCE_MS);
}

function persistSessionCache() {
  try {
    const entries = Array.from(translationCache.entries())
      .slice(-SESSION_CACHE_LIMIT)
      .map(([cacheKey, record]) => [
        cacheKey,
        String(record?.sourceText ?? ""),
        String(record?.translatedText ?? "")
      ]);
    window.sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(entries));
  } catch (_error) {
    // 忽略 sessionStorage 写入失败。
  }
}

async function waitForScrollIdle() {
  let guard = 0;
  while (siteEnabled && isScrolling && guard < 80) {
    guard += 1;
    await sleep(25);
  }
}

function detectPageLanguageHint() {
  const htmlLang = document.documentElement?.lang || "";
  if (htmlLang.trim()) {
    return sanitizeLanguageHint(htmlLang);
  }

  const metaContentLanguage = document
    .querySelector("meta[http-equiv='content-language']")
    ?.getAttribute("content");
  if (metaContentLanguage && metaContentLanguage.trim()) {
    return sanitizeLanguageHint(metaContentLanguage);
  }

  const ogLocale = document
    .querySelector("meta[property='og:locale'], meta[name='og:locale']")
    ?.getAttribute("content");
  if (ogLocale && ogLocale.trim()) {
    return sanitizeLanguageHint(ogLocale);
  }

  const navigatorLanguage = window.navigator?.language || "";
  return sanitizeLanguageHint(navigatorLanguage);
}

function sanitizeLanguageHint(rawValue) {
  if (!rawValue || typeof rawValue !== "string") {
    return "";
  }

  return rawValue
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .split(",")[0];
}

function countMatches(text, regex) {
  if (!text || !regex) {
    return 0;
  }
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value)));
}

function sendRuntimeMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        const errorText = extractErrorText(chrome.runtime.lastError?.message);
        if (isExtensionContextInvalidatedError(errorText)) {
          handleExtensionContextInvalidated(errorText);
        }
        resolve({ ok: false, error: errorText });
        return;
      }
      resolve(response);
    });
  });
}

function normalizeHostname(hostname) {
  if (!hostname || typeof hostname !== "string") {
    return "";
  }
  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

function requestFrame(callback) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(callback, 16);
}

function cancelFrame(frameId) {
  if (frameId == null) {
    return;
  }
  if (typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(frameId);
    return;
  }
  clearTimeout(frameId);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## popup.js
```
const siteLabel = document.getElementById("siteLabel");
const tabStateLabel = document.getElementById("tabStateLabel");
const statusEl = document.getElementById("status");
const apiKeyMaskEl = document.getElementById("apiKeyMask");
const alwaysTranslateCheckbox = document.getElementById("alwaysTranslate");
const pauseResumeBtn = document.getElementById("pauseResumeBtn");
const translateNowBtn = document.getElementById("translateNowBtn");
const restoreBtn = document.getElementById("restoreBtn");
const openOptionsBtn = document.getElementById("openOptionsBtn");

let currentTabId = null;
let currentTabUrl = "";
let currentHostname = "";
let activeRuleHostname = "";
let tabSupported = false;
let runtimeState = {
  available: false,
  siteEnabled: false,
  paused: false,
  restorableCount: 0
};

initPopup().catch((error) => {
  setStatus(`初始化失败: ${error.message}`);
});

alwaysTranslateCheckbox.addEventListener("change", async () => {
  if (!currentHostname || currentTabId === null) {
    return;
  }

  const enabled = alwaysTranslateCheckbox.checked;
  alwaysTranslateCheckbox.disabled = true;

  const targetHostname = enabled
    ? currentHostname
    : activeRuleHostname || currentHostname;

  const saveResult = await sendRuntimeMessage({
    type: "setSiteSetting",
    hostname: targetHostname,
    enabled,
    tabId: currentTabId,
    tabUrl: currentTabUrl
  });

  if (!saveResult?.ok) {
    alwaysTranslateCheckbox.checked = !enabled;
    alwaysTranslateCheckbox.disabled = false;
    setStatus(saveResult?.error || "保存失败");
    return;
  }

  activeRuleHostname = enabled ? targetHostname : "";
  alwaysTranslateCheckbox.disabled = false;
  await refreshRuntimeState();

  if (saveResult.tabError) {
    setStatus(
      `${enabled ? "规则已开启" : "规则已关闭"}，但当前页同步失败：${saveResult.tabError}`
    );
    return;
  }

  if (saveResult.switchedToLocal) {
    setStatus(
      enabled
        ? "已开启自动翻译；规则已切换到本地存储（不同设备不再同步）"
        : "已关闭自动翻译；规则已切换到本地存储（不同设备不再同步）",
      true
    );
    return;
  }

  if (!enabled && saveResult.tabUpdated && !saveResult.restored && saveResult.reloaded) {
    setStatus("已关闭自动翻译，当前页已刷新恢复原文", true);
    return;
  }

  setStatus(enabled ? "已开启自动翻译" : "已关闭自动翻译，当前页已恢复原文", true);
});

pauseResumeBtn.addEventListener("click", async () => {
  if (currentTabId === null || !tabSupported) {
    return;
  }

  const nextPaused = !runtimeState.paused;
  const result = await sendRuntimeMessage({
    type: "setTabPaused",
    tabId: currentTabId,
    tabUrl: currentTabUrl,
    paused: nextPaused
  });

  if (!result?.ok) {
    setStatus(result?.error || "切换暂停状态失败");
    return;
  }

  await refreshRuntimeState();
  setStatus(runtimeState.paused ? "本页翻译已暂停" : "本页翻译已继续", true);
});

translateNowBtn.addEventListener("click", async () => {
  if (currentTabId === null || !tabSupported) {
    return;
  }

  if (!alwaysTranslateCheckbox.checked) {
    const oneShot = await sendRuntimeMessage({
      type: "oneShotTranslateNow",
      tabId: currentTabId,
      url: currentTabUrl
    });
    if (!oneShot?.ok) {
      setStatus(oneShot?.error || "本页一次性翻译触发失败");
      return;
    }
    await refreshRuntimeState();
    setStatus("已触发本页一次性翻译", true);
    return;
  }

  if (runtimeState.paused) {
    const resumeResult = await sendRuntimeMessage({
      type: "setTabPaused",
      tabId: currentTabId,
      tabUrl: currentTabUrl,
      paused: false
    });
    if (!resumeResult?.ok) {
      setStatus(resumeResult?.error || "恢复翻译失败");
      return;
    }
  }

  const triggerResult = await sendTabMessage(currentTabId, {
    type: "triggerTranslateNow"
  });

  if (!triggerResult?.ok) {
    setStatus(triggerResult?.error || "触发翻译失败");
    await refreshRuntimeState();
    return;
  }

  await refreshRuntimeState();
  setStatus("已触发当前可见区域翻译", true);
});

restoreBtn.addEventListener("click", async () => {
  if (currentTabId === null) {
    return;
  }

  const ensureResult = await ensureContentScriptReady(false);
  if (!ensureResult.ok) {
    const reloadResult = await reloadTab(currentTabId);
    if (!reloadResult?.ok) {
      setStatus(reloadResult?.error || "恢复原文失败");
      return;
    }
    setStatus("已刷新页面恢复原文", true);
    return;
  }

  const restoreResult = await sendTabMessage(currentTabId, {
    type: "restoreOriginalPage"
  });

  if (!restoreResult?.ok || !restoreResult.restored) {
    const reloadResult = await reloadTab(currentTabId);
    if (!reloadResult?.ok) {
      setStatus(restoreResult?.error || reloadResult?.error || "恢复原文失败");
      return;
    }
    setStatus("已刷新页面恢复原文", true);
    return;
  }

  await refreshRuntimeState();
  setStatus("已恢复当前页原文", true);
});

openOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

async function initPopup() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || typeof tab.id !== "number") {
    siteLabel.textContent = "无法获取当前标签页。";
    updateActionButtons();
    return;
  }

  currentTabId = tab.id;
  currentTabUrl = typeof tab.url === "string" ? tab.url : "";

  const url = safeParseUrl(currentTabUrl);
  if (!url || !/^https?:$/.test(url.protocol)) {
    siteLabel.textContent = "当前页面不支持翻译（仅支持 http/https）。";
    alwaysTranslateCheckbox.disabled = true;
    updateActionButtons();
    return;
  }

  tabSupported = true;
  currentHostname = normalizeHostname(url.hostname);
  if (!currentHostname) {
    siteLabel.textContent = "无法识别当前网站。";
    updateActionButtons();
    return;
  }

  siteLabel.textContent = `当前网站：${currentHostname}`;

  const [setting, keyInfo, tabState] = await Promise.all([
    sendRuntimeMessage({
      type: "getSiteSetting",
      hostname: currentHostname
    }),
    sendRuntimeMessage({
      type: "getApiKeyMask"
    }),
    sendRuntimeMessage({
      type: "getTabState",
      tabId: currentTabId
    })
  ]);

  if (!setting?.ok) {
    setStatus(setting?.error || "读取网站设置失败");
  } else {
    alwaysTranslateCheckbox.checked = Boolean(setting.enabled);
    activeRuleHostname = setting.enabled
      ? setting.matchedHost || currentHostname
      : "";
    alwaysTranslateCheckbox.disabled = false;
  }

  if (keyInfo?.ok) {
    apiKeyMaskEl.textContent = keyInfo.hasKey
      ? keyInfo.keyMask || "已配置"
      : "未配置";
  } else {
    apiKeyMaskEl.textContent = "读取失败";
  }

  runtimeState.paused = Boolean(tabState?.ok && tabState.paused);
  await refreshRuntimeState();
}

async function refreshRuntimeState() {
  if (currentTabId === null) {
    runtimeState = {
      available: false,
      siteEnabled: false,
      paused: false,
      restorableCount: 0
    };
    updateActionButtons();
    return runtimeState;
  }

  const tabState = await sendRuntimeMessage({
    type: "getTabState",
    tabId: currentTabId
  });
  if (tabState?.ok) {
    runtimeState.paused = Boolean(tabState.paused);
  }

  const ensureResult = await ensureContentScriptReady(false);
  if (!ensureResult.ok) {
    runtimeState = {
      ...runtimeState,
      available: false,
      siteEnabled: false,
      restorableCount: 0
    };
    updateActionButtons();
    return runtimeState;
  }

  const stateResult = await sendTabMessage(currentTabId, {
    type: "getRuntimeState"
  });

  if (!stateResult?.ok) {
    runtimeState = {
      ...runtimeState,
      available: false,
      siteEnabled: false,
      restorableCount: 0
    };
    updateActionButtons();
    return runtimeState;
  }

  runtimeState = {
    available: true,
    siteEnabled: Boolean(stateResult.siteEnabled),
    paused: runtimeState.paused,
    restorableCount: Number(stateResult.restorableCount || 0)
  };

  updateActionButtons();
  return runtimeState;
}

function updateActionButtons() {
  const canUseTab = currentTabId !== null && tabSupported;
  const canControlTranslation = canUseTab;

  if (!canUseTab) {
    alwaysTranslateCheckbox.disabled = true;
  }
  pauseResumeBtn.disabled = !canControlTranslation;
  pauseResumeBtn.textContent = runtimeState.paused ? "本页继续" : "本页暂停";

  translateNowBtn.disabled = !canControlTranslation;
  restoreBtn.disabled = !canUseTab;

  if (!canUseTab) {
    tabStateLabel.textContent = "本页状态：不可用";
    return;
  }

  if (!alwaysTranslateCheckbox.checked) {
    if (runtimeState.paused) {
      tabStateLabel.textContent = "本页状态：已暂停";
      return;
    }
    if (runtimeState.available) {
      tabStateLabel.textContent = runtimeState.paused
        ? "本页状态：临时翻译已暂停"
        : "本页状态：临时翻译运行中";
      return;
    }
    tabStateLabel.textContent = "本页状态：未启用";
    return;
  }

  tabStateLabel.textContent = runtimeState.paused
    ? "本页状态：已暂停"
    : "本页状态：运行中";
}

async function ensureContentScriptReady(injectIfMissing) {
  if (currentTabId === null) {
    return { ok: false, error: "当前标签页不可用" };
  }

  const ping = await sendTabMessage(currentTabId, {
    type: "pingTranslator"
  });
  if (ping?.ok) {
    return { ok: true, injected: false };
  }

  if (!injectIfMissing) {
    return { ok: false, error: ping?.error || "当前页翻译脚本未注入" };
  }

  const injected = await sendRuntimeMessage({
    type: "ensureContentScriptForTab",
    tabId: currentTabId,
    url: currentTabUrl
  });

  if (!injected?.ok) {
    return {
      ok: false,
      error: injected?.error || "动态注入翻译脚本失败"
    };
  }

  return { ok: true, injected: Boolean(injected.injected) };
}

function setStatus(message, isOk = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("ok", Boolean(isOk));
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

function normalizeHostname(hostname) {
  if (!hostname || typeof hostname !== "string") {
    return "";
  }

  return hostname.trim().toLowerCase().replace(/^www\./, "");
}

function sendRuntimeMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response);
    });
  });
}

function sendTabMessage(tabId, message) {
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

function reloadTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.reload(tabId, {}, () => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve({ ok: true });
    });
  });
}
```

