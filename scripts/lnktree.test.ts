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

describe('Lnktree pages', () => {
  it('Omniverse, CAD and Sim2Real list the owner entries', () => {
    expect(titles(sec('cloud').stack_omniverse)).toEqual(['Galaxy', 'Game Store', 'VR Store']);
    expect(titles(sec('cloud').stack_cad)).toEqual(['MCAD', 'BIM', 'SolWrk']);
    expect(titles(sec('cloud').stack_sim2real)).toEqual(['SAP2000', 'MATLAB', 'Ansys']);
  });
  it('FinTerm has the six tabs in order', () => {
    expect(sec('finterm').pages.map((p: { label: string }) => p.label)).toEqual(['FI', 'EQ', 'EX', 'NW', 'PM', 'MY-PM']);
    expect(titles(sec('finterm').stack_fi)).toEqual(['Yield Curves', 'Forward Rates', 'World Interest Rate Probabilities', 'World Bonds']);
    expect(titles(sec('finterm').stack_pm)).toEqual(expect.arrayContaining(['Portfolio & Risk Analytics', '40/60', '70/30', '60/40', '30/70', '70/30 DM/EM']));
  });
  it('an entry has a url resolved from its declared source, or is planned with no url (never both, never neither)', () => {
    for (const s of nav.superapp.sections) for (const [k, v] of Object.entries(s)) {
      if (!k.startsWith('stack_') || !Array.isArray(v)) continue;
      for (const e of v.filter((p: { kind: string }) => p.kind === 'entry')) {
        expect(Boolean(e.url) !== Boolean(e.planned), `${s.id}/${k}/${e.title}`).toBe(true);
        for (const f of ['site', 'registry', 'repo', 'path']) expect(e[f], `${e.title} still carries source field ${f}`).toBeUndefined();
        if (e.url) expect(e.url).toMatch(/^https:\/\//);
        if (e.planned) expect(e.note, e.title).toBeTruthy();
      }
    }
  });
});
