<script lang="ts">
  // 2.6 economic-calendar rows: sticky day header, time, flag + country, importance dots (filled by level colour), event; A/F/P line with beat/miss.
  import { beatMiss, betterWhen, flag, DASH } from '../fin';
  let { rows, columns, minImp = 0 }: { rows: string[][]; columns: string[]; minImp?: number } = $props();
  const imp = (s: string) => (s.match(/●/g) ?? []).length;
  const dayHead = (d: string) => { const t = Date.parse(`${d}T00:00:00Z`); return Number.isFinite(t) ? new Date(t).toUTCString().slice(0, 11).replace(',', '') : d; };
  const byDay = $derived.by(() => { const m = new Map<string, string[][]>(); for (const r of rows.filter((r) => imp(r[3] ?? '') >= minImp)) { const k = (r[0] ?? '').slice(0, 10); m.set(k, [...(m.get(k) ?? []), r]); } return [...m.entries()]; });
  const nowUtc = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const soon = (ts: string) => ts.length > 10 && ts >= nowUtc && Date.parse(ts.replace(' ', 'T') + 'Z') - Date.now() < 3600e3;
  const lab = (k: number) => ({ 4: 'F', 5: 'A', 6: 'P' } as Record<number, string>)[k] ?? (columns[k] ?? '');
</script>
<div class="cal" data-testid="finterm-calendar">
  {#each byDay as [day, evs]}
    <div class="dh lbl">{dayHead(day)}</div>
    {#each evs as r}
      {@const n = imp(r[3] ?? '')}
      {@const bm = beatMiss(r[5] ?? '', r[4] || r[6] || '', betterWhen(r[2] ?? ''))}
      <div class="ev" data-testid="fin-event">
        <span class="t num" class:soon={soon(r[0] ?? '')}>{(r[0] ?? '').slice(11, 16) || 'all day'}</span>
        <span class="c"><span class="fl" aria-hidden="true">{flag(r[1] ?? '')}</span><span class="cap cc">{r[1]}</span></span>
        <span class="dots" title="importance {n} of 3" aria-label="importance {n} of 3">{#each [1, 2, 3] as k}<i class="d" class:i1={k <= n && n === 1} class:i2={k <= n && n === 2} class:i3={k <= n && n === 3}></i>{/each}</span>
        <span class="e">{r[2]}</span>
        {#if r[4] || r[5] || r[6]}
          <span class="vals num">
            <span><b class="lbl">A</b> <span class={bm}>{r[5] || DASH}</span></span>
            <span><b class="lbl">F</b> {r[4] || DASH}</span>
            <span><b class="lbl">P</b> {r[6] || DASH}</span>
          </span>
        {/if}
      </div>
    {/each}
  {:else}
    <p class="cap empty">No event in this window.</p>
  {/each}
</div>
<style>
  .cal { margin: 0 -12px; }
  .dh { position: sticky; top: 0; background: var(--fin-raised); padding: 6px 12px; z-index: 1; }
  .ev { display: grid; grid-template-columns: 44px 52px 28px 1fr; align-items: center; column-gap: 6px; padding: 6px 12px; min-height: 32px; border-top: 1px solid var(--fin-hairline); }
  .dh + .ev { border-top: 0; }
  .t { color: var(--fin-text2); font-size: 11px; } .t.soon { color: var(--fin-accent); }
  .c { display: flex; align-items: center; gap: 4px; } .fl { font-size: 14px; line-height: 1; } .cc { color: var(--fin-text2); }
  .dots { display: flex; gap: 2px; } .d { width: 6px; height: 6px; border-radius: 50%; background: var(--fin-hairline); }
  .d.i1 { background: var(--fin-imp1); } .d.i2 { background: var(--fin-imp2); } .d.i3 { background: var(--fin-imp3); }
  .e { font: 400 13px/16px var(--fin-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .vals { grid-column: 4; display: flex; gap: 14px; font-size: 11px; color: var(--fin-text2); }
  .vals b { font-weight: 500; color: var(--fin-text3); margin-right: 2px; }
  .vals .up { color: var(--fin-up); } .vals .down { color: var(--fin-down); } .vals .flat { color: var(--fin-text2); }
  .empty { padding: 8px 12px; color: var(--fin-text2); margin: 0; }
</style>
