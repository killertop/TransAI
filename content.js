(() => {
const CONTENT_SCRIPT_GUARD_KEY = "__LLM_TRANSLATE_CONTENT_SCRIPT_LOADED__";
if (globalThis[CONTENT_SCRIPT_GUARD_KEY]) {
  return;
}
globalThis[CONTENT_SCRIPT_GUARD_KEY] = true;

const VIEWPORT_MARGIN = 0;
const IDLE_PREFETCH_VIEWPORT_MARGIN = 420;
const MAX_BATCH_ITEMS = 40;
const MAX_BATCH_CHARS = 7200;
const MAX_PENDING_NODES = 500;
const MAX_PENDING_OVERLAY_BOOST = 160;
const MAX_RESTORE_NODE_TRACK = 1800;
const RESTORE_STALE_SWEEP_INTERVAL = 24;
const QUEUE_COALESCE_MS = 40;
const REQUEST_CANCEL_DEBOUNCE_MS = 120;
const SHORT_CONTEXT_MAX_CHARS = 20;
const CONTEXT_SNIPPET_MAX_CHARS = 64;
const SCAN_DEBOUNCE_MS = 160;
const SCAN_THROTTLE_MIN_MS = 200;
const SCAN_THROTTLE_MAX_MS = 400;
const SCROLL_IDLE_MS = 220;
const IDLE_PREFETCH_DELAY_MS = 180;
const HOVER_SCAN_DELAY_MS = 140;
const ADAPTIVE_BATCH_MIN_ITEMS = Math.max(8, Math.floor(MAX_BATCH_ITEMS * 0.5));
const ADAPTIVE_BATCH_MAX_ITEMS = MAX_BATCH_ITEMS + 16;
const ADAPTIVE_BATCH_MIN_CHARS = Math.max(1200, Math.floor(MAX_BATCH_CHARS * 0.7));
const ADAPTIVE_BATCH_MAX_CHARS = MAX_BATCH_CHARS + 3000;
const ADAPTIVE_BATCH_INITIAL_ITEMS = MAX_BATCH_ITEMS + 4;
const ADAPTIVE_BATCH_INITIAL_CHARS = MAX_BATCH_CHARS + 1200;
const PRIORITY_BATCH_MAX_ITEMS = Math.min(14, MAX_BATCH_ITEMS);
const PRIORITY_BATCH_MAX_CHARS = Math.max(2800, Math.floor(MAX_BATCH_CHARS * 1.35));
const READ_ORDER_VIEWPORT_BUFFER_PX = 48;
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
const TRANSLATABLE_HINT_ELEMENT_SELECTOR = [
  "input[placeholder]",
  "textarea[placeholder]",
  "input[aria-label]",
  "textarea[aria-label]",
  "input[title]",
  "textarea[title]",
  "[role='textbox'][aria-label]",
  "[role='textbox'][title]",
  "[contenteditable][aria-label]",
  "[contenteditable][title]"
].join(", ");
const TRANSLATABLE_ELEMENT_ATTRIBUTE_NAMES = ["placeholder", "aria-label", "title"];
const SESSION_CACHE_KEY = "__longcat_translate_cache_zh_hans_v3";
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
const BLOCK_OBSERVER_ROOT_MARGIN = "420px 0px 520px 0px";
const MAX_OBSERVED_BLOCKS = 2800;
const BLOCK_OBSERVE_BATCH_LIMIT = 420;
const BLOCK_CANDIDATE_REGISTER_CHUNK = 140;
const MAX_PENDING_BLOCK_CANDIDATES = MAX_OBSERVED_BLOCKS * 2;
const MAX_PENDING_ATTRIBUTE_TARGETS = 220;
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
const LONG_TEXT_MAX_CONCURRENT = 2;
const FAILED_CONTEXT_ANCESTOR_DEPTH = 3;
const FAILED_CONTEXT_CLASS_TOKENS = 2;
const MINORITY_FOREIGN_SNIPPET_MAX_CHARS = 64;
const MINORITY_FOREIGN_SNIPPET_MAX_WORDS = 6;
const MINORITY_FOREIGN_CONTEXT_ANCESTOR_DEPTH = 3;
const MINORITY_FOREIGN_CONTEXT_SAMPLE_CHARS = 560;
const MINORITY_FOREIGN_CONTEXT_MIN_CHINESE = 18;
const FOREIGN_NAME_CONNECTOR_WORDS = new Set([
  "al",
  "ap",
  "bin",
  "binti",
  "da",
  "de",
  "del",
  "der",
  "di",
  "dos",
  "du",
  "el",
  "ibn",
  "la",
  "le",
  "van",
  "von"
]);
const GENERIC_ENGLISH_UI_WORDS = new Set([
  "access",
  "account",
  "add",
  "admin",
  "apply",
  "approval",
  "button",
  "cancel",
  "close",
  "confirm",
  "continue",
  "create",
  "dashboard",
  "delete",
  "details",
  "docs",
  "download",
  "edit",
  "file",
  "help",
  "invite",
  "login",
  "logout",
  "menu",
  "message",
  "new",
  "next",
  "open",
  "permission",
  "previous",
  "profile",
  "read",
  "request",
  "review",
  "save",
  "search",
  "settings",
  "share",
  "sign",
  "status",
  "submit",
  "sync",
  "team",
  "upload",
  "view",
  "workspace"
]);
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
const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "date",
  "datetime-local",
  "file",
  "hidden",
  "image",
  "month",
  "radio",
  "range",
  "reset",
  "submit",
  "time",
  "week"
]);
const RECOMMENDED_SPEED_PROFILE = Object.freeze({
  id: "recommended",
  label: "推荐",
  maxConcurrentRequests: 4,
  scanDebounceMs: SCAN_DEBOUNCE_MS,
  scrollIdleMs: SCROLL_IDLE_MS,
  hoverScanDelayMs: HOVER_SCAN_DELAY_MS,
  adaptiveItemOffset: 0,
  adaptiveCharOffset: 0
});
const DEFAULT_RUNTIME_PERFORMANCE_SETTINGS = Object.freeze({
  speedMode: "recommended",
  contentMaxConcurrentRequests: RECOMMENDED_SPEED_PROFILE.maxConcurrentRequests,
  longTextMaxConcurrent: LONG_TEXT_MAX_CONCURRENT,
  contentAdaptiveItemOffset: RECOMMENDED_SPEED_PROFILE.adaptiveItemOffset || 0,
  contentAdaptiveCharOffset: RECOMMENDED_SPEED_PROFILE.adaptiveCharOffset || 0
});

