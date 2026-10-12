'use strict';
// 0–12 cold open · 12–62 section 01: the problem (Jorge's Friday)
scene('open', 0, 12, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 7);
  if (t < 1.2) { // a notification ping
    dot(ctx, W / 2, H / 2, 24 + 40 * pz, RED);
    for (let k = 0; k < 3; k++) { const p = clamp((t - 0.1 - k * 0.35) / 1.0); if (p > 0 && p < 1) ring(ctx, W / 2, H / 2, 60 + 900 * ease.outCubic(p), 14 * (1 - p), withAlpha(RED, 1 - p)); }
    return;
  }
  // FRIDAY. PAYDAY.
  const k1 = pop(t, 1.2, 0.4), k2 = pop(t, 3.0, 0.4);
  ctx.save(); ctx.translate(150, 420); ctx.scale(k1, k1); text(ctx, 'FRIDAY.', 0, 0, { size: 230, face: DISPLAY, weight: 900, color: PAPER, tracking: -8 }); ctx.restore();
  ctx.save(); ctx.translate(150, 660); ctx.scale(k2, k2); text(ctx, 'PAYDAY.', 0, 0, { size: 230, face: DISPLAY, weight: 900, color: RED, tracking: -8 }); ctx.restore();
  if (t >= 6) {
    const s = t - 6;
    // words slide out left, phone rises
    const out = ease.inExpo(clamp(s / 0.5));
    if (out > 0) { rect(ctx, 0, 0, W, H, withAlpha(INK, out)); }
    const up = ease.outExpo(clamp((s - 0.2) / 0.8));
    const px = 1160, py = 110 + 900 * (1 - up);
    phone(ctx, px, py, 480, 900, (c, w, h) => {
      text(c, '09:41', w / 2, 70, { size: 26, face: UI, weight: 600, color: SOFT, align: 'center' });
      // balance
      text(c, 'Balance', 40, 160, { size: 26, face: UI, weight: 500, color: SOFT });
      const v = countTo(t, 7.2, 1.2, 100);
      text(c, money(v), 40, 230, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
      // notification card
      const n = ease.outBack(clamp((s - 0.6) / 0.5));
      if (n > 0) { c.save(); c.translate(w / 2, 360); c.scale(n, n); roundRect(c, -w / 2 + 24, -60, w - 48, 120, 22, PAPER);
        dot(c, -w / 2 + 70, 0, 22, RED); text(c, 'Salary received', -w / 2 + 110, -8, { size: 26, face: UI, weight: 700, color: INK }); text(c, '+ USD 100.00', -w / 2 + 110, 30, { size: 26, face: UI, weight: 500, color: GREEN === PAPER ? INK : '#1E8E4E' }); c.restore(); }
      // recent rows
      for (let i = 0; i < 4; i++) { const yy = 520 + i * 70; roundRect(c, 40, yy, w - 80, 50, 12, '#1B1B20'); text(c, ['Airtime', 'Groceries', 'Transport', 'Electricity'][i], 60, yy + 33, { size: 22, face: UI, weight: 500, color: PAPER }); text(c, ['- 2.00', '- 8.50', '- 1.20', '- 4.00'][i], w - 60, yy + 33, { size: 22, face: UI, weight: 500, color: SOFT, align: 'right' }); }
    });
    // Jorge walks in from the left
    const walk = ease.outCubic(clamp((s - 0.4) / 1.6)); const jx = lerp(-200, 520, walk);
    figure(ctx, jx, 380, 1.9, { mood: 'happy', bob: Math.sin(t * 12) * 6 * (1 - walk), cap: RED, armR: -0.6 + 0.3 * Math.sin(t * 6) });
    text(ctx, 'Jorge', jx, 880, { size: 44, face: UI, weight: 700, color: PAPER, align: 'center' });
    // dream bubble
    const d = pop(t, 10, 0.5);
    if (d > 0) { ctx.save(); ctx.translate(jx + 160, 120); ctx.scale(d, d); roundRect(ctx, 0, -40, 360, 150, 36, PAPER); dot(ctx, -10, 120, 14, PAPER); dot(ctx, -36, 150, 8, PAPER);
      drawIcon(ctx, 'phone', 60, 36, 0.9, INK); text(ctx, 'a new phone', 120, 28, { size: 30, face: UI, weight: 700, color: INK }); text(ctx, 'his dream', 120, 64, { size: 24, face: UI, weight: 500, color: MUTE }); ctx.restore(); }
    caption(ctx, 'Every month: USD 100 in. One dream: a new phone.', t, 8.5);
    if (t > 11.4) rect(ctx, 0, 0, W * ease.inExpo((t - 11.4) / 0.6), H, RED);
  }
});

