# Gongshui Independent Projects

A monorepo for selected independently runnable works by Gongshui. Each project keeps its own source, documentation, release version and usage terms.

**Important:** this repository is not the source of every interactive work shown on [Gongshui.com](https://xn--3bts89a.com/). Website-coupled works remain in [`gongshui-pages`](https://github.com/GSvegetable/gongshui-pages).

## Projects

### 1. Pixel Daylight Switch

A pixel-art day/night switch with a refractive glass engine, embeddable components, scene plugins and mobile build workflows.

- Source: [`projects/pixel-daylight-switch/`](projects/pixel-daylight-switch/)
- Current npm package version: **3.1.1** — canonical value: [package.json](projects/pixel-daylight-switch/package.json)
- Terms: [Unlicense](projects/pixel-daylight-switch/LICENSE)
- [Live preview](https://gsvegetable.github.io/gongshui-open-source/pixel-daylight-switch/preview.html) · [Parameter lab](https://gsvegetable.github.io/gongshui-open-source/pixel-daylight-switch/demos/playground.html) · [npm package](https://www.npmjs.com/package/pixel-daylight-switch-gsvegetable)
- Docs: [English](projects/pixel-daylight-switch/README.md) · [简体中文](projects/pixel-daylight-switch/README.zh-CN.md) · [日本語](projects/pixel-daylight-switch/README.ja.md)

### 2. Pixel Orbit

A dependency-free pixel-art world with countryside, planet and ring-world scenes, a parameter lab and an embeddable showcase.

- Source: [`projects/pixel-orbit/`](projects/pixel-orbit/)
- Current project version: **1.2.3** — see [README](projects/pixel-orbit/README.md) and [CHANGELOG](projects/pixel-orbit/CHANGELOG.md)
- Usage terms: [No license specified; copyright remains with the author](projects/pixel-orbit/README.md#license). Do not redistribute or reuse the artwork or source without permission.
- [Play](https://gsvegetable.github.io/gongshui-open-source/play.html) · [Showcase](https://gsvegetable.github.io/gongshui-open-source/showcase.html) · [Lab](https://gsvegetable.github.io/gongshui-open-source/lab.html)

## Where the first five website works live

| # | Work | Source repository |
|---|---|---|
| 1 | Pixel Daylight Switch | This repository |
| 2 | Pixel Orbit | This repository |
| 3 | Contributors Globe | [`gongshui-pages`](https://github.com/GSvegetable/gongshui-pages/blob/main/scripts/globe.js) |
| 4 | The Bookmark Hall | [`gongshui-pages`](https://github.com/GSvegetable/gongshui-pages/blob/main/scripts/bookmarks-corridor.js) |
| 5 | Navigation Interaction System | [`gongshui-pages`](https://github.com/GSvegetable/gongshui-pages/blob/main/scripts/portfolio-preview.js) and its `index.html` / styles |

Works 3–5 currently depend on website data, state or presentation structure. They are intentionally not duplicated here. Their ownership and extraction requirements are documented in the [website architecture guide](https://github.com/GSvegetable/gongshui-pages/blob/main/docs/ARCHITECTURE.md).

## Repository structure

```text
.github/workflows/                 # Active monorepo automation
projects/
  pixel-daylight-switch/           # Pixel Daylight Switch source and docs
  pixel-orbit/                     # Pixel Orbit source and docs
docs/
  REPOSITORY-GUIDE.md              # Maintenance and architecture rules
README.md                          # This index
```

## Automation

Active workflows live only in the repository-root `.github/workflows/` directory:

- Pixel Daylight Switch: quality checks, mobile builds and npm publishing.
- Pixel Orbit: smoke tests and GitHub Pages deployment.
- The Pages deployment assembles the published site from both project directories, so deployed URLs intentionally omit the source-only `projects/` prefix.

Workflow snapshots nested inside project directories are retained from their standalone project histories; they are not active workflows in this monorepo. See [Repository guide](docs/REPOSITORY-GUIDE.md).

## Versioning and licenses

There is no single version number or blanket license for this repository. Pixel Daylight Switch and Pixel Orbit each maintain their own version and usage terms. Always check the relevant project’s `package.json`, changelog and `LICENSE` / README before publishing, reusing or redistributing code or artwork.

---

# 中文说明

这是宫水的独立作品集合仓库。每个项目单独维护源码、文档、版本号、许可证或使用条款。

**注意：** 这里并不包含宫水.com 展示的全部作品。依赖网站账号、收藏状态、页面 DOM 或其他站点能力的作品，仍由 [`gongshui-pages`](https://github.com/GSvegetable/gongshui-pages) 维护。

- **Pixel Daylight Switch：** 源码位于 `projects/pixel-daylight-switch/`，npm 版本为 **3.1.1**，许可证为 Unlicense。
- **Pixel Orbit：** 源码位于 `projects/pixel-orbit/`，当前项目版本为 **1.2.3**。项目没有指定许可证，版权仍归作者所有；未经许可不得重新分发或复用作品与源码。
- **投稿者地球、收藏长廊、导航交互系统：** 当前仍属于 `gongshui-pages`，因为它们依赖网站的数据、收藏状态或页面结构，并未复制到本仓库。

完整的目录职责、工作流、部署路径、版本规则与作品独立化条件，请阅读[仓库维护指南](docs/REPOSITORY-GUIDE.md)以及 [gongshui-pages 架构说明](https://github.com/GSvegetable/gongshui-pages/blob/main/docs/ARCHITECTURE.md)。
