'use strict';
// 316–376  chapter 06: Systems. Flow field, boids, life, harmonograph, rope, swarm.
// Simulations are precomputed once at load from fixed seeds; seek() only reads tables.
const SIM_FPS = 60, SIM_LEN = 8; // seconds per sub-scene
const SIM_N = SIM_FPS * SIM_LEN;

// ---- flow field ----
const FLOW_P = 1600;
const FLOW = (() => {
  const r = mulberry32(601); const x = new Float32Array(FLOW_P * SIM_N), y = new Float32Array(FLOW_P * SIM_N);
  const px = new Float32Array(FLOW_P), py = new Float32Array(FLOW_P);
  for (let i = 0; i < FLOW_P; i++) { px[i] = r() * W; py[i] = r() * H; }
  for (let s = 0; s < SIM_N; s++) {
    const tt = s / SIM_FPS;
    for (let i = 0; i < FLOW_P; i++) {
      const a = fbm(px[i] * 0.0012, py[i] * 0.0012, tt * 0.15, 3, 31) * TAU * 2.2;
      const spd = 2.6 + 2.0 * fbm(px[i] * 0.003, py[i] * 0.003, 0, 2, 32);
      px[i] += Math.cos(a) * spd; py[i] += Math.sin(a) * spd;
      if (px[i] < 0) px[i] += W; if (px[i] >= W) px[i] -= W; if (py[i] < 0) py[i] += H; if (py[i] >= H) py[i] -= H;
      x[s * FLOW_P + i] = px[i]; y[s * FLOW_P + i] = py[i];
    }
  }
  return { x, y };
})();

// ---- boids ----
const BOID_N = 160;
const BOIDS = (() => {
  const r = mulberry32(602); const X = new Float32Array(BOID_N * SIM_N), Y = new Float32Array(BOID_N * SIM_N), A = new Float32Array(BOID_N * SIM_N);
  const px = [], py = [], vx = [], vy = [];
  for (let i = 0; i < BOID_N; i++) { px.push(r() * W); py.push(r() * H); const a = r() * TAU; vx.push(Math.cos(a) * 4); vy.push(Math.sin(a) * 4); }
  for (let s = 0; s < SIM_N; s++) {
    const tt = s / SIM_FPS; const ax = W / 2 + Math.sin(tt * 0.5) * 500, ay = H / 2 + Math.cos(tt * 0.8) * 250;
    for (let i = 0; i < BOID_N; i++) {
      let cx = 0, cy = 0, n = 0, sx = 0, sy = 0, avx = 0, avy = 0;
      for (let j = 0; j < BOID_N; j++) { if (i === j) continue; const dx = px[j] - px[i], dy = py[j] - py[i]; const d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150) { cx += px[j]; cy += py[j]; avx += vx[j]; avy += vy[j]; n++; if (d2 < 40 * 40) { sx -= dx; sy -= dy; } } }
      if (n) { cx /= n; cy /= n; vx[i] += (cx - px[i]) * 0.004 + (avx / n - vx[i]) * 0.05; vy[i] += (cy - py[i]) * 0.004 + (avy / n - vy[i]) * 0.05; }
      vx[i] += sx * 0.03 + (ax - px[i]) * 0.0015; vy[i] += sy * 0.03 + (ay - py[i]) * 0.0015;
      const sp = Math.hypot(vx[i], vy[i]); const mx = 6.5; if (sp > mx) { vx[i] *= mx / sp; vy[i] *= mx / sp; } if (sp < 2.5) { vx[i] *= 2.5 / (sp || 1); vy[i] *= 2.5 / (sp || 1); }
      px[i] += vx[i]; py[i] += vy[i];
      X[s * BOID_N + i] = px[i]; Y[s * BOID_N + i] = py[i]; A[s * BOID_N + i] = Math.atan2(vy[i], vx[i]);
    }
  }
  return { X, Y, A };
})();

