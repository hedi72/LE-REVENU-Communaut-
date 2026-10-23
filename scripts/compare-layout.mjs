import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { writeFile } from 'node:fs/promises';
const source = process.argv[2];
if (!source) throw new Error('Chemin du fichier HTML requis.');
const browser = await chromium.launch();
const report = [];
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const pages = [];
    for (const [name, url] of [
      ['reference', pathToFileURL(source).href],
      ['application', 'http://localhost:3000/'],
    ]) {
      const page = await browser.newPage({ viewport, colorScheme: 'light' });
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.hero').waitFor();
      const boxes = await page.evaluate(() =>
        Object.fromEntries(
          [
            '.proto',
            '.sitebar',
            '.hdr',
            '.layout',
            '.side',
            '.hero',
            '.quick',
            '.feed-bar',
            '.feed',
            '.right',
            '.bnav',
          ].map((selector) => {
            const element = document.querySelector(selector);
            if (!element) return [selector, null];
            const box = element.getBoundingClientRect();
            return [
              selector,
              {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
                display: getComputedStyle(element).display,
              },
            ];
          }),
        ),
      );
      await page.screenshot({
        path: `docs/design-reference/${name}-${viewport.width}-viewport.png`,
      });
      pages.push({ name, boxes });
      await page.close();
    }
    const differences = Object.keys(pages[0].boxes).map((selector) => {
      const expected = pages[0].boxes[selector],
        actual = pages[1].boxes[selector];
      return {
        selector,
        delta:
          expected && actual
            ? {
                x: actual.x - expected.x,
                y: actual.y - expected.y,
                width: actual.width - expected.width,
                height: actual.height - expected.height,
              }
            : null,
      };
    });
    report.push({ viewport, pages, differences });
  }
  await writeFile('docs/design-reference/comparison.json', JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      report.map(({ viewport, differences }) => ({ viewport, differences })),
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
