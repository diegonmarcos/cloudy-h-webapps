<script lang="ts">
  // One FinTerm dashboard on the web (#1342): the same render style as the shell (palette roles, KitCard surface), per panel a chart or table, the
  // date of the data ("Last updated"), the source and its attribution. A panel with no live route is a dashed placeholder with the reason.
  import { onMount } from 'svelte';
  import { FINTERM, sourceOf } from './catalog';
  import { alertRule, alertSymbol, alloc, failureFor, loadPanel, placeholderFor, ruleText, FetchError, type AlertRule, type Ctx, type Dashboard, type Panel, type PanelData, type Placeholder, type UserLists } from './engine';

  let { dash }: { dash: Dashboard } = $props();
  type State = { phase: 'loading' } | { phase: 'data'; data: PanelData } | { phase: 'placeholder'; ph: Placeholder };
  let states = $state<Record<string, State>>({});
  const now = () => new Date().toISOString().slice(0, 10);

  const net = async (url: string): Promise<string> => {
    let r: Response;
    try { r = await fetch(url, { signal: AbortSignal.timeout(12000) }); } catch (e) { throw new FetchError('blocked', e instanceof Error ? e.message : 'blocked'); }
    if (!r.ok) throw new FetchError('http', `HTTP ${r.status}`, r.status);
    return r.text();
  };
  // Each answer is kept in this browser for its source's declared schedule.ttl_s (a rate-limited source is never asked more often), and the
  // last good copy answers when the source fails: the panel then says it is stale and since when, never silently.
  const ttlOf = (url: string) => (FINTERM.sources.find((s) => s.endpoint && url.startsWith(s.endpoint))?.schedule?.ttl_s ?? 60) * 1000;
  const store = (k: string) => { try { return JSON.parse(localStorage.getItem(k) ?? 'null'); } catch { return null; } };
  const getFor = (stale: Set<string>) => async (url: string): Promise<string> => {
    if (url.startsWith('asset:')) {
      const doc = FINTERM.declared?.[url.slice(6)];
      if (doc === undefined) throw new FetchError('http', 'not declared');
      return JSON.stringify(doc);
    }
    const key = `finterm.cache:${url}`;
    const hit = store(key) as { at: number; body: string } | null;
    if (hit && Date.now() - hit.at < ttlOf(url)) return hit.body;
    try {
      const body = await net(url);
      try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), body })); } catch { /* full storage: serve without keeping */ }
      return body;
    } catch (e) {
      if (!hit) throw e;
      stale.add(new Date(hit.at).toISOString().slice(0, 16).replace('T', ' '));
      return hit.body;
    }
  };
  // the watchlist and alert rules of this browser (Watchlist & Alerts); nothing leaves the page
  const loadUser = (): UserLists => ({
    watchlist: ((store('finterm.watchlist') ?? []) as string[]).map(alertSymbol).filter((x): x is string => !!x),
    alerts: ((store('finterm.alerts') ?? []) as string[]).map(alertRule).filter((x): x is AlertRule => !!x),
  });
  let user = $state<UserLists>({ watchlist: [], alerts: [] });
  let entry = $state('');
  let entryBad = $state(false);
  const hasUserLists = dash.panels.some((p) => p.fetch?.each_user || p.alerts);
  function saveUser(next: UserLists) {
    user = next;
    localStorage.setItem('finterm.watchlist', JSON.stringify(next.watchlist));
    localStorage.setItem('finterm.alerts', JSON.stringify(next.alerts.map(ruleText)));
    loadAll();
  }
  function addEntry() {
    const r = alertRule(entry); const sym = r ? null : alertSymbol(entry);
    if (r) saveUser({ ...user, alerts: [...user.alerts.filter((x) => ruleText(x) !== ruleText(r)), r] });
    else if (sym) saveUser({ ...user, watchlist: [...user.watchlist.filter((x) => x !== sym), sym] });
    else { entryBad = true; return; }
    entry = ''; entryBad = false;
  }
  // The mesh answers only when the browser is on it; asked once per page, a short timeout so an off-mesh visitor is not kept waiting.
  let meshUp: Promise<boolean> | null = null;
  const reachable = (url: string) => (meshUp ??= fetch(url, { signal: AbortSignal.timeout(2500) }).then((r) => r.ok, () => false));

  function loadAll() {
    const nowUtc = new Date().toISOString().slice(0, 16) + 'Z';
    for (const p of dash.panels) {
      if (p.view === 'alloc' && dash.model_portfolio) { states[p.id] = { phase: 'data', data: alloc(p, dash.model_portfolio.legs) }; continue; }
      if (!p.fetch) { states[p.id] = { phase: 'placeholder', ph: placeholderFor(p, FINTERM.sources) }; continue; }
      states[p.id] = { phase: 'loading' };
      const stale = new Set<string>();
      const ctx: Ctx = { get: getFor(stale), today: now(), sources: FINTERM.sources, mesh: FINTERM.mesh, reachable, user, nowUtc };
      loadPanel(p, dash, ctx).then(
        (data) => (states[p.id] = { phase: 'data', data: stale.size ? { ...data, note: [data.note, `Stale: the source did not answer, last good copy of ${[...stale].sort()[0]} UTC.`].filter(Boolean).join(' ') } : data }),
        (e) => (states[p.id] = { phase: 'placeholder', ph: failureFor(p, FINTERM.sources, e) }),
      );
    }
  }
  onMount(() => {
    user = loadUser();
    loadAll();
  });
  const dayHead = (d: string) => { const t = Date.parse(`${d}T00:00:00Z`); return Number.isFinite(t) ? new Date(t).toUTCString().slice(0, 11) : d; };
  const byDay = (rows: string[][]) => { const m = new Map<string, string[][]>(); for (const r of rows) { const k = (r[0] ?? '').slice(0, 10); m.set(k, [...(m.get(k) ?? []), r]); } return [...m.entries()]; };

  // chart geometry: a line for curve views, bars for bars / alloc
  const W = 320, H = 140, PAD = 24;
  function geom(data: PanelData, view: string) {
    const pts = data.chart;
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(0, ...ys), y1 = Math.max(0, ...ys);
    const sx = (x: number) => PAD + (x1 === x0 ? 0.5 : (x - x0) / (x1 - x0)) * (W - 2 * PAD);
    const sy = (y: number) => H - PAD - (y1 === y0 ? 0.5 : (y - y0) / (y1 - y0)) * (H - 2 * PAD);
    if (view === 'curve') return { line: pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' '), dots: pts.map((p) => ({ cx: sx(p.x), cy: sy(p.y), l: p.label })), bars: [] as { x: number; y: number; w: number; h: number; l: string }[], zero: sy(0) };
    const bw = (W - 2 * PAD) / pts.length;
    return { line: '', dots: [], zero: sy(0), bars: pts.map((p, i) => ({ x: PAD + i * bw + bw * 0.15, y: Math.min(sy(p.y), sy(0)), w: bw * 0.7, h: Math.abs(sy(p.y) - sy(0)), l: p.label })) };
  }
  const attribution = (p: Panel) => { const s = sourceOf(p.source); return s ? { name: s.name, docs: s.docs ?? '' } : { name: p.source, docs: '' }; };
