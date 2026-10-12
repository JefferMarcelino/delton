'use strict';
// 302–332 strategic fit · 332–362 roadmap along the line · 362–380 the line ends in a point.
const PILLARS = [
  ['Personalize the experience,', 'strengthen loyalty', 'contextual financial insight inside every service, before completion', 'star', 304],
  ['Build a scalable', 'ecosystem', 'a reusable recommendation platform for the whole business', 'stack', 309.5],
  ['Embed purpose', 'into the brand', 'a tangible commitment to customers’ financial well-being', 'shield', 315],
  ['Empower customers', 'and communities', 'guidance on smartphones and USSD; rewards build resilience', 'people', 320.5],
];
const STAGES = [['Pilot', 'months 1–6', 'Merchant Payments + PayBill with a friendly-user group · $44.6K'], ['Service expansion', 'months 7–12', 'national launch on app + USSD · all telecom & financial services'], ['Africa expansion', 'years 2–5', 'Kenya & Tanzania first, then five more Group markets'], ['Scale', 'year 5+', 'across Vodacom and Vodafone markets in Africa and Europe'], ['Monetize', 'from year 2', 'offer the recommendation engine to B2B partners']];
const ROAD_X = 12000, ROAD_DX = 900;
const ROAD_LINE = [[11000, 120], [12000, 130], [12900, 150], [13800, 175], [14700, 205], [15600, 240], [16400, 250]];
const ROAD_HEAD = [[0, 11000], [1, 11000], [2.3, 12000], [6.7, 12900], [11.1, 13800], [15.5, 14700], [19.9, 15600], [27, 16400], [30, 16400]];
function roadHead(s) { for (let i = 0; i < ROAD_HEAD.length - 1; i++) { const a = ROAD_HEAD[i], b = ROAD_HEAD[i + 1]; if (s >= a[0] && s <= b[0]) return lerp(a[1], b[1], ease.inOutQuad((s - a[0]) / (b[0] - a[0] || 1))); } return 16400; }
const CAM6 = makeCamera([
  { t: 302, x: 9500, y: -500, z: 0.6 }, { t: 332, x: 10000, y: -520, z: 0.6 },
  { t: 333, x: 11700, y: -400, z: 0.8 }, { t: 356, x: 15400, y: -680, z: 0.8 }, { t: 362, x: 16300, y: -1340, z: 0.9 }, { t: 372, x: 16500, y: -1340, z: 0.9 }, { t: 380, x: 16500, y: -1340, z: 0.9 },
]);

scene('fit', 302, 332, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const cam = CAM6(t);
  ctx.save(); applyCamera(ctx, cam);
  for (let v = 0; v <= 250; v += 50) line(ctx, 4000, -v * PX_PER_USD, 12000, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  numeral(ctx, 9600, -1500, '06', 0.06, 1600);
  // four faint lines converge into one rising line (the pillars feeding one outcome)
  const n = PILLARS.filter(p => t >= p[4]).length;
  for (let i = 0; i < 4; i++) { const on = i < n; ctx.strokeStyle = on ? withAlpha(GREEN2, 0.7) : GRID; ctx.lineWidth = on ? 6 : 2; ctx.beginPath(); ctx.moveTo(8200, -(60 + i * 90) * PX_PER_USD); ctx.bezierCurveTo(9400, -(60 + i * 90) * PX_PER_USD, 9600, -200 * PX_PER_USD, 10600, -200 * PX_PER_USD); ctx.stroke(); }
  line(ctx, 10600, -200 * PX_PER_USD, 12000, -210 * PX_PER_USD, 10, n ? GREEN2 : GRID);
  ctx.restore();
  // screen
  roundRect(ctx, 150, 120, 300, 60, 14, RED_); text(ctx, 'VISION 2030', 300, 162, { size: 26, face: UI, weight: 800, color: PAPER, align: 'center' });
  text(ctx, 'Four pillars. One companion.', 480, 164, { size: 40, face: DISPLAY, weight: 800, color: PAPER, tracking: -1 });
  PILLARS.forEach(([l1, l2, d, ic, at], i) => { if (t < at) return; const k = ease.outExpo(clamp((t - at) / 0.6)); const cur = i === n - 1; const y = 250 + i * 190;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(60 * (1 - k), 0);
    roundRect(ctx, 150, y, 1620, 160, 28, cur ? RED_ : SURF);
    dot(ctx, 240, y + 80, 48, cur ? PAPER : SURF2); drawIcon(ctx, ic, 240, y + 80, 0.6 + (cur ? 0.08 * pz : 0), cur ? RED_ : PAPER);
    text(ctx, String(i + 1).padStart(2, '0'), 1700, y + 60, { size: 30, face: DISPLAY, weight: 900, color: cur ? PAPER : GREY2, align: 'right' });
    text(ctx, l1 + ' ' + l2, 330, y + 68, { size: 38, face: DISPLAY, weight: 800, color: PAPER, tracking: -1 });
    text(ctx, d, 330, y + 118, { size: 28, face: UI, weight: 500, color: cur ? PAPER : SOFT }); ctx.restore(); });
});

