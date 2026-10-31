<script lang="ts">
  // 2.5 / 4.3 quote detail: header (symbol, name, star; last, signed change; source line), KPI strip, chart with range chips over the history
  // the source gives, stats. Opened from any row, tile, tape item or search hit; Escape / back closes.
  import FinChart from './FinChart.svelte';
  import { dirOf, DASH } from '../fin';
  export type Quote = { sym: string; name: string; last: string; chg: string; pct: string; asOf: string; source: string; unit: string; hist: number[] | null; dates?: string[] };
  let { q = $bindable(null), watched, onStar }: { q?: Quote | null; watched: Set<string>; onStar: (s: string) => void } = $props();
  let dlg: HTMLDialogElement | undefined = $state();
  let range = $state(0);
  const RANGES: [string, number][] = [['5D', 5], ['1M', 22], ['6M', 130], ['1Y', 260], ['MAX', 0]];
  $effect(() => { if (!dlg) return; if (q && !dlg.open) { range = 0; dlg.showModal(); } else if (!q && dlg.open) dlg.close(); });
  const avail = $derived(RANGES.filter(([, n], i) => !q?.hist || n === 0 || i === 0 || q.hist.length > RANGES[i - 1][1]));
  const pts = $derived.by(() => { if (!q?.hist) return []; const n = avail[range]?.[1] ?? 0; const h = n ? q.hist.slice(-n) : q.hist; const d = q.dates ? (n ? q.dates.slice(-n) : q.dates) : null; return h.map((y, i) => ({ label: d?.[i] ?? String(i + 1), x: i, y })); });
  const hi = $derived(q?.hist ? Math.max(...q.hist) : NaN), lo = $derived(q?.hist ? Math.min(...q.hist) : NaN);
  const f = (v: number) => (Number.isFinite(v) ? (Math.abs(v) >= 1000 ? v.toLocaleString('en-US', { maximumFractionDigits: 2 }) : v.toFixed(Math.abs(v) < 10 ? 4 : 2)) : DASH);
</script>
<dialog bind:this={dlg} class="qd" data-testid="fin-quote" onclose={() => (q = null)} onclick={(e) => { if (e.target === dlg) q = null; }}>
  {#if q}
    <div class="sheet">
      <div class="l1"><span class="sym big">{q.sym}</span><span class="nm">{q.name}</span>
        <button type="button" class="st" class:on={watched.has(q.sym)} onclick={() => onStar(q!.sym)} aria-label="Watchlist">{watched.has(q.sym) ? '★' : '☆'}</button>
        <button type="button" class="x" onclick={() => (q = null)} aria-label="Close">×</button></div>
      <div class="l2"><span class="px num">{q.last}{q.unit}</span><span class="num {dirOf(q.chg)}">{q.chg}</span>{#if q.pct && q.pct !== DASH}<span class="num {dirOf(q.pct)}">{q.pct}%</span>{/if}</div>
      <div class="cap">{q.source} · as of {q.asOf}</div>
      {#if q.hist && q.hist.length > 1}
        <div class="kp">
          <div><span class="lbl">Range high</span><span class="num">{f(hi)}</span></div><div><span class="lbl">Range low</span><span class="num">{f(lo)}</span></div>
          <div><span class="lbl">First</span><span class="num">{f(q.hist[0])}</span></div><div><span class="lbl">Points</span><span class="num">{q.hist.length}</span></div>
        </div>
        <div class="chips" role="tablist">{#each avail as [r], i}<button type="button" role="tab" class="chip" class:sel={range === i} aria-selected={range === i} onclick={() => (range = i)}>{r}</button>{/each}</div>
        <FinChart points={pts} kind="line" title={q.sym} unit={q.unit} even />
      {:else}
        <p class="cap nh">This source publishes the latest value only; no history to chart.</p>
      {/if}
    </div>
  {/if}
</dialog>
<style>
  .qd { border: 0; padding: 0; background: transparent; width: min(640px, 100vw); max-width: 100vw; margin: auto auto 0; color: var(--fin-text); }
  @media (min-width: 600px) { .qd { margin: auto; } }
  .qd::backdrop { background: rgb(0 0 0 / .6); }
  .sheet { background: var(--fin-surface); border: 1px solid var(--fin-hairline); border-radius: 12px 12px 0 0; padding: 12px; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 -6px 24px rgb(0 0 0 / .5); }
  @media (min-width: 600px) { .sheet { border-radius: 12px; } }
  .l1 { display: flex; align-items: center; gap: 8px; } .big { font-size: 15px; } .nm { color: var(--fin-text2); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
  .st, .x { all: unset; cursor: pointer; font-size: 20px; color: var(--fin-text2); padding: 0 4px; } .st.on { color: var(--fin-accent); }
  .l2 { display: flex; align-items: baseline; gap: 8px; } .px { font: 600 28px/32px var(--fin-sans); font-variant-numeric: tabular-nums; } .l2 .num:not(.px) { font-size: 15px; }
  .kp { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .kp div { background: var(--fin-raised); border-radius: 8px; padding: 6px 8px; display: flex; flex-direction: column; }
  .chips { display: flex; gap: 6px; }
  .chip { all: unset; cursor: pointer; height: 28px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--fin-hairline); font: 500 11px/28px var(--fin-sans); color: var(--fin-text2); }
  .chip.sel { border-color: var(--fin-accent); color: var(--fin-accent); background: color-mix(in srgb, var(--fin-accent) 20%, transparent); }
  .nh { color: var(--fin-text2); }
</style>
