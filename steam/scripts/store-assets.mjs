// Скриншоты 1920×1080 и обложки (capsules) для страницы в Steam → store/.
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { playwright } from './pw.mjs';
import { KEYS, SHOTS } from './shots.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'store'); mkdirSync(join(out, 'screenshots'), { recursive: true });
const game = pathToFileURL(join(root, 'app', 'index.html')).href;
const { chromium } = playwright();
const b = await chromium.launch();
async function scene(ch, st, w, h, dpr, stageOnly) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await p.goto(game);
  await p.evaluate(([k, ch, st]) => { localStorage.clear(); localStorage.setItem('krasnaya-nit-last', String(ch)); localStorage.setItem(k, JSON.stringify({ ch, sel: null, ...st })); }, [KEYS[ch], ch, st]);
  await p.reload(); await p.evaluate(() => document.fonts.ready);
  await p.click('#bCont'); await p.waitForTimeout(1600);
  await p.addStyleTag({ content: '.cap{display:none!important}#fx{display:none}' + (stageOnly ? '.arrow{display:none!important}' : '') });
  await p.waitForTimeout(200);
  const img = stageOnly ? await p.locator('#stage').screenshot() : await p.screenshot();
  await p.close(); return img;
}
const { writeFileSync } = await import('node:fs');
for (const [name, ch, st] of SHOTS) {
  writeFileSync(join(out, 'screenshots', name + '.png'), await scene(ch, st, 1920, 1080, 1, false));
  console.log('screenshot', name);
}
// фоны для обложек — чистые сцены без интерфейса в высоком разрешении
const bgDinner = (await scene(4, SHOTS[8][2], 1600, 1100, 2.5, true)).toString('base64');
const bgBoard = (await scene(1, SHOTS[2][2], 1600, 1100, 2.5, true)).toString('base64');
const fonts = pathToFileURL(join(root, 'app', 'fonts', 'fonts.css')).href;
const thread = `<svg viewBox="0 0 560 50" preserveAspectRatio="none" style="width:70%;height:7%;overflow:visible"><path d="M4 30 C90 6 150 44 230 24 S380 8 440 30 S530 40 556 14" stroke="#c42a22" stroke-width="3" fill="none"/></svg>`;
function capsule(bg, w, h, opt = {}) {
  const fs = opt.fs || Math.min(w * .112, h * .28);
  const logo = opt.noLogo ? '' : `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:${opt.top ? 'flex-start' : 'center'};padding-top:${opt.top ? h * .08 : 0}px;gap:${fs * .12}px">
    <div style="font-family:'Cormorant SC';font-weight:600;font-size:${fs}px;letter-spacing:.08em;color:#f1e6cb;text-shadow:0 0 ${fs * .4}px #000,0 ${fs * .04}px ${fs * .1}px #000;line-height:1;white-space:nowrap">Красная нить</div>${thread}
    ${opt.sub ? `<div style="font-family:'Cormorant Garamond';font-style:italic;font-size:${fs * .26}px;color:#d9ceb6;text-shadow:0 0 12px #000">${opt.sub}</div>` : ''}</div>`;
  const back = opt.transparent ? '' : `<div style="position:absolute;inset:0;background:url(data:image/png;base64,${bg}) center ${opt.pos || '50%'}/cover"></div><div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,.15),rgba(0,0,0,.75))"></div>`;
  return `<!doctype html><html><head><link rel="stylesheet" href="${fonts}"></head><body style="margin:0;width:${w}px;height:${h}px;overflow:hidden;position:relative;background:${opt.transparent ? 'transparent' : '#0b0908'}">${back}${logo}</body></html>`;
}
const CAPS = [
  ['header_capsule_920x430', bgDinner, 920, 430, { sub: 'Детективная головоломка' }],
  ['small_capsule_462x174', bgDinner, 462, 174, { fs: 48 }],
  ['main_capsule_1232x706', bgDinner, 1232, 706, { sub: 'Детективная головоломка' }],
  ['vertical_capsule_748x896', bgBoard, 748, 896, { top: true, fs: 80, sub: 'Детективная головоломка' }],
  ['library_capsule_600x900', bgBoard, 600, 900, { top: true, fs: 64 }],
  ['library_hero_3840x1240', bgDinner, 3840, 1240, { noLogo: true, pos: '40%' }],
  ['library_logo_1280x720', null, 1280, 720, { transparent: true, fs: 140 }],
  ['page_background_1438x810', bgBoard, 1438, 810, { noLogo: true }]
];
for (const [name, bg, w, h, opt] of CAPS) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(capsule(bg, w, h, opt)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  writeFileSync(join(out, name + '.png'), await p.screenshot({ omitBackground: !!opt.transparent }));
  await p.close(); console.log('capsule', name);
}
await b.close();
