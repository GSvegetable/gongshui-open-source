# Contributors Globe / 投稿者地球

Version: **1.3.0**

一个可独立运行、可嵌入、可按需裁剪的交互式 3D 地球 UI。默认数据为空，不包含宫水或其他作者的个人资料；默认也没有投稿目标，不会替任何人创建 Issue、提交表单或写入数据库。

## 快速嵌入

把脚本放到页面需要出现地球的位置：

```html
<script
  src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js?v=1.3.0"
  data-height="420px">
</script>
```

组件会自动创建容器。默认显示地球、投稿者标记（数据为空时没有标记）、搜索和昼夜切换；由于没有配置投稿地址，旗帜投稿入口不会出现。

也可以自己提供容器：

```html
<div id="my-globe" style="width:100%;height:420px"></div>
<script
  src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js?v=1.3.0"
  data-target="my-globe">
</script>
```

## 显示与功能配置

| 属性 | 默认值 | 作用 |
|---|---:|---|
| `data-pins` | `1` | `0` 隐藏地球表面的投稿者标记 |
| `data-controls` | `1` | `0` 隐藏右下角控制按钮 |
| `data-search` | `1` | `0` 隐藏投稿者搜索栏 |
| `data-flag` | `1` | `0` 隐藏可选的投稿入口 |
| `data-submit-url` | 无 | 可选的 HTTPS 页面地址；只有明确配置后才显示投稿入口。组件只打开该地址，不会自动提交数据 |
| `data-contributors-src` | `./data/contributors.json` | 可选的 HTTPS JSON 数据地址；用于加载你自己网站维护的投稿者名单 |
| `data-width` | `100%` | 容器宽度 |
| `data-height` | 自动 | 明确指定容器高度，例如 `420px` |
| `data-ratio` | `1.6439` | 未指定高度时的宽高比 |
| `data-min-height` | `280px` | 最小高度 |
| `data-lang` | 页面语言 | `zh`、`en`、`ja` |
| `data-loading` | `lazy` | iframe 加载策略 |

如果你想显示自己的投稿入口，可以自行配置：

```html
<script
  src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js?v=1.3.0"
  data-height="420px"
  data-submit-url="https://example.com/your-submission-page">
</script>
```

地址必须是 HTTPS。点击按钮只会在新标签页打开你提供的页面；投稿表单、身份验证、数据存储和审核都由你自己的服务负责，地球组件不会替你处理这些事情。**不配置 `data-submit-url` 时，不会出现投稿按钮，也不会向宫水.com、GitHub Issues 或任何数据库发送投稿。**

## 投稿者数据

默认从组件目录的 `data/contributors.json` 读取，文件中的 `contributors` 是空数组。你也可以通过 `data-contributors-src` 指向自己网站的 HTTPS JSON 文件，让 UI 代码与个人数据完全分开：

```html
<script
  src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js?v=1.3.0"
  data-height="420px"
  data-contributors-src="https://example.com/data/contributors.json">
</script>
```

数据文件结构如下，复制并替换成你自己的数据：

```json
{
  "contributors": [
    {
      "id": "author-1",
      "name": "Your Name",
      "country": "JP",
      "github": "your-github-name",
      "city": "Tokyo",
      "note": "Hello, world.",
      "works": ["your-work-id"]
    }
  ]
}
```

字段说明：
- 必填：`name`、`country`（ISO 两位国家代码）
- 可选：`github`、`avatar`、`city`、`lat`、`lng`、`pin`、`works`、`note`
- 不提供坐标时，使用内置国家中心点；提供坐标时会做精度取整
- 头像可以使用 GitHub 头像或你自己提供的 HTTPS 图片地址

## JavaScript API

```js
const globe = document.querySelector('[data-contributors-globe-embed]').contributorsGlobe;
await globe.ready;
globe.selectWork('your-work-id');
globe.setLanguage('en');

const unsubscribe = globe.onOpenWork(({ workId }) => {
  console.log('Open work:', workId);
});

// 不再使用时
unsubscribe();
globe.destroy();
```

为兼容旧版宫水.com 集成，当前版本也保留了 `.gongshuiEmbed` 属性别名；新项目请使用通用的 `.contributorsGlobe`。

## 网络与隔离说明

组件没有投稿后端、没有 Supabase 客户端、没有 API 密钥，也不会发送投稿数据。正常运行时只会读取静态投稿者 JSON、地理边界与贴图，并加载固定版本的 Globe.GL 运行库；如果你在数据文件中配置了 GitHub 用户名或头像 URL，浏览器还会请求对应的头像资源。自定义数据源必须由你自己的站点提供 HTTPS 和允许跨域读取的 CORS 响应头。

你可以自行托管整个目录，或继续使用上面的静态资源地址。宿主页面不需要安装框架或接入宫水.com 的代码。

## 许可

本目录原创源代码按本目录 `LICENSE`（MIT）授权。投稿者个人资料、第三方贴图/旗帜/地理数据及第三方运行库不因该许可证自动获得再授权；再分发前请遵循各自来源的条款。详见 [ASSET-LICENSING.md](ASSET-LICENSING.md)。
