# Embed API guide

All five works are independently hosted and embeddable without copying their source into a host website. Projects 3–5 now use the same two-line iframe-loader pattern.

Each loader isolates project CSS and JavaScript in an iframe, supports sizing and language attributes, exposes `element`, `iframe`, a project API, event subscriptions, and `destroy()`, and validates iframe source and origin before forwarding events. Use `data-embed-fill` when the host controls container dimensions.

See each project's README for its public API: [Pixel Daylight Switch](../projects/pixel-daylight-switch/README.md), [Pixel Orbit](../projects/pixel-orbit/README.md), [Contributors Globe](../projects/contributors-globe/README.md), [The Bookmark Hall](../projects/bookmark-hall/README.md), and [Navigation Interaction System](../projects/navigation-interaction/README.md).
