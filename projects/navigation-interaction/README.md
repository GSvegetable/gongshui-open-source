# Navigation Interaction System / 导航交互系统

Version: **1.2.0**

24 种像素风按钮交互样本。可以一次展示完整样本墙，也可以只取其中一个按钮，或选择任意几个样本组合。它不会接管你的网站路由；按钮点击只向你的代码发送选中事件。

## 最快开始：只取一个按钮，一行代码

例如只需要第 8 个样本（索引从 0 开始）：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js" data-sample="7"></script>
```

需要多个按钮：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js" data-samples="0,2,7,14" data-columns="4"></script>
```

需要完整 24 个样本：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js"></script>
```

也可以提前创建容器并控制大小：

```html
<div id="my-buttons" style="width:240px"></div>
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js" data-target="my-buttons" data-sample="7"></script>
```

## 样本选择

`data-sample` 指定单个样本；`data-samples` 指定逗号分隔的索引。索引范围为 `0–23`。不传筛选属性时显示全部 24 个。

| 属性 | 默认值 | 作用 |
|---|---:|---|
| `data-sample` | 无 | 只显示一个按钮，例如 `7` |
| `data-samples` | 无 | 只显示指定按钮，例如 `0,7,14` |
| `data-columns` | 自动 | 网格列数 |
| `data-gap` | 样式默认 | 按钮间距（像素，0–48） |
| `data-button-size` | 自适应 | 单个按钮尺寸（像素，24–128） |
| `data-width` | `100%` | 容器宽度 |
| `data-height` | 自动 | 容器高度 |
| `data-ratio` | `1.6439` | 自动高度时的宽高比 |
| `data-lang` | 页面语言 | `zh`、`en`、`ja` |

## API

```js
const buttons = document.querySelector('[data-gongshui-embed="navigation-interaction"]').gongshuiEmbed;
await buttons.ready;
buttons.select(7); // 使用原始 0–23 索引，不是筛选后的序号
buttons.onSelect(({ index, label }) => {
  // 在这里执行自己的路由或业务逻辑
  console.log(index, label);
});
buttons.reset();
buttons.destroy();
```

每个按钮都是真实的 `button`，支持键盘焦点、`aria-pressed` 状态和点击事件。

## 许可

本目录的原创源代码与交互样式按本目录 `LICENSE`（MIT）授权。

## English quick start

Embed one sample with a single script tag (sample indices are zero-based):

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js" data-sample="7"></script>
```

Embed a subset with `data-samples="0,2,7,14"`, or omit the filter to show all 24 samples. A single-sample embed defaults to a compact 84 × 84 px mount; set `data-width`, `data-height`, or `data-button-size` to customize it. Filtered embeds remove the showcase heading/footer so the buttons work as standalone UI components. Await `api.ready`, use `api.select(index)`, subscribe with `api.onSelect(callback)`, and call `api.reset()` or `api.destroy()` as needed.

The project-level MIT license covers the original component source, sample markup, and authored styles.
