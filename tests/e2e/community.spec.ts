import { test, expect, type APIRequestContext } from '@playwright/test';
import { readFileSync } from 'node:fs';
const api = process.env.E2E_API_URL || 'http://localhost:1337';

test('le défilement garde les colonnes latérales en place sur ordinateur', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.discussion-link').first()).toBeVisible();

  if ((page.viewportSize()?.width || 0) <= 1180) {
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    return;
  }

  const main = page.locator('.layout > .main');
  const fixedElements = page.locator('.hdr, .layout > .side, .layout > .right');
  const positions = await fixedElements.evaluateAll((elements) =>
    elements.map((element) => element.getBoundingClientRect().top),
  );
  await main.hover();
  await page.mouse.wheel(0, 500);
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  expect(
    await fixedElements.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top),
    ),
  ).toEqual(positions);
  expect(await page.locator('.side').evaluate((element) => element.scrollTop)).toBe(0);
  expect(await page.locator('.right').evaluate((element) => element.scrollTop)).toBe(0);

  const sidebar = page.locator('.side');
  await sidebar.hover();
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => sidebar.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  await expect(sidebar.locator('.nav-foot')).toBeInViewport();
});

function demoPassword() {
  if (process.env.E2E_PASSWORD) return process.env.E2E_PASSWORD;
  return (
    readFileSync('apps/api/.env', 'utf8')
      .match(/^DEMO_PASSWORD=(.+)$/m)?.[1]
      ?.trim() || ''
  );
}
let tokenPromise: Promise<string> | undefined;
function demoToken(request: APIRequestContext) {
  tokenPromise ??= (async () => {
    const login = await request.post(`${api}/api/auth/local`, {
      data: { identifier: 'camille@example.com', password: demoPassword() },
    });
    expect(login.ok()).toBeTruthy();
    return (await login.json()).jwt as string;
  })();
  return tokenPromise;
}
test('affiche les données de l’API, filtre et ouvre une discussion', async ({ page, request }) => {
  const response = await request.get(`${api}/api/discussions?sort=trending`);
  expect(response.ok()).toBeTruthy();
  const { data } = await response.json();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: data[0].title, exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: /Navigation principale|Filtrer par espace/ })
    .getByRole('link', { name: 'Bourse & actions', exact: true })
    .click();
  await expect(page).toHaveURL(/category=bourse/);
  await page.locator('.discussion-link').first().click();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Se connecter pour répondre' })).toBeVisible();
  // Next.js can stream a not-found page with HTTP 200; the API retains HTTP 404.
  await page.goto('/page-inexistante');
  await expect(page.getByRole('heading', { name: 'Cette page est introuvable.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/);
  expect((await request.get(`${api}/api/discussions/document-inexistant`)).status()).toBe(404);
});
test('l’API refuse la publication anonyme et l’usurpation d’auteur', async ({ request }) => {
  const categories = await (await request.get(`${api}/api/categories`)).json();
  const data = {
    title: 'Une discussion de test de sécurité',
    content: 'Test',
    category: categories.data[0].documentId,
    type: 'question',
  };
  const anonymous = await request.post(`${api}/api/discussions`, { data: { data } });
  expect([401, 403]).toContain(anonymous.status());
  const jwt = await demoToken(request);
  const headers = { Authorization: `Bearer ${jwt}` };
  expect(
    (
      await request.post(`${api}/api/discussions`, {
        headers,
        data: { data: { ...data, author: 999 } },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post(`${api}/api/discussions`, {
        headers,
        data: { data: { ...data, title: 'court' } },
      })
    ).status(),
  ).toBe(400);
  const discussions = await (await request.get(`${api}/api/discussions`)).json();
  const replyData = { content: 'Test', discussion: discussions.data[0].documentId };
  expect([401, 403]).toContain(
    (await request.post(`${api}/api/replies`, { data: { data: replyData } })).status(),
  );
  expect(
    (
      await request.post(`${api}/api/replies`, {
        headers,
        data: { data: { ...replyData, author: 999 } },
      })
    ).status(),
  ).toBe(400);
});
test('connexion, création, réponse et persistance après rechargement', async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse e-mail').fill('camille@example.com');
  await page.getByLabel('Mot de passe').fill(demoPassword());
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.goto('/discussions/nouvelle');
  const title = `Question de démonstration ${Date.now()}`;
  await page.getByLabel('Titre', { exact: true }).fill(title);
  await page.getByLabel('Espace', { exact: true }).selectOption({ label: 'Bourse & actions' });
  await page
    .getByLabel('Votre message')
    .fill('Comment comparer les frais et construire une épargne adaptée à ses projets ?');
  await page.getByRole('button', { name: 'Publier la discussion' }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  await page
    .getByLabel('Votre réponse')
    .fill('Une réponse enregistrée dans PostgreSQL via Strapi.');
  await page.getByRole('button', { name: 'Publier ma réponse' }).click();
  await expect(page.getByRole('status')).toHaveText('Votre réponse a bien été publiée.');
  await page.reload();
  await expect(
    page.getByText('Une réponse enregistrée dans PostgreSQL via Strapi.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.locator('body').evaluate((el) => el.clientWidth),
  );
});

test('navigation des espaces et publication dans une fenêtre accessible', async ({
  page,
  request,
  context,
}) => {
  await page.goto('/espaces');
  await expect(page.getByRole('heading', { name: 'Tous les espaces', exact: true })).toBeVisible();
  await expect(page.locator('.spaces-grid .space')).toHaveCount(11);
  await context.addCookies([
    {
      name: 'lr-session',
      value: await demoToken(request),
      url: process.env.E2E_WEB_URL || 'http://localhost:3000',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('/');
  await expect(page).toHaveURL('/');
  if ((page.viewportSize()?.width || 0) > 860)
    await page.getByRole('link', { name: 'Publier', exact: true }).click();
  else await page.getByRole('button', { name: 'Publier', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Nouvelle publication' })).toBeVisible();
  await expect(page.getByRole('dialog').getByLabel('Titre', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL('/');
});
