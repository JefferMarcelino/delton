'use strict';
// 302–332 strategic fit · 332–362 roadmap · 362–380 close
scene('fit', 302, 332, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '06', 'Strategic fit', 'how CashWise serves Vision 2030'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const s = lt - 4;
  roundRect(ctx, 150, 110, 300, 64, 14, RED); text(ctx, 'VISION 2030', 300, 154, { size: 28, face: UI, weight: 800, color: PAPER, align: 'center' });
  text(ctx, 'Four pillars. One companion.', 480, 158, { size: 40, face: DISPLAY, weight: 800, color: PAPER, tracking: -1 });
  const tiles = [
    ['Personalize & strengthen loyalty', 'contextual financial insight inside every service, before completion', 'star', 0],
    ['Build a scalable ecosystem', 'a reusable recommendation platform for the whole business', 'stack', 5],
    ['Embed purpose into the brand', 'a tangible commitment to customers’ financial well-being', 'shield', 10],
    ['Empower customers & communities', 'guidance on smartphones and USSD; rewards build resilience', 'people', 15],
  ];
  tiles.forEach(([h, d, ic, at], i) => {
    if (s < at) return; const k = ease.outBack(clamp((s - at) / 0.5)); const x = 150 + (i % 2) * 820, y = 230 + Math.floor(i / 2) * 370;
    const active = s >= at && (i === 3 || s < tiles[i + 1][3]);
    ctx.save(); ctx.translate(x + 390, y + 160); ctx.scale(k, k); ctx.translate(-390, -160);
    roundRect(ctx, 0, 0, 780, 320, 30, active ? RED : '#17171B');
    drawIcon(ctx, ic, 90, 90, 0.9 + (active ? 0.1 * pz : 0), PAPER);
    text(ctx, String(i + 1).padStart(2, '0'), 700, 80, { size: 40, face: DISPLAY, weight: 900, color: active ? PAPER : GREY2, align: 'right' });
    text(ctx, h, 40, 200, { size: 40, face: DISPLAY, weight: 800, color: PAPER, tracking: -1 });
    // wrap
    const words = d.split(' '); let l1 = '', l2 = ''; words.forEach(w2 => { if (measure(ctx, l1 + ' ' + w2, 30, UI, 500) < 700) l1 += (l1 ? ' ' : '') + w2; else l2 += (l2 ? ' ' : '') + w2; });
    text(ctx, l1, 40, 250, { size: 30, face: UI, weight: 500, color: active ? PAPER : SOFT }); text(ctx, l2, 40, 290, { size: 30, face: UI, weight: 500, color: active ? PAPER : SOFT });
    ctx.restore();
  });
  if (lt > 29.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 29.4) / 0.6), H, RED);
});

scene('roadmap', 332, 362, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '07', 'Roadmap', 'validate · expand · scale · monetize'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const s = lt - 4;
  const stages = [
    ['Pilot', 'months 1–6', 'Merchant Payments + PayBill with a friendly-user group · $44.6K', 0],
    ['Service expansion', 'months 7–12', 'national launch on app + USSD · all telecom & financial services', 4],
    ['Africa expansion', 'years 2–5', 'Kenya & Tanzania first, then five more Group markets', 8],
    ['Scale', 'year 5+', 'across Vodacom and Vodafone markets in Africa and Europe', 12],
    ['Monetize', 'from year 2', 'offer the recommendation engine to B2B partners', 16],
  ];
  text(ctx, 'From validation to monetization', 150, 150, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
  const x0 = 260, x1 = 1660, y = 330;
  line(ctx, x0, y, x1, y, 6, GREY2);
  const prog = clamp(s / 18);
  line(ctx, x0, y, lerp(x0, x1, prog), y, 6, RED);
  const cur = Math.min(Math.floor(s / 4), 4);
  stages.forEach(([h, when, d, at], i) => {
    const x = lerp(x0, x1, i / 4); const on = s >= at;
    dot(ctx, x, y, 22, on ? RED : GREY2); if (on) ring(ctx, x, y, 36 + 10 * pz * (i === cur ? 1 : 0), 4, RED);
    text(ctx, String(i + 1), x, y - 60, { size: 44, face: DISPLAY, weight: 900, color: on ? PAPER : GREY2, align: 'center' });
    text(ctx, h, x, y + 70, { size: 26, face: UI, weight: 700, color: on ? PAPER : GREY2, align: 'center' });
    text(ctx, when, x, y + 104, { size: 22, face: UI, weight: 500, color: on ? SOFT : GREY2, align: 'center' });
  });
  dot(ctx, lerp(x0, x1, prog), y, 14 + 6 * pz, PAPER);
  { const [h, when, d, at] = stages[cur]; const k = ease.outBack(clamp((s - at) / 0.5)); ctx.save(); ctx.translate(W / 2, 700); ctx.scale(k, k); ctx.translate(-W / 2, -700);
    roundRect(ctx, 150, 500, 1620, 400, 30, RED);
    text(ctx, String(cur + 1).padStart(2, '0'), 200, 620, { size: 100, face: DISPLAY, weight: 900, color: INK });
    text(ctx, when.toUpperCase(), 400, 570, { size: 28, face: UI, weight: 800, color: PAPER });
    text(ctx, h, 400, 650, { size: 72, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    const words = d.split(' '); const lines = ['']; words.forEach(w2 => { const L = lines[lines.length - 1]; if (measure(ctx, L + ' ' + w2, 38, UI, 500) < 1300) lines[lines.length - 1] = (L ? L + ' ' : '') + w2; else lines.push(w2); });
    lines.forEach((l, k2) => text(ctx, l, 400, 730 + k2 * 50, { size: 38, face: UI, weight: 500, color: PAPER }));
    ctx.restore(); }
  caption(ctx, 'One main goal: improve customer financial behaviour.', t, 354);
  if (lt > 29.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 29.4) / 0.6), H, PAPER);
});

