# Contributors Globe / 投稿者地球

Version: 2.10.0 (migration baseline)

This project contains the original globe renderer, its styling, contributor data, and the globe.gl runtime slot extracted from the Gongshui website.

## Source layout

- `scripts/globe.js` — rendering, contributor normalization, interaction, WebGL fallback.
- `styles/globe.css` — globe presentation.
- `data/contributors.json` — contributor records.
- `assets/earth/` — Earth textures (migration in progress).
- `assets/flags/` — country flags (migration in progress).
- `data/ne_110m_admin_0_countries.geojson` — country boundaries (migration in progress).

## Host boundary

The original implementation still contains website-specific selectors and callbacks (`#compass-view`, `siteI18n`, portfolio cards, and the GitHub issue submission route). Those are not part of the visual renderer's public API. The standalone host adapter must provide:
- a mount element and asset base URL;
- contributor data;
- optional translation and work-opening callbacks.

Do not delete the website's current runtime copy until the standalone preview and host adapter pass browser checks. This migration intentionally keeps the source website intact during extraction.

## License

The source files retain the licensing terms of their original repository and bundled dependencies. Do not assume that copying the files changes their license.
