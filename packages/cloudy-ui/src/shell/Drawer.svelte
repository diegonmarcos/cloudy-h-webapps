<script lang="ts">
  // view_drawer_panel.xml + HomeDrawerFragment: a 280dp panel (bg_drawer_glass: brand gradient + diagonal violet tint,
  // 2dp #55B794F4 right edge) over the DrawerLayout scrim; row 1 = the [Home] [<section>] pill strip; then the header
  // (app banner on surface, user banner on surface_selected, each >= 84dp) and the DrawerList rows.
  import Icon from './Icon.svelte';
  import PageTabs from './PageTabs.svelte';
  import type { Tab } from './types';
  import type { DrawerRow } from './drawerRows';
  let { open = $bindable(false), rows, tabs, selectedTab, app }: {
    open?: boolean; rows: DrawerRow[]; tabs: Tab[]; selectedTab: string | null;
    app: { name: string; build: string; stamp: string; user: { name: string; email: string; initials: string; mode: string } };
  } = $props();
  const close = () => (open = false);
</script>

<svelte:window onkeydown={(e) => { if (open && e.key === 'Escape') close(); }} />

<div class="scrim" class:open onclick={close} aria-hidden="true"></div>
<aside class="drawer" class:open aria-label="Main menu" aria-hidden={!open} inert={!open} data-testid="drawer">
  <PageTabs {tabs} selected={selectedTab} flushTop={false} />
  <div class="list">
    <div class="banner app">
      <Icon name="ic_home" size={36} />
      <div class="txt"><div class="t1">{app.name}</div><div class="mono a7">{app.build}</div><div class="mono a55">{app.stamp}</div></div>
    </div>
    <div class="hair"></div>
    <div class="banner user">
      <span class="avatar">{app.user.initials}</span>
      <div class="txt"><div class="t2">{app.user.name}</div><div class="small a8">{app.user.email}</div><div class="mono">Mode: {app.user.mode}</div></div>
    </div>
    {#each rows as r, i (i)}
      {#if r.kind === 'title'}<div class="row title">{r.label}</div>
      {:else if r.kind === 'heading'}<div class="row heading">{r.label}</div>
      {:else}
        {@const href = r.href ?? null}
        <svelte:element this={href ? 'a' : 'span'} class="row item" {href} onclick={close} role={href ? undefined : 'presentation'}>
          {#if r.icon}<Icon name={r.icon} size={18} />{:else}<span class="sp"></span>{/if}<span class="lab">{r.label}</span>
        </svelte:element>
      {/if}
    {/each}
  </div>
</aside>

<style>
  .scrim { position: fixed; inset: 0; z-index: 40; background: #00000099; opacity: 0; pointer-events: none; transition: opacity 220ms; }
  .scrim.open { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; bottom: 0; left: 0; z-index: 41; width: 280px; display: flex; flex-direction: column; box-sizing: border-box;
    background: var(--shape-drawer-glass-layers); color: var(--role-text-primary); transform: translateX(-100%); transition: transform 220ms ease;
    border-right: calc(280px - var(--shape-drawer-glass-edge-inset-left)) solid var(--shape-drawer-glass-edge); }
  .drawer.open { transform: none; }
  @media (prefers-reduced-motion: reduce) { .drawer, .scrim { transition: none; } }
  .list { flex: 1; overflow-y: auto; }
  .banner { display: flex; align-items: center; min-height: 84px; padding: 10px 14px; box-sizing: border-box; }
  .banner.app { background: var(--role-surface); }
  .banner.user { background: var(--role-surface-selected); }
  .hair { height: 1px; background: var(--role-hairline); }
  .txt { padding-left: 12px; min-width: 0; }
  .t1 { font: 500 var(--type-title-medium-size) / normal var(--type-family-sans); }
  .t2 { font: 500 var(--type-title-small-size) / normal var(--type-family-sans); }
  .mono { font: 500 var(--type-label-small-size) / normal var(--type-family-mono); }
  .small { font: 500 var(--type-label-small-size) / normal var(--type-family-sans); }
  .a7 { opacity: 0.7; padding-top: 2px; } .a55 { opacity: 0.55; padding-top: 1px; } .a8 { opacity: 0.8; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--role-accent); color: var(--role-tile-ink); display: grid; place-items: center;
    font: 700 var(--type-label-large-size) / 1 var(--type-family-sans); flex: none; }
  .row { display: flex; align-items: center; font: 500 var(--type-label-medium-size) / normal var(--type-family-sans); white-space: pre; overflow: hidden; text-overflow: ellipsis; }
  .title { color: var(--role-accent); opacity: 0.8; padding: 8px 0 2px 8px; }
  .heading { color: var(--role-text-secondary); opacity: 0.7; padding: 2px 0 2px 10px; }
  .item { color: var(--role-text-primary); padding: 3px 10px; text-decoration: none; }
  .lab { padding-left: 8px; overflow: hidden; text-overflow: ellipsis; }
  .sp { width: 18px; flex: none; }
</style>
