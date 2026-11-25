# The Bookmark Hall / 收藏长廊

Version: 1.4.0 (migration baseline)

This directory contains the original Canvas 2D corridor renderer and styles.

## Important integration boundary

The current renderer is not yet standalone: it reads the website's bookmark state, bookmark folders, portfolio-card DOM, and site events. The independent project must receive a normalized list of bookmark records from its host through a documented adapter (recommended: `postMessage` with a strict origin check), and emit an `open-item` event when a frame is selected.

The host remains responsible for authentication, bookmark persistence, folders, cross-device sync, and opening the selected work. The artwork must not read the host's localStorage keys or internal AppState directly.

Do not remove the website runtime until the adapter has replaced these dependencies and the iframe flow is verified.
