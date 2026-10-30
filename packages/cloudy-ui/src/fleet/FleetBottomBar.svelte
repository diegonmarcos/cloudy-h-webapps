<script lang="ts">
  // NavBarBottom (#1154): a glass pill (64dp, radius 32, fill = SearchHtmlTokens.fill, 1dp border), at most 440dp wide, 16dp
  // gutters, 20dp above the bottom, 8dp inner padding, cells SpaceAround of min(56, (bar-16)/n) x 56 round; at rest every item
  // shows its 12sp medium label 4dp off the cell's bottom and its 24dp icon lifted 6dp; the selected item takes the accent
  // (#0A84FF), the rest the slate idle ink. Scrolled down (collapsed): 52dp bar, 44dp cells, only the selected label.
  import Icon from '../shell/Icon.svelte';
  import { cellWidth } from './fleetNav';
  type Item = { id: string; label: string; icon: string; href: string };
  /** clean: icons only, the Clean sizes (tokens nav.clean*); hidden: scroll-hide has taken the bar away. */
  let { items, selected, collapsed = false, clean = false, hidden = false }: { items: Item[]; selected: string | null; collapsed?: boolean; clean?: boolean; hidden?: boolean } = $props();
  let bar = $state(0);
  const cell = $derived(bar ? cellWidth(bar, items.length) : 56);
</script>

<nav class="fleet-bottom bottom-nav" data-testid="fleet-bottom" class:collapsed class:clean class:away={hidden}>
  <div class="bar" role="tablist" bind:clientWidth={bar}>
    {#each items as it, i (i)}
      {@const on = it.id === selected}
      <a class="cell" class:on class:labelled={!clean && (!collapsed || on)} href={it.href} role="tab" aria-selected={on} aria-label={clean ? it.label : undefined} style:width="{cell}px" data-testid="fbottom-{it.id}">
        <span class="ico"><Icon set="fleet" name={it.icon} size={clean ? 22 : 24} /></span>
        {#if !clean}<span class="lbl">{it.label}</span>{/if}
      </a>
    {/each}
  </div>
</nav>

<style>
  .fleet-bottom { position: absolute; left: 0; right: 0; bottom: 0; z-index: 18; display: flex; justify-content: center; pointer-events: none;
    padding: 0 var(--fleet-bottom-side-gutter) calc(var(--fleet-bottom-bottom-margin) + env(safe-area-inset-bottom, 0px)); }
  .bar { pointer-events: auto; width: 100%; max-width: var(--fleet-bottom-max-width); height: var(--fleet-bottom-height); box-sizing: border-box; display: flex; justify-content: space-around; align-items: center;
    padding: 0 var(--fleet-bottom-inner-pad); border-radius: var(--fleet-bottom-radius); background: var(--f-bar-fill); border: 1px solid var(--f-bar-border);
    backdrop-filter: blur(12px); transition: height 200ms; }
  .collapsed .bar { height: var(--fleet-bottom-collapsed-height); }
  /* Clean (NavUiMode): compact, icons only, a smaller bar so the reading area gets the room */
  .clean .bar { height: var(--nav-clean-bar-height); }
  .clean .cell { height: var(--nav-clean-cell-height); }
  .clean { padding-bottom: calc(var(--nav-clean-bottom-margin) + env(safe-area-inset-bottom, 0px)); }
  /* scroll-hide: a downward scroll takes the bar away, an upward one brings it back */
  .away { transform: translateY(100%); opacity: 0; pointer-events: none; }
  .fleet-bottom { transition: transform 220ms, opacity 220ms; }
  .cell { position: relative; height: var(--fleet-bottom-cell); border-radius: 999px; display: grid; place-items: center; color: var(--f-bar-idle); text-decoration: none; flex: none; }
  .collapsed .cell { height: var(--fleet-bottom-collapsed-cell); }
  .cell.on { color: var(--f-bar-accent); }
  .ico { transition: transform 200ms; }
  .labelled .ico { transform: translateY(calc(-1 * var(--fleet-bottom-lift))); }
  .lbl { position: absolute; left: 0; right: 0; bottom: var(--fleet-bottom-label-bottom); text-align: center; font: 500 var(--fleet-bottom-label) / normal var(--type-family-sans);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity 200ms; }
  .labelled .lbl { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .bar, .ico, .lbl, .cell, .fleet-bottom { transition: none; } }
  :global(html.embed) .fleet-bottom { display: none; }
</style>
