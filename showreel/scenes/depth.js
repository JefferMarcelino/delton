'use strict';
// 256–316  chapter 05: Depth. Wireframe cube → lattice, point sphere, torus, terrain, extruded type, ring tunnel.
const FIB = Array.from({ length: 900 }, (_, i) => { const y = 1 - (i / 899) * 2; const r = Math.sqrt(1 - y * y); const th = i * 2.399963; return [Math.cos(th) * r, y, Math.sin(th) * r]; });
const CUBE_V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const CUBE_E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];

function drawCube(ctx, center, size, rx, ry, dist, color, w) {
  const P = CUBE_V.map(v => { let p = [v[0] * size + center[0], v[1] * size + center[1], v[2] * size + center[2]]; p = rotY(p, ry); p = rotX(p, rx); return project(p, dist); });
  CUBE_E.forEach(([a, b]) => line(ctx, P[a][0], P[a][1], P[b][0], P[b][1], w * (P[a][2] + P[b][2]) / 2 / 150, color));
  return P;
}

scene('depth', 256, 316, (ctx, t, lt) => {
  if (lt < 4) { chapterCard(ctx, lt, '05', 'Depth', 'the flat screen is a lie we agree on'); cardExit(ctx, lt, 4, INK); return; }
  bg(ctx, INK);
  const pz = pulse(t, 8);
  const b = beat(t);
  const cx = W / 2, cy = H / 2;

  if (lt < 12) { // cube → lattice
    const s = lt - 4;
    const rx = 0.5 + s * 0.3, ry = s * 0.7;
    if (s < 3) { drawCube(ctx, [0, 0, 0], 1.2, rx, ry, 5, PAPER, 6);
      // corner dots
      const P = CUBE_V.map(v => { let p = [v[0] * 1.2, v[1] * 1.2, v[2] * 1.2]; p = rotY(p, ry); p = rotX(p, rx); return project(p, 5); }); P.forEach(p => dot(ctx, p[0], p[1], 10 * p[2] / 150, ACCENT)); }
    else {
      const split = ease.outBack(clamp((s - 3) / 0.8)); const gap = (0.85 + 0.4 * pz) * split;
      const cubes = [];
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) cubes.push([i, j, k]);
      // draw far first
      cubes.map(c => { let p = [c[0] * gap, c[1] * gap, c[2] * gap]; p = rotY(p, ry); p = rotX(p, rx); return { c, z: p[2] }; }).sort((a, b2) => b2.z - a.z)
        .forEach(({ c }) => { const far = c[0] === 0 && c[1] === 0 && c[2] === 0; drawCube(ctx, [c[0] * gap, c[1] * gap, c[2] * gap], 0.36 * (1 - 0.6 * (1 - split)) + 0.1 * pz * (far ? 1 : 0), rx, ry, 5.5, far ? ACCENT : PAPER, 4); });
    }
    text(ctx, s < 3 ? '1 cube · 12 edges' : '27 cubes · 324 edges', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 20) { // point sphere + rings
    const s = lt - 12;
    const ry = s * 0.5, rx = 0.3 + Math.sin(s * 0.4) * 0.3; const R = 1.9 + 0.1 * pz;
    const pts = FIB.map(v => { let p = [v[0] * R, v[1] * R, v[2] * R]; p = rotY(p, ry); p = rotX(p, rx); return project(p, 5.5); }).sort((a, b2) => b2[3] - a[3]);
    pts.forEach((p, i) => dot(ctx, p[0], p[1], 7 * p[2] / 160, p[3] > 5.5 ? withAlpha(PAPER, 0.3) : (i % 23 === 0 ? ACCENT : PAPER)));
    // three orbit rings
    for (let k = 0; k < 3; k++) {
      ctx.strokeStyle = k === 1 ? ACCENT : PAPER; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU; let p = [Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6]; p = rotX(p, k * 1.05 + s * 0.3); p = rotZ(p, s * (0.3 + k * 0.2)); p = rotY(p, ry * 0.5); const q = project(p, 5.5); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.stroke();
    }
    text(ctx, FIB.length + ' points · fibonacci sphere', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 28) { // torus wireframe
    const s = lt - 20;
    const Rm = 1.6, rm = 0.6 + 0.08 * pz; const U = 36, V = 18;
    const rx = 1.0 + Math.sin(s * 0.5) * 0.5, ry = s * 0.6; const dist = 5.2 + Math.sin(s * 0.8) * 0.8;
    const grid = [];
    for (let i = 0; i < U; i++) { grid.push([]); for (let j = 0; j < V; j++) { const u = i / U * TAU, v = j / V * TAU; let p = [(Rm + rm * Math.cos(v)) * Math.cos(u), rm * Math.sin(v), (Rm + rm * Math.cos(v)) * Math.sin(u)]; p = rotY(p, ry); p = rotX(p, rx); grid[i].push(project(p, dist)); } }
    for (let i = 0; i < U; i++) for (let j = 0; j < V; j++) {
      const a = grid[i][j], b2 = grid[(i + 1) % U][j], c = grid[i][(j + 1) % V];
      const near = a[3] < dist; const col = (i % 9 === Math.floor(s * 4) % 9) ? ACCENT : (near ? PAPER : withAlpha(PAPER, 0.25));
      line(ctx, a[0], a[1], b2[0], b2[1], 2.5, col); line(ctx, a[0], a[1], c[0], c[1], 2.5, col);
    }
    text(ctx, 'torus · ' + (U * V) + ' vertices', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 36) { // terrain
    const s = lt - 28;
    const cols = 56, rows = 34; const sx = 0.16, sz = 0.16;
    const rx = 0.95, dist = 4.2;
    const rowsP = [];
    for (let j = 0; j < rows; j++) { rowsP.push([]); for (let i = 0; i < cols; i++) {
      const x = (i - cols / 2) * sx, z = (j - rows / 2) * sz; const h = (fbm(i * 0.09, j * 0.09 + s * 0.35, 0, 4, 21) - 0.5) * 1.8 * (1 + 0.25 * pz);
      let p = [x, -h + 0.4, z]; p = rotY(p, Math.sin(s * 0.2) * 0.3); p = rotX(p, rx); rowsP[j].push([...project(p, dist), h]); } }
    for (let j = rows - 1; j >= 0; j--) {
      ctx.beginPath(); rowsP[j].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
      // fill below the line with ink to occlude farther rows
      const last = rowsP[j][cols - 1], first = rowsP[j][0]; ctx.lineTo(last[0], H + 10); ctx.lineTo(first[0], H + 10); ctx.closePath(); ctx.fillStyle = INK; ctx.fill();
      ctx.strokeStyle = j % 6 === (Math.floor(s * 6) % 6) ? ACCENT : PAPER; ctx.lineWidth = 2 + 2 * (j / rows); ctx.beginPath(); rowsP[j].forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    }
    text(ctx, 'terrain · fbm · 4 octaves', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 44) { // extruded type
    const s = lt - 36;
    const words = ['DEPTH', 'LAYERS', 'STACK']; const wi = Math.min(Math.floor(s / 2.67), 2);
    const ang = s * 1.1; const dx = Math.cos(ang) * 4, dy = 1.6 + Math.sin(ang) * 1.2; const n = 44 + Math.floor(24 * pz);
    const sxs = 0.7 + 0.3 * Math.abs(Math.cos(ang * 0.5));
    ctx.save(); ctx.translate(cx, cy + 150); ctx.scale(sxs, 1);
    for (let i = n; i >= 1; i--) text(ctx, words[wi], -dx * i, -dy * i, { size: 420, face: DISPLAY, weight: 900, color: i === 1 ? ACCENT : mixColor('#3A3A42', '#14141A', i / n), align: 'center', tracking: -10 });
    text(ctx, words[wi], 0, 0, { size: 420, face: DISPLAY, weight: 900, color: PAPER, align: 'center', tracking: -10 });
    ctx.restore();
    text(ctx, 'extrusion · ' + n + ' layers', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  if (lt < 52) { // ring tunnel flythrough
    const s = lt - 44;
    const n = 40; const spd = 4 + 3 * pz; const z0 = s * spd;
    const path = z => [Math.sin(z * 0.35) * 0.9, Math.cos(z * 0.27) * 0.6];
    for (let i = n - 1; i >= 0; i--) {
      const z = mod(i * 0.9 - z0, n * 0.9); const dist = z + 0.4; const [ox, oy] = path(z0 + z); const camo = path(z0);
      const sc = 900 / dist; const x = cx + (ox - camo[0]) * sc, y = cy + (oy - camo[1]) * sc; const r = 1.6 * sc;
      if (r > 3000 || r < 2) continue;
      const seg = i % 4 === 0;
      ring(ctx, x, y, r, Math.max(1.5, 18 * (1 / dist)), seg ? ACCENT : withAlpha(PAPER, clamp(1.2 - dist / 30)), 0, TAU);
      if (seg) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + z0 * 0.2; dot(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(2, 28 / dist), PAPER); }
    }
    dot(ctx, cx, cy, 14 + 12 * pz, ACCENT);
    text(ctx, 'flythrough', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER });
    return;
  }

  // 52–60: a rotating cloud collapses into the point
  const s = lt - 52;
  const col = ease.inExpo(clamp((s - 6.2) / 1.8));
  const ry = s * 0.9;
  const pts = FIB.map((v, i) => { const r = (1.2 + 1.5 * hash(i, 77)) * (1 - col); let p = [v[0] * r, v[1] * r, v[2] * r]; p = rotY(p, ry); p = rotX(p, 0.4); return project(p, 5); }).sort((a, b2) => b2[3] - a[3]);
  pts.forEach((p, i) => dot(ctx, p[0], p[1], 6 * p[2] / 160 * (1 - col * 0.5), i % 11 === 0 ? ACCENT : PAPER));
  text(ctx, 'every object is a cloud of points', 160, 120, { size: 34, face: UI, weight: 600, color: PAPER, alpha: 1 - col });
  if (col > 0) dot(ctx, cx, cy, 10 + 500 * col * col, ACCENT);
});
