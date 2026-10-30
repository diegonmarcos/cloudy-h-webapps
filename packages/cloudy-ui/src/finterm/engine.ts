// The web FinTerm engine (#1342): a port of the APK's Engine.kt / Providers.kt / FredCsv.kt / Forward.kt / Priority. Pure apart from the
// `get` it is given. It builds every request from the GENERATED declarations (nav/finterm.json: endpoint + path + params); no address is typed
// here. Source order of a panel: the own-fleet primary (fin-api on the private mesh) when it is declared, feeds the entry and answers, series by
// series; then the panel's own key-free public source; a keyed source or one a browser cannot reach is a dashed placeholder with its reason.

export type Obs = { date: string; value: number };
export type ChartPoint = { label: string; x: number; y: number };
export type PanelData = { columns: string[]; rows: string[][]; links: string[]; chart: ChartPoint[]; asOf: string; note: string; servedBy: string };

export type Feed = { tab: string; entries: string[] };
export type Source = {
  id: string; name: string; category?: string; primary?: boolean; priority: number; coverage?: string; endpoint: string; fleet_endpoint?: string; docs?: string;
  paths?: Record<string, string>; connector?: string | null; feeds: Feed[]; attribution?: string; user_endpoint?: boolean; auth: { type: string; signup?: string };
};
export type Fetch = {
  provider: string; lookback_days?: number; path?: string; params?: Record<string, unknown>; countries?: string[]; country_names?: Record<string, string>; labels?: Record<string, string>;
  series?: { id: string; label: string; years?: number; ccy?: string; quote?: string; pair?: string }[];
  forward?: { grid: number[][]; curve_length?: number; curve_max_start?: number };
  primary?: { source: string; topic: string };
};
export type Panel = {
  id: string; title: string; source: string; view: string; derive?: string; fetch?: Fetch; columns?: string[]; unit?: string; chart_value?: string; change_unit?: string;
  placeholder?: { columns: string[]; rows: number };
};
export type Dashboard = { id: string; slug: string; entry: string; tab: string; subtitle: string; panels: Panel[]; model_portfolio?: { legs: [string, number][] } };
export type Catalog = { mesh: Record<string, string>; sources: Source[]; dashboards: Dashboard[] };

/** A request failure: `blocked` = the browser could not read the answer (CORS, off the mesh, offline), `http` = the server answered an error. */
export class FetchError extends Error {
  constructor(public kind: 'blocked' | 'http', message: string, public status = 0) { super(message); }
}
export type Get = (url: string) => Promise<string>;

// ------------------------------------------------------------------ requests

const enc = (s: string) => encodeURIComponent(s);
/** endpoint + path + the parameters, percent-encoded, in the order given; `path` may carry {name} slots. An object value is sent as its JSON text. */
export function buildUrl(endpoint: string, path: string, params: [string, string][], slots: Record<string, string> = {}): string {
  let p = path;
  for (const [k, v] of Object.entries(slots)) p = p.split(`{${k}}`).join(v);
  const q = params.map(([k, v]) => `${enc(k)}=${enc(v)}`).join('&');
  return endpoint.replace(/\/+$/, '') + p + (q ? `?${q}` : '');
}
export const paramsOf = (f: Fetch): [string, string][] => Object.entries(f.params ?? {}).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]);
export function minusDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}
/** One FRED series from `lookback` days before `today`: the public graph endpoint honours the window for a single series only. */
export const fredUrl = (endpoint: string, id: string, today: string, lookback: number) => buildUrl(endpoint, '', [['id', id], ['cosd', minusDays(today, lookback)]]);

// ------------------------------------------------------------------ parsers

