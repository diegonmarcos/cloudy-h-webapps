// cloudy-c3 (#1320 B.7 / M6): the Cloud C3 app's own sections at /cloudy-c3/<section>/<page>/ (the same view model the
// cloud-webapps mimic draws for /cloud-webapps/cloud-c3/..., re-based) plus the old /cloud/ portal pages at
// /cloudy-c3/portal/<page>/. Links into other fleet apps stay on /cloud-webapps/.
import { appView, ROUTES, type AppView } from '../../../../cloudy-webapps/src/lib/server/nav';
import { c3View } from '@cloudy/c3-data/views';
import { dataset } from '@cloudy/c3-data';
import { PORTAL, extract, panelFilter } from '@cloudy/c3-data/panels';

const BASE = '/cloudy-c3';
/** The webapps view of cloud-c3, re-based: /cloudy-c3/cloud-c3/x -> /cloudy-c3/x, any other /cloudy-c3/y -> /cloud-webapps/y. */
function rebase<T>(v: T): T {
  return JSON.parse(JSON.stringify(v), (_k, s) => typeof s === 'string' && s.startsWith(`${BASE}/`)
    ? (s.startsWith(`${BASE}/cloud-c3/`) ? `${BASE}/${s.slice(BASE.length + 10)}` : `/cloud-webapps/${s.slice(BASE.length + 1)}`) : s);
}

export const ENTRIES = [
  ...ROUTES.filter((r) => r.app === 'cloud-c3' && r.kind !== 'portal' && r.path !== 'cloud-c3/').map((r) => r.path.slice('cloud-c3/'.length)),
  'portal/', ...PORTAL.map((p) => `portal/${p.id}/`),
];

export type C3Page = { view: AppView; body: 'app' | 'portal'; data: unknown };
export function c3Page(path: string): C3Page | null {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'portal') {
    const v = appView(BASE, `cloud-c3/${path}`);
    if (!v) return null;
    const view = rebase(v);
    return { view, body: 'app', data: c3View(view.section, view.sub ?? view.page, view.listDetail) };
  }
  const id = parts[1] ?? PORTAL[0].id;
  const page = PORTAL.find((p) => p.id === id);
  if (!page || parts.length > 2) return null;
  const home = rebase(appView(BASE, 'cloud-c3/home/')!);
  const view: AppView = {
    ...home, section: null, sectionLabel: 'Portal', page: page.id, sub: null,
    tabs: PORTAL.map((p) => ({ id: p.id, label: p.label, icon: p.icon, href: `${BASE}/portal/${p.id}/` })), tabSelected: page.id, subtabs: [], subSelected: null,
    title: `${page.label} · Portal · Cloud C3`, path,
    crumbs: [{ label: home.app.name, href: `${BASE}/` }, { label: 'Portal', href: `${BASE}/portal/` }, { label: page.label, href: null }],
    related: PORTAL.map((p) => ({ id: p.id, label: p.label, href: `${BASE}/portal/${p.id}/`, indent: 0, selected: p.id === page.id })),
    mode: 'horizontal_one_row', groups: [], sideItems: [], listDetail: false,
  };
  const snapshot = (key: string) => { try { return dataset(`c3-${key.split('?')[0].replace(/\//g, '-')}`); } catch { return null; } };
  return { view, body: 'portal', data: { page: page.id, caption: page.caption, panels: page.panels.map((p) => ({ ...p, rows: extract(snapshot(p.key), panelFilter(page.id, p.key)) })) } };
}
