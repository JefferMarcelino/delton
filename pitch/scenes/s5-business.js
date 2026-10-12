'use strict';
// 242–302  The future: a ledger for year one, the five-year curves, and the rollout across Africa.
const YEAR_X = 5000, YEAR_DX = 420; // five-year axis in world space
const USERS = [2.4, 2.9, 3.3, 3.6, 3.8], OPEX = [26.1, 16.0, 11.0, 8.5, 7.0];
const MARKETS = [[0, 'Mozambique', 2.4], [1, 'Kenya', 23.8], [1, 'Tanzania', 5.5], [2, 'DR Congo', 3.0], [2, 'Ethiopia', 1.0], [3, 'Lesotho', 0.67], [3, 'Egypt', 0.536], [4, 'Ghana', 0.321]];
const AFR_X = 8700, AFR_DX = 420;
const CAM5 = makeCamera([
  { t: 242, x: 5700, y: -500, z: 0.75 }, { t: 260, x: 5700, y: -500, z: 0.75 }, { t: 262, x: 5700, y: -250, z: 0.8 }, { t: 268, x: 6100, y: -300, z: 0.8 },
  { t: 276, x: 6100, y: -300, z: 0.8 }, { t: 278, x: 9000, y: -480, z: 0.8 }, { t: 290, x: 9500, y: -480, z: 0.8 }, { t: 292, x: 9500, y: -500, z: 0.6 }, { t: 302, x: 9500, y: -500, z: 0.6 },
]);
const K = v => '$' + v.toFixed(1) + 'K';

