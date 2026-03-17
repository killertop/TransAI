const statusEl = document.getElementById("status");
const globalToggleEl = document.getElementById("globalToggle");
const testApiBtn = document.getElementById("testApiBtn");
const apiEndpointEl = document.getElementById("apiEndpoint");
const apiKeyEl = document.getElementById("apiKey");
const primaryModelEl = document.getElementById("primaryModel");
const backupModelEl = document.getElementById("backupModel");
const saveApiBtn = document.getElementById("saveApiBtn");
const resetApiBtn = document.getElementById("resetApiBtn");

initPopup().catch((error) => {
  setStatus(`初始化失败：${error.message}`);
});

globalToggleEl.addEventListener("change", async () => {
  const enabled = globalToggleEl.checked;
  lockActions(true);

  const result = await sendRuntimeMessage({
    type: "setGlobalTranslationEnabled",
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
      ? "已开启自动翻译：默认会把非简体中文页面翻译成简体中文"
      : "已关闭自动翻译：网页将保持原文",
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
  const [statusResult, apiConfigResult] = await Promise.all([
    sendRuntimeMessage({
      type: "getGlobalTranslationStatus"
    }),
    sendRuntimeMessage({
      type: "getRuntimeApiConfig"
    })
  ]);

  if (!statusResult?.ok) {
    globalToggleEl.disabled = true;
    testApiBtn.disabled = true;
    saveApiBtn.disabled = true;
    resetApiBtn.disabled = true;
    setStatus(statusResult?.error || "读取开关状态失败");
    return;
  }

  if (!apiConfigResult?.ok) {
    testApiBtn.disabled = true;
    saveApiBtn.disabled = true;
    resetApiBtn.disabled = true;
    setStatus(apiConfigResult?.error || "读取接口配置失败");
    return;
  }

  globalToggleEl.checked = Boolean(statusResult.enabled);
  writeApiConfigToForm(apiConfigResult.config || {});
  lockActions(false);
}

function readApiConfigFromForm() {
  return {
    endpoint: apiEndpointEl.value,
    apiKey: apiKeyEl.value,
    primaryModel: primaryModelEl.value,
    backupModel: backupModelEl.value
  };
}

function writeApiConfigToForm(config) {
  apiEndpointEl.value = String(config?.endpoint || "");
  apiKeyEl.value = String(config?.apiKey || "");
  primaryModelEl.value = String(config?.primaryModel || "");
  backupModelEl.value = String(config?.backupModel || "");
}

function lockActions(locked) {
  globalToggleEl.disabled = locked;
  testApiBtn.disabled = locked;
  saveApiBtn.disabled = locked;
  resetApiBtn.disabled = locked;
  apiEndpointEl.disabled = locked;
  apiKeyEl.disabled = locked;
  primaryModelEl.disabled = locked;
  backupModelEl.disabled = locked;
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
