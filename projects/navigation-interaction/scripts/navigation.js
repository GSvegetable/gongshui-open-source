(() => {
  'use strict';

  const grid = document.querySelector('.nav-showcase-grid');
  if (!grid) return;

  const allButtons = [...grid.querySelectorAll('.nav-showcase-button')];
  const params = new URLSearchParams(window.location.search);
  const rawSamples = params.get('samples');
  const requested = rawSamples ? rawSamples.split(',') : (params.has('sample') ? [params.get('sample')] : null);
  const validSamples = requested ? requested.map(Number).filter(n => Number.isInteger(n) && n >= 0 && n < allButtons.length) : null;
  const allowed = validSamples && validSamples.length ? new Set(validSamples) : null;
  const buttons = allButtons.filter(button => {
    const visible = !allowed || allowed.has(Number(button.dataset.navSample));
    button.hidden = !visible;
    return visible;
  });
  const columns = Math.max(1, Math.min(buttons.length || 1, Number(params.get('columns')) || Math.min(6, buttons.length || 1)));
  grid.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
  if (params.has('gap')) grid.style.gap = Math.max(0, Math.min(48, Number(params.get('gap')) || 0)) + 'px';
  const buttonSize = Number(params.get('button-size'));
  if (Number.isFinite(buttonSize) && buttonSize > 0) grid.style.setProperty('--nav-button-size', Math.max(24, Math.min(128, buttonSize)) + 'px');
  const showcase = grid.closest('.nav-showcase');
  if (showcase) {
    showcase.classList.toggle('is-filtered', !!allowed);
    showcase.classList.toggle('is-single-sample', buttons.length === 1);
  }
  const parentOrigin = (() => {
    try { return document.referrer ? new URL(document.referrer).origin : ''; }
    catch (_) { return ''; }
  })();

  let selectedIndex = -1;

  function applySelection(index, notifyParent) {
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= allButtons.length || !buttons.includes(allButtons[nextIndex])) return false;

    selectedIndex = nextIndex;
    allButtons.forEach((button, indexInGrid) => {
      const selected = indexInGrid === selectedIndex;
      button.classList.toggle('active', selected);
      button.classList.toggle('is-sample-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    if (notifyParent) {
      const detail = { index: selectedIndex, label: allButtons[selectedIndex].getAttribute('aria-label') || '' };
      window.dispatchEvent(new CustomEvent('navigation-interaction:select', { detail }));
      if (window.parent !== window && parentOrigin) {
        window.parent.postMessage({ type: 'gongshui:navigation-interaction:select', ...detail }, parentOrigin);
      }
    }
    return true;
  }

  function resetSelection() {
    selectedIndex = -1;
    allButtons.forEach(button => {
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
    if (message.type === 'gongshui:navigation-interaction:reset') {
      resetSelection();
      return;
    }
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
    get count() { return allButtons.length; },
    get visibleCount() { return buttons.length; }
  };
})();