/** The CSV the public FRED graph endpoint serves: header (date column, then one column per series), one row per date; "." or empty = missing. Anything else parses to nothing. */
export function parseFredCsv(csv: string): Record<string, Obs[]> {
  const lines = csv.replace(/^﻿/, '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return {};
  const head = lines[0].split(',').map((c) => c.trim());
  if (head.length < 2 || !['observation_date', 'date'].includes(head[0].toLowerCase())) return {};
  const ids = head.slice(1);
  const out: Record<string, Obs[]> = Object.fromEntries(ids.map((i) => [i, [] as Obs[]]));
  for (const line of lines.slice(1)) {
    const cells = line.split(',');
    if (cells.length < 2) continue;
    const date = cells[0].trim();
    ids.forEach((id, i) => {
      const v = (cells[i + 1] ?? '').trim();
      if (v === '' || v === '.') return;
      const n = Number(v);
      if (Number.isFinite(n)) out[id].push({ date, value: n });
    });
  }
  return out;
}
/** A DataHub topic of the Fincept backend's FRED connector: {series_id, observations:[{date, value}]}; a null value is dropped. */
export function parseFinceptSeries(json: string): Obs[] {
  const o = safe(json);
  const arr = Array.isArray(o?.observations) ? (o.observations as { date?: unknown; value?: unknown }[]) : [];
  return arr.filter((x) => typeof x?.value === 'number' && Number.isFinite(x.value)).map((x) => ({ date: String(x.date ?? ''), value: x.value as number }));
}
const safe = (json: string): any => { try { return JSON.parse(json); } catch { return null; } };

export type Series = { code: string; name: string; periods: string[]; values: (number | null)[] };
export function parseDbnomics(json: string): Series[] {
  const docs = safe(json)?.series?.docs;
  if (!Array.isArray(docs)) return [];
  return docs.map((d: any) => ({ code: String(d.series_code ?? ''), name: String(d.series_name ?? ''), periods: (d.period ?? []).map(String),
    values: (d.value ?? []).map((v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)) }));
}
const latestOf = (s: Series): [string, number] | null => {
  for (let i = s.values.length - 1; i >= 0; i--) if (s.values[i] !== null) return [s.periods[i] ?? '', s.values[i] as number];
  return null;
};
export type CountryValue = { code: string; name: string; year: string; value: number };
export function parseWorldBank(json: string): CountryValue[] {
  const rows = safe(json)?.[1];
  if (!Array.isArray(rows)) return [];
  return rows.filter((r: any) => typeof r?.value === 'number' && Number.isFinite(r.value))
    .map((r: any) => ({ code: String(r.countryiso3code ?? ''), name: String(r.country?.value ?? ''), year: String(r.date ?? ''), value: r.value as number }));
}
export function parseImf(json: string, indicator: string, countries: string[], names: Record<string, string>): CountryValue[] {
  const by = safe(json)?.values?.[indicator];
  if (!by) return [];
  const out: CountryValue[] = [];
  for (const c of countries) {
    const years = by[c];
    if (!years) continue;
    const ys = Object.keys(years).filter((y) => typeof years[y] === 'number').sort();
    const best = ys[ys.length - 1];
    if (best) out.push({ code: c, name: names[c] ?? c, year: best, value: years[best] });
  }
  return out;
}
export type Article = { title: string; url: string; domain: string; seen: string };
/** 20261030T120000Z -> "2026-10-30 12:00"; anything else is kept as it came. */
export function seen(raw: string): string {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})\d{2}Z$/.exec(raw);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : raw;
}
export function parseGdelt(json: string): Article[] {
  const arr = safe(json)?.articles;
  if (!Array.isArray(arr)) return [];
  return arr.map((a: any) => ({ title: String(a.title ?? ''), url: String(a.url ?? ''), domain: String(a.domain ?? ''), seen: seen(String(a.seendate ?? '')) })).filter((a) => a.title.trim() !== '');
}

// ------------------------------------------------------------------ forward rates

