'use strict';
// 122–202  CashWise: the dot on the line, the fork, four capabilities, control, next Friday, consent, USSD, energy.
const CAM3 = makeCamera([
  { t: 122, x: 2260, y: -342, z: 1.0 }, { t: 126, x: 2200, y: -400, z: 0.9 }, { t: 130, x: 2200, y: -400, z: 0.9 },
  { t: 134, x: 2700, y: -380, z: 0.62 }, { t: 156, x: 2700, y: -380, z: 0.62 }, { t: 166, x: 2300, y: -400, z: 0.62 },
  { t: 180, x: 2300, y: -400, z: 0.62 }, { t: 185, x: 3000, y: -380, z: 0.55 }, { t: 202, x: 3000, y: -380, z: 0.55 },
]);
const CAPS = [['LEARNS', 'from the customer’s authorized transaction patterns', 'learn'], ['UNDERSTANDS', 'helps them see their financial situation clearly', 'understand'], ['SUGGESTS', 'alternatives that fit their goals, before they confirm', 'suggest'], ['REWARDS', 'the choices that lead to better outcomes, with loyalty points', 'reward']];

function paySheet(c, w, h, s, o) { // CashWise bottom sheet inside the phone. s = seconds since it started rising
  const { pressedA = 0, pressedB = 0, chosen = null, leaves = 'USD 3' } = o;
  const q = ease.outExpo(clamp(s / 0.7)); if (q <= 0) return;
  c.save(); c.translate(0, (h - 560) + (560) * (1 - q));
  roundRect(c, 0, 0, w, 600, 36, '#FFFFFF'); roundRect(c, w / 2 - 30, 14, 60, 6, 3, '#D8D4CC');
  dot(c, 40, 60, 10, RED_); text(c, 'CashWise · before you pay', 62, 68, { size: 22, face: UI, weight: 800, color: INK });
  text(c, 'USD 40 would leave you', 32, 120, { size: 22, face: UI, weight: 500, color: INK }); text(c, leaves + ' for next week.', 32, 150, { size: 22, face: UI, weight: 800, color: RED_ });
  forkChart(c, 32, 300, w - 64, 120, clamp((s - 0.4) / 1.2));
  text(c, 'USD 40 → short next week', 32, 336, { size: 19, face: UI, weight: 700, color: RED_ }); text(c, 'USD 25 → goal on track', 32, 362, { size: 19, face: UI, weight: 700, color: '#1E8E4E' });
  uiButton(c, 32, 390, w - 64, 70, 'Balanced · USD 25  (+20 points)', true, pressedA, 24); uiButton(c, 32, 476, w - 64, 70, 'Keep original · USD 40', false, pressedB, 24);
  if (chosen) { roundRect(c, 0, 0, w, 600, 36, withAlpha('#FFFFFF', 0.92)); const kk = ease.outBack(clamp(chosen / 0.5)); c.save(); c.translate(w / 2, 240); c.scale(kk, kk); drawIcon(c, 'check', 0, 0, 1.0, chosen > 0 && o.good ? GREEN2 : INK); c.restore(); text(c, o.good ? 'Balanced option chosen' : 'Original choice kept', w / 2, 360, { size: 26, face: UI, weight: 800, color: INK, align: 'center' }); text(c, o.good ? '+20 loyalty points' : 'No friction. No judgement.', w / 2, 400, { size: 22, face: UI, weight: 600, color: o.good ? '#1E8E4E' : MUTE, align: 'center' }); }
  c.restore();
}
function payScreen(c, w, h) {
  appHeader(c, w, 'Pay', 'M-Pesa');
  dot(c, 70, 230, 34, '#F0ECE4'); drawIcon(c, 'bottle', 70, 230, 0.4, INK); text(c, 'Bottle Store Central', 120, 222, { size: 24, face: UI, weight: 800, color: INK }); text(c, 'Merchant · 84 231', 120, 250, { size: 20, face: UI, weight: 500, color: MUTE });
  text(c, 'Amount', 36, 330, { size: 20, face: UI, weight: 600, color: MUTE }); text(c, 'USD 40.00', 36, 400, { size: 60, face: DISPLAY, weight: 800, color: INK, tracking: -2 });
  roundRect(c, 36, 440, w - 72, 2, 1, '#E3DFD6');
  text(c, 'From', 36, 500, { size: 20, face: UI, weight: 600, color: MUTE }); text(c, 'M-Pesa wallet · USD 108', 36, 532, { size: 22, face: UI, weight: 700, color: INK });
  uiButton(c, 36, h - 120, w - 72, 72, 'Confirm payment', true, 0, 26);
}

