<script lang="ts">
  // The SuperApp shell (activity_main.xml): window + galaxy, status strip, toolbar island (orbs at Home, hamburger | Back
  // elsewhere, Dynamic Island), the page container padded to the row's bottom edge (ShellTopInset: max(shell_top_inset,
  // island bottom)) and 92dp above the island, the bottom island, the drawer. sw600dp: master 40% | 1dp #22FFFFFF | detail 60%,
  // detail GONE on Home (res/layout-sw600dp/view_content_panes.xml). Embedded (?embed=1 / UA marker): content only.
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import Window from './Window.svelte';
  import StatusStrip from './StatusStrip.svelte';
  import TopRow from './TopRow.svelte';
  import BottomNavIsland from './BottomNavIsland.svelte';
  import PageTabs from './PageTabs.svelte';
  import Drawer from './Drawer.svelte';
  import { scrollHideStep, DEFAULT_NAV_UI, type ChromeState } from './navUi';
  import EmptyState from '../components/EmptyState.svelte';
  import { swipe } from './gestures';
  import { trackLayout } from './layout';
  import type { Tab, ShellData } from './types';

  let { shell, section, sectionLabel = '', atHome = false, backHref = null, historyBack = false, tabs = [], tabSelected = null, subtabs = [], subSelected = null,
    tabHrefs = [], children, detail }: {
    shell: ShellData; section: string; sectionLabel?: string; atHome?: boolean; backHref?: string | null; historyBack?: boolean;
    tabs?: Tab[]; tabSelected?: string | null; subtabs?: Tab[]; subSelected?: string | null; tabHrefs?: string[];
    children: Snippet; detail?: Snippet;
  } = $props();

  let drawerOpen = $state(false);
  let stripH = $state(0);
  onMount(() => trackLayout());
  // scroll-hide (NavUiDecl, on by default): a downward scroll hides ALL bars (top row, island) until an upward scroll reveals them.
  // The SuperApp stays Classic: its Clean mode and Configs > UI follow with the SuperApp's own Android host (nav-shape.json nav_ui.pending).
  let chrome = $state<ChromeState>('shown');
  const hidden = $derived(chrome === 'hidden');
  let lastY = 0;
  const onScroll = (e: Event) => { const y = (e.currentTarget as HTMLElement).scrollTop; const d = y - lastY; lastY = y; chrome = scrollHideStep(chrome, y <= 0 ? -1 : d, DEFAULT_NAV_UI.scrollHide); };

  const tabSwipe = (dir: -1 | 1) => {
    const i = tabs.findIndex((t) => t.id === tabSelected);
    const next = tabHrefs[i + dir];
    if (i >= 0 && next) location.assign(next);
  };
  const drawerTabs: Tab[] = $derived([{ id: 'home', label: 'Home', href: shell.homeHref }, ...(atHome ? [] : [{ id: section, label: sectionLabel || section, href: null }])]);
</script>

<div class="shell" data-section={section} data-home={atHome ? '1' : '0'} style:--strip-h={stripH ? `${stripH}px` : null}>
  <Window />
  <div class="strip-wrap" bind:clientHeight={stripH}><StatusStrip chips={shell.chips} right={shell.right} battery={shell.battery} /></div>
  <TopRow {atHome} {backHref} {historyBack} orbHref={shell.orbHref} islandHref={shell.islandHref} onMenu={() => (drawerOpen = true)} {hidden} />
  <div class="panes" class:split={!atHome}>
    <main class="pane master content" onscroll={onScroll} use:swipe={{ onTab: tabSwipe, onEdge: () => (drawerOpen = true) }} data-testid="content">
      {#if tabs.length}<PageTabs {tabs} selected={tabSelected} />{/if}
      {#if subtabs.length}<PageTabs tabs={subtabs} selected={subSelected} sub />{/if}
      {@render children()}
    </main>
    {#if !atHome}
      <div class="pane-divider" aria-hidden="true"></div>
      <section class="pane detail" aria-label="Detail" data-testid="detail">
        {#if detail}{@render detail()}{:else}<EmptyState title={null} caption="Select an item" />{/if}
      </section>
    {/if}
  </div>
  <BottomNavIsland items={shell.bottom} selected={section} {hidden} />
  <Drawer bind:open={drawerOpen} rows={shell.drawer} tabs={drawerTabs} selectedTab={atHome ? 'home' : section} app={shell.app} />
</div>

<style>
  .shell { position: fixed; inset: 0; overflow: hidden; color: var(--role-text-primary); font-family: var(--type-family-sans);
    --top-row-top: calc(var(--strip-h, 34px) + 6px);
    --content-top: max(var(--shell-shell-top-inset), calc(var(--top-row-top) + var(--shell-action-bar-size))); }
  .strip-wrap { position: absolute; top: 0; left: 0; right: 0; z-index: 20; }
  .panes { position: absolute; inset: 0; z-index: 1; display: flex; }
  .pane { height: 100%; box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain; padding-top: var(--content-top); padding-bottom: 92px; position: relative; }
  .master { flex: 1 1 100%; min-width: 0; }
  .pane-divider, .detail { display: none; }
  :global(html[data-panes='2']) .split .master { flex: 0 0 40%; }
  :global(html[data-panes='2']) .split .pane-divider { display: block; width: 1px; flex: none; margin-top: var(--content-top); margin-bottom: 92px; background: #ffffff22; }
  :global(html[data-panes='2']) .split .detail { display: block; flex: 1 1 60%; min-width: 0; }
  /* cloud_minimalist_black: features.bottom_nav/dynamic_island/drawer false - no chrome, one-screen scroll */
  :global(html[data-theme='cloud_minimalist_black']) .shell :global(.bottom-nav),
  :global(html[data-theme='cloud_minimalist_black']) .shell :global(.top-row),
  :global(html[data-theme='cloud_minimalist_black']) .strip-wrap { display: none; }
  :global(html[data-theme='cloud_minimalist_black']) .pane { padding-top: 12px; padding-bottom: 12px; }
  /* embedded in the APK's WebApps pane: content only, document scroll (the pane's pull-to-refresh reads the WebView's scrollY) */
  :global(html.embed) .shell { position: static; overflow: visible; }
  :global(html.embed) .strip-wrap, :global(html.embed) .shell :global(.top-row), :global(html.embed) .pane-divider, :global(html.embed) .detail { display: none !important; }
  :global(html.embed) .panes { position: static; display: block; }
  :global(html.embed) .pane { height: auto; overflow: visible; padding: 0; }
</style>
