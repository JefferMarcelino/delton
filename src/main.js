'use strict';
// window.seek(t): paints frame t. Pure function of t.
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
const ctx = canvas.getContext('2d', { alpha: false });

SCENES.sort((a, b) => a.start - b.start);

window.seek = function (t) {
  t = Math.max(0, Math.min(t, BEATS.duration || 420));
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  bg(ctx, INK);
  for (const s of SCENES) {
    if (t >= s.start && t < s.end) {
      ctx.save();
      try { s.draw(ctx, t, t - s.start, (t - s.start) / (s.end - s.start)); }
      finally { ctx.restore(); }
    }
  }
  return true;
};

// Contact sheet: draws frame at each time in `times` into a grid, returns PNG data URL.
window.sheet = function (times, cols, tw, th, label = true) {
  const rows = Math.ceil(times.length / cols);
  const off = document.createElement('canvas'); off.width = cols * tw; off.height = rows * th;
  const o = off.getContext('2d');
  times.forEach((t, i) => {
    window.seek(t);
    const x = (i % cols) * tw, y = Math.floor(i / cols) * th;
    o.drawImage(canvas, x, y, tw, th);
    if (label) { o.fillStyle = 'rgba(0,0,0,0.6)'; o.fillRect(x, y, 70, 20); o.fillStyle = '#fff'; o.font = '13px monospace'; o.fillText(t.toFixed(1), x + 4, y + 15); }
  });
  return off.toDataURL('image/png');
};

window.ready = Promise.all([
  document.fonts.load('900 100px "Unbounded"'), document.fonts.load('700 100px "Unbounded"'),
  document.fonts.load('500 40px "Inter"'), document.fonts.load('600 40px "Inter"'), document.fonts.load('400 40px "Inter"'),
]).then(() => { window.seek(0); return true; });

// preview mode in a browser (not used by the renderer): ?t=12.5 or ?play
const q = new URLSearchParams(location.search);
if (q.has('t')) window.ready.then(() => window.seek(parseFloat(q.get('t'))));
if (q.has('play')) window.ready.then(() => { const t0 = performance.now(); const loop = () => { window.seek(((performance.now() - t0) / 1000 + parseFloat(q.get('play') || 0))); requestAnimationFrame(loop); }; loop(); });
