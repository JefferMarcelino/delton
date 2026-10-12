'use strict';
// 62–122  Jorge's line becomes one of many. Mozambique (64 of 100), Africa (562M), four consequences, earn vs keep, Vodafone.
const PEOPLE = makePeople(562, 3);
const CELL_W = 360, CELL_H = 200, PITCH_X = 400, PITCH_Y = 240;
const ORDER100 = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => hash(a, 9) - hash(b, 9)); // reveal order
const RED100 = new Set(ORDER100.slice(0, 64));
const BIG_POS = (() => { const out = []; for (let i = 0; i < 100; i++) out.push([(i % 10) * PITCH_X, Math.floor(i / 10) * PITCH_Y]); for (let r = 0; r < 14; r++) for (let c = 0; c < 41; c++) { if (c < 10 && r < 10) continue; if (out.length >= 562) break; out.push([c * PITCH_X, r * PITCH_Y]); } return out; })();
const cellPos = (i, cols) => cols === 10 ? [(i % 10) * PITCH_X, Math.floor(i / 10) * PITCH_Y] : BIG_POS[i];
const CAM2 = makeCamera([
  { t: 62, x: 1780, y: 1060, z: 4.6 }, { t: 66, x: 1900, y: 1080, z: 0.43 }, { t: 75, x: 1900, y: 1080, z: 0.43 },
  { t: 80, x: 8200, y: 1600, z: 0.115 }, { t: 91, x: 8200, y: 1600, z: 0.115 },
  { t: 92.5, x: 1990, y: 1060, z: 2.6 }, { t: 105, x: 1990, y: 1060, z: 2.6 }, { t: 107, x: 2000, y: 1080, z: 0.4 }, { t: 110, x: 2000, y: 1080, z: 0.4 },
  { t: 112, x: 2000, y: 1080, z: 0.25 }, { t: 122, x: 2000, y: 1080, z: 0.25 },
]);
function jorgeSpark(ctx, x, y, w, h, color, width) {
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.beginPath();
  JORGE.forEach(([px, v], i) => { const sx = x + (px + 600) / 4000 * w, sy = y + h - v / 250 * h; i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); }); ctx.stroke();
}

