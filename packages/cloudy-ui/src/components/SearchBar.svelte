<script lang="ts">
  // KitSearchBar: 36dp (glyph + small) row, corner 12dp, surface, 1dp hairline; a 12dp drawn magnifier in text_secondary,
  // body-size field, × to clear.
  let { query = $bindable(''), placeholder = 'Search', onsubmit }: { query?: string; placeholder?: string; onsubmit?: (q: string) => void } = $props();
</script>
<form class="search" role="search" onsubmit={(e) => { e.preventDefault(); onsubmit?.(query); }}>
  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><circle cx="5.58" cy="5.58" r="4.08" fill="none" stroke="currentColor" stroke-width="1.5" /><line x1="8.47" y1="8.47" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" /></svg>
  <input bind:value={query} {placeholder} aria-label={placeholder} enterkeyhint="go" />
  {#if query}<button type="button" class="clr" aria-label="Clear search" onclick={() => (query = '')}>×</button>{:else}<span class="sp"></span>{/if}
</form>
<style>
  .search { display: flex; align-items: center; height: calc(var(--density-glyph) + var(--density-small)); border-radius: var(--density-corner); background: var(--role-surface);
    border: var(--density-rule) solid var(--role-hairline); padding-left: var(--density-medium); color: var(--role-text-secondary); box-sizing: border-box; }
  input { flex: 1; min-width: 0; margin: 0 var(--density-small); background: none; border: 0; outline: 0; color: var(--role-text-primary); caret-color: var(--role-accent); font: 400 var(--density-body) / normal var(--type-family-sans); }
  input::placeholder { color: var(--role-text-secondary); }
  .clr { width: var(--density-glyph); height: var(--density-glyph); background: none; border: 0; color: var(--role-text-secondary); font-size: var(--density-title); cursor: pointer; }
  .sp { width: var(--density-small); }
</style>
