<script lang="ts">
  // 2.1 ticker tape: 28px, raised fill, symbol / last / signed chg%, continuous scroll (40px/s) that pauses on hover; static under reduced motion.
  import { dirOf } from '../fin';
  export type TapeItem = { sym: string; last: string; pct: string };
  let { items, stale = false, onOpen }: { items: TapeItem[]; stale?: boolean; onOpen: (sym: string) => void } = $props();
  const isNum = (s: string) => /^[+-]?\d/.test(s) && !s.endsWith('bp');
  const dur = $derived(Math.max(20, items.length * 4));
</script>
{#if items.length}
  <div class="tape" class:stale data-testid="fin-tape" aria-label="Ticker tape">
    {#if stale}<span class="sd" title="stale"></span>{/if}
    <div class="track" style:animation-duration="{dur}s">
      {#each [0, 1] as copy}
        <div class="run" aria-hidden={copy === 1}>
          {#each items as it}<button type="button" class="it" tabindex={copy ? -1 : 0} onclick={() => onOpen(it.sym)}><span class="lbl">{it.sym}</span> <span class="num v">{it.last}</span> <span class="num {dirOf(it.pct)}">{it.pct}{isNum(it.pct) ? '%' : ''}</span></button>{/each}
        </div>
      {/each}
    </div>
  </div>
{/if}
<style>
  .tape { position: relative; height: 28px; overflow: hidden; background: var(--fin-raised); border-radius: 8px; display: flex; align-items: center; }
  .tape.stale .track { opacity: .7; }
  .sd { position: absolute; left: 4px; width: 6px; height: 6px; border-radius: 50%; background: var(--fin-amber); z-index: 1; }
  .track { display: flex; width: max-content; animation: tape linear infinite; }
  .tape:hover .track, .tape:focus-within .track { animation-play-state: paused; }
  .run { display: flex; }
  .it { all: unset; cursor: pointer; display: flex; align-items: center; gap: 4px; padding: 0 12px; border-right: 1px solid var(--fin-hairline); white-space: nowrap; font-size: 11px; }
  .v { color: var(--fin-text); }
  @keyframes tape { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @media (prefers-reduced-motion: reduce) { .track { animation: none; } .tape { overflow-x: auto; } }
</style>
