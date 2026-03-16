const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createChromeMock() {
  return {
    runtime: {
      onMessage: {
        addListener() {}
      },
      sendMessage(_message, callback) {
        if (typeof callback === "function") {
          callback({ ok: false, error: "mocked" });
        }
      }
    }
  };
}

function createBaseContext() {
  class BaseElement {}

  class MockElement extends BaseElement {
    constructor({
      tagName = "div",
      parentElement = null,
      top = 0,
      left = 0,
      className = "",
      id = "",
      role = ""
    } = {}) {
      super();
      this.nodeType = 1;
      this.tagName = String(tagName).toUpperCase();
      this.parentElement = parentElement;
      this.isConnected = true;
      this.className = className;
      this.id = id;
      this._role = role;
      this._top = top;
      this._left = left;
      this._attrs = new Map();
      if (role) {
        this._attrs.set("role", role);
      }
      this.previousElementSibling = null;
      this.nextElementSibling = null;
      this.children = [];
    }

    closest(selector) {
      if (typeof this._closest === "function") {
        return this._closest(selector);
      }
      return null;
    }

    matches(selector) {
      if (typeof this._matches === "function") {
        return this._matches(selector);
      }
      return false;
    }

    querySelectorAll() {
      if (typeof this._querySelectorAll === "function") {
        return this._querySelectorAll();
      }
      return [];
    }

    getBoundingClientRect() {
      return {
        top: this._top,
        left: this._left,
        right: this._left + 120,
        bottom: this._top + 24,
        width: 120,
        height: 24
      };
    }

    contains(node) {
      let cursor = node;
      while (cursor) {
        if (cursor === this) {
          return true;
        }
        cursor = cursor.parentElement || null;
      }
      return false;
    }

    getAttribute(name) {
      return this._attrs.get(String(name)) || "";
    }

    setAttribute(name, value) {
      const key = String(name);
      const normalizedValue = String(value);
      this._attrs.set(key, normalizedValue);
      if (key === "role") {
        this._role = normalizedValue;
      }
      if (key === "type") {
        this.type = normalizedValue;
      }
    }

    hasAttribute(name) {
      return this._attrs.has(String(name));
    }

    removeAttribute(name) {
      this._attrs.delete(String(name));
    }
  }

  const documentElement = new MockElement({ tagName: "html" });
  const body = new MockElement({ tagName: "body", parentElement: documentElement });
  documentElement._matches = (selector) => selector.includes("html");

  const document = {
    body,
    documentElement,
    hidden: false,
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
    createTreeWalker() {
      return {
        nextNode() {
          return null;
        }
      };
    }
  };

  const history = {
    pushState() {},
    replaceState() {}
  };

  const window = {
    location: { hostname: "", href: "https://example.test/" },
    navigator: { language: "en-US" },
    innerHeight: 900,
    innerWidth: 1400,
    requestAnimationFrame(callback) {
      return setTimeout(callback, 0);
    },
    cancelAnimationFrame(frameId) {
      clearTimeout(frameId);
    },
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle() {
      return { display: "block", visibility: "visible", opacity: "1" };
    },
    sessionStorage: {
      getItem() {
        return null;
      },
      setItem() {}
    }
  };

  class MutationObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
  }

  class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  return {
    context: {
      console,
      setTimeout,
      clearTimeout,
      window,
      document,
      history,
      chrome: createChromeMock(),
      MutationObserver,
      IntersectionObserver,
      Node: { TEXT_NODE: 3, ELEMENT_NODE: 1 },
      NodeFilter: {
        SHOW_TEXT: 4,
        FILTER_ACCEPT: 1,
        FILTER_REJECT: 2
      },
      Element: BaseElement,
      performance: { now: () => Date.now() }
    },
    MockElement
  };
}

function loadContentForTest() {
  const filePath = path.join(__dirname, "..", "content.js");
  const source = fs.readFileSync(filePath, "utf8");
  const exposeSource = source.replace(
    /\}\)\(\);\s*$/,
    `\n;globalThis.__testExports = {\n  shouldIgnoreElement,\n  isAcceptableTranslatedResult,\n  getTranslationCacheKey,\n  rememberFailedTranslationAttempt,\n  isSourceTextRetrySuppressed,\n  getFailedPhraseState,\n  clearFailedPhraseState,\n  detectChineseScriptMode,\n  deduplicateRoots,\n  isTranslatableHintElement,\n  getTranslatableElementAttributeNames,\n  getOrCreateElementAttributeTarget,\n  getElementAttributeTargetText,\n  applyTranslationToElementAttribute,\n  restoreOriginalAttributes,\n  isLikelyMinorityForeignSnippet,\n  shouldSkipMinorityForeignSnippet\n};\n})();`
  );
  const { context, MockElement } = createBaseContext();
  vm.createContext(context);
  vm.runInContext(exposeSource, context, { filename: "content.js" });
  return { context, MockElement };
}

