# Repository guide

> Repository: `GSvegetable/gongshui-open-source`  
> Updated: 2026-11-26

## Scope and ownership

This repository is the source of truth for the implementations of all independently developed works displayed by Gongshui.com. The website repository, `gongshui-pages`, owns the platform shell: UI chrome, routing, authentication, account state, bookmarks and folders, search, settings, catalog metadata, and host-side adapters.

| # | Project | Source of truth | Standalone URL after deployment | Version |
|---|---|---|---|---|
| 1 | Pixel Daylight Switch | `projects/pixel-daylight-switch/` | `/pixel-daylight-switch/preview.html` | npm package 3.1.1 |
| 2 | Pixel Orbit | `projects/pixel-orbit/` | `/showcase.html` | 1.2.3 |
| 3 | Contributors Globe | `projects/contributors-globe/` | `/contributors-globe/` | 1.1.0 |
| 4 | The Bookmark Hall | `projects/bookmark-hall/` | `/bookmark-hall/` | 1.1.0 |
| 5 | Navigation Interaction System | `projects/navigation-interaction/` | `/navigation-interaction/` | 1.1.0 |

Each project owns its implementation, assets, tests, version, changelog and dependency notices. There is no monorepo-wide product version or blanket license. The first two projects retain their existing licensing terms. The migrated projects retain the original author's copyright unless a specific third-party license applies; do not infer a broad reuse license.

## Embed standard

All five projects provide standalone pages and an `embed.js` integration entry. Pixel Daylight Switch mounts its component runtime directly; Pixel Orbit uses a showcase iframe loader; Projects 3–5 use the common isolated iframe loader and a container-level `gongshuiEmbed` API. See [Embed API guide](EMBEDDING.md).

## Host / artwork boundary

The website must not contain a second authoritative copy of a project's renderer. It may contain a small host adapter, but that adapter may only:
- mount or iframe the deployed project;
- pass public data through a documented message/API contract;
- handle authentication, persistence, routing, and opening website detail views;
- handle graceful loading and error states.

A work must not read website globals, private localStorage keys, or host page selectors.

### Bookmark Hall bridge

The standalone corridor accepts:
`{ type: "gongshui:bookmark-hall:data", items: [...] }` from its parent window. Each item contains `id`, `title`, optional `en`, `desc`, `github`, `src`, `ratio`, and `folder`. The renderer emits `{ type: "gongshui:bookmark-hall:open", id }` when a frame is selected. The parent must validate `event.origin`, map bookmark/folder state to these public records, and perform any site navigation itself. The renderer never accesses AppState or localStorage.

### Contributors Globe

The standalone globe owns contributor data, geographic assets, language strings, and the open/close lifecycle. It no longer reads website i18n, navigation controls, or portfolio-card markup. Its embed API exposes `selectWork()` and `onOpenWork()`.

The current Globe.GL runtime is pinned to an exact jsDelivr version in the standalone script and is MIT-licensed. Its package license and version are documented upstream: https://www.npmjs.com/package/globe.gl

### Navigation Interaction System

This project is an independent 24-button interaction specimen with a public `select()` / `onSelect()` API. Actual routing and application navigation remain in `gongshui-pages`. The copied `portfolio-works.css` has been removed.

## Deployment

The root workflow `.github/workflows/deploy-project-sites.yml` assembles the published Pages site:
- `projects/pixel-orbit/` → site root (preserves existing URLs);
- `projects/pixel-daylight-switch/` → `/pixel-daylight-switch/`;
- the three extracted projects → `/contributors-globe/`, `/bookmark-hall/`, and `/navigation-interaction/`.

Do not point website iframes at `/projects/...`; that prefix is source-only and is not part of the deployed URL.

## Quality gates

Before a project is considered migrated:
1. Its standalone entry point must run without the portfolio host.
2. All runtime assets must be present in the deployed artifact.
3. Host communication must use a documented, origin-checked interface.
4. There must be no hidden dependency on website globals, private storage keys, or host DOM.
5. The website iframe integration must be tested.
6. The website's duplicate implementation must be removed or reduced to a host adapter.
7. Project version, changelog, dependency notices and root deployment workflow must be updated together.

The extraction branch is staged separately so the live website remains intact until the host-side cutover is verified.
