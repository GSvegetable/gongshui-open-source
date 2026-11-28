/* Eight Components v3 — core helpers: embed mode, theme, small DOM / pointer utilities. */
(function () {
  'use strict';

  var root = document.documentElement;
  var params = new URLSearchParams(location.search);
  var EC = (window.EC = {});

  EC.embed = params.get('embed') === '1';
  if (EC.embed) root.classList.add('is-embed');

  EC.reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  EC.clamp = function (v, a, b) {
    return Math.min(b, Math.max(a, v));
  };
  EC.$ = function (sel, scope) {
    return (scope || document).querySelector(sel);
  };
  EC.$$ = function (sel, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(sel));
  };
  EC.buzz = function (pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch (_) {
      /* 不支持震动的设备直接忽略 */
    }
  };
  EC.visible = function (el, cb) {
    if (!('IntersectionObserver' in window)) {
      cb(true);
      return;
    }
    new IntersectionObserver(function (entries) {
      cb(entries[entries.length - 1].isIntersecting);
    }).observe(el);
  };

  /* 主题：?theme= 优先，其次系统偏好；宿主页面可以通过 postMessage 切换 */
  var toggle = EC.$('#theme-toggle');
  var label = EC.$('#theme-label');

  function applyTheme(name) {
    var value = name === 'dark' ? 'dark' : 'light';
    root.setAttribute('data-theme', value);
    if (toggle) toggle.setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
    if (label) label.textContent = value === 'dark' ? 'DARK' : 'LIGHT';
    return value;
  }
  EC.theme = applyTheme;

  var initial = params.get('theme');
  if (initial !== 'dark' && initial !== 'light') {
    initial =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  applyTheme(initial);

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.type === 'gongshui:embed:theme') applyTheme(d.theme);
  });
})();