function main() {
  const { context, MockElement } = loadContentForTest();
  const {
    shouldIgnoreElement,
    isAcceptableTranslatedResult,
    getTranslationCacheKey,
    rememberFailedTranslationAttempt,
    isSourceTextRetrySuppressed,
    getFailedPhraseState,
    clearFailedPhraseState,
    detectChineseScriptMode,
    deduplicateRoots,
    isTranslatableHintElement,
    getTranslatableElementAttributeNames,
    getOrCreateElementAttributeTarget,
    getElementAttributeTargetText,
    applyTranslationToElementAttribute,
    restoreOriginalAttributes,
    isLikelyMinorityForeignSnippet,
    shouldSkipMinorityForeignSnippet
  } = context.__testExports;

  const editableNode = new MockElement();
  editableNode._closest = (selector) =>
    selector.includes("input") ? editableNode : null;
  assert.equal(shouldIgnoreElement(editableNode), true);

  assert.equal(isAcceptableTranslatedResult("Sign in", "Sign in"), false);
  assert.equal(isAcceptableTranslatedResult("Sign in", "登录"), true);

  const cacheKeyA = getTranslationCacheKey("Open", {
    failedLanguageKey: "en",
    failedContextKey: "main:abc"
  });
  const cacheKeyB = getTranslationCacheKey("Open", {
    failedLanguageKey: "en",
    failedContextKey: "nav:def"
  });
  assert.notEqual(cacheKeyA, cacheKeyB);

  const longText = "This is a relatively long sentence for cache stability check.";
  const longKeyA = getTranslationCacheKey(longText, {
    failedLanguageKey: "en",
    failedContextKey: "main:abc"
  });
  const longKeyB = getTranslationCacheKey(longText, {
    failedLanguageKey: "en",
    failedContextKey: "nav:def"
  });
  assert.equal(longKeyA, longKeyB);

  const contextMain = { failedLanguageKey: "en", failedContextKey: "main:abc" };
  const contextNav = { failedLanguageKey: "en", failedContextKey: "nav:xyz" };
  rememberFailedTranslationAttempt("Open", contextMain);
  assert.equal(isSourceTextRetrySuppressed("Open", contextMain), true);
  assert.equal(isSourceTextRetrySuppressed("Open", contextNav), false);

  rememberFailedTranslationAttempt("Open", contextMain);
  rememberFailedTranslationAttempt("Open", contextMain);
  rememberFailedTranslationAttempt("Open", contextMain);
  const failedState = getFailedPhraseState("Open", contextMain);
  assert.equal(Boolean(failedState?.giveUp), true);
  clearFailedPhraseState("Open", contextMain);
  assert.equal(isSourceTextRetrySuppressed("Open", contextMain), false);

  assert.equal(detectChineseScriptMode("這裡會顯示網頁設定與閱讀內容"), "traditional");
  assert.equal(detectChineseScriptMode("这里会显示网页设置与阅读内容"), "simplified");
  assert.equal(isLikelyMinorityForeignSnippet("Mohammad Mahfuzul Huq"), true);
  assert.equal(isLikelyMinorityForeignSnippet("Open the dashboard now"), true);
  assert.equal(
    isLikelyMinorityForeignSnippet("This is a complete English sentence with punctuation."),
    false
  );

  const rootA = new MockElement({ tagName: "section", top: 10 });
  rootA._matches = () => false;
  rootA._closest = () => null;
  const rootB = new MockElement({ tagName: "p", parentElement: rootA, top: 20 });
  rootB._matches = () => false;
  rootB._closest = () => null;
  const rootC = new MockElement({ tagName: "article", top: 30 });
  rootC._matches = () => false;
  rootC._closest = () => null;
  const deduped = deduplicateRoots([rootB, rootA, rootC]);
  assert.equal(deduped.includes(rootA), true);
  assert.equal(deduped.includes(rootC), true);
  assert.equal(deduped.includes(rootB), false);

  const chinesePage = new MockElement({ tagName: "section", top: 12 });
  chinesePage.textContent =
    "没有权限访问 当前登录账号为 TRANSSION 的刘伟，你可以向 Mohammad Mahfuzul Huq 申请权限";
  const englishName = new MockElement({ tagName: "span", parentElement: chinesePage, top: 18 });
  englishName.textContent = "Mohammad Mahfuzul Huq";
  assert.equal(shouldSkipMinorityForeignSnippet("Mohammad Mahfuzul Huq", englishName), true);

  const englishPage = new MockElement({ tagName: "section", top: 24 });
  englishPage.textContent =
    "Open menu and review workspace settings before continuing with account access";
  const englishSnippet = new MockElement({ tagName: "span", parentElement: englishPage, top: 28 });
  englishSnippet.textContent = "Open menu";
  assert.equal(shouldSkipMinorityForeignSnippet("Open menu", englishSnippet), false);

  const searchInput = new MockElement({ tagName: "input", top: 40, left: 20 });
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search docs");
  searchInput.setAttribute("aria-label", "Search");
  assert.equal(isTranslatableHintElement(searchInput), true);
  assert.deepEqual(
    Array.from(getTranslatableElementAttributeNames(searchInput)),
    ["placeholder", "aria-label"]
  );

  const buttonInput = new MockElement({ tagName: "input" });
  buttonInput.setAttribute("type", "button");
  buttonInput.setAttribute("title", "Submit");
  assert.equal(isTranslatableHintElement(buttonInput), false);
  assert.deepEqual(Array.from(getTranslatableElementAttributeNames(buttonInput)), []);

  const placeholderTarget = getOrCreateElementAttributeTarget(searchInput, "placeholder");
  assert.equal(getOrCreateElementAttributeTarget(searchInput, "placeholder"), placeholderTarget);
  applyTranslationToElementAttribute(
    placeholderTarget,
    {
      coreText: "Search docs",
      prefix: "",
      suffix: "",
      originalText: "Search docs"
    },
    "搜索文档"
  );
  assert.equal(getElementAttributeTargetText(placeholderTarget), "搜索文档");
  assert.equal(restoreOriginalAttributes(), true);
  assert.equal(getElementAttributeTargetText(placeholderTarget), "Search docs");

  console.log("content.test.js passed");
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
