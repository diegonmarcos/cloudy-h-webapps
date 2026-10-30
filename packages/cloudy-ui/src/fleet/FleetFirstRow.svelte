<script lang="ts">
  // NavBarTopFirstRow (#1154): no hamburger; the title at the LEFT as a breadcrumb ("App / Section / Page") in a rounded island
  // (radius 20, island colour, 1dp islandBorder, 14x7 padding, 13sp semibold, cut from the left), a tap opens the dropdown (the
  // path with each segment tappable, a separator, siblings + children); AI (auto_awesome), Profile (account_circle) and
  // Configs (more_vert) as plain 24dp glyphs in 44dp targets at the right, in the theme's ink.
  import { onMount } from 'svelte';
  import Icon from '../shell/Icon.svelte';
  import { fitCrumbs } from './fleetNav';
  type Crumb = { label: string; href: string | null };
  type Rel = { id: string; label: string; href: string | null; indent: number; selected: boolean };
  let { crumbs, related, aiHref = null, profileHref = null, configsHref = null }: {
    crumbs: Crumb[]; related: Rel[]; aiHref?: string | null; profileHref?: string | null; configsHref?: string | null;
  } = $props();
  let open = $state(false);
  let room = $state(0);
  let line = $state(crumbs.map((c) => c.label).join(' / '));
  let measure: ((l: string) => number) | null = null;
  onMount(() => {
    const ctx = document.createElement('canvas').getContext('2d');
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--type-family-sans');
    if (ctx) measure = (l) => { ctx.font = `600 13px ${fam}`; return ctx.measureText(l).width; };
    fit();
  });
  // BreadcrumbText: the whole path when it fits the room the right slot leaves, else cut from the LEFT.
  function fit() { if (measure && room) line = fitCrumbs(crumbs.map((c) => c.label), (l) => measure!(l) <= room - 28); }
  $effect(() => { void room; void crumbs; fit(); });
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape') open = false; }} />

<div class="app-top-bar first-row" data-testid="fleet-first-row">
  <div class="left" bind:clientWidth={room}>
    <button class="island" onclick={() => (open = !open)} aria-expanded={open} aria-haspopup="menu" data-testid="fleet-title"><h1>{line}</h1></button>
    {#if open}
      <div class="scrim" onclick={() => (open = false)} aria-hidden="true"></div>
      <div class="dropdown" role="menu" data-testid="fleet-dropdown">
        <div class="crumbs">
          {#each crumbs as c, i (i)}{#if i > 0}<span class="sep"> / </span>{/if}<svelte:element this={c.href ? 'a' : 'span'} href={c.href} class:last={i === crumbs.length - 1}>{c.label}</svelte:element>{/each}
        </div>
        {#if related.length}<hr />{/if}
        {#each related as r, i (i)}
          <svelte:element this={r.href ? 'a' : 'span'} class="item" class:on={r.selected} href={r.href} role="menuitem" style:padding-left="{16 + 16 * r.indent}px">{r.label}</svelte:element>
        {/each}
      </div>
    {/if}
  </div>
  <div class="slot">
    <svelte:element this={aiHref ? 'a' : 'span'} class="ic" href={aiHref} aria-label="AI"><Icon set="fleet" name="filled:auto_awesome" /></svelte:element>
    <svelte:element this={profileHref ? 'a' : 'span'} class="ic" href={profileHref} aria-label="Account"><Icon set="fleet" name="filled:account_circle" /></svelte:element>
    <svelte:element this={configsHref ? 'a' : 'span'} class="ic" href={configsHref} aria-label="Configs"><Icon set="fleet" name="filled:more_vert" /></svelte:element>
  </div>
</div>

<style>
  .first-row { display: flex; align-items: center; height: var(--fleet-top1-height); color: var(--f-ink); }
  .left { position: relative; flex: 1; min-width: 0; padding-left: calc(var(--fleet-top1-island-pad-h) / 2); }
  .island { max-width: 100%; display: inline-flex; border-radius: var(--fleet-top1-island-radius); background: var(--f-island); border: 1px solid var(--f-island-border);
    padding: var(--fleet-top1-island-pad-v) var(--fleet-top1-island-pad-h); color: var(--f-on-island); cursor: pointer; }
  h1 { margin: 0; font: 600 13px / normal var(--type-family-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .slot { width: var(--fleet-top1-slot); display: flex; justify-content: flex-end; flex: none; }
  .ic { width: var(--fleet-top1-icon-target); height: var(--fleet-top1-icon-target); display: grid; place-items: center; color: var(--f-ink); }
  .scrim { position: fixed; inset: 0; z-index: 30; }
  .dropdown { position: absolute; z-index: 31; top: calc(100% + 4px); left: 4px; width: var(--fleet-top1-dropdown-width); max-height: var(--fleet-top1-dropdown-max-height); overflow-y: auto;
    background: var(--f-island); border-radius: 12px; box-shadow: 0 8px 24px #0008; color: var(--f-on-island); padding-bottom: 8px; }
  .crumbs { padding: 8px 16px; white-space: nowrap; overflow-x: auto; font: 400 13px var(--type-family-sans); }
  .crumbs a, .crumbs span { color: var(--f-on-island); text-decoration: none; }
  .crumbs .last { color: var(--f-accent-on-island); font-weight: 700; }
  hr { border: 0; height: 1px; background: var(--f-island-border); margin: 0; }
  .item { display: block; padding: 12px 16px; font: 400 14px var(--type-family-sans); color: var(--f-on-island); text-decoration: none; }
  .item.on { color: var(--f-accent-on-island); font-weight: 700; }
</style>