scene('business', 242, 302, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8); const s = t - 242;
  const cam = CAM5(t);
  ctx.save(); applyCamera(ctx, cam);
  numeral(ctx, 6200, -1500, '05', 0.06, 1600);
  for (let v = 0; v <= 250; v += 50) line(ctx, 4000, -v * PX_PER_USD, 12000, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  // the green future arrives from the left into year one
  drawLine(ctx, [[3800, 110], [5000, 120]], 5000, GREEN2, 8, 0.6);
  // ---- five-year chart (260–276) ----
  if (s >= 18) {
    const ss = s - 18;
    ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach((yr, i) => { const x = YEAR_X + i * YEAR_DX; const k = ease.outExpo(clamp((ss - 0.3 - i * 0.25) / 0.6)); line(ctx, x, 0, x, -1050, 1, GRID); text(ctx, yr, x, 60, { size: 34, face: DISPLAY, weight: 800, color: withAlpha(PAPER, k), align: 'center' });
      // opex bars below the axis
      const bh = OPEX[i] / 26.1 * 300 * ease.outExpo(clamp((ss - 0.8 - i * 0.3) / 0.7)); rect(ctx, x - 70, 90, 140, bh, i === 0 ? RED_ : SURF2); if (bh > 20 && (i === 0 || i === 4)) text(ctx, K(OPEX[i]), x, 90 + bh + 40, { size: 28, face: UI, weight: 800, color: PAPER, align: 'center' }); });
    text(ctx, 'OPEX per year', YEAR_X - 70, 450, { size: 24, face: UI, weight: 800, color: SOFT });
    // users curve above the axis, drawn with a travelling head
    const lp = ease.inOutCubic(clamp((ss - 2) / 3.5)); const n = Math.floor(lp * 80);
    ctx.strokeStyle = GREEN2; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath();
    const Y = v => -(60 + (v - 2.0) / 2.0 * 70) * PX_PER_USD;
    for (let k = 0; k <= n; k++) { const u = k / 80 * 4; const i = Math.min(Math.floor(u), 3), f = u - i; const v = lerp(USERS[i], USERS[i + 1], f); const x = YEAR_X + u * YEAR_DX, y = Y(v); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    if (lp > 0) { const u = lp * 4; const i = Math.min(Math.floor(u), 3), f = u - i; const v = lerp(USERS[i], USERS[i + 1], f); const x = YEAR_X + u * YEAR_DX, y = Y(v); dot(ctx, x, y, 16 + 6 * pz, PAPER); tag(ctx, x, y, v.toFixed(1) + 'M active users', GREEN2, INK, 1, 30, true); }
    text(ctx, 'ACTIVE USERS', YEAR_X - 70, Y(2.0) + 70, { size: 24, face: UI, weight: 800, color: SOFT });
  }
  // ---- Africa rollout (276–302) ----
  if (s >= 34) {
    const ss = s - 34;
    ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach((yr, i) => { const x = AFR_X + i * AFR_DX; line(ctx, x, 0, x, -1100, 1, GRID); text(ctx, yr, x, 60, { size: 34, face: DISPLAY, weight: 800, color: PAPER, align: 'center' }); });
    let slot = {};
    MARKETS.forEach(([yi, nm, mu], i) => { const at = 1 + yi * 2.2 + (slot[yi] || 0) * 0.5; slot[yi] = (slot[yi] || 0) + 1; const k = ease.outBack(clamp((ss - at) / 0.6)); if (k <= 0) return;
      const x = AFR_X + yi * AFR_DX, y = -380 - (slot[yi] - 1) * 380; const r = (44 + Math.sqrt(mu) * 44) * k;
      dot(ctx, x, y, r, nm === 'Kenya' ? RED_ : PAPER); text(ctx, mu >= 1 ? mu.toFixed(1) + 'M' : Math.round(mu * 1000) + 'K', x, y + 12, { size: mu >= 1 ? 34 : 24, face: DISPLAY, weight: 800, color: INK, align: 'center' }); text(ctx, nm, x, y + r + 44, { size: 28, face: UI, weight: 700, color: PAPER, align: 'center' }); });
    // the users curve keeps rising across the rollout
    const lp = ease.inOutCubic(clamp(ss / 10)); ctx.strokeStyle = GREEN2; ctx.lineWidth = 8; ctx.beginPath(); for (let k = 0; k <= Math.floor(lp * 60); k++) { const u = k / 60; const x = AFR_X - 300 + u * (4 * AFR_DX + 600), y = -(120 + 240 * Math.pow(u, 1.6)) * PX_PER_USD * 0.5 - 200; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
  }
  ctx.restore();

  // ---- screen space ----
  if (s < 18) { // year one ledger
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.5));
    const v = countTo(t, 244.0, 2.5, 69.7);
    statement(ctx, K(v), '', t, 243.5, { x: 150, y: 420, size: 220, color: RED_, sub: 'to launch and run CashWise for its first year in Mozambique' });
    const rows = [['CAPEX · one-off', null, 3.2, true], ['Development team', 27.9, 3.5], ['Launch SMS (1M)', 7.8, 3.9], ['App launch marketing', 7.8, 4.3], ['', 43.5, 4.8, 'sum'],
                  ['OPEX · year one', null, 6.0, true], ['New infra capacity', 20.6, 6.3], ['App & DB support', 4.0, 6.7], ['Minor fixes', 1.6, 7.1], ['', 26.1, 7.6, 'sum'], ['YEAR ONE TOTAL', 69.7, 8.4, 'total']];
    let y = 180; rows.forEach(([nm, val, at, kind]) => { if (s < at) { y += kind === true ? 70 : 62; return; } const k = ease.outExpo(clamp((s - at) / 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(30 * (1 - k), 0);
      if (kind === true) { text(ctx, nm, 1100, y + 40, { size: 24, face: UI, weight: 800, color: RED_ }); y += 70; }
      else if (kind === 'sum') { line(ctx, 1100, y + 4, 1770, y + 4, 2, GREY2); text(ctx, K(val), 1770, y + 48, { size: 36, face: DISPLAY, weight: 800, color: PAPER, align: 'right' }); y += 62; }
      else if (kind === 'total') { line(ctx, 1100, y + 4, 1770, y + 4, 4, PAPER); text(ctx, nm, 1100, y + 60, { size: 26, face: UI, weight: 800, color: PAPER }); text(ctx, K(val), 1770, y + 66, { size: 52, face: DISPLAY, weight: 900, color: RED_, align: 'right' }); }
      else { text(ctx, nm, 1100, y + 40, { size: 34, face: UI, weight: 500, color: PAPER }); text(ctx, K(val * ease.outExpo(clamp((s - at) / 1.0))), 1770, y + 40, { size: 34, face: UI, weight: 700, color: SOFT, align: 'right' }); y += 62; }
      ctx.restore(); });
    if (s > 11) sub(ctx, 'marketing uses targeted SMS and the channels and ambassadors we already have', t, 253.5);
  } else if (s < 34) {
    statement(ctx, 'Mozambique, five years.', '', t, 260.3, { x: 150, y: 170, size: 64 });
    if (s > 26) { const k = pop(s, 26, 0.5); ctx.save(); ctx.translate(150, 300); ctx.scale(k, k); roundRect(ctx, 0, 0, 520, 230, 30, PAPER); text(ctx, '5-year total cost', 30, 60, { size: 26, face: UI, weight: 600, color: MUTE }); text(ctx, '$104.3K', 30, 140, { size: 76, face: DISPLAY, weight: 900, color: INK, tracking: -3 }); text(ctx, 'OPEX falls from $26.1K to $7.0K a year', 30, 195, { size: 22, face: UI, weight: 600, color: RED_ }); ctx.restore(); }
    if (s > 29) { [['mail', '1M targeted SMS'], ['megaphone', 'owned channels'], ['people', 'ambassadors']].forEach(([ic, nm], i) => { const q = pop(s, 29 + i * 0.4, 0.5); if (q <= 0) return; ctx.save(); ctx.translate(150, 580 + i * 80); ctx.scale(q, 1); roundRect(ctx, 0, 0, 420, 64, 32, SURF); drawIcon(ctx, ic, 40, 32, 0.36, RED_); text(ctx, nm, 80, 42, { size: 26, face: UI, weight: 700, color: PAPER }); ctx.restore(); }); }
  } else {
    const ss = s - 34;
    if (ss < 14) statement(ctx, 'Then we scale', 'across Africa.', t, 276.3, { x: 150, y: 150, size: 50, color2: PAPER });
    else { rect(ctx, 0, 0, W, H, withAlpha(INK, 0.82));
      const stats = [['9', 'markets'], ['38.6M', 'active users by year five'], ['$610.1K', 'total five-year cost']]; let sx = 150;
      stats.forEach(([v, l], i) => { const k = pop(ss, 14.2 + i * 0.5, 0.5); const wv = measure(ctx, v, 130, DISPLAY, 900, -5) + 120; ctx.save(); ctx.translate(sx, 500); sx += wv; ctx.scale(k, k); text(ctx, v, 0, 0, { size: 130, face: DISPLAY, weight: 900, color: i === 2 ? RED_ : PAPER, tracking: -5 }); text(ctx, l, 4, 60, { size: 30, face: UI, weight: 600, color: SOFT }); ctx.restore(); });
      statement(ctx, 'Prove it in Mozambique.', 'Scale it across Africa.', t, 292.5, { x: 150, y: 720, size: 72, color2: PAPER });
      text(ctx, 'Mozambique $104.3K · new markets $505.8K · per market: $12.5K launch, ~$6.3K/yr run + infra for new users · illustrative, to be validated with Finance', 150, 960, { size: 22, face: UI, weight: 500, color: MUTE, alpha: ease.outExpo(clamp((ss - 15.5) / 0.5)) }); }
  }
});
