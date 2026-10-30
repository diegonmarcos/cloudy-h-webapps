<script lang="ts">
  // A fleet app's chrome (libs:ui-nav-bars, #1154): NavBarTopFirstRowScaffold (first row) over NavBarBottomHost (content on the
  // shared page gradient, libs:theme-background, ending where the bar's slot begins), the second row(s) at the top of the
  // content. One scroll machine: scrolling down hides the first row and compacts the second row and the bar; up restores.
  // Embedded in the APK pane (?embed=1 / UA marker): content only.
  import type { Snippet } from 'svelte';
  import FleetFirstRow from './FleetFirstRow.svelte';
  import FleetSecondRow from './FleetSecondRow.svelte';
  import FleetBottomBar from './FleetBottomBar.svelte';
  import FleetSecondRows from './FleetSecondRows.svelte';
  import FleetSideMenu from './FleetSideMenu.svelte';
  import { onMount } from 'svelte';
  import { navChromePlan, scrollHideStep, declaredNavUi, DEFAULT_NAV_UI, type ChromeState, type NavUiSettings } from '../shell/navUi';
  import { navUi, loadNavUi } from '../shell/navUiStore';
  type Tab = { id: string; label: string; icon: string; href: string | null };
  let { app, background = 'dark', crumbs, related, sections, section, tabs = [], tab = null, subtabs = [], subtab = null, aiHref = null, profileHref = null, configsHref = null, mode = 'horizontal_one_row', groups = [], sideItems = [], navUiDecl = null, children }: {
    app: string; background?: string; crumbs: { label: string; href: string | null }[]; related: { id: string; label: string; href: string | null; indent: number; selected: boolean }[];
    sections: { id: string; label: string; icon: string; href: string }[]; section: string | null; tabs?: Tab[]; tab?: string | null; subtabs?: Tab[]; subtab?: string | null;
    aiHref?: string | null; profileHref?: string | null; configsHref?: string | null; children: Snippet;
    /** build.json::ui.nav_ui of the app: the nav mode and scroll-hide it starts in (Cloud Notes: clean). */
    navUiDecl?: { mode?: string; scroll_hide?: boolean } | null;
    mode?: string; groups?: { id: string; label: string; pages: Tab[] }[]; sideItems?: { id: string; label: string; icon: string; depth: number; heading: boolean; href: string | null }[];
  } = $props();
  let width = $state(0);
  let last = 0;
  // The nav UI choice of THIS app (Configs > UI): the declared default, then the user's saved choice (and a ?nav= override).
  const declared: NavUiSettings = declaredNavUi(navUiDecl); // build.json::ui.nav_ui does not change while the shell is mounted
  let ui = $state<NavUiSettings>(DEFAULT_NAV_UI);
  $effect(() => { const u = navUi.subscribe((v) => (ui = v)); return u; });
  onMount(() => { loadNavUi(app, declared); });
  const plan = $derived(navChromePlan(ui.mode));
  // scroll-hide: a downward scroll hides ALL bars (first row, second rows, bottom) until an upward scroll reveals them
  let chrome = $state<ChromeState>('shown');
  const hidden = $derived(chrome === 'hidden');
  const onScroll = (e: Event) => {
    const y = (e.currentTarget as HTMLElement).scrollTop; const d = y - last; last = y;
    chrome = scrollHideStep(chrome, y <= 0 ? -1 : d, ui.scrollHide);
  };
  $effect(() => { if (!ui.scrollHide) chrome = 'shown'; });
  let drawerOpen = $state(false);
  let uiOpen = $state(false);

</script>

