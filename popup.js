const statusEl = document.getElementById("status");
const globalToggleEl = document.getElementById("globalToggle");
const siteHostnameEl = document.getElementById("siteHostname");
const testApiBtn = document.getElementById("testApiBtn");
const apiEndpointEl = document.getElementById("apiEndpoint");
const apiKeyEl = document.getElementById("apiKey");
const primaryModelEl = document.getElementById("primaryModel");
const saveApiBtn = document.getElementById("saveApiBtn");
const resetApiBtn = document.getElementById("resetApiBtn");
let currentSiteContext = {
  tabId: null,
  hostname: "",
  supported: false
};

initPopup().catch((error) => {
  setStatus(`初始化失败：${error.message}`);
});

globalToggleEl.addEventListener("change", async () => {
  if (!currentSiteContext.supported || !currentSiteContext.hostname) {
    globalToggleEl.checked = false;
    setStatus("当前页面不支持按域名启用自动翻译");
    return;
  }

  const enabled = globalToggleEl.checked;
  lockActions(true);

  const result = await sendRuntimeMessage({
    type: "setSiteSetting",
    hostname: currentSiteContext.hostname,
    tabId: currentSiteContext.tabId,
    enabled
  });

  lockActions(false);

  if (!result?.ok) {
    globalToggleEl.checked = !enabled;
    setStatus(result?.error || "保存失败");
    return;
  }

  setStatus(
    enabled
      ? `已为 ${currentSiteContext.hostname} 开启自动翻译`
      : `已关闭 ${currentSiteContext.hostname} 的自动翻译`,
    true
  );
});

testApiBtn.addEventListener("click", async () => {
  lockActions(true);
  setStatus("正在测试当前接口配置...");

  const result = await sendRuntimeMessage({
    type: "testApiConnection"
  });

  lockActions(false);

  if (!result?.ok) {
    setStatus(result?.error || "接口验证失败");
    return;
  }

  setStatus(result.message || "内置 LLM 模型可用", true);
});

saveApiBtn.addEventListener("click", async () => {
  lockActions(true);
  setStatus("正在保存接口配置...");

  const result = await sendRuntimeMessage({
    type: "setRuntimeApiConfig",
    config: readApiConfigFromForm()
  });

  lockActions(false);

  if (!result?.ok) {
    setStatus(result?.error || "保存接口配置失败");
    return;
  }

  writeApiConfigToForm(result.config || readApiConfigFromForm());
  setStatus("接口配置已保存", true);
});

resetApiBtn.addEventListener("click", async () => {
  lockActions(true);
  setStatus("正在恢复默认配置...");

  const result = await sendRuntimeMessage({
    type: "resetRuntimeApiConfig"
  });

  lockActions(false);

  if (!result?.ok) {
    setStatus(result?.error || "恢复默认配置失败");
    return;
  }

  writeApiConfigToForm(result.config || {});
  setStatus("已恢复默认配置", true);
});

async function initPopup() {
  const [tabContext, apiConfigResult] = await Promise.all([
    getCurrentTabContext(),
    sendRuntimeMessage({
      type: "getRuntimeApiConfig"
    })
  ]);

  if (!apiConfigResult?.ok) {
    testApiBtn.disabled = true;
    saveApiBtn.disabled = true;
    resetApiBtn.disabled = true;
    setStatus(apiConfigResult?.error || "读取接口配置失败");
    return;
  }

  writeApiConfigToForm(apiConfigResult.config || {});
  applyCurrentSiteContext(tabContext);
  lockActions(false);
}

function readApiConfigFromForm() {
  return {
    endpoint: apiEndpointEl.value,
    apiKey: apiKeyEl.value,
    primaryModel: primaryModelEl.value
  };
}

function writeApiConfigToForm(config) {
  apiEndpointEl.value = String(config?.endpoint || "");
  apiKeyEl.value = String(config?.apiKey || "");
  primaryModelEl.value = String(config?.primaryModel || "");
}

function lockActions(locked) {
  globalToggleEl.disabled = locked || !currentSiteContext.supported;
  testApiBtn.disabled = locked;
  saveApiBtn.disabled = locked;
  resetApiBtn.disabled = locked;
  apiEndpointEl.disabled = locked;
  apiKeyEl.disabled = locked;
  primaryModelEl.disabled = locked;
}

function setStatus(message, isOk = false) {
  statusEl.textContent = message || "";
  statusEl.classList.toggle("ok", Boolean(isOk));
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

async function getCurrentTabContext() {
  const activeTab = await getActiveTab();
  const parsedUrl = safeParseUrl(activeTab?.url || "");
  const hostname = deriveSiteDomain(parsedUrl?.hostname || "");
  const tabId = normalizeTabId(activeTab?.id);

  if (!parsedUrl || !/^https?:$/.test(parsedUrl.protocol) || !hostname || tabId === null) {
    return {
      supported: false,
      tabId,
      hostname: "",
      enabled: false
    };
  }

  const siteResult = await sendRuntimeMessage({
    type: "getSiteSetting",
    hostname
  });

  if (!siteResult?.ok) {
    throw new Error(siteResult?.error || "读取当前域名开关失败");
  }

  return {
    supported: true,
    tabId,
    hostname,
    enabled: Boolean(siteResult.enabled)
  };
}

function applyCurrentSiteContext(context) {
  currentSiteContext = {
    tabId: normalizeTabId(context?.tabId),
    hostname: String(context?.hostname || ""),
    supported: Boolean(context?.supported)
  };

  if (!currentSiteContext.supported || !currentSiteContext.hostname) {
    siteHostnameEl.textContent = "当前页面不支持按域名自动翻译";
    globalToggleEl.checked = false;
    globalToggleEl.disabled = true;
    return;
  }

  siteHostnameEl.textContent = `当前域名：${currentSiteContext.hostname}`;
  globalToggleEl.checked = Boolean(context?.enabled);
}

function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve(Array.isArray(tabs) ? tabs[0] || null : null);
    });
  });
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

function deriveSiteDomain(hostname) {
  const normalized = normalizeHostname(hostname);
  if (!normalized || normalized === "localhost" || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalized)) {
    return normalized;
  }

  const segments = normalized.split(".").filter(Boolean);
  if (segments.length <= 2) {
    return normalized;
  }

  const knownCompoundSuffixes = new Set([
    "ac.uk",
    "co.jp",
    "co.nz",
    "co.uk",
    "com.au",
    "com.cn",
    "com.hk",
    "com.tw",
    "edu.cn",
    "gov.cn",
    "gov.uk",
    "net.au",
    "net.cn",
    "org.au",
    "org.cn",
    "org.uk"
  ]);
  const suffix = segments.slice(-2).join(".");
  if (knownCompoundSuffixes.has(suffix) && segments.length >= 3) {
    return segments.slice(-3).join(".");
  }

  return segments.slice(-2).join(".");
}

function normalizeTabId(value) {
  const tabId = Number(value);
  if (!Number.isInteger(tabId) || tabId < 0) {
    return null;
  }
  return tabId;
}
