'use strict';
// Shared pitch drawing: characters, phone frames, UI widgets, icons, section cards.
const RED = ACCENT, GREY = '#2A2A30', GREY2 = '#3C3C44', SOFT = '#A8A49C', GREEN = '#2ECC71';
const money = (n, d = 0) => 'USD ' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

function roundRect(ctx, x, y, w, h, r, color, stroke = 0) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = stroke; ctx.stroke(); } else { ctx.fillStyle = color; ctx.fill(); }
}

// a simple geometric person. mood: 'happy' | 'sad' | 'surprised' | 'neutral' | 'think'
function figure(ctx, x, y, s = 1, o = {}) {
  const { body = PAPER, skin = PAPER, mood = 'neutral', bob = 0, armL = 0.2, armR = 0.2, flip = false, cap = null } = o;
  ctx.save(); ctx.translate(x, y + bob); ctx.scale(flip ? -s : s, s);
  // legs
  line(ctx, -22, 120, -26, 230, 16, body); line(ctx, 22, 120, 26, 230, 16, body);
  // body
  roundRect(ctx, -60, 0, 120, 140, 34, body);
  // arms
  line(ctx, -60, 30, -60 - 70 * Math.cos(armL), 30 + 90 * Math.sin(armL), 16, body);
  line(ctx, 60, 30, 60 + 70 * Math.cos(armR), 30 + 90 * Math.sin(armR), 16, body);
  // head
  dot(ctx, 0, -70, 56, skin);
  if (cap) { ctx.fillStyle = cap; ctx.beginPath(); ctx.arc(0, -78, 58, Math.PI, 0); ctx.fill(); rect(ctx, -58, -82, 130, 12, cap); }
  // face
  const eye = (ex) => dot(ctx, ex, -78, mood === 'surprised' ? 9 : 6, INK);
  eye(-20); eye(20);
  ctx.strokeStyle = INK; ctx.lineWidth = 6; ctx.beginPath();
  if (mood === 'happy') ctx.arc(0, -56, 18, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mood === 'sad') ctx.arc(0, -36, 18, 1.15 * Math.PI, 1.85 * Math.PI);
  else if (mood === 'surprised') { ctx.stroke(); dot(ctx, 0, -48, 10, INK); ctx.beginPath(); }
  else if (mood === 'think') { ctx.moveTo(-12, -48); ctx.lineTo(14, -52); }
  else { ctx.moveTo(-14, -50); ctx.lineTo(14, -50); }
  ctx.stroke();
  ctx.restore();
}

