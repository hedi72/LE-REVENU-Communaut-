import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
try {
  await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
  for (const [name, viewport] of [
    ['desktop', { width: 1440, height: 1000 }],
    ['mobile', { width: 390, height: 844 }],
  ]) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.goto(`${process.env.E2E_WEB_URL || 'http://localhost:3000'}/`);
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('heading', { name: 'Les discussions' }).waitFor();
    await page.screenshot({
      path: fileURLToPath(new URL(`../docs/preview-${name}.png`, import.meta.url)),
      fullPage: true,
    });
    await page.screenshot({
      path: fileURLToPath(new URL(`../docs/preview-${name}-viewport.png`, import.meta.url)),
    });
    await page.close();
  }
} finally {
  await browser.close();
}
