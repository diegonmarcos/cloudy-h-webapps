<script lang="ts">
  // 5.3 skeleton: exact final height, shimmer 1.2 s, no text.
  let { w = '100%', h = 12, r = 4 }: { w?: string | number; h?: number; r?: number } = $props();
</script>
<span class="sk" style:width={typeof w === 'number' ? `${w}px` : w} style:height="{h}px" style:border-radius="{r}px" aria-hidden="true"></span>
<style>
  .sk { display: inline-block; flex: none; background: linear-gradient(90deg, var(--fin-skeleton) 0, var(--fin-skeleton-hi) 50%, var(--fin-skeleton) 100%) var(--fin-skeleton); background-size: 400px 100%; animation: fin-shimmer 1.2s linear infinite; }
</style>
