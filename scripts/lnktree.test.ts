import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// #1331: the Cloud > Apps "Lnktree" row and its pages, as the SuperApp declares them (nav.json is GENERATED from it).
const root = join(__dirname, '..');
const nav = JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/nav.json'), 'utf8')) as { superapp: { sections: Record<string, any>[] } };
const sec = (id: string) => nav.superapp.sections.find((s) => s.id === id)!;
const titles = (stack: { kind: string; title: string }[]) => stack.filter((p) => p.kind === 'entry').map((p) => p.title);

describe('Lnktree row', () => {
  const row = sec('cloud').tile_groups.find((g: { title: string }) => g.title === 'Lnktree');
  it('is called Lnktree and holds exactly Omniverse, FinTerm, CAD, Sim2Real', () => {
    expect(sec('cloud').tile_groups.map((g: { title: string }) => g.title)).not.toContain('Projects W');
    expect(row.tiles.filter((t: { separator?: boolean }) => !t.separator).map((t: { label: string }) => t.label)).toEqual(['Omniverse', 'FinTerm', 'CAD', 'Sim2Real']);
  });
  it('every tile target is a route the web has (targets.json)', () => {
    const targets = JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/targets.json'), 'utf8')).targets as Record<string, string>;
    for (const t of row.tiles.filter((x: { separator?: boolean }) => !x.separator)) expect(targets[t.target], t.target).toBeTruthy();
  });
});

describe('Lnktree apps (#1335)', () => {
  const row = sec('cloud').tile_groups.find((g: { title: string }) => g.title === 'Lnktree');
  const apps = (JSON.parse(readFileSync(join(root, 'packages/cloudy-ui/nav/nav.json'), 'utf8')) as { apps: { id: string; name: string; dir: string | null; bottom_nav: string[] }[] }).apps;
  it('each tile launches a real app of the Lnktree family (extapp:), and the in-app pages are gone', () => {
    const want: Record<string, string> = { Omniverse: 'extapp:cg-omniverse', FinTerm: 'extapp:capital-finterm', CAD: 'extapp:hardtech-cad', Sim2Real: 'extapp:hardtech-sim2real' };
    for (const t of row.tiles.filter((x: { separator?: boolean }) => !x.separator)) expect(t.target, t.label).toBe(want[t.label]);
    expect(nav.superapp.sections.map((s) => s.id)).not.toContain('finterm');
    for (const k of ['stack_omniverse', 'stack_cad', 'stack_sim2real']) expect(sec('cloud')[k], k).toBeUndefined();
  });
  it('the four apps are fleet apps with their pages from their own build.json (ad_ folders)', () => {
    const by = Object.fromEntries(apps.map((a) => [a.id, a]));
    expect(by['cg-omniverse'].bottom_nav).toEqual(['galaxy', 'game-store', 'vr-store']);
    expect(by['capital-finterm'].bottom_nav).toEqual(['fi', 'eq', 'ex', 'nw', 'pm', 'my-pm']);
    expect(by['hardtech-cad'].bottom_nav).toEqual(['mcad', 'bim', 'solidworks']);
    expect(by['hardtech-sim2real'].bottom_nav).toEqual(['sap2000', 'matlab', 'ansys']);
    expect(by['capital-finterm'].dir).toBe('ad_Capital-FinTerm');
    expect(by['cg-omniverse'].name).toBe('CG-Omniverse');
  });
});
