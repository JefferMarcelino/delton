'use strict';
// 376–420  outro: a point, a line, a story. Montage of every chapter. Name card. Back to the point.
scene('outro', 376, 420, (ctx, t, lt) => {
  const pz = pulse(t, 7);
  const b = beat(t);
  const cx = W / 2, cy = H / 2;

  if (lt < 8) { // three statements on bars; the dot draws a line that becomes a curve
    bg(ctx, PAPER);
    const s = lt;
    const lines = ['a point.', 'a line.', 'a story.'];
    const li = Math.min(Math.floor(s / 2), 2); const ls = s - li * 2;
    // path drawn by the dot
    const n = Math.floor(clamp(s / 6) * 400);
    ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / 400; const x = 200 + u * 1520; const y = 720 - (u < 0.33 ? 0 : Math.sin((u - 0.33) * 9) * 160 * ease.outQuad(clamp((u - 0.33) / 0.2))); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    if (n > 0) ctx.stroke();
    { const u = n / 400; const x = 200 + u * 1520; const y = 720 - (u < 0.33 ? 0 : Math.sin((u - 0.33) * 9) * 160 * ease.outQuad(clamp((u - 0.33) / 0.2))); dot(ctx, x, y, 30 + 20 * pz, ACCENT); }
    for (let i = 0; i <= li; i++) { const k = i === li ? pop(ls, 0, 0.5) : 1; ctx.save(); ctx.translate(200 + i * 520, 420); ctx.scale(k, k);
      text(ctx, lines[i], 0, 0, { size: 120, face: DISPLAY, weight: 900, color: i === 2 ? ACCENT : INK, tracking: -4 }); ctx.restore(); }
    if (s > 7.4) rect(ctx, 0, 0, W, H * ease.inExpo((s - 7.4) / 0.6), INK);
    return;
  }

  if (lt < 24) { // montage: every chapter live in a 4x2 grid, cells pop in on beats
    bg(ctx, INK);
    const s = lt - 8;
    const names = ['timing', 'type', 'shape', 'data', 'depth', 'systems'];
    const cells = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];
    const cw = 560, ch = 315, gap = 30; const x0 = (W - 3 * cw - 2 * gap) / 2, y0 = 150;
    names.forEach((nm, i) => {
      const sc = SCENES.find(z => z.name === nm); if (!sc) return;
      const k = pop(s, i * 0.5, 0.5); if (k <= 0) return;
      const [c, r] = cells[i]; const x = x0 + c * (cw + gap), y = y0 + r * (ch + gap + 40);
      // each cell plays a different window of its chapter; windows advance per bar
      const win = 4 + (Math.floor(s / 4) * 8 + i * 8) % 48; const tt = sc.start + win + (s % 4);
      ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(k, k); ctx.translate(-cw / 2, -ch / 2);
      ctx.beginPath(); ctx.rect(0, 0, cw, ch); ctx.clip(); ctx.scale(cw / W, ch / H);
      try { sc.draw(ctx, tt, tt - sc.start, (tt - sc.start) / (sc.end - sc.start)); } catch (e) { }
      ctx.restore();
      text(ctx, '0' + (i + 1) + '  ' + nm, x, y + ch + 44, { size: 28, face: UI, weight: 600, color: i === b.i % 6 ? ACCENT : MUTE, alpha: k });
    });
    text(ctx, 'seven minutes. one point.', cx, 110, { size: 34, face: UI, weight: 600, color: PAPER, align: 'center' });
    if (s > 15.4) rect(ctx, 0, 0, W * ease.inExpo((s - 15.4) / 0.6), H, ACCENT);
    return;
  }

  if (lt < 36) { // name card
    const s = lt - 24;
    bg(ctx, s < 0.5 ? ACCENT : INK);
    if (s >= 0.5) {
      // accent slab exits upward
      rect(ctx, 0, 0, W, H * (1 - ease.inOutExpo(clamp((s - 0.5) / 0.6))), ACCENT);
      const k = ease.outExpo(clamp((s - 0.7) / 0.8));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 760); ctx.clip();
      text(ctx, 'DELTON', 150, 640 + 500 * (1 - k), { size: 380, face: DISPLAY, weight: 900, color: PAPER, tracking: -12 });
      ctx.restore();
      const w = measure(ctx, 'DELTON', 380, DISPLAY, 900, -12);
      dot(ctx, 150 + w + 70, 600, (34 + 20 * pz) * pop(s, 1.4, 0.4), ACCENT);
      const q = ease.outExpo(clamp((s - 1.6) / 0.6));
      text(ctx, 'motion design studio', 156, 740, { size: 44, face: UI, weight: 600, color: PAPER, alpha: q });
      text(ctx, 'timing · type · shape · data · depth · systems · sound', 156, 800, { size: 32, face: UI, weight: 500, color: MUTE, alpha: q });
      rect(ctx, 150, 850, 1620 * ease.outExpo(clamp((s - 2.0) / 0.8)), 6, PAPER);
      if (s > 6) { const p = pop(s, 6, 0.5); ctx.save(); ctx.translate(156, 960); ctx.scale(p, p);
        text(ctx, "let's make something move.", 0, 0, { size: 60, face: DISPLAY, weight: 800, color: ACCENT, tracking: -2 }); ctx.restore(); }
    }
    return;
  }

  // 36–44: back to the point. heartbeat fades, final tick at 416 (lt 40), black after.
  bg(ctx, INK);
  const s = lt - 36;
  if (lt < 40) { const fade = 1 - s / 4; dot(ctx, cx, cy, (10 + 26 * pz) * fade + 6, ACCENT); }
  else if (lt < 40.15) dot(ctx, cx, cy, 6 + 60 * (1 - (lt - 40) / 0.15), PAPER);
});
