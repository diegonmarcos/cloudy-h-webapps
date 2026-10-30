<script lang="ts">
  // The Clean mode's LEFT drawer (libs:ui-nav-bars CleanDrawerContent): row 1 the page name as a dropdown (a URL bar), row 2 the
  // AI / Profile / Settings icons, row 3 a dropdown of the child pages; then the Configs > UI entry. Rows come from the declaration
  // (cleanDrawerModel), never from a literal here.
  import Icon from '../shell/Icon.svelte';
  import { CONFIGS_UI_LABEL } from '../shell/navUi';
  import { cleanDrawerModel } from '../shell/navUiDrawer';
  type Page = { id: string; label: string; href: string | null };
  let { open = $bindable(false), bottom, section, childPages, selectedChild, aiHref = null, profileHref = null, configsHref = null, onConfigsUi }: {
    open?: boolean; bottom: Page[]; section: string | null; childPages: Page[]; selectedChild: string | null;
    aiHref?: string | null; profileHref?: string | null; configsHref?: string | null; onConfigsUi: () => void;
  } = $props();
  const model = $derived(cleanDrawerModel(bottom, section, childPages, selectedChild));
  const go = (e: Event) => { const v = (e.currentTarget as HTMLSelectElement).value; if (v) { open = false; location.assign(v); } };
  const hrefOf = { ai: () => aiHref, profile: () => profileHref, settings: () => configsHref };
  const glyph = { ai: 'filled:auto_awesome', profile: 'filled:account_circle', settings: 'filled:settings' };
  const label = { ai: 'AI', profile: 'Profile', settings: 'Settings' };
</script>

<svelte:window onkeydown={(e) => { if (open && e.key === 'Escape') open = false; }} />

<div class="scrim" class:open onclick={() => (open = false)} aria-hidden="true"></div>
<aside class="drawer" class:open aria-label="Menu" aria-hidden={!open} inert={!open} data-testid="clean-drawer">
  {#each model.rows as row (row)}
    {#if row === 'page_dropdown'}
      <label class="urlbar" data-testid="clean-page-dropdown"><span class="sr">Page</span>
        <select onchange={go} aria-label="Page">
          {#each model.pages as p (p.id)}<option value={p.href ?? ''} selected={p.selected}>{p.label}</option>{/each}
        </select></label>
    {:else if row === 'actions'}
      <div class="icons" data-testid="clean-actions">
        {#each model.actions as a (a)}
          {@const h = hrefOf[a]()}
          <svelte:element this={h ? 'a' : 'span'} class="ic" href={h} aria-label={label[a]} data-testid="clean-action-{a}"><Icon set="fleet" name={glyph[a]} size={24} /></svelte:element>
        {/each}
      </div>
    {:else}
      <label class="urlbar" data-testid="clean-sub-dropdown"><span class="sr">Child pages</span>
        <select onchange={go} aria-label="Child pages">
          {#each model.subPages as p (p.id)}<option value={p.href ?? ''} selected={p.selected}>{p.label}</option>{/each}
        </select></label>
    {/if}
  {/each}
  <button class="cfg" onclick={() => { open = false; onConfigsUi(); }} data-testid="clean-configs-ui">{CONFIGS_UI_LABEL}</button>
</aside>

<style>
  .scrim { position: fixed; inset: 0; z-index: 40; background: #00000099; opacity: 0; pointer-events: none; transition: opacity 220ms; }
  .scrim.open { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; bottom: 0; left: 0; z-index: 41; width: min(82vw, var(--nav-clean-drawer-width)); box-sizing: border-box; padding: 12px 8px;
    display: flex; flex-direction: column; gap: 4px; background: var(--f-island, #1c1b1f); color: var(--f-on-island, #fff); transform: translateX(-100%); transition: transform 220ms ease; }
  .drawer.open { transform: none; }
  .urlbar { display: block; margin: 4px 8px; }
  select { width: 100%; box-sizing: border-box; min-height: var(--nav-clean-drawer-row-height); padding: 0 14px; border-radius: 12px; background: transparent; color: inherit;
    border: 1px solid color-mix(in srgb, currentColor 35%, transparent); font: 600 14px var(--type-family-sans); }
  .icons { display: flex; gap: 8px; padding: 4px 8px; }
  .ic { width: var(--nav-clean-drawer-row-height); height: var(--nav-clean-drawer-row-height); display: grid; place-items: center; border-radius: 12px; color: inherit; }
  .cfg { margin: 4px 8px; min-height: var(--nav-clean-drawer-row-height); text-align: left; padding: 0 14px; background: none; border: 0; color: inherit; font: 400 14px var(--type-family-sans); cursor: pointer; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
  @media (prefers-reduced-motion: reduce) { .drawer, .scrim { transition: none; } }
  :global(html.embed) .drawer, :global(html.embed) .scrim { display: none; }
</style>
