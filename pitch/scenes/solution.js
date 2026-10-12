'use strict';
// 122–202  section 03: the solution (CashWise)
scene('solution', 122, 202, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '03', 'The solution', 'meet CashWise'); return; }
  const pz = pulse(t, 8);
  const b = beat(t);

  if (lt < 16) { // reveal: wordmark on red, tagline, orbiting services
    bg(ctx, RED);
    const s = lt - 4;
    const k = ease.outBack(clamp(s / 0.6));
    const cx = W / 2, cy = 430;
    const names = ['M-Pesa', 'PayBill', 'Airtime', 'Savings', 'Insurance', 'Top-up'];
    if (s > 2) names.forEach((nm, i) => { const q = pop(s, 2 + i * 0.25, 0.5); const a = -Math.PI / 2 + i / names.length * TAU + s * 0.25; const snap = ease.inOutExpo(clamp((s - 6) / 0.8)); const x = lerp(cx + Math.cos(a) * 520, 410 + i * 220, snap), y = lerp(cy + Math.sin(a) * 280, 860, snap);
      ctx.save(); ctx.translate(x, y); ctx.scale(q, q); roundRect(ctx, -100, -34, 200, 68, 34, INK); text(ctx, nm, 0, 12, { size: 28, face: UI, weight: 700, color: PAPER, align: 'center' }); ctx.restore(); });
    wordmark(ctx, cx, cy, 230, PAPER, k);
    text(ctx, 'A financial companion embedded in the Vodacom services people already use.', cx, 640, { size: 46, face: UI, weight: 600, color: PAPER, align: 'center', alpha: ease.outExpo(clamp((s - 1) / 0.5)) });
    text(ctx, s > 6 ? 'embedded in:' : 'Better, informed decisions in every money moment.', cx, 720, { size: 36, face: UI, weight: 700, color: INK, align: 'center', alpha: ease.outExpo(clamp((s - 1.6) / 0.5)) });
    if (s > 11.4) rect(ctx, 0, 0, W, H * ease.inExpo((s - 11.4) / 0.6), INK);
    return;
  }

  bg(ctx, INK);
  if (lt < 34) { // four steps
    const s = lt - 16;
    const steps = [['LEARNS', 'from authorized transaction patterns'], ['UNDERSTANDS', 'helps you see your situation'], ['SUGGESTS', 'alternatives that fit your goals'], ['REWARDS', 'better choices with loyalty points']];
    text(ctx, 'How it works', 150, 150, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    steps.forEach(([h, d], i) => {
      const st = i * 4.2; if (s < st) return; const k = ease.outBack(clamp((s - st) / 0.5)); const ls = s - st; const x = 150 + i * 420, y = 240;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k); roundRect(ctx, 0, 0, 390, 640, 30, '#17171B');
      text(ctx, String(i + 1).padStart(2, '0'), 30, 70, { size: 34, face: UI, weight: 800, color: RED });
      // mini animation per step
      ctx.save(); ctx.translate(195, 260);
      if (i === 0) { for (let r = 0; r < 5; r++) { const yy = -120 + r * 50; roundRect(ctx, -150, yy, 300, 36, 10, GREY); rect(ctx, -130, yy + 12, 80 + 60 * hash(r, 1), 12, PAPER); rect(ctx, 60, yy + 12, 60, 12, SOFT); } const sy = -120 + mod(ls * 90, 250); rect(ctx, -160, sy, 320, 8, RED); }
      if (i === 1) { const segs = [0.38, 0.27, 0.2, 0.15]; let a = -Math.PI / 2; segs.forEach((v, k2) => { const vv = v * ease.outExpo(clamp((ls - 0.3 - k2 * 0.3) / 0.6)); ring(ctx, 0, 0, 110, 46, k2 === 0 ? RED : k2 === 1 ? PAPER : k2 === 2 ? SOFT : GREY2, a, a + vv * TAU); a += v * TAU; }); text(ctx, 'spend', 0, 12, { size: 28, face: UI, weight: 700, color: PAPER, align: 'center' }); }
      if (i === 2) { roundRect(ctx, -150, -130, 300, 90, 18, GREY); text(ctx, 'USD 40 tonight', -130, -75, { size: 26, face: UI, weight: 600, color: SOFT }); const q = ease.outExpo(clamp((ls - 0.6) / 0.6)); ctx.save(); ctx.translate(0, 40 * (1 - q)); ctx.globalAlpha = q; roundRect(ctx, -150, 0, 300, 110, 18, RED); text(ctx, 'USD 25 tonight', -130, 45, { size: 26, face: UI, weight: 700, color: PAPER }); text(ctx, 'goal stays on track', -130, 85, { size: 22, face: UI, weight: 500, color: PAPER }); ctx.restore(); poly(ctx, [[0, -30], [-22, -60], [22, -60]], PAPER); }
      if (i === 3) { drawIcon(ctx, 'star', 0, -60, 1.3 + 0.2 * pz, RED); const pts = Math.round(countTo(t, 122 + 16 + st + 0.5, 2, 50)); text(ctx, '+' + pts, 0, 80, { size: 72, face: DISPLAY, weight: 900, color: PAPER, align: 'center' }); text(ctx, 'loyalty points', 0, 130, { size: 26, face: UI, weight: 600, color: SOFT, align: 'center' }); }
      ctx.restore();
      text(ctx, h, 30, 500, { size: 40, face: DISPLAY, weight: 800, color: PAPER, tracking: -1 });
      // wrap description over two lines
      const words = d.split(' '); let l1 = '', l2 = ''; words.forEach(w2 => { if (measure(ctx, l1 + ' ' + w2, 28, UI, 500) < 330) l1 += (l1 ? ' ' : '') + w2; else l2 += (l2 ? ' ' : '') + w2; });
      text(ctx, l1, 30, 550, { size: 28, face: UI, weight: 500, color: SOFT }); text(ctx, l2, 30, 588, { size: 28, face: UI, weight: 500, color: SOFT });
      ctx.restore();
    });
    return;
  }

  if (lt < 44) { // the customer stays in control
    const s = lt - 34;
    text(ctx, 'The customer stays in control', 150, 200, { size: 72, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    text(ctx, 'CashWise suggests before the transaction is confirmed.', 156, 290, { size: 40, face: UI, weight: 500, color: SOFT });
    text(ctx, 'The customer decides, and can always keep the original choice.', 156, 350, { size: 40, face: UI, weight: 500, color: SOFT });
    const pressed = s > 5.5 && s < 6.0 ? 1 : 0; const chosen = s > 6;
    phone(ctx, 1240, 130, 420, 820, (c, w, h) => {
      text(c, 'Confirm payment', w / 2, 120, { size: 28, face: UI, weight: 700, color: PAPER, align: 'center' });
      text(c, 'USD 40.00', w / 2, 190, { size: 56, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
      text(c, 'Bottle Store Central', w / 2, 230, { size: 22, face: UI, weight: 500, color: SOFT, align: 'center' });
      const q = ease.outExpo(clamp((s - 1) / 0.6));
      c.save(); c.translate(0, 300 * (1 - q)); roundRect(c, 0, 300, w, h - 300, 40, PAPER);
      dot(c, 50, 350, 12, RED); text(c, 'CashWise', 72, 360, { size: 24, face: DISPLAY, weight: 800, color: INK });
      text(c, 'This would leave you', 40, 420, { size: 24, face: UI, weight: 500, color: INK }); text(c, 'USD 3 for next week.', 40, 452, { size: 24, face: UI, weight: 700, color: RED });
      button(c, 40, 500, w - 80, 70, 'Balanced option · USD 25', true, 24);
      button(c, 40, 590, w - 80, 70, 'Keep original · USD 40', false, 24, pressed);
      if (chosen) { const kk = pop(s, 6, 0.4); c.save(); c.translate(w / 2, 720); c.scale(kk, kk); drawIcon(c, 'check', 0, 0, 0.7); c.restore(); }
      c.restore();
    });
    // cursor hand
    if (s > 3.5 && s < 7) { const p = ease.inOutCubic(clamp((s - 3.5) / 1.8)); const hx = lerp(1000, 1450, p), hy = lerp(900, 760, p); dot(ctx, hx, hy, 22 - 6 * pressed, PAPER); ring(ctx, hx, hy, 34, 4, PAPER); }
    caption(ctx, chosen ? 'Original choice kept. No friction, no judgement.' : 'Suggest first. Decide freely.', t, chosen ? 162.2 : 158);
    return;
  }

  if (lt < 64) { // next Friday
    const s = lt - 44;
    roundRect(ctx, 150, 120, 420, 70, 16, PAPER); text(ctx, 'NEXT FRIDAY', 360, 166, { size: 28, face: UI, weight: 800, color: INK, align: 'center' });
    // store sign and the gang
    roundRect(ctx, 150, 230, 520, 90, 18, GREY2); text(ctx, 'BOTTLE STORE', 410, 290, { size: 36, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
    const decided = s > 12;
    figure(ctx, 330, 560, 1.3, { mood: decided ? 'happy' : s > 5 ? 'think' : 'neutral', cap: RED, armR: -0.6 });
    [[520, 'happy'], [680, 'happy']].forEach(([fx, m], i) => figure(ctx, fx, 580, 1.2, { body: SOFT, skin: SOFT, mood: m }));
    // phone with suggestion
    const chosenAt = 12; const pressed = s > 11.5 && s < 12 ? 1 : 0;
    phone(ctx, 1240, 130, 420, 820, (c, w, h) => {
      text(c, 'Pay USD 40.00', w / 2, 120, { size: 36, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
      const q = ease.outExpo(clamp((s - 2) / 0.6));
      c.save(); c.translate(0, 600 * (1 - q)); roundRect(c, 0, 170, w, h - 170, 40, PAPER);
      dot(c, 50, 220, 12, RED); text(c, 'Before you pay', 72, 230, { size: 24, face: DISPLAY, weight: 800, color: INK });
      // tiny forecast: two lines over 4 weeks
      const gx = 40, gy = 420, gw = w - 80, gh = 120;
      for (let k = 0; k < 5; k++) line(c, gx + k * gw / 4, gy, gx + k * gw / 4, gy - gh, 1, '#D8D4CC');
      const draw = (vals, col, wdt) => { c.strokeStyle = col; c.lineWidth = wdt; c.beginPath(); vals.forEach((v, k) => { const x = gx + k * gw / 4, y = gy - v * gh; k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); };
      const pr = ease.outExpo(clamp((s - 3) / 1.0));
      draw([0.9, 0.6 * pr + 0.9 * (1 - pr), 0.1 * pr + 0.9 * (1 - pr), 0.05 * pr + 0.9 * (1 - pr), 0.02 * pr + 0.9 * (1 - pr)], RED, 5);
      draw([0.9, 0.75 * pr + 0.9 * (1 - pr), 0.55 * pr + 0.9 * (1 - pr), 0.5 * pr + 0.9 * (1 - pr), 0.6 * pr + 0.9 * (1 - pr)], '#1E8E4E', 5);
      text(c, 'USD 40 → short next week', 40, 460, { size: 20, face: UI, weight: 600, color: RED }); text(c, 'USD 25 → goal on track', 40, 490, { size: 20, face: UI, weight: 600, color: '#1E8E4E' });
      button(c, 40, 530, w - 80, 70, 'Balanced · USD 25  +20 pts', true, 24, pressed);
      button(c, 40, 620, w - 80, 70, 'Keep USD 40', false, 24);
      if (decided) { const kk = pop(s, chosenAt, 0.4); c.save(); c.translate(w / 2, 740); c.scale(kk, kk); roundRect(c, -150, -30, 300, 60, 30, '#1E8E4E'); text(c, '+20 loyalty points', 0, 10, { size: 22, face: UI, weight: 700, color: PAPER, align: 'center' }); c.restore(); }
      c.restore();
    });
    if (s > 9.5 && s < 12.5) { const p = ease.inOutCubic(clamp((s - 9.5) / 1.8)); const hx = lerp(1000, 1450, p), hy = lerp(900, 700, p); dot(ctx, hx, hy, 22 - 6 * pressed, PAPER); ring(ctx, hx, hy, 34, 4, PAPER); }
    // Jorge's thought
    if (s > 5 && s < 12) bubble(ctx, 150, 420, 700, 150, 'Short next week? I can do better and still enjoy tonight.', { k: pop(s, 5, 0.5), size: 26 });
    if (decided) { const gp = lerp(0.08, 0.14, ease.outExpo(clamp((s - 14) / 2))); goalBar(ctx, 150, 880, 900, gp, 'Goal: new phone', Math.round(gp * 100) + '%'); }
    else caption(ctx, 'For the first time, he sees the consequences before deciding.', t, 172);
    return;
  }

  // 186–202: consent first, USSD, energy example
  const s = lt - 64;
  if (s < 6) {
    text(ctx, 'Consent comes first', 150, 200, { size: 80, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    const on = s > 2; const tp = ease.inOutExpo(clamp((s - 2) / 0.4));
    roundRect(ctx, 150, 300, 1000, 130, 30, '#17171B'); text(ctx, 'Allow CashWise to use my transactions', 200, 378, { size: 32, face: UI, weight: 600, color: PAPER });
    roundRect(ctx, 990, 335, 110, 60, 30, on ? '#1E8E4E' : GREY2); dot(ctx, 1020 + 50 * tp, 365, 24, PAPER);
    // branches
    const q1 = ease.outExpo(clamp((s - 2.6) / 0.5)), q0 = ease.outExpo(clamp((s - 0.6) / 0.5));
    ctx.save(); ctx.globalAlpha = q0; roundRect(ctx, 150, 500, 760, 170, 30, GREY2); drawIcon(ctx, 'cross', 230, 585, 0.7); text(ctx, 'Not opted in', 300, 570, { size: 34, face: UI, weight: 800, color: PAPER }); text(ctx, 'No recommendation. The service runs as normal.', 300, 620, { size: 26, face: UI, weight: 500, color: SOFT }); ctx.restore();
    ctx.save(); ctx.globalAlpha = q1; roundRect(ctx, 150, 700, 760, 170, 30, RED); drawIcon(ctx, 'check', 230, 785, 0.7); text(ctx, 'Opted in', 300, 770, { size: 34, face: UI, weight: 800, color: PAPER }); text(ctx, 'Goals + authorized context → one clear suggestion.', 300, 820, { size: 26, face: UI, weight: 500, color: PAPER }); ctx.restore();
    text(ctx, 'Nothing is processed until the customer opts in.', 1000, 585, { size: 36, face: UI, weight: 600, color: SOFT, alpha: q0 });
  } else if (s < 10) {
    const ss = s - 6;
    text(ctx, 'With or without internet', 150, 200, { size: 80, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    text(ctx, 'App on smartphones. USSD on any phone.', 156, 280, { size: 40, face: UI, weight: 500, color: SOFT });
    // feature phone USSD screen
    roundRect(ctx, 1200, 330, 420, 560, 40, PAPER); roundRect(ctx, 1240, 370, 340, 300, 16, '#1F3A1F');
    const lines = ['*150#', 'CashWise', '1. Pay bill', '2. Buy electricity', '3. My goals', '4. My points'];
    const nchar = Math.floor(ss * 22); let acc = 0;
    lines.forEach((l, i) => { const shown = l.slice(0, Math.max(0, Math.min(l.length, nchar - acc))); acc += l.length; text(ctx, shown, 1260, 420 + i * 42, { size: 28, face: UI, weight: 600, color: '#9FE09F' }); });
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) roundRect(ctx, 1260 + c * 110, 700 + r * 58, 90, 44, 10, GREY2);
    drawIcon(ctx, 'signal', 400, 560, 2.0, RED); text(ctx, 'USSD', 400, 720, { size: 48, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
    drawIcon(ctx, 'phone', 800, 560, 2.0, PAPER); text(ctx, 'App', 800, 720, { size: 48, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
  } else {
    const ss = s - 10;
    text(ctx, 'Beyond payments', 150, 200, { size: 80, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    text(ctx, 'The same intelligence spreads across telecom and financial services.', 156, 280, { size: 36, face: UI, weight: 500, color: SOFT });
    // energy top-ups: many small → one monthly
    const x0 = 150, y0 = 820;
    for (let i = 0; i < 8; i++) { const k = ease.outBack(clamp((ss - i * 0.15) / 0.4)); const h = 110 + 40 * hash(i, 4); rect(ctx, x0 + i * 90, y0 - h * k, 60, h * k, SOFT); }
    text(ctx, 'energy top-up every few days', x0, 870, { size: 28, face: UI, weight: 600, color: SOFT });
    const q = ease.outBack(clamp((ss - 2) / 0.6));
    if (q > 0) { poly(ctx, [[940, 640], [1000, 700], [940, 760]], RED); rect(ctx, 1100, y0 - 420 * q, 240, 420 * q, RED); text(ctx, 'one monthly plan', 1100, 870, { size: 28, face: UI, weight: 600, color: PAPER }); text(ctx, 'that fits real usage', 1100, 910, { size: 28, face: UI, weight: 500, color: SOFT }); }
    drawIcon(ctx, 'bolt', 1600, 560, 2.2 + 0.2 * pz, PAPER);
  }
  if (lt > 79.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 79.4) / 0.6), H, RED);
});
