// Рендер тизера: кадры teaser.html → ffmpeg (H.264), затем звук из audio.py.
// node scripts/render.mjs            — полный рендер в out/krasnaya-nit-teaser.mp4
// node scripts/render.mjs 3.5 20 61  — пробные кадры в out/preview-*.jpg
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { playwright } from '../../steam/scripts/pw.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'out'); mkdirSync(out, { recursive: true });
const T = createRequire(import.meta.url)(join(root, 'timeline.js'));
const FPS = 30;
const { chromium } = playwright();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(pathToFileURL(join(root, 'teaser.html')).href);
await p.evaluate(() => window.ready);
const frame = async t => { await p.evaluate(t => window.renderAt(t), t); return p.screenshot({ type: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 1080 } }); };

const previews = process.argv.slice(2).map(Number);
if (previews.length) {
  for (const t of previews) writeFileSync(join(out, `preview-${t}.jpg`), await frame(t));
  await b.close(); process.exit(0);
}
// звук
writeFileSync(join(out, 'timeline.json'), JSON.stringify(T));
execFileSync('python3', [join(root, 'scripts', 'audio.py'), join(out, 'timeline.json'), join(out, 'audio.wav')], { stdio: 'inherit' });
// видео
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', join(out, 'audio.wav'),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '192k', '-shortest',
  join(out, 'krasnaya-nit-teaser.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(T.duration * FPS);
for (let i = 0; i < N; i++) {
  const img = await frame(i / FPS);
  if (!ff.stdin.write(img)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) console.log(`кадр ${i}/${N}`);
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
await b.close();
console.log('готово: out/krasnaya-nit-teaser.mp4');
