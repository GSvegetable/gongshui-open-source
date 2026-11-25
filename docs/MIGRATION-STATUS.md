# Three-project extraction status

This migration is deliberately staged to avoid breaking the live website.

| Work | Extracted source | Still coupled / outstanding |
|---|---|---|
| Contributors Globe | renderer JS, CSS, contributor JSON | Earth textures, flags, country GeoJSON; host selectors, language and portfolio callbacks; standalone preview |
| Bookmark Hall | renderer JS and CSS | bookmark AppState/localStorage, folders, site events, portfolio-card DOM; postMessage host bridge; standalone preview |
| Navigation Interaction System | existing preview controller and styles | actual sample-board markup/interaction must become a self-contained project; site navigation remains host-owned |

## Ownership rule

- `gongshui-pages` owns the website shell, authentication, navigation, bookmark persistence, search, settings, portfolio catalog, and host adapters.
- `gongshui-open-source` owns artwork implementations, their assets, versions, documentation, tests, and standalone previews.
- A work is not considered fully migrated until the website no longer contains a second authoritative implementation and the deployed standalone preview passes a browser smoke test.

## Safety rule

Keep the existing website runtime in place until each migrated project has a deployed preview and the host integration is verified. A source-only copy is not a completed migration.