let siteEnabled = false;
let tabPaused = false;
let mutationObserver = null;
let listenersBound = false;
let isApplyingTranslation = false;
let persistCacheTimer = null;
let scrollIdleTimer = null;
let idlePrefetchTimer = null;
let hoverScanTimer = null;
let queuePumpTimer = null;
let cancelRequestTimer = null;
let retryScanTimer = null;
let retryScanAt = 0;
let isScrolling = false;
let runtimeContextInvalidated = false;
let queueSerial = 0;
let pageLanguageHint = "";
let pageAutoTranslateEligible = true;
let adaptiveBatchItemLimit = ADAPTIVE_BATCH_INITIAL_ITEMS;
let adaptiveBatchCharLimit = ADAPTIVE_BATCH_INITIAL_CHARS;
let currentSpeedProfile = RECOMMENDED_SPEED_PROFILE;
let activeWorkerCount = 0;
let activeLongTextWorkerCount = 0;
let currentLongTextMaxConcurrent = LONG_TEXT_MAX_CONCURRENT;
let idlePrefetchPassRequested = false;
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
const pendingLongTextNodes = new Set();
const pendingAttributeTargets = new Set();
let translatedNodeMarks = new WeakSet();
let translatedAttributeMarks = new WeakSet();
const restorableNodes = new Map();
const restorableAttributeTargets = new Map();
const nodeStates = new WeakMap();
const attributeTargetStates = new WeakMap();
const elementAttributeTargetRegistry = new WeakMap();
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
      pageLanguageHint = detectPageLanguageHint();
      pageAutoTranslateEligible = shouldAutoTranslateCurrentPage();
      if (pageAutoTranslateEligible) {
        enableTranslation();
      } else {
        disableTranslation();
      }
    } else {
      disableTranslation();
    }
    sendResponse({
      ok: true,
      enabled: siteEnabled,
      skipped: Boolean(message.enabled && !pageAutoTranslateEligible)
    });
    return false;
  }

  if (message.type === "performanceSettingsChanged") {
    applyRuntimePerformanceSettings(message.settings);
    sendResponse({ ok: true });
    return false;
  }

  if (message.type === "triggerTranslateNow") {
    if (!pageAutoTranslateEligible) {
      sendResponse({ ok: false, error: "当前页面识别为简体中文，自动跳过翻译" });
      return false;
    }
    if (!siteEnabled) {
      sendResponse({ ok: false, error: "自动翻译总开关未开启" });
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
    pageLanguageHint = detectPageLanguageHint();
    pageAutoTranslateEligible = shouldAutoTranslateCurrentPage();
    if (!pageAutoTranslateEligible) {
      sendResponse({ ok: false, error: "当前页面识别为简体中文，自动跳过翻译" });
      return false;
    }
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
      sendResponse({ ok: false, error: "自动翻译总开关未开启" });
      return false;
    }
    pauseTranslationForTab();
    sendResponse({ ok: true, paused: true });
    return false;
  }

  if (message.type === "resumeTranslationForTab") {
    if (!siteEnabled) {
      sendResponse({ ok: false, error: "自动翻译总开关未开启" });
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
      restorableCount: restorableNodes.size + restorableAttributeTargets.size,
      pendingCount: pendingNodes.size + pendingLongTextNodes.size + pendingAttributeTargets.size
    });
    return false;
  }

  return false;
});

