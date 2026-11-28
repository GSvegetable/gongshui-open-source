/* ============================================================
   08 键帽 · KEY
   真三维：一块镍质底圈 + 一块朱漆键帽，影棚柔光扫过漆面。
   材质、灯光与纸上另外七件保持同一套约定——
   光从左上来，投影落向右下，暖调 4200K。
   ============================================================ */

(function () {
  'use strict';

  const EC = window.EC;
  if (!EC) return;

  const stage = document.getElementById('key-stage');
  const canvas = document.getElementById('key-canvas');
  const hit = document.getElementById('key-hit');
  if (!stage || !canvas || !hit) return;

  const BEZEL_W = 5.5;
  const BEZEL_H = 2.05;
  const CAP_Z = 0.34;

  let renderer;
  let scene;
  let camera;
  let root;
  let capGroup;
  let capMat;
  let shadow;
  let shadowTight;
  let envTexture;
  let pmrem;
  let press;
  let tiltX;
  let tiltY;
  let flash = 0;
  let disposed = false;
  let THREE_REF = null;
  let live = false;
  let rafId = 0;
  let quality = 2;
  let sampleFrames = 0;
  let sampleTime = 0;

  /* ---------- 加载 three.js ---------- */

  function loadThree() {
    return new Promise((resolve, reject) => {
      if (window.THREE) {
        resolve(window.THREE);
        return;
      }
      const script = document.createElement('script');
      script.src = './vendor/three.min.js?v=2.0.0';
      script.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('THREE 缺失')));
      script.onerror = () => reject(new Error('three.js 加载失败'));
      document.head.appendChild(script);
    });
  }

  /* ---------- 影棚环境 ---------- */

  function studioEnvironment(theme) {
    const dark = theme === 'dark';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 1024;
    canvasEl.height = 512;
    const ctx = canvasEl.getContext('2d');

    const sky = ctx.createLinearGradient(0, 0, 0, 512);
    if (dark) {
      sky.addColorStop(0, '#191b16');
      sky.addColorStop(0.42, '#3a3d34');
      sky.addColorStop(0.74, '#5b5443');
      sky.addColorStop(1, '#6a6350');
    } else {
      sky.addColorStop(0, '#2c261f');
      sky.addColorStop(0.42, '#786d5e');
      sky.addColorStop(0.74, '#c8bda7');
      sky.addColorStop(1, '#d6cbb6');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1024, 512);

    const softbox = (u, v, w, h, rgb, alpha) => {
      ctx.save();
      ctx.translate(u * 1024, v * 512);
      ctx.scale(w, h);
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      glow.addColorStop(0, 'rgba(' + rgb + ',1)');
      glow.addColorStop(0.55, 'rgba(' + rgb + ',1)');
      glow.addColorStop(1, 'rgba(' + rgb + ',0)');
      ctx.globalAlpha = alpha;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, 7);
      ctx.fill();
      ctx.restore();
    };

    if (dark) {
      softbox(0.7, 0.24, 210, 62, '236,232,220', 0.85);
      softbox(0.44, 0.52, 30, 150, '255,226,186', 0.4);
      softbox(0.95, 0.46, 24, 140, '206,222,255', 0.34);
      softbox(0.3, 0.72, 180, 52, '255,198,150', 0.2);
      softbox(0.62, 0.2, 26, 26, '255,255,255', 0.6);
    } else {
      softbox(0.72, 0.26, 230, 70, '255,246,228', 1);
      softbox(0.46, 0.5, 34, 170, '255,232,196', 0.72);
      softbox(0.95, 0.48, 26, 150, '214,228,255', 0.5);
      softbox(0.27, 0.3, 190, 58, '255,206,158', 0.55);
      softbox(0.62, 0.2, 30, 30, '255,255,255', 1);
    }

    const texture = new window.THREE.CanvasTexture(canvasEl);
    texture.mapping = window.THREE.EquirectangularReflectionMapping;
    texture.encoding = window.THREE.sRGBEncoding;
    return texture;
  }

  /* ---------- 几何：圆角胶囊 + 只平滑倒角的法线 ---------- */

  function pill(T, width, height, depth, bevel) {
    const radius = height / 2;
    const shape = new T.Shape();
    shape.absarc(width / 2 - radius, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    shape.absarc(-width / 2 + radius, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
    const geometry = new T.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 6,
      curveSegments: 28
    });
    geometry.center();
    geometry.computeVertexNormals();

    // 顶面保持平整，只把倒角与侧壁的接缝抹圆
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const buckets = new Map();
    const key = i =>
      position.getX(i).toFixed(3) + ',' + position.getY(i).toFixed(3) + ',' + position.getZ(i).toFixed(3);
    const isFlat = i => Math.abs(normal.getZ(i)) > 0.9999;
    for (let i = 0; i < position.count; i += 1) {
      if (isFlat(i)) continue;
      const bucket = buckets.get(key(i)) || [0, 0, 0];
      bucket[0] += normal.getX(i);
      bucket[1] += normal.getY(i);
      bucket[2] += normal.getZ(i);
      buckets.set(key(i), bucket);
    }
    for (let i = 0; i < position.count; i += 1) {
      if (isFlat(i)) continue;
      const bucket = buckets.get(key(i));
      const length = Math.hypot(bucket[0], bucket[1], bucket[2]) || 1;
      normal.setXYZ(i, bucket[0] / length, bucket[1] / length, bucket[2] / length);
    }
    return geometry;
  }

  /* ---------- 键帽上的字 ---------- */

  function labelTexture(T) {
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 256;
    canvasEl.height = 256;
    const ctx = canvasEl.getContext('2d');
    ctx.font = '700 186px "Noto Serif SC","Noto Serif CJK SC","Songti SC",serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(64,12,6,0.55)';
    ctx.fillText('按', 130, 134);
    ctx.fillStyle = '#f6e8d2';
    ctx.fillText('按', 128, 130);
    const texture = new T.CanvasTexture(canvasEl);
    texture.encoding = T.sRGBEncoding;
    texture.anisotropy = 8;
    return texture;
  }

  /* ---------- 接触阴影 ---------- */

  function shadowTexture(T, strength) {
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 512;
    canvasEl.height = 256;
    const ctx = canvasEl.getContext('2d');
    const glow = ctx.createRadialGradient(256, 128, 0, 256, 128, 190);
    glow.addColorStop(0, 'rgba(48,34,12,' + strength + ')');
    glow.addColorStop(0.3, 'rgba(48,34,12,' + strength * 0.5 + ')');
    glow.addColorStop(0.66, 'rgba(48,34,12,' + strength * 0.14 + ')');
    glow.addColorStop(1, 'rgba(48,34,12,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 512, 256);
    const texture = new T.CanvasTexture(canvasEl);
    texture.encoding = T.sRGBEncoding;
    return texture;
  }

  /* ---------- 搭建 ---------- */

  function build(T) {
    THREE_REF = T;
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    // 软件渲染（SwiftShader / llvmpipe）下清漆层会非常贵，
    // 先探一次渲染器，能认出来就直接降级。
    const gl = renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererName = debug ? String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) || '') : '';
    const software = /swiftshader|llvmpipe|software|basic render/i.test(rendererName);

    renderer.setPixelRatio(software ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    quality = software ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.setClearColor(0x000000, 0);
    canvas.appendChild(renderer.domElement);

    scene = new T.Scene();
    camera = new T.PerspectiveCamera(30, 1, 0.1, 100);

    pmrem = new T.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    root = new T.Group();
    scene.add(root);

    const bezel = new T.Mesh(
      pill(T, BEZEL_W, BEZEL_H, 0.36, 0.12),
      new T.MeshStandardMaterial({
        color: new T.Color(0xc9c2b3).convertSRGBToLinear(),
        metalness: 1,
        roughness: 0.3
      })
    );
    root.add(bezel);

    capMat = new T.MeshPhysicalMaterial({
      color: new T.Color(0x9c2413).convertSRGBToLinear(),
      roughness: 0.26,
      metalness: 0.0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      emissive: 0xff3a10,
      emissiveIntensity: 0
    });
    if (quality <= 1) {
      capMat.clearcoat = 0;
      capMat.needsUpdate = true;
    }
    const cap = new T.Mesh(pill(T, 4, 0.92, 0.46, 0.13), capMat);
    capGroup = new T.Group();
    capGroup.add(cap);

    const label = new T.Mesh(
      new T.PlaneGeometry(0.62, 0.62),
      new T.MeshBasicMaterial({ map: labelTexture(T), transparent: true, toneMapped: false, depthWrite: false })
    );
    // ExtrudeGeometry 的倒角向外张开，平整的正面在 z = depth/2 + bevelThickness 处，
    // 字面必须落在它前面，否则会被键帽本体挡住。
    label.position.z = 0.372;
    capGroup.add(label);
    capGroup.position.z = CAP_Z;
    root.add(capGroup);

    const shadowMat = new T.MeshBasicMaterial({
      map: shadowTexture(T, 0.55),
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      toneMapped: false
    });
    shadow = new T.Mesh(new T.PlaneGeometry(6.2, 2.5), shadowMat);
    shadow.position.set(0.4, -0.74, -1.25);
    scene.add(shadow);

    const tightMat = new T.MeshBasicMaterial({
      map: shadowTexture(T, 0.66),
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
      toneMapped: false
    });
    shadowTight = new T.Mesh(new T.PlaneGeometry(4.2, 1.7), tightMat);
    shadowTight.position.set(0.1, -0.62, -1.1);
    scene.add(shadowTight);

    const key = new T.DirectionalLight(0xfff2dd, 0.85);
    key.position.set(-3.4, 4.2, 5.6);
    scene.add(key);

    const rim = new T.DirectionalLight(0xcfe0ff, 0.28);
    rim.position.set(4.6, 1.2, -2.4);
    scene.add(rim);

    press = new EC.Spring(0, { stiffness: 760, damping: 48 });
    tiltX = new EC.Spring(0, { stiffness: 90, damping: 13 });
    tiltY = new EC.Spring(0, { stiffness: 90, damping: 13 });

    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  }

  function applyTheme(theme) {
    if (!scene) return;
    const dark = theme === 'dark';
    if (envTexture) envTexture.dispose();
    envTexture = studioEnvironment(theme);
    scene.environment = pmrem.fromEquirectangular(envTexture).texture;
    renderer.toneMappingExposure = dark ? 0.88 : 0.98;
    if (capMat) {
      capMat.color.set(new THREE_REF.Color(dark ? 0xb0301c : 0x9c2413).convertSRGBToLinear());
      capMat.roughness = dark ? 0.24 : 0.26;
    }
    if (shadow) shadow.material.opacity = dark ? 0.42 : 0.6;
    if (shadowTight) shadowTight.material.opacity = dark ? 0.28 : 0.46;
  }

  function fit() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    // 绘制缓冲按 devicePixelRatio 放大，CSS 尺寸必须仍按逻辑像素铺满容器，
    // 否则在高 DPI 屏幕上画布会被放大一倍，构图整个跑偏。
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    camera.aspect = width / height;
    const half = Math.tan((camera.fov * Math.PI) / 360);
    const needWidth = BEZEL_W / 0.9;
    const needHeight = BEZEL_H * 1.5;
    const distance = Math.max(needWidth / (2 * half * camera.aspect), needHeight / (2 * half), 8);
    camera.position.z = distance;
    camera.updateProjectionMatrix();
  }

  /* ---------- 交互 ---------- */

  function pressDown() {
    press.d = 48;
    press.to(1);
    flash = 0.5;
    EC.haptic(10);
  }

  function pressUp() {
    press.d = 27;
    press.to(0);
  }

  function trackPointer(event) {
    const rect = stage.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    tiltY.to(nx * 0.32);
    tiltX.to(ny * 0.2);
  }

  /* ---------- 主循环 ---------- */

  function frame(now) {
    if (disposed || !live) {
      rafId = 0;
      return;
    }
    const dt = Math.min(0.05, (now - (frame.last || now)) / 1000);
    frame.last = now;
    const seconds = now / 1000;

    press.step(dt);
    tiltX.step(dt);
    tiltY.step(dt);
    flash *= 0.9;

    // 自适应画质：连续掉帧就降一档内部分辨率。
    // 宁可在弱机上稍微糊一点，也不要让一块画布拖慢整页。
    if (quality > 1) {
      sampleFrames += 1;
      sampleTime += dt;
      if (sampleFrames >= 30) {
        if (sampleTime / sampleFrames > 0.042) {
          quality = 1;
          renderer.setPixelRatio(1);
          if (capMat && capMat.clearcoat) {
            capMat.clearcoat = 0;
            capMat.needsUpdate = true;
          }
          fit();
        }
        sampleFrames = 0;
        sampleTime = 0;
      }
    }

    const idle = EC.reduced ? 0 : 1;
    const baseTilt = -0.17 + tiltX.value;
    root.rotation.set(baseTilt, 0.13 + tiltY.value, tiltY.value * 0.04);
    root.position.y = Math.sin(seconds * 1.05) * 0.055 * idle;
    root.position.z = -press.value * 0.04;

    capGroup.position.z = CAP_Z - press.value * 0.22;
    capMat.emissiveIntensity = flash;

    shadow.position.x = 0.42 - tiltY.value * 1.5;
    shadow.position.y = -0.74 + tiltX.value * 0.7;
    shadow.scale.set(1 + press.value * 0.03, 1 + press.value * 0.06, 1);
    shadow.material.opacity = (document.documentElement.getAttribute('data-theme') === 'dark' ? 0.42 : 0.6) - press.value * 0.08;

    shadowTight.position.x = 0.14 - tiltY.value * 0.7;
    shadowTight.position.y = -0.62 + tiltX.value * 0.32;
    shadowTight.material.opacity = (document.documentElement.getAttribute('data-theme') === 'dark' ? 0.28 : 0.46) - press.value * 0.12;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  /* 滚出画面就停掉渲染循环，别让一块看不见的画布一直占着主线程。 */
  function setLive(next) {
    if (live === next) return;
    live = next;
    if (live) {
      frame.last = 0;
      if (!rafId) rafId = requestAnimationFrame(frame);
    } else if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  /* ---------- 启动 ---------- */

  function start() {
    let T;
    try {
      const probe = document.createElement('canvas');
      if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) {
        throw new Error('没有 WebGL');
      }
    } catch (_) {
      return; // 保留 CSS 降级键帽
    }

    loadThree()
      .then(module => {
        T = module;
        if (EC.reduced) {
          // 仍然构建，只是没有浮动与视差
        }
        build(T);
        stage.classList.add('is-live');

        hit.addEventListener('pointerdown', event => {
          event.preventDefault();
          pressDown();
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(name => {
          hit.addEventListener(name, pressUp);
        });
        hit.addEventListener('keydown', event => {
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          if (!event.repeat) pressDown();
        });
        hit.addEventListener('keyup', event => {
          if (event.key !== ' ' && event.key !== 'Enter') return;
          event.preventDefault();
          pressUp();
        });
        hit.addEventListener('blur', pressUp);

        stage.addEventListener('pointermove', event => {
          if (EC.reduced) return;
          trackPointer(event);
        });
        stage.addEventListener('pointerleave', () => {
          tiltX.to(0);
          tiltY.to(0);
        });

        window.addEventListener('ec:theme', event => applyTheme(event.detail.theme));

        const observer = new ResizeObserver(() => fit());
        observer.observe(stage);
        window.addEventListener('resize', fit);
        fit();

        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => {
            const label = capGroup && capGroup.children[1];
            if (label && label.material && label.material.map) {
              const fresh = labelTexture(T);
              label.material.map.dispose();
              label.material.map = fresh;
              label.material.needsUpdate = true;
            }
          });
        }

        let inView = true;
        const visibility = new IntersectionObserver(
          entries => {
            inView = entries.some(entry => entry.isIntersecting);
            setLive(inView && !document.hidden);
          },
          { rootMargin: '120px' }
        );
        visibility.observe(stage);
        document.addEventListener('visibilitychange', () => {
          setLive(inView && !document.hidden);
        });
      })
      .catch(error => {
        console.warn('[eight-components] 键帽降级：', error && error.message);
      });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { rootMargin: '120px' }
    );
    observer.observe(stage);
  } else {
    start();
  }
})();
