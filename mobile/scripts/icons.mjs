// Значки Android: обычный, круглый, адаптивный (передний план) и заставка — из ../steam/build/icon.svg.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { playwright } from '../../steam/scripts/pw.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const res = join(root, 'android', 'app', 'src', 'main', 'res');
const svg = readFileSync(join(root, '..', 'steam', 'build', 'icon.svg'), 'utf8');
// передний план адаптивного значка: без фона, в безопасной зоне 66/108
const fg = svg.replace(/<rect width="512" height="512"[^>]*\/>/, '').replace('<circle cx="256"', '<g transform="translate(256 256) scale(.6) translate(-256 -256)"><circle cx="256"').replace('</svg>', '</g></svg>');
const { chromium } = playwright();
const b = await chromium.launch(); const p = await b.newPage();
async function render(src, size, round) {
  await p.setViewportSize({ width: size, height: size });
  await p.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px;${round ? 'border-radius:50%;overflow:hidden' : ''}">${src.replace(/width="1024" height="1024"/, `width="${size}" height="${size}"`)}</div></body>`);
  return p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}
const D = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [d, k] of Object.entries(D)) {
  const dir = join(res, 'mipmap-' + d);
  writeFileSync(join(dir, 'ic_launcher.png'), await render(svg, 48 * k));
  writeFileSync(join(dir, 'ic_launcher_round.png'), await render(svg.replace('rx="96"', 'rx="256"'), 48 * k, true));
  writeFileSync(join(dir, 'ic_launcher_foreground.png'), await render(fg, 108 * k));
}
const big = await render(svg, 512);
writeFileSync(join(root, 'store', 'icon_512.png'), big);
await b.close();
// заставка: тёмный фон и значок по центру, размеры как у исходных splash.png
execFileSync('python3', ['-c', `
import glob,sys
from PIL import Image
icon=Image.open(sys.argv[1]).convert('RGBA')
for f in glob.glob(sys.argv[2]+'/drawable*/splash.png'):
    w,h=Image.open(f).size; im=Image.new('RGB',(w,h),(11,9,8)); s=int(min(w,h)*.32)
    ic=icon.resize((s,s),Image.LANCZOS); im.paste(ic,((w-s)//2,(h-s)//2),ic); im.save(f)
`, join(root, 'store', 'icon_512.png'), res]);
console.log('значки и заставка готовы');
