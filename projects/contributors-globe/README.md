# Contributors Globe / 投稿者地球

Version: **1.2.0**

一个可独立运行、可嵌入、可按需裁剪的交互式 3D 地球。你可以使用完整投稿者地球，也可以只保留地球本体：隐藏投稿者标记、搜索框、昼夜按钮和提交旗帜入口。

## 最快开始：一行代码

把下面这一行放到页面需要出现地球的位置。加载器会自动创建容器：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js" data-pins="0" data-controls="0" data-search="0"></script>
```

这会显示一个干净的地球，不显示投稿者旗帜、控制图标或搜索栏。

如果需要自己控制容器尺寸，使用两行写法：

```html
<div id="my-globe" style="width:100%;height:420px"></div>
<script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js" data-target="my-globe" data-pins="0" data-controls="0" data-search="0"></script>
```

## 显示模式

| 属性 | 默认值 | 作用 |
|---|---:|---|
| `data-pins` | `1` | `0` 隐藏地球表面的投稿者标记 |
| `data-controls` | `1` | `0` 隐藏右下角昼夜/旗帜等控制图标 |
| `data-search` | `1` | `0` 隐藏投稿者搜索栏 |
| `data-flag` | `1` | `0` 只隐藏“提交旗帜”入口，保留昼夜切换 |
| `data-width` | `100%` | 容器宽度 |
| `data-height` | 自动 | 明确指定容器高度，例如 `420px` |
| `data-ratio` | `1.6439` | 未指定高度时的宽高比 |
| `data-min-height` | `280px` | 最小高度 |
| `data-lang` | 页面语言 | `zh`、`en`、`ja` |
| `data-loading` | `lazy` | iframe 加载策略 |

## JavaScript API

```js
const globe = document.querySelector('[data-gongshui-embed="contributors-globe"]').gongshuiEmbed;
await globe.ready;                 // 等待作品文档加载完成
globe.selectWork('pixel-orbit');   // 选中与作品关联的投稿者
globe.setLanguage('en');
const unsubscribe = globe.onOpenWork(({ workId }) => {
  console.log('用户请求打开作品：', workId);
});
// 不再使用时
unsubscribe();
globe.destroy();
```

## 独立运行与数据

直接通过 HTTP 服务打开本目录的 `index.html`。地球的数据位于 `data/contributors.json`，至少需要 `name` 和两位国家代码 `country`；可选 `github`、`avatar`、`city`、`lat`、`lng`、`works` 和 `note`。没有 WebGL 时会降级为投稿者列表。

作品拥有自己的渲染、数据读取、贴图、语言和生命周期，不读取宿主网站的全局变量或 DOM。

## 许可

本目录的原创源代码按本目录 `LICENSE`（MIT）授权。投稿者个人资料、第三方贴图/旗帜/地理数据及第三方运行库不因该许可证自动获得再授权；再分发前请遵循各自来源的条款。