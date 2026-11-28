/* ============================================================
   八个组件 —— 控件逻辑
   每件控件只负责自己的物理，动效与主题在 core.js。
   ============================================================ */

(function () {
  'use strict';

  const EC = window.EC;
  if (!EC) return;
  const { clamp, $, $$, Spring, addTicker, haptic, drag } = EC;

  /* ============================================================
     01 压印 · HOLD
     按住 0.9 秒把环填满，松手退回，填满落蜡封。
     ============================================================ */

  (function holdToConfirm() {
    const el = $('#hold');
    if (!el) return;
    const ring = $('.progress', el);
    const face = $('.plunger-face', el);
    const IDLE = '按住<small>确认</small>';
    const DONE = '已删除';
    const HOLD_MS = 900;
    const RELEASE_MS = 260;

    let progress = 0;
    let holding = false;
    let done = false;
    let raf = 0;
    let last = 0;
    let resetTimer = 0;

    function paint() {
      el.style.setProperty('--p', progress.toFixed(4));
      ring.style.strokeDashoffset = (100 * (1 - progress)).toFixed(2);
    }

    function tick(now) {
      const dt = Math.min(50, now - last);
      last = now;
      progress = holding
        ? Math.min(1, progress + dt / HOLD_MS)
        : Math.max(0, progress - dt / RELEASE_MS);
      paint();
      if (progress >= 1) {
        finish();
        raf = 0;
        return;
      }
      raf = holding || progress > 0 ? requestAnimationFrame(tick) : 0;
    }

    function start() {
      if (done) return;
      holding = true;
      el.classList.add('is-holding');
      last = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function release() {
      holding = false;
      el.classList.remove('is-holding');
    }

    function finish() {
      done = true;
      holding = false;
      el.classList.remove('is-holding');
      el.classList.add('is-done');
      face.innerHTML = DONE;
      el.setAttribute('aria-label', '已删除');
      haptic(24);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(reset, 2100);
    }

    function reset() {
      done = false;
      progress = 0;
      paint();
      el.classList.remove('is-done');
      face.innerHTML = IDLE;
      el.setAttribute('aria-label', '按住 0.9 秒确认删除');
    }

    el.addEventListener('pointerdown', event => {
      if (event.button != null && event.button !== 0) return;
      if (el.setPointerCapture) {
        try {
          el.setPointerCapture(event.pointerId);
        } catch (_) {
          /* 忽略 */
        }
      }
      event.preventDefault();
      start();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => {
      el.addEventListener(name, release);
    });
    window.addEventListener('blur', release);

    el.addEventListener('keydown', event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      if (!event.repeat) start();
    });
    el.addEventListener('keyup', event => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      event.preventDefault();
      release();
    });
    el.addEventListener('blur', release);
    el.addEventListener('contextmenu', event => event.preventDefault());

    paint();
  })();

  /* ============================================================
     02 拨钮 · TOGGLE
     拇指压着红皮筋推过去，越过卡位被拽回来。
     ============================================================ */

  (function elasticToggle() {
    const toggles = $$('[data-toggle]');
    if (!toggles.length) return;

    toggles.forEach(el => {
      const thumb = $('.toggle-thumb', el);
      const cord = $('.toggle-cord', el);
      const cordShadow = $('.toggle-cord-shadow', el);
      const X0 = 5;
      const TRAVEL = 60;
      const ANCHOR = 12;
      const THUMB_W = 48;
      const REST = 46;

      const spring = new Spring(el.getAttribute('aria-checked') === 'true' ? 1 : 0, {
        stiffness: 260,
        damping: 15
      });
      let dragging = false;

      function cordPath(x) {
        const tx = X0 + x * TRAVEL + THUMB_W / 2;
        const dist = tx - ANCHOR;
        const sag = Math.max(0, REST - dist) * 0.3;
        const over = Math.max(0, dist - REST);
        const mid = (ANCHOR + tx) / 2;
        const control = 29 + sag * 2;
        el.style.setProperty('--stretch', Math.min(1, over / 26).toFixed(3));
        return 'M' + ANCHOR + ' 29 Q' + mid.toFixed(1) + ' ' + control.toFixed(1) + ' ' + tx.toFixed(1) + ' 29';
      }

      function paint() {
        const x = spring.value;
        thumb.style.transform = 'translate3d(' + (X0 + x * TRAVEL).toFixed(2) + 'px,0,0)';
        const d = cordPath(x);
        cord.setAttribute('d', d);
        cordShadow.setAttribute('d', d);
      }

      function settle() {
        const on = el.getAttribute('aria-checked') === 'true';
        spring.to(on ? 1 : 0);
      }

      function flip() {
        const on = el.getAttribute('aria-checked') !== 'true';
        el.setAttribute('aria-checked', on ? 'true' : 'false');
        spring.to(on ? 1 : 0);
        haptic(on ? 12 : 8);
      }

      el.addEventListener('click', event => {
        if (event.detail === 0) return;
        flip();
      });

      drag(el, {
        start() {
          dragging = true;
          spring.settled = true;
        },
        move(dx, dy, event) {
          const rect = el.getBoundingClientRect();
          const scale = TRAVEL / (rect.width - X0 - THUMB_W - 5);
          const next = clamp((event.clientX - rect.left - X0 - THUMB_W / 2) / (rect.width - X0 - THUMB_W - 5), 0, 1);
          spring.jump(next);
          paint();
        },
        end(moved) {
          dragging = false;
          if (moved) {
            const on = spring.value > 0.5;
            if (on !== (el.getAttribute('aria-checked') === 'true')) {
              el.setAttribute('aria-checked', on ? 'true' : 'false');
              haptic(8);
            }
            spring.to(on ? 1 : 0);
          } else {
            settle();
          }
        }
      });

      addTicker((now, dt) => {
        spring.step(dt);
        paint();
      });

      paint();
    });
  })();

  /* ============================================================
     03 钤印 · STAMP
     勾选后印章落下，纸面留下一点凹痕与墨晕。
     ============================================================ */

  (function stampLedger() {
    const rows = $$('.ledger-row');
    if (!rows.length) return;
    rows.forEach(row => {
      const input = $('input', row);
      input.addEventListener('change', () => {
        haptic(input.checked ? [10, 40, 16] : 8);
      });
    });
  })();

  /* ============================================================
     04 弦 · STRING
     钢弦的泛音列：松手后按 n² 衰减，频率按整数倍。
     ============================================================ */

  (function stringSlider() {
    const svg = $('#string');
    if (!svg) return;
    const wire = $('#wire', svg);
    const shadow = $('#wire-shadow', svg);
    const gloss = $('#wire-gloss', svg);
    const envelope = $('#wire-envelope', svg);
    const marker = $('#string-marker', svg);
    const frets = $('#string-frets', svg);
    const readout = $('#string-readout');

    const X0 = 30;
    const W = 276;
    const Y0 = 46;
    const N = 84;
    const M = 7;
    const BASE = 2.6;
    const OMEGA = 2 * Math.PI * BASE;

    let mode = 'rest';
    let u = 0.4;
    let h = 0;
    let started = 0;
    let co = [];

    for (let i = 0; i <= 10; i += 1) {
      const x = X0 + (W * i) / 10;
      const major = i % 5 === 0;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', major ? 86 : 90);
      line.setAttribute('x2', x);
      line.setAttribute('y2', 100);
      line.setAttribute('class', major ? 'string-fret major' : 'string-fret');
      frets.appendChild(line);
      if (i % 2 === 0) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', 113);
        text.setAttribute('class', 'string-num');
        text.textContent = String(i * 10);
        frets.appendChild(text);
      }
    }

    const value = () => Math.round(clamp((u - 0.02) / 0.96, 0, 1) * 100);

    function sync() {
      const v = value();
      if (readout) readout.textContent = String(v);
      svg.setAttribute('aria-valuenow', String(v));
    }

    function pluck(height, at) {
      u = clamp(at, 0.02, 0.98);
      sync();
      if (EC.reduced) {
        mode = 'rest';
        return;
      }
      co = [];
      for (let n = 1; n <= M; n += 1) {
        co[n] = (2 * height) / (n * n * Math.PI * Math.PI * u * (1 - u)) * Math.sin(n * Math.PI * u);
      }
      started = performance.now();
      mode = 'free';
    }

    function shape(t) {
      let y = 0;
      for (let n = 1; n <= M; n += 1) {
        y += co[n] * Math.sin(n * Math.PI * t) * Math.cos(n * OMEGA * t) * Math.exp(-(1.1 + 0.35 * n) * t);
      }
      return y;
    }

    function amplitude(t) {
      let a = 0;
      for (let n = 1; n <= M; n += 1) {
        a += Math.abs(co[n] * Math.sin(n * Math.PI * t)) * Math.exp(-(1.1 + 0.35 * n) * t);
      }
      return a;
    }

    function draw(now) {
      const t = (now - started) / 1000;
      if (mode === 'free' && t > 4.2) mode = 'rest';

      const pts = [];
      const upper = [];
      const lower = [];
      for (let i = 0; i <= N; i += 1) {
        const s = i / N;
        const x = (X0 + W * s).toFixed(2);
        let y = 0;
        if (mode === 'drag') {
          y = h * (s <= u ? s / u : (1 - s) / (1 - u));
        } else if (mode === 'free') {
          y = shape(s, t);
        }
        pts.push(x + ',' + (Y0 + y).toFixed(2));
        if (mode === 'free') {
          const a = amplitude(s);
          upper.push(x + ',' + (Y0 - a).toFixed(2));
          lower.push(x + ',' + (Y0 + a).toFixed(2));
        }
      }

      const d = 'M' + pts.join('L');
      wire.setAttribute('d', d);
      shadow.setAttribute('d', d);
      if (gloss) gloss.setAttribute('d', d);

      if (mode === 'free') {
        lower.reverse();
        envelope.setAttribute('d', 'M' + upper.join('L') + 'L' + lower.join('L') + 'Z');
        envelope.style.opacity = '1';
      } else {
        envelope.setAttribute('d', '');
        envelope.style.opacity = '0';
      }

      const tipY = mode === 'free' ? shape(u, t) : mode === 'drag' ? h * 1 : 0;
      marker.setAttribute('transform', 'translate(' + (X0 + W * u).toFixed(2) + ' ' + (Y0 + tipY).toFixed(2) + ')');
    }

    function locate(event) {
      const rect = svg.getBoundingClientRect();
      const scale = 340 / rect.width;
      const x = (event.clientX - rect.left) * scale;
      const y = (event.clientY - rect.top) * scale;
      u = clamp((x - X0) / W, 0.02, 0.98);
      h = 26 * Math.tanh((y - Y0) / 30);
      sync();
    }

    svg.addEventListener('pointerdown', event => {
      if (svg.setPointerCapture) {
        try {
          svg.setPointerCapture(event.pointerId);
        } catch (_) {
          /* 忽略 */
        }
      }
      event.preventDefault();
      mode = 'drag';
      locate(event);
    });
    svg.addEventListener('pointermove', event => {
      if (mode === 'drag') locate(event);
    });
    const release = () => {
      if (mode !== 'drag') return;
      pluck(h, u);
      haptic(6);
    };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);

    svg.addEventListener('keydown', event => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      u = clamp(u + step * (event.shiftKey ? 0.1 : 0.01), 0.02, 0.98);
      sync();
      pluck(14, u);
    });

    sync();
    draw(performance.now());
    addTicker(draw);
  })();

  /* ============================================================
     05 旋钮 · KNOB
     绕圈拖动，刻度随数值点亮。
     ============================================================ */

  (function rotaryKnob() {
    const dial = $('#dial');
    if (!dial) return;
    const body = $('#dial-body', dial);
    const ticksGroup = $('#dial-ticks', dial);
    const valueLabel = $('#dial-value', dial);

    const START = -135;
    const SWEEP = 270;
    const STEPS = 20;
    const CX = 119;
    const CY = 119;

    let value = 40;
    let dragging = false;
    let lastAngle = 0;

    const ticks = [];
    const numerals = [];
    for (let i = 0; i <= STEPS; i += 1) {
      const v = (i / STEPS) * 100;
      const angle = ((START + (v / 100) * SWEEP) * Math.PI) / 180;
      const major = i % 4 === 0;
      const r1 = 112;
      const r2 = major ? 99 : 104;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (CX + r1 * Math.sin(angle)).toFixed(2));
      line.setAttribute('y1', (CY - r1 * Math.cos(angle)).toFixed(2));
      line.setAttribute('x2', (CX + r2 * Math.sin(angle)).toFixed(2));
      line.setAttribute('y2', (CY - r2 * Math.cos(angle)).toFixed(2));
      line.setAttribute('class', 'dial-tick' + (major ? ' major' : ''));
      ticksGroup.appendChild(line);
      ticks.push(line);
      if (major) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const rr = 88;
        text.setAttribute('x', (CX + rr * Math.sin(angle)).toFixed(2));
        text.setAttribute('y', (CY - rr * Math.cos(angle) + 3).toFixed(2));
        text.setAttribute('class', 'dial-num');
        text.textContent = String(Math.round(v));
        ticksGroup.appendChild(text);
        numerals[i] = text;
      }
    }

    function set(next) {
      const v = clamp(next, 0, 100);
      const changed = v !== value;
      value = v;
      body.style.transform = 'rotate(' + (START + (v / 100) * SWEEP).toFixed(2) + 'deg)';
      valueLabel.textContent = String(Math.round(v));
      dial.setAttribute('aria-valuenow', String(Math.round(v)));
      ticks.forEach((line, index) => {
        const on = (index / STEPS) * 100 <= v + 0.01;
        line.classList.toggle('on', on);
        const num = numerals[index];
        if (num) num.classList.toggle('on', on);
      });
      if (changed && Math.round(v) % 5 === 0) haptic(3);
    }

    function angleOf(event) {
      const rect = dial.getBoundingClientRect();
      return (Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI;
    }

    drag(dial, {
      start(event) {
        dragging = true;
        lastAngle = angleOf(event);
      },
      move(dx, dy, event) {
        if (!dragging) return;
        const angle = angleOf(event);
        let delta = angle - lastAngle;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        lastAngle = angle;
        set(value + delta / (SWEEP / 100));
      },
      end() {
        dragging = false;
      }
    });

    dial.addEventListener('keydown', event => {
      const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
      if (map[event.key] != null) {
        event.preventDefault();
        set(value + map[event.key] * (event.shiftKey ? 10 : 1));
      } else if (event.key === 'Home') {
        event.preventDefault();
        set(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        set(100);
      }
    });

    set(40);
  })();

  /* ============================================================
     06 计数轮 · COUNTER
     三只机械数字轮：个位自由转，十位由个位带动，百位由十位带动。
     ============================================================ */

  (function mechanicalCounter() {
    const windowEl = $('#counter-window');
    if (!windowEl) return;
    const wheels = $$('.counter-wheel', windowEl);
    const down = $('#count-down');
    const up = $('#count-up');
    const CELL = 1.2;
    const STRIP = 30;

    let value = 128;

    const state = wheels.map(wheel => {
      const strip = $('.counter-strip', wheel);
      strip.textContent = '';
      for (let i = 0; i < STRIP; i += 1) {
        const cell = document.createElement('span');
        cell.textContent = String(i % 10);
        strip.appendChild(cell);
      }
      const spring = new Spring(0, { stiffness: 620, damping: 34 });
      return { wheel, strip, spring };
    });

    function paint(entry, pos) {
      // 数字轮是一条按 0-9 循环的长条。位置可以一直累加，
      // 但要折回一个 20 格（两个完整周期）的窗口里——回退 20 格在像素上完全等价，
      // 所以无论计到多少位，轮子看起来都是连续转过去的。
      const k = pos + 10 - 20 * Math.floor(pos / 20);
      entry.strip.style.transform = 'translate3d(0,' + (-k * CELL).toFixed(4) + 'em,0)';
    }

    function place(next) {
      const clamped = clamp(next, 0, 999);
      const changed = clamped !== value;
      value = clamped;
      // 三只轮子按位次各自进位：个位连续累加，十位由个位带动，百位由十位带动。
      state.forEach(entry => {
        const place10 = Number(entry.wheel.dataset.wheel);
        const target = place10 === 0 ? value : place10 === 1 ? Math.floor(value / 10) : Math.floor(value / 100);
        entry.spring.to(target);
      });
      windowEl.setAttribute('aria-label', '计数 ' + value);
      const hundreds = state.find(entry => entry.wheel.dataset.wheel === '2');
      if (hundreds) hundreds.wheel.classList.toggle('is-leading', value < 100);
      down.disabled = value <= 0;
      up.disabled = value >= 999;
      if (changed) haptic(2);
    }

    function bind(button, delta) {
      let timer = 0;
      let count = 0;
      let interval = 300;
      let heldSince = 0;

      const stop = () => {
        clearTimeout(timer);
        timer = 0;
      };

      const tick = () => {
        count += 1;
        // 加速按「按住多久」算，不按点击次数算：
        // 这样即使主线程被别的事情占住，手感也不会突然变慢。
        const held = performance.now() - heldSince;
        const stepSize = held > 1200 ? 5 : held > 600 ? 2 : 1;
        place(value + delta * stepSize);
        interval = Math.max(40, interval * 0.87);
        timer = setTimeout(tick, interval);
      };

      button.addEventListener('pointerdown', event => {
        if (event.button != null && event.button !== 0) return;
        count = 0;
        interval = 300;
        heldSince = performance.now();
        place(value + delta);
        timer = setTimeout(tick, 420);
      });
      ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(name => {
        button.addEventListener(name, stop);
      });
      button.addEventListener('click', event => {
        if (event.detail === 0) place(value + delta);
      });
      button.addEventListener('contextmenu', event => event.preventDefault());
    }

    bind(down, -1);
    bind(up, 1);

    addTicker((now, dt) => {
      state.forEach(entry => {
        entry.spring.step(dt);
        paint(entry, entry.spring.value);
      });
    });

    place(128);
    state.forEach(entry => {
      entry.spring.jump(entry.spring.target);
      paint(entry, entry.spring.value);
    });
  })();

  /* ============================================================
     07 浸瓶 · JAR
     拖动瓶身改变液面，液面会晃，气泡上浮，标本随波漂移。
     ============================================================ */

  (function specimenJar() {
    const svg = $('#jar');
    if (!svg) return;
    const liquid = $('#jar-liquid', svg);
    const liquidDeep = $('#jar-liquid-deep', svg);
    const meniscus = $('#jar-meniscus', svg);
    const bubblesGroup = $('#jar-bubbles', svg);
    const specimen = $('#jar-spec', svg);
    const readout = $('#jar-readout');
    const downBtn = $('#jar-down');
    const upBtn = $('#jar-up');
    const labelGroup = $('#jar-label-group', svg);

    const TOP = 44;
    const BOT = 206;
    const XS = [56, 70, 84, 98, 112];

    let level = 0.62;
    let target = 0.62;
    let slosh = 0;
    let lastY = null;
    let dragging = false;

    const bubbles = XS.map((x, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', String(1.8 + (index % 3) * 0.7));
      circle.setAttribute('class', 'jar-bubble');
      bubblesGroup.appendChild(circle);
      return { circle, x, y: BOT - 12 - index * 26, speed: 0.22 + index * 0.07, wobble: index * 1.3 };
    });

    function surface(base, amplitude, k, phase) {
      let d = 'M24 ' + (BOT + 6).toFixed(1) + 'V' + base.toFixed(1);
      for (let x = 24; x <= 144; x += 4) {
        d += 'L' + x + ' ' + (base + amplitude * Math.sin(x * k + phase)).toFixed(1);
      }
      return d + 'V' + (BOT + 6) + 'Z';
    }

    function sync() {
      const v = Math.round(target * 100);
      if (readout) readout.textContent = String(v);
      svg.setAttribute('aria-valuenow', String(v));
    }

    function set(next) {
      const previous = target;
      target = clamp(next, 0, 1);
      if (!EC.reduced) slosh = Math.min(1, slosh + Math.abs(target - previous) * 3 + 0.12);
      sync();
    }

    function draw(now) {
      const phase = EC.reduced ? 0 : now / 720;
      level += (target - level) * 0.09;
      slosh *= 0.965;
      const base = BOT - (BOT - TOP) * level;
      const amplitude = 1.6 + 8 * slosh;

      liquid.setAttribute('d', surface(base + 2, amplitude, 0.07, -phase));
      liquidDeep.setAttribute('d', surface(base + 5, amplitude * 0.8 + 1, 0.09, phase * 1.3 + 2));
      meniscus.setAttribute('d', surface(base + 2, amplitude, 0.07, -phase).replace(/V[\d.]+Z$/, 'Z'));

      bubbles.forEach(bubble => {
        bubble.y -= bubble.speed;
        if (bubble.y < base + 6) {
          bubble.y = BOT - 4 - Math.random() * 18;
        }
        const drift = Math.sin(bubble.y * 0.09 + bubble.wobble) * 2.6;
        bubble.circle.setAttribute('cx', (bubble.x + drift).toFixed(1));
        bubble.circle.setAttribute('cy', bubble.y.toFixed(1));
        bubble.circle.setAttribute('opacity', level > 0.08 ? '1' : '0');
      });

      const driftY = Math.min(base + 16 + Math.sin(phase * 1.7) * 3, BOT - 14);
      specimen.setAttribute(
        'transform',
        'translate(84 ' + driftY.toFixed(1) + ') rotate(' + (Math.sin(phase) * 10).toFixed(1) + ')'
      );
      specimen.setAttribute('opacity', level > 0.1 ? '1' : '0');

      if (labelGroup) {
        labelGroup.setAttribute(
          'transform',
          'rotate(-3 84 188) translate(0 ' + ((1 - level) * 4).toFixed(1) + ')'
        );
      }
    }

    function locate(event) {
      const rect = svg.getBoundingClientRect();
      const y = ((event.clientY - rect.top) * 230) / rect.height;
      if (lastY !== null && !EC.reduced) slosh = Math.min(1, slosh + Math.abs(y - lastY) * 0.03);
      lastY = y;
      target = clamp((BOT - y) / (BOT - TOP), 0, 1);
      sync();
    }

    svg.addEventListener('pointerdown', event => {
      if (svg.setPointerCapture) {
        try {
          svg.setPointerCapture(event.pointerId);
        } catch (_) {
          /* 忽略 */
        }
      }
      event.preventDefault();
      dragging = true;
      lastY = null;
      locate(event);
    });
    svg.addEventListener('pointermove', event => {
      if (dragging) locate(event);
    });
    const release = () => {
      dragging = false;
      lastY = null;
    };
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);

    svg.addEventListener('keydown', event => {
      const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05 }[event.key];
      if (!step) return;
      event.preventDefault();
      set(target + step);
    });

    if (downBtn) downBtn.addEventListener('click', () => set(target - 0.1));
    if (upBtn) upBtn.addEventListener('click', () => set(target + 0.1));

    sync();
    draw(performance.now());
    addTicker(draw);
  })();
})();
