# Navigation Interaction System / 导航交互系统

Version: **1.1.0**

An embeddable specimen of 24 tactile pixel-style button interactions. This standalone work owns its sample markup, visual states, selection behavior, and public API; it is not the website's actual navigation.

## Run independently

Serve this directory over HTTP and open `index.html`. Every sample is a real accessible button.

## Embed in any website

    <div data-navigation-interaction-embed></div>
    <script src="https://gsvegetable.github.io/gongshui-open-source/navigation-interaction/embed.js"></script>

    const specimen = document.querySelector('[data-gongshui-embed="navigation-interaction"]').gongshuiEmbed;
    specimen.select(7);
    specimen.onSelect(({ index, label }) => console.log(index, label));

Host → work: `gongshui:navigation-interaction:select` with zero-based `index` (0–23); work → host emits the same event with `index` and `label`. The loader validates iframe source and origin.
