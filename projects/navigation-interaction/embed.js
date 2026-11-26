/* Navigation Interaction System — standalone embed loader.
 * The host gets a small API; the artwork itself always runs in its own document.
 */
(() => {
  'use strict';

  const script = document.currentScript;
  if (!script) return;

  const baseUrl = new URL('./', script.src);
  const targetId = script.getAttribute('data-target');
  let slot = targetId ? document.getElementById(targetId) : script.previousElementSibling;
  let ownsSlot = false;

  if (!slot || (!targetId && !slot.hasAttribute('data-navigation-interaction-embed'))) {
    slot = document.createElement('div');
    slot.setAttribute('data-navigation-interaction-embed', '');
    ownsSlot = true;

    const insertSlot = () => {
      if (script.parentNode && script.parentNode !== document.head) script.parentNode.insertBefore(slot, script);
      else (document.body || document.documentElement).appendChild(slot);
    };

    if (document.body) insertSlot();
    else document.addEventListener('DOMContentLoaded', insertSlot, { once: true });
  }

  const previousStyle = slot.getAttribute('style');
  const previousEmbedKind = slot.getAttribute('data-gongshui-embed');
  const previousChildren = [...slot.childNodes];

  slot.setAttribute('data-gongshui-embed', 'navigation-interaction');
  slot.style.display = slot.style.display || 'block';
  const requestedSamples = (script.getAttribute('data-samples') || '').split(',').map(value => value.trim()).filter(Boolean);
  const singleSample = script.hasAttribute('data-sample') || requestedSamples.length === 1;
  const requestedButtonSize = Number(script.getAttribute('data-button-size'));
  const buttonSize = Number.isFinite(requestedButtonSize) && requestedButtonSize > 0 ? Math.max(24, Math.min(128, requestedButtonSize)) : 48;
  const singleMountSize = (buttonSize + 36) + 'px';
  slot.style.width = script.getAttribute('data-width') || slot.style.width || (singleSample ? singleMountSize : '100%');

  if (script.hasAttribute('data-height')) {
    slot.style.height = script.getAttribute('data-height');
  } else if (singleSample && !slot.hasAttribute('data-embed-fill') && !slot.style.height) {
    slot.style.height = singleMountSize;
    slot.style.aspectRatio = '1';
    slot.style.minHeight = '0';
  } else if (!slot.hasAttribute('data-embed-fill') && !slot.style.height) {
    slot.style.aspectRatio = script.getAttribute('data-ratio') || '1.6439';
    slot.style.minHeight = script.getAttribute('data-min-height') || '280px';
  }

  if (!slot.hasAttribute('data-embed-fill') && !slot.style.position) slot.style.position = 'relative';
  slot.style.overflow = 'hidden';

  const frameUrl = new URL('index.html', baseUrl);
  frameUrl.searchParams.set('embed', '1');
  const initialLanguage = script.getAttribute('data-lang') || document.documentElement.lang;
  if (initialLanguage) frameUrl.searchParams.set('lang', initialLanguage);
  ['sample', 'samples', 'columns', 'gap', 'button-size'].forEach(key => {
    const value = script.getAttribute('data-' + key);
    if (value !== null) frameUrl.searchParams.set(key, value);
  });

  const frame = document.createElement('iframe');
  frame.src = frameUrl.href;
  frame.title = script.getAttribute('data-label') || 'Navigation Interaction System';
  frame.loading = script.getAttribute('data-loading') || 'lazy';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allow = 'fullscreen; accelerometer; gyroscope';
  frame.setAttribute('allowfullscreen', '');
  frame.style.cssText = 'display:block;width:100%;height:100%;border:0;margin:0;padding:0;background:transparent;';
  slot.replaceChildren(frame);

  const frameOrigin = new URL(frame.src).origin;
  const listeners = new Set();
  const pendingMessages = [];
  let frameReady = false;
  let destroyed = false;
  let resolveReady;
  const ready = new Promise(resolve => { resolveReady = resolve; });

  const send = message => {
    if (destroyed || !message || !frame.contentWindow) return;
    if (!frameReady) pendingMessages.push(message);
    else frame.contentWindow.postMessage(message, frameOrigin);
  };

  const onFrameLoad = () => {
    frameReady = true;
    resolveReady(true);
    while (pendingMessages.length) frame.contentWindow.postMessage(pendingMessages.shift(), frameOrigin);
  };

  const onWindowMessage = event => {
    if (event.source !== frame.contentWindow || event.origin !== frameOrigin) return;
    const message = event.data;
    if (!message || message.type !== 'gongshui:navigation-interaction:select') return;
    listeners.forEach(listener => listener(message));
    slot.dispatchEvent(new CustomEvent('gongshui:navigation-interaction:select', { detail: message }));
  };

  frame.addEventListener('load', onFrameLoad);
  window.addEventListener('message', onWindowMessage);

  const api = {
    element: slot,
    iframe: frame,
    ready,
    select: function (index) {
      send({ type: 'gongshui:navigation-interaction:select', index: Number(index) });
    },
    setLanguage(language) {
      const lang = String(language || '').trim();
      if (lang) send({ type: 'gongshui:embed:language', lang });
    },
    reset() {
      send({ type: 'gongshui:navigation-interaction:reset' });
    },
    onSelect(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resolveReady(false);
      listeners.clear();
      pendingMessages.length = 0;
      languageObserver.disconnect();
      frame.removeEventListener('load', onFrameLoad);
      window.removeEventListener('message', onWindowMessage);
      frame.remove();

      if (ownsSlot) slot.remove();
      else {
        slot.replaceChildren(...previousChildren);
        if (previousStyle === null) slot.removeAttribute('style');
        else slot.setAttribute('style', previousStyle);
        if (previousEmbedKind === null) slot.removeAttribute('data-gongshui-embed');
        else slot.setAttribute('data-gongshui-embed', previousEmbedKind);
        delete slot.gongshuiEmbed;
      }
    }
  };

  const languageObserver = new MutationObserver(() => api.setLanguage(document.documentElement.lang));
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  slot.gongshuiEmbed = api;
  window.dispatchEvent(new CustomEvent('gongshui:embed:ready', {
    detail: { kind: 'navigation-interaction', element: slot, iframe: frame, api }
  }));
})();