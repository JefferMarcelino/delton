'use strict';
// 76–136  chapter 02: Type. Kinetic words, letter waves, weight, tracking, masks, rings.
scene('type', 76, 136, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '02', 'Type', 'words that move like they mean it', true); cardExit(ctx, lt, 4, PAPER); return; }
  bg(ctx, PAPER);
  const pz = pulse(t, 8);
  const b = beat(t);

  if (lt < 12) { // typographic poster: words land on beats
    const s = lt - 4;
    const sets = [
      [['Say', 240, 150, 300], ['less.', 420, 150, 560], ['Move', 110, 440, 300], ['more.', 420, 440, 440]],
      [['Every', 140, 150, 300], ['letter', 330, 150, 440], ['is a', 180, 420, 160], ['character.', 330, 420, 410]],
    ];
    const si = s < 4 ? 0 : 1; const ss = s - si * 4; const set = sets[si];
    set.forEach(([w, size, y, x], i) => {
      const st = i * 0.5; if (ss < st) return;
      const k = pop(ss, st, 0.4);
      ctx.save(); ctx.translate(x, y + size * 0.9); ctx.scale(k, k);
      text(ctx, w, 0, 0, { size, face: DISPLAY, weight: 900, color: i === set.length - 1 ? ACCENT : INK, tracking: -size * 0.03 });
      ctx.restore();
    });
    // underline sweeps across after the last word
    rect(ctx, 150, 860, 1620 * ease.outExpo(clamp((ss - 2.2) / 0.6)), 10, INK);
    if (ss > 3.6) rect(ctx, 0, 0, W, H * ease.inExpo((ss - 3.6) / 0.4), PAPER);
    return;
  }

  if (lt < 20) { // alphabet grid wave; MOTION lights up
    const s = lt - 12;
    const cols = 13, rows = 4, size = 90, gx = 128, gy = 180, x0 = (W - (cols - 1) * gx) / 2, y0 = 300;
    const word = 'MOTION'; const target = [];
    for (let i = 0; i < 26; i++) {
      const c = String.fromCharCode(65 + i); const col = i % cols, row = Math.floor(i / cols);
      const x = x0 + col * gx, y = y0 + row * gy;
      const wave = Math.sin(s * 3 - col * 0.5 - row * 0.9);
      const flip = Math.abs(wave) < 0.15 ? 0.15 : Math.abs(wave);
      const hot = word.includes(c) && s > 3;
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(flip, 0.08), 1);
      text(ctx, c, 0, 0, { size, face: DISPLAY, weight: 800, color: hot ? ACCENT : INK, align: 'center', baseline: 'middle' });
      ctx.restore();
      if (hot) target.push(x);
    }
    if (s > 5) { // letters of MOTION re-assemble as a word at the bottom
      const p = ease.outExpo(clamp((s - 5) / 0.8));
      ctx.save(); ctx.translate(0, 0);
      text(ctx, 'MOTION', W / 2, 960 + 200 * (1 - p), { size: 220, face: DISPLAY, weight: 900, color: ACCENT, align: 'center', tracking: 8 + 80 * (1 - p), alpha: p });
      ctx.restore();
    }
    return;
  }

  if (lt < 28) { // kinetic paragraph, 8th-note word entries in 3 columns
    const s = lt - 20;
    const words = 'a word on its own is a sign . in motion it becomes a voice . pace is tone . pause is breath . weight is volume'.split(' ');
    const cols = 3, cw = 540, x0 = 160, y0 = 260, lh = 118;
    words.forEach((w, i) => {
      const st = i * 0.25; if (s < st) return;
      const p = ease.outExpo(clamp((s - st) / 0.45));
      const col = i % cols, row = Math.floor(i / cols);
      const dir = row % 2 ? -1 : 1;
      const x = x0 + col * cw + dir * 300 * (1 - p), y = y0 + row * lh;
      const isPunct = w === '.';
      if (isPunct) { dot(ctx, x + 20, y - 20, 18 + 10 * pz, ACCENT); return; }
      text(ctx, w, x, y, { size: 78, face: DISPLAY, weight: 800, color: INK, alpha: p, tracking: -2 });
    });
    if (s > 6.2) rect(ctx, 0, 0, W * ease.inExpo((s - 6.2) / 0.5), H, INK);
    return;
  }

  if (lt < 36) { // weight + tracking: variable font driven by the beat
    const s = lt - 28;
    bg(ctx, INK);
    if (s < 4) {
      const wgt = Math.round(lerp(300, 900, pz));
      text(ctx, 'WEIGHT', W / 2, 640, { size: 300, face: DISPLAY, weight: wgt, color: PAPER, align: 'center', tracking: -8 });
      text(ctx, 'font-weight: ' + wgt, W / 2, 780, { size: 36, face: UI, weight: 500, color: ACCENT, align: 'center' });
    } else {
      const tr = lerp(-10, 120, Math.pow(pz, 1.5)) ;
      text(ctx, 'TRACKING', W / 2, 640, { size: 230, face: DISPLAY, weight: 800, color: PAPER, align: 'center', tracking: tr });
      text(ctx, 'letter-spacing: ' + tr.toFixed(0) + 'px', W / 2, 780, { size: 36, face: UI, weight: 500, color: ACCENT, align: 'center' });
    }
    // beat ticks
    for (let i = 0; i < 4; i++) dot(ctx, W / 2 - 90 + i * 60, 880, i === b.beatInBar ? 14 : 7, i === b.beatInBar ? ACCENT : MUTE);
    return;
  }

  if (lt < 44) { // masked stripes reveal
    const s = lt - 36;
    bg(ctx, INK);
    const words = ['MASK', 'SLICE', 'REVEAL']; const wi = Math.min(Math.floor(s / 2.67), 2); const ws = s - wi * 2.67;
    const stripes = 14, sh = H / stripes;
    for (let i = 0; i < stripes; i++) {
      const dir = i % 2 ? 1 : -1; const d = 0.05 * i;
      const p = ease.outExpo(clamp((ws - d) / 0.6)); const q = ease.inExpo(clamp((ws - 1.9 - d) / 0.5));
      ctx.save(); ctx.beginPath(); ctx.rect(0, i * sh, W, sh + 1); ctx.clip();
      ctx.translate(dir * W * (1 - p) + dir * W * q, 0);
      rect(ctx, 0, i * sh, W, sh + 1, i % 2 ? ACCENT : PAPER);
      text(ctx, words[wi], W / 2, H / 2 + 170, { size: 520, face: DISPLAY, weight: 900, color: INK, align: 'center', tracking: -12 });
      ctx.restore();
    }
    return;
  }

  if (lt < 52) { // type rings
    const s = lt - 44;
    bg(ctx, PAPER);
    const cx = W / 2, cy = H / 2;
    const zoom = 1 + 0.25 * accent(t, 3) + 0.6 * ease.inExpo(clamp((s - 6.5) / 1.5));
    ctx.save(); ctx.translate(cx, cy); ctx.scale(zoom, zoom);
    const rings = [[330, 'MOTION · DESIGN · ', 1, 86], [470, 'TIMING · TYPE · SHAPE · DATA · DEPTH · SYSTEMS · ', -0.6, 64], [610, 'EVERYTHING STARTS WITH A POINT · ', 0.4, 64]];
    rings.forEach(([r, str, spd, size], ri) => {
      const chars = [...str]; const n = chars.length; const rot = s * spd * 0.6;
      chars.forEach((c, i) => {
        const a = rot + i / n * TAU;
        ctx.save(); ctx.rotate(a); ctx.translate(0, -r);
        text(ctx, c, 0, 0, { size, face: ri === 0 ? DISPLAY : UI, weight: ri === 0 ? 800 : 600, color: ri === 1 ? ACCENT : INK, align: 'center', baseline: 'middle' });
        ctx.restore();
      });
    });
    dot(ctx, 0, 0, 40 + 60 * pz, ACCENT);
    ctx.restore();
    return;
  }

  // 52–60: the big word, then it shrinks to a point
  const s = lt - 52;
  bg(ctx, PAPER);
  const k = ease.outBack(clamp(s / 0.5));
  const shrink = ease.inExpo(clamp((s - 6.6) / 1.0));
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k * (1 - shrink), k * (1 - shrink));
  text(ctx, 'type.', 0, 120, { size: 440, face: DISPLAY, weight: 900, color: INK, align: 'center', tracking: -14 });
  ctx.restore();
  // ticking sub-line: alternating captions every bar
  const caps = ['say it with rhythm', 'let the pause speak', 'weight is volume', 'end on a point'];
  const ci = Math.floor(s / 2) % caps.length; const cp = ease.outExpo(clamp((s % 2) / 0.4));
  text(ctx, caps[ci], W / 2, 900, { size: 40, face: UI, weight: 600, color: ACCENT, align: 'center', alpha: cp * (1 - shrink) });
  if (shrink > 0) dot(ctx, W / 2, H / 2, 10 + 30 * shrink, ACCENT);
});
