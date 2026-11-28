/* ============================================================
   八个组件 —— 共用运行时
   弹性积分、动效节拍、主题与宿主通信都放在这里，
   组件只管自己的物理。
   ============================================================ */

window.EC = (function () {
  'use strict';

  /* ---------- 小工具 ---------- */

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const round = (v, step = 1) => Math.round(v / step) * step;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.prototype.slice.call(root.querySelectorAll(sel));

  /* ---------- 动效偏好 ---------- */

  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  motionQuery.addEventListener('change', event => {
    reduced = event.matches;
    document.documentElement.classList.toggle('is-reduced', reduced);
    window.dispatchEvent(new CustomEvent('ec:motion', { detail: { reduced } }));
  });
  document.documentElement.classList.toggle('is-reduced', reduced);

  /* ---------- 弹性 ---------- */

  /**
   * 欠阻尼弹簧。k 越大越硬，d 越小越弹。
   * 减少动态效果时直接吸附到位，不留残余晃动。
   */
  class Spring {
    constructor(value = 0, options = {}) {
      this.value = value;
      this.target = value;
      this.velocity = 0;
      this.k = options.stiffness != null ? options.stiffness : 170;
      this.d = options.damping != null ? options.damping : 16;
      this.mass = options.mass != null ? options.mass : 1;
      this.rest = options.rest != null ? options.rest : 0.0004;
      this.settled = true;
    }

    to(target) {
      if (target !== this.target) {
        this.target = target;
        this.settled = false;
      }
      return this;
    }

    jump(value) {
      this.value = this.target = value;
      this.velocity = 0;
      this.settled = true;
      return this;
    }

    step(dt) {
      if (this.settled) return this.value;
      if (reduced) {
        this.value = this.target;
        this.velocity = 0;
        this.settled = true;
        return this.value;
      }
      const clamped = Math.min(dt, 0.064);
      const steps = Math.max(1, Math.ceil(clamped / 0.008));
      const h = clamped / steps;
      for (let i = 0; i < steps; i += 1) {
        const force = -this.k * (this.value - this.target) - this.d * this.velocity;
        this.velocity += (force / this.mass) * h;
        this.value += this.velocity * h;
      }
      if (Math.abs(this.velocity) < this.rest * 60 && Math.abs(this.value - this.target) < this.rest) {
        this.value = this.target;
        this.velocity = 0;
        this.settled = true;
      }
      return this.value;
    }
  }

  /* ---------- 单一动画循环 ---------- */

  const tickers = new Set();
  let running = false;
  let last = 0;

  function loop(now) {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    tickers.forEach(fn => {
      try {
        fn(now, dt);
      } catch (error) {
        tickers.delete(fn);
        console.error('[eight-components]', error);
      }
    });
    if (running) requestAnimationFrame(loop);
  }

  function addTicker(fn) {
    tickers.add(fn);
    if (!running) {
      running = true;
      last = 0;
      requestAnimationFrame(loop);
    }
    return () => tickers.delete(fn);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running && tickers.size) {
      running = true;
      last = 0;
      requestAnimationFrame(loop);
    }
  });

  /* ---------- 触感 ---------- */

  function haptic(pattern) {
    if (reduced) return;
    if (navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {
        /* 忽略 */
      }
    }
  }

  /* ---------- 拖拽 ---------- */

  /**
   * 统一的指针拖拽：按下捕获指针，移动时回调，回调收到相对位移。
   * 返回一个解绑函数。
   */
  function drag(element, handlers) {
    const onDown = event => {
      if (event.button != null && event.button !== 0) return;
      const startX = event.clientX;
      const startY = event.clientY;
      let moved = false;
      if (element.setPointerCapture) {
        try {
          element.setPointerCapture(event.pointerId);
        } catch (_) {
          /* 忽略 */
        }
      }
      if (handlers.start) handlers.start(event);

      const onMove = moveEvent => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        if (!moved && Math.abs(dx) + Math.abs(dy) > 2) moved = true;
        if (handlers.move) handlers.move(dx, dy, moveEvent);
      };

      const onUp = upEvent => {
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerup', onUp);
        element.removeEventListener('pointercancel', onUp);
        if (handlers.end) handlers.end(moved, upEvent);
      };

      element.addEventListener('pointermove', onMove);
      element.addEventListener('pointerup', onUp);
      element.addEventListener('pointercancel', onUp);
      if (handlers.stop) event.preventDefault();
    };

    element.addEventListener('pointerdown', onDown);
    return () => element.removeEventListener('pointerdown', onDown);
  }

  /* ---------- 主题 ---------- */

  const THEME_KEY = 'gongshui-eight-components-theme';

  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (_) {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* 隐私模式下忽略 */
    }
  }

  function systemTheme() {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme, persist) {
    const value = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', value);
    const toggle = $('#theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
      const label = $('#theme-label');
      if (label) label.textContent = value === 'dark' ? 'DARK' : 'LIGHT';
    }
    if (persist) saveTheme(value);
    window.dispatchEvent(new CustomEvent('ec:theme', { detail: { theme: value } }));
    return value;
  }

  function initTheme() {
    const fromUrl = new URLSearchParams(location.search).get('theme');
    applyTheme(fromUrl === 'dark' || fromUrl === 'light' ? fromUrl : storedTheme() || systemTheme(), false);
    const toggle = $('#theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next, true);
      });
    }
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light', false);
    });
  }

  /* ---------- 宿主通信 ---------- */

  function listenHost() {
    window.addEventListener('message', event => {
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'gongshui:embed:theme') {
        applyTheme(data.theme === 'dark' ? 'dark' : 'light', false);
      }
    });
  }

  /* ---------- 嵌入模式 ---------- */

  const EMBED = new URLSearchParams(location.search).get('embed') === '1';
  if (EMBED) document.documentElement.classList.add('is-embed');

  /**
   * 嵌入模式下每一格都很小，物件要按格子等比缩放才不会被裁掉。
   * 量一次自然尺寸，缓存下来，再按当前格子算缩放比。
   */
  function fitEmbeddedObjects() {
    if (!EMBED) return;
    const plates = $$('.plate');
    plates.forEach(plate => {
      const host = $('.plate-object', plate);
      const target = $('.object', plate);
      if (!host || !target) return;
      if (target.classList.contains('key-stage')) {
        target.style.setProperty('--fit', '1');
        return;
      }
      target.style.setProperty('--fit', '1');
      const natural = target.getBoundingClientRect();
      const width = natural.width;
      const height = natural.height;
      if (!width || !height) return;
      const cellWidth = host.clientWidth - 12;
      const cellHeight = host.clientHeight - 12;
      const scale = Math.min(cellWidth / width, cellHeight / height, 1);
      target.style.setProperty('--fit', Math.max(scale, 0.16).toFixed(3));
    });
  }

  let fitFrame = 0;
  function scheduleFit() {
    if (fitFrame) return;
    fitFrame = requestAnimationFrame(() => {
      fitFrame = 0;
      fitEmbeddedObjects();
    });
  }

  initTheme();
  listenHost();
  if (EMBED) {
    scheduleFit();
    window.addEventListener('resize', scheduleFit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
  }

  return {
    clamp, lerp, round, $, $$, Spring, addTicker, haptic, drag,
    applyTheme, systemTheme, EMBED, scheduleFit, fitEmbeddedObjects,
    get reduced() {
      return reduced;
    }
  };
})();
