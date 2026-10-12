// Shared helpers. Everything here is pure: output depends only on inputs.
'use strict';
const W = 1920, H = 1080;
const INK = '#0C0C0F', PAPER = '#F2EFE9', ACCENT = '#FF4D1C', MUTE = '#6E6B66';
const DISPLAY = 'Unbounded', UI = 'Inter';

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const remap = (v, a, b, c = 0, d = 1) => c + (d - c) * clamp((v - a) / (b - a));
const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const TAU = Math.PI * 2;
const mod = (a, n) => ((a % n) + n) % n;

// ---------- seeded randomness (mulberry32) ----------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// deterministic hash → [0,1)
function hash(x, y = 0, z = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(z | 0, 2147483647 ^ 1013904223)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function noise2(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = smooth(xf), v = smooth(yf);
  const a = hash(xi, yi, seed), b = hash(xi + 1, yi, seed), c = hash(xi, yi + 1, seed), d = hash(xi + 1, yi + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function noise3(x, y, z, seed = 0) {
  const zi = Math.floor(z), zf = smooth(z - zi);
  return lerp(noise2(x, y, seed + zi * 7919), noise2(x, y, seed + (zi + 1) * 7919), zf);
}
function fbm(x, y, z = 0, oct = 4, seed = 0) {
  let s = 0, a = 0.5, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f, seed + i); n += a; a *= 0.5; f *= 2; }
  return s / n;
}

// ---------- easing ----------
const ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => 1 - (1 - t) * (1 - t),
  inOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  inCubic: t => t * t * t,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inOutCubic: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  inQuart: t => t * t * t * t,
  outQuart: t => 1 - Math.pow(1 - t, 4),
  inOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  inExpo: t => t === 0 ? 0 : Math.pow(2, 10 * t - 10),
  outExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inOutExpo: t => t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outBack: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  inBack: t => { const c = 1.70158; return (c + 1) * t * t * t - c * t * t; },
  inOutBack: t => { const c = 1.70158 * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c + 1) * 2 * t - c)) / 2 : (Math.pow(2 * t - 2, 2) * ((c + 1) * (t * 2 - 2) + c) + 2) / 2; },
  outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1,
  outBounce: t => { const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t; if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375; return n * (t -= 2.625 / d) * t + 0.984375; },
};
// progress of a window [s, s+d] with easing, clamped
const prog = (t, s, d, fn = ease.outCubic) => fn(clamp((t - s) / d));
// 1 inside [s, e], soft edges
const gate = (t, s, e, edge = 0.0) => edge ? clamp((t - s) / edge) * clamp((e - t) / edge) : (t >= s && t < e ? 1 : 0);
// cubic bezier easing (css-style)
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
  return x => { let t = x; for (let i = 0; i < 8; i++) { const d = sx(t) - x; if (Math.abs(d) < 1e-5) break; t -= d / (3 * ax * t * t + 2 * bx * t + cx || 1e-6); } return sy(clamp(t)); };
}

// ---------- beat grid ----------
const BEATS = window.BEATS || { beats: [], accents: [], bpm: 120, sections: {} };
const BEAT_T = BEATS.beats;
function beatIndex(t) { // index of last beat <= t (binary search)
  let lo = 0, hi = BEAT_T.length - 1, r = -1;
  while (lo <= hi) { const m = (lo + hi) >> 1; if (BEAT_T[m] <= t) { r = m; lo = m + 1; } else hi = m - 1; }
  return r;
}
function beat(t) {
  const i = beatIndex(t);
  const cur = i >= 0 ? BEAT_T[i] : 0, nxt = i + 1 < BEAT_T.length ? BEAT_T[i + 1] : cur + 0.5;
  const len = Math.max(nxt - cur, 1e-3);
  return { i, cur, nxt, since: t - cur, frac: clamp((t - cur) / len), len, bar: Math.floor(Math.max(i, 0) / 4), beatInBar: mod(i, 4) };
}
// exponential pulse after each beat; every nth beat only when n>1
function pulse(t, k = 9, every = 1, offset = 0) {
  const b = beat(t);
  if (every === 1) return Math.exp(-b.since * k);
  const idx = b.i - offset;
  const back = mod(idx, every);
  const lastT = BEAT_T[Math.max(b.i - back, 0)] || 0;
  return Math.exp(-(t - lastT) * k);
}
// a stepped counter that increments on every beat (or every nth)
const beatCount = (t, every = 1) => Math.floor(Math.max(beatIndex(t), 0) / every);
// smoothed accent (section hits and strongest onsets)
function accent(t, k = 5) {
  let best = 0;
  const A = BEATS.accents;
  for (let i = A.length - 1; i >= 0; i--) { if (A[i] <= t) { best = Math.exp(-(t - A[i]) * k); break; } }
  return best;
}

