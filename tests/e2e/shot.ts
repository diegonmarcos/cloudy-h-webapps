import type { Page, TestInfo } from '@playwright/test';

/** Full-viewport screenshot into tests/results/shots/<project>/<name>.png (uploaded as the CI artifact "screenshots"). */
export async function shot(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: `tests/results/shots/${info.project.name}/${name}.png` });
}
