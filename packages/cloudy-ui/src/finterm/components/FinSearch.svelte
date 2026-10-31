<script lang="ts">
  // 2.10 global search: "/" opens it; local catalogue (every declared symbol, the watchlist, every dashboard), grouped, recent searches.
  import { search, type SearchItem } from '../fin';
  let { items, open = $bindable(false), onPick }: { items: SearchItem[]; open?: boolean; onPick: (it: SearchItem) => void } = $props();
  let q = $state('');
  let dlg: HTMLDialogElement | undefined = $state();
  let field: HTMLInputElement | undefined = $state();
  const GROUPS: [SearchItem['kind'], string][] = [['WL', 'Watchlist'], ['EQ', 'Equities & indices'], ['FX', 'FX'], ['FI', 'Rates & yields'], ['CR', 'Crypto'], ['CO', 'Commodities'], ['EV', 'Economic events'], ['DB', 'Dashboards']];
  const hits = $derived(search(items, q));
  const recent = () => { try { return JSON.parse(localStorage.getItem('finterm.recent') ?? '[]') as string[]; } catch { return []; } };
  let recents = $state<string[]>([]);
  $effect(() => { if (!dlg) return; if (open && !dlg.open) { recents = recent(); dlg.showModal(); queueMicrotask(() => field?.focus()); } else if (!open && dlg.open) dlg.close(); });
  function pick(it: SearchItem) {
    try { localStorage.setItem('finterm.recent', JSON.stringify([it.symbol, ...recent().filter((s) => s !== it.symbol)].slice(0, 8))); } catch { /* ignore */ }
    open = false; q = ''; onPick(it);
  }
</script>
<dialog bind:this={dlg} class="srch" data-testid="fin-search" onclose={() => (open = false)} onclick={(e) => { if (e.target === dlg) open = false; }}>
  <div class="box">
    <form class="f" onsubmit={(e) => { e.preventDefault(); if (hits[0]) pick(hits[0]); }}>
      <span class="g" aria-hidden="true">⌕</span>
      <input bind:this={field} bind:value={q} placeholder="Symbol, index, pair, country, event, dashboard" aria-label="Search" autocomplete="off" spellcheck="false" data-testid="fin-search-input" />
      {#if q}<button type="button" class="x" onclick={() => (q = '')} aria-label="Clear">×</button>{/if}
    </form>
    {#if !q}
      {#if recents.length}<div class="lbl gh">Recent</div><div class="chips">{#each recents as r}<button type="button" class="chip" onclick={() => (q = r)}>{r}</button>{/each}</div>{/if}
      <p class="cap hint">Type to search {items.length} symbols and dashboards. Press / anywhere to open.</p>
    {:else if !hits.length}
      <p class="cap hint">No match for '{q}'.</p>
    {:else}
      <div class="res">
        {#each GROUPS as [k, name]}
          {@const gi = hits.filter((h) => h.kind === k)}
          {#if gi.length}<div class="lbl gh">{name}</div>
            {#each gi as it}<button type="button" class="r" onclick={() => pick(it)} data-testid="fin-search-hit"><span class="bdg">{it.kind}</span><span class="sym">{it.symbol}</span><span class="cap nm">{it.name}</span></button>{/each}
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</dialog>
<style>
  .srch { border: 0; padding: 0; background: transparent; width: min(560px, 100vw); max-width: 100vw; max-height: 100dvh; margin: 0 auto; top: 0; color: var(--fin-text); }
  .srch::backdrop { background: rgb(0 0 0 / .6); }
  .box { background: var(--fin-surface); border: 1px solid var(--fin-hairline); border-radius: 0 0 12px 12px; padding: 12px; box-shadow: 0 6px 24px rgb(0 0 0 / .5); max-height: 80dvh; overflow: auto; }
  .f { display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 12px; border-radius: 12px; background: var(--fin-raised); }
  .f input { all: unset; flex: 1; font: 400 15px var(--fin-sans); color: var(--fin-text); }
  .g { color: var(--fin-text2); font-size: 18px; } .x { all: unset; cursor: pointer; color: var(--fin-text2); font-size: 18px; padding: 0 4px; }
  .gh { margin: 12px 0 4px; }
  .r { all: unset; cursor: pointer; box-sizing: border-box; width: 100%; display: grid; grid-template-columns: 32px auto 1fr; align-items: center; gap: 10px; min-height: 44px; padding: 0 4px; border-radius: 8px; }
  .r:hover, .r:focus-visible { background: var(--fin-raised); }
  .bdg { width: 32px; height: 32px; border-radius: 6px; background: var(--fin-raised); display: grid; place-items: center; font: 600 10px var(--fin-sans); color: var(--fin-text2); }
  .nm { color: var(--fin-text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { all: unset; cursor: pointer; height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--fin-hairline); font: 500 12px/32px var(--fin-sans); }
  .hint { margin: 12px 4px 4px; color: var(--fin-text2); }
</style>
