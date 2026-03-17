const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createChromeMock() {
  const syncStorage = {};
  const localStorage = {};

  function createStorageArea(target) {
    return {
      async get(keys) {
        if (typeof keys === 'string') {
          return { [keys]: target[keys] };
        }
        if (Array.isArray(keys)) {
          return keys.reduce((acc, key) => {
            acc[key] = target[key];
            return acc;
          }, {});
        }
        if (keys && typeof keys === 'object') {
          return Object.keys(keys).reduce((acc, key) => {
            acc[key] = target[key] ?? keys[key];
            return acc;
          }, {});
        }
        return { ...target };
      },
      async set(payload) {
        Object.assign(target, payload);
      },
      async remove(keys) {
        const list = Array.isArray(keys) ? keys : [keys];
        for (const key of list) {
          delete target[key];
        }
      }
    };
  }

  return {
    __storageData: {
      sync: syncStorage,
      local: localStorage
    },
    runtime: {
      id: 'test-extension-id',
      getURL(pathname = '') {
        const normalizedPath = String(pathname || '').replace(/^\/+/, '');
        return `chrome-extension://test-extension-id/${normalizedPath}`;
      },
      onInstalled: {
        addListener() {}
      },
      onStartup: {
        addListener() {}
      },
      onMessage: {
        addListener() {}
      }
    },
    storage: {
      sync: createStorageArea(syncStorage),
      local: createStorageArea(localStorage)
    }
  };
}

function loadBackgroundForTest() {
  const filePath = path.join(__dirname, '..', 'background.js');
  const source = fs.readFileSync(filePath, 'utf8');
  const exposeSource = `${source}\n;globalThis.__testExports = {\n  parseModelTranslations,\n  recoverMissingTranslations,\n  handleTranslateBatch,\n  getApiKey,\n  getApiEndpointOrDefault,\n  getApiKeyStorageScope,\n  getGlobalTranslationEnabled,\n  getModelCandidates,\n  cleanupLegacyApiConfig,\n  validateBuiltInApiConnection,\n  estimateBestEffortMaxTokens,\n  resolveModelRateLimitStrategy,\n  getModelApiLimiterState,\n  noteModelApiLimiterOutcome,\n  getBuiltInTranslationCandidates,\n  handleGetSiteSetting,\n  handleSetSiteSetting,\n  isCandidateBatchSuitable,\n  getProviderCircuitBreakerState,\n  beginCircuitRequest,\n  markCircuitRequestFailure,\n  releaseCircuitRequest,\n  handleGetRuntimeApiConfig,\n  handleSetRuntimeApiConfig,\n  handleResetRuntimeApiConfig\n};`;

  const context = {
    console,
    setTimeout,
    clearTimeout,
    fetch: async () => {
      throw new Error('fetch should not be called in this test');
    },
    chrome: createChromeMock(),
    AbortController,
    URL
  };

  vm.createContext(context);
  vm.runInContext(exposeSource, context, { filename: 'background.js' });
  return context;
}

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

