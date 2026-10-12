'use strict';
// 202–242  The engine room: the camera dives below the money line into the architecture.
const NODES = {
  app: { x: 700, y: 880, label: 'Mobile app', ic: 'phone', at: 0 }, ussd: { x: 700, y: 1240, label: 'USSD', ic: 'signal', at: 0.3 },
  service: { x: 1450, y: 1060, label: 'Service', sub: 'e.g. PayBill', ic: 'cart', at: 1.0 },
  backend: { x: 2250, y: 1060, label: 'CashWise backend', sub: 'consent check', ic: 'shield', at: 3.0 },
  gateway: { x: 3050, y: 1060, label: 'AI gateway', ic: 'gear', at: 7.0 }, model: { x: 3850, y: 1060, label: 'AI model', ic: 'star', at: 8.5 },
  catalog: { x: 3350, y: 1640, label: 'Fintech service catalog', ic: 'stack', at: 12.5 }, lake: { x: 4350, y: 1640, label: 'Data lake', sub: 'customer context', ic: 'db', at: 14.0 },
};
const EDGES = [['app', 'service', 0.8], ['ussd', 'service', 1.0], ['service', 'backend', 2.6], ['backend', 'gateway', 6.6], ['gateway', 'model', 8.2], ['catalog', 'model', 12.9], ['lake', 'model', 14.4]];
const CAM4 = makeCamera([
  { t: 202, x: 2500, y: -200, z: 0.7 }, { t: 205, x: 1250, y: 1060, z: 0.95 }, { t: 211, x: 1900, y: 1100, z: 0.95 }, { t: 216, x: 3000, y: 1200, z: 0.85 },
  { t: 222, x: 3600, y: 1350, z: 0.78 }, { t: 228, x: 2520, y: 1230, z: 0.47 }, { t: 242, x: 2520, y: 1230, z: 0.47 },
]);
function pill(ctx, n, active, k) {
  const w = measure(ctx, n.label, 36, UI, 800) + 190, h = n.sub ? 160 : 130;
  ctx.save(); ctx.translate(n.x, n.y); ctx.scale(k, k);
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2, active ? RED_ : SURF); if (!active) roundRect(ctx, -w / 2, -h / 2, w, h, h / 2, GREY2, 3);
  dot(ctx, -w / 2 + 64, 0, 42, active ? PAPER : SURF2); drawIcon(ctx, n.ic, -w / 2 + 64, 0, 0.5, active ? RED_ : PAPER);
  text(ctx, n.label, -w / 2 + 128, n.sub ? 2 : 13, { size: 36, face: UI, weight: 800, color: PAPER }); if (n.sub) text(ctx, n.sub, -w / 2 + 128, 44, { size: 26, face: UI, weight: 500, color: active ? PAPER : SOFT });
  ctx.restore(); return w;
}
function curve(ctx, a, b, color, width, p = 1, dash = null) { // s-curve from a to b (world), drawn to p
  const mx = (a[0] + b[0]) / 2; ctx.save(); if (dash) ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(a[0], a[1]);
  const n = Math.max(2, Math.floor(40 * p)); for (let i = 1; i <= n; i++) { const u = i / 40; const x = bez(a[0], mx, mx, b[0], u), y = bez(a[1], a[1], b[1], b[1], u); ctx.lineTo(x, y); } ctx.stroke(); ctx.restore(); }
function bez(p0, p1, p2, p3, u) { const v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; }
function onCurve(a, b, u) { const mx = (a[0] + b[0]) / 2; return [bez(a[0], mx, mx, b[0], u), bez(a[1], a[1], b[1], b[1], u)]; }

