'use strict';
// 202–242  section 04: how it works (architecture, built step by step with the narration)
scene('how', 202, 242, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '04', 'How it works', 'behind the scenes'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const s = lt - 4; // 0..36

  // node layout
  const N = {
    app:     { x: 200,  y: 330, w: 240, h: 110, label: 'Mobile app', ic: 'phone', at: 0 },
    ussd:    { x: 200,  y: 500, w: 240, h: 110, label: 'USSD', ic: 'signal', at: 0.3 },
    service: { x: 560,  y: 415, w: 280, h: 110, label: 'Service', sub: 'e.g. PayBill', ic: 'cart', at: 1.2 },
    backend: { x: 960,  y: 415, w: 300, h: 110, label: 'CashWise backend', sub: 'consent check', ic: 'shield', at: 4.0 },
    gateway: { x: 960,  y: 650, w: 300, h: 110, label: 'AI gateway', ic: 'gear', at: 8.0 },
    model:   { x: 1380, y: 650, w: 300, h: 110, label: 'AI model', ic: 'star', at: 9.5 },
    catalog: { x: 1380, y: 860, w: 300, h: 100, label: 'Fintech service catalog', ic: 'stack', at: 13.0 },
    lake:    { x: 1380, y: 440, w: 300, h: 100, label: 'Data lake', sub: 'customer context', ic: 'db', at: 14.5 },
  };
  const E = [
    ['app', 'service', 0.8], ['ussd', 'service', 1.0], ['service', 'backend', 3.0], ['backend', 'gateway', 7.0], ['gateway', 'model', 9.0],
    ['catalog', 'model', 13.5], ['lake', 'model', 15.0],
  ];
  const center = n => [n.x + n.w / 2, n.y + n.h / 2];
  const drawEdge = (a, b, at, col = GREY2, w = 6) => {
    const p = ease.outExpo(clamp((s - at) / 0.6)); if (p <= 0) return;
    const [ax, ay] = center(N[a]), [bx, by] = center(N[b]);
    const mx = ax + (bx - ax) * p, my = ay + (by - ay) * p;
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(ax, ay);
    if (Math.abs(ay - by) > 20 && Math.abs(ax - bx) > 20) { ctx.lineTo(ax + (bx - ax) * Math.min(p, 0.5) * 2 * 0.5 + 0, ay); if (p > 0.5) { ctx.lineTo((ax + bx) / 2, ay + (by - ay) * (p - 0.5) * 2); } }
    else ctx.lineTo(mx, my);
    ctx.stroke();
  };
  // packet travelling along an edge (orthogonal path), phase in [0,1]
  const packet = (a, b, ph, col = RED) => {
    const [ax, ay] = center(N[a]), [bx, by] = center(N[b]);
    let x, y;
    if (Math.abs(ay - by) > 20 && Math.abs(ax - bx) > 20) { if (ph < 0.5) { x = ax + (bx - ax) * 0.5 * (ph * 2); y = ay; } else { x = (ax + bx) / 2; y = ay + (by - ay) * ((ph - 0.5) * 2); } }
    else { x = ax + (bx - ax) * ph; y = ay + (by - ay) * ph; }
    dot(ctx, x, y, 12 + 4 * pz, col);
  };
  // orthogonal edges drawn fully once active (simpler and clearer than the partial version)
  const edge = (a, b, at, col = GREY2) => {
    const p = ease.outExpo(clamp((s - at) / 0.6)); if (p <= 0) return;
    const [ax, ay] = center(N[a]), [bx, by] = center(N[b]);
    ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ax, ay);
    if (Math.abs(ay - by) > 20 && Math.abs(ax - bx) > 20) { ctx.lineTo((ax + bx) / 2, ay); ctx.lineTo((ax + bx) / 2, by); ctx.lineTo(bx, by); } else ctx.lineTo(bx, by);
    ctx.stroke(); ctx.restore();
  };
  E.forEach(([a, b, at]) => edge(a, b, at));
  // consent branch: backend → "service continues as normal" (no opt-in)
  const noOpt = s > 23;
  if (s > 4.5) { const p = ease.outExpo(clamp((s - 4.5) / 0.6)); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = noOpt ? PAPER : GREY2; ctx.lineWidth = 6; ctx.setLineDash([14, 12]); ctx.beginPath(); ctx.moveTo(1110, 415); ctx.lineTo(1110, 300); ctx.lineTo(700, 300); ctx.lineTo(700, 415); ctx.stroke(); ctx.restore();
    roundRect(ctx, noOpt ? 680 : 780, 262, noOpt ? 500 : 300, 76, 20, noOpt ? PAPER : '#17171B'); text(ctx, noOpt ? 'no opt-in → continue as normal' : 'no opt-in', 930, 310, { size: 22, face: UI, weight: 700, color: noOpt ? INK : SOFT, align: 'center' }); }
  // return path: model → service (recommendation)
  if (s > 18) { const p = ease.outExpo(clamp((s - 18) / 0.6)); ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(1680, 705); ctx.lineTo(1780, 705); ctx.lineTo(1780, 1000); ctx.lineTo(700, 1000); ctx.lineTo(700, 525); ctx.stroke(); ctx.restore();
    roundRect(ctx, 900, 960, 420, 76, 20, RED); text(ctx, 'one clear suggestion', 1110, 1010, { size: 26, face: UI, weight: 800, color: PAPER, align: 'center' }); }

  // nodes
  Object.entries(N).forEach(([k, n]) => {
    const p = ease.outBack(clamp((s - n.at) / 0.5)); if (p <= 0) return;
    const active = (k === 'backend' && s > 4 && s < 8) || (k === 'gateway' && s > 8 && s < 9.5) || (k === 'model' && s > 9.5 && s < 18) || (k === 'service' && s > 18 && s < 23);
    ctx.save(); ctx.translate(n.x + n.w / 2, n.y + n.h / 2); ctx.scale(p, p); ctx.translate(-n.w / 2, -n.h / 2);
    roundRect(ctx, 0, 0, n.w, n.h, 22, active ? RED : '#17171B'); if (!active) roundRect(ctx, 0, 0, n.w, n.h, 22, GREY2, 3);
    drawIcon(ctx, n.ic, 44, n.h / 2, 0.5, PAPER);
    text(ctx, n.label, 84, n.h / 2 + (n.sub ? 0 : 10), { size: n.label.length > 16 ? 22 : 26, face: UI, weight: 800, color: PAPER });
    if (n.sub) text(ctx, n.sub, 84, n.h / 2 + 30, { size: 20, face: UI, weight: 500, color: active ? PAPER : SOFT });
    ctx.restore();
  });
  // packets
  const seq = [['app', 'service', 1.5], ['service', 'backend', 3.5], ['backend', 'gateway', 7.5], ['gateway', 'model', 9.2], ['catalog', 'model', 14.0], ['lake', 'model', 15.5]];
  seq.forEach(([a, b, at]) => { const ph = (s - at) / 1.0; if (ph > 0 && ph < 1) packet(a, b, ease.inOutCubic(ph)); });
  if (s > 18.5 && s < 21.5) { const ph = (s - 18.5) / 3; const pts = [[1680, 705], [1780, 705], [1780, 1000], [700, 1000], [700, 525]]; const L = [100, 295, 1080, 475]; const tot = L.reduce((a, c) => a + c); let d = ph * tot, i = 0; while (i < L.length - 1 && d > L[i]) { d -= L[i]; i++; } const f = d / L[i]; dot(ctx, lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f), 14 + 4 * pz, RED); }

  // step captions following the narration
  const steps = [[0, 'A customer starts a normal service, on the app or USSD.'], [3, 'Before confirming, the service asks CashWise for a recommendation.'], [4.5, 'CashWise checks consent.'], [7.5, 'Opted in → request + goals go to the AI gateway.'], [12.5, 'The model pulls products from the catalog and context from the data lake.'], [18, 'It returns one clear suggestion to the customer.'], [23, 'No opt-in → no recommendation. The service runs as it always did.']];
  let cur = steps[0]; steps.forEach(st => { if (s >= st[0]) cur = st; });
  const since = s - cur[0];
  text(ctx, 'Simple by design', 150, 150, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
  roundRect(ctx, 150, 180, 1620 * ease.outExpo(clamp(since / 0.4)), 6, RED);
  text(ctx, cur[1], 150, 236, { size: 32, face: UI, weight: 600, color: SOFT, alpha: ease.outExpo(clamp(since / 0.4)) });
  if (lt > 39.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 39.4) / 0.6), H, RED);
});
