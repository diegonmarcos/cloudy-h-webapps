<script lang="ts">
  // NavBarBottom (#1154): a glass pill (64dp, radius 32, fill = SearchHtmlTokens.fill, 1dp border), at most 440dp wide, 16dp
  // gutters, 20dp above the bottom, 8dp inner padding, cells SpaceAround of min(56, (bar-16)/n) x 56 round; at rest every item
  // shows its 12sp medium label 4dp off the cell's bottom and its 24dp icon lifted 6dp; the selected item takes the accent
  // (#0A84FF), the rest the slate idle ink. Scrolled down (collapsed): 52dp bar, 44dp cells, only the selected label.
  import Icon from '../shell/Icon.svelte';
  import { cellWidth } from './fleetNav';
  type Item = { id: string; label: string; icon: string; href: string };
  let { items, selected, collapsed = false }: { items: Item[]; selected: string | null; collapsed?: boolean } = $props();
  let bar = $state(0);
  const cell = $derived(bar ? cellWidth(bar, items.length) : 56);
</script>

<nav class="fleet-bottom bottom-nav" data-testid="fleet-bottom" class:collapsed>
  <div class="bar" role="tablist" bind:clientWidth={bar}>
    {#each items as it, i (i)}
      {@const on = it.id === selected}
      <a class="cell" class:on class:labelled={!collapsed || on} href={it.href} role="tab" aria-selected={on} style:width="{cell}px" data-testid="fbottom-{it.id}">
        <span class="ico"><Icon set="fleet" name={it.icon} size={24} /></span>
        <span class="lbl">{it.label}</span>
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
  .cell { position: relative; height: var(--fleet-bottom-cell); border-radius: 999px; display: grid; place-items: center; color: var(--f-bar-idle); text-decoration: none; flex: none; }
  .collapsed .cell { height: var(--fleet-bottom-collapsed-cell); }
  .cell.on { color: var(--f-bar-accent); }
  .ico { transition: transform 200ms; }
  .labelled .ico { transform: translateY(calc(-1 * var(--fleet-bottom-lift))); }
  .lbl { position: absolute; left: 0; right: 0; bottom: var(--fleet-bottom-label-bottom); text-align: center; font: 500 var(--fleet-bottom-label) / normal var(--type-family-sans);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity 200ms; }
  .labelled .lbl { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .bar, .ico, .lbl, .cell { transition: none; } }
  :global(html.embed) .fleet-bottom { display: none; }
</style>