scene('roadmap', 332, 362, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8); const s = t - 332;
  const cam = CAM6(t);
  ctx.save(); applyCamera(ctx, cam);
  for (let v = 0; v <= 300; v += 50) line(ctx, 10000, -v * PX_PER_USD, 18000, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  numeral(ctx, 14000, -1700, '07', 0.06, 1600);
  const headX = roadHead(s);
  const cur = Math.max(0, Math.min(STAGES.length - 1, Math.floor((headX - ROAD_X + 20) / ROAD_DX)));
  drawLine(ctx, ROAD_LINE, headX, GREEN2, LINE_W);
  STAGES.forEach(([h, when, d], i) => { const x = ROAD_X + i * ROAD_DX; const y = -valueAt(ROAD_LINE, x) * PX_PER_USD; const on = headX >= x - 20; const k = on ? ease.outBack(clamp((headX - x + 20) / 160)) : 0;
    line(ctx, x, y, x, 40, 2, on ? withAlpha(PAPER, 0.5) : GRID); text(ctx, String(i + 1), x, 100, { size: 40, face: DISPLAY, weight: 900, color: on ? PAPER : GREY2, align: 'center' });
    if (k > 0) { dot(ctx, x, y, 24 * k, i === cur ? RED_ : PAPER); ring(ctx, x, y, (40 + 12 * pz * (i === cur ? 1 : 0)) * k, 4, i === cur ? RED_ : withAlpha(PAPER, 0.5));
      ctx.save(); ctx.translate(x, y - 70); ctx.scale(k, k); roundRect(ctx, -200, -90, 400, 90, 20, i === cur ? RED_ : SURF); text(ctx, h, 0, -50, { size: 28, face: DISPLAY, weight: 800, color: PAPER, align: 'center' }); text(ctx, when, 0, -16, { size: 22, face: UI, weight: 600, color: i === cur ? PAPER : SOFT, align: 'center' }); ctx.restore(); } });
  const [hx, hy] = headPos(ROAD_LINE, headX); dot(ctx, hx, hy, 16 + 8 * pz, PAPER);
  ctx.restore();
  // screen: big detail for the current stage
  if (s < 2) statement(ctx, 'The roadmap', '', t, 332.3, { x: 150, y: 220, size: 84, sub: 'validate · expand · scale · monetize' });
  else { const [h, when, d] = STAGES[cur]; const at = 2.3 + cur * 4.4; const k = ease.outExpo(clamp((s - at) / 0.5));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, 30 * (1 - k)); roundRect(ctx, 150, 700, 1620, 260, 30, withAlpha(SURF, 0.94));
    text(ctx, String(cur + 1).padStart(2, '0'), 200, 800, { size: 80, face: DISPLAY, weight: 900, color: RED_ }); text(ctx, when.toUpperCase(), 360, 760, { size: 24, face: UI, weight: 800, color: SOFT });
    text(ctx, h, 360, 830, { size: 60, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 }); text(ctx, d, 360, 900, { size: 32, face: UI, weight: 500, color: PAPER }); ctx.restore();
    if (s > 25) sub(ctx, 'One main goal: improve customer financial behaviour.', t, 357); }
});

scene('close', 362, 380, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 7); const s = t - 362;
  const cam = CAM6(t);
  ctx.save(); applyCamera(ctx, cam);
  for (let v = 0; v <= 300; v += 50) line(ctx, 10000, -v * PX_PER_USD, 18000, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  const headX = 16400 + 400 * ease.outCubic(clamp(s / 3));
  const END = [[15600, 240], [16400, 250], [16800, 250]];
  drawLine(ctx, ROAD_LINE, 16400, GREEN2, LINE_W); drawLine(ctx, END, headX, GREEN2, LINE_W);
  const [hx, hy] = headPos(END, headX); const grow = s > 10 ? ease.inOutExpo(clamp((s - 10) / 1.2)) : 0;
  dot(ctx, hx, hy, 24 + 12 * pz + 1400 * grow, RED_);
  ctx.restore();
  if (s < 10) {
    statement(ctx, 'M-Pesa moved the money.', '', t, 362.3, { x: 150, y: 300, size: 84, color: PAPER });
    text(ctx, 'CashWise', 150, 500, { size: 84, face: DISPLAY, weight: 900, color: RED_, tracking: -3, alpha: ease.outExpo(clamp((s - 2.4) / 0.4)) });
    let vx = 150; [['keeps it.', 3.0], ['protects it.', 3.8], ['grows it.', 4.6]].forEach(([v, st]) => { const wv = measure(ctx, v, 84, DISPLAY, 800, -3) + 50; if (s >= st) { const k = pop(s, st, 0.4); ctx.save(); ctx.translate(vx, 640); ctx.scale(k, k); text(ctx, v, 0, 0, { size: 84, face: DISPLAY, weight: 800, color: PAPER, tracking: -3 }); ctx.restore(); } vx += wv; });
    statement(ctx, 'One main goal: better financial decisions,', 'in every money moment.', t, 368.5, { x: 150, y: 800, size: 54, color: SOFT, color2: PAPER });
  } else {
    const ss = s - 10; const k = ease.outBack(clamp((ss - 0.8) / 0.6));
    if (ss > 0.8) { rect(ctx, 0, 0, W, H, RED_); wordmark(ctx, W / 2, 440, 240, PAPER, k); }
    const q = ease.outExpo(clamp((ss - 1.6) / 0.6));
    text(ctx, 'by Finsight', W / 2, 640, { size: 40, face: UI, weight: 600, color: withAlpha(INK, 0.8), align: 'center', alpha: q });
    text(ctx, 'Carla  ·  Delton  ·  Luana  ·  Pedro', W / 2, 710, { size: 40, face: UI, weight: 700, color: PAPER, align: 'center', alpha: q });
    text(ctx, 'Thank you.', W / 2, 880, { size: 60, face: DISPLAY, weight: 800, color: INK, align: 'center', alpha: ease.outExpo(clamp((ss - 3.5) / 0.6)) });
    if (ss > 6.5) { const e = ease.inExpo(clamp((ss - 6.5) / 1.2)); rect(ctx, 0, 0, W, H, withAlpha(INK, e)); }
  }
});
