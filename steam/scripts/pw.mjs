// Подключает Playwright: из node_modules проекта или из глобальной установки.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
export function playwright() {
  try { return require('playwright'); } catch {}
  try { return require(join(execSync('npm root -g').toString().trim(), 'playwright')); } catch {}
  throw new Error('Нужен Playwright: npm i -D playwright && npx playwright install chromium');
}
