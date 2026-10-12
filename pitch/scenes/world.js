'use strict';
// The world: a continuous 2D space with an eased camera. Jorge's money line is the spine of the film.
// World units are pixels at zoom 1. Balance axis: y = -value * PX_PER_USD (up is more money).
const PX_PER_USD = 4;
const SURF = '#16161B', SURF2 = '#1F1F26', GRID = '#24242B', GREEN2 = '#2ECC71', LINE_W = 10;
const RED_ = ACCENT;

// ---------- camera ----------
// keyframes: [{t, x, y, z}] — between keys the camera eases (inOutCubic); zoom interpolates in log space.
function makeCamera(keys) {
  keys = keys.slice().sort((a, b) => a.t - b.t);
  return function (t) {
    if (t <= keys[0].t) return keys[0];
    if (t >= keys[keys.length - 1].t) return keys[keys.length - 1];
    let i = 0; while (keys[i + 1].t <= t) i++;
    const a = keys[i], b = keys[i + 1];
    const p = (b.ease || ease.inOutCubic)(clamp((t - a.t) / (b.t - a.t)));
    return { x: lerp(a.x, b.x, p), y: lerp(a.y, b.y, p), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), p)) };
  };
}
function applyCamera(ctx, c) { ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); }
// world → screen
const w2s = (c, x, y) => [W / 2 + (x - c.x) * c.z, H / 2 + (y - c.y) * c.z];

// ---------- Jorge's money line (world coordinates) ----------
// keypoints [x, value]. Payday at x=200. Friday night steps 1800..2400. Weekend flat. Next month at 3400.
const JORGE = [[-600, 0], [200, 0], [200, 100], [1400, 108], [1800, 108], [1840, 90], [1960, 90], [2000, 84], [2120, 84], [2160, 72], [2280, 72], [2320, 57], [2440, 57], [2480, 43], [3000, 43], [3400, 43]];
const RECEIPTS = [['bottle', 18, 1820], ['taxi', 6, 1980], ['food', 12, 2140], ['bottle', 15, 2300], ['taxi', 14, 2460]];
// the two futures after CashWise (fork at x=1800): red = original, green = balanced
const FORK_RED = [[1800, 108], [1840, 90], [1960, 90], [2000, 84], [2120, 84], [2160, 72], [2280, 72], [2320, 57], [2440, 57], [2480, 43], [3000, 43], [3400, 43], [3800, 43]];
const FORK_GREEN = [[1800, 108], [1840, 98], [1960, 98], [2000, 92], [2120, 92], [2160, 85], [2280, 85], [2320, 83], [3000, 83], [3400, 95], [3800, 110]];
function valueAt(pts, x) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; if (x >= a[0] && x <= b[0]) { return b[0] === a[0] ? b[1] : lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } }
  return pts[pts.length - 1][1];
}
// draw the line up to head x (world coords), with optional dashed projection beyond
function drawLine(ctx, pts, headX, color = PAPER, width = LINE_W, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  let started = false;
  for (let i = 0; i < pts.length; i++) {
    const [x, v] = pts[i]; if (x > headX) { const prev = pts[i - 1]; if (prev) { const vv = valueAt(pts, headX); ctx.lineTo(headX, -vv * PX_PER_USD); } break; }
    if (!started) { ctx.moveTo(x, -v * PX_PER_USD); started = true; } else ctx.lineTo(x, -v * PX_PER_USD);
  }
  ctx.stroke(); ctx.restore();
}
function headPos(pts, x) { return [x, -valueAt(pts, x) * PX_PER_USD]; }
function axis(ctx, x0, x1, y = 0, color = GRID) { line(ctx, x0, y, x1, y, 2, color); }
function hlabel(ctx, x, value, str, color = SOFT, size = 26) { const y = -value * PX_PER_USD; ctx.setLineDash([12, 12]); line(ctx, x - 2000, y, x + 3000, y, 2, withAlpha(color, 0.5)); ctx.setLineDash([]); text(ctx, str, x - 2000 + 40, y - 14, { size, face: UI, weight: 700, color }); }

