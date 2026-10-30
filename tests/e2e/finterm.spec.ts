import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { shot } from './shot';
import { BASE } from './helpers';

// #1342: the web FinTerm. Every address, tab, dashboard and source is READ from the generated declarations (finterm.json, app-links.json); none is typed here.
// The browser has no network in these tests except what a test routes in: a panel is data (a routed answer) or a dashed placeholder with its reason.
const J = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const fin = J('packages/cloudy-ui/nav/finterm.json') as {
  app_id: string; mesh: Record<string, string>;
  stacks: Record<string, { kind: string; title: string; dashboard?: string }[]>;
  sources: { id: string; name: string; endpoint: string; fleet_endpoint?: string; paths?: Record<string, string> }[];
  dashboards: { id: string; slug: string; tab: string; entry: string; panels: { id: string; source: string; fetch?: unknown; placeholder?: unknown; view: string }[] }[];
};
const link = (J('packages/cloudy-ui/nav/app-links.json').links as { id: string; href: string; backend: { href: string } }[]).find((l) => l.id === fin.app_id)!;
const src = (id: string) => fin.sources.find((s) => s.id === id)!;
const LOCAL = /^http:\/\/127\.0\.0\.1:/;

/** Offline except for what `answer` returns for a host: an unrouted external request fails like a CORS-blocked or off-mesh one. */
async function net(page: Page, answer: (url: URL) => { status?: number; body: string; type?: string } | null = () => null) {
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (LOCAL.test(u)) return route.continue();
    const a = answer(new URL(u));
    if (!a) return route.abort();
    return route.fulfill({ status: a.status ?? 200, contentType: a.type ?? 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: a.body });
  });
}
const settle = (page: Page) => expect(page.locator('[data-state="loading"]')).toHaveCount(0, { timeout: 15_000 });

test('each FinTerm tab lists its dashboards as web pages, plus the Backend (mesh) link with the lock badge', async ({ page }, info) => {
  await net(page);
  for (const tab of ['fi', 'eq', 'ex', 'nw', 'pm']) {
    await page.goto(`${BASE}/${fin.app_id}/${tab}/`);
    const entries = fin.stacks[tab];
    const cards = page.getByTestId('stack-card');
    await expect(cards, tab).toHaveCount(entries.length + 1);
    for (const [i, e] of entries.entries()) {
      if (e.kind !== 'dashboard') { await expect(cards.nth(i).locator('a.open'), `${tab}/${e.title}`).toHaveCount(0); continue; }
      const d = fin.dashboards.find((x) => x.id === e.dashboard)!;
      const open = cards.nth(i).locator('a.open');
      await expect(open, `${tab}/${e.title}`).toHaveAttribute('href', `${BASE}/${fin.app_id}/${tab}/${d.slug}/`);
      await expect(open).not.toHaveAttribute('target', '_blank');
      await expect(open.getByTestId('mesh-badge')).toHaveCount(0);
    }
    const back = cards.nth(entries.length).locator('a.open');
    await expect(cards.nth(entries.length)).toContainText('Backend (mesh)');
    await expect(back).toHaveAttribute('href', link.backend.href);
    await expect(back).toHaveAttribute('target', '_blank');
    await expect(back.getByTestId('mesh-badge')).toBeVisible();
    expect(new URL(link.backend.href).host).toMatch(/\.mesh\.diegonmarcos\.com$|^c3-pvt\.diegonmarcos\.com$/);
    if (tab === 'fi') await shot(page, info, 'finterm-fi-tab');
  }
  await page.goto(`${BASE}/${fin.app_id}/my-pm/`);
  await expect(page.locator('[data-testid="stack-card"] a.open')).toHaveCount(0);
  await expect(page.getByTestId('stack-card')).toHaveAttribute('data-planned', 'true');
});

