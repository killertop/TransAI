# LLM 翻译 Chrome 插件

这是一个可直接导入 Chrome 的 Manifest V3 插件，核心特性：

- 默认关闭翻译。
- 在弹窗中可通过一个全局总开关开启/关闭自动翻译。
- 开启后默认把检测为非简体中文的网页翻译成简体中文；简体中文页面会自动跳过。
- 仅翻译视口可见区域，滚动到新区域再继续分段翻译。
- 当前视口内按页面从上到下（同高度从左到右）翻译。
- 鼠标悬浮触发的 tooltip / toast / 弹层也会尝试翻译。
- 鼠标选中文本后会触发“有限插队翻译”。
- 强约束：不翻译输入控件与可编辑区域（避免表单提交异常）。

## 目录结构

- `manifest.json`：插件配置（MV3）。
- `background.js`：全局开关管理、动态注入、LongCat API 调用。
- `content.js`：页面文本扫描、分段翻译、恢复原文、暂停/继续。
- `popup.html` / `popup.css` / `popup.js`：弹窗 UI 与站点控制。
- `tests/background.test.js`、`tests/content.test.js`：最小回归测试。

## 安装与导入

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 打开右上角「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择目录：`/Users/bob.liu/Documents/Chrome 插件/AItranslate`。

## 首次使用

1. 点击插件图标，打开弹窗。
2. 打开「启用自动翻译」总开关。
3. 如需确认内置配置可用，点击「测试接口」。
4. 回到目标网页，插件会自动处理非简体中文页面。

> API 地址与 Token 已内置在后台服务里，不再提供设置页。

## 权限与注入策略

- 不再静态注入 `content.js` 到所有网页。
- 仅在你开启全局总开关后，后台动态注册内容脚本到网页。
- `host_permissions` 使用 `<all_urls>`（自用优先，省去逐站点授权流程）。
- 使用全局动态脚本 ID：`ai-translate::global`。
- 监听 `tabs.onUpdated(status=complete)`：当总开关开启时，会自动确保脚本注册、必要时 `executeScript` 兜底注入，并触发 `triggerTranslateNow`。

## 弹窗功能

- **启用自动翻译**：开启/关闭全局自动翻译。
- **测试接口**：验证内置 API 地址与 Token 当前是否可用。

## 开关同步行为

- 切换全局总开关会同步影响当前已打开的所有 http/https 标签页。
- 同步过程带并发上限，避免一次批量开关造成消息风暴。
- 关闭时会尽量恢复页面原文；恢复失败时回退为刷新标签页。

## 存储策略

- 全局总开关状态写入 `chrome.storage.sync`。
- 旧版遗留的 API Key / Endpoint / 站点规则存储项会在启动时自动清理。

## 迁移说明

- 旧版按网站单独开关已移除，统一改为全局总开关。
- 历史遗留的旧动态脚本 ID（例如 `llm-translate-site-script`）会在启动阶段自动清理。

## 翻译请求策略

- 模型：默认 `LongCat-Flash-Lite`，失败时自动回退到 `LongCat-Flash-Chat`。
- 性能：批次大小、请求并发与长文本并发已按官方文档公布的上下文/输出能力做了上调，优先发挥 `Flash-Lite` 的吞吐优势。
- 限流：后台带有按模型区分的动态限流器，遇到 `429` 会自动降并发并拉长发起间隔，连续成功后再逐步恢复。
- Endpoint 与 Token 已写死在后台脚本中，并做了轻度混淆处理；运行时解码后再发起请求。
- 采用 OpenAI `messages` 结构 + JSON 数组一一对应回写。
- 单次请求默认超时：`18000ms`（兼顾更大批次与 MV3 service worker 稳定性）。
- 批次请求会按长度分段并动态调节，尽量把单次耗时控制在可接受区间。

## 本地测试

在插件目录执行：

```bash
node tests/background.test.js
node tests/content.test.js
```

## 打包前清理

为了避免 zip 出现 macOS 杂质文件（`.DS_Store` / `__MACOSX`），打包前先执行：

```bash
find . -name ".DS_Store" -delete
find . -name "__MACOSX" -type d -prune -exec rm -rf {} +
```
