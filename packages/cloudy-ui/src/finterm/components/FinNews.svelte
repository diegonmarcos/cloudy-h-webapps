<script lang="ts">
  // 3.4 news rows: monogram badge, 2-line headline, source line.
  let { rows, links }: { rows: string[][]; links: string[] } = $props();
</script>
<div class="news" data-testid="finterm-table">
  {#each rows as r, i}
    <a class="nr" href={links[i] || undefined} target="_blank" rel="noopener noreferrer">
      <span class="mono" aria-hidden="true">{(r[1] || r[0] || '?').replace(/^www\./, '').slice(0, 2).toUpperCase()}</span>
      <span class="tx"><span class="h">{r[0]}</span><span class="cap">{r.slice(1).filter(Boolean).join(' · ')}</span></span>
    </a>
  {/each}
</div>
<style>
  .news { display: flex; flex-direction: column; margin: 0 -12px; }
  .nr { display: flex; gap: 10px; padding: 8px 12px; color: inherit; text-decoration: none; border-top: 1px solid var(--fin-hairline); }
  .nr:first-child { border-top: 0; } .nr:hover { background: var(--fin-raised); }
  .mono { width: 24px; height: 24px; flex: none; border-radius: 6px; background: var(--fin-raised); display: grid; place-items: center; font: 600 9px var(--fin-sans); color: var(--fin-text2); }
  .tx { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .h { font: 400 13px/17px var(--fin-sans); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
