(() => {
  'use strict';

  const grid = document.querySelector('.nav-showcase-grid');
  if (!grid) return;

  const buttons = [...grid.querySelectorAll('.nav-showcase-button')];
  const parentOrigin = (() => {
    try { return document.referrer ? new URL(document.referrer).origin : ''; }
    catch (_) { return ''; }
  })();

  let selectedIndex = -1;

  function applySelection(index, notifyParent) {
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= buttons.length) return false;

    selectedIndex = nextIndex;
    buttons.forEach((button, indexInGrid) => {
      const selected = indexInGrid === selectedIndex;
      button.classList.toggle('active', selected);
      button.classList.toggle('is-sample-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    if (notifyParent) {
      const detail = { index: selectedIndex, label: buttons[selectedIndex].getAttribute('aria-label') || '' };
      window.dispatchEvent(new CustomEvent('navigation-interaction:select', { detail }));
      if (window.parent !== window && parentOrigin) {
        window.parent.postMessage({ type: 'gongshui:navigation-interaction:select', ...detail }, parentOrigin);
      }
    }
    return true;
  }

  function resetSelection() {
    selectedIndex = -1;
    buttons.forEach(button => {
      button.classList.remove('active', 'is-sample-active');
      button.setAttribute('aria-pressed', 'false');
    });
  }

  grid.addEventListener('click', event => {
    const button = event.target.closest('.nav-showcase-button');
    if (button && grid.contains(button)) applySelection(button.dataset.navSample, true);
  });
  buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));

  window.addEventListener('message', event => {
    if (window.parent === window || !parentOrigin || event.source !== window.parent || event.origin !== parentOrigin) return;
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    if (message.type === 'gongshui:embed:language' && typeof message.lang === 'string') {
      document.documentElement.lang = message.lang.slice(0, 16);
      return;
    }
    if (message.type === 'gongshui:navigation-interaction:select') applySelection(message.index, false);
  });

  window.NavigationInteraction = {
    select: index => applySelection(index, true),
    reset: resetSelection,
    get selectedIndex() { return selectedIndex; },
    get count() { return buttons.length; }
  };
})();