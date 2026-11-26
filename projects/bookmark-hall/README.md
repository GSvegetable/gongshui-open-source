# The Bookmark Hall / 收藏长廊

Version: **1.1.0**

A procedural pixel-art palace corridor rendered with Canvas 2D. The visual experience is standalone; bookmark records arrive through a public data contract. The project never reads host website state or storage.

## Run independently

Serve this directory over HTTP and open `index.html`. With no data, the corridor shows its designed empty state.

## Embed in any website

    <div data-bookmark-hall-embed></div>
    <script src="https://gsvegetable.github.io/gongshui-open-source/bookmark-hall/embed.js"></script>

    const hall = document.querySelector('[data-gongshui-embed="bookmark-hall"]').gongshuiEmbed;
    hall.setItems([{ id: 'pixel-orbit', title: 'Pixel Orbit', folder: 'Worlds' }]);
    hall.onOpen(({ id }) => console.log('Open work:', id));

Optional attributes: `data-target`, `data-width`, `data-height`, `data-ratio`, `data-min-height`, `data-label`, `data-lang`, and `data-loading`.

Each item supports `id` (required), `title`, `en`, `desc`, `github`, `src`, `ratio`, and `folder`. URLs are sanitized and input is capped at 300 records. The host owns authentication, persistence, folder ordering, synchronization, and navigation.

Host → work: `gongshui:bookmark-hall:data`; work → host: `gongshui:bookmark-hall:open`. Incoming messages require the actual parent window and exact referrer origin; the loader validates iframe source and origin.