// ---------- UI kits ----------
// chat bubble (world or screen coordinates), tail on the left or right
function chat(ctx, x, y, str, o = {}) {
  const { mine = false, k = 1, size = 30, width = 0, name = '' } = o;
  const w = width || measure(ctx, str, size, UI, 500) + 56, h = size + 44;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  roundRect(ctx, mine ? -w : 0, -h, w, h, 26, mine ? RED_ : PAPER);
  text(ctx, str, mine ? -w + 28 : 28, -h / 2 + size * 0.36, { size, face: UI, weight: 500, color: mine ? PAPER : INK });
  if (name) text(ctx, name, mine ? -w : 0, -h - 12, { size: 20, face: UI, weight: 700, color: SOFT });
  ctx.restore(); return w;
}
function typing(ctx, x, y, t, k = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(k, k); roundRect(ctx, 0, -60, 120, 60, 26, PAPER); for (let i = 0; i < 3; i++) dot(ctx, 30 + i * 30, -30 - 6 * Math.max(0, Math.sin(t * 8 - i * 0.9)), 8, INK); ctx.restore(); }
// price tag pinned to a point
function tag(ctx, x, y, str, color = PAPER, fg = INK, k = 1, size = 30, above = true) {
  const w = measure(ctx, str, size, DISPLAY, 800, -1) + 44, h = size + 30;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const yy = above ? -40 - h : 40; roundRect(ctx, -w / 2, yy, w, h, 14, color); poly(ctx, above ? [[-12, -40], [12, -40], [0, -24]] : [[-12, 40], [12, 40], [0, 24]], color);
  text(ctx, str, 0, yy + h / 2 + size * 0.36, { size, face: DISPLAY, weight: 800, color: fg, align: 'center', tracking: -1 });
  ctx.restore();
}
// receipt chip
function receipt(ctx, x, y, ic, amount, k = 1, rot = 0, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  roundRect(ctx, -70, -90, 140, 180, 16, PAPER); drawIcon(ctx, ic, 0, -22, 0.6, INK); text(ctx, '−' + amount, 0, 62, { size: 34, face: DISPLAY, weight: 800, color: RED_, align: 'center' });
  for (let i = 0; i < 6; i++) rect(ctx, -58 + i * 20, 78, 12, 10, SURF2);
  ctx.restore();
}
// a realistic phone app frame; screen is 480x980 (w,h) in local coordinates
function appPhone(ctx, x, y, w, h, drawScreen, o = {}) {
  const { frame = '#2A2A30', r = 56, k = 1 } = o;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(k, k); ctx.translate(-w / 2, -h / 2);
  roundRect(ctx, -16, -16, w + 32, h + 32, r + 12, frame); roundRect(ctx, -12, -12, w + 24, h + 24, r + 8, '#0A0A0C');
  ctx.save(); ctx.beginPath(); ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r); ctx.closePath(); ctx.clip();
  rect(ctx, 0, 0, w, h, PAPER); drawScreen(ctx, w, h); ctx.restore();
  roundRect(ctx, w / 2 - 70, 16, 140, 34, 17, '#0A0A0C'); // dynamic island
  ctx.restore();
}
function statusBar(ctx, w, dark = false) { const c = dark ? PAPER : INK; text(ctx, '09:41', 36, 46, { size: 24, face: UI, weight: 700, color: c }); drawIcon(ctx, 'signal', w - 110, 36, 0.28, c); roundRect(ctx, w - 70, 26, 40, 20, 6, c); }
function appHeader(ctx, w, title, sub = '') { rect(ctx, 0, 0, w, 150, RED_); statusBar(ctx, w, true); text(ctx, title, 36, 112, { size: 34, face: UI, weight: 800, color: PAPER }); if (sub) text(ctx, sub, w - 36, 112, { size: 22, face: UI, weight: 600, color: PAPER, align: 'right' }); }
function uiButton(ctx, x, y, w, h, label, primary = true, pressed = 0, size = 26) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(1 - 0.05 * pressed, 1 - 0.05 * pressed); ctx.translate(-w / 2, -h / 2);
  roundRect(ctx, 0, 0, w, h, 18, primary ? RED_ : '#E8E4DC'); text(ctx, label, w / 2, h / 2 + size * 0.36, { size, face: UI, weight: 700, color: primary ? PAPER : INK, align: 'center' }); ctx.restore();
}
function listRow(ctx, x, y, w, title, sub, amount, neg = true, ic = 'cart') {
  roundRect(ctx, x, y, w, 84, 18, '#FFFFFF'); dot(ctx, x + 44, y + 42, 26, '#F0ECE4'); drawIcon(ctx, ic, x + 44, y + 42, 0.3, INK);
  text(ctx, title, x + 90, y + 38, { size: 24, face: UI, weight: 700, color: INK }); text(ctx, sub, x + 90, y + 66, { size: 20, face: UI, weight: 500, color: MUTE });
  text(ctx, (neg ? '− ' : '+ ') + amount, x + w - 24, y + 52, { size: 24, face: UI, weight: 700, color: neg ? INK : '#1E8E4E', align: 'right' });
}
// finger tap cursor (screen space)
function finger(ctx, x, y, pressed = 0) { dot(ctx, x, y, 26 - 6 * pressed, withAlpha(PAPER, 0.9)); ring(ctx, x, y, 40 + 20 * pressed, 4, withAlpha(PAPER, 0.8 - 0.5 * pressed)); }
// mini fork chart (local coordinates), p = draw progress
function forkChart(ctx, x, y, w, h, p) {
  for (let k = 0; k <= 4; k++) line(ctx, x + k * w / 4, y, x + k * w / 4, y - h, 1, '#DDD8CF');
  const draw = (vals, col) => { ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); const n = Math.floor(p * 4 * 10); for (let k = 0; k <= n; k++) { const u = k / 10; const i = Math.floor(u), f = u - i; const v = i >= 4 ? vals[4] : lerp(vals[i], vals[i + 1], f); const px = x + u / 4 * w, py = y - v * h; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); };
  draw([0.9, 0.35, 0.12, 0.05, 0.02], RED_); draw([0.9, 0.72, 0.6, 0.62, 0.7], GREEN2);
}
// sparkline population: deterministic random-walk balance lines (normalized 0..1), n people
function makePeople(n, seed) {
  const r = mulberry32(seed); const out = [];
  for (let i = 0; i < n; i++) { const pts = []; let v = 0.2 + r() * 0.3; const pay = 0.5 + r() * 0.4; for (let k = 0; k < 24; k++) { if (k === 2) v += pay; else v -= (0.02 + r() * 0.09) * (k > 6 && k < 12 ? 1.6 : 0.6); v = clamp(v, 0.02, 1.2); pts.push(v); } out.push(pts); }
  return out;
}
function sparkline(ctx, pts, x, y, w, h, color, width = 3, upto = 1) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
  const n = Math.max(1, Math.floor(upto * (pts.length - 1)));
  for (let k = 0; k <= n; k++) { const px = x + k / (pts.length - 1) * w, py = y + h - clamp(pts[k], 0, 1.2) / 1.2 * h; k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.stroke();
}
// big statement in screen space: two lines, left aligned on the grid
function statement(ctx, l1, l2, t, start, o = {}) {
  const { x = 150, y = 300, size = 96, color = PAPER, color2 = RED_, sub = '', align = 'left' } = o;
  const k = ease.outExpo(clamp((t - start) / 0.6)); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(0, 40 * (1 - k));
  text(ctx, l1, x, y, { size, face: DISPLAY, weight: 900, color, tracking: -size * 0.035, align });
  if (l2) text(ctx, l2, x, y + size * 1.1, { size, face: DISPLAY, weight: 900, color: color2, tracking: -size * 0.035, align });
  if (sub) text(ctx, sub, x + 4, y + size * (l2 ? 1.1 : 0) + size * 0.75, { size: 36, face: UI, weight: 500, color: SOFT, align });
  ctx.restore();
}
// bottom caption, screen space
function sub(ctx, str, t, start, color = PAPER) { const p = ease.outExpo(clamp((t - start) / 0.5)); if (p <= 0) return; ctx.save(); ctx.globalAlpha = p; text(ctx, str, W / 2, 990 + 24 * (1 - p), { size: 38, face: UI, weight: 600, color, align: 'center' }); ctx.restore(); }
// faint section numeral living in the world
function numeral(ctx, x, y, str, alpha = 0.08, size = 1400) { text(ctx, str, x, y, { size, face: DISPLAY, weight: 900, color: withAlpha(PAPER, alpha), align: 'center' }); }
// confetti burst (seeded), screen space
function confetti(ctx, x, y, s, seed = 1) { if (s < 0 || s > 1.6) return; for (let i = 0; i < 40; i++) { const a = hash(i, seed) * TAU, sp = 300 + hash(i, seed + 1) * 500; const px = x + Math.cos(a) * sp * s, py = y + Math.sin(a) * sp * s + 500 * s * s; ctx.save(); ctx.translate(px, py); ctx.rotate(s * 6 + i); rect(ctx, -8, -5, 16, 10, i % 3 === 0 ? RED_ : i % 3 === 1 ? GREEN2 : PAPER); ctx.restore(); } }
