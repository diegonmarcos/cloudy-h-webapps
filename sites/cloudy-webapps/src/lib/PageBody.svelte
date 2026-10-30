<script lang="ts">
  // A SuperApp page body, ICONS FIRST (AggregatorStackFragment): the tile grid on top, the collapsible stack cards under a
  // divider; content-only pages draw their rows (KitListRow); a page with nothing a browser can show says so (KitEmptyState).
  import { Tiles, StackCard, ListRow, EmptyState } from '@cloudy/ui';
  import type { Body } from '$lib/server/nav';
  let { body }: { body: Body } = $props();
</script>

<div class="body" data-testid="page-body">
  {#if body.groups}<Tiles groups={body.groups} quickmarks={body.quickmarks} />{/if}
  {#if body.tiles}<Tiles groups={[{ title: '', tiles: body.tiles }]} wrap={body.wrap} />{/if}
  {#if body.stack?.length}
    {#if body.tiles || body.groups}<hr class="div" />{/if}
    {#each body.stack as c (c.title)}
      <StackCard title={c.title} subtitle={c.subtitle} href={c.href}>
        {#each c.rows as [k, val]}<ListRow label={k}>{#snippet trailing()}<span class="val">{val}</span>{/snippet}</ListRow>{/each}
        <p class="cap">{c.caption}</p>
      </StackCard>
    {/each}
  {/if}
  {#if body.items?.length}
    {#if body.note}<p class="note">{body.note}</p>{/if}
    <div class="items" class:grid={body.viewType === 'grid' || body.viewType === 'cards'}>
      {#each body.items as it, i (i)}
        <ListRow label={it.title} secondary={it.subtitle} leading={it.lead} href={it.href}>
          {#snippet trailing()}{#if it.meta}<span class="meta">{it.meta}</span>{/if}{/snippet}
        </ListRow>
      {/each}
    </div>
  {/if}
  {#if body.empty}<div class="empty"><EmptyState title={body.empty.title} caption={body.empty.caption} /></div>{/if}
</div>

<style>
  .body { min-height: 100%; }
  .div { border: 0; height: 1px; background: var(--role-hairline); margin: 4px 12px 12px; }
  .items { padding: 0 12px; }
  .items.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); column-gap: 12px; }
  .val, .meta { font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-secondary); white-space: nowrap; }
  .cap, .note { margin: 0; font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-secondary); }
  .note { padding: 0 12px 8px; }
  .empty { height: 60vh; }
  :global(.tile-page) :global(.group-title:empty) { display: none; }
</style>
