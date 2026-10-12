'use strict';
// 242–302  section 05: the business case
const kfmt = v => '$' + v.toFixed(1) + 'K';
scene('business', 242, 302, (ctx, t, lt) => {
  if (lt < 4) { sectionCard(ctx, lt, '05', 'Business case', 'all figures in USD · illustrative, to be validated with Finance'); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);

  if (lt < 18) { // $69.7K year one, capex + opex breakdown
    const s = lt - 4;
    const v = countTo(t, 246.0, 2.5, 69.7);
    text(ctx, kfmt(v), 150, 420, { size: 300, face: DISPLAY, weight: 900, color: RED, tracking: -12 });
    text(ctx, 'to launch and run CashWise for its first year in Mozambique', 156, 500, { size: 40, face: UI, weight: 600, color: PAPER, alpha: ease.outExpo(clamp((s - 1.5) / 0.5)) });
    const bars = [['CAPEX · one-off', 43.5, [['Development team', 27.9], ['Launch SMS (1M)', 7.8], ['App launch marketing', 7.8]], 4.0], ['OPEX · year 1', 26.1, [['New infra capacity', 20.6], ['App & DB support', 4.0], ['Minor fixes', 1.6]], 7.0]];
    bars.forEach(([h, total, parts, at], i) => {
      if (s < at) return; const y = 600 + i * 190; const p = ease.outExpo(clamp((s - at) / 0.6));
      text(ctx, h, 150, y, { size: 30, face: UI, weight: 800, color: PAPER, alpha: p }); text(ctx, kfmt(total), 1770, y, { size: 44, face: DISPLAY, weight: 800, color: RED, align: 'right', alpha: p });
      let x = 150; const scale = 1620 / 43.5;
      parts.forEach(([nm, val], k) => { const q = ease.outExpo(clamp((s - at - 0.3 - k * 0.35) / 0.6)); const w = val * scale * q; roundRect(ctx, x, y + 24, Math.max(w - 8, 0), 70, 14, k === 0 ? RED : k === 1 ? PAPER : SOFT);
        if (q > 0.7) { text(ctx, nm, x + 20, y + 68, { size: 24, face: UI, weight: 700, color: INK }); text(ctx, kfmt(val), x + w - 28, y + 68, { size: 24, face: UI, weight: 600, color: INK, align: 'right' }); } x += w; });
    });
    if (s > 8) { const q = pop(s, 8, 0.5); ctx.save(); ctx.translate(1180, 320); ctx.scale(q, q); roundRect(ctx, 0, 0, 590, 150, 30, PAPER); text(ctx, 'year one · Mozambique', 30, 55, { size: 26, face: UI, weight: 600, color: MUTE }); text(ctx, 'app + USSD · 1M SMS · dev team', 30, 110, { size: 32, face: UI, weight: 800, color: INK }); ctx.restore(); }
    return;
  }

  if (lt < 34) { // five-year projection
    const s = lt - 18;
    text(ctx, 'Mozambique · five years', 150, 150, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
    const years = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5']; const opex = [26.1, 16.0, 11.0, 8.5, 7.0]; const users = [2.4, 2.9, 3.3, 3.6, 3.8];
    const x0 = 220, x1 = 1240, y0 = 820, yh = 480;
    line(ctx, x0 - 40, y0, x1 + 40, y0, 3, PAPER);
    years.forEach((yr, i) => { const x = lerp(x0, x1, i / 4); const p = ease.outExpo(clamp((s - 0.5 - i * 0.3) / 0.8)); const h = opex[i] / 26.1 * yh * p;
      rect(ctx, x - 60, y0 - h, 120, h, i === 0 ? RED : GREY2); text(ctx, yr, x, y0 + 46, { size: 28, face: UI, weight: 700, color: SOFT, align: 'center' });
      if (p > 0.8 && (i === 0 || i === 4)) text(ctx, kfmt(opex[i]), x, y0 - h - 20, { size: 30, face: UI, weight: 800, color: PAPER, align: 'center' }); });
    text(ctx, 'OPEX per year', x0 - 60, 260, { size: 28, face: UI, weight: 800, color: SOFT });
    // users line
    const lp = ease.inOutCubic(clamp((s - 2.5) / 2.5));
    ctx.strokeStyle = PAPER; ctx.lineWidth = 8; ctx.beginPath();
    const n = Math.floor(lp * 4 * 20);
    for (let k = 0; k <= n; k++) { const u = k / 80 * 4; const i = Math.floor(u), f = u - i; const val = i >= 4 ? users[4] : lerp(users[i], users[i + 1], f); const x = lerp(x0, x1, u / 4), y = y0 - 80 - (val - 2.0) / 2.0 * 380; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    if (lp > 0) { const u = lp * 4; const i = Math.min(Math.floor(u), 3), f = u - i; const val = lerp(users[i], users[Math.min(i + 1, 4)], f); const x = lerp(x0, x1, u / 4), y = y0 - 80 - (val - 2.0) / 2.0 * 380; dot(ctx, x, y, 16 + 6 * pz, RED); text(ctx, val.toFixed(1) + 'M users', x + 24, y - 16, { size: 30, face: UI, weight: 800, color: PAPER }); }
    // side panel: totals and marketing
    const sp = ease.outBack(clamp((s - 6) / 0.6));
    if (sp > 0) { ctx.save(); ctx.translate(1400, 260); ctx.scale(sp, sp); roundRect(ctx, 0, 0, 380, 300, 30, PAPER); text(ctx, '5-year total', 30, 60, { size: 26, face: UI, weight: 600, color: MUTE }); text(ctx, '$104.3K', 30, 140, { size: 72, face: DISPLAY, weight: 900, color: INK, tracking: -3 }); text(ctx, 'active users', 30, 200, { size: 26, face: UI, weight: 600, color: MUTE }); text(ctx, '2.4M → 3.8M', 30, 250, { size: 44, face: DISPLAY, weight: 800, color: RED, tracking: -1 }); ctx.restore(); }
    const chips = [['mail', '1M targeted SMS'], ['megaphone', 'owned channels'], ['people', 'ambassadors']];
    chips.forEach(([ic, nm], i) => { const q = pop(s, 9 + i * 0.4, 0.5); if (q <= 0) return; ctx.save(); ctx.translate(1400, 620 + i * 90); ctx.scale(q, 1); roundRect(ctx, 0, 0, 380, 70, 35, '#17171B'); drawIcon(ctx, ic, 46, 35, 0.4, RED); text(ctx, nm, 90, 46, { size: 26, face: UI, weight: 700, color: PAPER }); ctx.restore(); });
    text(ctx, 'go-to-market', 1400, 600, { size: 26, face: UI, weight: 800, color: SOFT, alpha: ease.outExpo(clamp((s - 9) / 0.4)) });
    return;
  }

  // 276–302: Africa rollout
  const s = lt - 34;
  const years = [['Y1', [['Mozambique', 2.4]]], ['Y2', [['Kenya', 23.8], ['Tanzania', 5.5]]], ['Y3', [['DR Congo', 3.0], ['Ethiopia', 1.0]]], ['Y4', [['Lesotho', 0.67], ['Egypt', 0.536]]], ['Y5', [['Ghana', 0.321]]]];
  text(ctx, 'Then we scale across Africa', 150, 150, { size: 64, face: DISPLAY, weight: 800, color: PAPER, tracking: -2 });
  years.forEach(([yr, ms], i) => {
    const x = 300 + i * 340; const at = 1 + i * 2.2; const p = ease.outExpo(clamp((s - at) / 0.5));
    text(ctx, yr, x, 260, { size: 40, face: DISPLAY, weight: 800, color: p > 0 ? RED : GREY2, align: 'center' });
    line(ctx, x, 290, x, 860, 2, GREY2);
    ms.forEach(([nm, mu], k) => { const q = ease.outBack(clamp((s - at - 0.3 - k * 0.5) / 0.6)); if (q <= 0) return; const r = (40 + Math.sqrt(mu) * 34) * q; const y = 420 + k * 260;
      dot(ctx, x, y, r, k === 0 && i === 1 ? RED : PAPER); text(ctx, nm, x, y + r + 40, { size: 26, face: UI, weight: 700, color: PAPER, align: 'center' }); text(ctx, (mu >= 1 ? mu.toFixed(1) + 'M' : Math.round(mu * 1000) + 'K'), x, y + 10, { size: mu >= 1 ? 30 : 22, face: DISPLAY, weight: 800, color: INK, align: 'center' }); });
  });
  if (s > 13) { const q = ease.outExpo(clamp((s - 13) / 0.6)); rect(ctx, 0, 0, W, H, withAlpha(INK, 0.88 * q)); ctx.save(); ctx.globalAlpha = q;
    const stats = [['9', 'markets'], ['38.6M', 'active users by year five'], ['$610.1K', 'total five-year cost']];
    let sx = 150; stats.forEach(([v, l], i) => { const k = pop(s, 13.2 + i * 0.5, 0.5); const wv = measure(ctx, v, 120, DISPLAY, 900, -5) + 120; ctx.save(); ctx.translate(sx, 560); sx += wv; ctx.scale(k, k); text(ctx, v, 0, 0, { size: 120, face: DISPLAY, weight: 900, color: i === 2 ? RED : PAPER, tracking: -5 }); text(ctx, l, 4, 70, { size: 32, face: UI, weight: 600, color: SOFT }); ctx.restore(); });
    text(ctx, 'Prove it in Mozambique. Scale it across Africa.', 150, 800, { size: 56, face: DISPLAY, weight: 800, color: PAPER, tracking: -2, alpha: ease.outExpo(clamp((s - 15) / 0.5)) });
    text(ctx, 'Mozambique $104.3K · new markets $505.8K · per market: $12.5K launch, ~$6.3K/yr run + infra for new users', 150, 880, { size: 26, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((s - 15.5) / 0.5)) });
    ctx.restore(); }
  if (lt > 59.4) rect(ctx, 0, 0, W * ease.inExpo((lt - 59.4) / 0.6), H, RED);
});