scene('close', 362, 380, (ctx, t, lt) => {
  const pz = pulse(t, 7);
  if (lt < 10) {
    bg(ctx, PAPER);
    const k1 = pop(lt, 0.2, 0.5);
    ctx.save(); ctx.translate(150, 300); ctx.scale(k1, k1); text(ctx, 'M-Pesa moved the money.', 0, 0, { size: 84, face: DISPLAY, weight: 800, color: INK, tracking: -3 }); ctx.restore();
    const verbs = [['keeps it.', 3.0], ['protects it.', 3.8], ['grows it.', 4.6]];
    text(ctx, 'CashWise', 150, 500, { size: 84, face: DISPLAY, weight: 900, color: RED, tracking: -3, alpha: ease.outExpo(clamp((lt - 2.4) / 0.4)) });
    let vx = 150; verbs.forEach(([v, st], i) => { const wv = measure(ctx, v, 84, DISPLAY, 800, -3) + 50; if (lt < st) { vx += wv; return; } const k = pop(lt, st, 0.4); ctx.save(); ctx.translate(vx, 640); vx += wv; ctx.scale(k, k); text(ctx, v, 0, 0, { size: 84, face: DISPLAY, weight: 800, color: INK, tracking: -3 }); ctx.restore(); });
    const q = ease.outExpo(clamp((lt - 6.5) / 0.6));
    text(ctx, 'One main goal:', 150, 800, { size: 40, face: UI, weight: 600, color: MUTE, alpha: q });
    text(ctx, 'better financial decisions, in every money moment.', 150, 880, { size: 56, face: DISPLAY, weight: 800, color: INK, tracking: -2, alpha: q });
    if (lt > 9.4) rect(ctx, 0, 0, W, H * ease.inExpo((lt - 9.4) / 0.6), INK);
    return;
  }
  bg(ctx, INK);
  const s = lt - 10;
  const k = ease.outBack(clamp(s / 0.6));
  if (lt < 17) wordmark(ctx, W / 2, 440, 260, PAPER, k);
  const q = ease.outExpo(clamp((s - 0.8) / 0.6));
  text(ctx, 'by Finsight', W / 2, 640, { size: 44, face: UI, weight: 600, color: SOFT, align: 'center', alpha: q });
  text(ctx, 'Carla  ·  Delton  ·  Luana  ·  Pedro', W / 2, 710, { size: 40, face: UI, weight: 700, color: PAPER, align: 'center', alpha: q });
  text(ctx, 'Thank you.', W / 2, 880, { size: 60, face: DISPLAY, weight: 800, color: RED, align: 'center', alpha: ease.outExpo(clamp((s - 3) / 0.6)) });
  if (lt >= 17) { const e = clamp((lt - 17) / 1.0); bg(ctx, INK); dot(ctx, W / 2, H / 2, (12 + 20 * pz) * (1 - e) + 2, RED); }
});
