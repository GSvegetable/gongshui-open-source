# Three-project extraction status

Updated: 2026-11-26

<badge>Completed source extraction and website cutover</badge>

## Final ownership

| Work | Source of truth | Standalone entry | Host coupling |
|---|---|---|---|
| Contributors Globe | `projects/contributors-globe/` | `index.html` | project-owned contributor data and assets; optional origin-checked host selection message |
| The Bookmark Hall | `projects/bookmark-hall/` | `index.html` | receives normalized bookmark records through parent postMessage; no website storage or globals |
| Navigation Interaction System | `projects/navigation-interaction/` | `index.html` | none; independent 24-button specimen |

The first two works remain in `projects/pixel-daylight-switch/` and `projects/pixel-orbit/`. All five works now have one source of truth in this repository.

## Website platform responsibilities

`gongshui-pages` retains the website UI, routing/navigation, authentication, account state, bookmark persistence/folders, search, settings, Supabase, portfolio catalog/detail panels, and a thin host adapter. It no longer contains the three extracted artwork renderers or their artwork-only assets.

The blank bookmark navigation handoff page remains a website platform page. It is not the Bookmark Hall artwork.

## Published URLs

- Pixel Daylight Switch: `/pixel-daylight-switch/preview.html`
- Pixel Orbit: `/showcase.html`
- Contributors Globe: `/contributors-globe/`
- The Bookmark Hall: `/bookmark-hall/`
- Navigation Interaction System: `/navigation-interaction/`

The Pages deployment workflow assembles all five projects while preserving the existing first-two URLs.

## Completed integration and verification

- `gongshui-open-source` PR #2 merged.
- `gongshui-pages` PR #60 merged.
- Independent project quality workflow passed: JavaScript syntax, required assets/data, bookmark-renderer isolation, and navigation specimen count.
- Website shell quality workflow passed: host-adapter syntax, iframe URLs, message contracts, and absence of old renderer references.
- Independent project GitHub Pages deployment completed successfully, including the standalone-entry verification step.
- Website GitHub Pages deployment completed successfully.

A final visual check on real mobile/tablet browsers remains useful for appearance and touch feel, but the repository ownership and deployment cutover are complete.
