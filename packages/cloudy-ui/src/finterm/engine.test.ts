import { describe, expect, it } from 'vitest';
import { FINTERM } from './catalog';
import { FetchError, alloc, buildUrl, failureFor, forwardRate, loadPanel, parseDbnomics, parseFinceptSeries, parseFredCsv, parseGdelt, parseImf, parseWorldBank, placeholderFor, primaryRoute, seen, yieldAt, type Ctx, type Dashboard } from './engine';

const dash = (id: string) => FINTERM.dashboards.find((d) => d.id === id) as Dashboard;
const fred = FINTERM.sources.find((s) => s.id === 'fred')!;
const fin = FINTERM.sources.find((s) => s.id === 'cloud_fincept')!;
const MESH = FINTERM.mesh[fin.fleet_endpoint!];
const TODAY = '2026-10-30';

describe('FRED CSV parse', () => {
  it('reads the date column and one column per series, drops "." and empty cells', () => {
    const r = parseFredCsv('observation_date,DGS10\n2026-10-26,5.00\n2026-10-27,.\n2026-10-28,5.05\n2026-10-29,\n');
    expect(r).toEqual({ DGS10: [{ date: '2026-10-26', value: 5 }, { date: '2026-10-28', value: 5.05 }] });
  });
  it('handles a BOM, CRLF and several series', () => {
    const r = parseFredCsv('﻿observation_date,A,B\r\n2026-10-26,1.5,.\r\n2026-10-27,2.5,3\r\n');
    expect(r.A.map((o) => o.value)).toEqual([1.5, 2.5]);
    expect(r.B).toEqual([{ date: '2026-10-27', value: 3 }]);
  });
  it('an HTML error page or a bad header parses to nothing (a bad answer is "no data")', () => {
    expect(parseFredCsv('<html><body>Access denied</body></html>')).toEqual({});
    expect(parseFredCsv('foo,bar\n1,2')).toEqual({});
    expect(parseFredCsv('')).toEqual({});
  });
});

describe('the other providers', () => {
  it('Fincept topic: {observations} with null values dropped', () => {
    expect(parseFinceptSeries('{"series_id":"X","observations":[{"date":"2026-10-28","value":4.1},{"date":"2026-10-29","value":null}]}')).toEqual([{ date: '2026-10-28', value: 4.1 }]);
    expect(parseFinceptSeries('nope')).toEqual([]);
  });
  it('DBnomics, World Bank, IMF, GDELT', () => {
    const db = parseDbnomics('{"series":{"docs":[{"series_code":"M.US","series_name":"US","period":["2026-08","2026-09"],"value":[4.1,"NA"]}]}}');
    expect(db[0].values).toEqual([4.1, null]);
    expect(parseWorldBank('[{"page":1},[{"countryiso3code":"USA","country":{"value":"United States"},"date":"2024","value":2.9},{"countryiso3code":"X","country":{"value":"X"},"date":"2024","value":null}]]')).toEqual([{ code: 'USA', name: 'United States', year: '2024', value: 2.9 }]);
    expect(parseImf('{"values":{"GGXWDG_NGDP":{"USA":{"2023":120.1,"2024":122.5}}}}', 'GGXWDG_NGDP', ['USA', 'DEU'], { USA: 'United States' })).toEqual([{ code: 'USA', name: 'United States', year: '2024', value: 122.5 }]);
    expect(parseGdelt('{"articles":[{"title":"Yields rise","url":"https://x.test/a","domain":"x.test","seendate":"20261030T120000Z"},{"title":" ","url":"u"}]}')).toEqual([{ title: 'Yields rise', url: 'https://x.test/a', domain: 'x.test', seen: '2026-10-30 12:00' }]);
    expect(seen('garbage')).toBe('garbage');
  });
});

describe('forward rates', () => {
  const flat: [number, number][] = [[1, 5], [10, 5]];
  it('a flat curve implies the same forward everywhere; interpolation is linear and flat outside', () => {
    expect(forwardRate(flat, 2, 3)).toBeCloseTo(5, 9);
    expect(yieldAt([[1, 2], [3, 4]], 2)).toBe(3);
    expect(yieldAt([[1, 2], [3, 4]], 0.1)).toBe(2);
    expect(yieldAt([[1, 2], [3, 4]], 9)).toBe(4);
  });
  it('1y1y on a 1y=2%, 2y=3% curve is (1.03^2/1.02)-1', () => {
    expect(forwardRate([[1, 2], [2, 3]], 1, 1)).toBeCloseTo((Math.pow(1.03, 2) / 1.02 - 1) * 100, 9);
    expect(forwardRate([], 1, 1)).toBeNaN();
  });
});

describe('requests are built from declarations, never typed', () => {
  it('endpoint + path + encoded params in order, {slots} filled, objects as JSON', () => {
    expect(buildUrl('https://h.test/', '/p/{x}', [['a', 'b c'], ['d', '{"k":["v"]}']], { x: 'Z' })).toBe('https://h.test/p/Z?a=b%20c&d=%7B%22k%22%3A%5B%22v%22%5D%7D');
  });
});