scene('solution', 122, 202, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8); const s = t - 122;
  const cam = CAM3(t);
  ctx.save(); applyCamera(ctx, cam);
  numeral(ctx, 2600, -1400, '03', 0.06, 1600);
  for (let v = 0; v <= 250; v += 50) line(ctx, -800, -v * PX_PER_USD, 5000, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  ctx.setLineDash([16, 14]); line(ctx, -800, -250 * PX_PER_USD, 5000, -250 * PX_PER_USD, 3, withAlpha(RED_, 0.5)); ctx.setLineDash([]);
  tag(ctx, 3300, -250 * PX_PER_USD, 'goal · new phone · USD 250', RED_, PAPER, 1, 26, true);
  // needs wall (next month) sits in the future
  { let acc = 0; [['Rent', 25], ['Food', 20], ['Transport', 10]].forEach(([nm, c]) => { roundRect(ctx, 3520, -(acc + c) * PX_PER_USD, 560, c * PX_PER_USD - 6, 10, SURF2); acc += c; }); text(ctx, 'next month’s bills', 3540, 40, { size: 24, face: UI, weight: 700, color: SOFT }); }
  // the line up to the Friday moment
  drawLine(ctx, JORGE, 1800, PAPER, s > 8 ? 16 : LINE_W);
  // the fork, drawn from 130 s
  const forkP = clamp((s - 8) / 4);
  if (forkP > 0) { const hx = 1800 + 2000 * ease.inOutCubic(forkP);
    const chosen = s > 55.5; // after Jorge picks the balanced option the green becomes solid and the red fades
    drawLine(ctx, FORK_RED, hx, RED_, chosen ? 6 : 16, chosen ? 0.35 : 1); drawLine(ctx, FORK_GREEN, hx, GREEN2, 16, chosen ? 1 : 0.9);
    const [rx, ry] = headPos(FORK_RED, hx), [gx, gy] = headPos(FORK_GREEN, hx);
    if (forkP >= 1) { tag(ctx, rx, ry, 'without · short next week', RED_, PAPER, 1, 26, false); tag(ctx, gx, gy, 'with CashWise · goal on track', GREEN2, INK, 1, 26, true); }
    dot(ctx, gx, gy, 12 + 6 * pz, GREEN2); if (!chosen) dot(ctx, rx, ry, 12 + 6 * pz, RED_); }
  // the dot at the Friday moment: CashWise
  const [dx, dy] = headPos(JORGE, 1800);
  dot(ctx, dx, dy, 22 + 12 * pz, RED_); ring(ctx, dx, dy, 44 + 20 * pz, 5, withAlpha(RED_, 0.5));
  if (s < 8) { const k = ease.outBack(clamp((s - 0.4) / 0.7)); ctx.save(); ctx.translate(dx + 60, dy - 20); ctx.scale(k, k); text(ctx, 'CashWise', 0, 0, { size: 140, face: DISPLAY, weight: 900, color: PAPER, tracking: -5 }); ctx.restore(); }
  // energy top-ups (196–202): small bars along the axis merge into one monthly plan
  if (s > 74) { const ss = s - 74; for (let i = 0; i < 8; i++) { const k = ease.outBack(clamp((ss - i * 0.12) / 0.4)); const merge = ease.inOutExpo(clamp((ss - 2.2) / 0.8)); const hgt = (60 + 30 * hash(i, 4)) * k; const x = lerp(3500 + i * 70, 3800, merge); rect(ctx, x - 24, -hgt, 48, hgt, i === 0 ? RED_ : withAlpha(PAPER, 1 - merge * 0.9)); }
    const merge = ease.inOutExpo(clamp((ss - 2.2) / 0.8)); if (merge > 0) { rect(ctx, 3800 - 60, -420 * merge, 120, 420 * merge, RED_); tag(ctx, 3800, -420 * merge, 'one monthly plan', PAPER, INK, merge, 26, true); } }
  ctx.restore();

  // ---- screen space ----
  if (s < 8) { statement(ctx, 'So we bring you CashWise.', '', t, 123.5, { x: 150, y: 820, size: 64, sub: 'a financial companion embedded in the Vodacom services people already use' }); }
  else if (s < 16) { statement(ctx, 'See the consequences', 'before you decide.', t, 132.5, { x: 150, y: 200, size: 72 }); }
  else if (s < 34) { // four capabilities: one big card at a time
    const i = Math.min(Math.floor((s - 16) / 4.4), 3); const ls = s - 16 - i * 4.4; const [h, d, kind] = CAPS[i];
    const k = ease.outExpo(clamp(ls / 0.5)); const out = ease.inExpo(clamp((ls - 3.9) / 0.5));
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.6));
    ctx.save(); ctx.globalAlpha = k * (1 - out); ctx.translate((1 - k) * 80 - out * 80, 0);
    roundRect(ctx, 150, 240, 1620, 600, 36, SURF);
    text(ctx, String(i + 1).padStart(2, '0') + ' / 04', 200, 310, { size: 26, face: UI, weight: 800, color: RED_ });
    text(ctx, h, 200, 440, { size: 110, face: DISPLAY, weight: 900, color: PAPER, tracking: -4 });
    const words = d.split(' '); const lines = ['']; words.forEach(w2 => { const L = lines[lines.length - 1]; if (measure(ctx, L + ' ' + w2, 38, UI, 500) < 800) lines[lines.length - 1] = (L ? L + ' ' : '') + w2; else lines.push(w2); });
    lines.forEach((l, k2) => text(ctx, l, 200, 520 + k2 * 50, { size: 38, face: UI, weight: 500, color: SOFT }));
    // animation panel on the right
    ctx.save(); ctx.translate(1420, 540);
    if (kind === 'learn') { for (let r = 0; r < 6; r++) { const yy = -190 + r * 62; roundRect(ctx, -240, yy, 480, 44, 12, SURF2); rect(ctx, -216, yy + 16, 120 + 120 * hash(r, 1), 12, PAPER); rect(ctx, 120, yy + 16, 90, 12, SOFT); } const sy = -190 + mod(ls * 110, 372); rect(ctx, -250, sy, 500, 6, RED_); }
    if (kind === 'understand') { const segs = [0.38, 0.27, 0.2, 0.15]; let a = -Math.PI / 2; segs.forEach((v, q) => { const vv = v * ease.outExpo(clamp((ls - 0.3 - q * 0.3) / 0.6)); ring(ctx, 0, 0, 160, 60, q === 0 ? RED_ : q === 1 ? PAPER : q === 2 ? SOFT : GREY2, a, a + vv * TAU); a += v * TAU; }); text(ctx, 'where it goes', 0, 10, { size: 26, face: UI, weight: 700, color: PAPER, align: 'center' }); }
    if (kind === 'suggest') { roundRect(ctx, -240, -200, 480, 120, 20, SURF2); text(ctx, 'USD 40 tonight', -210, -150, { size: 28, face: UI, weight: 600, color: SOFT }); text(ctx, 'short next week', -210, -112, { size: 22, face: UI, weight: 500, color: RED_ }); const q = ease.outExpo(clamp((ls - 0.6) / 0.6)); poly(ctx, [[0, -40], [-26, -70], [26, -70]], PAPER); ctx.save(); ctx.translate(0, 40 * (1 - q)); ctx.globalAlpha = q; roundRect(ctx, -240, 0, 480, 140, 20, RED_); text(ctx, 'USD 25 tonight', -210, 55, { size: 28, face: UI, weight: 800, color: PAPER }); text(ctx, 'goal stays on track · +20 points', -210, 95, { size: 22, face: UI, weight: 500, color: PAPER }); ctx.restore(); }
    if (kind === 'reward') { drawIcon(ctx, 'star', 0, -70, 1.8 + 0.3 * pz, RED_); const pts = Math.round(countTo(t, 122 + 16 + 3 * 4.4 + 0.4, 2.5, 50)); text(ctx, '+' + pts, 0, 110, { size: 110, face: DISPLAY, weight: 900, color: PAPER, align: 'center' }); text(ctx, 'loyalty points', 0, 160, { size: 26, face: UI, weight: 600, color: SOFT, align: 'center' }); }
    ctx.restore(); ctx.restore();
  } else if (s < 64) { // the phone: control (34–44) and next Friday (44–64)
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.55));
    const ss = s - 34; const nextFri = ss >= 10; const ls = nextFri ? ss - 10 : ss;
    const k = ease.outExpo(clamp(ss / 0.8));
    const px = 1180 + 700 * (1 - k), py = 50;
    // sheet / tap choreography
    let sheet = -1, pA = 0, pB = 0, chosen = null, good = false;
    if (!nextFri) { sheet = ls - 1.5; pB = ls > 5.3 && ls < 5.7 ? 1 : 0; if (ls > 5.7) { chosen = ls - 5.7; good = false; } }
    else { sheet = ls - 2.5; pA = ls > 9.0 && ls < 9.4 ? 1 : 0; if (ls > 9.4) { chosen = ls - 9.4; good = true; } }
    const haptic = chosen !== null && chosen < 0.25 ? Math.sin(chosen * 80) * 0.015 : 0;
    appPhone(ctx, px, py, 480, 980, (c, w, h) => { payScreen(c, w, h); if (sheet > 0) paySheet(c, w, h, sheet, { pressedA: pA, pressedB: pB, chosen, good, leaves: 'USD 3' }); }, { k: 1 + haptic });
    // finger
    if (!nextFri && ls > 3.6 && ls < 6.2) { const p = ease.inOutCubic(clamp((ls - 3.6) / 1.6)); finger(ctx, lerp(980, px + 240, p), lerp(950, py + 980 - 560 + 511, p), pB); }
    if (nextFri && ls > 7.2 && ls < 9.8) { const p = ease.inOutCubic(clamp((ls - 7.2) / 1.6)); finger(ctx, lerp(980, px + 240, p), lerp(950, py + 980 - 560 + 425, p), pA); }
    if (nextFri && chosen !== null) { confetti(ctx, px + 240, py + 500, chosen * 0.9, 7); const kk = pop(ls, 9.6, 0.5); ctx.save(); ctx.translate(px - 40, py + 560); ctx.scale(kk, kk); roundRect(ctx, -260, -40, 260, 80, 40, GREEN2); text(ctx, '+20 points', -130, 12, { size: 30, face: DISPLAY, weight: 800, color: INK, align: 'center' }); ctx.restore(); }
    // left side copy
    if (!nextFri) { statement(ctx, 'The customer', 'stays in control.', t, 156.3, { x: 150, y: 300, size: 84 }); text(ctx, 'CashWise suggests before the transaction', 150, 560, { size: 36, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((ls - 1.5) / 0.5)) }); text(ctx, 'is confirmed. The customer decides,', 150, 612, { size: 36, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((ls - 1.6) / 0.5)) }); text(ctx, 'and can always keep the original choice.', 150, 664, { size: 36, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((ls - 2) / 0.5)) });
      if (chosen !== null) sub(ctx, 'Original choice kept. No friction, no judgement.', t, 162.2); }
    else { statement(ctx, 'Next Friday.', '', t, 166.2, { x: 150, y: 260, size: 96, sub: 'same bottle store · same friends · same night' });
      if (ls > 2.5 && ls < 9.4) { chat(ctx, 150, 520, 'Same place, same time?', { k: pop(ls, 2.5, 0.4), name: 'Pedro' }); if (ls > 4) chat(ctx, 760, 640, 'On my way.', { mine: true, k: pop(ls, 4, 0.4) }); }
      if (ls > 5 && chosen === null) statement(ctx, 'For the first time, he sees', 'the consequences before deciding.', t, 171, { x: 150, y: 780, size: 54, color: PAPER, color2: PAPER });
      if (chosen !== null) { statement(ctx, 'He enjoys the night.', 'His goal stays on track.', t, 176, { x: 150, y: 780, size: 54, color: PAPER, color2: GREEN2 }); } }
  } else if (s < 69) { // consent
    const ss = s - 64; const on = ss > 2; const tp = ease.inOutExpo(clamp((ss - 2) / 0.4));
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.55));
    statement(ctx, 'Consent comes first.', '', t, 186.2, { x: 150, y: 220, size: 84, sub: 'nothing is processed until the customer opts in' });
    appPhone(ctx, 1180, 50, 480, 980, (c, w, h) => { appHeader(c, w, 'Settings', 'CashWise'); text(c, 'Allow CashWise to use my', 36, 240, { size: 24, face: UI, weight: 700, color: INK }); text(c, 'authorized transactions', 36, 272, { size: 24, face: UI, weight: 700, color: INK });
      roundRect(c, w - 150, 220, 110, 60, 30, on ? GREEN2 : '#CFCBC3'); dot(c, w - 150 + 30 + 50 * tp, 250, 24, '#FFFFFF');
      text(c, 'We only read what you allow. You can switch this off at any time.', 36, 330, { size: 18, face: UI, weight: 500, color: MUTE });
      roundRect(c, 36, 400, w - 72, 150, 20, on ? '#E8F7EE' : '#F0ECE4'); drawIcon(c, on ? 'check' : 'cross', 80, 475, 0.45); text(c, on ? 'Opted in' : 'Not opted in', 130, 465, { size: 24, face: UI, weight: 800, color: INK }); text(c, on ? 'goals + context → suggestions' : 'no recommendations', 130, 498, { size: 19, face: UI, weight: 500, color: MUTE });
      roundRect(c, 36, 580, w - 72, 150, 20, '#F0ECE4'); text(c, 'Not opted in?', 60, 640, { size: 22, face: UI, weight: 800, color: INK }); text(c, 'The service runs exactly as before.', 60, 672, { size: 19, face: UI, weight: 500, color: MUTE }); });
    if (ss > 1.2 && ss < 2.4) { const p = ease.inOutCubic(clamp((ss - 1.2) / 0.8)); finger(ctx, lerp(900, 1180 + 480 - 95, p), lerp(900, 100, p), ss > 2 ? 1 : 0); }
  } else if (s < 74) { // USSD
    const ss = s - 69;
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.55));
    statement(ctx, 'With or without internet.', '', t, 191.2, { x: 150, y: 220, size: 84, sub: 'the app on smartphones · USSD on any phone' });
    roundRect(ctx, 1200, 330, 420, 600, 40, '#E8E4DC'); roundRect(ctx, 1240, 370, 340, 300, 16, '#1F3A1F');
    const lines = ['*150#', 'CashWise', '1. Pay bill', '2. Buy electricity', '3. My goals', '4. My points']; const nchar = Math.floor(ss * 22); let acc = 0;
    lines.forEach((l, i) => { const shown = l.slice(0, Math.max(0, Math.min(l.length, nchar - acc))); acc += l.length; text(ctx, shown, 1260, 420 + i * 42, { size: 28, face: UI, weight: 600, color: '#9FE09F' }); });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) roundRect(ctx, 1260 + c * 110, 700 + r * 54, 90, 42, 10, '#CFCBC3');
    drawIcon(ctx, 'signal', 400, 560, 2.0, RED_); text(ctx, 'USSD', 400, 700, { size: 48, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
    drawIcon(ctx, 'phone', 800, 560, 2.0, PAPER); text(ctx, 'App', 800, 700, { size: 48, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
  } else { // energy
    statement(ctx, 'Beyond payments.', '', t, 196.2, { x: 150, y: 220, size: 84, sub: 'the same intelligence spreads across telecom and financial services' });
    sub(ctx, 'energy top-up every few days → one monthly plan that fits real usage', t, 198.5);
  }
});
