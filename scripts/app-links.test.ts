import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error plain .mjs generator
import { resolveLinks } from './gen-app-links.mjs';

// #1322: the app -> web service mapping (data/app-links.json) and its GENERATED resolution.
const root = join(__dirname, '..');
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const mapping = read('data/app-links.json') as { links: { id: string; kind: string; service?: string; url?: string; href?: string; path?: string }[] };
const resolved = read('packages/cloudy-ui/nav/app-links.json') as { links: { id: string; kind: string; href: string | null; about?: boolean; mesh?: boolean; service?: string }[] };
const services = read('scripts/fallback-services.json') as { services: { slug: string; mesh: string | null; hosts: string[] }[] };
const nav = read('packages/cloudy-ui/nav/nav.json') as { apps: { id: string }[] };
const TILE_ONLY = ['c3-bot', 'ai-chat'];

describe('app-links mapping', () => {
  it('every nav.json fleet app has exactly one mapping entry (plus only the tile-only ids)', () => {
    const ids = mapping.links.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of nav.apps) expect(ids.filter((i) => i === a.id), a.id).toHaveLength(1);
    expect(ids.filter((i) => !nav.apps.some((a) => a.id === i)).sort()).toEqual(TILE_ONLY.slice().sort());
  });

  it('phone-only entries are resolved with an about route flag and no href; all others have an href', () => {
    for (const l of resolved.links) {
      if (l.kind === 'phone-only') { expect(l.about, l.id).toBe(true); expect(l.href, l.id).toBeNull(); expect(nav.apps.some((a) => a.id === l.id), l.id).toBe(true); }
      else { expect(l.about, l.id).toBeUndefined(); expect(l.href, l.id).toBeTruthy(); }
    }
  });

  it('container targets are never hand-typed in the mapping', () => {
    for (const m of mapping.links.filter((l) => l.kind === 'container')) { expect(m.url, m.id).toBeUndefined(); expect(m.href, m.id).toBeUndefined(); expect(m.service, m.id).toBeTruthy(); }
  });

  it('the committed resolution equals a fresh one from the (vendored) containers declarations', () => {
    expect(resolveLinks(mapping, services).links).toEqual(resolved.links);
  });

  it('no private target is a public-internet URL: mesh name or c3-pvt only, never a service public host', () => {
    const publicHosts = new Set(services.services.flatMap((s) => s.hosts));
    for (const l of resolved.links.filter((x) => x.kind === 'container')) {
      const u = new URL(l.href!);
      expect(u.protocol, l.id).toBe('https:');
      expect(/\.mesh\.diegonmarcos\.com$/.test(u.host) || u.host === 'c3-pvt.diegonmarcos.com', `${l.id} ${u.host}`).toBe(true);
      expect(publicHosts.has(u.host), `${l.id} ${u.host} is public`).toBe(false);
      expect(l.mesh, l.id).toBe(true);
    }
  });
});

describe('resolveLinks', () => {
  const svc = { services: [{ slug: 'x', dir: 'd', mesh: 'x.mesh.diegonmarcos.com', hosts: ['x.diegonmarcos.com'] }, { slug: 'y', dir: 'e', mesh: null, hosts: [] }] };
  const one = (m: object, s = svc) => resolveLinks({ links: [{ id: 'a', reason: 'r', ...m }] }, s).links[0];
  it('mesh name first, c3-pvt path route otherwise', () => {
    expect(one({ kind: 'container', service: 'x' }).href).toBe('https://x.mesh.diegonmarcos.com/');
    expect(one({ kind: 'container', service: 'y', path: '/ui/' }).href).toBe('https://c3-pvt.diegonmarcos.com/y/ui/');
  });
  it('fails when a mapped container disappeared', () => {
    expect(() => one({ kind: 'container', service: 'gone' })).toThrow(/no longer|not declared/);
  });
  it('fails when the private URL would be a public host', () => {
    expect(() => one({ kind: 'container', service: 'x' }, { services: [{ ...svc.services[0], hosts: ['x.mesh.diegonmarcos.com'] }] })).toThrow(/public host/);
  });
  it('fails on a duplicate entry', () => {
    expect(() => resolveLinks({ links: [{ id: 'a', kind: 'phone-only', reason: '' }, { id: 'a', kind: 'phone-only', reason: '' }] }, svc)).toThrow(/duplicate/);
  });
});
