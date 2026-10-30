import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { shot } from './shot';

// M6: the cloudy-c3 site (/cloudy-c3/). Every Cloud C3 page of the Android declaration + every re-homed /cloud/ portal page
// renders in the fleet chrome; live mode asks the mesh first, then the public endpoint with the session bearer.
const C3 = '/cloudy-c3';
const routes = JSON.parse(readFileSync('packages/cloudy-ui/nav/routes.json', 'utf8')).routes as { path: string; app?: string; kind: string }[];
const appPaths = ['', ...routes.filter((r) => r.app === 'cloud-c3' && r.kind !== 'portal' && r.path !== 'cloud-c3/').map((r) => r.path.slice('cloud-c3/'.length))];
// cross-origin fakes: the API answers with CORS headers (and the bearer's preflight)
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization' };
const PORTAL = ['control-center', 'cloud-control', 'architecture', 'products', 'feed-docs', 'gallery', 'mcp', 'api'];

// page.route only sees requests that do not pass through a service worker
test.use({ serviceWorkers: 'block' });

test.describe('cloudy-c3: every page', () => {
  for (const p of [...appPaths, 'portal/', ...PORTAL.map((id) => `portal/${id}/`)]) {
    test(`/cloudy-c3/${p}`, async ({ page }) => {
      const r = await page.goto(`${C3}/${p}`);
      expect(r?.status()).toBe(200);
      await expect(page.getByTestId('fleet-shell')).toBeVisible();
      await expect(page.locator('[data-site="cloudy-c3"]')).toBeVisible();
      // links stay on this site for C3 pages, other fleet apps go to /cloud-webapps/
      const bad = await page.locator('a[href^="/cloudy-c3/cloud-c3/"]').count();
      expect(bad).toBe(0);
    });
  }
});

test('cloudy-c3: a portal page draws its panels from the snapshot', async ({ page }, info) => {
  await page.goto(`${C3}/portal/control-center/`);
  const pp = page.getByTestId('c3-portal-page');
  await expect(pp).toContainText('the committed snapshot');
  await expect(pp).toContainText('Topology');
  await expect(pp).toContainText('Health');
  await shot(page, info, 'c3-portal-control-center');
});

test('cloudy-c3: live mode reads the mesh first', async ({ page }) => {
  let mesh = 0;
  await page.route('https://c3-pvt.diegonmarcos.com/**', (r) => { mesh++; return r.fulfill({ headers: CORS, json: [{ name: 'mesh-row-1', status: 'up' }] }); });
  await page.route('https://api.diegonmarcos.com/**', (r) => r.fulfill({ status: 500, headers: CORS, body: '' }));
  await page.goto(`${C3}/`);
  await page.evaluate(() => sessionStorage.setItem('cloudy-c3:mode', 'live'));
  await page.goto(`${C3}/portal/products/`);
  await expect(page.getByTestId('c3-portal-page')).toContainText('the mesh API');
  await expect(page.getByTestId('c3-portal-page')).toContainText('mesh-row-1');
  expect(mesh).toBeGreaterThan(0);
});

test('cloudy-c3: off the mesh, live mode uses the public endpoint with the bearer typed in configs', async ({ page }) => {
  const auth: string[] = [];
  await page.route('https://c3-pvt.diegonmarcos.com/**', (r) => r.abort());
  await page.route('https://api.diegonmarcos.com/**', (r) => {
    if (r.request().method() === 'OPTIONS') return r.fulfill({ status: 204, headers: CORS });
    auth.push(r.request().headers()['authorization'] ?? '');
    return r.fulfill({ headers: CORS, json: [{ name: 'public-row-1' }] });
  });
  await page.goto(`${C3}/configs/`);
  const live = page.getByTestId('c3-live');
  await expect(live).toBeVisible();
  await live.getByRole('radio', { name: 'Live' }).click();
  await live.getByLabel('Bearer').fill('test-bearer-not-a-secret');
  await live.getByRole('button', { name: 'Use' }).click();
  await page.goto(`${C3}/portal/products/`);
  await expect(page.getByTestId('c3-portal-page')).toContainText('the public API');
  await expect(page.getByTestId('c3-portal-page')).toContainText('public-row-1');
  expect(auth.length).toBeGreaterThan(0);
  expect(auth.every((a) => a === 'Bearer test-bearer-not-a-secret')).toBe(true);
  // the bearer is never persisted beyond the tab
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