async function bootstrap() {
  pageLanguageHint = detectPageLanguageHint();
  pageAutoTranslateEligible = shouldAutoTranslateCurrentPage();
  loadSessionCache();
  await loadRuntimePerformanceSettings();
  if (!document?.body || typeof document.body.children === "undefined") {
    return;
  }
  if (pageAutoTranslateEligible) {
    enableTranslation();
  }
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
  clearTimeout(idlePrefetchTimer);
  idlePrefetchTimer = null;
  idlePrefetchPassRequested = false;
  clearTimeout(hoverScanTimer);
  hoverScanTimer = null;
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
  activeLongTextWorkerCount = 0;
  dirtyRoots.clear();
  fullRescanNeeded = true;
  pendingNodes.clear();
  pendingLongTextNodes.clear();
  pendingAttributeTargets.clear();
  failedTranslationCache.clear();
  failedPhraseSweepSerial = 0;
  restoreOriginalTexts();
  restoreOriginalAttributes();

  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  if (listenersBound) {
    window.removeEventListener("scroll", onScrollActivity);
    window.removeEventListener("resize", onResizeViewport);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    document.removeEventListener("mouseover", onHoverCandidate, true);
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
  clearTimeout(idlePrefetchTimer);
  idlePrefetchTimer = null;
  idlePrefetchPassRequested = false;
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
  clearTimeout(idlePrefetchTimer);
  idlePrefetchTimer = null;
  idlePrefetchPassRequested = false;
  dirtyRoots.clear();
  visibleBlockRoots.clear();
  pendingBlockObserveRoots.clear();
  pendingBlockCandidates.length = 0;
  fullRescanNeeded = true;
  queueSerial = 0;
  failedTranslationCache.clear();
  const restoredText = restoreOriginalTexts();
  const restoredAttributes = restoreOriginalAttributes();
  return restoredText || restoredAttributes;
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

  for (const node of pendingLongTextNodes) {
    if (!node || !node.isConnected) {
      continue;
    }
    const state = nodeStates.get(node);
    if (!state) {
      continue;
    }
    nodeStates.set(node, {
      ...state,
      pending: false,
      longTextPending: false
    });
  }
  pendingLongTextNodes.clear();

  for (const target of pendingAttributeTargets) {
    if (!isElementAttributeTargetConnected(target)) {
      continue;
    }
    const state = attributeTargetStates.get(target);
    if (!state) {
      continue;
    }
    attributeTargetStates.set(target, {
      ...state,
      pending: false
    });
  }
  pendingAttributeTargets.clear();
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

      if (mutation.type === "attributes") {
        handleTrackedAttributeMutation(mutation);
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
        "placeholder",
        "aria-label",
        "title",
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

function applyRuntimePerformanceSettings(settings = null) {
  const runtimeSettings = normalizeRuntimePerformanceSettings(settings);
  currentSpeedProfile = {
    ...RECOMMENDED_SPEED_PROFILE,
    maxConcurrentRequests: runtimeSettings.contentMaxConcurrentRequests,
    adaptiveItemOffset: runtimeSettings.contentAdaptiveItemOffset,
    adaptiveCharOffset: runtimeSettings.contentAdaptiveCharOffset
  };
  currentLongTextMaxConcurrent = runtimeSettings.longTextMaxConcurrent;
  resetAdaptiveBatchLimits();
  if (siteEnabled) {
    fullRescanNeeded = true;
    scheduleScan(true);
  }
}

function normalizeRuntimePerformanceSettings(settings = null) {
  const raw = settings && typeof settings === "object" ? settings : {};
  const contentMaxConcurrentRequests = normalizeClampedRuntimeNumber(
    raw.contentMaxConcurrentRequests,
    1,
    4,
    DEFAULT_RUNTIME_PERFORMANCE_SETTINGS.contentMaxConcurrentRequests
  );
  const longTextMaxConcurrent = normalizeClampedRuntimeNumber(
    raw.longTextMaxConcurrent,
    1,
    2,
    DEFAULT_RUNTIME_PERFORMANCE_SETTINGS.longTextMaxConcurrent
  );
  const contentAdaptiveItemOffset = normalizeClampedRuntimeNumber(
    raw.contentAdaptiveItemOffset,
    -8,
    16,
    DEFAULT_RUNTIME_PERFORMANCE_SETTINGS.contentAdaptiveItemOffset
  );
  const contentAdaptiveCharOffset = normalizeClampedRuntimeNumber(
    raw.contentAdaptiveCharOffset,
    -1600,
    4000,
    DEFAULT_RUNTIME_PERFORMANCE_SETTINGS.contentAdaptiveCharOffset
  );

  return {
    speedMode:
      typeof raw.speedMode === "string" && raw.speedMode
        ? raw.speedMode
        : DEFAULT_RUNTIME_PERFORMANCE_SETTINGS.speedMode,
    contentMaxConcurrentRequests,
    longTextMaxConcurrent,
    contentAdaptiveItemOffset,
    contentAdaptiveCharOffset
  };
}

function normalizeClampedRuntimeNumber(value, min, max, fallback) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return clampNumber(numeric, min, max);
}

async function loadRuntimePerformanceSettings() {
  const response = await sendRuntimeMessage({
    type: "getPerformanceSettings"
  });
  if (!response?.ok) {
    applyRuntimePerformanceSettings(DEFAULT_RUNTIME_PERFORMANCE_SETTINGS);
    return;
  }
  applyRuntimePerformanceSettings(response.settings);
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
  pageAutoTranslateEligible = shouldAutoTranslateCurrentPage();
  if (!pageAutoTranslateEligible) {
    disableTranslation();
    return;
  }
  resetPageRuntimeState();
  queueObserveBlockCandidates(document.body || document.documentElement);
  scheduleCharacterObserverRefresh(true);
  scheduleScan(true);
}

function resetPageRuntimeState() {
  requestCancelPendingTranslations(true);
  clearTimeout(idlePrefetchTimer);
  idlePrefetchTimer = null;
  idlePrefetchPassRequested = false;
  pendingNodes.clear();
  pendingLongTextNodes.clear();
  pendingAttributeTargets.clear();
  dirtyRoots.clear();
  visibleBlockRoots.clear();
  observedBlockLru.clear();
  pendingBlockObserveRoots.clear();
  pendingBlockCandidates.length = 0;
  queueSerial = 0;
  fullRescanNeeded = true;
  activeWorkerCount = 0;
  activeLongTextWorkerCount = 0;
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
  translatedAttributeMarks = new WeakSet();
  restorableNodes.clear();
  restorableAttributeTargets.clear();
  failedTranslationCache.clear();
  failedPhraseSweepSerial = 0;
}

function onScrollActivity() {
  if (!siteEnabled || tabPaused) {
    return;
  }

  isScrolling = true;
  fullRescanNeeded = true;
  clearTimeout(idlePrefetchTimer);
  idlePrefetchTimer = null;
  idlePrefetchPassRequested = false;
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
    idlePrefetchPassRequested = false;
    return;
  }

  const allowIdlePrefetch = idlePrefetchPassRequested;
  idlePrefetchPassRequested = false;
  scanForceImmediate = false;
  lastScanAt = now();
  scanVisibleTextNodes(allowIdlePrefetch);
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

function scheduleIdlePrefetchScan() {
  if (
    !siteEnabled ||
    tabPaused ||
    document.hidden ||
    isScrolling ||
    pendingNodes.size > 0 ||
    pendingLongTextNodes.size > 0 ||
    activeWorkerCount > 0 ||
    activeLongTextWorkerCount > 0
  ) {
    return;
  }

  if (idlePrefetchTimer) {
    return;
  }

  idlePrefetchTimer = setTimeout(() => {
    idlePrefetchTimer = null;
    if (
      !siteEnabled ||
      tabPaused ||
      document.hidden ||
      isScrolling ||
      pendingNodes.size > 0 ||
      pendingLongTextNodes.size > 0 ||
      activeWorkerCount > 0 ||
      activeLongTextWorkerCount > 0
    ) {
      return;
    }

    idlePrefetchPassRequested = true;
    scheduleScan(true);
  }, IDLE_PREFETCH_DELAY_MS);
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

function scanVisibleTextNodes(allowIdlePrefetch = false) {
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
          return isEligibleTextNode(node, allowIdlePrefetch)
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

  scanVisibleElementAttributes(roots, allowIdlePrefetch);
  dirtyRoots.clear();
  fullRescanNeeded = false;

  if (pendingNodes.size > 0 || pendingAttributeTargets.size > 0) {
    processQueue();
  }
}

function scanVisibleElementAttributes(roots, allowIdlePrefetch = false) {
  if (!Array.isArray(roots) || !roots.length) {
    return;
  }

  const seenTargets = new Set();
  for (const root of roots) {
    const targets = collectElementAttributeTargets(root);
    for (const target of targets) {
      if (pendingAttributeTargets.size >= MAX_PENDING_ATTRIBUTE_TARGETS) {
        return;
      }

      if (!target || seenTargets.has(target)) {
        continue;
      }
      seenTargets.add(target);

      if (!isEligibleElementAttributeTarget(target, allowIdlePrefetch)) {
        continue;
      }

      const state = getElementAttributeState(target);
      if (!state || !state.coreText) {
        continue;
      }

      if (isSourceTextRetrySuppressed(state.coreText, state)) {
        continue;
      }

      if (state.translated && getElementAttributeTargetText(target) === state.translatedText) {
        continue;
      }

      if (isRetryCoolingDown(state)) {
        continue;
      }

      const cachedTranslation = getCachedTranslation(state.coreText, state);
      if (cachedTranslation) {
        applyTranslationToElementAttribute(target, state, cachedTranslation);
        continue;
      }

      if (!state.pending) {
        pendingAttributeTargets.add(target);
        attributeTargetStates.set(target, {
          ...state,
          pending: true,
          translated: false,
          queueOrder: queueSerial
        });
        queueSerial += 1;
      }
    }
  }
}

function collectElementAttributeTargets(root) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const targets = [];
  const seenElements = new Set();
  const pushElementTargets = (element) => {
    if (!element || seenElements.has(element)) {
      return;
    }
    seenElements.add(element);
    for (const attributeName of getTranslatableElementAttributeNames(element)) {
      const target = getOrCreateElementAttributeTarget(element, attributeName);
      if (target) {
        targets.push(target);
      }
    }
  };

  pushElementTargets(root);

  if (typeof root.querySelectorAll !== "function") {
    return targets;
  }

  try {
    const descendants = root.querySelectorAll(TRANSLATABLE_HINT_ELEMENT_SELECTOR);
    for (const element of descendants) {
      pushElementTargets(element);
    }
  } catch (_error) {
    // 忽略选择器查询异常，继续已有目标。
  }

  return targets;
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

function handleTrackedAttributeMutation(mutation) {
  if (!mutation || mutation.type !== "attributes") {
    return;
  }

  const attributeName = String(mutation.attributeName || "");
  if (!isTranslatableElementAttributeName(attributeName)) {
    return;
  }

  const element = getElementFromNode(mutation.target);
  if (!element) {
    return;
  }

  const target = getExistingElementAttributeTarget(element, attributeName);
  if (!target) {
    return;
  }

  const state = attributeTargetStates.get(target);
  if (!state) {
    return;
  }

  const currentValue = getElementAttributeTargetText(target);
  if (
    (state.translated || translatedAttributeMarks.has(target)) &&
    currentValue !== state.translatedText
  ) {
    pendingAttributeTargets.delete(target);
    attributeTargetStates.delete(target);
    removeAttributeTranslationTracking(target);
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

  if (isTranslatableElementAttributeName(attributeName) && isTranslatableHintElement(target)) {
    if (isLikelyOverlayElement(target)) {
      return isElementNearViewport(target, { ignoreVisualState: true });
    }
    return isElementNearViewport(target);
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

function isTranslatableElementAttributeName(attributeName) {
  return TRANSLATABLE_ELEMENT_ATTRIBUTE_NAMES.includes(String(attributeName || ""));
}

function isTextInputLikeElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  const tagName = String(element.tagName || "").toUpperCase();
  if (tagName === "TEXTAREA") {
    return true;
  }
  if (tagName !== "INPUT") {
    return false;
  }

  const inputType = String(element.getAttribute?.("type") || element.type || "")
    .trim()
    .toLowerCase();
  return !NON_TEXT_INPUT_TYPES.has(inputType);
}

function isTranslatableHintElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  if (isTextInputLikeElement(element)) {
    return true;
  }

  const role = String(element.getAttribute?.("role") || "").trim().toLowerCase();
  if (role === "textbox") {
    return true;
  }

  return element.hasAttribute?.("contenteditable") || false;
}

function getTranslatableElementAttributeNames(element) {
  if (!isTranslatableHintElement(element)) {
    return [];
  }

  return TRANSLATABLE_ELEMENT_ATTRIBUTE_NAMES.filter((attributeName) => {
    const value = String(element.getAttribute?.(attributeName) || "");
    return Boolean(value.trim());
  });
}

function getExistingElementAttributeTarget(element, attributeName) {
  const registry = elementAttributeTargetRegistry.get(element);
  if (!registry) {
    return null;
  }
  return registry.get(attributeName) || null;
}

function getOrCreateElementAttributeTarget(element, attributeName) {
  if (!element || !attributeName) {
    return null;
  }

  let registry = elementAttributeTargetRegistry.get(element);
  if (!registry) {
    registry = new Map();
    elementAttributeTargetRegistry.set(element, registry);
  }

  const normalizedName = String(attributeName);
  let target = registry.get(normalizedName);
  if (!target) {
    target = {
      kind: "attribute",
      element,
      attributeName: normalizedName
    };
    registry.set(normalizedName, target);
  }

  return target;
}

function isElementAttributeTargetConnected(target) {
  return Boolean(target?.element?.isConnected);
}

function getElementAttributeTargetText(target) {
  if (!target?.element || !target.attributeName) {
    return "";
  }
  return String(target.element.getAttribute?.(target.attributeName) || "");
}

function setElementAttributeTargetText(target, value) {
  if (!target?.element || !target.attributeName) {
    return;
  }
  target.element.setAttribute(target.attributeName, String(value ?? ""));
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

function isEligibleTextNode(node, allowIdlePrefetch = false) {
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

  if (shouldSkipMinorityForeignSnippet(coreText, parent)) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/.test(coreText)) {
    return false;
  }

  const viewportMargin = allowIdlePrefetch ? IDLE_PREFETCH_VIEWPORT_MARGIN : VIEWPORT_MARGIN;
  const nearViewport = isLikelyOverlayElement(parent)
    ? isElementNearViewport(parent, {
        ignoreVisualState: true,
        margin: viewportMargin
      })
    : isElementNearViewport(parent, { margin: viewportMargin });
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

function isEligibleElementAttributeTarget(target, allowIdlePrefetch = false) {
  if (!isElementAttributeTargetConnected(target)) {
    return false;
  }

  const element = target.element;
  if (!isTranslatableHintElement(element)) {
    return false;
  }

  const rawText = getElementAttributeTargetText(target);
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

  if (shouldSkipMinorityForeignSnippet(coreText, element)) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/.test(coreText)) {
    return false;
  }

  const viewportMargin = allowIdlePrefetch ? IDLE_PREFETCH_VIEWPORT_MARGIN : VIEWPORT_MARGIN;
  const nearViewport = isLikelyOverlayElement(element)
    ? isElementNearViewport(element, {
        ignoreVisualState: true,
        margin: viewportMargin
      })
    : isElementNearViewport(element, { margin: viewportMargin });
  if (!nearViewport) {
    return false;
  }

  const state = attributeTargetStates.get(target);
  const failedContextMeta = state || getFailedPhraseContextMeta(element);
  if (isSourceTextRetrySuppressed(coreText, failedContextMeta)) {
    return false;
  }

  if (state?.pending) {
    return false;
  }

  if (isRetryCoolingDown(state)) {
    return false;
  }

  if (state?.translated && rawText === state.translatedText) {
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

  const margin = Math.max(0, Number(options.margin ?? VIEWPORT_MARGIN) || 0);

  return (
    measure.bottom > -margin &&
    measure.top < window.innerHeight + margin &&
    measure.right > -margin &&
    measure.left < window.innerWidth + margin
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
  const importanceLane = computeImportanceLane(node.parentElement, split.coreText);
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
    viewportBottom: positionMeta.bottom,
    importanceLane
  };
}

function getElementAttributeState(target) {
  const rawText = getElementAttributeTargetText(target);
  if (!rawText) {
    return null;
  }

  const split = splitText(rawText);
  if (!split.coreText) {
    return null;
  }

  const previous = attributeTargetStates.get(target) || {};
  const failedContextMeta = getFailedPhraseContextMeta(target.element);
  const shouldResetRetryMeta =
    typeof previous.coreText === "string" &&
    (previous.coreText !== split.coreText ||
      previous.failedContextKey !== failedContextMeta.contextKey ||
      previous.failedLanguageKey !== failedContextMeta.languageKey);
  const positionMeta = computePositionMeta(target.element);
  const importanceLane = computeImportanceLane(target.element, split.coreText);
  return {
    ...previous,
    ...(shouldResetRetryMeta
      ? {
          rejectedCount: 0,
          retryAfterAt: 0,
          giveUp: false
        }
      : {}),
    originalText:
      shouldResetRetryMeta || typeof previous.originalText !== "string"
        ? rawText
        : previous.originalText,
    coreText: split.coreText,
    prefix: split.prefix,
    suffix: split.suffix,
    failedLanguageKey: failedContextMeta.languageKey,
    failedContextKey: failedContextMeta.contextKey,
    viewportTop: positionMeta.top,
    viewportLeft: positionMeta.left,
    viewportBottom: positionMeta.bottom,
    importanceLane,
    attributeName: target.attributeName
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

function hasNonEnglishScript(text) {
  return /[\u3040-\u30ff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff\u00c0-\u024f]/i.test(
    String(text || "")
  );
}

function isLikelyTargetChineseText(text) {
  return containsChineseChar(normalizeComparisonText(text));
}

function isAcceptableSameChineseLikeText(text) {
  return isLikelyTargetChineseText(text);
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

function isChineseDominantContextText(text) {
  if (!text) {
    return false;
  }

  if (shouldSkipChineseText(text)) {
    return true;
  }

  const chineseCount = countMatches(text, /[\u4e00-\u9fff]/g);
  if (chineseCount < MINORITY_FOREIGN_CONTEXT_MIN_CHINESE) {
    return false;
  }

  const foreignCount = countMatches(
    text,
    /[A-Za-z\u00C0-\u024F\u0400-\u04FF\u3040-\u30FF\uAC00-\uD7AF]/g
  );
  const foreignWords =
    String(text || "").match(/[A-Za-z\u00C0-\u024F]+(?:['’-][A-Za-z\u00C0-\u024F]+)*/g) || [];
  const chineseRatio = chineseCount / Math.max(1, text.length);
  return (
    (chineseRatio >= 0.28 && foreignCount < chineseCount * 0.45) ||
    chineseCount >= Math.max(MINORITY_FOREIGN_CONTEXT_MIN_CHINESE, foreignWords.length * 3)
  );
}

function extractLatinWords(text) {
  return String(text || "").match(/[A-Za-z\u00C0-\u024F]+(?:['’-][A-Za-z\u00C0-\u024F]+)*/g) || [];
}

function isUppercaseLatinWord(word) {
  return /^[A-Z\u00C0-\u00DE]{2,}[0-9]*$/.test(String(word || ""));
}

function isCapitalizedLatinWord(word) {
  return /^[A-Z\u00C0-\u00DE][a-z\u00DF-\u024F]+(?:['’-][A-Z\u00C0-\u00DE]?[a-z\u00DF-\u024F]+)*$/.test(
    String(word || "")
  );
}

function isMixedCaseBrandWord(word) {
  const value = String(word || "");
  if (!/[A-Za-z]/.test(value)) {
    return false;
  }
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  return hasUpper && hasLower && !isCapitalizedLatinWord(value) && /[A-Z].*[A-Z]|[a-z].*[A-Z]/.test(value);
}

function isForeignConnectorWord(word) {
  return FOREIGN_NAME_CONNECTOR_WORDS.has(String(word || "").toLowerCase());
}

function hasGenericEnglishUiWord(words) {
  return words.some((word) => GENERIC_ENGLISH_UI_WORDS.has(String(word || "").toLowerCase()));
}

function isLikelyForeignProperNounOrBrand(text) {
  const words = extractLatinWords(text);
  if (!words.length || words.length > MINORITY_FOREIGN_SNIPPET_MAX_WORDS) {
    return false;
  }

  if (hasGenericEnglishUiWord(words)) {
    return false;
  }

  const properWordCount = words.filter(
    (word) => isUppercaseLatinWord(word) || isCapitalizedLatinWord(word) || isMixedCaseBrandWord(word)
  ).length;

  if (words.length === 1) {
    const [word] = words;
    return (
      String(word).length >= 3 &&
      (isUppercaseLatinWord(word) || isCapitalizedLatinWord(word) || isMixedCaseBrandWord(word))
    );
  }

  for (const word of words) {
    if (
      isUppercaseLatinWord(word) ||
      isCapitalizedLatinWord(word) ||
      isMixedCaseBrandWord(word) ||
      isForeignConnectorWord(word)
    ) {
      continue;
    }
    return false;
  }

  return properWordCount >= 2;
}

function isLikelyMinorityForeignSnippet(text) {
  const normalized = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return false;
  }

  if (normalized.length > MINORITY_FOREIGN_SNIPPET_MAX_CHARS) {
    return false;
  }

  if (containsChineseChar(normalized)) {
    return false;
  }

  if (!/[A-Za-z\u00C0-\u024F]/.test(normalized)) {
    return false;
  }

  if (/[.!?。！？]/.test(normalized)) {
    return false;
  }

  const words = extractLatinWords(normalized);
  if (!words.length || words.length > MINORITY_FOREIGN_SNIPPET_MAX_WORDS) {
    return false;
  }

  return isLikelyForeignProperNounOrBrand(normalized);
}

function shouldSkipMinorityForeignSnippet(text, element) {
  if (!isLikelyMinorityForeignSnippet(text)) {
    return false;
  }

  let cursor = element;
  for (
    let depth = 0;
    cursor && depth < MINORITY_FOREIGN_CONTEXT_ANCESTOR_DEPTH;
    depth += 1, cursor = cursor.parentElement
  ) {
    const sample = getElementTextSample(cursor, MINORITY_FOREIGN_CONTEXT_SAMPLE_CHARS);
    if (isChineseDominantContextText(sample)) {
      return true;
    }
  }

  const pageSample = getElementTextSample(
    document.body || document.documentElement,
    MINORITY_FOREIGN_CONTEXT_SAMPLE_CHARS
  );
  return isChineseDominantContextText(pageSample);
}

function detectChineseScriptMode(text) {
  const sourceText = String(text || "");
  if (!sourceText) {
    return "unknown";
  }

  const simplifiedMarkers = countMatches(
    sourceText,
    /[边并从点东发关广国还话机级际键两们面气让时书术台万网为显现样阅云预总转这众]/g
  );
  const traditionalMarkers = countMatches(
    sourceText,
    /[邊並從點東發關廣國還話機級際鍵兩們麵氣讓時書術臺萬網為顯現樣閱雲預總轉這眾]/g
  );

  if (traditionalMarkers >= 2 && traditionalMarkers >= simplifiedMarkers + 1) {
    return "traditional";
  }
  if (simplifiedMarkers >= 2 && simplifiedMarkers >= traditionalMarkers + 1) {
    return "simplified";
  }
  return "unknown";
}

function isSimplifiedChineseLanguageHint(languageHint) {
  const normalized = sanitizeLanguageHint(languageHint);
  return (
    normalized === "zh-cn" ||
    normalized === "zh-hans" ||
    normalized === "zh-sg" ||
    normalized === "zh-my"
  );
}

function isTraditionalChineseLanguageHint(languageHint) {
  const normalized = sanitizeLanguageHint(languageHint);
  return (
    normalized === "zh-tw" ||
    normalized === "zh-hk" ||
    normalized === "zh-mo" ||
    normalized === "zh-hant"
  );
}

function shouldAutoTranslateCurrentPage() {
  if (isTraditionalChineseLanguageHint(pageLanguageHint)) {
    return true;
  }

  if (isSimplifiedChineseLanguageHint(pageLanguageHint)) {
    return false;
  }

  const sampleRoot = document.body || document.documentElement;
  const sample = getElementTextSample(sampleRoot, BLOCK_SAMPLE_TEXT_CHARS);
  if (!shouldSkipChineseText(sample)) {
    return true;
  }

  return detectChineseScriptMode(sample) === "traditional";
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
      left: Number.MAX_SAFE_INTEGER,
      bottom: Number.MIN_SAFE_INTEGER
    };
  }

  const measure = getElementMeasure(element);
  return {
    top: measure.top,
    left: measure.left,
    bottom: measure.bottom
  };
}

function computeImportanceLane(element, coreText) {
  if (!element) {
    return 3;
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

  if (!immediate && activeWorkerCount === 0 && activeLongTextWorkerCount === 0) {
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

  while (
    activeWorkerCount < maxConcurrent &&
    (pendingNodes.size > 0 || pendingAttributeTargets.size > 0)
  ) {
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
        if (
          siteEnabled &&
          (pendingNodes.size > 0 ||
            pendingAttributeTargets.size > 0 ||
            pendingLongTextNodes.size > 0)
        ) {
          scheduleScan();
        } else {
          scheduleIdlePrefetchScan();
        }
      });
  }

  while (
    activeLongTextWorkerCount < currentLongTextMaxConcurrent &&
    pendingLongTextNodes.size > 0
  ) {
    activeLongTextWorkerCount += 1;
    runLongTextWorker()
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
        console.warn("[LongCat Translate] 长文本翻译异常", errorText || error);
      })
      .finally(() => {
        activeLongTextWorkerCount = Math.max(0, activeLongTextWorkerCount - 1);
        if (
          siteEnabled &&
          (pendingNodes.size > 0 ||
            pendingAttributeTargets.size > 0 ||
            pendingLongTextNodes.size > 0)
        ) {
          scheduleScan();
        } else {
          scheduleIdlePrefetchScan();
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

    const { batchCandidates, batchEntries, totalChars, batchLimits } = batchPlan;

    const requestStartedAt = now();
    const response = await sendRuntimeMessage({
      type: "translateBatch",
      entries: batchEntries,
      texts: batchEntries.map((entry) => entry.text),
      languageHint: pageLanguageHint
    });
    const elapsedMs = now() - requestStartedAt;

    if (!response?.ok) {
      requeueBatchCandidates(batchCandidates);
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
      requeueBatchCandidates(batchCandidates);
      return;
    }

    if (translations.length !== batchCandidates.length) {
      requeueBatchCandidates(batchCandidates);
      lowerAdaptiveBatchLimits();
      throw new Error("翻译返回数量与请求不一致");
    }

    tuneAdaptiveBatchLimits(elapsedMs, batchLimits.priorityMode, batchCandidates.length, totalChars);

    if (isScrolling) {
      await waitForScrollIdle();
      if (!siteEnabled || tabPaused || isScrolling) {
        requeueBatchCandidates(batchCandidates);
        return;
      }
    }

    for (let index = 0; index < batchCandidates.length; index += 1) {
      const candidate = batchCandidates[index];
      const target = candidate?.target;
      if (
        !candidate ||
        !target ||
        (candidate.kind === "text" && !target.isConnected) ||
        (candidate.kind === "attribute" && !isElementAttributeTargetConnected(target))
      ) {
        continue;
      }

      const state =
        candidate.kind === "text"
          ? nodeStates.get(target)
          : attributeTargetStates.get(target);
      if (!state) {
        continue;
      }

      const translatedCore = String(translations[index] ?? "").trim();
      if (!isAcceptableTranslatedResult(state.coreText, translatedCore)) {
        if (candidate.kind === "text") {
          markNodeTranslationRejected(target, state);
        } else {
          markElementAttributeTranslationRejected(target, state);
        }
        continue;
      }

      rememberTranslation(state.coreText, translatedCore, state);
      if (candidate.kind === "text") {
        applyTranslationToNode(target, state, translatedCore);
      } else {
        applyTranslationToElementAttribute(target, state, translatedCore);
      }
    }

    await sleep(12);
    if (pendingNodes.size <= 0 && pendingAttributeTargets.size <= 0) {
      return;
    }
  }
}

async function runLongTextWorker() {
  while (siteEnabled && !tabPaused && !document.hidden) {
    if (isScrolling) {
      await waitForScrollIdle();
      if (!siteEnabled || tabPaused || isScrolling) {
        return;
      }
    }

    const candidate = pickNextLongTextCandidate();
    if (!candidate) {
      return;
    }

    const { node, state } = candidate;
    try {
      const translatedLong = await translateLongText(
        state.coreText,
        Math.max(1200, adaptiveBatchCharLimit - 200)
      );
      if (!node.isConnected) {
        continue;
      }

      const latestState = nodeStates.get(node);
      if (!latestState || !latestState.coreText) {
        continue;
      }

      if (!isAcceptableTranslatedResult(latestState.coreText, translatedLong)) {
        markNodeTranslationRejected(node, latestState);
        continue;
      }

      rememberTranslation(latestState.coreText, translatedLong, latestState);
      applyTranslationToNode(node, latestState, translatedLong);
    } catch (error) {
      if (node?.isConnected) {
        pendingLongTextNodes.add(node);
        const latestState = nodeStates.get(node) || state;
        nodeStates.set(node, {
          ...latestState,
          pending: true,
          longTextPending: true,
          queueOrder:
            typeof latestState.queueOrder === "number"
              ? latestState.queueOrder
              : queueSerial++
        });
      }
      throw error;
    }

    await sleep(12);
    if (pendingLongTextNodes.size <= 0) {
      return;
    }
  }
}

async function buildBatchPlan() {
  startMeasureEpoch();
  const batchCandidates = [];
  const batchEntries = [];
  let totalChars = 0;

  const orderedCandidates = collectOrderedPendingCandidates();
  if (!orderedCandidates.length) {
    return null;
  }

  const batchLimits = pickBatchLimits(orderedCandidates);

  for (const candidate of orderedCandidates) {
    if (batchCandidates.length >= batchLimits.maxItems) {
      break;
    }

    const { kind, target, state } = candidate;

    if (!state.coreText) {
      if (kind === "text") {
        pendingNodes.delete(target);
        nodeStates.delete(target);
        removeTranslationTracking(target);
      } else {
        pendingAttributeTargets.delete(target);
        attributeTargetStates.delete(target);
        removeAttributeTranslationTracking(target);
      }
      continue;
    }

    const failedPhraseState = getFailedPhraseState(state.coreText, state);
    if (failedPhraseState) {
      const nextState = {
        ...state,
        pending: false,
        translated: false,
        translatedText: "",
        rejectedCount: Math.max(Number(state.rejectedCount || 0), Number(failedPhraseState.count || 0)),
        retryAfterAt: Number(failedPhraseState.retryAfterAt || 0),
        giveUp: Boolean(failedPhraseState.giveUp)
      };
      if (kind === "text") {
        pendingNodes.delete(target);
        nodeStates.set(target, nextState);
        removeTranslationTracking(target);
      } else {
        pendingAttributeTargets.delete(target);
        attributeTargetStates.set(target, nextState);
        removeAttributeTranslationTracking(target);
      }
      continue;
    }

    const cachedTranslation = getCachedTranslation(state.coreText, state);
    if (cachedTranslation) {
      if (kind === "text") {
        pendingNodes.delete(target);
        applyTranslationToNode(target, state, cachedTranslation);
      } else {
        pendingAttributeTargets.delete(target);
        applyTranslationToElementAttribute(target, state, cachedTranslation);
      }
      continue;
    }

    const requestEntry =
      kind === "text"
        ? buildTranslationRequestEntry(target, state)
        : { text: state.coreText };

    if (kind === "text" && requestEntry.text.length > batchLimits.maxChars) {
      pendingNodes.delete(target);
      enqueueLongTextNode(target, state);
      continue;
    }

    if (
      batchCandidates.length > 0 &&
      totalChars + requestEntry.text.length > batchLimits.maxChars
    ) {
      break;
    }

    if (kind === "text") {
      pendingNodes.delete(target);
    } else {
      pendingAttributeTargets.delete(target);
    }
    batchCandidates.push(candidate);
    batchEntries.push(requestEntry);
    totalChars += requestEntry.text.length;
  }

  if (!batchCandidates.length) {
    return null;
  }

  return {
    batchCandidates,
    batchEntries,
    totalChars,
    batchLimits
  };
}

function enqueueLongTextNode(node, state) {
  if (!node || !state || !node.isConnected) {
    return;
  }

  pendingLongTextNodes.add(node);
  nodeStates.set(node, {
    ...state,
    pending: true,
    longTextPending: true,
    queueOrder:
      typeof state.queueOrder === "number" ? state.queueOrder : queueSerial++
  });
}

function pickNextLongTextCandidate() {
  let bestNode = null;
  let bestState = null;

  for (const node of pendingLongTextNodes) {
    const state = nodeStates.get(node);
    if (!state || !state.pending || !state.longTextPending || !node.isConnected) {
      pendingLongTextNodes.delete(node);
      if (!node?.isConnected) {
        nodeStates.delete(node);
        removeTranslationTracking(node);
      }
      continue;
    }

    const refreshed = getNodeState(node);
    if (!refreshed || !refreshed.coreText) {
      pendingLongTextNodes.delete(node);
      nodeStates.delete(node);
      removeTranslationTracking(node);
      continue;
    }

    const mergedState = {
      ...state,
      ...refreshed,
      pending: true,
      longTextPending: true,
      queueOrder: state.queueOrder
    };
    nodeStates.set(node, mergedState);

    const failedPhraseState = getFailedPhraseState(mergedState.coreText, mergedState);
    if (failedPhraseState) {
      pendingLongTextNodes.delete(node);
      nodeStates.set(node, {
        ...mergedState,
        pending: false,
        longTextPending: false,
        translated: false,
        translatedText: "",
        rejectedCount: Math.max(
          Number(mergedState.rejectedCount || 0),
          Number(failedPhraseState.count || 0)
        ),
        retryAfterAt: Number(failedPhraseState.retryAfterAt || 0),
        giveUp: Boolean(failedPhraseState.giveUp)
      });
      removeTranslationTracking(node);
      continue;
    }

    const cachedTranslation = getCachedTranslation(mergedState.coreText, mergedState);
    if (cachedTranslation) {
      pendingLongTextNodes.delete(node);
      applyTranslationToNode(node, mergedState, cachedTranslation);
      continue;
    }

    if (!bestState || compareCandidatePriority(mergedState, bestState) < 0) {
      bestNode = node;
      bestState = mergedState;
    }
  }

  if (!bestNode || !bestState) {
    return null;
  }

  pendingLongTextNodes.delete(bestNode);
  return {
    node: bestNode,
    state: bestState
  };
}

function compareCandidatePriority(leftState, rightState) {
  const leftBucket = resolveReadOrderBucket(leftState);
  const rightBucket = resolveReadOrderBucket(rightState);
  if (leftBucket !== rightBucket) {
    return leftBucket - rightBucket;
  }

  const leftTop = normalizeViewportCoord(leftState.viewportTop);
  const rightTop = normalizeViewportCoord(rightState.viewportTop);
  if (leftTop !== rightTop) {
    return leftTop - rightTop;
  }

  const leftLeft = normalizeViewportCoord(leftState.viewportLeft);
  const rightLeft = normalizeViewportCoord(rightState.viewportLeft);
  if (leftLeft !== rightLeft) {
    return leftLeft - rightLeft;
  }

  const leftLane = leftState.importanceLane ?? 3;
  const rightLane = rightState.importanceLane ?? 3;
  if (leftLane !== rightLane) {
    return leftLane - rightLane;
  }

  const leftOrder = leftState.queueOrder ?? 0;
  const rightOrder = rightState.queueOrder ?? 0;
  return leftOrder - rightOrder;
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

function requeueBatchCandidates(batchCandidates) {
  if (!Array.isArray(batchCandidates)) {
    return;
  }

  for (const candidate of batchCandidates) {
    const target = candidate?.target;
    if (!candidate || !target) {
      continue;
    }

    if (candidate.kind === "text") {
      if (!target.isConnected) {
        continue;
      }

      const state = nodeStates.get(target);
      if (!state) {
        continue;
      }

      pendingNodes.add(target);
      nodeStates.set(target, {
        ...state,
        pending: true,
        longTextPending: false,
        queueOrder: typeof state.queueOrder === "number" ? state.queueOrder : queueSerial++
      });
      continue;
    }

    if (!isElementAttributeTargetConnected(target)) {
      continue;
    }

    const state = attributeTargetStates.get(target);
    if (!state) {
      continue;
    }

    pendingAttributeTargets.add(target);
    attributeTargetStates.set(target, {
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

function isAcceptableTranslatedResult(sourceText, translatedText) {
  const normalizedSource = normalizeComparisonText(sourceText);
  const normalizedTranslated = normalizeComparisonText(translatedText);

  if (!normalizedTranslated) {
    return false;
  }

  if (!normalizedSource) {
    return true;
  }

  const sourceLooksChinese = isLikelyTargetChineseText(normalizedSource);
  if (normalizedSource === normalizedTranslated) {
    return sourceLooksChinese || isAcceptableSameChineseLikeText(normalizedSource);
  }

  if (!containsChineseChar(normalizedTranslated) && !sourceLooksChinese) {
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
    longTextPending: false,
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

function markElementAttributeTranslationRejected(target, state) {
  if (!target || !state) {
    return;
  }

  pendingAttributeTargets.delete(target);
  const targetRejectedCount = Math.max(0, Number(state.rejectedCount || 0)) + 1;
  const phraseState = rememberFailedTranslationAttempt(state.coreText, state);
  const phraseRejectedCount = Number(phraseState?.count || 0);
  const rejectedCount = Math.max(targetRejectedCount, phraseRejectedCount);
  const giveUp =
    rejectedCount >= INVALID_TRANSLATION_MAX_REJECTS || Boolean(phraseState?.giveUp);
  const nowMs = Date.now();
  const retryAfterAt = giveUp
    ? Number.MAX_SAFE_INTEGER
    : Math.max(
        nowMs + INVALID_TRANSLATION_RETRY_MIN_MS,
        Number(phraseState?.retryAfterAt || 0)
      );
  attributeTargetStates.set(target, {
    ...state,
    pending: false,
    translated: false,
    translatedText: "",
    rejectedCount,
    retryAfterAt,
    giveUp
  });
  removeAttributeTranslationTracking(target);
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
    longTextPending: false,
    translatedText: finalText,
    rejectedCount: 0,
    retryAfterAt: 0,
    giveUp: false
  });
  translatedNodeMarks.add(node);
  touchRestorableNode(node);
}

function applyTranslationToElementAttribute(target, state, translatedCore) {
  if (!target || !state || !isElementAttributeTargetConnected(target)) {
    return;
  }

  clearFailedPhraseState(state.coreText, state);
  const finalText = `${state.prefix || ""}${translatedCore}${state.suffix || ""}`;

  isApplyingTranslation = true;
  setElementAttributeTargetText(target, finalText);
  isApplyingTranslation = false;

  attributeTargetStates.set(target, {
    ...state,
    translated: true,
    pending: false,
    translatedText: finalText,
    rejectedCount: 0,
    retryAfterAt: 0,
    giveUp: false
  });
  translatedAttributeMarks.add(target);
  touchRestorableAttributeTarget(target);
}

function collectOrderedPendingCandidates() {
  const ordered = [
    ...collectOrderedPendingTextCandidates(),
    ...collectOrderedPendingAttributeCandidates()
  ];

  ordered.sort((left, right) => {
    const leftBucket = resolveReadOrderBucket(left.state);
    const rightBucket = resolveReadOrderBucket(right.state);
    if (leftBucket !== rightBucket) {
      return leftBucket - rightBucket;
    }

    const leftTop = normalizeViewportCoord(left.state.viewportTop);
    const rightTop = normalizeViewportCoord(right.state.viewportTop);
    if (leftTop !== rightTop) {
      return leftTop - rightTop;
    }

    const leftLeft = normalizeViewportCoord(left.state.viewportLeft);
    const rightLeft = normalizeViewportCoord(right.state.viewportLeft);
    if (leftLeft !== rightLeft) {
      return leftLeft - rightLeft;
    }

    const leftLane = left.state.importanceLane ?? 3;
    const rightLane = right.state.importanceLane ?? 3;
    if (leftLane !== rightLane) {
      return leftLane - rightLane;
    }

    const leftOrder = left.state.queueOrder ?? 0;
    const rightOrder = right.state.queueOrder ?? 0;
    return leftOrder - rightOrder;
  });

  return ordered;
}

function collectOrderedPendingTextCandidates() {
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
      longTextPending: false,
      queueOrder: state.queueOrder
    };
    nodeStates.set(node, mergedState);
    ordered.push({
      kind: "text",
      target: node,
      state: mergedState
    });
  }

  return ordered;
}

function collectOrderedPendingAttributeCandidates() {
  const ordered = [];

  for (const target of pendingAttributeTargets) {
    const state = attributeTargetStates.get(target);
    if (!state || !state.pending || !isElementAttributeTargetConnected(target)) {
      pendingAttributeTargets.delete(target);
      if (!isElementAttributeTargetConnected(target)) {
        attributeTargetStates.delete(target);
        removeAttributeTranslationTracking(target);
      }
      continue;
    }

    const refreshed = getElementAttributeState(target);
    if (!refreshed || !refreshed.coreText) {
      pendingAttributeTargets.delete(target);
      attributeTargetStates.delete(target);
      removeAttributeTranslationTracking(target);
      continue;
    }

    const mergedState = {
      ...state,
      ...refreshed,
      pending: true,
      queueOrder: state.queueOrder
    };
    attributeTargetStates.set(target, mergedState);
    ordered.push({
      kind: "attribute",
      target,
      state: mergedState
    });
  }

  return ordered;
}

function resolveReadOrderBucket(state) {
  if (!state || typeof window === "undefined") {
    return 3;
  }

  const top = normalizeViewportCoord(state.viewportTop);
  const bottom = Number.isFinite(state.viewportBottom)
    ? state.viewportBottom
    : Number.MIN_SAFE_INTEGER;
  const viewportTop = -READ_ORDER_VIEWPORT_BUFFER_PX;
  const viewportBottom = window.innerHeight + READ_ORDER_VIEWPORT_BUFFER_PX;

  if (bottom >= viewportTop && top <= viewportBottom) {
    return 0;
  }
  if (top > viewportBottom) {
    return 1;
  }
  return 2;
}

function normalizeViewportCoord(value) {
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
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

function touchRestorableAttributeTarget(target) {
  if (!target) {
    return;
  }

  if (restorableAttributeTargets.has(target)) {
    restorableAttributeTargets.delete(target);
  }
  restorableAttributeTargets.set(target, Date.now());
  trimRestorableAttributeTargets();
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

  for (const target of pendingAttributeTargets) {
    if (!isElementAttributeTargetConnected(target)) {
      pendingAttributeTargets.delete(target);
      attributeTargetStates.delete(target);
      removeAttributeTranslationTracking(target);
    }
  }

  for (const target of restorableAttributeTargets.keys()) {
    if (!isElementAttributeTargetConnected(target)) {
      restorableAttributeTargets.delete(target);
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

function removeAttributeTranslationTracking(target) {
  if (!target) {
    return;
  }
  translatedAttributeMarks.delete(target);
  restorableAttributeTargets.delete(target);
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

function trimRestorableAttributeTargets() {
  restoreTrimSerial += 1;
  if (restoreTrimSerial % RESTORE_STALE_SWEEP_INTERVAL === 0) {
    for (const target of restorableAttributeTargets.keys()) {
      if (!isElementAttributeTargetConnected(target)) {
        restorableAttributeTargets.delete(target);
      }
    }
  }

  while (restorableAttributeTargets.size > MAX_RESTORE_NODE_TRACK) {
    const oldestTarget = restorableAttributeTargets.keys().next().value;
    if (!oldestTarget) {
      break;
    }
    restorableAttributeTargets.delete(oldestTarget);
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

function restoreOriginalAttributes() {
  if (!restorableAttributeTargets.size) {
    return false;
  }

  let restored = false;
  isApplyingTranslation = true;
  for (const target of restorableAttributeTargets.keys()) {
    if (!isElementAttributeTargetConnected(target)) {
      restorableAttributeTargets.delete(target);
      continue;
    }

    const state = attributeTargetStates.get(target);
    if (state && typeof state.originalText === "string") {
      setElementAttributeTargetText(target, state.originalText);
      restored = true;
    }
    translatedAttributeMarks.delete(target);
  }
  isApplyingTranslation = false;

  restorableAttributeTargets.clear();
  restoreTrimSerial = 0;
  translatedAttributeMarks = new WeakSet();
  return restored;
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

  const targetPrefix = "to:zh-Hans";

  if (normalizedText.length <= SHORT_CONTEXT_MAX_CHARS) {
    const languageKey = resolveFailedPhraseLanguageKey(contextMeta);
    const contextKey = resolveFailedPhraseContextKey(contextMeta);
    return `${targetPrefix}|${languageKey}|${contextKey}|${normalizedText}`;
  }

  return `${targetPrefix}|${normalizedText}`;
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

  const sampleRoot = document.body || document.documentElement;
  const sample = getElementTextSample(sampleRoot, BLOCK_SAMPLE_TEXT_CHARS);
  const chineseScriptMode = detectChineseScriptMode(sample);
  if (chineseScriptMode === "simplified") {
    return "zh-hans";
  }
  if (chineseScriptMode === "traditional") {
    return "zh-hant";
  }

  return "";
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

})();
