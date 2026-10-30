<script lang="ts">
  // libs:bottomnav BottomNavIsland / IslandContent: a stadium of islandFill at widthFraction of the width (fitted per
  // planIsland when crowded), endInset padding, equal cells; the selected cell is a pillFill capsule inset pillInset top and
  // bottom, ink pillInk; idle ink idleInk. Icon 24, gap 8, label 12sp Roboto regular. Scroll-down collapses to icons (220 ms).
  import Icon from './Icon.svelte';
  import { planIsland, lerp } from './planIsland';
  import { tokens } from '../../tokens/tokens';
  import type { NavItem } from './types';
  /** hidden: scroll-hide has taken the island away. */
  let { items, selected, collapsed = false, label = 'Sections', hidden = false }: { items: NavItem[]; selected: string | null; collapsed?: boolean; label?: string; hidden?: boolean } = $props();
  const T = tokens.nav;
  let width = $state(0);
  const plan = $derived(width ? planIsland(width, T.widthFraction, T.endInset, items.length, T) : null);
  const fitted = $derived(!!plan?.fitted);
  const icon = $derived(fitted && plan ? lerp(T.fitIconSize, T.iconSize, plan.scale) : T.iconSize);
  const gap = $derived(fitted && plan ? lerp(T.fitIconLabelGap, T.iconLabelGap, plan.scale) : T.iconLabelGap);
  const text = $derived(fitted && plan ? lerp(T.fitLabelTextSize, T.labelTextSize, plan.scale) : T.labelTextSize);
</script>

<nav class="bottom-nav" class:away={hidden} aria-label={label} bind:clientWidth={width} data-testid="bottom-nav" data-collapsed={collapsed ? '1' : '0'}>
  <div class="island" role="tablist" data-testid="island"
    style:width={fitted && plan ? `${plan.islandWidth}px` : null}
    style:padding-inline={plan ? `${plan.endInset}px` : null}>
    {#each items as it, i (i)}
      <a class="bottom-nav__item item" class:on={it.id === selected} href={it.href} role="tab" aria-selected={it.id === selected}
        aria-label={collapsed ? it.label : undefined} aria-posinset={i + 1} aria-setsize={items.length} data-testid="bottom-nav-{it.id}">
        <span class="slot" style:padding-block={fitted ? `${(T.iconSize - icon) / 2}px` : null}><Icon name={it.icon} size={icon} /></span>
        <span class="label" style:padding-top="{gap}px" style:font-size="{text}px" style:padding-inline={fitted ? `${T.fitLabelInset}px` : null}>{it.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .bottom-nav { position: absolute; left: 0; right: 0; bottom: 0; z-index: 18; display: flex; justify-content: center;
    padding-bottom: calc(var(--nav-island-bottom-margin) + env(safe-area-inset-bottom, 0px)); pointer-events: none; }
  .island { pointer-events: auto; width: calc(var(--nav-width-fraction) * 100%); box-sizing: border-box; display: flex; align-items: center;
    border-radius: 999px; background: var(--nav-island-fill); padding-inline: var(--nav-end-inset); }
  .item { flex: 1 1 0; min-width: 0; margin-block: var(--nav-pill-inset); padding-block: var(--nav-item-vertical-pad); border-radius: 999px;
    display: flex; flex-direction: column; align-items: center; color: var(--nav-idle-ink); text-decoration: none; -webkit-tap-highlight-color: transparent; }
  .item.on { background: var(--nav-pill-fill); color: var(--nav-pill-ink); }
  .item:focus-visible { outline: var(--nav-focus-ring-width) solid currentColor; outline-offset: calc(-1 * var(--nav-focus-ring-width)); }
  .label { display: block; width: 100%; box-sizing: border-box; font-family: var(--type-family-sans); font-weight: 400; line-height: normal; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-height: 3em; opacity: 1;
    transition: max-height var(--nav-collapse-ms) ease, opacity var(--nav-collapse-ms) ease, padding-top var(--nav-collapse-ms) ease; }
  [data-collapsed='1'] .label { max-height: 0; opacity: 0; padding-top: 0 !important; }
  @media (prefers-reduced-motion: reduce) { .label { transition: none; } }
  /* scroll-hide */
  .bottom-nav { transition: transform 220ms, opacity 220ms; }
  .away { transform: translateY(100%); opacity: 0; }
  .away .island { pointer-events: none; }
  @media (prefers-reduced-motion: reduce) { .bottom-nav { transition: none; } }
  :global(html.embed) .bottom-nav { display: none; }
</style>
