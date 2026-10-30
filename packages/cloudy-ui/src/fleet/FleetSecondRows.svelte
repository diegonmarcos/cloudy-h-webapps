<script lang="ts">
  // NavBarTopSecondRows, SecondRowMode.ManyRows (nav_mode horizontal_two_rows): ONE shared strip surface, one row per group
  // (NavSection.rowGroups): the group's label + " ▾" (14sp semibold, a column as wide as the widest label) opening a list of
  // the group's pages, a "|" divider, then the group's pages as scrollable icon chips (every one named at rest).
  import Icon from '../shell/Icon.svelte';
  type T = { id: string; label: string; icon: string; href: string | null; separatorBefore?: boolean };
  type G = { id: string; label: string; pages: T[] };
  let { groups, selected, compact = false }: { groups: G[]; selected: string | null; compact?: boolean } = $props();
  let open = $state<string | null>(null);
</script>

<nav class="rows" data-testid="fleet-second-rows">
  <div class="box">
    {#each groups as g (g.id)}
      <div class="row" data-testid="frow-{g.id}">
        <div class="idx">
          <button class="label" onclick={() => (open = open === g.id ? null : g.id)} aria-expanded={open === g.id}>{g.label} ▾</button>
          {#if open === g.id}
            <div class="scrim" onclick={() => (open = null)} aria-hidden="true"></div>
            <div class="dd" role="menu">{#each g.pages as p (p.id)}<svelte:element this={p.href ? 'a' : 'span'} href={p.href} class:on={p.id === selected} role="menuitem">{p.label}</svelte:element>{/each}</div>
          {/if}
        </div>
        <span class="bar">|</span>
        <div class="chips">
          {#each g.pages as p, i (p.id)}
            {#if i > 0 && p.separatorBefore}<span class="bar">|</span>{/if}
            <svelte:element this={p.href ? 'a' : 'span'} class="tab" class:on={p.id === selected} href={p.href} aria-label={p.label}>
              <Icon set="fleet" name={p.icon} size={16} />{#if !compact || p.id === selected}<span class="lbl">{p.label}</span>{/if}
            </svelte:element>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</nav>

<style>
  .rows { padding: var(--fleet-top2-top-inset) var(--fleet-top2-side) var(--fleet-top2-bottom-inset); }
  .box { border-radius: var(--fleet-top2-strip-radius); background: var(--f-tab-strip); border: 1px solid var(--f-island-border); padding: var(--fleet-top2-strip-pad-v) 0; display: grid; grid-template-columns: auto auto 1fr; }
  .row { display: contents; }
  .idx { position: relative; }
  .label { height: var(--fleet-top2-tab-height); padding: 0 var(--fleet-top2-selected-pad-h); background: none; border: 0; color: var(--f-on-island); font: 600 14px var(--type-family-sans); white-space: nowrap; cursor: pointer; width: 100%; }
  .bar { color: var(--f-ink-dim); align-self: center; padding: 0 2px; }
  .chips { display: flex; align-items: center; overflow-x: auto; scrollbar-width: none; min-width: 0; }
  .tab { display: flex; align-items: center; flex: none; min-width: var(--fleet-top2-tab-min-width); height: var(--fleet-top2-tab-height); padding: 0 var(--fleet-top2-idle-pad-h);
    border-radius: var(--fleet-top2-tab-radius); color: var(--f-ink-dim); text-decoration: none; justify-content: center; box-sizing: border-box; }
  .tab.on { background: var(--f-tab-selected); color: var(--f-on-tab-selected); padding: 0 var(--fleet-top2-selected-pad-h); }
  .lbl { padding-left: 6px; font: 500 var(--fleet-top2-label) / normal var(--type-family-sans); white-space: nowrap; }
  .on .lbl { font-weight: 700; }
  .scrim { position: fixed; inset: 0; z-index: 30; }
  .dd { position: absolute; z-index: 31; top: 100%; left: 0; width: 240px; max-height: 320px; overflow-y: auto; background: var(--f-island); border-radius: 12px; box-shadow: 0 8px 24px #0008; }
  .dd a, .dd span { display: block; padding: 12px 16px; color: var(--f-on-island); text-decoration: none; font: 400 14px var(--type-family-sans); }
  .dd .on { color: var(--f-accent-on-island); font-weight: 700; }
</style>
