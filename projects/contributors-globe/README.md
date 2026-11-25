# Contributors Globe / 投稿者地球

Version: **1.0.0** (first independent release)

A standalone interactive globe showing contributors by country. The project owns its renderer, data, geographic boundaries, flag assets, and Earth textures.

## Run

Serve this directory over HTTP (for example, with `python -m http.server`) and open `index.html`. WebGL is used when available; the renderer retains a list fallback when it is not.

## Structure

- `index.html` — standalone entry.
- `scripts/globe.js` — rendering, contributor normalization, interaction, and fallback.
- `styles/globe.css` — project styles.
- `data/contributors.json` — contributor records.
- `data/ne_110m_admin_0_countries.geojson` — country boundaries.
- `assets/earth/` — original Earth textures.
- `assets/flags/` — country flags.

## Runtime dependency

Globe.GL **2.46.2** is loaded from the pinned jsDelivr URL in `scripts/globe.js`. Globe.GL is distributed under the MIT License. See [upstream package and license](https://www.npmjs.com/package/globe.gl). The renderer falls back to the contributor list if WebGL or the 3D runtime is unavailable.

## Rights

The original Gongshui artwork and project source remain copyrighted by their author unless a file states otherwise. Third-party assets and libraries retain their own licenses. No blanket redistribution license is granted by this repository.
