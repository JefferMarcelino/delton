'use strict';
// 62–122  section 02: the impact (statistics and consequences)
const IMPACT_R = mulberry32(62);
const FIELD = Array.from({ length: 562 }, () => [IMPACT_R(), IMPACT_R()]);

scene('impact', 62, 122, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '02', 'The impact', 'why Jorge is not alone'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);

  if (lt < 13) { // Mozambique: 64 of 100 people
    const s = lt - 4;
    const n = Math.min(Math.floor(s * 14), 100); const redN = Math.min(Math.floor(Math.max(s - 1.5, 0) * 12), 64);
    const x0 = 1060, y0 = 230, g = 78;
    for (let i = 0; i < n; i++) { const c = i % 10, r = Math.floor(i / 10); const k = ease.outBack(clamp((s - i / 14) / 0.3)); const isRed = i < redN;
      ctx.save(); ctx.translate(x0 + c * g, y0 + r * g); ctx.scale(k, k); dot(ctx, 0, -18, 15, isRed ? RED : PAPER); roundRect(ctx, -20, 2, 40, 34, 12, isRed ? RED : PAPER); ctx.restore(); }
    roundRect(ctx, 150, 200, 360, 64, 14, PAPER); text(ctx, 'MOZAMBIQUE', 330, 244, { size: 28, face: UI, weight: 800, color: INK, align: 'center' });
    const v = Math.round(countTo(t, 66.2, 3, 64));
    text(ctx, '~' + v + '%', 150, 560, { size: 300, face: DISPLAY, weight: 900, color: RED, tracking: -12 });
    text(ctx, 'of adult Mozambicans', 156, 660, { size: 48, face: UI, weight: 700, color: PAPER });
    text(ctx, 'are financially illiterate', 156, 720, { size: 48, face: UI, weight: 500, color: SOFT });
    return;
  }

  if (lt < 30) { // Sub-Saharan Africa: 65–73%, 500–562M adults
    const s = lt - 13;
    roundRect(ctx, 150, 200, 500, 64, 14, PAPER); text(ctx, 'SUB-SAHARAN AFRICA', 400, 244, { size: 28, face: UI, weight: 800, color: INK, align: 'center' });
    const p = ease.outExpo(clamp(s / 1.2));
    // range bar
    if (s <= 7) {
    rect(ctx, 150, 330, 1620, 24, GREY); rect(ctx, 150 + 1620 * 0.65, 330, 1620 * 0.08 * p, 24, RED);
    const mk = 150 + 1620 * (0.65 + 0.08 * (0.5 + 0.5 * Math.sin(s * 2.5))); dot(ctx, mk, 342, 26 + 6 * pz, PAPER);
    if (s > 3) { const q = pop(s, 3, 0.5); ctx.save(); ctx.translate(1500, 560); ctx.scale(q, q); roundRect(ctx, -150, -40, 300, 80, 40, PAPER); text(ctx, 'IMF estimate', 0, 12, { size: 30, face: UI, weight: 800, color: INK, align: 'center' }); ctx.restore(); }
    if (s > 5.5) { const q = pop(s, 5.5, 0.5); ctx.save(); ctx.translate(1500, 680); ctx.scale(q, q); roundRect(ctx, -150, -40, 300, 80, 40, RED); text(ctx, 'which means…', 0, 12, { size: 30, face: UI, weight: 800, color: PAPER, align: 'center' }); ctx.restore(); }
    for (let k = 0; k <= 10; k++) text(ctx, k * 10 + '%', 150 + k * 162, 400, { size: 24, face: UI, weight: 500, color: MUTE, align: 'center' });
    ctx.save(); ctx.translate(150, 620); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
    text(ctx, '65–73%', 0, 0, { size: 230, face: DISPLAY, weight: 900, color: PAPER, tracking: -10 }); ctx.restore();
    text(ctx, 'of adults are financially illiterate · International Monetary Fund', 156, 700, { size: 40, face: UI, weight: 600, color: SOFT });
    }
    if (s > 7) { // the field of adults
      const q = ease.inOutExpo(clamp((s - 7) / 0.6)); bg(ctx, INK);
      ctx.save(); ctx.globalAlpha = q;
      const shown = Math.min(Math.floor(Math.max(s - 7.3, 0) * 180), 562);
      for (let i = 0; i < shown; i++) { const [fx, fy] = FIELD[i]; dot(ctx, 1230 + fx * 560, 200 + fy * 620, 7 + 3 * pz * (i % 13 === 0), i % 9 === 0 ? RED : PAPER); }
      const v = Math.round(countTo(t, 82.2, 4, 562));
      text(ctx, v >= 500 ? '500–562M' : v + 'M', 150, 560, { size: 190, face: DISPLAY, weight: 900, color: RED, tracking: -10 });
      text(ctx, 'adults face money decisions', 156, 650, { size: 48, face: UI, weight: 700, color: PAPER });
      text(ctx, 'without seeing the consequences', 156, 710, { size: 48, face: UI, weight: 500, color: SOFT });
      caption(ctx, 'until it is too late.', t, 87.5, RED);
      ctx.restore();
    }
    return;
  }

  if (lt < 48) { // four consequences, then the cycle
    const s = lt - 30;
    const items = [['TODAY', 'Money is lost', 'wallet', 0], ['GOALS', 'Delayed or abandoned', 'phone', 3.2], ['FAMILIES', 'Vulnerable to debt', 'home', 6.4], ['WEALTH', 'Opportunities slip away', 'chart', 9.6]];
    text(ctx, 'The cost goes beyond today', 150, 180, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    items.forEach(([h, d, ic, st], i) => {
      if (s < st) return; const k = ease.outBack(clamp((s - st) / 0.5)); const x = 150 + i * 420;
      ctx.save(); ctx.translate(x, 300); ctx.scale(1, k); roundRect(ctx, 0, 0, 380, 420, 30, i === 3 ? RED : '#17171B');
      text(ctx, String(i + 1), 30, 80, { size: 60, face: DISPLAY, weight: 900, color: i === 3 ? PAPER : RED });
      drawIcon(ctx, ic, 300, 70, 0.8, PAPER);
      text(ctx, h, 30, 290, { size: 40, face: DISPLAY, weight: 800, color: PAPER });
      text(ctx, d, 30, 350, { size: 32, face: UI, weight: 600, color: i === 3 ? PAPER : SOFT }); ctx.restore();
    });
    if (s > 13) { // over time: a cycle
      const q = ease.outExpo(clamp((s - 13) / 0.8));
      rect(ctx, 0, 0, W, H, withAlpha(INK, 0.85 * q));
      ctx.save(); ctx.globalAlpha = q; const cx = 1400, cy = 560;
      for (let k = 0; k < 3; k++) { const a0 = (s - 13) * 1.2 + k * TAU / 3; ring(ctx, cx, cy, 200, 26, k ? PAPER : RED, a0, a0 + 1.6); const ax = cx + Math.cos(a0 + 1.6) * 200, ay = cy + Math.sin(a0 + 1.6) * 200; ctx.save(); ctx.translate(ax, ay); ctx.rotate(a0 + 1.6 + Math.PI / 2); poly(ctx, [[0, -28], [24, 14], [-24, 14]], k ? PAPER : RED); ctx.restore(); }
      text(ctx, 'OVER TIME', 150, 480, { size: 36, face: UI, weight: 800, color: RED });
      text(ctx, 'cycles of poverty', 150, 580, { size: 90, face: DISPLAY, weight: 900, color: PAPER, tracking: -3 });
      text(ctx, 'across generations', 150, 680, { size: 90, face: DISPLAY, weight: 900, color: PAPER, tracking: -3 });
      ctx.restore();
    }
    return;
  }

  // 110–122: not how much they earn; keep · protect · grow; Vodafone opportunity
  const s = lt - 48;
  if (s < 7) {
    const k = pop(s, 0, 0.5);
    ctx.save(); ctx.translate(150, 330); ctx.scale(k, k); text(ctx, 'not how much people', 0, 0, { size: 72, face: DISPLAY, weight: 800, color: SOFT, tracking: -2 }); text(ctx, 'EARN', 0, 130, { size: 150, face: DISPLAY, weight: 900, color: SOFT, tracking: -4 }); ctx.restore();
    if (s > 1.2) { const st = ease.outExpo(clamp((s - 1.2) / 0.4)); line(ctx, 150, 290, 150 + 560 * st, 290, 14, RED); }
    const verbs = [['KEEP', 2.5], ['PROTECT', 3.5], ['GROW', 4.5]];
    text(ctx, 'but whether their decisions help them', 150, 600, { size: 44, face: UI, weight: 600, color: PAPER, alpha: ease.outExpo(clamp((s - 2) / 0.4)) });
    let vx = 150; verbs.forEach(([v, st], i) => { const wv = measure(ctx, v, 120, DISPLAY, 900, -4) + 70; if (s < st) { vx += wv; return; } const kk = pop(s, st, 0.4); ctx.save(); ctx.translate(vx, 780); vx += wv; ctx.scale(kk, kk); text(ctx, v, 0, 0, { size: 120, face: DISPLAY, weight: 900, color: RED, tracking: -4 }); ctx.restore(); });
    text(ctx, 'what they earn.', 156, 880, { size: 44, face: UI, weight: 600, color: PAPER, alpha: ease.outExpo(clamp((s - 5) / 0.4)) });
  } else {
    const q = ease.outExpo(clamp((s - 7) / 0.6));
    ctx.save(); ctx.globalAlpha = q;
    text(ctx, 'And every day it stays unresolved,', 150, 260, { size: 48, face: UI, weight: 600, color: SOFT });
    text(ctx, 'Vodafone misses', 150, 400, { size: 110, face: DISPLAY, weight: 900, color: PAPER, tracking: -4 });
    text(ctx, 'an opportunity.', 150, 520, { size: 110, face: DISPLAY, weight: 900, color: RED, tracking: -4 });
    text(ctx, 'to grow the value of its telecom and financial ecosystem', 156, 600, { size: 36, face: UI, weight: 500, color: SOFT });
    // ecosystem ring of services
    const cx = 1500, cy = 560; const names = ['M-Pesa', 'Airtime', 'PayBill', 'Savings', 'Insurance', 'Data'];
    ring(ctx, cx, cy, 230, 4, GREY2);
    names.forEach((nm, i) => { const a = (s - 7) * 0.4 + i / names.length * TAU; const x = cx + Math.cos(a) * 230, y = cy + Math.sin(a) * 230; roundRect(ctx, x - 80, y - 28, 160, 56, 28, i === 0 ? RED : PAPER); text(ctx, nm, x, y + 10, { size: 24, face: UI, weight: 700, color: i === 0 ? PAPER : INK, align: 'center' }); });
    dot(ctx, cx, cy, 40 + 20 * pz, RED);
    ctx.restore();
  }
  if (lt > 59.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 59.4) / 0.6), H, RED);
});
