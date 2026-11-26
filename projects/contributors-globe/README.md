# Contributors Globe / 投稿者地球

Version: **1.1.0**

A standalone, embeddable interactive globe. The project owns its renderer, contributor data, boundaries, flags, Earth textures, local language strings, and public API.

## Run independently

Serve this directory over HTTP and open `index.html`. WebGL is used when available; a contributor-list fallback remains available without WebGL.

## Embed in any website

    <div data-contributors-globe-embed></div>
    <script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js"></script>

    const globe = document.querySelector('[data-gongshui-embed="contributors-globe"]').gongshuiEmbed;
    globe.selectWork('pixel-orbit');
    globe.onOpenWork(({ workId }) => console.log(workId));

Optional attributes: `data-target`, `data-width`, `data-height`, `data-ratio`, `data-min-height`, `data-label`, `data-lang` (`zh`, `en`, `ja`), and `data-loading`.

Host → work: `gongshui:contributors-globe:select-work`; work → host: `gongshui:contributors-globe:open-work`. The loader validates iframe source and origin.

Edit `data/contributors.json`; required fields are `name` and a two-letter `country`. Optional: `github`, `avatar`, `city`, `lat`, `lng`, `pin`, `works`, and `note`. Coordinates are rounded for privacy. Globe.GL 2.46.2 is pinned from jsDelivr and MIT-licensed.

The original Gongshui artwork and project source remain copyrighted by their author unless a file states otherwise.
