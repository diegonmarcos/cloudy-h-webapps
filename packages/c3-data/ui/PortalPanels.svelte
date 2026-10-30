<script lang="ts">
  // One re-homed /cloud/ portal page: its panels (KitCard + rows) from the snapshot, refreshed from the API in live mode.
  import { onMount } from 'svelte';
  import { Card, SectionHeader, ListRow, StatusBanner } from '@cloudy/ui';
  import { c3 } from '../client';
  import { extract, panelFilter, type PanelRow } from '../panels';
  type P = { key: string; title: string; rows: PanelRow[] };
  let { page, caption, panels }: { page: string; caption: string; panels: P[] } = $props();
  let live = $state<P[]>(panels);
  let source = $state('snapshot');
  onMount(async () => {
    const out = await Promise.all(panels.map(async (p) => { const r = await c3(p.key, null); return { r, p }; }));
    if (out.every(({ r }) => r.source === 'snapshot')) return;
    source = out.find(({ r }) => r.source !== 'snapshot')!.r.source;
    live = out.map(({ r, p }) => (r.source === 'snapshot' ? p : { ...p, rows: extract(r.data, panelFilter(page, p.key)) }));
  });
</script>

<div class="portal-page" data-testid="c3-portal-page">
  <StatusBanner text="{caption} Source: {source === 'snapshot' ? 'the committed snapshot' : source === 'mesh' ? 'the mesh API' : 'the public API'}." state={source === 'snapshot' ? 'idle' : 'ok'} />
  {#each live as p (p.key + p.title)}
    <Card><SectionHeader title={p.title} subtitle={p.key} />
      {#each p.rows as r, i (i)}<ListRow label={r.title} secondary={r.subtitle}>{#snippet trailing()}{#if r.meta}<span class="m">{r.meta}</span>{/if}{/snippet}</ListRow>{:else}<p class="m">No rows in this dataset.</p>{/each}
    </Card>
  {/each}
</div>

<style>
  .portal-page { padding: 0 12px 12px; display: flex; flex-direction: column; gap: 12px; }
  .m { font: 400 var(--density-caption) var(--type-family-sans); color: var(--role-text-secondary, #94a3b8); margin: 0; }
  @container pane (min-width: 840px) { .portal-page { display: grid; grid-template-columns: 1fr 1fr; align-items: start; } .portal-page > :global(:first-child) { grid-column: 1 / -1; } }
</style>
