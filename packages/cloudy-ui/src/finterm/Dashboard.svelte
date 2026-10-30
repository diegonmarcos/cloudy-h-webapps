<script lang="ts">
  // One FinTerm dashboard on the web (#1342): the same render style as the shell (palette roles, KitCard surface), per panel a chart or table, the
  // date of the data ("Last updated"), the source and its attribution. A panel with no live route is a dashed placeholder with the reason.
  import { onMount } from 'svelte';
  import { FINTERM, sourceOf } from './catalog';
  import { alloc, failureFor, loadPanel, placeholderFor, FetchError, type Ctx, type Dashboard, type Panel, type PanelData, type Placeholder } from './engine';

  let { dash }: { dash: Dashboard } = $props();
  type State = { phase: 'loading' } | { phase: 'data'; data: PanelData } | { phase: 'placeholder'; ph: Placeholder };
  let states = $state<Record<string, State>>({});
  const now = () => new Date().toISOString().slice(0, 10);

  const get = async (url: string): Promise<string> => {
    let r: Response;
    try { r = await fetch(url, { signal: AbortSignal.timeout(12000) }); } catch (e) { throw new FetchError('blocked', e instanceof Error ? e.message : 'blocked'); }
    if (!r.ok) throw new FetchError('http', `HTTP ${r.status}`, r.status);
    return r.text();
  };
  // The mesh answers only when the browser is on it; asked once per page, a short timeout so an off-mesh visitor is not kept waiting.
  let meshUp: Promise<boolean> | null = null;
  const reachable = (url: string) => (meshUp ??= fetch(url, { signal: AbortSignal.timeout(2500) }).then((r) => r.ok, () => false));

  onMount(() => {
    const ctx: Ctx = { get, today: now(), sources: FINTERM.sources, mesh: FINTERM.mesh, reachable };
    for (const p of dash.panels) {
      if (p.view === 'alloc' && dash.model_portfolio) { states[p.id] = { phase: 'data', data: alloc(p, dash.model_portfolio.legs) }; continue; }
      if (!p.fetch) { states[p.id] = { phase: 'placeholder', ph: placeholderFor(p, FINTERM.sources) }; continue; }
      states[p.id] = { phase: 'loading' };
      loadPanel(p, dash, ctx).then(
        (data) => (states[p.id] = { phase: 'data', data }),
        (e) => (states[p.id] = { phase: 'placeholder', ph: failureFor(p, FINTERM.sources, e) }),
      );
    }
  });

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
        {#if d.chart.length && (p.view === 'curve' || p.view === 'bars' || p.view === 'alloc')}
          {@const g = geom(d, p.view)}
          <svg viewBox="0 0 {W} {H}" role="img" aria-label={p.title} class="chart" data-testid="finterm-chart">
            <line x1={PAD} x2={W - PAD} y1={g.zero} y2={g.zero} class="axis" />
            {#if g.line}<path d={g.line} class="ln" />{#each g.dots as c}<circle cx={c.cx} cy={c.cy} r="2.5" class="dot"><title>{c.l}</title></circle>{/each}{/if}
            {#each g.bars as b}<rect x={b.x} y={b.y} width={b.w} height={Math.max(b.h, 1)} class="bar"><title>{b.l}</title></rect>{/each}
          </svg>
        {/if}
        {#if d.rows.length}
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
</style>