// phone frame with a screen callback drawing in screen coordinates (0..sw, 0..sh)
function phone(ctx, x, y, w, h, drawScreen, o = {}) {
  const { frame = PAPER, screen = INK, r = 48 } = o;
  roundRect(ctx, x - 14, y - 14, w + 28, h + 28, r + 10, frame);
  ctx.save(); roundRect(ctx, x, y, w, h, r, screen); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.clip();
  ctx.translate(x, y); drawScreen(ctx, w, h); ctx.restore();
  roundRect(ctx, x + w / 2 - 60, y + 14, 120, 26, 13, frame); // notch
}
function button(ctx, x, y, w, h, label, primary = true, size = 28, pressed = 0) {
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(1 - 0.06 * pressed, 1 - 0.06 * pressed); ctx.translate(-w / 2, -h / 2);
  roundRect(ctx, 0, 0, w, h, h / 2, primary ? RED : PAPER, primary ? 0 : 0);
  if (!primary) roundRect(ctx, 0, 0, w, h, h / 2, INK, 3);
  text(ctx, label, w / 2, h / 2 + size * 0.36, { size, face: UI, weight: 600, color: primary ? PAPER : INK, align: 'center' });
  ctx.restore();
}
function toggle(ctx, x, y, on, w = 110, h = 60) {
  roundRect(ctx, x, y, w, h, h / 2, on ? GREEN : GREY2);
  dot(ctx, x + h / 2 + (w - h) * on, y + h / 2, h / 2 - 6, PAPER);
}
function bubble(ctx, x, y, w, h, str, o = {}) {
  const { fill = PAPER, color = INK, size = 34, tail = 'left', k = 1 } = o;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  roundRect(ctx, 0, -h, w, h, 28, fill);
  ctx.fillStyle = fill; ctx.beginPath(); if (tail === 'left') { ctx.moveTo(30, 0); ctx.lineTo(10, 26); ctx.lineTo(60, 0); } else { ctx.moveTo(w - 30, 0); ctx.lineTo(w - 10, 26); ctx.lineTo(w - 60, 0); } ctx.fill();
  text(ctx, str, w / 2, -h / 2 + size * 0.36, { size, face: UI, weight: 600, color, align: 'center' });
  ctx.restore();
}
// icons (centered at 0,0, ~100px box), drawn in `c`
const icon = {
  phone(ctx, c = PAPER) { roundRect(ctx, -28, -50, 56, 100, 12, c); roundRect(ctx, -20, -40, 40, 70, 4, INK); dot(ctx, 0, 40, 4, INK); },
  coin(ctx, c = PAPER) { dot(ctx, 0, 0, 44, c); ring(ctx, 0, 0, 32, 5, INK); text(ctx, '$', 0, 13, { size: 40, face: UI, weight: 800, color: INK, align: 'center' }); },
  bottle(ctx, c = PAPER) { roundRect(ctx, -16, -52, 32, 34, 8, c); roundRect(ctx, -26, -24, 52, 76, 12, c); },
  taxi(ctx, c = PAPER) { roundRect(ctx, -50, -14, 100, 40, 10, c); roundRect(ctx, -30, -38, 60, 30, 8, c); dot(ctx, -28, 30, 11, INK); dot(ctx, 28, 30, 11, INK); },
  food(ctx, c = PAPER) { ctx.strokeStyle = c; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 8, 40, Math.PI, 0); ctx.stroke(); line(ctx, -48, 10, 48, 10, 7, c); },
  bolt(ctx, c = PAPER) { poly(ctx, [[10, -52], [-26, 6], [-2, 6], [-12, 52], [28, -10], [4, -10]], c); },
  shield(ctx, c = PAPER) { poly(ctx, [[0, -52], [44, -36], [40, 14], [0, 52], [-40, 14], [-44, -36]], c); line(ctx, -16, 2, -4, 16, 8, INK); line(ctx, -4, 16, 20, -14, 8, INK); },
  chart(ctx, c = PAPER) { line(ctx, -44, 40, -44, -40, 7, c); line(ctx, -44, 40, 44, 40, 7, c); ctx.strokeStyle = c; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-34, 20); ctx.lineTo(-8, -4); ctx.lineTo(10, 10); ctx.lineTo(38, -30); ctx.stroke(); },
  people(ctx, c = PAPER) { dot(ctx, -24, -20, 16, c); dot(ctx, 24, -20, 16, c); roundRect(ctx, -50, 2, 48, 44, 16, c); roundRect(ctx, 2, 2, 48, 44, 16, c); },
  star(ctx, c = PAPER) { const p = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 ? 20 : 48; p.push([Math.cos(a) * r, Math.sin(a) * r]); } poly(ctx, p, c); },
  wallet(ctx, c = PAPER) { roundRect(ctx, -50, -30, 100, 64, 14, c); roundRect(ctx, 10, -8, 44, 26, 8, INK); dot(ctx, 32, 5, 5, c); },
  gear(ctx, c = PAPER) { for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); rect(ctx, -8, -50, 16, 24, c); ctx.restore(); } dot(ctx, 0, 0, 32, c); dot(ctx, 0, 0, 12, INK); },
  db(ctx, c = PAPER) { for (let k = 0; k < 3; k++) roundRect(ctx, -44, -46 + k * 34, 88, 26, 8, c); dot(ctx, 30, -33, 4, INK); dot(ctx, 30, 1, 4, INK); dot(ctx, 30, 35, 4, INK); },
  check(ctx, c = GREEN) { dot(ctx, 0, 0, 46, c); line(ctx, -20, 2, -6, 18, 9, INK); line(ctx, -6, 18, 24, -16, 9, INK); },
  cross(ctx, c = RED) { dot(ctx, 0, 0, 46, c); line(ctx, -16, -16, 16, 16, 9, PAPER); line(ctx, 16, -16, -16, 16, 9, PAPER); },
  signal(ctx, c = PAPER) { for (let k = 0; k < 4; k++) rect(ctx, -44 + k * 24, 30 - (k + 1) * 18, 16, (k + 1) * 18, c); },
  cart(ctx, c = PAPER) { poly(ctx, [[-44, -30], [-26, -30], [-10, 20], [34, 20], [44, -14], [-18, -14]], c, 7); dot(ctx, -6, 36, 8, c); dot(ctx, 30, 36, 8, c); },
  mail(ctx, c = PAPER) { roundRect(ctx, -50, -32, 100, 64, 10, c); poly(ctx, [[-50, -32], [0, 8], [50, -32]], INK, 6); },
  megaphone(ctx, c = PAPER) { poly(ctx, [[-50, -16], [-20, -16], [36, -44], [36, 44], [-20, 16], [-50, 16]], c); roundRect(ctx, -34, 16, 20, 30, 6, c); },
  stack(ctx, c = PAPER) { for (let k = 0; k < 3; k++) poly(ctx, [[0, -44 + k * 22], [48, -22 + k * 22], [0, 0 + k * 22], [-48, -22 + k * 22]], k === 0 ? c : withAlpha(c, 0.55)); },
  home(ctx, c = PAPER) { poly(ctx, [[0, -48], [48, -4], [34, -4], [34, 44], [-34, 44], [-34, -4], [-48, -4]], c); rect(ctx, -10, 10, 20, 34, INK); },
};
function drawIcon(ctx, name, x, y, s = 1, c = PAPER) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); icon[name](ctx, c); ctx.restore(); }

