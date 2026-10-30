<script lang="ts">
  // NavBarTopSecondRow (#1154): the bottom page's sub-pages as small tabs in a rounded strip (radius 14, tabStrip fill, 1dp
  // islandBorder, 4dp vertical padding, 8dp sides, 10dp above and below), shared SpaceEvenly; a tab = 16dp glyph + 9sp name
  // (bold when selected), 36dp tall, min 40dp, padding 12 (selected) / 8; the selected one a radius-10 rounded rectangle in
  // tabSelected (#7C3AED) with onTabSelected ink, idle ink inkDim. compact (scrolled down) = 28dp, only the selected name.
  import Icon from '../shell/Icon.svelte';
  type T = { id: string; label: string; icon: string; href: string | null };
  let { tabs, selected, compact = false, testid = 'fleet-second-row' }: { tabs: T[]; selected: string | null; compact?: boolean; testid?: string } = $props();
</script>

<nav class="second-row" class:compact data-testid={testid}>
  <div class="strip" role="tablist">
    {#each tabs as t, i (i)}
      <svelte:element this={t.href ? 'a' : 'span'} class="tab" class:on={t.id === selected} href={t.href} role="tab" aria-selected={t.id === selected} aria-label={t.label} data-testid="ftab-{t.id}">
        <Icon set="fleet" name={t.icon} size={16} />
        {#if !compact || t.id === selected}<span class="lbl">{t.label}</span>{/if}
      </svelte:element>
    {/each}
  </div>
</nav>

<style>
  .second-row { padding: var(--fleet-top2-top-inset) var(--fleet-top2-side) var(--fleet-top2-bottom-inset); }
  .strip { display: flex; justify-content: space-evenly; align-items: center; overflow-x: auto; scrollbar-width: none; padding: var(--fleet-top2-strip-pad-v) 0;
    border-radius: var(--fleet-top2-strip-radius); background: var(--f-tab-strip); border: 1px solid var(--f-island-border); }
  .tab { display: flex; align-items: center; justify-content: center; flex: none; min-width: var(--fleet-top2-tab-min-width); height: var(--fleet-top2-tab-height);
    padding: 0 var(--fleet-top2-idle-pad-h); border-radius: var(--fleet-top2-tab-radius); color: var(--f-ink-dim); text-decoration: none; box-sizing: border-box; transition: height 200ms; }
  .tab.on { background: var(--f-tab-selected); color: var(--f-on-tab-selected); padding: 0 var(--fleet-top2-selected-pad-h); }
  .compact .tab { height: var(--fleet-top2-compact-tab-height); }
  .lbl { padding-left: 6px; font: 500 var(--fleet-top2-label) / normal var(--type-family-sans); white-space: nowrap; }
  .on .lbl { font-weight: 700; }
</style>
