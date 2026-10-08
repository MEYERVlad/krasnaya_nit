// Снимает чистые кадры сцен (без интерфейса) в высоком разрешении → plates/*.png
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright } from '../../steam/scripts/pw.mjs';
import { KEYS } from '../../steam/scripts/shots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'plates'); mkdirSync(out, { recursive: true });
const game = pathToFileURL(join(root, '..', 'steam', 'app', 'index.html')).href;
const C1 = { ch: 3, cm: 3, bag: [0, 0, 0], slots: [null, null, null, null], linked: {}, shot: {}, talk: {}, touched: 1 };
const C2 = { touched: 1, tl: [null, null, null, null], dev: 0, took: {}, talk: {} };
const C3 = { lk: [1, 1], talk: {}, touched: 1 };
const C4 = { talk: {}, acc: {}, touched: 1 };
const PLATES = [
  ['clock', 1, { scene: 'clock', f: { ...C1, ch: 9, cm: 8 } }],
  ['dinner53', 1, { scene: 'dinner', f: { ...C1, visited: 1 } }],
  ['room', 1, { scene: 'room', f: { ...C1, magTaken: 1, recordPlaced: 1, eyesOpen: 1 } }],
  ['board', 1, { scene: 'board', f: { ...C1, ended: 1, sixth: 1, centerLinked: 1, slots: ['doctor', 'pickman', 'lady', 'butler'], linked: { doctor: 'vial', pickman: 'page', lady: 'note', butler: 'glove' } } }],
  ['watch', 1, { scene: 'watch', f: { ...C1, engr: 1 } }],
  ['office75', 2, { scene: 'office', f: { ...C2 } }],
  ['office53', 2, { scene: 'office53', f: { ...C2, visited: 1, sawKey: 1 } }],
  ['darkroom', 2, { scene: 'darkroom', f: { ...C2, red: 1, printed: 1, labOpen: 1, filmTaken: 1, dev: 3 } }],
  ['rookwall', 2, { scene: 'rookboard', f: { ...C2, tl: ['pr1', 'pr2', 'pr3', 'pr4'], ring: 1, crest: 1, curtain: 1 } }],
  ['dorm75', 3, { scene: 'dorm', f: { ...C3, boxOpen: 1 } }],
  ['dorm31', 3, { scene: 'dorm31', f: { ...C3, visited: 1 } }],
  ['tray', 3, { scene: 'tray', f: { ...C3, ringPlaced: 1, noteOut: 1 } }],
  ['dinner75', 4, { scene: 'dinner75', f: { ...C4 } }],
  ['kitchen', 4, { scene: 'kitchen', f: { ...C4 } }],
  ['cellar53', 4, { scene: 'cellar53', f: { ...C4, rackOpen: 1, visited: 1, sawWall: 1, rookCrow: 1 } }]
];
const { chromium } = playwright();
const b = await chromium.launch();
for (const [name, ch, st] of PLATES) {
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });
  await p.goto(game);
  await p.evaluate(([k, ch, st]) => { localStorage.clear(); localStorage.setItem('krasnaya-nit-last', String(ch)); localStorage.setItem(k, JSON.stringify({ ch, sel: null, inv: [], ...st })); }, [KEYS[ch], ch, st]);
  await p.reload(); await p.evaluate(() => document.fonts.ready);
  await p.click('#bCont'); await p.waitForTimeout(1500);
  await p.addStyleTag({ content: '.cap,.grain,.vig,#fx,#flash,#fade,.arrow{display:none!important}.drop{animation:none!important}' });
  await p.waitForTimeout(300);
  await p.locator('#scene').screenshot({ path: join(out, name + '.png') });
  await p.close(); console.log('plate', name);
}
await b.close();
