import { expect, test } from '@playwright/test';
import { shot } from './shot';

// M0 smoke: both sites load from their committed dist under their published base, and a service
// fallback page still answers at /cloud-webapps/<slug>/ next to the SvelteKit site.
test('cloudy-webapps home loads under /cloud-webapps/', async ({ page }, info) => {
  const r = await page.goto('/cloud-webapps/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('[data-site="cloudy-webapps"]')).toBeVisible();
  await shot(page, info, 'webapps-home');
});

test('cloudy-c3 home loads under /cloudy-c3/', async ({ page }, info) => {
  const r = await page.goto('/cloudy-c3/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('[data-site="cloudy-c3"]')).toBeVisible();
  await shot(page, info, 'c3-home');
});

test('service fallback pages keep their URL', async ({ page }) => {
  const r = await page.goto('/cloud-webapps/stalwart/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('h1')).toContainText(/stalwart/i);
});