/** Yield (percent) at maturity t years: linear between the points, flat outside. NaN for an empty curve. */
export function yieldAt(curve: [number, number][], t: number): number {
  if (!curve.length) return NaN;
  if (t <= curve[0][0]) return curve[0][1];
  if (t >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
  for (let i = 1; i < curve.length; i++) {
    const [t1, y1] = curve[i - 1];
    const [t2, y2] = curve[i];
    if (t <= t2) return t2 === t1 ? y2 : y1 + ((y2 - y1) * (t - t1)) / (t2 - t1);
  }
  return curve[curve.length - 1][1];
}
/** Forward rate (percent) from `start` for `length` years, par yields treated as annually compounded spot rates: ((1+y(s+l))^(s+l) / (1+y(s))^s)^(1/l) - 1. */
export function forwardRate(curve: [number, number][], start: number, length: number): number {
  if (!curve.length || length <= 0 || start < 0) return NaN;
  const end = start + length;
  const grownEnd = Math.pow(1 + yieldAt(curve, end) / 100, end);
  const grownStart = start === 0 ? 1 : Math.pow(1 + yieldAt(curve, start) / 100, start);
  return (Math.pow(grownEnd / grownStart, 1 / length) - 1) * 100;
}
export const forwardCurve = (curve: [number, number][], length: number, maxStart: number): [number, number][] =>
  Array.from({ length: maxStart + 1 }, (_, s) => [s, forwardRate(curve, s, length)] as [number, number]).filter((p) => Number.isFinite(p[1]));

// ------------------------------------------------------------------ format

export const num = (v: number, d: number) => (Number.isFinite(v) ? v.toFixed(d) : '-');
export const group = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const sig = (v: number) => (!Number.isFinite(v) ? '-' : Math.abs(v) >= 100 ? v.toFixed(2) : Math.abs(v) >= 1 ? v.toFixed(4) : v.toFixed(5));
const signed = (v: number, d: number) => (v >= 0 ? '+' : '') + v.toFixed(d);
const change = (last: Obs, prev: Obs | undefined, scale: number, d: number) => (prev ? signed((last.value - prev.value) * scale, d) : '-');
const pct = (last: Obs, prev?: Obs) => (!prev || prev.value === 0 ? null : (last.value / prev.value - 1) * 100);
const pctChange = (last: Obs, prev?: Obs) => { const p = pct(last, prev); return p === null ? '-' : signed(p, 2); };
const years = (v: number) => (v === Math.floor(v) ? String(v) : num(v, 1));

// ------------------------------------------------------------------ engine

export type PrimaryRoute = { source: Source; base: string; topic: string; peek: string };
export type Ctx = { get: Get; today: string; sources: Source[]; mesh: Record<string, string>; reachable: (healthUrl: string) => Promise<boolean> };

const feedsEntry = (s: Source, tab: string, entry: string) => s.feeds.some((f) => f.tab === tab && (f.entries.includes('*') || f.entries.includes(entry)));

/** The panel's preferred route: the declared primary source (priority below the panel's own, feeds the entry, has a mesh base) when it answers its health path; else null. */
export async function primaryRoute(panel: Panel, dash: Dashboard, ctx: Pick<Ctx, 'sources' | 'mesh' | 'reachable'>): Promise<PrimaryRoute | null> {
  const p = panel.fetch?.primary;
  if (!p) return null;
  const src = ctx.sources.find((s) => s.id === p.source);
  const own = ctx.sources.find((s) => s.id === panel.source);
  if (!src || !own || !feedsEntry(src, dash.tab, dash.entry) || src.priority >= own.priority) return null;
  const base = ctx.mesh[src.fleet_endpoint ?? ''] ?? '';
  const peek = src.paths?.peek ?? '';
  const health = src.paths?.health ?? '';
  if (!base || !peek || !(await ctx.reachable(base.replace(/\/+$/, '') + health))) return null;
  return { source: src, base, topic: p.topic, peek };
}

type FredSeries = { spec: NonNullable<Fetch['series']>[number]; obs: Obs[]; viaPrimary: boolean; last: Obs; prev?: Obs };

export async function loadPanel(panel: Panel, dash: Dashboard, ctx: Ctx): Promise<PanelData> {
  const f = panel.fetch;
  const source = ctx.sources.find((s) => s.id === panel.source);
  if (!f || !source) throw new Error(`panel ${panel.id} has no fetch`);
  let data: PanelData;
  switch (panel.derive) {
    case 'latest_curve': case 'forward_grid': case 'level_change': case 'fx_spot': case 'fx_cross': data = await fredPanel(panel, dash, source, f, ctx); break;
    case 'latest_per_series': data = await perSeries(panel, source, f, ctx); break;
    case 'imf_latest': data = await imf(panel, source, f, ctx); break;
    case 'worldbank_latest': data = await worldBank(panel, source, f, ctx); break;
    case 'articles': data = await articles(panel, source, f, ctx); break;
    default: throw new Error(`unknown derive ${panel.derive}`);
  }
  if (!data.rows.length && !data.chart.length) throw new Error('no data');
  return data;
}

/** The static allocation of a model portfolio: its legs as rows and bars. */
export const alloc = (panel: Panel, legs: [string, number][]): PanelData => ({
  columns: panel.columns ?? ['Asset class', 'Weight'], rows: legs.map(([l, w]) => [l, `${w}%`]), links: [], chart: legs.map(([l, w], i) => ({ label: l, x: i, y: w })), asOf: '', note: '', servedBy: '',
});

async function fredPanel(panel: Panel, dash: Dashboard, source: Source, f: Fetch, ctx: Ctx): Promise<PanelData> {
  const route = await primaryRoute(panel, dash, ctx);
  const lookback = f.lookback_days ?? 30;
  const from = minusDays(ctx.today, lookback);
  const specs = f.series ?? [];
  const errs: unknown[] = [];
  const got = await Promise.all(specs.map(async (spec): Promise<FredSeries | null> => {
    let obs: Obs[] = [];
    let via = false;
    if (route) {
      try {
        const url = buildUrl(route.base, route.peek, [], { topic: route.topic.split('{id}').join(spec.id) });
        obs = parseFinceptSeries(await ctx.get(url)).filter((o) => o.date >= from);
        via = obs.length > 0;
      } catch { obs = []; } // a topic the container has not published (404) or a mesh that stopped answering: this series comes from the public source
    }
    if (!obs.length) {
      try { obs = parseFredCsv(await ctx.get(fredUrl(source.endpoint, spec.id, ctx.today, lookback)))[spec.id] ?? []; } catch (e) { errs.push(e); obs = []; }
    }
    return obs.length ? { spec, obs, viaPrimary: via, last: obs[obs.length - 1], prev: obs[obs.length - 2] } : null;
  }));
  const series = got.filter((s): s is FredSeries => !!s);
  if (!series.length) throw errs[0] ?? new Error('no data');
  const viaPrimary = series.filter((s) => s.viaPrimary).length;
  const servedBy = !route || !viaPrimary ? '' : viaPrimary === series.length ? route.source.name : `${route.source.name} + ${source.name}`;
  const asOf = series.reduce((m, s) => (s.last.date > m ? s.last.date : m), '');
  const missing = specs.length - series.length;
  return { ...derived(panel, f, series, asOf, missing ? `${missing} series unavailable` : ''), servedBy };
}

function derived(panel: Panel, f: Fetch, series: FredSeries[], asOf: string, note: string): PanelData {
  const columns = panel.columns ?? [];
  const mk = (rows: string[][], chart: ChartPoint[], cols = columns): PanelData => ({ columns: cols, rows, links: [], chart, asOf, note, servedBy: '' });
  switch (panel.derive) {
    case 'latest_curve': {
      const pts = series.map((s) => ({ label: s.spec.label, x: s.spec.years ?? 0, y: s.last.value })).sort((a, b) => a.x - b.x);
      return mk(series.map((s) => [s.spec.label, num(s.last.value, 2), change(s.last, s.prev, 100, 1), s.last.date]), pts);
    }
    case 'forward_grid': {
      const fw = f.forward!;
      const curve = series.map((s) => [s.spec.years ?? 0, s.last.value] as [number, number]).sort((a, b) => a[0] - b[0]);
      const rows = fw.grid.map(([s, l]) => [`${years(s)}Y x ${years(l)}Y`, num(forwardRate(curve, s, l), 2)]);
      const pts = forwardCurve(curve, fw.curve_length ?? 1, fw.curve_max_start ?? 29).map(([s, r]) => ({ label: `${years(s)}Y`, x: s, y: r }));
      return mk(rows, pts);
    }
    case 'level_change': {
      const bp = panel.change_unit === 'bp';
      const byLevel = panel.chart_value === 'level';
      const rows = series.map((s) => [s.spec.label, group(s.last.value), bp ? change(s.last, s.prev, 100, 0) : pctChange(s.last, s.prev), s.last.date]);
      const chart = series.map((s, i) => ({ label: s.spec.label, x: i, y: byLevel ? s.last.value : pct(s.last, s.prev) ?? 0 }));
      return mk(rows, chart);
    }
    case 'fx_spot': return mk(series.map((s) => [s.spec.pair ?? '', sig(s.last.value), pctChange(s.last, s.prev), s.last.date]), []);
    default: {
      const usd: Record<string, number> = { USD: 1 };
      for (const s of series) if (s.last.value > 0) usd[s.spec.ccy ?? ''] = s.spec.quote === 'usd_per' ? s.last.value : 1 / s.last.value;
      const names = Object.keys(usd);
      return mk(names.map((i) => [i, ...names.map((j) => (i === j ? '-' : sig(usd[i] / usd[j])))]), [], [...columns, ...names]);
    }
  }
}

async function perSeries(panel: Panel, source: Source, f: Fetch, ctx: Ctx): Promise<PanelData> {
  const body = await ctx.get(buildUrl(source.endpoint, f.path ?? '', paramsOf(f)));
  const found = parseDbnomics(body).map((s) => { const l = latestOf(s); return l ? { label: f.labels?.[s.code] || s.name, value: l[1], period: l[0] } : null; })
    .filter((x): x is { label: string; value: number; period: string } => !!x).sort((a, b) => b.value - a.value);
  return { columns: panel.columns ?? [], rows: found.map((x) => [x.label, num(x.value, 2), x.period]), links: [],
    chart: panel.view === 'bars' ? found.map((x, i) => ({ label: x.label, x: i, y: x.value })) : [], asOf: found.reduce((m, x) => (x.period > m ? x.period : m), ''), note: '', servedBy: '' };
}
const countryPanel = (panel: Panel, got: CountryValue[]): PanelData => ({ columns: panel.columns ?? [], rows: got.map((c) => [c.name, num(c.value, 1), c.year]), links: [], chart: [],
  asOf: got.reduce((m, c) => (c.year > m ? c.year : m), ''), note: '', servedBy: '' });
async function imf(panel: Panel, source: Source, f: Fetch, ctx: Ctx): Promise<PanelData> {
  const body = await ctx.get(buildUrl(source.endpoint, f.path ?? '', paramsOf(f)));
  return countryPanel(panel, parseImf(body, (f.path ?? '').replace(/^\/+|\/+$/g, ''), f.countries ?? [], f.country_names ?? {}).sort((a, b) => b.value - a.value));
}
async function worldBank(panel: Panel, source: Source, f: Fetch, ctx: Ctx): Promise<PanelData> {
  const body = await ctx.get(buildUrl(source.endpoint, f.path ?? '', paramsOf(f), { countries: (f.countries ?? []).join(';') }));
  return countryPanel(panel, parseWorldBank(body).sort((a, b) => b.value - a.value));
}
async function articles(panel: Panel, source: Source, f: Fetch, ctx: Ctx): Promise<PanelData> {
  const got = parseGdelt(await ctx.get(buildUrl(source.endpoint, f.path ?? '', paramsOf(f))));
  return { columns: panel.columns ?? [], rows: got.map((a) => [a.title, a.domain, a.seen]), links: got.map((a) => a.url), chart: [], asOf: got.reduce((m, a) => (a.seen > m ? a.seen : m), ''), note: '', servedBy: '' };
}

// ------------------------------------------------------------------ placeholders

export type Placeholder = { reason: 'keyed' | 'user-mapped' | 'no-connector' | 'blocked' | 'error'; note: string };
/** Why a panel is a dashed placeholder: a keyed source (keys are never stored on the web), a source the user maps, or one with no connector yet. */
export function placeholderFor(panel: Panel, sources: Source[]): Placeholder {
  const s = sources.find((x) => x.id === panel.source);
  if (!s) return { reason: 'no-connector', note: 'No source declared.' };
  if (s.user_endpoint) return { reason: 'user-mapped', note: `${s.name}: you map its endpoint and key in the Android app (Config > Sources); the web stores no keys.` };
  if (s.auth.type !== 'none') return { reason: 'keyed', note: `${s.name}: needs ${s.auth.type === 'paid' ? 'a paid subscription' : 'an API key'}; the web stores no keys (add it in the Android app, Config > Sources).` };
  return { reason: 'no-connector', note: `${s.name}: no web connector yet.` };
}
/** A fetch that failed: the browser could not read the source (CORS / off the mesh) or it answered an error. */
export function failureFor(panel: Panel, sources: Source[], e: unknown): Placeholder {
  const s = sources.find((x) => x.id === panel.source);
  if (e instanceof FetchError && e.kind === 'blocked') return { reason: 'blocked', note: `Mesh only / CORS: ${s?.name ?? 'the source'} does not allow browser requests; open this page on the mesh to read it through fin-api.` };
  return { reason: 'error', note: `${s?.name ?? 'The source'} is unavailable right now (${e instanceof Error ? e.message : 'error'}).` };
}
