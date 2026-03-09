
(function () {
if (window.__asciiScatterInit) return;
window.__asciiScatterInit = true;

const CFG = {
fontSize: 9,
density: 4,
brightness: -17,
contrast: 51,
alphaThresh: 93,
invert: false,
cursorRadius: 235,
cursorForce: 3,
idleTimeout: 200,
scrollForce: 35,
scrollDecay: 81,
scrollMult: 3,
returnSpeed: 5,
friction: 75,
};

const ASCII_FULL = '@#W$9876543210?!abc;:+=-,._ ';

let scrollVelocity = 0;
let lastScrollY = window.scrollY;
const instances = [];
const renderCache = new Map();

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
}

function getAsciiChar(brightness) {
const chars = ASCII_FULL.slice(0, Math.max(1, Math.min(CFG.density, ASCII_FULL.length - 1)));
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
sourceKey: '',
lastRenderKey: '',
fontColor: parseFontColor(canvas),
mouse: { x: -9999, y: -9999, active: false },
mouseIdleTimer: null,
scaleX: 1,
scaleY: 1,
};
}

function cloneParticles(templateParticles) {
return templateParticles.map(p => new Particle(p.x, p.y, p.char, p.alpha));
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

// Use the wrapper's size as the available area
const wrapRect = state.wrap.getBoundingClientRect();
const areaW = wrapRect.width;
const areaH = wrapRect.height;

// How many cols/rows fit in that area
const maxCols = Math.floor(areaW / charW);
const maxRows = Math.floor(areaH / lineH);

// How many cols/rows the image needs at 1:1
const imgCols = Math.ceil(natW / charW);
const imgRows = Math.ceil(natH / lineH);

// Scale to fit while preserving aspect ratio
const colScale = maxCols / imgCols;
const rowScale = maxRows / imgRows;
const fitScale = Math.min(colScale, rowScale);

const cols = Math.floor(imgCols * fitScale);
const rows = Math.floor(imgRows * fitScale);
if (cols < 1 || rows < 1) return;

const cacheKey = [
state.sourceKey,
Math.round(areaW),
Math.round(areaH),
natW,
natH,
CFG.fontSize,
CFG.density,
CFG.brightness,
CFG.contrast,
CFG.alphaThresh,
CFG.invert ? 1 : 0,
cols,
rows,
ASCII_FULL
].join('|');

const cached = renderCache.get(cacheKey);
if (cached) {
state.canvas.width = cached.gridW;
state.canvas.height = cached.gridH;

const newRect = state.canvas.getBoundingClientRect();
state.scaleX = newRect.width ? (cached.gridW / newRect.width) : 1;
state.scaleY = newRect.height ? (cached.gridH / newRect.height) : 1;

state.particles = cloneParticles(cached.particles);
state.lastRenderKey = cacheKey;
return;
}

// The pixel dimensions we sample from the image
const sampleW = cols;
const sampleH = rows;

// Read pixels at the needed resolution
const off = document.createElement('canvas');
off.width = sampleW; off.height = sampleH;
const oc = off.getContext('2d');
oc.drawImage(img, 0, 0, sampleW, sampleH);

let imgData;
try {
imgData = oc.getImageData(0, 0, sampleW, sampleH);
} catch (e) {
console.error('ASCII Scatter: canvas tainted', e);
return;
}

applyImageAdjust(imgData.data);
const d = imgData.data;

// Set canvas internal resolution to the ASCII grid size
const gridW = cols * charW;
const gridH = rows * lineH;
state.canvas.width = gridW;
state.canvas.height = gridH;

// Compute scale between internal pixels and CSS display pixels
const newRect = state.canvas.getBoundingClientRect();
state.scaleX = gridW / newRect.width;
state.scaleY = gridH / newRect.height;

// Build particles — one per sampled pixel
for (let row = 0; row < rows; row++) {
for (let col = 0; col < cols; col++) {
const i = (row * sampleW + col) * 4;
const a = d[i + 3];
if (a < CFG.alphaThresh) continue;
const br = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
const ch = getAsciiChar(br);
if (ch === ' ') continue;
state.particles.push(new Particle(col * charW, row * lineH, ch, a / 255));
}
}

renderCache.set(cacheKey, {
gridW,
gridH,
particles: state.particles.map(p => ({ x: p.ox, y: p.oy, char: p.char, alpha: p.alpha }))
});
state.lastRenderKey = cacheKey;
}

