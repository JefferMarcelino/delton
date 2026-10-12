'use strict';
// 0–62  Jorge's money line: payday, saving, the chat, Friday night, the weekend, next month.
const HEAD_KEYS = [[0, -600], [1.2, -600], [3.0, 200], [3.3, 200], [12, 700], [16, 1000], [20, 1400], [33.5, 1800], [34, 1840], [35.2, 1960], [35.4, 2000], [36.6, 2120], [36.8, 2160], [38, 2280], [38.2, 2320], [39.4, 2440], [39.6, 2480], [46, 3000], [54, 3380], [62, 3380]];
function headX(t) { for (let i = 0; i < HEAD_KEYS.length - 1; i++) { const a = HEAD_KEYS[i], b = HEAD_KEYS[i + 1]; if (t >= a[0] && t <= b[0]) return lerp(a[1], b[1], ease.inOutQuad((t - a[0]) / (b[0] - a[0] || 1))); } return HEAD_KEYS[HEAD_KEYS.length - 1][1]; }
const CAM1 = makeCamera([
  { t: 0, x: 100, y: -200, z: 1.1 }, { t: 3, x: -110, y: -200, z: 1.1 }, { t: 8, x: -160, y: -420, z: 0.95 }, { t: 12, x: 1050, y: -380, z: 0.9 },
  { t: 20, x: 1500, y: -400, z: 0.9 }, { t: 33, x: 1800, y: -400, z: 0.9 }, { t: 40, x: 2500, y: -150, z: 0.95 }, { t: 46, x: 2900, y: -60, z: 1.0 },
  { t: 52, x: 3300, y: -120, z: 0.9 }, { t: 58, x: 3400, y: -120, z: 0.9 }, { t: 62, x: 1700, y: -350, z: 0.48 },
]);
const NEEDS = [['Rent', 25, 'home'], ['Food', 20, 'food'], ['Transport', 10, 'taxi']];

