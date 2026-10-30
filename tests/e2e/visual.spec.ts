import { expect, test } from '@playwright/test';
import { BASE } from './helpers';

// Visual regression of the gallery (both themes) and the island. Baselines live in tests/visual/__screenshots__/<project>/;
// a missing one is written by CI and committed back. MUTATION=island-width (mutation.yml) renders the island at widthFraction
// 0.5 through the gallery's test override and MUST fail against the baseline.
const mutate = process.env.MUTATION === 'island-width' ? '?wf=0.5' : '';
test.use({ reducedMotion: 'reduce' });

for (const theme of ['cloud', 'cloud_minimalist_black']) {
  test(`gallery ${theme}`, async ({ page }) => {
    await page.goto(`${BASE}/_gallery/${mutate}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByTestId(`gallery-${theme}`)).toHaveScreenshot(`gallery-${theme}.png`, { maxDiffPixelRatio: 0.002 });
  });
}
test('island', async ({ page }) => {
  await page.goto(`${BASE}/cloud/${mutate}`);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByTestId('bottom-nav')).toHaveScreenshot('island.png', { maxDiffPixelRatio: 0.002 });
});