</script>

<div class="dash" data-testid="finterm-dash" data-dash={dash.id}>
  <p class="sub">{dash.subtitle}</p>
  {#if hasUserLists}
    <section class="panel" data-testid="finterm-userlists">
      <h3>Watchlist &amp; alerts (kept in this browser)</h3>
      <p class="note">Type a symbol to watch (AAPL, _SPX for the S&amp;P 500 index), or a rule: AAPL &gt; 230, AAPL &lt; 200, events &gt;= 3. Click an item to remove it.</p>
      <form class="add" onsubmit={(e) => { e.preventDefault(); addEntry(); }}>
        <input bind:value={entry} placeholder="Symbol or rule" aria-label="Symbol or rule" data-testid="finterm-entry" />
        <button type="submit">Add</button>
      </form>
      {#if entryBad}<p class="note bad">Not a symbol or a rule.</p>{/if}
      <div class="chips">
        {#each user.watchlist as w}<button class="chip" onclick={() => saveUser({ ...user, watchlist: user.watchlist.filter((x) => x !== w) })}>{w} &times;</button>{/each}
        {#each user.alerts as r}<button class="chip" onclick={() => saveUser({ ...user, alerts: user.alerts.filter((x) => ruleText(x) !== ruleText(r)) })}>{ruleText(r)} &times;</button>{/each}
      </div>
    </section>
  {/if}
  {#each dash.panels as p (p.id)}
    {@const st = states[p.id] ?? { phase: 'loading' }}
    {@const at = attribution(p)}
    <section class="panel" class:dashed={st.phase === 'placeholder'} data-testid="finterm-panel" data-panel={p.id} data-state={st.phase === 'placeholder' ? `placeholder-${st.ph.reason}` : st.phase}>
      <h3>{p.title}</h3>
      {#if st.phase === 'loading'}
        <p class="note">Loading from {at.name}...</p>
      {:else if st.phase === 'placeholder'}
        <div class="ph" data-testid="finterm-placeholder">
          <table aria-hidden="true"><thead><tr>{#each p.placeholder?.columns ?? p.columns ?? [] as c}<th>{c}</th>{/each}</tr></thead>
            <tbody>{#each Array.from({ length: Math.min(p.placeholder?.rows ?? 3, 4) }) as _}<tr>{#each p.placeholder?.columns ?? p.columns ?? [] as _c}<td>-</td>{/each}</tr>{/each}</tbody></table>
          <p class="note" data-testid="finterm-note">{st.ph.note}</p>
        </div>
      {:else}
        {@const d = st.data}
        {#each d.alerts ?? [] as a}<p class="alert" data-testid="finterm-alert">{a}</p>{/each}
        {#if p.view === 'quotes'}
          <div class="tiles" data-testid="finterm-quotes">
            {#each d.rows as r, i}
              <div class="tile"><span class="tl">{r[0]}</span><strong>{r[1]}</strong>
                <span class:up={(d.chart[i]?.y ?? 0) >= 0} class:down={(d.chart[i]?.y ?? 0) < 0}>{r[2]}{#if r[3] && r[3] !== '-'} ({r[3]}%){/if}</span><span class="tl">{r[4]}</span></div>
            {/each}
          </div>
        {:else if p.view === 'calendar'}
          <div class="cal" data-testid="finterm-calendar">
            {#each byDay(d.rows) as [day, rows]}
              <h4>{dayHead(day)}</h4>
              {#each rows as r}
                <div class="ev"><span class="t">{(r[0] ?? '').slice(11) || 'all day'}</span><span class="c">{r[1]}</span><span class="e">{r[2]}</span><span class="i">{r[3]}</span></div>
                {#if r[4] || r[5] || r[6]}<div class="vals">{#each [4, 5, 6] as k}{#if r[k]}<span>{d.columns[k]} {r[k]}</span>{/if}{/each}</div>{/if}
              {/each}
            {/each}
          </div>
        {/if}
        {#if d.chart.length && (p.view === 'curve' || p.view === 'bars' || p.view === 'alloc' || p.view === 'candles')}
          {@const g = geom(d, p.view === 'candles' ? 'curve' : p.view)}
          <svg viewBox="0 0 {W} {H}" role="img" aria-label={p.title} class="chart" data-testid="finterm-chart">
            <line x1={PAD} x2={W - PAD} y1={g.zero} y2={g.zero} class="axis" />
            {#if g.line}<path d={g.line} class="ln" />{#each g.dots as c}<circle cx={c.cx} cy={c.cy} r="2.5" class="dot"><title>{c.l}</title></circle>{/each}{/if}
            {#each g.bars as b}<rect x={b.x} y={b.y} width={b.w} height={Math.max(b.h, 1)} class="bar"><title>{b.l}</title></rect>{/each}
          </svg>
        {/if}
        {#if d.rows.length && p.view !== 'quotes' && p.view !== 'calendar'}
          <div class="scroll"><table data-testid="finterm-table"><thead><tr>{#each d.columns as c}<th>{c}</th>{/each}</tr></thead>
            <tbody>{#each d.rows as r, i}<tr>{#each r as cell, j}<td>{#if j === 0 && d.links[i]}<a href={d.links[i]} target="_blank" rel="noopener noreferrer">{cell}</a>{:else}{cell}{/if}</td>{/each}</tr>{/each}</tbody></table></div>
        {/if}
        {#if d.note}<p class="note">{d.note}</p>{/if}
        <p class="meta" data-testid="finterm-meta">{#if d.asOf}Last updated: <span data-testid="finterm-asof">{d.asOf}</span>{' · '}{/if}Source: {d.servedBy || at.name}</p>
      {/if}
      <p class="attr" data-testid="finterm-attr">{#if at.docs}<a href={at.docs} target="_blank" rel="noopener noreferrer">{at.name}</a>{:else}{at.name}{/if}</p>
    </section>
  {/each}
</div>

<style>
  .dash { padding: 8px 12px 24px; display: flex; flex-direction: column; gap: 10px; color: var(--role-text-primary); font-family: var(--type-family-sans); }
  .sub { margin: 0 4px; color: var(--role-text-secondary); font: 400 var(--type-body-small-size) / normal var(--type-family-sans); }
  .panel { border-radius: var(--shape-card-radius); background: var(--role-surface); padding: var(--shape-card-padding); display: flex; flex-direction: column; gap: 8px; }
  .panel.dashed { background: transparent; border: 1px dashed var(--role-text-secondary); }
  h3 { margin: 0; font: 500 var(--type-title-small-size) / normal var(--type-family-sans); }
  .scroll { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font: 400 var(--type-body-small-size) / 1.3 var(--type-family-sans); }
  th { text-align: left; color: var(--role-text-secondary); font-weight: 500; padding: 4px 6px; white-space: nowrap; }
  td { padding: 4px 6px; border-top: 1px solid color-mix(in srgb, var(--role-text-secondary) 25%, transparent); }
  .ph td { color: var(--role-text-secondary); }
  .note, .meta, .attr { margin: 0; color: var(--role-text-secondary); font: 400 var(--type-body-small-size) / normal var(--type-family-sans); }
  .attr a, td a { color: var(--role-accent); text-decoration: none; }
  .chart { width: 100%; height: auto; max-height: 180px; }
  .axis { stroke: var(--role-text-secondary); stroke-width: 0.5; }
  .ln { fill: none; stroke: var(--role-accent); stroke-width: 2; }
  .dot, .bar { fill: var(--role-accent); }
  .alert { margin: 0; color: var(--role-error, #d33); font: 600 var(--type-body-small-size) / normal var(--type-family-sans); }
  .bad { color: var(--role-error, #d33); }
  .add { display: flex; gap: 6px; }
  .add input { flex: 1; min-width: 0; padding: 6px 8px; border-radius: 8px; border: 1px solid var(--role-text-secondary); background: transparent; color: var(--role-text-primary); }
  .add button, .chip { border: 1px solid var(--role-accent); background: transparent; color: var(--role-accent); border-radius: 999px; padding: 4px 10px; cursor: pointer; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 6px; }
  .tile { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; border: 1px dashed color-mix(in srgb, var(--role-text-secondary) 50%, transparent); border-radius: 8px; font: 400 var(--type-body-small-size) / 1.3 var(--type-family-sans); }
  .tile strong { font-size: 1.15em; }
  .tl { color: var(--role-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .up { color: var(--role-accent); }
  .down { color: var(--role-error, #d33); }
  .cal h4 { margin: 8px 0 2px; color: var(--role-accent); font: 600 var(--type-body-small-size) / normal var(--type-family-sans); border-bottom: 1px solid color-mix(in srgb, var(--role-text-secondary) 30%, transparent); }
  .ev { display: grid; grid-template-columns: 44px 28px 1fr auto; gap: 6px; font: 400 var(--type-body-small-size) / 1.35 var(--type-family-sans); }
  .ev .t, .ev .c { color: var(--role-text-secondary); }
  .ev .i { color: var(--role-accent); letter-spacing: -1px; }
  .vals { display: flex; gap: 10px; padding-left: 78px; color: var(--role-text-secondary); font: 400 calc(var(--type-body-small-size) * 0.92) / 1.3 var(--type-family-sans); }
</style>