scene('impact', 62, 122, (ctx, t) => {
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const cam = CAM2(t);
  const s = t - 62;
  ctx.save(); applyCamera(ctx, cam);
  numeral(ctx, 2000, -500, '02', 0.06, 1600);

  const cols = s < 13 ? 10 : 41; const total = s < 13 ? 100 : 562;
  const wave = s > 44 && s < 48 ? (s - 44) : 0;
  for (let i = 0; i < total; i++) {
    const [x, y] = cellPos(i, cols);
    // in the 41-wide grid, keep the first 100 where they were by remapping the first 10x10 block
    const cx = x, cy = y;
    const appear = (cols === 10 && i === 44) ? 1 : cols === 10 ? ease.outExpo(clamp((s - 0.5 - hash(i, 2) * 2.5) / 0.6)) : (i < 100 ? 1 : ease.outExpo(clamp((s - 13 - hash(i, 4) * 4) / 0.5)));
    if (appear <= 0) continue;
    const isJ = cols === 10 && i === 44;
    let red = false;
    if (cols === 10) { const k = ORDER100.indexOf(i); red = RED100.has(i) && s > 4.5 + k * 0.1; } else red = hash(i, 11) < 0.69 && s > 18;
    const dy = wave ? Math.sin(wave * 3 - (cx + cy) / 900) * 40 * clamp(wave) * (1 - clamp((s - 47))) : 0;
    ctx.save(); ctx.globalAlpha = appear; ctx.translate(0, dy);
    roundRect(ctx, cx, cy, CELL_W, CELL_H, 18, red ? withAlpha(RED_, 0.14) : SURF);
    if (isJ) { jorgeSpark(ctx, cx + 20, cy + 20, CELL_W - 40, CELL_H - 40, red ? RED_ : PAPER, 5); roundRect(ctx, cx, cy, CELL_W, CELL_H, 18, RED_, 4); }
    else sparkline(ctx, PEOPLE[i], cx + 20, cy + 20, CELL_W - 40, CELL_H - 40, red ? RED_ : withAlpha(PAPER, 0.75), 4);
    ctx.restore();
  }
  // consequences on one enlarged cell (5,4)
  if (s >= 30 && s < 45) {
    const [cx, cy] = [5 * PITCH_X, 4 * PITCH_Y]; const pts = PEOPLE[45]; const X = k => cx + 20 + k / 23 * (CELL_W - 40), Y = v => cy + 20 + (CELL_H - 40) - clamp(v, 0, 1.2) / 1.2 * (CELL_H - 40);
    // 1 TODAY: the drop lights up
    if (s >= 30) { const k = ease.outExpo(clamp((s - 30) / 0.6)); ctx.strokeStyle = RED_; ctx.lineWidth = 7; ctx.beginPath(); for (let q = 6; q <= 12; q++) { q === 6 ? ctx.moveTo(X(q), Y(pts[q])) : ctx.lineTo(X(q), Y(pts[q])); } ctx.globalAlpha = k; ctx.stroke(); ctx.globalAlpha = 1; }
    // 2 GOALS: a goal line drifts up and fades
    if (s >= 33.2) { const k = clamp((s - 33.2) / 3); ctx.save(); ctx.globalAlpha = 1 - k * 0.8; ctx.setLineDash([8, 8]); line(ctx, cx + 20, cy + 24 - k * 90, cx + CELL_W - 20, cy + 24 - k * 90, 2, RED_); ctx.setLineDash([]); ctx.restore(); }
    // 3 FAMILIES: a thinner line (the household) follows the fall
    if (s >= 36.4) { const k = ease.outExpo(clamp((s - 36.4) / 0.8)); ctx.save(); ctx.globalAlpha = k; sparkline(ctx, pts.map(v => v * 0.55), cx + 20, cy + 20, CELL_W - 40, CELL_H - 40, SOFT, 2.5); ctx.restore(); }
    // 4 WEALTH: the curve that never happens
    if (s >= 39.6) { const k = ease.outExpo(clamp((s - 39.6) / 1.2)); ctx.save(); ctx.globalAlpha = 0.6 * k; ctx.setLineDash([6, 8]); ctx.strokeStyle = GREEN2; ctx.lineWidth = 3; ctx.beginPath(); for (let q = 0; q <= 23; q++) { const v = pts[2] + 0.05 * Math.max(0, q - 2) * 1.0; const x = X(q), y = Y(Math.min(v, 1.2)); q ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
  }
  ctx.restore();

  // ---- screen space ----
  if (s < 13) { // Mozambique
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.35));
    if (s > 1) statement(ctx, 'Jorge is not alone.', '', t, 63, { x: 150, y: 200, size: 72 });
    if (s > 4) { const n = Math.min(64, Math.floor((s - 4.5) / 0.1)); const v = Math.round(countTo(t, 66.5, 6.4, 64));
      roundRect(ctx, 150, 300, 330, 60, 14, PAPER); text(ctx, 'MOZAMBIQUE', 315, 342, { size: 26, face: UI, weight: 800, color: INK, align: 'center' });
      text(ctx, '~' + v + '%', 150, 560, { size: 220, face: DISPLAY, weight: 900, color: RED_, tracking: -8 });
      text(ctx, 'of adults are', 156, 640, { size: 40, face: UI, weight: 700, color: PAPER }); text(ctx, 'financially illiterate', 156, 695, { size: 40, face: UI, weight: 500, color: SOFT }); }
  } else if (s < 30) { // Africa
    const k = ease.outExpo(clamp((s - 13) / 0.6));
    ctx.save(); ctx.globalAlpha = k; roundRect(ctx, 150, 180, 460, 60, 14, PAPER); text(ctx, 'SUB-SAHARAN AFRICA', 380, 222, { size: 26, face: UI, weight: 800, color: INK, align: 'center' }); ctx.restore();
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.55));
    if (s < 20) { statement(ctx, '65–73%', '', t, 75.5, { x: 150, y: 480, size: 220, sub: 'of adults are financially illiterate · IMF' }); }
    else { const v = Math.round(countTo(t, 82.5, 4, 562)); const str = v >= 500 ? '500–562M' : v + 'M';
      statement(ctx, str, '', t, 82.2, { x: 150, y: 520, size: 200, color: RED_, sub: 'adults making money decisions without seeing the consequences' });
      if (s > 25) sub(ctx, 'until it is too late.', t, 87.5, RED_); }
  } else if (s < 45) { // four consequences
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.45));
    const items = [['TODAY', 'money is lost', 30], ['GOALS', 'delayed or abandoned', 33.2], ['FAMILIES', 'vulnerable to debt', 36.4], ['WEALTH', 'opportunities slip away', 39.6]];
    statement(ctx, 'The cost goes beyond today.', '', t, 92.2, { x: 150, y: 170, size: 64 });
    items.forEach(([h, d, at], i) => { if (s < at) return; const k = pop(s, at, 0.5); const y = 300 + i * 150;
      ctx.save(); ctx.translate(150, y); ctx.scale(k, k); const cur = s < (items[i + 1] ? items[i + 1][2] : 44);
      roundRect(ctx, 0, 0, 640, 120, 24, cur ? RED_ : SURF); text(ctx, String(i + 1), 30, 78, { size: 56, face: DISPLAY, weight: 900, color: cur ? PAPER : RED_ });
      text(ctx, h, 100, 52, { size: 32, face: DISPLAY, weight: 800, color: PAPER }); text(ctx, d, 100, 92, { size: 26, face: UI, weight: 500, color: cur ? PAPER : SOFT }); ctx.restore(); });
    if (s > 43.5) statement(ctx, 'Over time: cycles of poverty', 'across generations.', t, 105.5, { x: 150, y: 420, size: 80 });
  } else if (s < 48) {
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.45));
    statement(ctx, 'Over time: cycles of poverty', 'across generations.', t, 105.5, { x: 150, y: 420, size: 80 });
  } else { // earn vs keep, then Vodafone
    rect(ctx, 0, 0, W, H, withAlpha(INK, 0.9));
    const ss = s - 48;
    if (ss < 7) {
      statement(ctx, 'Not how much', 'people earn.', t, 110.2, { x: 150, y: 300, size: 96 });
      // two people: same income, different outcomes (right side)
      const A = [0.3, 0.3, 0.9, 0.86, 0.82, 0.8, 0.76, 0.72, 0.7, 0.68, 0.66, 0.64, 0.62, 0.62, 0.6, 0.6, 0.58, 0.58, 0.56, 0.56, 0.55, 0.55, 0.54, 0.54];
      const B = [0.3, 0.3, 0.9, 0.8, 0.7, 0.62, 0.4, 0.3, 0.22, 0.18, 0.14, 0.1, 0.08, 0.06, 0.05, 0.05, 0.04, 0.04, 0.03, 0.03, 0.02, 0.02, 0.02, 0.02];
      const up = clamp(ss / 2.5);
      [[A, GREEN2, 'keeps · protects · grows', 230], [B, RED_, 'spends it all', 600]].forEach(([pts, col, lab, y]) => { roundRect(ctx, 1040, y, 740, 300, 24, SURF); sparkline(ctx, pts, 1080, y + 40, 660, 200, col, 6, up); text(ctx, lab, 1080, y + 280, { size: 26, face: UI, weight: 700, color: col });
        dot(ctx, 1080 + 2 / 23 * 660, y + 40 + 200 - 0.9 / 1.2 * 200, 10, PAPER); text(ctx, 'same payday', 1080 + 2 / 23 * 660 + 18, y + 40 + 200 - 0.9 / 1.2 * 200 - 12, { size: 20, face: UI, weight: 600, color: SOFT }); });
      if (ss > 2.3) { text(ctx, 'but whether their decisions help them', 150, 560, { size: 40, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((ss - 2.3) / 0.4)) });
        let vx = 150; [['KEEP', 2.6], ['PROTECT', 3.4], ['GROW', 4.2]].forEach(([v, st]) => { const wv = measure(ctx, v, 96, DISPLAY, 900, -3) + 60; if (ss >= st) { const kk = pop(ss, st, 0.4); ctx.save(); ctx.translate(vx, 700); ctx.scale(kk, kk); text(ctx, v, 0, 0, { size: 96, face: DISPLAY, weight: 900, color: RED_, tracking: -3 }); ctx.restore(); } vx += wv; });
        text(ctx, 'what they earn.', 156, 790, { size: 40, face: UI, weight: 500, color: SOFT, alpha: ease.outExpo(clamp((ss - 4.6) / 0.4)) }); }
    } else {
      const q = ease.outExpo(clamp((ss - 7) / 0.6)); ctx.save(); ctx.globalAlpha = q;
      statement(ctx, 'And every day it stays unresolved,', '', t, 117, { x: 150, y: 260, size: 44, color: SOFT });
      statement(ctx, 'Vodafone misses', 'an opportunity.', t, 117.2, { x: 150, y: 420, size: 92, sub: 'to grow the value of its telecom and financial ecosystem' });
      const cx = 1560, cy = 760; const names = ['M-Pesa', 'Airtime', 'PayBill', 'Savings', 'Insurance', 'Data'];
      ring(ctx, cx, cy, 190, 3, GRID);
      names.forEach((nm, i) => { const a = (ss - 7) * 0.35 + i / names.length * TAU; const x = cx + Math.cos(a) * 190, y = cy + Math.sin(a) * 190; roundRect(ctx, x - 82, y - 28, 164, 56, 28, i === 0 ? RED_ : PAPER); text(ctx, nm, x, y + 9, { size: 24, face: UI, weight: 700, color: i === 0 ? PAPER : INK, align: 'center' }); });
      dot(ctx, cx, cy, 34 + 18 * pz, RED_); ctx.restore();
    }
  }
});
