<script lang="ts">
  // NavSideMenu / SideMenuLayout (nav_mode vertical_side_menu): the section's pages in a radius-14 tabStrip box (6dp from the
  // edges), a "›"/"‹" toggle row (20sp bold, inkDim) at the top. Rail = 60dp, each page its 20dp glyph and the first 3 letters
  // (railLabel), a heading a 1dp line; expanded = 232dp, icon + label rows of 44dp, children indented 14dp, headings 10sp
  // semibold CAPS. Never chosen: a wide pane (>= 600) docks the expanded menu, a narrow one the rail; expanding on a narrow
  // pane overlays the menu over a 35% black scrim.
  import Icon from '../shell/Icon.svelte';
  import { railLabel } from './fleetNav';
  type I = { id: string; label: string; icon: string; depth: number; heading: boolean; href: string | null };
  let { items, selected, narrow }: { items: I[]; selected: string | null; narrow: boolean } = $props();
  let pref = $state<boolean | null>(null);
  const expanded = $derived(pref ?? !narrow);
  const overlay = $derived(expanded && narrow);
</script>

{#snippet menu(rail: boolean, cls: string)}
  <aside class="side {cls}" class:rail data-testid={cls === 'overlay' ? 'fleet-side-overlay' : 'fleet-side-menu'}>
    <button class="toggle" aria-label={rail ? 'Expand the menu' : 'Collapse the menu'} onclick={() => (pref = !expanded)}>{rail ? '›' : '‹'}</button>
    {#each items as it (it.id)}
      {#if it.heading}{#if rail}<i class="line"></i>{:else}<div class="head">{it.label.toUpperCase()}</div>{/if}
      {:else}
        <svelte:element this={it.href ? 'a' : 'span'} class="item" class:on={it.id === selected} href={it.href} style:--indent="{it.depth * 14}px" title={it.label}>
          <Icon set="fleet" name={it.icon} size={20} />{#if rail}<span class="short">{railLabel(it.label)}</span>{:else}<span class="full">{it.label}</span>{/if}
        </svelte:element>
      {/if}
    {/each}
  </aside>
{/snippet}

{@render menu(!expanded || narrow, 'dock')}
{#if overlay}
  <div class="scrim" onclick={() => (pref = false)} aria-hidden="true"></div>
  {@render menu(false, 'overlay')}
{/if}

<style>
  .side { flex: none; align-self: stretch; margin: 6px 0 6px 6px; border-radius: var(--fleet-side-radius); background: var(--f-tab-strip); border: 1px solid var(--f-island-border);
    overflow-y: auto; width: var(--fleet-side-expanded-width); display: flex; flex-direction: column; }
  .side.rail { width: var(--fleet-side-rail-width); }
  .side.overlay { position: absolute; z-index: 26; top: 0; bottom: 0; left: 0; background: var(--f-top); }
  .scrim { position: absolute; inset: 0; z-index: 25; background: #00000059; }
  .toggle { height: var(--fleet-side-item-height); background: none; border: 0; color: var(--f-ink-dim); font: 700 20px var(--type-family-sans); text-align: right; padding: 0 14px; cursor: pointer; flex: none; }
  .rail .toggle { text-align: center; }
  .item { display: flex; align-items: center; gap: 12px; min-height: var(--fleet-side-item-height); padding: 0 12px 0 calc(12px + var(--indent)); color: var(--f-ink-dim); text-decoration: none; border-radius: var(--fleet-top2-tab-radius); margin: 0 4px; }
  .rail .item { flex-direction: column; gap: 2px; justify-content: center; min-height: var(--fleet-side-rail-item-height); padding: 0; }
  .item.on { background: var(--f-tab-selected); color: var(--f-on-tab-selected); }
  .full { font: 500 13px var(--type-family-sans); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .short { font: 500 9px var(--type-family-sans); }
  .head { padding: 10px 0 4px 14px; font: 600 10px var(--type-family-sans); color: var(--f-ink-dim); }
  .line { display: block; height: 1px; margin: 0 10px; background: var(--f-island-border); }
  :global(html.embed) .side, :global(html.embed) .scrim { display: none; }
</style>
