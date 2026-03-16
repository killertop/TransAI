const statusEl = document.getElementById("status");
const globalToggleEl = document.getElementById("globalToggle");
const testApiBtn = document.getElementById("testApiBtn");

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
  setStatus("正在测试内置 LLM 模型...");

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

async function initPopup() {
  const result = await sendRuntimeMessage({
    type: "getGlobalTranslationStatus"
  });

  if (!result?.ok) {
    globalToggleEl.disabled = true;
    testApiBtn.disabled = true;
    setStatus(result?.error || "读取开关状态失败");
    return;
  }

  globalToggleEl.checked = Boolean(result.enabled);
  lockActions(false);
}

function lockActions(locked) {
  globalToggleEl.disabled = locked;
  testApiBtn.disabled = locked;
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
