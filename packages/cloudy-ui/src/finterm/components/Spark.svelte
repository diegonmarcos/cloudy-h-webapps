<script lang="ts">
  // 56x20 sparkline (2.2): stroke up/down by first vs last, hairline baseline at the first value, no dots.
  import { sparkDir, sparkPath } from '../fin';
  let { values, w = 56, h = 20 }: { values: number[]; w?: number; h?: number } = $props();
  const d = $derived(sparkPath(values, w, h));
  const dir = $derived(sparkDir(values));
</script>
{#if d}<svg class="spark" width={w} height={h} viewBox="0 0 {w} {h}" aria-hidden="true" data-testid="fin-spark"><path d={d} class="s-{dir}" /></svg>{/if}
<style>
  .spark { display: block; flex: none; }
  path { fill: none; stroke-width: 1.5; stroke-linejoin: round; }
  .s-up { stroke: var(--fin-up); } .s-down { stroke: var(--fin-down); } .s-flat { stroke: var(--fin-text2); }
</style>