// ---- game of life ----
const LIFE_C = 64, LIFE_R = 36, LIFE_GEN = 72;
const LIFE = (() => {
  const r = mulberry32(603); let g = new Uint8Array(LIFE_C * LIFE_R);
  for (let i = 0; i < g.length; i++) g[i] = r() < 0.28 ? 1 : 0;
  // stamp a few gliders and an r-pentomino for interest
  const stamp = (x, y, pat) => pat.forEach(([dx, dy]) => { g[mod(y + dy, LIFE_R) * LIFE_C + mod(x + dx, LIFE_C)] = 1; });
  stamp(5, 5, [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]]); stamp(50, 28, [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]]); stamp(32, 18, [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]);
  const gens = [g];
  for (let k = 1; k < LIFE_GEN; k++) { const p = gens[k - 1]; const q = new Uint8Array(p.length);
    for (let y = 0; y < LIFE_R; y++) for (let x = 0; x < LIFE_C; x++) { let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; n += p[mod(y + dy, LIFE_R) * LIFE_C + mod(x + dx, LIFE_C)]; }
      const a = p[y * LIFE_C + x]; q[y * LIFE_C + x] = (a && (n === 2 || n === 3)) || (!a && n === 3) ? 1 : 0; }
    gens.push(q); }
  return gens;
})();

// ---- rope (verlet chain) ----
const ROPE_N = 42, ROPE_FPS = 120;
const ROPE = (() => {
  const steps = ROPE_FPS * SIM_LEN; const X = new Float32Array(ROPE_N * steps), Y = new Float32Array(ROPE_N * steps);
  const px = [], py = [], ox = [], oy = []; const seg = 22;
  for (let i = 0; i < ROPE_N; i++) { px.push(W / 2); py.push(200 + i * seg); ox.push(px[i]); oy.push(py[i]); }
  for (let s = 0; s < steps; s++) {
    const tt = s / ROPE_FPS; const ax = W / 2 + Math.sin(tt * 1.3) * 520 + Math.sin(tt * 4.1) * 80, ay = 200 + Math.sin(tt * 0.9) * 90;
    for (let i = 1; i < ROPE_N; i++) { const vx = (px[i] - ox[i]) * 0.985, vy = (py[i] - oy[i]) * 0.985; ox[i] = px[i]; oy[i] = py[i]; px[i] += vx; py[i] += vy + 0.45; }
    px[0] = ax; py[0] = ay;
    for (let it = 0; it < 12; it++) for (let i = 0; i < ROPE_N - 1; i++) { const dx = px[i + 1] - px[i], dy = py[i + 1] - py[i]; const d = Math.hypot(dx, dy) || 1; const diff = (d - seg) / d * 0.5;
      if (i) { px[i] += dx * diff; py[i] += dy * diff; } px[i + 1] -= dx * diff * (i ? 1 : 2); py[i + 1] -= dy * diff * (i ? 1 : 2); }
    for (let i = 0; i < ROPE_N; i++) { X[s * ROPE_N + i] = px[i]; Y[s * ROPE_N + i] = py[i]; }
  }
  return { X, Y, steps };
})();

// ---- swarm attracted to a beat-driven point ----
const SWARM_N = 900;
const SWARM = (() => {
  const r = mulberry32(604); const X = new Float32Array(SWARM_N * SIM_N), Y = new Float32Array(SWARM_N * SIM_N);
  const px = [], py = [], vx = [], vy = [];
  for (let i = 0; i < SWARM_N; i++) { px.push(r() * W); py.push(r() * H); vx.push(0); vy.push(0); }
  for (let s = 0; s < SIM_N; s++) {
    const tt = s / SIM_FPS; const k = Math.floor(tt * 2); const ax = W / 2 + (hash(k, 1) - 0.5) * 1100, ay = H / 2 + (hash(k, 2) - 0.5) * 600;
    for (let i = 0; i < SWARM_N; i++) {
      const dx = ax - px[i], dy = ay - py[i]; const d = Math.hypot(dx, dy) + 1; const f = 0.9 / Math.max(d / 200, 0.4);
      vx[i] = (vx[i] + dx / d * f + (hash(i, s) - 0.5) * 1.2) * 0.95; vy[i] = (vy[i] + dy / d * f + (hash(i, s + 9) - 0.5) * 1.2) * 0.95;
      // swirl
      vx[i] += -dy / d * 0.45; vy[i] += dx / d * 0.45;
      px[i] += vx[i]; py[i] += vy[i]; X[s * SWARM_N + i] = px[i]; Y[s * SWARM_N + i] = py[i];
    }
  }
  return { X, Y };
})();

