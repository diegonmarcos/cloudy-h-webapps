<script lang="ts">
  // GroupedTilesFragment.kt: GroupTitle (titleSmall, text_primary, 4dp start, 12dp top, 4dp bottom) over a TileStrip of
  // 60dp TileCells (6dp padding, 32dp glyph tinted text_primary, label 12sp at 80% text_primary, 4dp under the glyph, 2 lines),
  // one sideways-scrolling line per group (wrap = false) or wrapped (Configs). A separator is a 0.5dp divider riding on the
  // previous tile's right edge at the glyph's centre (22dp). Page padding 12dp.
  import Icon from './Icon.svelte';
  import type { TileGroup } from './types';
  let { groups, wrap = false, quickmarks = false }: { groups: TileGroup[]; wrap?: boolean; quickmarks?: boolean } = $props();
</script>

<div class="tile-page" data-testid="tile-groups">
  {#if quickmarks}<h3 class="group-title">Quickmarks</h3>{/if}
  {#each groups as g, gi (gi)}
    <section class="group" data-group={g.title}>
      <h3 class="group-title">{g.title}</h3>
      <div class="strip" class:wrap>
        {#each g.tiles as t, ti (ti)}
          <div class="cell">
            {#if t.href}
              <a class="tile" class:missing={t.missing} href={t.href} target={t.external ? '_blank' : undefined} rel={t.external ? 'noopener' : undefined} data-tile={t.id}>
                <Icon name={t.missing ? 'ic_app_not_installed' : t.icon} size={32} />
                <span class="tile__label">{t.label}</span>
              </a>
            {:else}
              <span class="tile inert" data-tile={t.id} title="Opens on the phone">
                <Icon name={t.icon} size={32} />
                <span class="tile__label">{t.label}</span>
              </span>
            {/if}
            {#if t.separatorAfter}<i class="tile-sep" aria-hidden="true"></i>{/if}
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .tile-page { padding: 12px; }
  .group-title { margin: 0; padding: 12px 0 4px 4px; font: 500 var(--type-title-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .strip { display: flex; overflow-x: auto; scrollbar-width: none; }
  .strip.wrap { flex-wrap: wrap; overflow: visible; }
  .cell { position: relative; flex: none; width: 60px; }
  .tile { display: flex; flex-direction: column; align-items: center; padding: 6px; color: var(--role-text-primary); text-decoration: none; -webkit-tap-highlight-color: transparent; }
  .tile.missing { color: var(--role-text-secondary); }
  .tile__label { padding-top: 4px; font: 400 12px / normal var(--type-family-sans); text-align: center; color: color-mix(in srgb, var(--role-text-primary) 80%, transparent);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; max-width: 48px; }
  .tile-sep { position: absolute; right: 0; top: 22px; width: 0.5px; height: 32px; margin-top: -16px; background: var(--role-hairline); }
</style>
