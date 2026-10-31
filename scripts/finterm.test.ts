import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-expect-error plain .mjs generator
import { buildFinterm, slugOf } from './gen-finterm.mjs';

// #1342: the web FinTerm declarations are GENERATED from the Android app's data (gen-finterm.mjs, `--check` in CI), never retyped.
const root = join(__dirname, '..');
const J = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const fin = J('packages/cloudy-ui/nav/finterm.json');

const ANDROID = {
  sources: { sources: [
    { id: 'cloud_fincept', name: 'Cloud', priority: 0, primary: true, endpoint: '', fleet_endpoint: 'fin-api', paths: { health: '/health', peek: '/p/{topic}' }, auth: { type: 'none', note: 'x' }, feeds: [{ tab: 'fi', entries: ['*'] }], _doc: 'prose' },
    { id: 'fred', name: 'FRED', priority: 10, endpoint: 'https://f.test/g.csv', auth: { type: 'none' }, connector: 'fred_series', feeds: [{ tab: 'fi', entries: ['Yield Curves'] }] },
  ] },
  dashboards: { _doc: 'x', dashboards: [{ id: 'yield_curves', entry: 'Yield Curves', tab: 'fi', panels: [{ id: 'ust', title: 'UST', source: 'fred', view: 'curve' }] }] },
  build: { ui: { bottom_nav: ['fi', 'eq', 'ex', 'nw', 'pm', 'my-pm'], stacks: {
    fi: [{ kind: 'dashboard', title: 'Yield Curves', subtitle: 'Sub', dashboard: 'yield_curves' }], eq: [], ex: [], nw: [], pm: [{ kind: 'section_title', title: 'T' }] } } },
  services: { services: [{ slug: 'fin-api', mesh: 'fin-api.mesh.example.test' }] },
  appId: 'the-app',
};
const clone = () => JSON.parse(JSON.stringify(ANDROID));

describe('gen-finterm (pure)', () => {
  it('maps every stack entry to its dashboard, derives the mesh base from the containers declaration, strips _doc prose', () => {
    const o = buildFinterm(ANDROID);
    expect(o.mesh).toEqual({ 'fin-api': 'https://fin-api.mesh.example.test' });
    expect(o.dashboards[0]).toMatchObject({ id: 'yield_curves', slug: 'yield-curves', subtitle: 'Sub', tab: 'fi' });
    expect(JSON.stringify(o)).not.toContain('prose');
    expect(o.app_id).toBe('the-app');
  });
  it('embeds exactly the declared data files a panel reads through an asset: source, and fails loudly on a missing one (#1351)', () => {
    const a = clone();
    a.sources.sources.push({ id: 'cb', name: 'CB', priority: 10, endpoint: 'asset:', auth: { type: 'none' }, connector: 'declared_events', feeds: [{ tab: 'fi', entries: ['Yield Curves'] }] });
    a.dashboards.dashboards[0].panels.push({ id: 'm', title: 'M', source: 'cb', view: 'calendar', derive: 'events', fetch: { provider: 'declared_events', path: 'banks.json' } });
    expect(() => buildFinterm(a)).toThrow(/declared data file banks.json/);
    const o = buildFinterm({ ...a, declared: { 'banks.json': { _doc: 'prose', banks: [] }, 'other.json': {} } });
    expect(o.declared).toEqual({ 'banks.json': { banks: [] } });
  });
  it('carries the per-source cors flag through (false = a browser cannot read it), and leaves it out when undeclared', () => {
    const a = clone(); a.sources.sources[1].cors = false;
    const o = buildFinterm(a);
    expect(o.sources.find((s: { id: string }) => s.id === 'fred').cors).toBe(false);
    expect('cors' in o.sources.find((s: { id: string }) => s.id === 'cloud_fincept')).toBe(false);
  });
  it('fails loudly on a contradiction: unknown dashboard, entry/tab mismatch, unmapped dashboard, unknown source, undeclared container', () => {
    let a = clone(); a.build.ui.stacks.fi[0].dashboard = 'nope'; expect(() => buildFinterm(a)).toThrow(/no dashboard nope/);
    a = clone(); a.build.ui.stacks.fi[0].title = 'Other'; expect(() => buildFinterm(a)).toThrow(/ui.stacks says/);
    a = clone(); a.dashboards.dashboards.push({ id: 'extra', entry: 'E', tab: 'eq', panels: [] }); expect(() => buildFinterm(a)).toThrow(/maps 1/);
    a = clone(); a.dashboards.dashboards[0].panels[0].source = 'ghost'; expect(() => buildFinterm(a)).toThrow(/unknown source ghost/);
    a = clone(); a.services.services = []; expect(() => buildFinterm(a)).toThrow(/not declared in cloudy-u-containers/);
  });
  it('slug: lower-case, underscores to dashes', () => { expect(slugOf('mp_70_30_DM_EM')).toBe('mp-70-30-dm-em'); });
});

