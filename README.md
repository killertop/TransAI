# TransAI

一个基于 Manifest V3 的 Chrome 翻译插件，用于把网页中的非简体中文内容按当前域名按需翻译为简体中文。  
A Manifest V3 Chrome extension that translates non‑Simplified‑Chinese webpage content into Simplified Chinese on a per-domain basis.

## 核心能力

- 默认关闭，通过弹窗读取当前域名后按需启用自动翻译。
- 仅处理当前视口附近的内容，减少无关请求和页面抖动。
- 翻译顺序尽量贴近阅读顺序，从上到下、从左到右处理。
- 鼠标悬浮触发的 tooltip、toast、弹层也会尝试翻译。
- 输入框的 `placeholder`、`title`、`aria-label` 会按需翻译，但不会改动用户已输入的值。
- 中文占明显主导的页面会尽量跳过零散英文碎片，减少人名、品牌名这类没必要的翻译。

## Highlights

- Default off. The popup reads the current domain and lets you enable auto-translation only for that domain.
- 仅处理当前视口附近的内容，减少无关请求和页面抖动。
- 翻译顺序尽量贴近阅读顺序，从上到下、从左到右处理。
- 鼠标悬浮触发的 tooltip、toast、弹层也会尝试翻译。
- 输入框的 `placeholder`、`title`、`aria-label` 会按需翻译，但不会改动用户已输入的值。
- 中文占明显主导的页面会尽量跳过零散英文碎片，减少人名、品牌名这类没必要的翻译。

## 安装

1. 打开 Chrome，进入 `chrome://extensions/`
2. 打开右上角“开发者模式”
3. 点击“加载已解压的扩展程序”
4. 选择当前仓库目录

## 使用

1. 点击插件图标打开弹窗
2. 在弹窗里确认当前域名，并按需开启该域名的自动翻译
3. 如需修改接口，可在弹窗里直接编辑 API 地址、Token、常规模型、后备模型并保存
4. 如需检查当前配置是否可用，可点击“测试接口”
5. 回到目标网页，插件会只在当前已开启的域名下，把非简体中文内容翻译为简体中文  
   The extension translates non-Simplified-Chinese content into Simplified Chinese only on domains you have enabled.

Token 输入框会始终以隐藏形式显示，便于在弹窗内安全修改配置。  
The token field always stays masked for safer editing inside the popup.

## 行为说明

- 简体中文页面会自动跳过
- 默认不会全局开启，只有当前域名被启用后才会自动翻译
- 关闭当前域名开关后，插件会尽量恢复页面原文
- 为避免表单异常，不会翻译 `input/textarea/contenteditable` 的实际输入内容

## 项目结构

- `manifest.json`：扩展清单
- `background.js`：后台逻辑、接口请求、状态同步
- `content.js`：页面扫描、翻译应用、恢复原文
- `popup.html` / `popup.css` / `popup.js`：弹窗界面
- `tests/background.test.js`：后台最小回归测试
- `tests/content.test.js`：内容脚本最小回归测试

## 本地测试

```bash
node tests/background.test.js
node tests/content.test.js
```

## 打包前清理

```bash
find . -name ".DS_Store" -delete
find . -name "__MACOSX" -type d -prune -exec rm -rf {} +
```