async function main() {
  const context = loadBackgroundForTest();
  const {
    parseModelTranslations,
    recoverMissingTranslations,
    handleTranslateBatch,
    getApiKey,
    getApiEndpointOrDefault,
    getApiKeyStorageScope,
    getGlobalTranslationEnabled,
    getModelCandidates,
    cleanupLegacyApiConfig,
    validateBuiltInApiConnection,
    estimateBestEffortMaxTokens,
    resolveModelRateLimitStrategy,
    getModelApiLimiterState,
    noteModelApiLimiterOutcome,
    getBuiltInTranslationCandidates,
    handleGetSiteSetting,
    handleSetSiteSetting,
    isCandidateBatchSuitable,
    getProviderCircuitBreakerState,
    beginCircuitRequest,
    markCircuitRequestFailure,
    releaseCircuitRequest,
    handleGetRuntimeApiConfig,
    handleSetRuntimeApiConfig,
    handleResetRuntimeApiConfig
  } = context.__testExports;

  const sourceTexts = ['Hello', 'Beta', 'World'];
  const sourceEntries = sourceTexts.map((text) => ({ text, prev: '', next: '' }));
  const parsed = parseModelTranslations(
    '{"translations":[{"id":0,"translation":"你好"},{"id":2,"translation":"世界"}]}',
    sourceTexts
  );

  assert.deepEqual(toPlain(parsed.translations), ['你好', '', '世界']);
  assert.deepEqual(toPlain(parsed.missingIndexes), [1]);

  let capturedMissingTexts = [];
  context.requestLongCatTranslationResilient = async (entries) => {
    capturedMissingTexts = entries.map((entry) => entry.text);
    return ['贝塔'];
  };

  const merged = await recoverMissingTranslations({
    sourceEntries,
    translations: parsed.translations,
    missingIndexes: parsed.missingIndexes,
    languageHint: 'en'
  });

  assert.deepEqual(toPlain(capturedMissingTexts), ['Beta']);
  assert.deepEqual(toPlain(merged), ['你好', '贝塔', '世界']);

  let translateCallCount = 0;
  let lastRequestedTexts = [];
  context.requestLongCatTranslation = async (entries) => {
    translateCallCount += 1;
    lastRequestedTexts = entries.map((entry) => entry.text);
    return entries.map((entry) => `译:${entry.text}`);
  };

  const firstBatch = await handleTranslateBatch({
    texts: ['Hello', 'Hello', 'World', '   '],
    languageHint: 'en'
  });
  assert.equal(firstBatch.ok, true);
  assert.equal(translateCallCount, 1);
  assert.deepEqual(toPlain(lastRequestedTexts), ['Hello', 'World']);
  assert.deepEqual(toPlain(firstBatch.translations), ['译:Hello', '译:Hello', '译:World', '   ']);

  lastRequestedTexts = [];
  const secondBatch = await handleTranslateBatch({
    texts: ['Hello', 'World'],
    languageHint: 'en'
  });
  assert.equal(secondBatch.ok, true);
  assert.equal(translateCallCount, 1);
  assert.deepEqual(toPlain(lastRequestedTexts), []);
  assert.deepEqual(toPlain(secondBatch.translations), ['译:Hello', '译:World']);

  context.requestLongCatTranslation = async (entries) => {
    translateCallCount += 1;
    return entries.map((entry) => entry.text);
  };

  const invalidBatchA = await handleTranslateBatch({
    texts: ['Only English sentence'],
    languageHint: 'en'
  });
  assert.equal(invalidBatchA.ok, true);
  assert.deepEqual(toPlain(invalidBatchA.translations), ['']);

  const invalidBatchB = await handleTranslateBatch({
    texts: ['Only English sentence'],
    languageHint: 'en'
  });
  assert.equal(invalidBatchB.ok, true);
  assert.deepEqual(toPlain(invalidBatchB.translations), ['']);
  assert.equal(translateCallCount, 3);

  const builtInApiKey = await getApiKey();
  const builtInEndpoint = await getApiEndpointOrDefault();
  const modelCandidates = toPlain(getModelCandidates());
  const smallTokenBudget = estimateBestEffortMaxTokens('sys', 'user', [{ text: 'Hello' }]);
  const largeTokenBudget = estimateBestEffortMaxTokens(
    'sys',
    'user',
    [{ text: 'A'.repeat(20000) }]
  );

  assert.ok(builtInApiKey.length > 12);
  assert.match(builtInEndpoint, /^https:\/\/.+\/chat\/completions$/);
  assert.deepEqual(modelCandidates, ['LongCat-Flash-Lite']);
  assert.ok(largeTokenBudget > smallTokenBudget);
  assert.ok(largeTokenBudget <= 12288);
  const liteStrategy = resolveModelRateLimitStrategy('LongCat-Flash-Lite');
  const chatStrategy = resolveModelRateLimitStrategy('LongCat-Flash-Chat');
  assert.equal(liteStrategy.initialConcurrent, 4);
  assert.equal(chatStrategy.initialConcurrent, 2);
  const chatLimiterState = getModelApiLimiterState('LongCat-Flash-Chat');
  const previousChatConcurrent = chatLimiterState.currentMaxConcurrent;
  noteModelApiLimiterOutcome('LongCat-Flash-Chat', {
    statusCode: 429,
    latencyMs: 600,
    retryAfterMs: 1500
  });
  assert.ok(chatLimiterState.currentMaxConcurrent < previousChatConcurrent);
  assert.ok(chatLimiterState.currentMinIntervalMs > chatStrategy.initialMinIntervalMs);
  assert.ok(chatLimiterState.cooldownUntil > Date.now());
  const builtInCandidates = toPlain(getBuiltInTranslationCandidates(builtInApiKey, builtInEndpoint));
  assert.deepEqual(builtInCandidates.map((item) => item.modelName), ['LongCat-Flash-Lite']);
  assert.equal(builtInCandidates[0].healthCheckTimeoutMs, 8000);
  const longcatCircuitA = beginCircuitRequest('longcat');
  markCircuitRequestFailure(longcatCircuitA);
  const longcatCircuitB = beginCircuitRequest('longcat');
  markCircuitRequestFailure(longcatCircuitB);
  const longcatCircuitC = beginCircuitRequest('longcat');
  markCircuitRequestFailure(longcatCircuitC);
  const longcatCircuitD = beginCircuitRequest('longcat');
  markCircuitRequestFailure(longcatCircuitD);
  const longcatCircuitE = beginCircuitRequest('longcat');
  markCircuitRequestFailure(longcatCircuitE);
  assert.equal(getProviderCircuitBreakerState('longcat').status, 'open');
  releaseCircuitRequest({ providerKey: 'longcat', startedInHalfOpen: false });
  assert.equal(await getApiKeyStorageScope(), 'built-in');
  assert.equal(await getGlobalTranslationEnabled(), false);

  const runtimeApiConfigResult = await handleGetRuntimeApiConfig();
  assert.equal(runtimeApiConfigResult.ok, true);
  assert.equal(runtimeApiConfigResult.config.endpoint, builtInEndpoint);
  assert.equal(runtimeApiConfigResult.config.apiKey, builtInApiKey);
  assert.equal(runtimeApiConfigResult.config.primaryModel, 'LongCat-Flash-Lite');

  const customConfigResult = await handleSetRuntimeApiConfig({
    config: {
      endpoint: 'https://example.com/v1',
      apiKey: 'custom-token-123',
      primaryModel: 'custom-primary'
    }
  });
  assert.equal(customConfigResult.ok, true);
  assert.equal(await getApiEndpointOrDefault(), 'https://example.com/v1/chat/completions');
  assert.equal(await getApiKey(), 'custom-token-123');
  assert.equal(await getApiKeyStorageScope(), 'custom');
  assert.deepEqual(toPlain(getModelCandidates()), ['custom-primary']);

  const initialSiteSetting = await handleGetSiteSetting({
    hostname: 'docs.example.com'
  });
  assert.equal(initialSiteSetting.ok, true);
  assert.equal(initialSiteSetting.enabled, false);
  assert.equal(initialSiteSetting.matchedHost, '');

  const enabledSiteSetting = await handleSetSiteSetting({
    hostname: 'example.com',
    enabled: true
  });
  assert.equal(enabledSiteSetting.ok, true);
  assert.equal(enabledSiteSetting.enabled, true);

  const childSiteSetting = await handleGetSiteSetting({
    hostname: 'docs.example.com'
  });
  assert.equal(childSiteSetting.ok, true);
  assert.equal(childSiteSetting.enabled, true);
  assert.equal(childSiteSetting.matchedHost, 'example.com');

  const disabledSiteSetting = await handleSetSiteSetting({
    hostname: 'example.com',
    enabled: false
  });
  assert.equal(disabledSiteSetting.ok, true);
  assert.equal(disabledSiteSetting.enabled, false);

  const resetSiteSetting = await handleGetSiteSetting({
    hostname: 'docs.example.com'
  });
  assert.equal(resetSiteSetting.ok, true);
  assert.equal(resetSiteSetting.enabled, false);
  assert.equal(resetSiteSetting.matchedHost, '');

  const resetConfigResult = await handleResetRuntimeApiConfig();
  assert.equal(resetConfigResult.ok, true);
  assert.equal(await getApiEndpointOrDefault(), builtInEndpoint);
  assert.equal(await getApiKey(), builtInApiKey);
  assert.equal(await getApiKeyStorageScope(), 'built-in');
  assert.deepEqual(toPlain(getModelCandidates()), ['LongCat-Flash-Lite']);

  const requestedModelsA = [];
  context.fetch = async (_url, options) => {
    const payload = JSON.parse(String(options.body || '{}'));
    requestedModelsA.push(payload.model);
    return {
      ok: true,
      status: 200,
      async text() {
        return '';
      }
    };
  };
  const allAvailableResult = await validateBuiltInApiConnection(builtInApiKey, builtInEndpoint);
  assert.equal(allAvailableResult.ok, true);
  assert.equal(allAvailableResult.message, '1 个内置 LLM 模型可用');
  assert.equal(allAvailableResult.availableModels, 1);
  assert.deepEqual(requestedModelsA.sort(), ['LongCat-Flash-Lite']);

  const requestedModelsB = [];
  context.fetch = async (_url, options) => {
    const payload = JSON.parse(String(options.body || '{}'));
    requestedModelsB.push(payload.model);
    return {
      ok: payload.model === 'LongCat-Flash-Lite',
      status: payload.model === 'LongCat-Flash-Lite' ? 200 : 503,
      async text() {
        return 'temporary unavailable';
      }
    };
  };
  const oneAvailableResult = await validateBuiltInApiConnection(builtInApiKey, builtInEndpoint);
  assert.equal(oneAvailableResult.ok, true);
  assert.equal(oneAvailableResult.message, '1 个内置 LLM 模型可用');
  assert.equal(oneAvailableResult.availableModels, 1);
  assert.deepEqual(requestedModelsB.sort(), ['LongCat-Flash-Lite']);

  const requestedModelsC = [];
  context.fetch = async (_url, options) => {
    const payload = JSON.parse(String(options.body || '{}'));
    requestedModelsC.push(payload.model);
    return {
      ok: false,
      status: 503,
      async text() {
        return 'temporary unavailable';
      }
    };
  };
  const noneAvailableResult = await validateBuiltInApiConnection(builtInApiKey, builtInEndpoint);
  assert.equal(noneAvailableResult.ok, false);
  assert.equal(noneAvailableResult.error, '内置 LLM 模型全部不可用');
  assert.equal(noneAvailableResult.availableModels, 0);
  assert.deepEqual(requestedModelsC.sort(), ['LongCat-Flash-Lite']);

  await context.chrome.storage.sync.set({
    globalTranslationEnabled: true
  });
  assert.equal(await getGlobalTranslationEnabled(), true);

  await context.chrome.storage.sync.set({
    longcatApiKey: 'sync-override',
    openaiApiEndpoint: 'https://example.com/v1/chat/completions',
    apiKeyStorageScope: 'sync'
  });
  await context.chrome.storage.local.set({
    longcatApiKey: 'local-override',
    openaiApiEndpoint: 'https://example.org/v1/chat/completions',
    apiKeyStorageScope: 'local'
  });

  assert.equal(await getApiKey(), builtInApiKey);
  assert.equal(await getApiEndpointOrDefault(), builtInEndpoint);

  await cleanupLegacyApiConfig();
  assert.equal(context.chrome.__storageData.sync.longcatApiKey, undefined);
  assert.equal(context.chrome.__storageData.sync.openaiApiEndpoint, undefined);
  assert.equal(context.chrome.__storageData.sync.apiKeyStorageScope, undefined);
  assert.equal(context.chrome.__storageData.local.longcatApiKey, undefined);
  assert.equal(context.chrome.__storageData.local.openaiApiEndpoint, undefined);
  assert.equal(context.chrome.__storageData.local.apiKeyStorageScope, undefined);

  console.log('background.test.js passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