function loadImageSafe(state) {
const src = state.imgEl.currentSrc || state.imgEl.src;
if (!src) return;
state.sourceKey = src;

if (src.startsWith('data:') || src.startsWith('blob:')) {
waitForImg(state, state.imgEl);
return;
}

try {
const url = new URL(src, window.location.href);
if (url.origin === window.location.origin) {
waitForImg(state, state.imgEl);
return;
}
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
if (imgEl.complete && imgEl.naturalWidth > 0) {
processImage(state, imgEl);
} else {
imgEl.addEventListener('load', () => processImage(state, imgEl), { once: true });
}
}

function loadFallback(state, src) {
const img = new Image();
img.crossOrigin = 'anonymous';
img.onload = () => processImage(state, img);
img.onerror = () => console.error('ASCII Scatter: all loading methods failed for', src);
img.src = src;
}

// ── Global mouse tracking ──
window.addEventListener('mousemove', (e) => {
for (let i = 0; i < instances.length; i++) {
const state = instances[i];
const rect = state.canvas.getBoundingClientRect();

if (
e.clientX >= rect.left && e.clientX <= rect.right &&
e.clientY >= rect.top && e.clientY <= rect.bottom
) {
state.mouse.x = (e.clientX - rect.left) * state.scaleX;
state.mouse.y = (e.clientY - rect.top) * state.scaleY;
state.mouse.active = true;
clearTimeout(state.mouseIdleTimer);
state.mouseIdleTimer = setTimeout(() => { state.mouse.active = false; }, CFG.idleTimeout);
} else if (state.mouse.active) {
state.mouse.active = false;
state.mouse.x = -9999;
state.mouse.y = -9999;
}
}
});

// ── Animation loop (shared) ──
function animate() {
scrollVelocity *= CFG.scrollDecay / 100;
if (Math.abs(scrollVelocity) < 0.02) scrollVelocity = 0;

for (let s = 0; s < instances.length; s++) {
const state = instances[s];
const { ctx, canvas, particles, mouse, fontColor } = state;

ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.font = `${CFG.fontSize}px 'JetBrains Mono', monospace`;
ctx.textBaseline = 'top';

const fc = fontColor;
const r = CFG.cursorRadius;
const rSq = r * r;

for (let i = 0; i < particles.length; i++) {
const p = particles[i];

if (mouse.active) {
const dx = p.x - mouse.x;
const dy = p.y - mouse.y;
const dSq = dx * dx + dy * dy;
if (dSq < rSq && dSq > 0) {
const d = Math.sqrt(dSq);
const f = (r - d) / r;
const a = Math.atan2(dy, dx);
const str = f * f * CFG.cursorForce * 0.5;
p.vx += Math.cos(a) * str;
p.vy += Math.sin(a) * str;
}
}

const absScroll = Math.abs(scrollVelocity);
if (absScroll > 0.3) {
const sv = Math.min(absScroll, 150) / 150;
const a = Math.random() * Math.PI * 2;
const f = sv * CFG.scrollForce * CFG.scrollMult * (0.15 + Math.random() * 0.85) * 0.08;
p.vx += Math.cos(a) * f;
p.vy += Math.sin(a) * f + (scrollVelocity > 0 ? 1 : -1) * sv * CFG.scrollForce * 0.04;
}

p.update();
ctx.fillStyle = `rgba(${fc.r},${fc.g},${fc.b},${p.alpha})`;
ctx.fillText(p.char, p.x, p.y);
}
}

requestAnimationFrame(animate);
}

// ── Resize ──
let resizeT;
window.addEventListener('resize', () => {
clearTimeout(resizeT);
resizeT = setTimeout(() => {
instances.forEach(s => loadImageSafe(s));
}, 250);
});

// ── Init ──
function init() {
document.querySelectorAll('.ascii_wrap').forEach(wrap => {
const state = createInstance(wrap);
if (state) {
instances.push(state);
loadImageSafe(state);
}
});
if (instances.length) animate();
}

if (document.readyState === 'complete') {
init();
} else {
window.addEventListener('load', init);
}
})();
