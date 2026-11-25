# Gongshui Independent Projects

The source-of-truth monorepo for the independent interactive works shown on [Gongshui.com](https://xn--3bts89a.com/). The website repository is the platform shell; this repository owns the works.

## Projects

| # | Project | Source | Live preview | Version |
|---|---|---|---|---|
| 1 | Pixel Daylight Switch | [Source](projects/pixel-daylight-switch/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/pixel-daylight-switch/preview.html) | 3.1.1 |
| 2 | Pixel Orbit | [Source](projects/pixel-orbit/) | [Showcase](https://gsvegetable.github.io/gongshui-open-source/showcase.html) | 1.2.3 |
| 3 | Contributors Globe / 投稿者地球 | [Source](projects/contributors-globe/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/contributors-globe/) | 1.0.0 |
| 4 | The Bookmark Hall / 收藏长廊 | [Source](projects/bookmark-hall/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/) | 1.0.0 |
| 5 | Navigation Interaction System / 导航交互系统 | [Source](projects/navigation-interaction/) | [Preview](https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/) | 1.0.0 |

## Architecture

- `gongshui-pages`: website UI, routing, login/account, bookmark persistence, search, settings, catalog and host adapters.
- `gongshui-open-source`: independent work implementations, assets, data, docs, tests, versions and deployment.

The website can embed a work and pass public data to it, but must not own a duplicate renderer or expose its private application state. See [Repository guide](docs/REPOSITORY-GUIDE.md) and [migration status](docs/MIGRATION-STATUS.md).

## Terms

There is no blanket license for this monorepo. Pixel Daylight Switch uses Unlicense; Pixel Orbit has no license specified and remains copyrighted by its author. The extracted projects retain the original author's rights and the terms of their third-party dependencies. Check each project's README and dependency notices before reuse or redistribution.

## 中文说明

这是宫水.com 五个独立作品的源码主仓库。网站仓库只负责平台本身，包括 UI、登录、账号、收藏数据、搜索、设置和作品目录；本仓库负责五个作品的实现、素材、数据、文档和版本。

第三至第五个作品已经建立独立入口。收藏长廊通过经过来源校验的 `postMessage` 接收网站传来的收藏记录，网站仍然负责账号、收藏持久化和打开详情；地球作品拥有自己的数据与贴图资源；导航交互系统只展示按钮交互样本，不接管网站真实导航。

没有全仓库通用许可证。请分别查看各作品的使用条款和第三方依赖许可证。
