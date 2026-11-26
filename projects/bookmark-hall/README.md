# The Bookmark Hall / 收藏长廊

Version: **1.2.0**

一座由数据驱动的像素风 3D 收藏长廊。它不连接任何特定网站账号，也不读取宿主 localStorage。收藏数据由你自己的页面传入，因此你可以展示 1 件、3 件、4 件，或一整组收藏。

## 最快开始：一行代码

先放入脚本即可自动创建长廊容器：

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/embed.js" data-icons="0"></script>
```

如果需要指定尺寸：

```html
<div id="my-hall" style="width:100%;height:520px"></div>
<script src="https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/embed.js" data-target="my-hall" data-icons="0"></script>
```

## 把你的收藏传进去

```js
const hall = document.querySelector('[data-gongshui-embed="bookmark-hall"]').gongshuiEmbed;
await hall.ready;

hall.setItems([
  { id: 'work-a', title: '我的第一个作品', desc: '作品简介', src: 'https://example.com/work-a', ratio: 1.6 },
  { id: 'work-b', title: '我的第二个作品', src: 'https://example.com/work-b' },
  { id: 'work-c', title: '我的第三个作品', github: 'https://github.com/example/work-c' }
]);

hall.onOpen(({ id }) => {
  // 由你的网站决定打开详情、路由或弹窗
  console.log('打开收藏：', id);
});
```

只想展示一个收藏，就传一个对象组成的数组：

```js
hall.setItems([{ id: 'only-one', title: '唯一收藏', src: 'https://example.com' }]);
```

更新数据时再次调用 `setItems(nextItems)` 即可。默认最多接收 300 条，可通过 `data-max-items="100"` 降低，上限 300。传入空数组会显示空状态。

## 数据字段

| 字段 | 必需 | 说明 |
|---|---:|---|
| `id` | 是 | 稳定且唯一的标识 |
| `title` | 是 | 展示标题 |
| `en` | 否 | 英文标题 |
| `desc` | 否 | 简介 |
| `src` | 否 | 点击画框后打开的网页地址，支持 HTTPS、相对路径 |
| `github` | 否 | GitHub 项目地址（HTTPS） |
| `ratio` | 否 | 详情预览宽高比，默认 1.6439 |
| `folder` | 否 | 分组标识 |

## 配置

| 属性 | 默认值 | 作用 |
|---|---:|---|
| `data-icons` | `1` | `0` 隐藏返回/关闭按钮中的图标，保留必要交互 |
| `data-controls` | `1` | `0` 隐藏整组 HUD 控件 |
| `data-max-items` | `300` | 收藏数量上限，最大 300 |
| `data-width` | `100%` | 容器宽度 |
| `data-height` | 自动 | 指定容器高度 |
| `data-ratio` | `1.6439` | 自动高度时的宽高比 |
| `data-lang` | 页面语言 | `zh`、`en`、`ja` |

## API

```js
await hall.ready;
hall.setItems(items);
hall.setLanguage('ja');
hall.onOpen(({ id }) => console.log(id));
hall.controls.advance(1);
hall.controls.back();
hall.controls.openCurrent();
hall.destroy();
```

`setItems` 接受普通 JavaScript 数组，不要求接入任何特定后端。账号、同步、收藏夹、权限和持久化都由集成方决定。

## 许可

本目录的原创源代码按本目录 `LICENSE`（MIT）授权。MIT 不代表替第三方网站内容、用户提交作品或第三方素材授予权利；请确保你有权展示自己传入的收藏内容。

## English quick start

Install with one script tag; the loader creates the container automatically:

```html
<script src="https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/embed.js" data-icons="0"></script>
```

After the script has run, get the generated element's `.gongshuiEmbed` API, await `api.ready`, then call `api.setItems([...])`. Pass an array with one object for a single bookmark, or any number of objects up to the configured 300-item maximum. Each item requires a unique `id` and `title`. The host application owns persistence, authentication, and navigation; the component only renders the data you pass in.

Use `data-icons="0"` to hide decorative button icons or `data-controls="0"` to hide the full HUD. See the data schema and API examples above. The MIT license covers original source code/styles only; you must have rights to display any content you pass to the component. See [content licensing](ASSET-LICENSING.md).
