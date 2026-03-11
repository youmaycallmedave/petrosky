(function () {
  const CFG = {
    fontSize: 7,
    density: 18,
    brightness: -17,
    contrast: 51,
    alphaThresh: 110,
    invert: false,
    cursorRadius: 180,
    cursorForce: 3,
    idleTimeout: 200,
    scrollForce: 20,
    scrollDecay: 85,
    scrollMult: 2,
    returnSpeed: 6,
    friction: 80,
  };

  const ASCII_FULL = '@#W$9876543210?!abc;:+=-,._ ';

  let scrollVelocity = 0;
  let lastScrollY = window.scrollY;
  const instances = [];
  let rafId = null;

  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    scrollVelocity += (cur - lastScrollY) * 0.6;
    lastScrollY = cur;
  }, { passive: true });

  class Particle {
    constructor(x, y, char, alpha) {
      this.ox = x; this.oy = y;
      this.x = x; this.y = y;
      this.vx = 0; this.vy = 0;
      this.char = char;
      this.alpha = alpha;
    }
    update() {
      const friction = CFG.friction / 100;
      const returnSpd = CFG.returnSpeed / 100;
      this.vx += (this.ox - this.x) * returnSpd;
      this.vy += (this.oy - this.y) * returnSpd;
      this.vx *= friction;
      this.vy *= friction;
      this.x += this.vx;
      this.y += this.vy;
    }
    // Чи рухається частинка (щоб пропускати idle кадри)
    isMoving() {
      return Math.abs(this.vx) > 0.05 || Math.abs(this.vy) > 0.05 ||
             Math.abs(this.x - this.ox) > 0.05 || Math.abs(this.y - this.oy) > 0.05;
    }
  }

  function getAsciiChar(brightness) {
    const chars = ASCII_FULL.slice(0, CFG.density);
    const i = Math.floor((1 - brightness / 255) * (chars.length - 1));
    return chars[Math.max(0, Math.min(i, chars.length - 1))];
  }

  function applyImageAdjust(data) {
    const b = CFG.brightness;
    const c = CFG.contrast;
    const factor = (259 * (c + 255)) / (255 * (259 - c));
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < CFG.alphaThresh) continue;
      for (let ch = 0; ch < 3; ch++) {
        let v = data[i + ch];
        v += b * 2.55;
        v = factor * (v - 128) + 128;
        if (CFG.invert) v = 255 - v;
        data[i + ch] = Math.max(0, Math.min(255, v));
      }
    }
  }

  function parseFontColor(canvas) {
    const color = getComputedStyle(canvas).color;
    const m = color.match(/(\d+)/g);
    if (m && m.length >= 3) return { r: +m[0], g: +m[1], b: +m[2] };
    return { r: 126, g: 244, b: 208 };
  }

  function createInstance(wrap) {
    const canvas = wrap.querySelector('.ascii_canvas');
    const imgEl = wrap.querySelector('.ascii_image');
    if (!canvas || !imgEl) return null;
    const ctx = canvas.getContext('2d');
    return {
      canvas, ctx, imgEl, wrap,
      particles: [],
      fontColor: parseFontColor(canvas),
      mouse: { x: -9999, y: -9999, active: false },
      mouseIdleTimer: null,
      scaleX: 1, scaleY: 1,
      visible: false,   // IntersectionObserver
      needsDraw: true,  // dirty flag
    };
  }

  function processImage(state, img) {
    state.particles = [];
    state.fontColor = parseFontColor(state.canvas);

    const fs = CFG.fontSize;
    const lineH = fs * 1.3;
    const charW = fs * 0.62;

    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    if (!natW || !natH) return;

    const wrapRect = state.wrap.getBoundingClientRect();
    const areaW = wrapRect.width;
    const areaH = wrapRect.height;

    const maxCols = Math.floor(areaW / charW);
    const maxRows = Math.floor(areaH / lineH);
    const imgCols = Math.ceil(natW / charW);
    const imgRows = Math.ceil(natH / lineH);

    const fitScale = Math.min(maxCols / imgCols, maxRows / imgRows);
    const cols = Math.floor(imgCols * fitScale);
    const rows = Math.floor(imgRows * fitScale);
    if (cols < 1 || rows < 1) return;

    const off = document.createElement('canvas');
    off.width = cols; off.height = rows;
    const oc = off.getContext('2d');
    oc.drawImage(img, 0, 0, cols, rows);

    let imgData;
    try { imgData = oc.getImageData(0, 0, cols, rows); }
    catch (e) { console.error('ASCII: canvas tainted', e); return; }

    applyImageAdjust(imgData.data);
    const d = imgData.data;

    const gridW = cols * charW;
    const gridH = rows * lineH;
    state.canvas.width = gridW;
    state.canvas.height = gridH;

    const newRect = state.canvas.getBoundingClientRect();
    state.scaleX = gridW / (newRect.width || 1);
    state.scaleY = gridH / (newRect.height || 1);

    // Кешуємо fillStyle рядки по унікальних alpha значеннях
    state.alphaCache = {};

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = (row * cols + col) * 4;
        const a = d[i + 3];
        if (a < CFG.alphaThresh) continue;
        const br = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const ch = getAsciiChar(br);
        if (ch === ' ') continue;
        state.particles.push(new Particle(col * charW, row * lineH, ch, a / 255));
      }
    }

    state.needsDraw = true;
    startLoop();
  }

  function loadImageSafe(state) {
    const src = state.imgEl.currentSrc || state.imgEl.src;
    if (!src) return;

    if (src.startsWith('data:') || src.startsWith('blob:')) {
      waitForImg(state, state.imgEl); return;
    }
    try {
      const url = new URL(src, window.location.href);
      if (url.origin === window.location.origin) { waitForImg(state, state.imgEl); return; }
    } catch (e) {}

    fetch(src, { mode: 'cors' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => { processImage(state, img); URL.revokeObjectURL(blobUrl); };
        img.onerror = () => { URL.revokeObjectURL(blobUrl); loadFallback(state, src); };
        img.src = blobUrl;
      })
      .catch(() => loadFallback(state, src));
  }

  function waitForImg(state, imgEl) {
    if (imgEl.complete && imgEl.naturalWidth > 0) processImage(state, imgEl);
    else imgEl.addEventListener('load', () => processImage(state, imgEl), { once: true });
  }

  function loadFallback(state, src) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => processImage(state, img);
    img.src = src;
  }

  // ── Global mouse ──
  window.addEventListener('mousemove', (e) => {
    for (let i = 0; i < instances.length; i++) {
      const state = instances[i];
      if (!state.visible) continue;
      const rect = state.canvas.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right &&
          e.clientY >= rect.top  && e.clientY <= rect.bottom) {
        state.mouse.x = (e.clientX - rect.left) * state.scaleX;
        state.mouse.y = (e.clientY - rect.top)  * state.scaleY;
        state.mouse.active = true;
        state.needsDraw = true;
        clearTimeout(state.mouseIdleTimer);
        state.mouseIdleTimer = setTimeout(() => {
          state.mouse.active = false;
          state.needsDraw = true;
        }, CFG.idleTimeout);
      } else if (state.mouse.active) {
        state.mouse.active = false;
        state.mouse.x = -9999; state.mouse.y = -9999;
        state.needsDraw = true;
      }
    }
  }, { passive: true });

  // ── Shared RAF loop ──
  function startLoop() {
    if (!rafId) rafId = requestAnimationFrame(animate);
  }

  function animate() {
    const hasScroll = Math.abs(scrollVelocity) > 0.02;
    scrollVelocity *= CFG.scrollDecay / 100;
    if (!hasScroll) scrollVelocity = 0;

    let anyNeedsDraw = false;

    for (let s = 0; s < instances.length; s++) {
      const state = instances[s];

      // Пропускаємо невидимі секції повністю
      if (!state.visible) continue;

      const { ctx, canvas, particles, mouse, fontColor } = state;

      // Перевіряємо чи є рух у частинок
      let hasMoving = false;
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].isMoving()) { hasMoving = true; break; }
      }

      const needsUpdate = state.needsDraw || hasMoving || hasScroll || mouse.active;
      if (!needsUpdate) continue;

      anyNeedsDraw = true;
      state.needsDraw = false;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${CFG.fontSize}px 'JetBrains Mono', monospace`;
      ctx.textBaseline = 'top';

      const { r, g, b } = fontColor;

      // Групуємо частинки по alpha для мінімізації зміни fillStyle
      // Замість N викликів fillStyle — кілька груп
      const groups = {};

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dSq = dx * dx + dy * dy;
          const rad = CFG.cursorRadius;
          if (dSq < rad * rad && dSq > 0) {
            const d = Math.sqrt(dSq);
            const f = (rad - d) / rad;
            const a = Math.atan2(dy, dx);
            const str = f * f * CFG.cursorForce * 0.5;
            p.vx += Math.cos(a) * str;
            p.vy += Math.sin(a) * str;
          }
        }

        if (hasScroll) {
          const absScroll = Math.abs(scrollVelocity);
          if (absScroll > 0.3) {
            const sv = Math.min(absScroll, 150) / 150;
            const a = Math.random() * Math.PI * 2;
            const f = sv * CFG.scrollForce * CFG.scrollMult * (0.15 + Math.random() * 0.85) * 0.08;
            p.vx += Math.cos(a) * f;
            p.vy += Math.sin(a) * f + (scrollVelocity > 0 ? 1 : -1) * sv * CFG.scrollForce * 0.04;
          }
        }

        p.update();

        // Округлюємо alpha до 2 знаків для групування
        const alphaKey = p.alpha.toFixed(2);
        if (!groups[alphaKey]) groups[alphaKey] = [];
        groups[alphaKey].push(p);
      }

      // Малюємо по групах — один fillStyle на групу
      const keys = Object.keys(groups);
      for (let k = 0; k < keys.length; k++) {
        const alpha = keys[k];
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        const group = groups[alpha];
        for (let i = 0; i < group.length; i++) {
          ctx.fillText(group[i].char, group[i].x, group[i].y);
        }
      }
    }

    // Якщо нічого не потребує оновлення — зупиняємо RAF
    if (anyNeedsDraw || hasScroll) {
      rafId = requestAnimationFrame(animate);
    } else {
      rafId = null;
    }
  }

  // ── IntersectionObserver — зупиняємо анімацію поза viewport ──
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const state = instances.find(s => s.wrap === e.target);
      if (!state) return;
      state.visible = e.isIntersecting;
      if (e.isIntersecting) {
        state.needsDraw = true;
        startLoop();
      }
    });
  }, { threshold: 0 });

  // ── Resize ──
  let resizeT;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => instances.forEach(s => loadImageSafe(s)), 250);
  });

  // ── Init ──
  function init() {
    document.querySelectorAll('.ascii_wrap').forEach(wrap => {
      const state = createInstance(wrap);
      if (state) {
        instances.push(state);
        loadImageSafe(state);
        io.observe(wrap);
      }
    });
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
