<script lang="ts">
  // 2.7 heatmap tiles: fill interpolated down -> raised -> up by change %, clamped at +-scale.
  import { heat, parseNum } from '../fin';
  export type Tile = { sym: string; last: string; pct: string };
  let { tiles, scale = 1, onOpen }: { tiles: Tile[]; scale?: number; onOpen: (i: number) => void } = $props();
  const fill = (p: string) => { const h = heat(parseNum(p), scale); const c = h >= 0 ? 'var(--fin-up)' : 'var(--fin-down)'; return `color-mix(in srgb, ${c} ${Math.round(Math.abs(h) * 70)}%, var(--fin-raised))`; };
  const ink = (p: string) => (Math.abs(heat(parseNum(p), scale)) >= 0.5 ? 'var(--fin-canvas)' : 'var(--fin-text)');
</script>
<div class="heat" data-testid="fin-heat">
  {#each tiles as t, i (t.sym)}
    <button type="button" class="tile" style:background={fill(t.pct)} style:color={ink(t.pct)} onclick={() => onOpen(i)} data-testid="fin-heat-tile">
      <span class="sym">{t.sym}</span>
      <span class="b"><span class="num l">{t.last}</span><span class="num p">{t.pct}{t.pct && !t.pct.startsWith('—') ? '%' : ''}</span></span>
    </button>
  {/each}
</div>
<style>
  .heat { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 4px; }
  .tile { all: unset; box-sizing: border-box; cursor: pointer; min-height: 64px; border-radius: 6px; padding: 6px 8px; display: flex; flex-direction: column; justify-content: space-between; }
  .b { display: flex; justify-content: space-between; align-items: baseline; gap: 4px; }
  .l { font-size: 11px; opacity: .85; } .p { font-size: 13px; font-weight: 600; }
</style>
