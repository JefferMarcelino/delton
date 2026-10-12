'use strict';
// 16–76  chapter 01: Timing. Easing, graph editor, squash & stretch, overlap, frame rate, duration.
scene('timing', 16, 76, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '01', 'Timing', 'ease · overshoot · offset · duration'); cardExit(ctx, lt, 4, INK); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const b = beat(t);

  if (lt < 12) { // easing race, cycles every 2 bars (4s)
    const s = lt - 4; const cyc = s % 4; const lanes = [
      ['linear', ease.linear], ['ease in', ease.inCubic], ['ease out', ease.outCubic],
      ['in-out', ease.inOutCubic], ['back', ease.outBack], ['elastic', ease.outElastic], ['bounce', ease.outBounce]];
    const x0 = 420, x1 = W - 160, top = 150, gap = 118;
    const p = clamp(cyc / 2.0); // travel 2s, then hold/reset
    text(ctx, 'same distance. same time.', 160, 100, { size: 34, face: UI, weight: 600, color: MUTE });
    lanes.forEach(([name, fn], i) => {
      const y = top + i * gap + 40;
      line(ctx, x0, y, x1, y, 2, '#26262B');
      // ghost trail: positions at previous 16 ticks
      for (let k = 1; k <= 14; k++) { const pp = clamp(p - k * 0.03); if (pp <= 0) break; dot(ctx, lerp(x0, x1, fn(pp)), y, 9 - k * 0.5, withAlpha(PAPER, 0.18)); }
      const x = lerp(x0, x1, fn(p));
      dot(ctx, x, y, 20, i === Math.floor(cyc * 2) % 7 ? ACCENT : PAPER);
      text(ctx, name, 160, y + 12, { size: 34, face: UI, weight: 600, color: PAPER });
    });
    // reset wipe each cycle
    if (cyc > 3.6) rect(ctx, 0, 0, W * ease.inExpo((cyc - 3.6) / 0.4), H, INK);
    return;
  }

  if (lt < 20) { // graph editor
    const s = lt - 12;
    const presets = [[0.25, 0.1, 0.25, 1], [0.7, 0, 0.2, 1], [0.34, 1.56, 0.64, 1], [0.9, 0, 0.1, 1], [0.6, -0.5, 0.3, 1.6], [0.16, 1, 0.3, 1]];
    const names = ['ease', 'swift', 'overshoot', 'snap', 'wobble', 'rush'];
    const idx = Math.floor(s / 1.0) % presets.length; const nxt = (idx + 1) % presets.length; const m = ease.inOutCubic(clamp((s % 1.0 - 0.6) / 0.4));
    const c = presets[idx].map((v, i) => lerp(v, presets[nxt][i], m));
    const gx = 260, gy = 920, gw = 1000, gh = 700;
    // grid
    for (let i = 0; i <= 10; i++) { line(ctx, gx + i * gw / 10, gy, gx + i * gw / 10, gy - gh, 1, '#222226'); line(ctx, gx, gy - i * gh / 10, gx + gw, gy - i * gh / 10, 1, '#222226'); }
    // curve
    ctx.strokeStyle = PAPER; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(gx, gy);
    ctx.bezierCurveTo(gx + c[0] * gw, gy - c[1] * gh, gx + c[2] * gw, gy - c[3] * gh, gx + gw, gy - gh); ctx.stroke();
    // handles
    line(ctx, gx, gy, gx + c[0] * gw, gy - c[1] * gh, 3, ACCENT); line(ctx, gx + gw, gy - gh, gx + c[2] * gw, gy - c[3] * gh, 3, ACCENT);
    dot(ctx, gx + c[0] * gw, gy - c[1] * gh, 16, ACCENT); dot(ctx, gx + c[2] * gw, gy - c[3] * gh, 16, ACCENT);
    dot(ctx, gx, gy, 12, PAPER); dot(ctx, gx + gw, gy - gh, 12, PAPER);
    // playhead and the object driven by the curve
    const fn = cubicBezier(c[0], c[1], c[2], c[3]);
    const ph = (s % 1.0); const v = fn(ph);
    line(ctx, gx + ph * gw, gy, gx + ph * gw, gy - gh, 2, withAlpha(ACCENT, 0.6));
    dot(ctx, gx + ph * gw, gy - v * gh, 14, PAPER);
    // right: a square rising with the value
    const rx = 1420, ry = gy - v * gh;
    rect(ctx, rx, ry - 70, 300, 140, ACCENT);
    text(ctx, names[idx], rx + 20, ry + 16, { size: 44, face: DISPLAY, weight: 800, color: INK });
    text(ctx, `cubic-bezier(${c.map(v => v.toFixed(2)).join(', ')})`, gx, 170, { size: 34, face: UI, weight: 500, color: MUTE });
    text(ctx, 'the curve is the character', gx, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 28) { // bouncing ball, squash & stretch, bounce period = one beat
    const s = lt - 20;
    const floor = 820; const amp = 520;
    const f = b.frac; const h = 1 - Math.pow(2 * f - 1, 2); // 0 at beats (contact), 1 at mid
    const x = 300 + (s / 8) * 1320;
    const y = floor - h * amp;
    const vy = -(2 * f - 1); // velocity sign proxy
    const contact = Math.exp(-Math.min(f, 1 - f) * 18); // near contact → squash
    const sx = 1 + 0.45 * contact - 0.18 * Math.abs(vy) * (1 - contact), sy = 1 - 0.45 * contact + 0.25 * Math.abs(vy) * (1 - contact);
    // ghost path
    for (let k = 0; k < 60; k++) { const tt = k / 60 * 8; const bb = beat(16 + 20 + tt); const hh = 1 - Math.pow(2 * bb.frac - 1, 2); dot(ctx, 300 + tt / 8 * 1320, floor - hh * amp, 4, withAlpha(PAPER, tt < s ? 0.35 : 0.08)); }
    line(ctx, 200, floor + 62, W - 200, floor + 62, 4, PAPER);
    // shadow
    ctx.fillStyle = withAlpha(PAPER, 0.25 * (1 - h) + 0.05); ctx.beginPath(); ctx.ellipse(x, floor + 60, 70 * (0.6 + 0.6 * (1 - h)), 12, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); dot(ctx, 0, 0, 62, ACCENT); ctx.restore();
    text(ctx, 'squash. stretch. land on the beat.', 160, 130, { size: 34, face: UI, weight: 600, color: PAPER });
    // beat ticks
    for (let i = 0; i < 16; i++) { const on = i === b.beatInBar + (b.bar % 4) * 4; dot(ctx, 1500 + (i % 8) * 36, 110 + Math.floor(i / 8) * 36, on ? 12 : 6, on ? ACCENT : MUTE); }
    return;
  }

  if (lt < 36) { // overlapping action: a chain follows a target with staggered delay
    const s = lt - 28;
    const n = 16; const tx = W / 2 + Math.sin(s * 1.4) * 600 * (1 - 0.4 * Math.cos(s * 0.5)), ty = H / 2 + Math.cos(s * 2.2) * 260;
    const d = 0.11;
    let px = tx, py = ty;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const tt = s - i * d; const x = W / 2 + Math.sin(tt * 1.4) * 600 * (1 - 0.4 * Math.cos(tt * 0.5)), y = H / 2 + Math.cos(tt * 2.2) * 260; pts.push([x, y]);
    }
    ctx.strokeStyle = withAlpha(PAPER, 0.5); ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    pts.forEach((p, i) => dot(ctx, p[0], p[1], 44 - i * 2.4, i === 0 ? ACCENT : mixColor(PAPER, INK, i / n * 0.8)));
    text(ctx, 'follow-through: each one is late by ' + Math.round(d * 1000) + ' ms', 160, 130, { size: 34, face: UI, weight: 600, color: PAPER });
    // a second echo variation after 4 s: show delay number changing
    return;
  }

  if (lt < 44) { // frame rate: same motion quantized at 6, 12, 24, 60 fps
    const s = lt - 36;
    const rates = [6, 12, 24, 60];
    const x0 = 420, x1 = W - 160;
    text(ctx, 'frame rate is a feeling', 160, 110, { size: 34, face: UI, weight: 600, color: PAPER });
    rates.forEach((fps, i) => {
      const y = 260 + i * 200;
      const tq = quant(s, fps) % 2; const p = ease.inOutCubic(tq / 2);
      line(ctx, x0, y, x1, y, 2, '#26262B');
      // frame ticks
      const ticks = Math.min(fps * 2, 120); for (let k = 0; k <= ticks; k++) line(ctx, lerp(x0, x1, k / ticks), y - 12, lerp(x0, x1, k / ticks), y + 12, 1, '#3A3A40');
      const x = lerp(x0, x1, p);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p * TAU); rect(ctx, -46, -46, 92, 92, i === 3 ? ACCENT : PAPER); ctx.restore();
      text(ctx, fps + ' fps', 160, y + 14, { size: 44, face: DISPLAY, weight: 800, color: PAPER });
    });
    return;
  }

  if (lt < 52) { // duration = emotion. same move, 3 durations
    const s = lt - 44;
    const cols = [['snappy', 0.25], ['natural', 0.8], ['dramatic', 2.6]];
    text(ctx, 'same move. three moods.', 160, 110, { size: 34, face: UI, weight: 600, color: PAPER });
    cols.forEach(([name, dur], i) => {
      const cx = 400 + i * 560, top = 260, bot = 880;
      const period = 4; const ph = s % period; const p = ease.inOutQuart(clamp(ph / dur)); const back = ease.inOutQuart(clamp((ph - 2) / dur));
      const y = lerp(top, bot, p - back);
      line(ctx, cx, top, cx, bot, 2, '#26262B');
      rect(ctx, cx - 130, y - 60, 260, 120, i === 1 ? ACCENT : PAPER);
      text(ctx, name, cx, 990, { size: 44, face: DISPLAY, weight: 800, color: PAPER, align: 'center' });
      text(ctx, dur * 1000 + ' ms', cx, 1040, { size: 30, face: UI, weight: 500, color: MUTE, align: 'center' });
    });
    return;
  }

  // 52–60: metronome finale — a pendulum swings per beat, dots stack into a bar graph of the timeline, then collapse
  const s = lt - 52;
  const cx = W / 2, top = 180;
  const sw = (b.i % 2 ? 1 : -1) * (1 - 2 * ease.inOutQuad(b.frac));
  const a = sw * 0.55;
  line(ctx, cx, top, cx + Math.sin(a) * 640, top + Math.cos(a) * 640, 10, PAPER);
  dot(ctx, cx + Math.sin(a) * 640, top + Math.cos(a) * 640, 54 + 10 * pz, ACCENT);
  dot(ctx, cx, top, 18, PAPER);
  // beat markers accumulate across the bottom
  const nb = Math.min(Math.floor(s / 0.5) + 1, 16);
  for (let i = 0; i < nb; i++) { const hgt = 40 + (i % 4 === 0 ? 120 : 50); rect(ctx, 300 + i * 84, 960 - hgt, 44, hgt, i % 4 === 0 ? ACCENT : PAPER); }
  text(ctx, '120 bpm', 160, 110, { size: 34, face: UI, weight: 600, color: PAPER });
  text(ctx, String(Math.max(b.i, 0)).padStart(4, '0'), W - 160, 110, { size: 34, face: UI, weight: 600, color: MUTE, align: 'right' });
  const col = ease.inExpo(clamp((s - 7.3) / 0.7));
  if (col > 0) { bg(ctx, INK); dot(ctx, cx, H / 2, 10 + 400 * col, ACCENT); }
});
