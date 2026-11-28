/* Eight Components v3 — components 01–07 (the 08 keycap lives in press-key.js). */
(function () {
  'use strict';

  var EC = window.EC;
  if (!EC) return;
  var clamp = EC.clamp;
  var $ = EC.$;
  var $$ = EC.$$;
  var NS = 'http://www.w3.org/2000/svg';

  function leftButtonOnly(e) {
    return !(e.pointerType === 'mouse' && e.button !== 0);
  }
  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /* ───────── 01 压印 · HOLD ───────── */
  (function () {
    var btn = $('#hold');
    if (!btn) return;
    var prog = $('.hold-prog', btn);
    var HOLD_MS = 900;
    var p = 0;
    var holding = false;
    var done = false;
    var last = 0;
    var raf = 0;
    var resetTimer = 0;

    function paint() {
      btn.style.setProperty('--p', p.toFixed(4));
      prog.style.strokeDashoffset = String(100 - p * 100);
      prog.style.opacity = p > 0.002 ? '1' : '0';
    }
    function finish() {
      done = true;
      holding = false;
      btn.classList.remove('is-holding');
      btn.classList.add('is-done');
      btn.setAttribute('aria-label', '已确认');
      EC.buzz(16);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        done = false;
        p = 0;
        paint();
        btn.classList.remove('is-done');
        btn.setAttribute('aria-label', '按住 0.9 秒确认');
      }, 1700);
    }
    function frame(t) {
      var dt = Math.min(48, t - last);
      last = t;
      if (!done) {
        p = clamp(p + (holding ? dt / HOLD_MS : -dt / 380), 0, 1);
        paint();
        if (p >= 1) finish();
      }
      raf = !done && (holding || p > 0) ? requestAnimationFrame(frame) : 0;
    }
    function kick() {
      if (raf || done) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (done) return;
      holding = true;
      btn.classList.add('is-holding');
      kick();
    }
    function stop() {
      holding = false;
      btn.classList.remove('is-holding');
      kick();
    }

    btn.addEventListener('pointerdown', function (e) {
      if (!leftButtonOnly(e)) return;
      try {
        btn.setPointerCapture(e.pointerId);
      } catch (_) {}
      start();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
      btn.addEventListener(name, stop);
    });
    btn.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    });
    btn.addEventListener('keydown', function (e) {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        start();
      }
    });
    btn.addEventListener('keyup', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        stop();
      }
    });
    btn.addEventListener('blur', stop);
    paint();
  })();

  /* ───────── 02 拨钮 · SWITCH ───────── */
  $$('[data-switch]').forEach(function (sw) {
    var thumb = $('.switch-thumb', sw);
    var active = false;
    var moved = false;
    var startX = 0;
    var startOn = false;
    var travel = 36;
    var v = 0;

    function isOn() {
      return sw.getAttribute('aria-checked') === 'true';
    }
    function setOn(on) {
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      EC.buzz(8);
    }

    sw.addEventListener('pointerdown', function (e) {
      if (!leftButtonOnly(e)) return;
      active = true;
      moved = false;
      startX = e.clientX;
      startOn = isOn();
      v = startOn ? 1 : 0;
      travel = Math.max(1, sw.clientWidth - thumb.offsetWidth - 8);
      sw.style.setProperty('--travel', travel + 'px');
      try {
        sw.setPointerCapture(e.pointerId);
      } catch (_) {}
      sw.classList.add('is-press');
    });
    sw.addEventListener('pointermove', function (e) {
      if (!active) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 4) {
        moved = true;
        sw.classList.add('is-drag');
      }
      if (moved) {
        v = clamp((startOn ? 1 : 0) + dx / travel, 0, 1);
        sw.style.setProperty('--x', v.toFixed(3));
      }
    });
    function end() {
      if (!active) return;
      active = false;
      var next = moved ? v > 0.5 : !startOn;
      sw.classList.remove('is-press', 'is-drag');
      sw.style.removeProperty('--x');
      if (next !== startOn) setOn(next);
    }
    sw.addEventListener('pointerup', end);
    sw.addEventListener('pointercancel', end);
    sw.addEventListener('click', function (e) {
      if (e.detail === 0) setOn(!isOn()); /* 键盘触发 */
    });
  });

  /* ───────── 04 弦 · STRING ───────── */
  (function () {
    var svg = $('#string');
    if (!svg) return;
    var line = $('#string-line');
    var ghost = $('#string-ghost');
    var bead = $('#string-bead');
    var out = $('#string-value');
    var ticksG = $('#string-ticks');
    var X0 = 16;
    var X1 = 304;
    var Y = 60;
    var BX0 = 44;
    var BX1 = 276;
    var MAXOFF = 38;
    var value = 40;
    var off = 0;
    var vel = 0;
    var target = 0;
    var dragging = false;
    var raf = 0;
    var last = 0;
    var ticks = [];

    for (var i = 0; i <= 10; i++) {
      var tx = BX0 + ((BX1 - BX0) * i) / 10;
      var t = svgEl('line', {
        x1: tx,
        x2: tx,
        y1: 98,
        y2: i % 5 === 0 ? 114 : 106,
        class: 'string-tick'
      });
      ticksG.appendChild(t);
      ticks.push(t);
    }

    function render() {
      var x = BX0 + ((BX1 - BX0) * value) / 100;
      var y = Y + off;
      var gy = Y - off * 0.55;
      line.setAttribute('d', 'M' + X0 + ' ' + Y + 'L' + x.toFixed(2) + ' ' + y.toFixed(2) + 'L' + X1 + ' ' + Y);
      ghost.setAttribute('d', 'M' + X0 + ' ' + Y + 'L' + x.toFixed(2) + ' ' + gy.toFixed(2) + 'L' + X1 + ' ' + Y);
      ghost.style.opacity = String(Math.min(0.55, Math.abs(off) / 26));
      bead.setAttribute('cx', x.toFixed(2));
      bead.setAttribute('cy', y.toFixed(2));
      var shown = Math.round(value);
      out.textContent = String(shown);
      svg.setAttribute('aria-valuenow', String(shown));
      for (var j = 0; j < ticks.length; j++) {
        ticks[j].classList.toggle('is-on', j * 10 <= value + 0.001);
      }
    }
    function frame(now) {
      var dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (dragging) {
        var prev = off;
        off += (target - off) * Math.min(1, dt * 28);
        vel = (off - prev) / Math.max(dt, 0.001);
      } else {
        var k = 520 + value * 9;
        var c = 7 + value * 0.02;
        vel += (-k * off - c * vel) * dt;
        off += vel * dt;
        if (Math.abs(off) < 0.04 && Math.abs(vel) < 0.6) {
          off = 0;
          vel = 0;
        }
      }
      render();
      raf = dragging || off !== 0 || vel !== 0 ? requestAnimationFrame(frame) : 0;
    }
    function kick() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function apply(e) {
      var r = svg.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width) * 320;
      var py = ((e.clientY - r.top) / r.height) * 120;
      value = clamp(((px - BX0) / (BX1 - BX0)) * 100, 0, 100);
      target = clamp(py - Y, -MAXOFF, MAXOFF);
    }
    function release() {
      if (!dragging) return;
      dragging = false;
      target = 0;
      if (EC.reduced) {
        off = 0;
        vel = 0;
        render();
      }
      kick();
    }

    svg.addEventListener('pointerdown', function (e) {
      if (!leftButtonOnly(e)) return;
      dragging = true;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (_) {}
      apply(e);
      try {
        svg.focus({ preventScroll: true });
      } catch (_) {}
      kick();
    });
    svg.addEventListener('pointermove', function (e) {
      if (dragging) apply(e);
    });
    svg.addEventListener('pointerup', release);
    svg.addEventListener('pointercancel', release);
    svg.addEventListener('keydown', function (e) {
      var delta = 0;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -5;
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = 5;
      else if (e.key === 'Home') value = 0;
      else if (e.key === 'End') value = 100;
      else return;
      e.preventDefault();
      value = clamp(value + delta, 0, 100);
      if (!EC.reduced) vel = 260;
      render();
      kick();
    });
    render();
  })();

  /* ───────── 05 旋钮 · KNOB ───────── */
  (function () {
    var knob = $('#knob');
    if (!knob) return;
    var cap = $('#knob-cap');
    var out = $('#knob-value');
    var g = $('#knob-ticks');
    var N = 31;
    var A0 = -135;
    var SPAN = 270;
    var value = 40;
    var lastAngle = 0;
    var dragging = false;
    var lastTens = 4;
    var ticks = [];

    for (var i = 0; i < N; i++) {
      var a = ((A0 + (SPAN * i) / (N - 1)) * Math.PI) / 180;
      var r1 = i % 5 === 0 ? 76 : 83;
      var r2 = 95;
      var tick = svgEl('line', {
        x1: (100 + Math.sin(a) * r1).toFixed(2),
        y1: (100 - Math.cos(a) * r1).toFixed(2),
        x2: (100 + Math.sin(a) * r2).toFixed(2),
        y2: (100 - Math.cos(a) * r2).toFixed(2),
        class: 'knob-tick'
      });
      g.appendChild(tick);
      ticks.push(tick);
    }

    function render() {
      cap.style.transform = 'rotate(' + (A0 + (SPAN * value) / 100).toFixed(2) + 'deg)';
      var shown = Math.round(value);
      out.textContent = String(shown);
      knob.setAttribute('aria-valuenow', String(shown));
      for (var j = 0; j < ticks.length; j++) {
        ticks[j].classList.toggle('is-on', (j / (N - 1)) * 100 <= value + 0.001);
      }
    }
    function setValue(v) {
      v = clamp(v, 0, 100);
      if (v === value) return;
      value = v;
      var tens = Math.floor(v / 10);
      if (tens !== lastTens) {
        lastTens = tens;
        EC.buzz(4);
      }
      render();
    }
    function angleOf(e) {
      var r = knob.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      return (Math.atan2(dx, -dy) * 180) / Math.PI;
    }

    knob.addEventListener('pointerdown', function (e) {
      if (!leftButtonOnly(e)) return;
      dragging = true;
      lastAngle = angleOf(e);
      try {
        knob.setPointerCapture(e.pointerId);
      } catch (_) {}
      try {
        knob.focus({ preventScroll: true });
      } catch (_) {}
      knob.classList.add('is-drag');
    });
    knob.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var a = angleOf(e);
      var d = a - lastAngle;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      lastAngle = a;
      setValue(value + (d / SPAN) * 100);
    });
    function end() {
      dragging = false;
      knob.classList.remove('is-drag');
    }
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', end);
    knob.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setValue(value + (e.shiftKey ? 10 : 2));
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setValue(value - (e.shiftKey ? 10 : 2));
      else if (e.key === 'Home') setValue(0);
      else if (e.key === 'End') setValue(100);
      else return;
      e.preventDefault();
    });
    render();
  })();

  /* ───────── 06 计数轮 · COUNTER ───────── */
  (function () {
    var win = $('#counter-window');
    if (!win) return;
    var wheels = $$('.wheel', win).map(function (el) {
      var strip = $('.strip', el);
      for (var d = 0; d <= 10; d++) {
        var s = document.createElement('span');
        s.textContent = String(d % 10);
        strip.appendChild(s);
      }
      return { idx: Number(el.getAttribute('data-wheel')), el: el, strip: strip };
    });
    var n = 128;
    var disp = 128;
    var raf = 0;
    var last = 0;

    function layout(u) {
      var p0 = u % 10;
      var c0 = Math.max(0, p0 - 9);
      var p1 = (Math.floor(u / 10) % 10) + c0;
      var c1 = Math.max(0, p1 - 9);
      var p2 = (Math.floor(u / 100) % 10) + c1;
      return [p0, p1, p2];
    }
    function render() {
      var pos = layout(disp);
      wheels.forEach(function (w) {
        var h = w.el.clientHeight || 72;
        w.strip.style.transform = 'translateY(' + (-pos[w.idx] * h).toFixed(2) + 'px)';
      });
      win.setAttribute('aria-label', '计数 ' + n);
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var d = n - disp;
      if (EC.reduced || Math.abs(d) < 0.002) disp = n;
      else disp += d * Math.min(1, dt * 12);
      render();
      raf = disp !== n ? requestAnimationFrame(frame) : 0;
    }
    function set(v) {
      n = clamp(Math.round(v), 0, 999);
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    }
    function holdButton(btn, dir) {
      var timer = 0;
      var count = 0;
      function step() {
        var size = count > 18 ? 10 : count > 8 ? 3 : 1;
        set(n + dir * size);
        count++;
        timer = setTimeout(step, Math.max(45, 160 - count * 8));
      }
      function stop() {
        clearTimeout(timer);
        btn.classList.remove('is-down');
      }
      btn.addEventListener('pointerdown', function (e) {
        if (!leftButtonOnly(e)) return;
        try {
          btn.setPointerCapture(e.pointerId);
        } catch (_) {}
        btn.classList.add('is-down');
        count = 0;
        set(n + dir);
        timer = setTimeout(step, 380);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
        btn.addEventListener(name, stop);
      });
      btn.addEventListener('click', function (e) {
        if (e.detail === 0) set(n + dir); /* 键盘触发 */
      });
    }
    holdButton($('#count-down'), -1);
    holdButton($('#count-up'), 1);
    render();
  })();

  /* ───────── 07 浸瓶 · JAR ───────── */
  (function () {
    var svg = $('#jar');
    if (!svg) return;
    var liq = $('#jar-liquid');
    var liqBack = $('#jar-liquid-back');
    var bubG = $('#jar-bubbles');
    var out = $('#jar-readout');
    var BOT = 140;
    var TOP = 14;
    var SPAN = BOT - TOP;
    var level = 62;
    var disp = 62;
    var slosh = 0;
    var t = 0;
    var last = 0;
    var raf = 0;
    var running = false;
    var dragging = false;
    var bubbles = [];

    for (var i = 0; i < 6; i++) {
      var c = svgEl('circle', { r: 1.2 + Math.random() * 1.6, class: 'jar-bubble' });
      bubG.appendChild(c);
      bubbles.push({ el: c, x: 24 + Math.random() * 52, y: 60 + Math.random() * 80, s: 9 + Math.random() * 14, ph: Math.random() * 6 });
    }

    function wave(yl, amp, phase, k) {
      var d = 'M8 152';
      for (var x = 8; x <= 92; x += 4) {
        d += 'L' + x + ' ' + (yl + Math.sin(x * k + phase) * amp).toFixed(2);
      }
      return d + 'L92 152Z';
    }
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      var prev = disp;
      if (EC.reduced) disp = level;
      else disp += (level - disp) * Math.min(1, dt * 9);
      slosh = Math.min(5, slosh * Math.pow(0.04, dt) + Math.abs(disp - prev) * 0.9);
      t += EC.reduced ? 0 : dt;
      var yl = BOT - (disp / 100) * SPAN;
      var amp = EC.reduced ? 0 : 1.1 + slosh;
      liq.setAttribute('d', wave(yl, amp, t * 2.4, 0.16));
      liqBack.setAttribute('d', wave(yl - 1.6, amp * 0.8 + 0.3, 1.3 - t * 1.7, 0.21));
      for (var i = 0; i < bubbles.length; i++) {
        var b = bubbles[i];
        if (!EC.reduced) b.y -= b.s * dt;
        if (b.y < yl + 3) {
          b.y = BOT - 2 + Math.random() * 6;
          b.x = 24 + Math.random() * 52;
        }
        b.el.setAttribute('cx', (b.x + Math.sin(t * 2 + b.ph) * 1.3).toFixed(2));
        b.el.setAttribute('cy', b.y.toFixed(2));
        b.el.style.opacity = disp > 4 ? '1' : '0';
      }
      out.textContent = String(Math.round(level));
      svg.setAttribute('aria-valuenow', String(Math.round(level)));
      raf = running ? requestAnimationFrame(frame) : 0;
    }
    function startLoop() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function setLevel(v) {
      level = clamp(v, 0, 100);
      if (!running) {
        last = performance.now();
        frame(last);
      }
    }
    function fromPointer(e) {
      var r = svg.getBoundingClientRect();
      var vy = ((e.clientY - r.top) / r.height) * 150;
      setLevel(((BOT - vy) / SPAN) * 100);
    }

    svg.addEventListener('pointerdown', function (e) {
      if (!leftButtonOnly(e)) return;
      dragging = true;
      try {
        svg.setPointerCapture(e.pointerId);
      } catch (_) {}
      try {
        svg.focus({ preventScroll: true });
      } catch (_) {}
      fromPointer(e);
    });
    svg.addEventListener('pointermove', function (e) {
      if (dragging) fromPointer(e);
    });
    function end() {
      dragging = false;
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') setLevel(level + 5);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') setLevel(level - 5);
      else if (e.key === 'Home') setLevel(0);
      else if (e.key === 'End') setLevel(100);
      else return;
      e.preventDefault();
    });
    $('#jar-up').addEventListener('click', function () {
      setLevel(level + 10);
    });
    $('#jar-down').addEventListener('click', function () {
      setLevel(level - 10);
    });

    EC.visible(svg, function (isVisible) {
      if (isVisible) startLoop();
      else {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
  })();
})();
