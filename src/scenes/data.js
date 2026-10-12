'use strict';
// 196–256  chapter 04: Data. Bars, lines, donut, scatter → histogram, dashboard, odometer.
const DATA_R = mulberry32(404);
const BARS = Array.from({ length: 12 }, (_, i) => 0.25 + 0.75 * Math.pow(DATA_R(), 0.8));
const LINE = Array.from({ length: 60 }, (_, i) => 0.35 + 0.3 * Math.sin(i * 0.25) + 0.25 * (noise2(i * 0.3, 0, 9) - 0.5) + i * 0.004);
const SCAT = Array.from({ length: 320 }, () => { const x = DATA_R(); return [x, clamp(0.15 + x * 0.6 + (DATA_R() + DATA_R() - 1) * 0.28)]; });
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const fmt = n => Math.round(n).toLocaleString('en-US');

scene('data', 196, 256, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '04', 'Data', 'numbers you can feel'); cardExit(ctx, lt, 4, INK); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const b = beat(t);

  if (lt < 12) { // bar chart, staggered growth, counters
    const s = lt - 4;
    const x0 = 200, y0 = 900, w = 1520, h = 620, bw = 92, gap = (w - 12 * bw) / 11;
    line(ctx, x0, y0, x0 + w, y0, 3, PAPER);
    for (let i = 0; i <= 4; i++) { const y = y0 - i * h / 4; line(ctx, x0, y, x0 + w, y, 1, '#26262B'); text(ctx, fmt(i * 2500), x0 - 20, y + 10, { size: 26, face: UI, weight: 500, color: MUTE, align: 'right' }); }
    BARS.forEach((v, i) => {
      const p = ease.outExpo(clamp((s - i * 0.18) / 0.9)); const hh = v * h * p * (1 + 0.04 * pz * (i === b.i % 12 ? 1 : 0));
      const x = x0 + i * (bw + gap);
      rect(ctx, x, y0 - hh, bw, hh, i === 7 ? ACCENT : PAPER);
      text(ctx, MONTHS[i], x + bw / 2, y0 + 42, { size: 26, face: UI, weight: 600, color: MUTE, align: 'center' });
      if (p > 0.6) text(ctx, fmt(v * 10000 * p), x + bw / 2, y0 - hh - 16, { size: 26, face: UI, weight: 600, color: PAPER, align: 'center' });
    });
    text(ctx, 'monthly output', 200, 150, { size: 34, face: UI, weight: 600, color: PAPER });
    // re-sort after 5s: bars re-order by height (positions interpolate)
    if (s > 5) { const q = ease.inOutExpo(clamp((s - 5) / 1.0)); bg(ctx, INK);
      const order = BARS.map((v, i) => i).sort((a, c) => BARS[c] - BARS[a]);
      line(ctx, x0, y0, x0 + w, y0, 3, PAPER);
      BARS.forEach((v, i) => { const from = x0 + i * (bw + gap), to = x0 + order.indexOf(i) * (bw + gap); const x = lerp(from, to, q); const hh = v * h;
        rect(ctx, x, y0 - hh, bw, hh, i === 7 ? ACCENT : PAPER); text(ctx, MONTHS[i], x + bw / 2, y0 + 42, { size: 26, face: UI, weight: 600, color: MUTE, align: 'center' }); });
      text(ctx, q < 0.5 ? 'monthly output' : 'sorted', 200, 150, { size: 34, face: UI, weight: 600, color: PAPER }); }
    return;
  }

  if (lt < 20) { // line chart draws with traveling head
    const s = lt - 12;
    const x0 = 200, x1 = 1720, y0 = 880, y1 = 240;
    const p = ease.inOutCubic(clamp(s / 4.5)); const n = LINE.length; const upto = p * (n - 1);
    for (let i = 0; i <= 6; i++) { const y = lerp(y0, y1, i / 6); line(ctx, x0, y, x1, y, 1, '#26262B'); }
    // area
    ctx.beginPath(); ctx.moveTo(x0, y0);
    for (let i = 0; i <= Math.floor(upto); i++) ctx.lineTo(lerp(x0, x1, i / (n - 1)), lerp(y0, y1, LINE[i]));
    const fi = Math.floor(upto), ff = upto - fi; const hv = fi < n - 1 ? lerp(LINE[fi], LINE[fi + 1], ff) : LINE[n - 1]; const hx = lerp(x0, x1, upto / (n - 1)), hy = lerp(y0, y1, hv);
    ctx.lineTo(hx, hy); ctx.lineTo(hx, y0); ctx.closePath(); ctx.fillStyle = withAlpha(ACCENT, 0.18); ctx.fill();
    ctx.strokeStyle = PAPER; ctx.lineWidth = 8; ctx.beginPath();
    for (let i = 0; i <= fi; i++) { const x = lerp(x0, x1, i / (n - 1)), y = lerp(y0, y1, LINE[i]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.lineTo(hx, hy); ctx.stroke();
    line(ctx, hx, y0, hx, y1, 2, withAlpha(ACCENT, 0.7)); dot(ctx, hx, hy, 18 + 8 * pz, ACCENT);
    text(ctx, fmt(hv * 100000), hx + 26, hy - 20, { size: 40, face: DISPLAY, weight: 800, color: PAPER });
    // annotation pops at the peak after the draw
    if (s > 5) { let mi = 0; LINE.forEach((v, i) => { if (v > LINE[mi]) mi = i; }); const mx = lerp(x0, x1, mi / (n - 1)), my = lerp(y0, y1, LINE[mi]); const k = pop(s, 5, 0.5);
      ctx.save(); ctx.translate(mx, my); ctx.scale(k, k); ring(ctx, 0, 0, 40, 6, ACCENT); rect(ctx, 0, -120, 4, 80, ACCENT); text(ctx, 'peak', 20, -100, { size: 30, face: UI, weight: 600, color: ACCENT }); ctx.restore(); }
    text(ctx, 'growth', 200, 150, { size: 34, face: UI, weight: 600, color: PAPER });
    text(ctx, 'q' + (1 + Math.floor(upto / 15)), 1720, 150, { size: 34, face: UI, weight: 600, color: MUTE, align: 'right' });
    return;
  }

  if (lt < 28) { // donut with sweeping segments and a counting center
    const s = lt - 20;
    const cx = 700, cy = 560, R = 330, wdt = 110;
    const segs = [0.42, 0.26, 0.18, 0.14]; const total = ease.inOutExpo(clamp(s / 3.5));
    let a = -Math.PI / 2; let shown = 0;
    segs.forEach((v, i) => { const vv = Math.min(v, Math.max(total - shown, 0)); if (vv > 0) ring(ctx, cx, cy, R, wdt, i === 0 ? ACCENT : i === 1 ? PAPER : i === 2 ? '#A8A49C' : MUTE, a, a + vv * TAU); a += v * TAU; shown += v; });
    text(ctx, Math.round(total * 100) + '%', cx, cy + 40, { size: 120, face: DISPLAY, weight: 900, color: PAPER, align: 'center', tracking: -4 });
    const labels = ['motion', 'type', 'sound', 'code']; let acc = 0;
    labels.forEach((l, i) => { const on = total > acc + 0.01; const y = 360 + i * 110; const k = on ? pop(s, (acc) * 3.5, 0.4) : 0;
      ctx.save(); ctx.translate(1180, y); ctx.scale(k, 1); rect(ctx, 0, -30, 44, 44, i === 0 ? ACCENT : i === 1 ? PAPER : i === 2 ? '#A8A49C' : MUTE); text(ctx, l, 70, 6, { size: 44, face: UI, weight: 600, color: PAPER }); text(ctx, Math.round(segs[i] * 100) + '%', 560, 6, { size: 44, face: UI, weight: 500, color: MUTE, align: 'right' }); ctx.restore(); acc += segs[i]; });
    // second half: donut rotates and segments breathe with the beat
    if (s > 4.5) { const rot = (s - 4.5) * 0.8; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.translate(-cx, -cy);
      let a2 = -Math.PI / 2; segs.forEach((v, i) => { const gap = 0.03 + 0.04 * pz; ring(ctx, cx, cy, R + 20 * pz * (i === b.beatInBar ? 1 : 0), wdt, i === 0 ? ACCENT : i === 1 ? PAPER : i === 2 ? '#A8A49C' : MUTE, a2 + gap, a2 + v * TAU - gap); a2 += v * TAU; }); ctx.restore();
      dot(ctx, cx, cy, R - wdt / 2 - 8, INK); text(ctx, '100%', cx, cy + 40, { size: 120, face: DISPLAY, weight: 900, color: PAPER, align: 'center', tracking: -4 }); }
    text(ctx, 'where the hours go', 200, 150, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 36) { // scatter → regression → histogram morph
    const s = lt - 28;
    const x0 = 240, x1 = 1680, y0 = 900, y1 = 220;
    line(ctx, x0, y0, x1, y0, 2, PAPER); line(ctx, x0, y0, x0, y1, 2, PAPER);
    const morph = ease.inOutExpo(clamp((s - 4.5) / 1.5));
    // histogram bins
    const bins = 16; const counts = new Array(bins).fill(0); const slot = SCAT.map(([x]) => { const bi = Math.min(bins - 1, Math.floor(x * bins)); return [bi, counts[bi]++]; });
    const maxC = Math.max(...counts);
    SCAT.forEach(([x, y], i) => {
      const k = pop(s, i * 0.006, 0.3); if (k <= 0) return;
      const sx = lerp(x0, x1, x), sy = lerp(y0, y1, y);
      const [bi, ci] = slot[i]; const bw = (x1 - x0) / bins; const hx = x0 + bi * bw + bw / 2, hy = y0 - (ci + 0.5) * ((y0 - y1) / (maxC + 1));
      dot(ctx, lerp(sx, hx, morph), lerp(sy, hy, morph), 9 * k, i % 7 === 0 ? ACCENT : PAPER);
    });
    if (s > 2.2 && morph < 1) { const p = ease.outExpo(clamp((s - 2.2) / 0.8)); ctx.globalAlpha = 1 - morph; line(ctx, x0, lerp(y0, y1, 0.15), lerp(x0, x1, p), lerp(y0, y1, 0.15 + 0.6 * p), 6, ACCENT); ctx.globalAlpha = 1; }
    text(ctx, morph < 0.5 ? 'correlation' : 'distribution', 200, 150, { size: 34, face: UI, weight: 600, color: PAPER });
    text(ctx, SCAT.length + ' points', 1720, 150, { size: 34, face: UI, weight: 600, color: MUTE, align: 'right' });
    return;
  }

  if (lt < 44) { // dashboard assembles on a 12-column grid
    const s = lt - 36;
    const panels = [[0, 0, 5, 4, 'big'], [5, 0, 7, 4, 'spark'], [0, 4, 4, 4, 'bars'], [4, 4, 4, 4, 'ring'], [8, 4, 4, 4, 'list']];
    const gx = 160, gy = 150, cw = (W - 2 * gx) / 12, ch = (H - 2 * gy) / 8, pad = 14;
    panels.forEach(([c, r, cs, rs, kind], i) => {
      const st = i * 0.25; const p = ease.outExpo(clamp((s - st) / 0.7)); if (p <= 0) return;
      const x = gx + c * cw + pad, y = gy + r * ch + pad, w = cs * cw - 2 * pad, h = rs * ch - 2 * pad;
      const dir = [[-1, 0], [1, 0], [0, 1], [0, 1], [1, 0]][i];
      ctx.save(); ctx.translate(dir[0] * (1 - p) * 600, dir[1] * (1 - p) * 600); ctx.globalAlpha = p;
      ctx.fillStyle = '#17171B'; ctx.fillRect(x, y, w, h);
      if (kind === 'big') { const v = 12840 + Math.floor(ease.outExpo(clamp(s / 3)) * 230000) + Math.floor(b.i * 37) % 100; text(ctx, 'renders', x + 30, y + 60, { size: 30, face: UI, weight: 600, color: MUTE }); text(ctx, fmt(v), x + 26, y + h - 50, { size: 118, face: DISPLAY, weight: 900, color: PAPER, tracking: -4 }); }
      if (kind === 'spark') { text(ctx, 'frames per second', x + 30, y + 60, { size: 30, face: UI, weight: 600, color: MUTE }); ctx.strokeStyle = ACCENT; ctx.lineWidth = 6; ctx.beginPath(); for (let k = 0; k < 80; k++) { const v = 0.5 + 0.35 * fbm(k * 0.08, s * 0.3, 0, 3, 11); const px = x + 30 + k * ((w - 60) / 79), py = y + h - 40 - v * (h - 120); k ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); }
      if (kind === 'bars') { text(ctx, 'by weekday', x + 30, y + 60, { size: 30, face: UI, weight: 600, color: MUTE }); for (let k = 0; k < 7; k++) { const v = 0.3 + 0.7 * hash(k, 3); const bh = v * (h - 120) * ease.outExpo(clamp((s - 1 - k * 0.1) / 0.6)); rect(ctx, x + 30 + k * ((w - 60) / 7), y + h - 40 - bh, (w - 60) / 7 - 12, bh, k === 4 ? ACCENT : PAPER); } }
      if (kind === 'ring') { text(ctx, 'uptime', x + 30, y + 60, { size: 30, face: UI, weight: 600, color: MUTE }); const v = 0.997 * ease.outExpo(clamp((s - 1.2) / 2)); ring(ctx, x + w / 2, y + h / 2 + 20, Math.min(w, h) * 0.3, 26, '#2A2A30'); ring(ctx, x + w / 2, y + h / 2 + 20, Math.min(w, h) * 0.3, 26, ACCENT, -Math.PI / 2, -Math.PI / 2 + v * TAU); text(ctx, (v * 100).toFixed(1) + '%', x + w / 2, y + h / 2 + 38, { size: 48, face: DISPLAY, weight: 800, color: PAPER, align: 'center' }); }
      if (kind === 'list') { text(ctx, 'latest', x + 30, y + 60, { size: 30, face: UI, weight: 600, color: MUTE }); const items = ['timing.mov', 'type.mov', 'shape.mov', 'data.mov']; items.forEach((it, k) => { const q = ease.outExpo(clamp((s - 1.5 - k * 0.3) / 0.5)); text(ctx, it, x + 30 + 40 * (1 - q), y + 130 + k * 64, { size: 34, face: UI, weight: 500, color: PAPER, alpha: q }); dot(ctx, x + w - 50, y + 120 + k * 64, 10, k === (b.i % 4) ? ACCENT : MUTE); }); }
      ctx.restore();
    });
    return;
  }

  if (lt < 52) { // odometer: a big number rolls up on 16ths
    const s = lt - 44;
    const target = 1000000; const v = Math.floor(target * ease.outExpo(clamp(s / 6)));
    const str = fmt(v).padStart(9, ' ');
    const size = 300; const digitW = 190; const x0 = W / 2 - digitW * 4.2;
    const frac = (v * 1) % 1;
    [...str].forEach((ch, i) => {
      const x = x0 + i * digitW; if (ch === ' ') return;
      if (ch === ',') { text(ctx, ',', x + digitW / 2, 640, { size, face: DISPLAY, weight: 900, color: MUTE, align: 'center' }); return; }
      // rolling: show digit and next digit offset by roll amount driven by speed
      const d = +ch; const speed = clamp(1 - s / 6); const roll = (i >= 6 ? speed : i >= 3 ? speed * 0.6 : 0) * ((v / Math.pow(10, 8 - i)) % 1);
      ctx.save(); ctx.beginPath(); ctx.rect(x, 640 - size * 0.8, digitW, size * 1.0); ctx.clip();
      text(ctx, String(d), x + digitW / 2, 640 + roll * size, { size, face: DISPLAY, weight: 900, color: i >= 6 ? PAPER : ACCENT, align: 'center' });
      text(ctx, String((d + 1) % 10), x + digitW / 2, 640 + (roll - 1) * size, { size, face: DISPLAY, weight: 900, color: i >= 6 ? PAPER : ACCENT, align: 'center' });
      ctx.restore();
    });
    text(ctx, 'frames rendered', W / 2, 780, { size: 36, face: UI, weight: 600, color: MUTE, align: 'center' });
    rect(ctx, 300, 860, 1320 * ease.outExpo(clamp(s / 6)), 8, ACCENT);
    return;
  }

  // 52–60: a field of numbers collapses to a point
  const s = lt - 52;
  const col = ease.inExpo(clamp((s - 6.6) / 1.4));
  const cols = 10, rows = 6;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c; const x = 200 + c * 170 + 40, y = 220 + r * 140;
    const v = Math.floor(hash(i, Math.floor(s * 8)) * 100);
    const k = ease.outExpo(clamp((s - i * 0.03) / 0.4));
    text(ctx, String(v).padStart(2, '0'), lerp(x, W / 2, col), lerp(y, H / 2, col), { size: 90, face: DISPLAY, weight: 800, color: (i + Math.floor(s * 2)) % 9 === 0 ? ACCENT : PAPER, align: 'center', alpha: k * (1 - col) });
  }
  text(ctx, 'everything is a number. every number is a point.', W / 2, 1000, { size: 34, face: UI, weight: 600, color: MUTE, align: 'center', alpha: 1 - col });
  if (col > 0) dot(ctx, W / 2, H / 2, 10 + 500 * col * col, ACCENT);
});
