<script lang="ts">
  // A fleet app's chrome (libs:ui-nav-bars, #1154): NavBarTopFirstRowScaffold (first row) over NavBarBottomHost (content on the
  // shared page gradient, libs:theme-background, ending where the bar's slot begins), the second row(s) at the top of the
  // content. One scroll machine: scrolling down hides the first row and compacts the second row and the bar; up restores.
  // Embedded in the APK pane (?embed=1 / UA marker): content only.
  import type { Snippet } from 'svelte';
  import FleetFirstRow from './FleetFirstRow.svelte';
  import FleetSecondRow from './FleetSecondRow.svelte';
  import FleetBottomBar from './FleetBottomBar.svelte';
  type Tab = { id: string; label: string; icon: string; href: string | null };
  let { app, background = 'dark', crumbs, related, sections, section, tabs = [], tab = null, subtabs = [], subtab = null, aiHref = null, profileHref = null, configsHref = null, children }: {
    app: string; background?: string; crumbs: { label: string; href: string | null }[]; related: { id: string; label: string; href: string | null; indent: number; selected: boolean }[];
    sections: { id: string; label: string; icon: string; href: string }[]; section: string | null; tabs?: Tab[]; tab?: string | null; subtabs?: Tab[]; subtab?: string | null;
    aiHref?: string | null; profileHref?: string | null; configsHref?: string | null; children: Snippet;
  } = $props();
  let collapsed = $state(false);
  let last = 0;
  const onScroll = (e: Event) => { const y = (e.currentTarget as HTMLElement).scrollTop; const d = y - last; last = y; if (d > 0 && y > 0) collapsed = true; else if (d < 0) collapsed = false; };
</script>

<div class="fleet" class:light={background === 'light'} class:theme={background === 'theme'} class:collapsed data-app={app} data-testid="fleet-shell">
  <div class="top" class:away={collapsed}><FleetFirstRow {crumbs} {related} {aiHref} {profileHref} {configsHref} /></div>
  <main class="content" onscroll={onScroll} data-testid="fleet-content">
    {#if tabs.length > 1}<FleetSecondRow tabs={tabs} selected={tab} compact={collapsed} />{/if}
    {#if subtabs.length > 1}<FleetSecondRow tabs={subtabs} selected={subtab} compact={collapsed} testid="fleet-third-row" />{/if}
    {@render children()}
  </main>
  {#if sections.length > 1}<FleetBottomBar items={sections} selected={section} {collapsed} />{/if}
</div>

<style>
  .fleet { position: fixed; inset: 0; display: flex; flex-direction: column; overflow: hidden; color: var(--f-ink); font-family: var(--type-family-sans);
    background: linear-gradient(180deg, var(--f-top), var(--f-bottom));
    --f-top: var(--fleet-theme-dark-top); --f-bottom: var(--fleet-theme-dark-bottom); --f-ink: var(--fleet-theme-dark-ink); --f-ink-dim: var(--fleet-theme-dark-ink-dim);
    --f-island: var(--fleet-theme-dark-island); --f-on-island: var(--fleet-theme-dark-on-island); --f-island-border: var(--fleet-theme-dark-island-border);
    --f-accent: var(--fleet-theme-dark-accent); --f-accent-on-island: var(--fleet-theme-dark-accent-on-island); --f-tab-selected: var(--fleet-theme-dark-tab-selected);
    --f-on-tab-selected: var(--fleet-theme-dark-on-tab-selected); --f-tab-strip: var(--fleet-theme-dark-tab-strip);
    --f-bar-fill: var(--fleet-searchhtml-fill-dark); --f-bar-border: var(--fleet-searchhtml-border-dark); --f-bar-accent: var(--fleet-searchhtml-accent-dark); --f-bar-idle: var(--fleet-searchhtml-idle-dark); }
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
  .content { flex: 1; min-height: 0; overflow-y: auto; padding-bottom: calc(var(--fleet-bottom-height) + var(--fleet-bottom-bottom-margin)); position: relative; container: pane / inline-size; }
  @media (prefers-reduced-motion: reduce) { .top { transition: none; } }
  :global(html.embed) .fleet { position: static; overflow: visible; background: none; }
  :global(html.embed) .top, :global(html.embed) .fleet :global(.second-row) { display: none; }
  :global(html.embed) .content { overflow: visible; padding: 0; }
</style>