scene('systems', 316, 376, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '06', 'Systems', 'simple rules · complex behaviour'); cardExit(ctx, lt, 4, INK); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const b = beat(t);
  const cx = W / 2, cy = H / 2;

  if (lt < 12) { // flow field with trails
    const s = lt - 4; const fi = Math.min(Math.floor(s * SIM_FPS), SIM_N - 1);
    const trail = 10;
    ctx.lineWidth = 2.5;
    for (let i = 0; i < FLOW_P; i++) {
      ctx.strokeStyle = i % 17 === 0 ? ACCENT : withAlpha(PAPER, 0.75); ctx.beginPath(); let started = false;
      for (let k = trail; k >= 0; k--) { const f = fi - k; if (f < 0) continue; const x = FLOW.x[f * FLOW_P + i], y = FLOW.y[f * FLOW_P + i];
        if (started) { const px2 = FLOW.x[(f - 1) * FLOW_P + i], py2 = FLOW.y[(f - 1) * FLOW_P + i]; if (Math.abs(x - px2) > 200 || Math.abs(y - py2) > 200) { ctx.stroke(); ctx.beginPath(); ctx.moveTo(x, y); continue; } ctx.lineTo(x, y); } else { ctx.moveTo(x, y); started = true; } }
      ctx.stroke();
    }
    text(ctx, FLOW_P + ' particles · one vector field', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 20) { // boids
    const s = lt - 12; const fi = Math.min(Math.floor(s * SIM_FPS), SIM_N - 1);
    for (let i = 0; i < BOID_N; i++) { const x = BOIDS.X[fi * BOID_N + i], y = BOIDS.Y[fi * BOID_N + i], a = BOIDS.A[fi * BOID_N + i];
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); const sz = 16 + 6 * pz; poly(ctx, [[sz, 0], [-sz * 0.8, sz * 0.6], [-sz * 0.4, 0], [-sz * 0.8, -sz * 0.6]], i % 13 === 0 ? ACCENT : PAPER); ctx.restore(); }
    text(ctx, BOID_N + ' boids · separation · alignment · cohesion', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 28) { // life: one generation per 8th note
    const s = lt - 20; const gen = Math.min(Math.floor(s * 8), LIFE_GEN - 1); const since = (s * 8) % 1;
    const cw = W / LIFE_C, chh = (H - 160) / LIFE_R; const y0 = 160;
    const g = LIFE[gen], prev = LIFE[Math.max(gen - 1, 0)];
    for (let y = 0; y < LIFE_R; y++) for (let x = 0; x < LIFE_C; x++) { const i = y * LIFE_C + x; if (!g[i] && !prev[i]) continue;
      const born = g[i] && !prev[i], died = !g[i] && prev[i]; const k = born ? ease.outBack(clamp(since / 0.4)) : died ? 1 - ease.inCubic(clamp(since / 0.3)) : 1;
      const sz = Math.min(cw, chh) * 0.8 * k; if (sz <= 0) continue;
      rect(ctx, x * cw + cw / 2 - sz / 2, y0 + y * chh + chh / 2 - sz / 2, sz, sz, born ? ACCENT : PAPER); }
    text(ctx, 'life · generation ' + String(gen).padStart(2, '0'), 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 36) { // harmonograph
    const s = lt - 28;
    const curves = [[3, 2, 0.5, 1.0], [5, 4, 0.0, 1.0], [7, 3, 1.2, 0.6], [2, 5, 0.3, 0.9]]; const ci = Math.floor(s / 2) % curves.length; const cs = s % 2;
    const [fa, fb, ph, decay] = curves[ci];
    const n = Math.floor(ease.outQuad(clamp(cs / 1.6)) * 1800);
    ctx.strokeStyle = PAPER; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= n; i++) { const u = i / 1800 * TAU * 6; const d = Math.exp(-u * 0.05 * decay); const x = cx + Math.sin(fa * u + ph) * 460 * d + Math.sin(u * 1.3) * 60 * d, y = cy + Math.sin(fb * u) * 380 * d; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    { const u = n / 1800 * TAU * 6; const d = Math.exp(-u * 0.05 * decay); dot(ctx, cx + Math.sin(fa * u + ph) * 460 * d + Math.sin(u * 1.3) * 60 * d, cy + Math.sin(fb * u) * 380 * d, 16 + 10 * pz, ACCENT); }
    text(ctx, 'harmonograph · ' + fa + ':' + fb, 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 44) { // rope
    const s = lt - 36; const fi = Math.min(Math.floor(s * ROPE_FPS), ROPE.steps - 1);
    ctx.strokeStyle = PAPER; ctx.lineWidth = 14; ctx.beginPath();
    for (let i = 0; i < ROPE_N; i++) { const x = ROPE.X[fi * ROPE_N + i], y = ROPE.Y[fi * ROPE_N + i]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    for (let i = 0; i < ROPE_N; i += 6) dot(ctx, ROPE.X[fi * ROPE_N + i], ROPE.Y[fi * ROPE_N + i], 12, ACCENT);
    dot(ctx, ROPE.X[fi * ROPE_N + ROPE_N - 1], ROPE.Y[fi * ROPE_N + ROPE_N - 1], 40 + 14 * pz, ACCENT);
    dot(ctx, ROPE.X[fi * ROPE_N], ROPE.Y[fi * ROPE_N], 18, PAPER);
    text(ctx, 'verlet chain · ' + ROPE_N + ' links · ' + ROPE_FPS + ' hz', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 52) { // swarm + bending grid
    const s = lt - 44; const fi = Math.min(Math.floor(s * SIM_FPS), SIM_N - 1);
    const k = Math.floor(s * 2); const ax = W / 2 + (hash(k, 1) - 0.5) * 1100, ay = H / 2 + (hash(k, 2) - 0.5) * 600;
    // grid lines bend toward the attractor
    ctx.strokeStyle = withAlpha(PAPER, 0.22); ctx.lineWidth = 1.5;
    for (let gx = 0; gx <= W; gx += 80) { ctx.beginPath(); for (let gy = 0; gy <= H; gy += 20) { const dx = ax - gx, dy = ay - gy; const d = Math.hypot(dx, dy) + 1; const f = 9000 / d; ctx.lineTo(gx + dx / d * f, gy + dy / d * f); } ctx.stroke(); }
    for (let gy = 0; gy <= H; gy += 80) { ctx.beginPath(); for (let gx = 0; gx <= W; gx += 20) { const dx = ax - gx, dy = ay - gy; const d = Math.hypot(dx, dy) + 1; const f = 9000 / d; ctx.lineTo(gx + dx / d * f, gy + dy / d * f); } ctx.stroke(); }
    for (let i = 0; i < SWARM_N; i++) dot(ctx, SWARM.X[fi * SWARM_N + i], SWARM.Y[fi * SWARM_N + i], 4.5, i % 9 === 0 ? ACCENT : PAPER);
    dot(ctx, ax, ay, 24 + 30 * pz, ACCENT);
    text(ctx, SWARM_N + ' agents · one attractor · gravity + swirl', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  // 52–60: everything converges — particles from the flow field fall into the point
  const s = lt - 52; const fi = Math.min(Math.floor(((s * 0.5) % SIM_LEN) * SIM_FPS), SIM_N - 1);
  const col = ease.inOutExpo(clamp((s - 3) / 4));
  for (let i = 0; i < FLOW_P; i++) { const x = FLOW.x[fi * FLOW_P + i], y = FLOW.y[fi * FLOW_P + i]; const sp = 1 - Math.pow(1 - col, 1 + hash(i, 5) * 3); dot(ctx, lerp(x, cx, sp), lerp(y, cy, sp), 4 + 3 * pz, i % 17 === 0 ? ACCENT : PAPER); }
  dot(ctx, cx, cy, 10 + 60 * col + 20 * pz, ACCENT);
  text(ctx, 'and all of it comes back to a point', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER, alpha: 1 - col });
  if (s > 7.4) { bg(ctx, PAPER); dot(ctx, cx, cy, 20 + 70 * pz, ACCENT); }
});
