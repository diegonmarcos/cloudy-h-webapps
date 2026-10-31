<script lang="ts">
  // 2 "needs key / no connector / server only": one 48dp row, never a dashed table of dashes.
  let { title, note, reason, href }: { title: string; note: string; reason: string; href: string } = $props();
  const glyph = $derived(reason === 'blocked' ? '⇄' : reason === 'error' ? '!' : '⚿');
</script>
<a class="kr" {href} data-testid="finterm-placeholder">
  <span class="g g-{reason}" aria-hidden="true">{glyph}</span>
  <span class="tx"><span class="t">{title}</span><span class="cap n" data-testid="finterm-note">{note}</span></span>
  <span class="chev" aria-hidden="true">›</span>
</a>
<style>
  .kr { display: flex; align-items: center; gap: 10px; min-height: 48px; color: inherit; text-decoration: none; }
  .g { width: 20px; text-align: center; color: var(--fin-amber); font-size: 16px; flex: none; }
  .g-error { color: var(--fin-down); } .g-blocked { color: var(--fin-accent); }
  .tx { display: flex; flex-direction: column; min-width: 0; flex: 1; }
  .t { font: 600 13px/18px var(--fin-sans); }
  .n { color: var(--fin-text2); display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .chev { color: var(--fin-text3); font-size: 18px; }
</style>
