# Three-project extraction status

Updated: 2026-11-26

## Extracted project implementations

| Work | Standalone entry | Owned assets/data | Website coupling in renderer |
|---|---|---|---|
| Contributors Globe | `projects/contributors-globe/index.html` | contributor JSON, GeoJSON, 4 Earth textures, 53 country flags, styles | no portfolio-card DOM; optional language uses document lang |
| The Bookmark Hall | `projects/bookmark-hall/index.html` | renderer and styles | no AppState/localStorage/portfolio DOM; receives normalized data via parent postMessage |
| Navigation Interaction System | `projects/navigation-interaction/index.html` | independent 24-button markup, styles, and interaction script | none; it is a specimen, not application navigation |

## Host responsibilities

- `gongshui-pages` remains responsible for UI shell, navigation/routing, login/account, bookmark persistence/folders, search, settings, and catalog/detail presentation.
- `gongshui-open-source` owns all five work implementations, their assets, data, documentation, versions, and quality checks.
- The website must embed the three new standalone URLs and send bookmark records to Bookmark Hall through the documented bridge.
- The old website copies must be removed only in the same coordinated cutover that updates the host integration.

## Deployment URLs

- `/contributors-globe/`
- `/bookmark-hall/`
- `/navigation-interaction/`

The root Pages workflow now copies all three directories into these public URL paths while preserving the existing first-two project URLs.

## Remaining cutover work

1. Update `gongshui-pages/scripts/portfolio-preview.js` to embed the three independent URLs, pass bookmark data, and validate iframe messages.
2. Replace the navigation sample markup with the standalone navigation iframe.
3. Remove the old globe renderer, corridor renderer, their duplicated assets, and their styles from `gongshui-pages`; preserve the blank bookmark navigation page as platform-owned UI.
4. Update website docs, cache query versions, and changelog.
5. Deploy the independent projects, verify all three public URLs, then verify the website embeds and bookmark bridge.
6. Run both repositories' CI workflows before closing the migration.

The source-extraction PR is staged independently. The live site remains unchanged until the website cutover is verified.