// section card used by every section opener (4 s); number bottom-left, title top-left
function sectionCard(ctx, lt, num, title, sub, invert = false) { chapterCard(ctx, lt, num, title, sub, invert); cardExit(ctx, lt, 4, invert ? PAPER : INK); }

// wordmark: "CashWise" with the coin dot
function wordmark(ctx, x, y, size, color = PAPER, k = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  const w = measure(ctx, 'CashWise', size, DISPLAY, 900, -size * 0.03);
  text(ctx, 'CashWise', -w / 2, size * 0.36, { size, face: DISPLAY, weight: 900, color, tracking: -size * 0.03 });
  dot(ctx, w / 2 + size * 0.22, size * 0.2, size * 0.13, RED);
  ctx.restore(); return w;
}
// caption bar at the bottom (readable statement of what the voice says)
function caption(ctx, str, t, start, color = PAPER, bgc = null) {
  const p = ease.outExpo(clamp((t - start) / 0.5)); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p;
  if (bgc) roundRect(ctx, 120, 940 + 20 * (1 - p), W - 240, 90, 20, bgc);
  text(ctx, str, W / 2, 1000 + 20 * (1 - p), { size: 40, face: UI, weight: 600, color, align: 'center' });
  ctx.restore();
}
// progress "goal" bar
function goalBar(ctx, x, y, w, p, label, value) {
  roundRect(ctx, x, y, w, 36, 18, GREY); roundRect(ctx, x, y, Math.max(w * p, 36), 36, 18, RED);
  text(ctx, label, x, y - 18, { size: 30, face: UI, weight: 600, color: PAPER }); text(ctx, value, x + w, y - 18, { size: 30, face: UI, weight: 500, color: SOFT, align: 'right' });
}
// count-up with easing, formatted
const countTo = (t, s, d, target, fn = ease.outExpo) => target * fn(clamp((t - s) / d));