test('each of the 17 dashboards renders: every panel is data or a placeholder that says why', async ({ page }) => {
  expect(fin.dashboards).toHaveLength(17);
  await net(page);
  for (const d of fin.dashboards) {
    await page.goto(`${BASE}/${fin.app_id}/${d.tab}/${d.slug}/`);
    await expect(page.getByTestId('finterm-dash'), d.id).toHaveAttribute('data-dash', d.id);
    await settle(page);
    const panels = page.getByTestId('finterm-panel');
    await expect(panels, d.id).toHaveCount(d.panels.length);
    for (const [i, p] of d.panels.entries()) {
      const panel = panels.nth(i);
      const state = (await panel.getAttribute('data-state'))!;
      expect(state, `${d.id}/${p.id}`).toMatch(/^(data|placeholder-(keyed|user-mapped|no-connector|blocked))$/);
      if (state === 'data') { await expect(panel.getByTestId('finterm-chart').or(panel.getByTestId('finterm-table')), `${d.id}/${p.id}`).not.toHaveCount(0); }
      else { await expect(panel.getByTestId('finterm-note'), `${d.id}/${p.id}`).not.toBeEmpty(); await expect(panel.getByTestId('finterm-placeholder')).toBeVisible(); }
      if (p.fetch) expect(state, `${d.id}/${p.id}: offline fetch panel`).toBe('placeholder-blocked');
      await expect(panel.getByTestId('finterm-attr'), `${d.id}/${p.id}`).toContainText(src(p.source).name);
    }
  }
});

test('a blocked public source is a dashed placeholder saying "Mesh only / CORS" (no proxy)', async ({ page }) => {
  await net(page);
  await page.goto(`${BASE}/${fin.app_id}/fi/yield-curves/`);
  await settle(page);
  const ust = page.locator('[data-panel="ust"]');
  await expect(ust).toHaveAttribute('data-state', 'placeholder-blocked');
  await expect(ust.getByTestId('finterm-note')).toContainText('Mesh only / CORS');
});

test('FI Yield Curves: FRED is cors false so the web goes straight to DBnomics; chart, table, last updated and attribution', async ({ page }, info) => {
  const fred = src('fred');
  const dbn = src('dbnomics');
  const asked: string[] = [];
  await net(page, (u) => {
    asked.push(u.host);
    if (u.host !== new URL(dbn.endpoint).host) return null;
    const code = u.pathname.split('/').pop()!;
    return { type: 'application/json', body: JSON.stringify({ series: { docs: [{ series_code: code, series_name: 'x', period: ['2026-10-27', '2026-10-28', '2026-10-29'], value: [4.1, 4.25, 'NA'] }] } }) };
  });
  await page.goto(`${BASE}/${fin.app_id}/fi/yield-curves/`);
  await settle(page);
  const ust = page.locator('[data-panel="ust"]');
  await expect(ust).toHaveAttribute('data-state', 'data');
  await expect(ust.getByTestId('finterm-chart')).toBeVisible();
  await expect(ust.getByTestId('finterm-table').locator('tbody tr')).toHaveCount(11);
  await expect(ust.getByTestId('finterm-asof')).toHaveText('2026-10-28');
  // the separator keeps its spaces: "Last updated: 2026-10-28 · Source: DBnomics"
  await expect(ust.getByTestId('finterm-meta')).toHaveText(`Last updated: 2026-10-28 · Source: ${dbn.name}`);
  expect(asked).not.toContain(new URL(fred.endpoint).host);
  await expect(ust.getByTestId('finterm-attr')).toContainText(fred.name);
  // the keyed panel of the same dashboard stays dashed
  await expect(page.locator('[data-panel="sovereigns"]')).toHaveAttribute('data-state', /placeholder-/);
  await shot(page, info, 'finterm-yield-curves');
});

test('on the mesh fin-api serves first: the topic answer wins and the page says so', async ({ page }) => {
  const api = src('cloud_fincept');
  const base = new URL(fin.mesh[api.fleet_endpoint!]);
  const asked: string[] = [];
  await net(page, (u) => {
    asked.push(u.host);
    if (u.host !== base.host) return null;
    if (u.pathname === api.paths!.health) return { body: '{"status":"ok"}', type: 'application/json' };
    const id = /econ:fred:([^/]+)/.exec(decodeURIComponent(u.pathname))![1];
    return { body: JSON.stringify({ series_id: id, observations: [{ date: '2099-01-01', value: 3.5 }] }), type: 'application/json' };
  });
  await page.goto(`${BASE}/${fin.app_id}/fi/yield-curves/`);
  await settle(page);
  const ust = page.locator('[data-panel="ust"]');
  await expect(ust).toHaveAttribute('data-state', 'data');
  await expect(ust.getByTestId('finterm-meta')).toContainText(`Source: ${api.name}`);
  expect(asked).not.toContain(new URL(src('fred').endpoint).host);
});
