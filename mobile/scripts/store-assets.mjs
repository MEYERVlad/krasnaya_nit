// Скриншоты для RuStore 1920×1080 в телефонной раскладке → store/screenshots.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright } from '../../steam/scripts/pw.mjs';
import { KEYS, SHOTS } from '../../steam/scripts/shots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'store', 'screenshots'); mkdirSync(out, { recursive: true });
const game = pathToFileURL(join(root, 'www', 'index.html')).href;
const { chromium } = playwright();
const b = await chromium.launch();
for (const [name, ch, st] of SHOTS) {
  // 896×504 CSS-пикселей — телефон в горизонтальном положении; ×2.142857 = 1920×1080
  const p = await b.newPage({ viewport: { width: 896, height: 504 }, deviceScaleFactor: 1920 / 896, isMobile: true, hasTouch: true });
  await p.goto(game);
  await p.evaluate(([k, ch, st]) => { localStorage.clear(); localStorage.setItem('krasnaya-nit-last', String(ch)); localStorage.setItem(k, JSON.stringify({ ch, sel: null, ...st })); }, [KEYS[ch], ch, st]);
  await p.reload(); await p.evaluate(() => document.fonts.ready);
  await p.click('#bCont'); await p.waitForTimeout(1600);
  await p.addStyleTag({ content: '.cap{display:none!important}#fx{display:none}' });
  await p.waitForTimeout(200);
  writeFileSync(join(out, name + '.png'), await p.screenshot());
  await p.close(); console.log('screenshot', name);
}
await b.close();
