# The Bookmark Hall / 收藏长廊

Version: **1.0.0** (first independent release)

A procedural pixel-art palace corridor rendered with Canvas 2D. The artwork is independent of the website platform and receives bookmark records from its embedding host.

## Run

Serve this directory over HTTP and open `index.html`. With no host data, the corridor starts in its empty state.

## Host bridge

Send a message to the iframe:

```js
iframe.contentWindow.postMessage({
  type: 'gongshui:bookmark-hall:data',
  items: [{
    id: 'pixel-orbit',
    title: 'Pixel Orbit',
    en: 'Pixel Orbit',
    desc: 'A pixel-art world.',
    github: 'https://github.com/GSvegetable/gongshui-open-source',
    src: 'https://gsvegetable.github.io/gongshui-open-source/showcase.html',
    ratio: 1.6439,
    folder: 'Worlds'
  }]
}, 'https://gsvegetable.github.io');
```

The renderer accepts this message only from its parent window and, when present, checks the sender origin against the embedding document's referrer origin. It emits `{ type: 'gongshui:bookmark-hall:open', id }` when the user opens a framed work. The parent must still validate the message origin before acting.

Each item supports `id`, `title`, `en`, `desc`, `github`, `src`, `ratio`, and `folder`. The host is responsible for authentication, bookmark persistence, folder ordering, cross-device sync, and site navigation. The renderer does not read `AppState`, localStorage, or portfolio DOM.

## Structure

- `index.html` — standalone entry.
- `scripts/bookmarks-corridor.js` — corridor renderer and host bridge.
- `styles/bookmarks-corridor.css` — visual styles.

## Rights

The original Gongshui artwork and project source remain copyrighted by their author unless a file states otherwise. No blanket redistribution license is granted by this repository.
