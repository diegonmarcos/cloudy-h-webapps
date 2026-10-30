<script lang="ts">
  // M2 interim frame for a fleet app route (every app / section / page URL resolves and prerenders). M3 replaces it with the
  // fleet chrome (libs:ui-nav-bars NavBarTopFirstRow / NavBarTopSecondRow / NavBarBottom) and the pilot apps' bodies.
  import { PageTabs, EmptyState, Icon, Window } from '@cloudy/ui';
  import type { AppView } from '$lib/server/nav';
  let { view }: { view: AppView } = $props();
</script>

<Window stars={false} />
<div class="app-frame" data-app={view.app.id}>
  <header class="app-top-bar"><Icon name={view.app.icon} size={24} /><h1>{view.app.label}</h1></header>
  {#if view.sections.length}
    <PageTabs tabs={view.sections.map((s) => ({ id: s.id, label: s.label, href: s.href }))} selected={view.section} flushTop={false} />
  {/if}
  {#if view.tabs.length}<PageTabs tabs={view.tabs} selected={view.tabSelected} sub />{/if}
  {#if view.subtabs.length}<PageTabs tabs={view.subtabs} selected={view.subSelected} sub />{/if}
  <main class="content"><EmptyState title={view.title} caption="The web mimic of this app lands with its milestone (#1320)." /></main>
</div>

<style>
  .app-frame { position: relative; z-index: 1; min-height: 100dvh; display: flex; flex-direction: column; color: var(--role-text-primary); }
  .app-top-bar { display: flex; align-items: center; gap: 12px; padding: 16px; }
  h1 { margin: 0; font: 500 var(--type-title-medium-size) / normal var(--type-family-sans); }
  .content { flex: 1; }
  :global(html.embed) .app-top-bar, :global(html.embed) .app-frame :global(.page-tabs-bar) { display: none; }
</style>
