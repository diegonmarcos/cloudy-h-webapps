import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { shot } from './shot';
import { BASE } from './helpers';

// #1335: the Lnktree row (Omniverse, FinTerm, CAD, Sim2Real), their pages and the FinTerm terminal link. Every expected URL is READ from the generated
// declarations (app-links.json, apps-ui.json), none is typed here.
const J = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const links = J('packages/cloudy-ui/nav/app-links.json').links as { id: string; kind: string; href: string; mesh?: boolean }[];
const apps = J('packages/cloudy-ui/nav/nav.json').apps as { id: string; dir: string | null }[];
const ui = J('packages/cloudy-ui/nav/apps-ui.json').apps as Record<string, { stacks: Record<string, { kind?: string; title?: string; url?: string; planned?: boolean }[]> }>;
const finId = apps.find((a) => a.dir?.startsWith('ad_Capital-'))!.id;
const terminal = links.find((l) => l.id === finId)!;

test('the Lnktree row: three web app pages and the FinTerm terminal on the private mesh', async ({ page }, info) => {
  await page.goto(`${BASE}/cloud/`);
  const row = page.locator('[data-group="Lnktree"]');
  await expect(row.locator('[data-tile]')).toHaveCount(4);
  for (const [tile, id] of [['omniverse', 'cg-omniverse'], ['cad', 'hardtech-cad'], ['sim2real', 'hardtech-sim2real']] as const) {
    const a = row.locator(`[data-tile="${tile}"]`);
    await expect(a).toHaveAttribute('href', links.find((l) => l.id === id)!.href);
    await expect(a).not.toHaveClass(/grey/);
  }
  const fin = row.locator('[data-tile="finterm"]');
  await expect(fin).toHaveAttribute('href', terminal.href);
  await expect(fin).toHaveAttribute('target', '_blank');
  await expect(fin.getByTestId('mesh-badge')).toBeVisible();
  const host = new URL(terminal.href).host;
  expect(host).toMatch(/\.mesh\.diegonmarcos\.com$|^c3-pvt\.diegonmarcos\.com$/);
  expect(host).not.toMatch(/^(api|www)\.diegonmarcos\.com$/);
  await shot(page, info, 'lnktree-row');
});

test('each Lnktree app page lists its entries: a declared target or a greyed planned card', async ({ page }) => {
  for (const id of ['cg-omniverse', 'hardtech-cad', 'hardtech-sim2real']) {
    for (const [sec, list] of Object.entries(ui[id].stacks).filter(([k]) => k !== 'about')) {
      await page.goto(`${BASE}/${id}/${sec}/`);
      const cards = page.getByTestId('stack-card');
      await expect(cards, `${id}/${sec}`).toHaveCount(list.length);
      for (const [i, e] of list.entries()) {
        const card = cards.nth(i);
        if (e.url) { await expect(card.locator('a.open'), `${id}/${sec}`).toHaveAttribute('href', e.url); await expect(card).not.toHaveAttribute('data-planned', /.*/); }
        else { await expect(card, `${id}/${sec}`).toHaveAttribute('data-planned', 'true'); await expect(card.locator('a.open')).toHaveCount(0); }
      }
    }
  }
});

test('FinTerm: every tab entry deep-links into the terminal (private URL, new tab, lock badge); my-pm stays on the phone', async ({ page }, info) => {
  for (const tab of ['fi', 'eq', 'ex', 'nw', 'pm']) {
    await page.goto(`${BASE}/${finId}/${tab}/`);
    const opens = page.locator('[data-testid="stack-card"] a.open');
    const n = ui[finId].stacks[tab].filter((e) => e.kind === 'dashboard').length;
    await expect(opens, tab).toHaveCount(n);
    for (let i = 0; i < n; i++) {
      await expect(opens.nth(i), tab).toHaveAttribute('href', terminal.href);
      await expect(opens.nth(i), tab).toHaveAttribute('target', '_blank');
      await expect(opens.nth(i).getByTestId('mesh-badge'), tab).toBeVisible();
    }
    if (tab === 'fi') await shot(page, info, 'finterm-fi');
  }
  await page.goto(`${BASE}/${finId}/my-pm/`);
  await expect(page.locator('[data-testid="stack-card"] a.open')).toHaveCount(0);
  await expect(page.getByTestId('stack-card')).toHaveAttribute('data-planned', 'true');
});