scene('problem', 12, 62, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '01', 'The problem', 'a Friday in Maputo'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const b = beat(t);

  if (lt < 16) { // saving for the phone
    const s = lt - 4;
    figure(ctx, 420, 430, 1.5, { mood: 'happy', cap: RED, armR: -0.4 });
    // goal bar grows a little
    const p = 0.08 * ease.outCubic(clamp((s - 1) / 3));
    goalBar(ctx, 760, 440, 900, p, 'Goal: new phone', Math.round(p * 100) + '% of USD 250');
    // coins drop on beats into the jar
    const jar = [1660, 700];
    roundRect(ctx, jar[0] - 110, jar[1] - 150, 220, 300, 30, GREY); roundRect(ctx, jar[0] - 80, jar[1] - 190, 160, 50, 14, GREY2);
    const coinsN = Math.min(Math.floor(Math.max(s - 1.5, 0) / 1.0), 6);
    for (let i = 0; i < coinsN; i++) dot(ctx, jar[0] - 50 + (i % 3) * 50, jar[1] + 110 - Math.floor(i / 3) * 40, 22, RED);
    const fall = (s - 1.5) % 1.0; if (s > 1.5 && coinsN < 6) dot(ctx, jar[0], jar[1] - 260 + ease.inQuad(fall) * 150, 22, RED);
    // calendar chip
    const mo = s > 6 ? 2 : 1; const flip = s > 6 ? pop(s, 6, 0.4) : 1; ctx.save(); ctx.translate(910, 595); ctx.scale(1, flip); roundRect(ctx, -170, -35, 340, 70, 16, PAPER); text(ctx, 'MONTH ' + mo + ' · USD 100', 0, 11, { size: 28, face: UI, weight: 800, color: INK, align: 'center' }); ctx.restore();
    text(ctx, 'He tries to save.', 760, 300, { size: 80, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    caption(ctx, 'Same income every month. Same dream.', t, 20.5);
    return;
  }

  if (lt < 28) { // friends call
    const s = lt - 16;
    const shake = s < 1.5 ? Math.sin(s * 60) * 6 : 0;
    figure(ctx, 420 + shake * 0.3, 430, 1.5, { mood: s < 2 ? 'surprised' : s < 7 ? 'think' : 'happy', cap: RED, armR: s < 2 ? -1.2 : -0.4 });
    // phone buzzing in hand
    if (s < 2.2) { ctx.save(); ctx.translate(560 + shake, 300); ctx.rotate(shake * 0.02); drawIcon(ctx, 'phone', 0, 0, 1.2, PAPER); ctx.restore(); }
    // friends slide in
    const fin = ease.outExpo(clamp((s - 1) / 0.8));
    [[1300, 'neutral'], [1480, 'happy'], [1660, 'happy']].forEach(([fx, m], i) => figure(ctx, fx + 600 * (1 - fin), 440 + (i % 2) * 20, 1.4, { body: SOFT, skin: SOFT, mood: s > 9 ? 'happy' : m, armL: i === 1 ? -0.9 : 0.2 }));
    if (s > 2) bubble(ctx, 1240, 200, 460, 110, 'Jorge! Tonight?', { k: pop(s, 2, 0.4), tail: 'right' });
    // the dilemma: scale of phone vs bottle
    if (s > 4 && s < 9) {
      const k = pop(s, 4, 0.5); ctx.save(); ctx.translate(560, 130); ctx.scale(k, k);
      roundRect(ctx, 0, 0, 520, 190, 36, PAPER); dot(ctx, 20, 210, 12, PAPER);
      const tilt = Math.sin((s - 4) * 2) * 0.12;
      ctx.save(); ctx.translate(260, 110); ctx.rotate(tilt); line(ctx, -170, 0, 170, 0, 8, INK); drawIcon(ctx, 'phone', -160, -40, 0.7, INK); drawIcon(ctx, 'bottle', 160, -40, 0.7, RED); ctx.restore();
      text(ctx, 'He knows how Fridays go.', 260, 50, { size: 28, face: UI, weight: 700, color: INK, align: 'center' });
      ctx.restore();
    }
    if (s > 9) bubble(ctx, 540, 190, 260, 110, 'Yes.', { k: pop(s, 9, 0.4), fill: RED, color: PAPER, size: 44 });
    caption(ctx, s < 9 ? 'The friends call. He knows what Friday nights cost.' : 'But he says yes.', t, s < 9 ? 18 : 25);
    return;
  }

  if (lt < 40) { // after the weekend: 100 → 43
    const s = lt - 28;
    roundRect(ctx, 150, 120, 440, 70, 16, PAPER); text(ctx, 'AFTER THE WEEKEND', 370, 166, { size: 28, face: UI, weight: 700, color: INK, align: 'center' });
    // spends tick down on beats
    const spends = [['bottle', 18], ['taxi', 6], ['food', 12], ['bottle', 15], ['taxi', 6]];
    const n = Math.min(Math.floor(Math.max(s - 1, 0) / 0.8), spends.length);
    let bal = 100; for (let i = 0; i < n; i++) bal -= spends[i][1];
    const target = s > 5 ? 43 : bal;
    const big = s > 6;
    ctx.save(); ctx.translate(150, 520); const k = 1 + 0.08 * (big ? pz : 0); ctx.scale(k, k);
    text(ctx, money(target), 0, 0, { size: 260, face: DISPLAY, weight: 900, color: target < 50 ? RED : PAPER, tracking: -10 });
    ctx.restore();
    text(ctx, 'balance', 156, 600, { size: 34, face: UI, weight: 600, color: SOFT });
    // receipts flying up
    for (let i = 0; i < n; i++) { const st = 1 + i * 0.8; const p = clamp((s - st) / 1.2); const x = 1300 + (i % 3) * 180 - Math.floor(i / 3) * 90, y = 760 - p * 520;
      ctx.save(); ctx.globalAlpha = 1 - p * 0.7; ctx.translate(x, y); ctx.rotate((i - 2) * 0.1); roundRect(ctx, -70, -90, 140, 180, 14, PAPER); drawIcon(ctx, spends[i][0], 0, -20, 0.6, INK); text(ctx, '- ' + spends[i][1], 0, 60, { size: 30, face: UI, weight: 800, color: RED, align: 'center' }); ctx.restore(); }
    figure(ctx, 1500, 760, 1.1, { mood: s > 6 ? 'sad' : 'neutral', cap: RED, armL: 0.9, armR: 0.9 });
    // the questions
    const qs = [['HOW?', 7], ['WHAT DID I SPEND IT ON?', 8.5], ["I SHOULDN'T HAVE DONE THIS.", 10]];
    qs.forEach(([q, st], i) => { if (s < st) return; const kk = pop(s, st, 0.35); const jit = (noise2(i, s * 20, 3) - 0.5) * 6 * Math.exp(-(s - st) * 3);
      ctx.save(); ctx.translate(150 + jit, 720 + i * 80); ctx.scale(kk, kk); text(ctx, q, 0, 0, { size: 56, face: DISPLAY, weight: 800, color: i === 2 ? RED : PAPER, tracking: -1 }); ctx.restore(); });
    return;
  }

  // 52–62 (lt 40–50): next month at risk
  const s = lt - 40;
  text(ctx, 'Next month', 150, 200, { size: 96, face: DISPLAY, weight: 800, color: PAPER, tracking: -3 });
  const items = [['Rent', 'home', 25, 1], ['Food', 'food', 20, 2.5], ['Transport', 'taxi', 10, 4], ['Phone goal', 'phone', 0, 5.5]];
  items.forEach(([name, ic, cost, st], i) => {
    const y = 320 + i * 130; const p = ease.outExpo(clamp((s - i * 0.3) / 0.6));
    ctx.save(); ctx.globalAlpha = p; ctx.translate(60 * (1 - p), 0);
    roundRect(ctx, 150, y, 1100, 100, 22, '#17171B'); drawIcon(ctx, ic, 220, y + 50, 0.6, PAPER); text(ctx, name, 290, y + 64, { size: 40, face: UI, weight: 700, color: PAPER });
    text(ctx, cost ? money(cost) : '—', 900, y + 62, { size: 36, face: UI, weight: 500, color: SOFT, align: 'right' });
    const risk = s > st; const kk = risk ? pop(s, st, 0.4) : 0;
    if (risk) { ctx.save(); ctx.translate(1120, y + 50); ctx.scale(kk, kk); roundRect(ctx, -110, -28, 220, 56, 28, i === 3 ? GREY2 : RED); text(ctx, i === 3 ? 'DELAYED' : 'AT RISK', 0, 11, { size: 24, face: UI, weight: 800, color: PAPER, align: 'center' }); ctx.restore(); }
    ctx.restore();
  });
  // balance vs needs
  roundRect(ctx, 1340, 320, 430, 360, 30, PAPER);
  text(ctx, 'has', 1380, 390, { size: 28, face: UI, weight: 600, color: MUTE }); text(ctx, money(43), 1380, 450, { size: 56, face: DISPLAY, weight: 800, color: RED, tracking: -2 });
  text(ctx, 'needs', 1380, 540, { size: 28, face: UI, weight: 600, color: MUTE }); text(ctx, money(55), 1380, 600, { size: 56, face: DISPLAY, weight: 800, color: INK, tracking: -2 });
  rect(ctx, 1380, 630, 350 * clamp(43 / 55), 14, RED); rect(ctx, 1380 + 350 * clamp(43 / 55), 630, 350 * (1 - 43 / 55), 14, GREY2);
  figure(ctx, 1560, 780, 1.0, { mood: 'sad', cap: RED, armL: 0.9, armR: 0.9 });
  caption(ctx, 'Plans at risk. Even essentials become hard to cover.', t, 56);
  if (lt > 49.4) rect(ctx, 0, 0, W, H * ease.inExpo((lt - 49.4) / 0.6), RED);
});
