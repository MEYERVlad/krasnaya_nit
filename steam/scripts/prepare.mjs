// Копирует игру в app/ и подключает локальные шрифты вместо Google Fonts.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'app');
rmSync(app, { recursive: true, force: true });
mkdirSync(app, { recursive: true });

let html = readFileSync(join(root, '..', 'index.html'), 'utf8');
const before = html.length;
html = html
  .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
  .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts/fonts.css">');
if (html.includes('fonts.googleapis.com') || html.length === before) throw new Error('Не удалось заменить ссылку на Google Fonts');
writeFileSync(join(app, 'index.html'), html);
cpSync(join(root, 'fonts'), join(app, 'fonts'), { recursive: true });
console.log('app/ готов');
