'use strict';
// 0–16  prologue: a point. words. the point multiplies into a grid, then collapses.
scene('intro', 0, 16, (ctx, t) => {
  bg(ctx, INK);
  const cx = W / 2, cy = H / 2;
  const pz = pulse(t, 7);
  if (t < 8) {
    // words land one per beat, from 4s. The dot becomes the period of "point."
    const words = ['everything', 'starts', 'with', 'a', 'point'];
    const wi = Math.floor((t - 4) / 0.5);
    if (t >= 4 && wi < words.length) {
      const w = words[wi]; const lt = (t - 4) - wi * 0.5;
      const s = 0.92 + 0.08 * ease.outExpo(clamp(lt / 0.2));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      text(ctx, w, 0, 60, { size: 170, face: DISPLAY, weight: 900, color: PAPER, align: 'center', tracking: -4 });
      ctx.restore();
    }
    if (t >= 6.5) {
      // "point" stays; dot moves to its period position
      const lt = t - 6.5;
      const w = measure(ctx, 'point', 170, DISPLAY, 900, -4);
      const px = cx + w / 2 + 44, py = cy + 60 - 14;
      const m = ease.inOutExpo(clamp((lt - 0.1) / 0.4));
      text(ctx, 'point', cx, cy + 60, { size: 170, face: DISPLAY, weight: 900, color: PAPER, align: 'center', tracking: -4 });
      dot(ctx, lerp(cx, px, m), lerp(cy, py, m), 14 + 16 * pz, ACCENT);
      return;
    }
    // heartbeat dot
    const r = 8 + 26 * pz + 3 * smooth(t / 4);
    dot(ctx, cx, cy, r, ACCENT);
    return;
  }
  // 8–16: multiplication 1→2→4→…→ grid 16x9, then jitter, then collapse
  const n = Math.min(beatCount(t) - 16, 8); // beats since t=8 (beat 16)
  const cols = 16, rows = 9;
  const total = Math.min(1 << Math.max(n, 0), cols * rows);
  const gx = 96, gy = 100; // grid spacing
  const since = beat(t).since;
  const collapse = ease.inExpo(clamp((t - 15.0) / 1.0));
  const jit = clamp((t - 12) / 4) * 40;
  for (let i = 0; i < total; i++) {
    // order: fill from center outward
    const ox = (i % cols) - (cols - 1) / 2, oy = Math.floor(i / cols) - (rows - 1) / 2;
    let x = cx + ox * gx, y = cy + oy * gy;
    const jx = (noise2(i * 0.37, t * 3, 1) - 0.5) * 2 * jit, jy = (noise2(i * 0.53, t * 3, 2) - 0.5) * 2 * jit;
    x += jx; y += jy;
    x = lerp(x, cx, collapse); y = lerp(y, cy, collapse);
    const born = i < (total >> 1) ? 1 : ease.outBack(clamp(since / 0.25));
    dot(ctx, x, y, (10 + 14 * pz * (i === 0 ? 1 : 0.4)) * born * (1 - collapse * 0.5), i === 0 ? ACCENT : PAPER);
  }
  if (t > 15.6) dot(ctx, cx, cy, 20 + 300 * ease.inExpo((t - 15.6) / 0.4), ACCENT);
});
