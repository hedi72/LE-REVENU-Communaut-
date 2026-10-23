import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';

const source = process.argv[2];
if (!source) throw new Error('Chemin de la maquette requis.');
await mkdir('docs/design-reference', { recursive: true });
const html = await readFile(source, 'utf8');
const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1];
if (!css) throw new Error('Styles introuvables.');
await writeFile('docs/design-reference/original.css', css);
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    colorScheme: 'light',
  });
  await page.goto(pathToFileURL(source).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'docs/design-reference/visitor-desktop.png', fullPage: true });
  const data = await page.evaluate(() => ({
    categories: CATS,
    users: Object.values(USERS).map((u) => ({ ...u, badges: [...(u.badges || [])] })),
    topics: TOPICS,
    topicOrder: feedList('hot').map((topic) => topic.id),
    blogs: BLOGS,
    events: EVENTS,
    news: SITE_NEWS,
    navigation: SITE_NAV,
    icons: ICONS,
    state: { notes: S.notes, logged: S.logged },
  }));
  await writeFile('docs/design-reference/data.json', JSON.stringify(data, null, 2));
  await page.getByRole('button', { name: 'Membre actif', exact: true }).click();
  await page.screenshot({ path: 'docs/design-reference/member-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Visiteur', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/design-reference/visitor-mobile.png', fullPage: true });
  console.log('Références et styles extraits.');
} finally {
  await browser.close();
}