scene('how', 202, 242, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8); const s = t - 204; // narration-relative
  const cam = CAM4(t);
  ctx.save(); applyCamera(ctx, cam);
  // the money line above, faint, and the ground we dive through
  for (let v = 0; v <= 250; v += 50) line(ctx, -800, -v * PX_PER_USD, 5000, -v * PX_PER_USD, 1, GRID);
  drawLine(ctx, JORGE, 1800, withAlpha(PAPER, 0.5), 6); drawLine(ctx, FORK_GREEN, 3800, withAlpha(GREEN2, 0.5), 6);
  numeral(ctx, 2700, 3000, '04', 0.03, 1600);
  text(ctx, 'ENGINE ROOM', 400, 640, { size: 32, face: UI, weight: 800, color: withAlpha(PAPER, 0.35), tracking: 6 });
  line(ctx, 300, 680, 5200, 680, 2, GRID);
  // edges
  const N = NODES; const c = n => [N[n].x, N[n].y];
  EDGES.forEach(([a, b, at]) => { const p = ease.outCubic(clamp((s - at) / 0.8)); if (p > 0) curve(ctx, c(a), c(b), GREY2, 6, p); });
  // consent switch: no opt-in route back to the service (dashed), opt-in route continues
  const noOpt = s > 23;
  if (s > 4) { const p = ease.outCubic(clamp((s - 4) / 0.8)); curve(ctx, [N.backend.x, N.backend.y + 80], [N.service.x, N.service.y + 80], noOpt ? PAPER : GREY2, 6, p, [16, 14]);
    const q = pop(s, 4.4, 0.5); ctx.save(); ctx.translate((N.backend.x + N.service.x) / 2, N.backend.y + 330); ctx.scale(q, q); roundRect(ctx, -300, -44, 600, 88, 44, noOpt ? PAPER : SURF); text(ctx, noOpt ? 'no opt-in → continue as normal' : 'no opt-in → no recommendation', 0, 12, { size: 30, face: UI, weight: 800, color: noOpt ? INK : SOFT, align: 'center' }); ctx.restore(); }
  // return path: model → service, above the row, in red
  if (s > 18) { const p = ease.outCubic(clamp((s - 18) / 1.0)); curve(ctx, [N.model.x, N.model.y - 80], [N.service.x, N.service.y - 80], RED_, 8, p);
    const q = pop(s, 18.6, 0.5); ctx.save(); ctx.translate((N.model.x + N.service.x) / 2, N.model.y - 300); ctx.scale(q, q); roundRect(ctx, -280, -48, 560, 96, 48, RED_); text(ctx, 'one clear suggestion', 0, 13, { size: 34, face: UI, weight: 800, color: PAPER, align: 'center' }); ctx.restore(); }
  // nodes
  Object.entries(N).forEach(([k, n]) => { const kk = ease.outBack(clamp((s - n.at) / 0.5)); if (kk <= 0) return;
    const active = (k === 'backend' && s > 3.5 && s < 7) || (k === 'gateway' && s > 7 && s < 8.5) || (k === 'model' && s > 8.5 && s < 18) || (k === 'service' && s > 18 && s < 23) || (k === 'app' && s < 1) || (k === 'ussd' && s < 1);
    pill(ctx, n, active, kk); });
  // packets travelling on beats
  const seq = [['app', 'service', 1.4], ['service', 'backend', 3.2], ['backend', 'gateway', 7.2], ['gateway', 'model', 8.8], ['catalog', 'model', 13.4], ['lake', 'model', 14.9]];
  seq.forEach(([a, b, at]) => { const ph = (s - at) / 1.0; if (ph > 0 && ph < 1) { const [x, y] = onCurve(c(a), c(b), ease.inOutCubic(ph)); dot(ctx, x, y, 14 + 5 * pz, RED_); ring(ctx, x, y, 26, 3, withAlpha(RED_, 0.5)); } });
  if (s > 19 && s < 21.5) { const ph = ease.inOutCubic((s - 19) / 2.5); const [x, y] = onCurve([N.model.x, N.model.y - 80], [N.service.x, N.service.y - 80], ph); dot(ctx, x, y, 18 + 5 * pz, RED_); }
  if (s > 23.5 && s < 26) { const ph = ease.inOutCubic((s - 23.5) / 2.5); const [x, y] = onCurve([N.backend.x, N.backend.y + 80], [N.service.x, N.service.y + 80], ph); dot(ctx, x, y, 18, PAPER); }
  ctx.restore();

  // ---- screen space ----
  if (t < 205) statement(ctx, 'How it works', '', t, 202.3, { x: 150, y: 220, size: 84, sub: 'behind the scenes, it is simple' });
  const steps = [[0, 'A customer starts a normal service, on the app or on USSD.'], [2.6, 'Before confirming, the service asks CashWise for a recommendation.'], [4, 'CashWise checks consent.'], [7, 'Opted in → the request and the customer’s goals go to the AI gateway.'], [12, 'The model pulls products from the service catalog and context from the data lake.'], [18, 'It returns one clear suggestion.'], [23, 'No opt-in → no recommendation. The service runs as it always did.']];
  if (t >= 205) { let cur = steps[0]; steps.forEach(st => { if (s >= st[0]) cur = st; }); const since = s - cur[0];
    const idx = steps.indexOf(cur); roundRect(ctx, 120, 920, W - 240, 110, 24, withAlpha(SURF, 0.92)); text(ctx, String(idx + 1) + ' / ' + steps.length, 160, 985, { size: 26, face: UI, weight: 800, color: RED_ });
    text(ctx, cur[1], 260, 986, { size: 32, face: UI, weight: 600, color: PAPER, alpha: ease.outExpo(clamp(since / 0.4)) }); }
});
