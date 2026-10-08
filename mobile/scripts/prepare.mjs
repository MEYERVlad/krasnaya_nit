// Копирует игру в www/ и подключает локальные шрифты из ../steam/fonts вместо Google Fonts.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const www = join(root, 'www');
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });

let html = readFileSync(join(root, '..', 'index.html'), 'utf8');
const before = html.length;
html = html
  .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">')
  .replace('content="width=device-width,initial-scale=1,viewport-fit=cover"', 'content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"');
if (html.includes('fonts.googleapis.com') || html.length === before) throw new Error('Не удалось заменить ссылку на Google Fonts');
writeFileSync(join(www, 'index.html'), html);
cpSync(join(root, '..', 'steam', 'fonts'), join(www, 'fonts'), { recursive: true, filter: f => !f.endsWith('.txt') });
console.log('www/ готов');
