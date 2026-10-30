import { describe, expect, it } from 'vitest';
import { extract, PORTAL } from './panels';
import { REGISTRY } from './client';

describe('portal panels', () => {
  it('every old /cloud/ page has a route and every panel a registry key', () => {
    expect(PORTAL.map((p) => p.old)).toEqual(expect.arrayContaining(['cloud_control_center.html', 'cloud_control.html', 'architecture.html', 'products.html', 'feed_docs.html', 'c3_gallery.html', 'mcp', 'api']));
    for (const p of PORTAL) for (const k of p.panels) expect(REGISTRY[k.key], `${p.id}/${k.key}`).toBeDefined();
  });
  it('extract reads arrays of objects, wrapped arrays and plain objects', () => {
    expect(extract([{ name: 'a', status: 'up' }])).toEqual([{ title: 'a', subtitle: 'up', meta: '' }]);
    expect(extract({ results: [{ id: 'x', reachable: true }] })).toEqual([{ title: 'x', subtitle: '', meta: 'reachable true' }]);
    expect(extract({ a: 1, _doc: 'x' })).toEqual([{ title: 'a', subtitle: '1', meta: '' }]);
  });
});
