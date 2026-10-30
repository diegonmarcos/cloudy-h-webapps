import { describe, expect, it } from 'vitest';
import { c3, MESH_BASE, PUBLIC_BASE, BEARER_KEY, MODE_KEY } from './client';

const store = (m: Record<string, string>) => ({ getItem: (k: string) => m[k] ?? null });
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
describe('c3 client: mesh first, public bearer fallback, snapshot last', () => {
  it('uses the mesh when it answers, and sends it no credential', async () => {
    const calls: [string, RequestInit | undefined][] = [];
    const r = await c3('services', 'snap', { live: true, store: store({ [BEARER_KEY]: 't' }), fetcher: async (u, i) => { calls.push([u, i]); return ok('mesh'); } });
    expect(r).toMatchObject({ data: 'mesh', source: 'mesh' });
    expect(calls[0][0]).toBe(MESH_BASE + '/services');
    expect(JSON.stringify(calls[0][1]?.headers ?? {})).not.toContain('Bearer');
  });
  it('falls back to the public endpoint with the session bearer', async () => {
    const calls: string[] = [];
    const r = await c3('services', 'snap', { live: true, store: store({ [BEARER_KEY]: 'tok' }), fetcher: async (u, i) => {
      calls.push(u); if (u.startsWith(MESH_BASE)) throw new Error('offline');
      expect((i?.headers as Record<string, string>).Authorization).toBe('Bearer tok'); return ok('public');
    } });
    expect(r.source).toBe('public');
    expect(calls).toEqual([MESH_BASE + '/services', PUBLIC_BASE + '/services']);
  });
  it('without a bearer, or when both fail, it is the snapshot', async () => {
    const r1 = await c3('services', 'snap', { live: true, store: store({}), fetcher: async () => { throw new Error('x'); } });
    expect(r1).toMatchObject({ data: 'snap', source: 'snapshot' });
    const r2 = await c3('services', 'snap', { live: true, store: store({ [BEARER_KEY]: 't' }), fetcher: async () => new Response('', { status: 401 }) });
    expect(r2.source).toBe('snapshot');
    expect(r2.errors).toEqual(['mesh: HTTP 401', 'public: HTTP 401']);
  });
  it('snapshot mode never touches the network', async () => {
    const r = await c3('services', 'snap', { store: store({ [MODE_KEY]: 'snapshot' }), fetcher: async () => { throw new Error('called'); } });
    expect(r.source).toBe('snapshot');
  });
});
