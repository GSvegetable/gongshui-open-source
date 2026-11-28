/* Eight Components v3 — 08 键帽 · KEY
 * 一块真正的三维键帽：用 CSS 3D 搭出来，指针移动带动倾角，按下时整块下沉。
 */
(function () {
  'use strict';

  var EC = window.EC;
  if (!EC) return;
  var stage = EC.$('#key-stage');
  if (!stage) return;
  var scene = EC.$('#key-scene');
  var cap = EC.$('#key-cap');
  var hit = EC.$('#key-hit');
  var out = EC.$('#key-count');
  var count = 0;
  var down = false;

  function press() {
    if (down) return;
    down = true;
    cap.classList.add('is-down');
    count += 1;
    out.textContent = String(count);
    EC.buzz(10);
  }
  function release() {
    if (!down) return;
    down = false;
    cap.classList.remove('is-down');
  }
  function tilt(e) {
    if (EC.reduced) return;
    var r = stage.getBoundingClientRect();
    var x = EC.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    var y = EC.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    scene.style.setProperty('--tx', x.toFixed(3));
    scene.style.setProperty('--ty', y.toFixed(3));
  }
  function relax() {
    scene.style.setProperty('--tx', '0');
    scene.style.setProperty('--ty', '0');
  }

  hit.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      hit.setPointerCapture(e.pointerId);
    } catch (_) {}
    tilt(e);
    press();
  });
  hit.addEventListener('pointermove', tilt);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (name) {
    hit.addEventListener(name, release);
  });
  hit.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    if (!down) relax();
  });
  hit.addEventListener('keydown', function (e) {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      press();
    }
  });
  hit.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      release();
    }
  });
  hit.addEventListener('blur', release);
  hit.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
})();
