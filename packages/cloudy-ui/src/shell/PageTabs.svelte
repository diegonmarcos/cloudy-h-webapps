<script lang="ts">
  // libs:bottomnav PageTabs (the SuperApp strip): monospace bold CAPS 12sp, 0.08em tracking, 14x8 padding, 3dp margin,
  // 18dp-radius pills; equalised to one width (planPills); a launch page is preceded by a "|" divider. flushTop in the shell
  // (no top gap), 10dp under, 4dp strip padding. Dark surface by default; `light` = TabSurface.Light.
  import { onMount } from 'svelte';
  import { planPills, fitLabel, type PillPlan } from './planPills';
  import { tokens } from '../../tokens/tokens';
  import type { Tab } from './types';
  let { tabs, selected, surface = 'dark', flushTop = true, sub = false }: { tabs: Tab[]; selected: string | null; surface?: 'dark' | 'light'; flushTop?: boolean; sub?: boolean } = $props();
  const T = tokens.nav;
  let width = $state(0);
  let charW = $state<((px: number) => number) | null>(null);
  onMount(() => {
    const c = document.createElement('canvas').getContext('2d');
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--type-family-mono') || 'monospace';
    charW = (px: number) => { if (!c) return px * 0.68; c.font = `700 ${px}px ${fam}`; return c.measureText('M').width + px * (T.tabsLetterSpacingMilli / 1000); };
  });
  const labels = $derived(tabs.map((t) => (t.label ?? t.id).toUpperCase()));
  const firstLaunch = $derived(tabs.findIndex((t) => t.action));
  const dividers = $derived(new Set(tabs.map((t, i) => (i > 0 && (i === firstLaunch || t.separatorBefore) ? i : -1)).filter((i) => i > 0)));
  const plan: PillPlan | null = $derived.by(() => {
    if (!width || !charW || !tabs.length) return null;
    const dividerPx = dividers.size * (charW(T.tabsTextSize) + 2 * T.tabsDividerPad);
    return planPills({ availPx: width - 2 * T.tabsStripPadding - dividerPx, count: tabs.length, longest: Math.max(...labels.map((l) => l.length)),
      padPx: 2 * T.tabsPillPadH, marginPx: 2 * T.tabsPillMargin, startPx: T.tabsTextSize, minPx: T.tabsTextMinSize, stepPx: 1, minChars: T.tabsMinChars, charWidth: charW });
  });
  const chars = $derived(plan && charW ? Math.max(1, Math.floor((plan.pillPx - 2 * T.tabsPillPadH) / charW(plan.textPx) + 0.001)) : 99);
  const slot = $derived(width && tabs.length ? (width - 2 * T.tabsStripPadding) / tabs.length : 0);
</script>

<div class="page-tabs-bar" class:page-tabs-bar--sub={sub} class:light={surface === 'light'} class:flush={flushTop} bind:clientWidth={width} data-testid={sub ? 'page-tabs-sub' : 'page-tabs'}>
  <div class="strip" class:scroll={plan?.scrollable} role="tablist" style:--pill-text={plan ? `${plan.textPx}px` : null}>
    {#each tabs as t, i (i)}
      {#if dividers.has(i)}<span class="divider" aria-hidden="true">|</span>{/if}
      <span class="slot" style:width={plan && !plan.scrollable && !dividers.size ? `${slot}px` : null}>
        {#if t.href !== null}
          <a class="page-tabs__item pill" class:on={t.id === selected} href={t.href} role="tab" aria-selected={t.id === selected}
            style:width={plan ? `${plan.pillPx}px` : null} data-testid="tab-{t.id}" title={t.label}>{fitLabel(labels[i], chars)}</a>
        {:else}
          <span class="page-tabs__item pill" aria-disabled="true" style:width={plan ? `${plan.pillPx}px` : null} title={t.label}>{fitLabel(labels[i], chars)}</span>
        {/if}
      </span>
    {/each}
  </div>
</div>

<style>
  .page-tabs-bar { width: 100%; padding-top: var(--nav-tabs-top-inset); padding-bottom: var(--nav-tabs-bottom-inset); box-sizing: border-box;
    --fill: var(--nav-tabs-idle-fill); --line: var(--nav-tabs-idle-stroke); --ink: var(--nav-tabs-idle-text);
    --fill-on: var(--nav-tabs-selected-fill); --line-on: var(--nav-tabs-selected-stroke); --ink-on: var(--nav-tabs-selected-text); }
  .page-tabs-bar.flush { padding-top: 0; }
  .page-tabs-bar.light { --fill: var(--nav-tabs-light-idle-fill); --line: var(--nav-tabs-light-idle-stroke); --ink: var(--nav-tabs-light-idle-text);
    --fill-on: var(--nav-tabs-light-selected-fill); --line-on: var(--nav-tabs-light-selected-stroke); --ink-on: var(--nav-tabs-light-selected-text); }
  .strip { display: flex; justify-content: center; align-items: center; padding: var(--nav-tabs-strip-padding); }
  .strip.scroll { justify-content: flex-start; overflow-x: auto; scrollbar-width: none; }
  .slot { display: flex; justify-content: center; flex: none; }
  .pill { display: block; box-sizing: border-box; margin: 0 var(--nav-tabs-pill-margin); padding: var(--nav-tabs-pill-pad-v) var(--nav-tabs-pill-pad-h);
    border-radius: var(--nav-tabs-pill-radius); border: var(--nav-tabs-pill-stroke) solid var(--line); background: var(--fill); color: var(--ink);
    font: 700 var(--pill-text, var(--nav-tabs-text-size)) / normal var(--type-family-mono); letter-spacing: 0.08em; text-align: center;
    white-space: nowrap; overflow: hidden; text-decoration: none; -webkit-tap-highlight-color: transparent; }
  .pill.on { background: var(--fill-on); border-color: var(--line-on); color: var(--ink-on); }
  .pill:focus-visible { outline: 2px solid var(--ink); }
  .divider { color: var(--ink); font: 700 var(--pill-text, var(--nav-tabs-text-size)) var(--type-family-mono); padding: 0 var(--nav-tabs-divider-pad); }
</style>