<div class="fleet" class:light={background === 'light'} class:theme={background === 'theme'} class:clean={plan.hamburger} class:hidden data-app={app} data-nav-mode={ui.mode} data-testid="fleet-shell">
  <div class="top" class:away={hidden}><FleetFirstRow {crumbs} {related} {aiHref} {profileHref} {configsHref} clean={plan.hamburger} onMenu={() => (drawerOpen = true)} onConfigsUi={() => (uiOpen = true)} /></div>
  <div class="body" bind:clientWidth={width}>
  {#if plan.secondRow && mode === 'vertical_side_menu' && sideItems.length}<FleetSideMenu items={sideItems} selected={subtab ?? tab} narrow={width > 0 && width < 600} />{/if}
  <main class="content" onscroll={onScroll} data-testid="fleet-content">
    {#if plan.secondRow}
    <div class="rows" class:away={hidden}>
    {#if mode === 'horizontal_two_rows' && groups.length}<FleetSecondRows {groups} selected={tab} compact={false} />
    {:else if mode !== 'vertical_side_menu' && tabs.length > 1}<FleetSecondRow tabs={tabs} selected={tab} compact={false} />{/if}
    {#if subtabs.length > 1}<FleetSecondRow tabs={subtabs} selected={subtab} compact={false} testid="fleet-third-row" />{/if}
    </div>
    {/if}
    {@render children()}
  </main>
  </div>
  {#if sections.length > 1}<FleetBottomBar items={sections} selected={section} clean={plan.hamburger} {hidden} />{/if}
  <!-- the Clean drawer and the Configs > UI dialog: one lazy chunk, loaded when first needed (the shell's up-front JS has a budget) -->
  {#if plan.hamburger || uiOpen}{#await import('./FleetNavUi.svelte') then m}<m.default bind:drawerOpen bind:uiOpen clean={plan.hamburger} {app} {declared} {ui} bottom={sections} {section} childPages={tabs} selectedChild={tab} {aiHref} {profileHref} {configsHref} />{/await}{/if}
</div>

<style>
  .fleet { position: fixed; inset: 0; display: flex; flex-direction: column; overflow: hidden; color: var(--f-ink); font-family: var(--type-family-sans);
    background: linear-gradient(180deg, var(--f-top), var(--f-bottom));
    --f-top: var(--fleet-theme-dark-top); --f-bottom: var(--fleet-theme-dark-bottom); --f-ink: var(--fleet-theme-dark-ink); --f-ink-dim: var(--fleet-theme-dark-ink-dim);
    --f-island: var(--fleet-theme-dark-island); --f-on-island: var(--fleet-theme-dark-on-island); --f-island-border: var(--fleet-theme-dark-island-border);
    --f-accent: var(--fleet-theme-dark-accent); --f-accent-on-island: var(--fleet-theme-dark-accent-on-island); --f-tab-selected: var(--fleet-theme-dark-tab-selected);
    --f-on-tab-selected: var(--fleet-theme-dark-on-tab-selected); --f-tab-strip: var(--fleet-theme-dark-tab-strip);
    --f-bar-fill: var(--fleet-searchhtml-fill-dark); --f-bar-border: var(--fleet-searchhtml-border-dark); --f-bar-accent: var(--fleet-searchhtml-accent-dark); --f-bar-idle: var(--fleet-searchhtml-idle-dark); }
  /* Kit text inside a fleet app follows the page's ink (light pages drew white-on-light rows before) */
  .fleet :global(> *) { --role-text-primary: var(--f-ink); --role-text-secondary: var(--f-ink-dim); }
  .fleet.light {
    --f-top: var(--fleet-theme-light-top); --f-bottom: var(--fleet-theme-light-bottom); --f-ink: var(--fleet-theme-light-ink); --f-ink-dim: var(--fleet-theme-light-ink-dim);
    --f-island: var(--fleet-theme-light-island); --f-on-island: var(--fleet-theme-light-on-island); --f-island-border: var(--fleet-theme-light-island-border);
    --f-accent: var(--fleet-theme-light-accent); --f-accent-on-island: var(--fleet-theme-light-accent-on-island); --f-tab-selected: var(--fleet-theme-light-tab-selected);
    --f-on-tab-selected: var(--fleet-theme-light-on-tab-selected); --f-tab-strip: var(--fleet-theme-light-tab-strip);
    --f-bar-fill: var(--fleet-searchhtml-fill-light); --f-bar-border: var(--fleet-searchhtml-border-light); --f-bar-accent: var(--fleet-searchhtml-accent-light); --f-bar-idle: var(--fleet-searchhtml-idle-light); }
  /* PageBackground.THEME: the system's light/dark (Android follows the device; the web follows prefers-color-scheme) */
  @media (prefers-color-scheme: light) { .fleet.theme {
    --f-top: var(--fleet-theme-light-top); --f-bottom: var(--fleet-theme-light-bottom); --f-ink: var(--fleet-theme-light-ink); --f-ink-dim: var(--fleet-theme-light-ink-dim);
    --f-island: var(--fleet-theme-light-island); --f-on-island: var(--fleet-theme-light-on-island); --f-island-border: var(--fleet-theme-light-island-border);
    --f-accent: var(--fleet-theme-light-accent); --f-accent-on-island: var(--fleet-theme-light-accent-on-island); --f-tab-selected: var(--fleet-theme-light-tab-selected);
    --f-on-tab-selected: var(--fleet-theme-light-on-tab-selected); --f-tab-strip: var(--fleet-theme-light-tab-strip);
    --f-bar-fill: var(--fleet-searchhtml-fill-light); --f-bar-border: var(--fleet-searchhtml-border-light); --f-bar-accent: var(--fleet-searchhtml-accent-light); --f-bar-idle: var(--fleet-searchhtml-idle-light); } }
  .top { flex: none; overflow: hidden; height: var(--fleet-top1-height); transition: height 200ms; }
  .top.away { height: 0; }
  /* scroll-hide: the second rows ride on top of the content and leave with the other bars */
  .rows { position: sticky; top: 0; z-index: 5; transition: transform 220ms, opacity 220ms; }
  .rows.away { transform: translateY(-100%); opacity: 0; pointer-events: none; }
  .body { flex: 1; min-height: 0; display: flex; position: relative; }
  .content { flex: 1; min-width: 0; overflow-y: auto; padding-bottom: calc(var(--fleet-bottom-height) + var(--fleet-bottom-bottom-margin)); position: relative; container: pane / inline-size; }
  @media (prefers-reduced-motion: reduce) { .top, .rows { transition: none; } }
  :global(html.embed) .fleet { position: static; overflow: visible; background: none; }
  :global(html.embed) .top, :global(html.embed) .fleet :global(.second-row) { display: none; }
  :global(html.embed) .content { overflow: visible; padding: 0; }
</style>
