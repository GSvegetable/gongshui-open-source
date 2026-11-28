/* Eight Components — isolated iframe embed loader.
 * The artwork runs in its own document so host styles never leak in.
 */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script) return;

  const base = new URL('./', script.src);
  const targetId = script.getAttribute('data-target');
  let slot = targetId ? document.getElementById(targetId) : script.previousElementSibling;
  let owns = false;

  if (!slot || (!targetId && !slot.hasAttribute('data-eight-components-embed'))) {
    slot = document.createElement('div');
    slot.setAttribute('data-eight-components-embed', '');
    owns = true;
    const insert = () => script.parentNode && script.parentNode.insertBefore(slot, script);
    if (document.body) insert();
    else document.addEventListener('DOMContentLoaded', insert, { once: true });
  }

  const oldStyle = slot.getAttribute('style');
  const oldChildren = [...slot.childNodes];

  slot.setAttribute('data-gongshui-embed', 'eight-components');
  slot.style.display = 'block';
  slot.style.width = script.getAttribute('data-width') || slot.style.width || '100%';
  slot.style.height =
    script.getAttribute('data-height') ||
    (slot.hasAttribute('data-embed-fill') ? '100%' : 'min(620px, 78vh)');
  slot.style.minHeight = slot.hasAttribute('data-embed-fill') ? '0' : '320px';
  slot.style.overflow = 'hidden';

  const frame = document.createElement('iframe');
  let resolveReady;
  const ready = new Promise(resolve => {
    resolveReady = resolve;
  });
  const onFrameLoad = () => resolveReady(true);
  frame.addEventListener('load', onFrameLoad, { once: true });

  const url = new URL('index.html', base);
  url.searchParams.set('embed', '1');
  url.searchParams.set('v', script.getAttribute('data-version') || '2.0.0');
  const theme = script.getAttribute('data-theme');
  if (theme) url.searchParams.set('theme', theme);
  const lang = script.getAttribute('data-lang') || document.documentElement.lang;
  if (lang) url.searchParams.set('lang', lang);

  frame.src = url.href;
  frame.title = script.getAttribute('data-label') || '八个组件 · Eight Components';
  frame.loading = script.getAttribute('data-loading') || 'lazy';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'fullscreen';
  frame.style.cssText =
    'display:block;width:100%;height:100%;min-height:inherit;border:0;margin:0;padding:0;background:transparent';

  slot.replaceChildren(frame);

  const api = {
    element: slot,
    iframe: frame,
    ready,
    setTheme(themeName) {
      const value = themeName === 'dark' ? 'dark' : 'light';
      try {
        frame.contentWindow.postMessage({ type: 'gongshui:embed:theme', theme: value }, '*');
      } catch (_) {
        /* 跨域时忽略 */
      }
      return value;
    },
    destroy() {
      frame.removeEventListener('load', onFrameLoad);
      resolveReady(false);
      if (owns) slot.remove();
      else {
        slot.replaceChildren(...oldChildren);
        if (oldStyle === null) slot.removeAttribute('style');
        else slot.setAttribute('style', oldStyle);
        slot.removeAttribute('data-gongshui-embed');
      }
      delete slot.gongshuiEmbed;
    }
  };

  slot.gongshuiEmbed = api;
  window.dispatchEvent(
    new CustomEvent('gongshui:embed:ready', {
      detail: { kind: 'eight-components', element: slot, iframe: frame, api }
    })
  );
})();
