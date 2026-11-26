# Gongshui UI Components — Embed Guide

本仓库不是只能整体展示的作品集。第三至第五个项目均提供 script-only 自动挂载模式、可选容器模式、独立 API 和可组合配置。使用者不必复制仓库源码，也不必依赖 Gongshui.com。

## 一行嵌入

将对应 script 放到希望组件出现的位置即可，加载器会自动创建容器：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js" data-pins="0" data-controls="0" data-search="0"></script>
<script src="https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/embed.js" data-icons="0"></script>
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js" data-sample="7"></script>
```

每个 script 应独立使用在自己的插入位置。若需要精确控制尺寸或布局，使用容器 + script：

```html
<div id="component" style="width:100%;height:420px"></div>
<script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js" data-target="component"></script>
```

## 通用能力

- 自动创建容器或挂载到 `data-target` 指定的元素
- 自定义宽度、高度、宽高比、语言、加载策略
- iframe 隔离组件 CSS 与宿主页面样式
- `api.ready` 等待组件文档加载
- 事件订阅返回 unsubscribe 函数
- `destroy()` 移除 iframe、监听器和观察器，并恢复宿主容器原内容与样式
- 消息通信校验 iframe 来源与 origin；加载前 API 调用会排队

## Contributors Globe

只要地球、不显示旗帜/按钮/搜索：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js" data-pins="0" data-controls="0" data-search="0"></script>
```

只隐藏投稿者提交入口、保留昼夜切换：`data-flag="0"`。隐藏投稿者标记：`data-pins="0"`。隐藏搜索：`data-search="0"`。

API：`selectWork(id)`、`onOpenWork(callback)`、`setLanguage(lang)`、`ready`、`destroy()`。

## Bookmark Hall

长廊不限制为两件收藏。通过 `setItems(array)` 传入 1–300 条记录（默认）；`data-max-items` 可将上限调低，最大 300。一个对象也必须放进数组。数据由集成方管理，组件不写入账号或浏览器存储。

```js
const hall = document.querySelector('[data-gongshui-embed="bookmark-hall"]').gongshuiEmbed;
await hall.ready;
hall.setItems([{ id: 'one', title: 'Only one', src: 'https://example.com' }]);
hall.setItems([itemA, itemB, itemC, itemD]);
```

`data-icons="0"` 隐藏按钮图标但保留按钮；`data-controls="0"` 隐藏整组 HUD。API：`setItems(items)`、`onOpen(callback)`、`setLanguage(lang)`、`controls.advance/back/openCurrent`、`ready`、`destroy()`。

每条数据的必需字段为 `id` 和 `title`。可选字段：`en`、`desc`、`src`、`github`、`ratio`、`folder`。

## Navigation Interaction

只取一个按钮：`data-sample="7"`。多个按钮：`data-samples="0,2,7,14"`。完整展示不传筛选属性。索引始终对应原始 0–23 样本编号。

API：`select(index)`、`onSelect(callback)`、`reset()`、`setLanguage(lang)`、`ready`、`destroy()`。

## 使用许可

项目 3–5 各自有独立的 MIT 源代码许可证，详见各目录 `LICENSE`。MIT 仅覆盖各项目作者拥有的原创代码/样式；投稿者个人数据、第三方图片/贴图/图标/地理数据和依赖库不自动纳入该授权。使用者应查看对应的第三方声明，并对自己传入的内容拥有展示权。

## English overview

Projects 3–5 can be installed with a single `<script>` tag; each loader creates a mount element automatically. Use `data-target` when you want to provide your own container. Each generated element exposes a project-specific `.gongshuiEmbed` API with a `ready` promise and `destroy()` lifecycle method.

- **Contributors Globe:** `data-pins="0"`, `data-search="0"`, and `data-controls="0"` produce a clean globe. `data-flag="0"` hides only the flag submission link.
- **Bookmark Hall:** call `setItems(array)` after `await api.ready`. A one-item array and multi-item arrays are both supported; the default maximum is 300.
- **Navigation Interaction:** use `data-sample="7"` for one button or `data-samples="0,2,7"` for a subset of the 24 buttons.

See each project's README for copy/paste examples, complete options, data schemas, callbacks, and license boundaries.
