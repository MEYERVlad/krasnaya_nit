// Рисует значок игры (ворон с ключом) и собирает build/icon.png и build/icon.ico.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { playwright } from './pw.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CROW = `<path d="M-30 -38 C-28 -49 -18 -55 -8 -53 C0 -51 4 -45 6 -37 C14 -35 24 -29 30 -19 C38 -9 46 -1 60 5 L55 10 C45 7 36 3 28 -1 C20 1 10 3 0 1 C-10 -1 -16 -9 -18 -19 C-20 -25 -23 -30 -27 -33 Z" fill="#0d0c11"/><path d="M-29 -41 L-47 -36 L-29 -32 Z" fill="#17161c"/><path d="M-6 -1 L-8 7 M3 0 L3 7" stroke="#0d0c11" stroke-width="2.6" stroke-linecap="round"/><circle cx="-20" cy="-43" r="2.6" fill="#d9cfa8"/><circle cx="-20.5" cy="-43" r="1.4" fill="#000"/>`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="1024" height="1024">
<defs><radialGradient id="bg" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#7a1c18"/><stop offset=".7" stop-color="#3a0c0c"/><stop offset="1" stop-color="#160606"/></radialGradient>
<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc96"/><stop offset=".45" stop-color="#b38a3e"/><stop offset="1" stop-color="#e8c67a"/></linearGradient></defs>
<rect width="512" height="512" rx="96" fill="url(#bg)"/>
<circle cx="256" cy="256" r="196" fill="none" stroke="url(#gold)" stroke-width="14"/>
<circle cx="256" cy="256" r="172" fill="none" stroke="url(#gold)" stroke-width="4" opacity=".7"/>
<path d="M40 380 C140 300 220 440 300 360 S440 300 480 330" stroke="#c42a22" stroke-width="9" fill="none" stroke-linecap="round"/>
<g transform="translate(262 300) scale(3.6)">${CROW}</g>
<g transform="translate(118 158) rotate(28)"><circle cx="0" cy="0" r="17" fill="none" stroke="url(#gold)" stroke-width="9"/><rect x="15" y="-5" width="70" height="10" fill="url(#gold)"/><rect x="66" y="5" width="8" height="18" fill="url(#gold)"/><rect x="78" y="5" width="7" height="13" fill="url(#gold)"/></g>
</svg>`;

const { chromium } = playwright();
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
const pngs = {};
for (const size of [1024, 256, 128, 64, 48, 32, 16]) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<body style="margin:0;background:transparent">${svg.replace('width="1024" height="1024"', `width="${size}" height="${size}"`)}</body>`);
  pngs[size] = await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
await b.close();
writeFileSync(join(root, 'build', 'icon.png'), pngs[1024]);
writeFileSync(join(root, 'build', 'icon.svg'), svg);
// ICO из PNG-кадров 256…16
const sizes = [256, 128, 64, 48, 32, 16];
const head = Buffer.alloc(6 + 16 * sizes.length);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
let off = head.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16, d = pngs[s];
  head.writeUInt8(s === 256 ? 0 : s, e); head.writeUInt8(s === 256 ? 0 : s, e + 1);
  head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
  head.writeUInt32LE(d.length, e + 8); head.writeUInt32LE(off, e + 12); off += d.length;
});
writeFileSync(join(root, 'build', 'icon.ico'), Buffer.concat([head, ...sizes.map(s => pngs[s])]));
console.log('build/icon.png, build/icon.ico готовы');
