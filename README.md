# Gongshui Independent Projects

宫水.com 独立交互作品与可复用 UI 组件的源码仓库。网站仓库负责平台 UI、账号、路由和数据持久化；本仓库负责作品本身、组件 API、素材、文档、测试与版本。

## Projects

| # | Project | Source | Live preview | Version |
|---|---|---|---|---|
| 1 | Pixel Daylight Switch | [Source](projects/pixel-daylight-switch/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/pixel-daylight-switch/preview.html) | 3.1.1 |
| 2 | Pixel Orbit | [Source](projects/pixel-orbit/) | [Showcase](https://gsvegetable.github.io/gongshui-open-source/showcase.html) | 1.2.3 |
| 3 | Contributors Globe / 投稿者地球 | [Source](projects/contributors-globe/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/contributors-globe/) | 1.2.0 |
| 4 | The Bookmark Hall / 收藏长廊 | [Source](projects/bookmark-hall/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/) | 1.2.0 |
| 5 | Navigation Interaction System / 导航交互系统 | [Source](projects/navigation-interaction/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/) | 1.2.0 |

## 作为 UI 组件使用

项目 3–5 不只是独立网页：支持 script-only 一行嵌入、可选容器、独立 API、单项/多项筛选和宿主数据注入。

- [完整嵌入与 API 指南](docs/EMBEDDING.md)
- [投稿者地球](projects/contributors-globe/README.md)：可以只嵌入干净地球，不显示投稿者旗帜、搜索和控制图标。
- [收藏长廊](projects/bookmark-hall/README.md)：传入你自己的数组，支持一件或多件收藏，不依赖本站账号。
- [导航交互系统](projects/navigation-interaction/README.md)：24 个按钮可按索引单独取用，也可组合展示。

## Architecture

- `gongshui-pages`: 网站 UI、导航、登录账号、收藏持久化、搜索、设置、作品目录和宿主适配。
- `gongshui-open-source`: 独立作品实现、公开组件 API、素材、数据、文档、版本和部署。

## Licensing

没有全仓库统一许可证。项目 1–2 保留各自现有条款；项目 3–5 的原创源代码分别采用 MIT，第三方依赖、媒体、数据和投稿者内容遵循各自条款。

## English

This repository contains standalone interactive works and reusable UI components. Projects 3–5 support one-line script installation, isolated rendering, public JavaScript APIs, configurable composition, and independent project-level MIT licenses for original source code.

- [Embed guide and API reference](docs/EMBEDDING.md)
- [Contributors Globe](projects/contributors-globe/README.md) — use the globe alone or selectively show pins, search, and controls.
- [Bookmark Hall](projects/bookmark-hall/README.md) — provide your own array; one item or a collection works without our account system.
- [Navigation Interaction](projects/navigation-interaction/README.md) — embed one button or any subset of the 24 samples.

The repository has no blanket license. Projects 1–2 retain their existing terms. For projects 3–5, MIT applies to original source code/styles only; third-party assets, personal data, dependencies, and supplied content retain their own terms.
