'use strict';
// 136–196  chapter 03: Shape. Bauhaus trio, polygon morph, ripple grid, difference, arcs, tunnel.
scene('shape', 136, 196, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '03', 'Shape', 'circle · square · triangle · and everything between'); cardExit(ctx, lt, 4, INK); return; }
  const pz = pulse(t, 8);
  const b = beat(t);
  const cx = W / 2, cy = H / 2;

  if (lt < 12) { // Bauhaus trio: three entrances, then swaps on every bar
    bg(ctx, INK);
    const s = lt - 4;
    const slots = [460, 960, 1460];
    // entrance 0–2s, swap cycle afterwards
    const swapN = Math.floor(Math.max(s - 2, 0) / 2); const swapP = ease.inOutBack(clamp((Math.max(s - 2, 0) % 2) / 0.7));
    const order = [0, 1, 2]; for (let k = 0; k < swapN; k++) { const i = k % 2; [order[i], order[i + 1]] = [order[i + 1], order[i]]; }
    const next = order.slice(); { const i = swapN % 2; [next[i], next[i + 1]] = [next[i + 1], next[i]]; }
    const posOf = (shapeIdx) => lerp(slots[order.indexOf(shapeIdx)], slots[next.indexOf(shapeIdx)], s > 2 ? swapP : 0);
    // circle rolls in
    { const p = ease.outCubic(clamp(s / 1.2)); const x = s < 2 ? lerp(-200, slots[0], p) : posOf(0); const r = 150;
      dot(ctx, x, cy, r, PAPER); const a = (x + 200) / r; dot(ctx, x + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, 26, INK); }
    // square drops and bounces
    { const p = ease.outBounce(clamp((s - 0.4) / 1.3)); const x = s < 2 ? slots[1] : posOf(1); const y = lerp(-300, cy, p);
      ctx.save(); ctx.translate(x, y); ctx.rotate(0.6 * (1 - p)); rect(ctx, -140, -140, 280, 280, ACCENT); ctx.restore(); }
    // triangle spins in
    { const p = ease.outExpo(clamp((s - 0.8) / 1.2)); const x = s < 2 ? slots[2] : posOf(2);
      poly(ctx, regular(x, cy + 30, 180 * p, 3, (1 - p) * 4), PAPER); }
    text(ctx, 'three shapes. every poster ever made.', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    if (s > 7.4) rect(ctx, 0, 0, W, H * ease.inExpo((s - 7.4) / 0.6), PAPER);
    return;
  }

  if (lt < 20) { // polygon morph
    bg(ctx, PAPER);
    const s = lt - 12;
    const ns = [3, 4, 5, 6, 8, 12, 48, 3]; const seg = 1.0;
    const i = Math.min(Math.floor(s / seg), ns.length - 2); const m = ease.inOutExpo(clamp((s - i * seg - 0.5) / 0.5));
    const n0 = ns[i], n1 = ns[i + 1]; const n = 48; // sample both as 48-point outlines and interpolate
    const outline = (nSides, r, rot) => { const pts = []; for (let k = 0; k < n; k++) { const a = k / n * TAU; const sideA = TAU / nSides; const local = mod(a, sideA) - sideA / 2; const rr = r * Math.cos(sideA / 2) / Math.cos(local); pts.push([Math.cos(a + rot) * rr, Math.sin(a + rot) * rr]); } return pts; };
    const rot = -Math.PI / 2 + s * 0.3;
    const A = outline(n0, 360, rot), B = outline(n1, 360, rot);
    const pts = A.map((p, k) => [cx + lerp(p[0], B[k][0], m), cy + lerp(p[1], B[k][1], m)]);
    poly(ctx, pts, INK);
    const A2 = outline(n0, 170, -rot * 1.5), B2 = outline(n1, 170, -rot * 1.5);
    poly(ctx, A2.map((p, k) => [cx + lerp(p[0], B2[k][0], m), cy + lerp(p[1], B2[k][1], m)]), ACCENT);
    const label = (m < 0.5 ? n0 : n1); text(ctx, label >= 48 ? 'n → ∞' : 'n = ' + label, 160, 120, { size: 34, face: UI, weight: 600, color: INK });
    text(ctx, 'a circle is a polygon that stopped counting', W - 160, 120, { size: 34, face: UI, weight: 600, color: MUTE, align: 'right' });
    return;
  }

  if (lt < 28) { // ripple grid
    bg(ctx, INK);
    const s = lt - 20;
    const cols = 12, rows = 7, gx = 150, gy = 140, x0 = cx - (cols - 1) * gx / 2, y0 = cy - (rows - 1) * gy / 2;
    const kind = Math.floor(s / 2) % 4;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * gx, y = y0 + r * gy; const d = Math.hypot(x - cx, y - cy) / 900;
      const w = Math.sin(s * 4 - d * 9); const sc = 0.55 + 0.45 * w; const ang = s * 1.5 + d * 4;
      const col = w > 0.6 ? ACCENT : PAPER;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(sc, sc);
      if (kind === 0) dot(ctx, 0, 0, 40, col); else if (kind === 1) rect(ctx, -36, -36, 72, 72, col); else if (kind === 2) poly(ctx, regular(0, 0, 46, 3), col); else { ring(ctx, 0, 0, 34, 10, col); }
      ctx.restore();
    }
    return;
  }

  if (lt < 36) { // difference: overlapping orbiting shapes
    bg(ctx, PAPER);
    const s = lt - 28;
    ctx.save(); ctx.globalCompositeOperation = 'difference';
    const n = 3 + Math.floor(s / 2);
    for (let i = 0; i < n; i++) {
      const a = s * (0.5 + i * 0.17) + i * TAU / n; const r = 220 + 80 * Math.sin(s * 0.7 + i);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.7;
      const size = 300 + 60 * pz;
      if (i % 3 === 0) dot(ctx, x, y, size / 2, '#FFFFFF');
      else if (i % 3 === 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); rect(ctx, -size / 2, -size / 2, size, size, '#FFFFFF'); ctx.restore(); }
      else poly(ctx, regular(x, y, size * 0.62, 3, a), '#FFFFFF');
    }
    ctx.restore();
    // accent center mark and caption (drawn normally)
    dot(ctx, cx, cy, 14 + 10 * pz, ACCENT);
    text(ctx, 'difference', 160, 120, { size: 34, face: UI, weight: 600, color: INK });
    text(ctx, n + ' bodies', W - 160, 120, { size: 34, face: UI, weight: 600, color: MUTE, align: 'right' });
    return;
  }

  if (lt < 44) { // concentric arcs
    bg(ctx, INK);
    const s = lt - 36;
    const rings = 11;
    for (let i = 0; i < rings; i++) {
      const r = 80 + i * 44; const spd = (i % 2 ? -1 : 1) * (0.3 + i * 0.12);
      const segs = 2 + (i % 4);
      for (let k = 0; k < segs; k++) {
        const len = (0.25 + 0.5 * noise2(i * 3.1, s * 0.6 + k * 7, 5)) * TAU / segs * (0.7 + 0.5 * pz);
        const a0 = s * spd + k * TAU / segs;
        ring(ctx, cx, cy, r, 22, (i + k) % 5 === 0 ? ACCENT : PAPER, a0, a0 + len);
      }
    }
    dot(ctx, cx, cy, 30 + 30 * pz, ACCENT);
    text(ctx, 'rotation · ' + rings + ' rings · ' + (b.bar % 4 + 1) + '/4', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 52) { // tunnel of squares
    bg(ctx, INK);
    const s = lt - 44;
    const n = 18; const speed = 1.2 + 1.5 * pz; const z = s * 1.2;
    for (let i = n - 1; i >= 0; i--) {
      const f = mod(i - z, n) / n; // 0 close → 1 far
      const sc = Math.pow(1 - f, 2.2) * 1.6; const size = 1400 * sc; const rot = s * 0.4 + f * 2.0;
      if (size < 4) continue;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
      const col = i % 2 ? PAPER : INK;
      rect(ctx, -size / 2, -size / 2, size, size, col);
      if (i % 6 === 0) { ctx.strokeStyle = ACCENT; ctx.lineWidth = 12 * sc + 2; ctx.strokeRect(-size / 2, -size / 2, size, size); }
      ctx.restore();
    }
    text(ctx, 'zoom', 160, 120, { size: 34, face: UI, weight: 600, color: ACCENT });
    return;
  }

  // 52–60: shapes converge into a mark: ring + dot, then collapse
  bg(ctx, INK);
  const s = lt - 52;
  const p = ease.inOutExpo(clamp(s / 1.4));
  const items = [[0, -520, -200], [1, 520, -200], [2, 0, 300], [3, -520, 260], [4, 520, 260]];
  items.forEach(([k, ox, oy]) => {
    const x = lerp(cx + ox, cx, p), y = lerp(cy + oy, cy, p); const r = lerp(120, 300, p);
    if (k === 0) ring(ctx, x, y, r, 18, PAPER); else if (k === 1) { ctx.save(); ctx.translate(x, y); ctx.rotate(p * Math.PI / 4 + s); ctx.strokeStyle = PAPER; ctx.lineWidth = 18; ctx.strokeRect(-r, -r, 2 * r, 2 * r); ctx.restore(); }
    else if (k === 2) poly(ctx, regular(x, y, r, 3, s * 0.5), PAPER, 18); else if (k === 3) poly(ctx, regular(x, y, r, 6, -s * 0.3), PAPER, 18); else ring(ctx, x, y, r * 0.7, 18, ACCENT, s, s + 4);
  });
  dot(ctx, cx, cy, 40 + 40 * pz * p, ACCENT);
  const col = ease.inExpo(clamp((s - 7.2) / 0.8)); if (col > 0) { bg(ctx, INK); dot(ctx, cx, cy, 10 + 500 * col, ACCENT); }
});
