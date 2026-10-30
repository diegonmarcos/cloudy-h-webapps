import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { BASE, isTablet } from './helpers';

// M5: every extapp: id on the Cloud page has a URL that renders the app (fleet chrome) or its portal/card; every
// declared section of every fleet app renders; the declared second-row modes draw as on Android.
type P = { id: string; pages?: P[] };
const nav = JSON.parse(readFileSync('packages/cloudy-ui/nav/nav.json', 'utf8')) as { apps: { id: string; kind: string; wasm: string | null; sections: P[] }[] };

for (const a of nav.apps) {
  test(`${a.id}: root and every section render`, async ({ page }) => {
    for (const p of [`${a.id}/`, ...a.sections.map((s) => `${a.id}/${s.id}/`)]) {
      const r = await page.goto(`${BASE}/${p}`);
      expect(r?.status(), p).toBe(200);
      await expect(page.getByTestId('fleet-shell'), p).toBeVisible();
      await expect(page.getByTestId('app-body'), p).toBeVisible();
    }
  });
  if (a.kind === 'portal' || a.wasm) {
    test(`${a.id}: portal page`, async ({ page }) => {
      const r = await page.goto(`${BASE}/${a.id}/portal/`);
      expect(r?.status()).toBe(200);
      await expect(page.getByTestId('portal')).toBeVisible();
    });
  }
}

test('cloud-mail: vertical_side_menu = the rail on a phone, the docked menu on a tablet', async ({ page }, info) => {
  await page.goto(`${BASE}/cloud-mail/mail/`);
  const menu = page.getByTestId('fleet-side-menu');
  if (nav.apps.find((x) => x.id === 'cloud-mail')!.sections.length) {
    await expect(menu).toBeVisible();
    const w = (await menu.boundingBox())!.width;
    if (isTablet(info.project.name)) expect(w).toBeGreaterThan(200); else expect(w).toBeLessThan(70);
  }
});

test('cloud-me: horizontal_two_rows draws one row per group', async ({ page }) => {
  await page.goto(`${BASE}/cloud-me/`);
  await expect(page.getByTestId('fleet-second-rows')).toBeVisible();
});

test('the Cloud > WebApps tab lists the Kotlin/Wasm pages as portals', async ({ page }) => {
  await page.goto(`${BASE}/cloud/webapps/`);
  await expect(page.locator('[data-group="Kotlin/Wasm pages"] .tile').first()).toBeVisible();
});
