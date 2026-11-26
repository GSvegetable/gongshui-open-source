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
  const parentOrigin = (() => { try { return document.referrer ? new URL(document.referrer).origin : ''; } catch (_) { return ''; } })();
  const config = { iconColor: 'black', animations: true, clickBehavior: 'rebound', reboundDelay: 360, groupBehavior: 'exclusive' };
  const timers = new Map();
  let selectedIndex = -1;
  const sendSelection = index => {
    const detail = { index, label: allButtons[index].getAttribute('aria-label') || '' };
    window.dispatchEvent(new CustomEvent('navigation-interaction:select', { detail }));
    if (window.parent !== window && parentOrigin) window.parent.postMessage({ type: 'gongshui:navigation-interaction:select', ...detail }, parentOrigin);
  };
  const clearTimer = index => { if (timers.has(index)) { clearTimeout(timers.get(index)); timers.delete(index); } };
  const setPressed = (button, pressed) => {
    button.classList.toggle('active', pressed);
    button.classList.toggle('is-sample-active', pressed);
    button.setAttribute('aria-pressed', String(pressed));
  };
  const animate = button => {
    if (!config.animations) return;
    button.classList.remove('is-animating');
    void button.offsetWidth;
    button.classList.add('is-animating');
  };
  const clearOthers = except => allButtons.forEach((button, i) => {
    if (i !== except) { clearTimer(i); setPressed(button, false); }
  });
  const applyConfig = next => {
    if (!next || typeof next !== 'object') return;
    const previousBehavior = config.clickBehavior;
    const previousGroup = config.groupBehavior;
    if (next.iconColor === 'black' || next.iconColor === 'white') {
      config.iconColor = next.iconColor;
      if (showcase) showcase.classList.toggle('is-icon-white', config.iconColor === 'white');
    }
    if (typeof next.animations === 'boolean') {
      config.animations = next.animations;
      if (!config.animations) allButtons.forEach(button => button.classList.remove('is-animating'));
    }
    if (['none','hold','rebound'].includes(next.clickBehavior)) config.clickBehavior = next.clickBehavior;
    if (Number.isFinite(Number(next.reboundDelay))) config.reboundDelay = Math.max(0, Math.min(5000, Number(next.reboundDelay)));
    if (['independent','exclusive'].includes(next.groupBehavior)) config.groupBehavior = next.groupBehavior;

    // Changing interaction modes resets transient state so no button can keep
    // a pressed appearance that belongs to the previous mode.
    if (config.clickBehavior !== previousBehavior) resetSelection();

    // Switching from independent to exclusive collapses any existing multi-
    // selection to the most recently selected visible button.
    if (config.groupBehavior === 'exclusive' && previousGroup !== 'exclusive') {
      const active = allButtons.findIndex((button, index) => buttons.includes(button) && button.classList.contains('active') && index === selectedIndex);
      const keep = active >= 0 ? active : allButtons.findIndex(button => buttons.includes(button) && button.classList.contains('active'));
      if (keep >= 0) clearOthers(keep);
    }
  };
  const resetSelection = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    selectedIndex = -1;
    allButtons.forEach(button => setPressed(button, false));
  };
  const applySelection = (index, notifyParent) => {
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= allButtons.length || !buttons.includes(allButtons[nextIndex])) return false;
    const button = allButtons[nextIndex];
    animate(button);
    if (config.clickBehavior === 'none') {
      if (notifyParent) sendSelection(nextIndex);
      return true;
    }
    if (config.groupBehavior === 'exclusive') clearOthers(nextIndex);
    if (config.clickBehavior === 'hold') {
      const wasPressed = button.classList.contains('active');
      setPressed(button, !wasPressed);
      selectedIndex = wasPressed
        ? allButtons.findIndex(item => item.classList.contains('active'))
        : nextIndex;
    } else {
      setPressed(button, true);
      clearTimer(nextIndex);
      const timer = setTimeout(() => {
        setPressed(button, false);
        timers.delete(nextIndex);
        if (selectedIndex === nextIndex) {
          selectedIndex = allButtons.findIndex(item => item.classList.contains('active'));
        }
      }, config.reboundDelay);
      timers.set(nextIndex, timer);
      selectedIndex = nextIndex;
    }
    if (notifyParent) sendSelection(nextIndex);
    return true;
  };
  allButtons.forEach(button => button.setAttribute('aria-pressed', 'false'));
  applyConfig(config);
  grid.addEventListener('click', event => {
    const button = event.target.closest('.nav-showcase-button');
    if (button && grid.contains(button)) applySelection(button.dataset.navSample, true);
  });
  window.addEventListener('message', event => {
    if (window.parent === window || !parentOrigin || event.source !== window.parent || event.origin !== parentOrigin) return;
    const message = event.data;
    if (!message || typeof message !== 'object') return;
    if (message.type === 'gongshui:navigation-interaction:config') { applyConfig(message.config); return; }
    if (message.type === 'gongshui:navigation-interaction:reset') { resetSelection(); return; }
    if (message.type === 'gongshui:embed:language' && typeof message.lang === 'string') { document.documentElement.lang = message.lang.slice(0,16); return; }
    if (message.type === 'gongshui:navigation-interaction:select') applySelection(message.index, false);
  });
  window.NavigationInteraction = {
    select: index => applySelection(index, true),
    setIconColor: color => applyConfig({ iconColor: color === 'white' ? 'white' : 'black' }),
    configure: applyConfig,
    reset: resetSelection,
    get selectedIndex() { return selectedIndex; },
    get count() { return allButtons.length; },
    get visibleCount() { return buttons.length; },
    get config() { return { ...config }; }
  };
})();