scene('problem', 0, 62, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const cam = CAM1(t); const hx = headX(t); const [hxw, hyw] = headPos(JORGE, hx); const val = valueAt(JORGE, hx);
  ctx.save(); applyCamera(ctx, cam);

  // ---- world ----
  numeral(ctx, 2600, -1400, '01', 0.06, 1600);
  // ground axis and value grid
  for (let v = 0; v <= 250; v += 50) line(ctx, -800, -v * PX_PER_USD, 4400, -v * PX_PER_USD, 1, v ? GRID : '#33333B');
  // goal line
  if (t > 10) { const k = ease.outExpo(clamp((t - 10) / 0.8)); ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([16, 14]); line(ctx, -800, -250 * PX_PER_USD, 4400, -250 * PX_PER_USD, 3, withAlpha(RED_, 0.7)); ctx.setLineDash([]);
    tag(ctx, 500 + 300 * (1 - k), -250 * PX_PER_USD, 'goal · new phone · USD 250', RED_, PAPER, 1, 28, true); ctx.restore(); }
  // next month's needs: a wall of blocks the line must clear
  if (t > 50) { let acc = 0; NEEDS.forEach(([nm, c, ic], i) => { const k = ease.outBack(clamp((t - 50.5 - i * 0.5) / 0.5)); const y0 = -acc * PX_PER_USD, hh = c * PX_PER_USD * k; const risk = acc + c > 43 && t > 54.5 + i * 0.7;
      ctx.save(); roundRect(ctx, 3520, y0 - hh, 560, hh - 6, 10, risk ? RED_ : SURF2); if (k > 0.8) { drawIcon(ctx, ic, 3560, y0 - hh / 2, 0.35, PAPER); text(ctx, nm + ' · USD ' + c, 3600, y0 - hh / 2 + 10, { size: 26, face: UI, weight: 700, color: PAPER }); }
      if (risk) { const q = pop(t, 54.5 + i * 0.7, 0.4); ctx.save(); ctx.translate(4110, y0 - hh / 2); ctx.scale(q, q); roundRect(ctx, 0, -24, 150, 48, 24, PAPER); text(ctx, 'AT RISK', 75, 10, { size: 20, face: UI, weight: 800, color: RED_, align: 'center' }); ctx.restore(); }
      ctx.restore(); acc += c; }); }
  // the money line and its dashed projection into next month
  if (t > 52) { ctx.save(); ctx.setLineDash([14, 14]); line(ctx, 3000, -43 * PX_PER_USD, 4100, -43 * PX_PER_USD, 4, withAlpha(RED_, 0.8)); ctx.setLineDash([]); ctx.restore(); }
  if (t > 46.5) { const fade = 1 - clamp((t - 52) / 0.8); const k1 = pop(t, 46.5, 0.4), k2 = pop(t, 48.3, 0.4); ctx.save(); ctx.globalAlpha = fade; ctx.translate(2450, 200); ctx.scale(k1, k1); text(ctx, 'How?', 0, 0, { size: 200, face: DISPLAY, weight: 900, color: withAlpha(PAPER, 0.9), tracking: -8 }); ctx.restore();
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(2450, 330); ctx.scale(k2, k2); text(ctx, 'What did I spend it on?', 0, 0, { size: 100, face: DISPLAY, weight: 900, color: withAlpha(RED_, 0.95), tracking: -4 }); ctx.restore(); }
  if (t > 1.2) drawLine(ctx, JORGE, hx, PAPER, LINE_W);
  // small savings as the head passes (12–20 s)
  for (let i = 0; i < 5; i++) { const sx = 500 + i * 220; if (hx < sx || t > 30) continue; const k = pop(hx, sx, 120) ; const a = 1 - clamp((hx - sx - 300) / 300); if (a <= 0) continue; const y = headPos(JORGE, sx)[1]; ctx.save(); ctx.globalAlpha = a; tag(ctx, sx, y, '+ 1.6 saved', GREEN2, INK, k, 22, true); ctx.restore(); }
  // the payday jump tag
  if (t > 3.3) { const k = pop(t, 3.3, 0.5); tag(ctx, 200, -100 * PX_PER_USD, '+ USD 100', GREEN2, INK, k, 34); }
  // the chat above the line
  const chatX = 1400, lineY = -108 * PX_PER_USD;
  const msgs = [[28.6, 'Tonight? Bottle store at 8', false, 'Pedro'], [30.0, 'Come on Jorge, everyone is in', false, 'Carla'], [32.6, 'ok.', true, '']];
  if (t > 28 && t < 37) { const fade = 1 - clamp((t - 35.5) / 1.0); ctx.save(); ctx.globalAlpha = fade; msgs.forEach(([st, str, mine, name], i) => { if (t < st) return; const k = pop(t, st, 0.45); chat(ctx, mine ? chatX + 760 : chatX, lineY - 150 - (2 - i) * 125, str, { mine, k, name, size: 40 }); });
    if (t > 31.2 && t < 32.6) typing(ctx, chatX + 640, lineY - 150, t, pop(t, 31.2, 0.3)); ctx.restore(); }
  // receipts fly off at each drop
  RECEIPTS.forEach(([ic, amt, rx], i) => { const st = 34 + i * 1.4; if (t < st) return; const p = clamp((t - st) / 1.6); const x = rx + 200 * p, y = headPos(JORGE, rx + 20)[1] - 120 - 420 * ease.outCubic(p); receipt(ctx, x, y, ic, amt, 0.9 * (1 - 0.3 * p), (i - 2) * 0.15 + p * 0.4, 1 - p * p); });
  // the head
  if (t > 1.2) { dot(ctx, hxw, hyw, 16 + 10 * pz, RED_); ring(ctx, hxw, hyw, 30 + 14 * pz, 4, withAlpha(RED_, 0.6)); }
  // rolling balance tag that follows the head (after payday)
  if (t > 4 && t < 58) { const dropping = t > 33.5 && t < 40; tag(ctx, hxw, hyw, 'USD ' + Math.round(val), val < 50 ? RED_ : PAPER, val < 50 ? PAPER : INK, 1, 32, false); }
  ctx.restore();

  // ---- screen space ----
  if (t < 1.2) { for (let k = 0; k < 3; k++) { const p = clamp((t - 0.1 - k * 0.35) / 1.0); if (p > 0 && p < 1) { const [sx, sy] = w2s(cam, 0, 0); ring(ctx, sx, sy, 60 + 900 * ease.outCubic(p), 14 * (1 - p), withAlpha(RED_, 1 - p)); } } }
  if (t > 1.3 && t < 7.5) statement(ctx, "This is Jorge's money.", '', t, 1.3, { x: 150, y: 220, size: 72 });
  if (t > 3 && t < 8.5) { const k1 = pop(t, 3.0, 0.4), k2 = pop(t, 3.6, 0.4); ctx.save(); ctx.translate(150, 480); ctx.scale(k1, k1); text(ctx, 'FRIDAY.', 0, 0, { size: 170, face: DISPLAY, weight: 900, color: PAPER, tracking: -6 }); ctx.restore(); ctx.save(); ctx.translate(150, 660); ctx.scale(k2, k2); text(ctx, 'PAYDAY.', 0, 0, { size: 170, face: DISPLAY, weight: 900, color: RED_, tracking: -6 }); ctx.restore(); }
  // wallet card, top right, from 8 s
  if (t > 8 && t < 46) { const k = ease.outExpo(clamp((t - 8) / 0.7)); const x = 1300 + 500 * (1 - k), y = 120;
    roundRect(ctx, x, y, 470, 200, 28, PAPER); dot(ctx, x + 60, y + 60, 30, RED_); text(ctx, 'J', x + 60, y + 72, { size: 32, face: DISPLAY, weight: 900, color: PAPER, align: 'center' });
    text(ctx, 'Jorge · M-Pesa wallet', x + 110, y + 70, { size: 24, face: UI, weight: 600, color: MUTE }); text(ctx, 'USD ' + Math.round(val), x + 40, y + 160, { size: 64, face: DISPLAY, weight: 900, color: val < 50 ? RED_ : INK, tracking: -2 }); }
  // narration echoes
  if (t >= 12 && t < 20) statement(ctx, 'Meet Jorge.', 'He tries to save.', t, 12.5, { y: 760, size: 84, sub: 'USD 100 a month. One dream: a new phone.' });
  if (t >= 20 && t < 28) sub(ctx, 'Every month the same income. Every month the same dream.', t, 20.5);
  if (t >= 28 && t < 34) sub(ctx, 'Then his friends call.', t, 28.3);
  if (t >= 34 && t < 46) sub(ctx, 'Friday night, one tap at a time.', t, 34.5);
  if (t >= 40.5 && t < 46) statement(ctx, 'USD 43', '', t, 40.8, { x: 150, y: 820, size: 150, color: RED_, sub: 'after the weekend' });
  if (t >= 52) statement(ctx, 'Next month', '', t, 52.3, { x: 150, y: 220, size: 84, sub: 'plans at risk · essentials uncertain' });
});
