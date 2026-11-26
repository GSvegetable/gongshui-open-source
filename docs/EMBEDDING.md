# Embed API guide

All five works are independently hosted and provide an `embed.js` integration entry. Their internal adapters are intentionally not forced into one implementation: Pixel Daylight Switch mounts its component runtime directly, Pixel Orbit uses a showcase iframe, and Contributors Globe, Bookmark Hall, and Navigation Interaction use the common isolated iframe loader described below.

## Projects 3–5: common two-line pattern

    <div data-contributors-globe-embed></div>
    <script src="https://gsvegetable.github.io/gongshui-open-source/contributors-globe/embed.js"></script>

Use the matching marker and script URL for Bookmark Hall or Navigation Interaction. Each loader accepts `data-target`, `data-width`, `data-height`, `data-ratio`, `data-min-height`, `data-label`, `data-lang`, and `data-loading`. Use `data-embed-fill` when the host controls the container dimensions.

The target exposes `gongshuiEmbed`, with project methods, an event subscription method, `setLanguage()`, and `destroy()`. Loaders preserve the target's original children and inline styles on teardown, queue host messages until the iframe is ready, validate iframe source and origin, and follow later changes to the host document language.

## Project-specific APIs

- Contributors Globe: `selectWork(id)`, `onOpenWork(callback)`.
- Bookmark Hall: `setItems(items)`, `onOpen(callback)`.
- Navigation Interaction: `select(index)`, `onSelect(callback)`.

See the individual project READMEs for message names, data schemas, and usage examples.

## First two works

- [Pixel Daylight Switch](../projects/pixel-daylight-switch/README.md) uses its component-scoped direct-mount runtime and also supports script-only installation.
- [Pixel Orbit](../projects/pixel-orbit/README.md) uses its showcase iframe loader, with scene and composition attributes.