describe('gen-finterm --check (the CI drift guard)', () => {
  const sandbox = () => {
    const t = mkdtempSync(join(tmpdir(), 'finterm-'));
    const android = join(t, 'android/ad_Capital-Test'); const site = join(t, 'site');
    mkdirSync(join(android, 'data'), { recursive: true }); mkdirSync(join(site, 'packages/cloudy-ui/nav'), { recursive: true }); mkdirSync(join(site, 'scripts'), { recursive: true });
    const put = (f: string, v: unknown) => writeFileSync(f, JSON.stringify(v));
    put(join(android, 'data/sources.json'), ANDROID.sources); put(join(android, 'data/dashboards.json'), ANDROID.dashboards); put(join(android, 'build.json'), ANDROID.build);
    put(join(site, 'packages/cloudy-ui/nav/nav.json'), { apps: [{ id: 'the-app', dir: 'ad_Capital-Test' }] }); put(join(site, 'scripts/fallback-services.json'), ANDROID.services);
    return { t, android: join(t, 'android'), site, file: join(site, 'packages/cloudy-ui/nav/finterm.json') };
  };
  const run = (s: ReturnType<typeof sandbox>, ...extra: string[]) => spawnSync('node', [join(root, 'scripts/gen-finterm.mjs'), '--android', s.android, '--root', s.site, ...extra], { encoding: 'utf8' });
  it('passes right after a generation, fails when the committed file is edited, fails when the Android data moves', () => {
    const s = sandbox();
    expect(run(s).status).toBe(0);
    expect(run(s, '--check').status).toBe(0);
    writeFileSync(s.file, readFileSync(s.file, 'utf8').replace('"Sub"', '"Hand edited"'));
    expect(run(s, '--check').status).toBe(1);
    expect(run(s).status).toBe(0);
    const b = JSON.parse(readFileSync(join(s.android, 'ad_Capital-Test/data/dashboards.json'), 'utf8'));
    b.dashboards[0].panels[0].title = 'Changed upstream';
    writeFileSync(join(s.android, 'ad_Capital-Test/data/dashboards.json'), JSON.stringify(b));
    expect(run(s, '--check').status).toBe(1);
  });
});

describe('the committed web FinTerm declarations', () => {
  it('28 dashboards: FI 7, EQ 5, EX 4, NW 3, PM 9 (the APK entries), each with at least one panel', () => {
    const by = (t: string) => fin.dashboards.filter((d: { tab: string }) => d.tab === t).length;
    expect([by('fi'), by('eq'), by('ex'), by('nw'), by('pm')]).toEqual([7, 5, 4, 3, 9]);
    expect(fin.dashboards).toHaveLength(28);
    for (const d of fin.dashboards) expect(d.panels.length, d.id).toBeGreaterThan(0);
  });
  it('every panel is a live fetch, a dashed placeholder or a static allocation; every source named exists', () => {
    const ids = new Set(fin.sources.map((s: { id: string }) => s.id));
    for (const d of fin.dashboards) for (const p of d.panels) {
      expect(Number(Boolean(p.fetch)) + Number(Boolean(p.placeholder)) + Number(p.view === 'alloc'), `${d.id}/${p.id}`).toBe(1);
      expect(ids.has(p.source), `${d.id}/${p.id}`).toBe(true);
    }
  });
  it('the mesh base is derived from the cloudy-u-containers declaration, never a public host', () => {
    const svc = J('scripts/fallback-services.json').services.find((s: { slug: string }) => s.slug === 'capital-stack-finterminal-api');
    expect(fin.mesh['capital-stack-finterminal-api']).toBe(`https://${svc.mesh}`);
    expect(svc.hosts).not.toContain(new URL(fin.mesh['capital-stack-finterminal-api']).host);
  });
  it('the Backend (mesh) link is derived too: lock badge data, no typed url in the mapping', () => {
    const map = J('data/app-links.json').links.find((l: { id: string }) => l.id === fin.app_id);
    expect(map.kind).toBe('webapp');
    expect(map.backend.href).toBeUndefined(); expect(map.backend.url).toBeUndefined();
    const l = J('packages/cloudy-ui/nav/app-links.json').links.find((x: { id: string }) => x.id === fin.app_id);
    expect(l.kind).toBe('webapp');
    expect(l.href).toBe(`/cloud-webapps/${fin.app_id}/`);
    expect(l.backend).toMatchObject({ label: 'Backend (mesh)', mesh: true, href: `${fin.mesh['capital-stack-finterminal-api']}/api/v1/info` });
    expect(l.alias_ids).toBeUndefined();
    expect(J('data/app-links.json').links.find((x: { id: string }) => x.id === fin.app_id).alias_ids).toContain('capital-finterm');
  });
});

describe('no hand-typed URLs in the web terminal code', () => {
  const walk = (d: string): string[] => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
  const files = [
    ...walk(join(root, 'packages/cloudy-ui/src/finterm')).filter((f) => /\.(ts|svelte)$/.test(f) && !/\.test\./.test(f)),
    ...walk(join(root, 'sites/cloudy-webapps/src/routes/[app=fintermApp]')),
    join(root, 'sites/cloudy-webapps/src/params/fintermApp.ts'),
  ];
  it('finds the code under test', () => { expect(files.length).toBeGreaterThanOrEqual(5); });
  it('no http(s):// or wss:// literal in code (addresses come from finterm.json: endpoint + path + params)', () => {
    for (const f of files) {
      const code = readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
      expect(code, f).not.toMatch(/(https?|wss?):\/\//);
    }
  });
  it('every endpoint in the declarations is https (or wss) and every request address is endpoint + path', () => {
    for (const s of fin.sources) if (s.endpoint) expect(s.endpoint, s.id).toMatch(/^(https|wss):\/\//);
    for (const d of fin.dashboards) for (const p of d.panels) if (p.fetch?.path) expect(p.fetch.path, `${d.id}/${p.id}`).toMatch(/^\//);
  });
});