// ---- the source fallback order -------------------------------------------------------------------------------------------------------
const csv = (id: string) => `observation_date,${id}\n2026-10-27,4.10\n2026-10-28,4.20\n`;
function harness(opts: { meshUp: boolean; peek?: 'ok' | '404' | 'partial'; fred?: 'ok' | 'blocked' }) {
  const calls: string[] = [];
  const peekHost = new URL(MESH).host;
  const ctx: Ctx = {
    today: TODAY, sources: FINTERM.sources, mesh: FINTERM.mesh,
    reachable: async (u) => { calls.push(`health ${new URL(u).host}`); return opts.meshUp; },
    get: async (u) => {
      const url = new URL(u);
      if (url.host === peekHost) {
        calls.push(`peek ${decodeURIComponent(url.pathname)}`);
        const id = /econ:fred:([^/]+)/.exec(decodeURIComponent(url.pathname))![1];
        if (opts.peek === '404' || (opts.peek === 'partial' && id !== 'DGS10')) throw new FetchError('http', 'HTTP 404', 404);
        return JSON.stringify({ series_id: id, observations: [{ date: '2026-10-28', value: 4.9 }, { date: '2026-10-29', value: 5.0 }] });
      }
      calls.push(`public ${url.host}`);
      if (opts.fred === 'blocked') throw new FetchError('blocked', 'Failed to fetch');
      return csv(url.searchParams.get('id')!);
    },
  };
  return { ctx, calls };
}
const ust = () => dash('yield_curves').panels.find((p) => p.id === 'ust')!;

describe('source order: fin-api on the mesh first, then the public source, then a placeholder', () => {
  it('mesh reachable and the topic published: served by Cloud-Fincept; the public source is never asked', async () => {
    const h = harness({ meshUp: true, peek: 'ok' });
    const d = await loadPanel(ust(), dash('yield_curves'), h.ctx);
    expect(d.servedBy).toBe(fin.name);
    expect(d.asOf).toBe('2026-10-29');
    expect(h.calls.filter((c) => c.startsWith('public'))).toEqual([]);
    expect(h.calls[0]).toBe(`health ${new URL(MESH).host}`);
  });
  it('mesh reachable but a topic is not published (404): that series comes from the public source', async () => {
    const h = harness({ meshUp: true, peek: 'partial' });
    const d = await loadPanel(ust(), dash('yield_curves'), h.ctx);
    expect(d.servedBy).toBe(`${fin.name} + ${fred.name}`);
    expect(h.calls.some((c) => c.startsWith('public'))).toBe(true);
  });
  it('mesh not reachable: no topic is read from it; the public source serves, servedBy is empty', async () => {
    const h = harness({ meshUp: false, peek: 'ok' });
    const d = await loadPanel(ust(), dash('yield_curves'), h.ctx);
    expect(h.calls.filter((c) => c.startsWith('peek'))).toEqual([]);
    expect(d.servedBy).toBe('');
    expect(d.rows.length).toBe(ust().fetch!.series!.length);
  });
  it('public source blocked (CORS) off the mesh: the load fails with a blocked error -> placeholder "Mesh only / CORS"', async () => {
    const h = harness({ meshUp: false, fred: 'blocked' });
    const err = await loadPanel(ust(), dash('yield_curves'), h.ctx).then(() => null, (e) => e);
    expect(err).toBeInstanceOf(FetchError);
    const ph = failureFor(ust(), FINTERM.sources, err);
    expect(ph.reason).toBe('blocked');
    expect(ph.note).toMatch(/Mesh only \/ CORS/);
  });
  it('only a source with a lower priority number than the panel\'s own is a primary route (and only when it feeds the entry)', async () => {
    const ctx = harness({ meshUp: true }).ctx;
    expect(await primaryRoute(ust(), dash('yield_curves'), ctx)).not.toBeNull();
    const dbn = dash('rate_probabilities').panels[0];
    expect(await primaryRoute(dbn, dash('rate_probabilities'), ctx)).toBeNull(); // no primary declared for DBnomics
    const swapped = { ...ust(), fetch: { ...ust().fetch!, primary: { source: 'polygon', topic: 't' } } };
    expect(await primaryRoute(swapped, dash('yield_curves'), ctx)).toBeNull();
  });
});

describe('the derivations', () => {
  it('yield curve: a chart point and a row per tenor, 1d change in bp', async () => {
    const d = await loadPanel(ust(), dash('yield_curves'), harness({ meshUp: false }).ctx);
    expect(d.chart.map((p) => p.x)).toEqual([...d.chart.map((p) => p.x)].sort((a, b) => a - b));
    expect(d.rows[0]).toEqual(['1M', '4.20', '+10.0', '2026-10-28']);
  });
  it('model portfolio allocation is static legs', () => {
    const p = dash('mp_40_60').panels[0];
    const a = alloc(p, dash('mp_40_60').model_portfolio!.legs);
    expect(a.rows).toEqual([['Bonds', '40%'], ['Equity', '60%']]);
  });
});

describe('placeholders say why', () => {
  it('keyed, paid, user-mapped and no-connector sources', () => {
    const by = (dashId: string, panelId: string) => placeholderFor(dash(dashId).panels.find((p) => p.id === panelId)!, FINTERM.sources);
    expect(by('world_equity_indices', 'world').reason).toBe('keyed');
    expect(by('world_equity_indices', 'world').note).toMatch(/no keys/);
    expect(by('yield_curves', 'sovereigns').reason).toBe('user-mapped');
    expect(by('news', 'gov').reason).toBe('no-connector');
  });
});