// ---------- drawing ----------
function font(size, face = UI, weight = 500) { return `${weight} ${size}px "${face}"`; }
function text(ctx, str, x, y, o = {}) {
  const { size = 48, face = UI, weight = face === DISPLAY ? 800 : 500, color = PAPER, align = 'left', baseline = 'alphabetic', tracking = 0, alpha = 1 } = o;
  ctx.save();
  ctx.font = font(size, face, weight); ctx.fillStyle = color; ctx.textBaseline = baseline; ctx.globalAlpha *= alpha;
  if (!tracking) { ctx.textAlign = align; ctx.fillText(str, x, y); ctx.restore(); return ctx.measureText(str).width; }
  // manual tracking
  ctx.textAlign = 'left';
  const chars = [...str]; const widths = chars.map(c => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + tracking; });
  ctx.restore(); return total;
}
function measure(ctx, str, size, face = UI, weight = 500, tracking = 0) {
  ctx.save(); ctx.font = font(size, face, weight);
  const w = [...str].reduce((a, c) => a + ctx.measureText(c).width, 0) + tracking * (str.length - 1);
  ctx.restore(); return w;
}
function dot(ctx, x, y, r, color = PAPER) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, Math.max(r, 0), 0, TAU); ctx.fill(); }
function ring(ctx, x, y, r, w, color = PAPER, a0 = 0, a1 = TAU) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.arc(x, y, Math.max(r, 0), a0, a1); ctx.stroke(); }
function line(ctx, x0, y0, x1, y1, w = 3, color = PAPER) { ctx.strokeStyle = color; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
function rect(ctx, x, y, w, h, color = PAPER) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
function poly(ctx, pts, color = PAPER, stroke = 0) {
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = stroke; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
}
function regular(cx, cy, r, n, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU - Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
function bg(ctx, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); }
// pop-in with overshoot: returns scale 0→1(+overshoot)
const pop = (t, s, d = 0.35) => (t < s ? 0 : ease.outBack(clamp((t - s) / d)));
// slide-in offset (1 → 0)
const slide = (t, s, d = 0.5, fn = ease.outExpo) => 1 - fn(clamp((t - s) / d));
// circular wipe clip: radius grows to cover the screen from (x,y)
function circleClip(ctx, x, y, p) { const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)); ctx.beginPath(); ctx.arc(x, y, Math.max(R * p, 0), 0, TAU); ctx.clip(); }
// stepped time (frame-rate quantization demo)
const quant = (t, fps) => Math.floor(t * fps) / fps;
function withAlpha(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
function mixColor(h1, h2, t) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp(a >> 16, b >> 16, t)), g = Math.round(lerp((a >> 8) & 255, (b >> 8) & 255, t)), bl = Math.round(lerp(a & 255, b & 255, t));
  return `rgb(${r},${g},${bl})`;
}

// ---------- 3D ----------
function rotX(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; }
function rotY(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; }
function rotZ(p, a) { const c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; }
// camera at (0,0,-dist) looking +z; returns [sx, sy, scale, z]
function project(p, dist = 6, f = 900, cx = W / 2, cy = H / 2) { const z = p[2] + dist; const s = f / Math.max(z, 0.05); return [cx + p[0] * s, cy + p[1] * s, s, z]; }

// ---------- scene registry ----------
const SCENES = [];
function scene(name, start, end, draw, opts = {}) { SCENES.push({ name, start, end, draw, ...opts }); }
// chapter card: used by every chapter opener
function chapterCard(ctx, lt, num, title, sub, invert = false) {
  const fg = invert ? INK : PAPER, bgc = invert ? PAPER : INK;
  // accent disk wipe from a point, then card
  const p = ease.inOutExpo(clamp(lt / 0.6));
  bg(ctx, bgc);
  ctx.save(); circleClip(ctx, W / 2, H / 2, p); bg(ctx, ACCENT); ctx.restore();
  if (lt > 0.35) {
    const k = pop(lt, 0.35, 0.5);
    // giant number, bottom-left anchored, sliding up from below the frame
    ctx.save(); ctx.translate(140, H - 120 + 260 * slide(lt, 0.35, 0.6));
    text(ctx, num, 0, 0, { size: 560, face: DISPLAY, weight: 900, color: bgc });
    ctx.restore();
    const tp = clamp((lt - 0.7) / 0.4);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * ease.outExpo(tp), H); ctx.clip();
    text(ctx, title, 150, 240, { size: 150, face: DISPLAY, weight: 900, color: bgc, tracking: -4 });
    ctx.restore();
    const sp = clamp((lt - 1.0) / 0.5);
    text(ctx, sub, 154, 320, { size: 40, face: UI, weight: 500, color: bgc, alpha: ease.outCubic(sp), tracking: 1 });
    // thin rule that grows
    rect(ctx, 150, 345, 1620 * ease.outExpo(clamp((lt - 1.1) / 0.8)), 6, bgc);
  }
}
// card exit: accent disk shrinks to a dot (the point motif) centered
function cardExit(ctx, lt, len, fgBg) {
  // lt measured from card start; exit occupies last 0.6s before len
  const e = clamp((lt - (len - 0.6)) / 0.6);
  if (e <= 0) return;
  bg(ctx, fgBg);
  const p = 1 - ease.inOutExpo(e);
  ctx.save(); circleClip(ctx, W / 2, H / 2, p); bg(ctx, ACCENT); ctx.restore();
  dot(ctx, W / 2, H / 2, 16 + 40 * p, ACCENT);
}
