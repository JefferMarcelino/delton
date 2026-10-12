// Renderer. Usage (add --project showreel|pitch, default pitch; paths below are inside that folder):
//   node render.mjs                       full render → out/final.mp4 (video+audio)
//   node render.mjs --sheet [chapter]     contact sheets (one frame per beat) → out/sheet-*.png
//   node render.mjs --frame 12.5 out.png  single frame
//   node render.mjs --range 16 76 out.mp4 partial render (no audio)
// Options: --fps 30 --workers 4 --crf 16
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const PROJECT = opt('--project', 'pitch');                       // pitch | showreel
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), PROJECT);
const URL = pathToFileURL(path.join(ROOT, 'index.html')).href;
const FPS = +opt('--fps', 30), WORKERS = +opt('--workers', Math.min(4, os.cpus().length)), CRF = +opt('--crf', 16);
const W = 1920, H = 1080;
mkdirSync(path.join(ROOT, 'out'), { recursive: true });

const beats = JSON.parse(await import('node:fs').then(fs => fs.readFileSync(path.join(ROOT, 'beats.json'), 'utf8')));
const DUR = beats.duration;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); });
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto(URL);
  await page.evaluate(() => window.ready);
  return page;
}

function ffmpeg(outFile, extra = []) {
  const p = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', ...extra, outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  return p;
}
async function renderRange(page, t0, t1, outFile, tag) {
  const n = Math.round((t1 - t0) * FPS);
  const ff = ffmpeg(outFile);
  const started = Date.now();
  for (let i = 0; i < n; i++) {
    const t = t0 + i / FPS;
    await page.evaluate(t => window.seek(t), t);
    const png = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % (FPS * 10) === 0) console.log(`[${tag}] ${t.toFixed(1)}s / ${t1}s  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
}
function run(cmd, a) { return new Promise((res, rej) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c === 0 ? res() : rej(new Error(cmd + ' exit ' + c))); }); }

if (args.includes('--frame')) {
  const t = +opt('--frame', 0), out = args[args.indexOf('--frame') + 2] || path.join(ROOT, 'out', `frame-${t}.png`);
  const page = await openPage(); await page.evaluate(t => window.seek(t), t); await page.screenshot({ path: out }); console.log('wrote', out);
} else if (args.includes('--sheet')) {
  // one frame per beat, per chapter; thumbnails 320x180, 12 columns
  const which = args[args.indexOf('--sheet') + 1];
  const page = await openPage();
  const sections = Object.entries(beats.sections).filter(([k]) => !which || which.startsWith('--') || k === which);
  for (const [name, [s, e]] of sections) {
    const times = beats.beats.filter(b => b >= s && b < e);
    const url = await page.evaluate(({ times, cols, tw, th }) => window.sheet(times, cols, tw, th), { times, cols: 12, tw: 320, th: 180 });
    const out = path.join(ROOT, 'out', `sheet-${name}.png`);
    writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out, times.length, 'frames');
  }
} else if (args.includes('--grid')) {
  // --grid 9,30,38 [out.png]: selected frames at half size, 2 columns
  const times = args[args.indexOf('--grid') + 1].split(',').map(Number); const out = args[args.indexOf('--grid') + 2] || path.join(ROOT, 'out', 'grid.png');
  const page = await openPage();
  const url = await page.evaluate(({ times }) => window.sheet(times, 2, 960, 540), { times });
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', out);
} else if (args.includes('--range')) {
  const i = args.indexOf('--range'); const t0 = +args[i + 1], t1 = +args[i + 2], out = args[i + 3] || path.join(ROOT, 'out', `range-${t0}-${t1}.mp4`);
  const page = await openPage(); await renderRange(page, t0, t1, out, 'range'); console.log('wrote', out);
} else {
  // full parallel render: split into WORKERS segments, concat, mux audio
  const segs = []; const per = DUR / WORKERS;
  for (let w = 0; w < WORKERS; w++) segs.push([+(w * per).toFixed(3), +((w + 1) * per).toFixed(3)]);
  const files = segs.map((_, i) => path.join(ROOT, 'out', `seg-${i}.mp4`));
  await Promise.all(segs.map(async ([a, b], i) => { const page = await openPage(); await renderRange(page, a, b, files[i], 'w' + i); await page.close(); }));
  const list = path.join(ROOT, 'out', 'segs.txt'); writeFileSync(list, files.map(f => `file '${f}'`).join('\n'));
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(ROOT, 'out', 'video.mp4')]);
  const audio = existsSync(path.join(ROOT, 'mix.wav')) ? path.join(ROOT, 'mix.wav') : path.join(ROOT, 'score.wav');
  const final = path.join(ROOT, 'out', 'final.mp4');
  if (existsSync(audio)) await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(ROOT, 'out', 'video.mp4'), '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', final]);
  console.log('wrote', final);
}
await browser.close();
