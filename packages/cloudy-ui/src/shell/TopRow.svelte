<script lang="ts">
  // toolbar_island (activity_main.xml): 12dp side margins, 64dp tall (?attr/actionBarSize), seated 6dp under the status strip.
  // At the Home root the row draws the two liquid-glass corner orbs (44dp, bg_liquid_glass_pill: #1A0033 fill, 1dp #55B794F4
  // stroke) — menu (ic_hamburger_asymmetric) and the top_orbs.right target (ic_wallet); elsewhere ShellToolbarRow:
  // hamburger | Back, 56dp touch boxes, 24dp glyphs in text_primary. The Dynamic Island (120x22) sits in the centre.
  import Icon from './Icon.svelte';
  import { fxCanvas, drawIslandWave, drawPrism, drawWaveLine, WAVE_PERIOD_MS, PRISM_PERIOD_MS, WAVELINE_PERIOD_MS } from './fx';
  let { atHome, backHref = null, historyBack = false, orbHref = null, islandHref = null, onMenu, hidden = false }: {
    atHome: boolean; historyBack?: boolean; backHref?: string | null; orbHref?: string | null; islandHref?: string | null; onMenu: () => void;
    /** scroll-hide has taken the row away. */
    hidden?: boolean;
  } = $props();
  // About pages (#1326): the arrow is history-back when the visitor came from inside this site, else the plain link (the grid).
  const goBack = (e: MouseEvent) => {
    // client-side navigations do not update document.referrer, so ask the Navigation API for the previous entry when there is one
    const nav = (window as unknown as { navigation?: { canGoBack: boolean; currentEntry: { index: number }; entries: () => { url: string }[] } }).navigation;
    const inSite = nav ? nav.canGoBack && (nav.entries()[nav.currentEntry.index - 1]?.url ?? '').startsWith(location.origin) : document.referrer.startsWith(location.origin);
    if (historyBack && history.length > 1 && inSite) { e.preventDefault(); history.back(); }
  };
</script>

<div class="app-top-bar top-row" class:away={hidden} data-testid="top-row">
  {#if atHome}
    <button class="orb left" aria-label="Open the main menu" onclick={onMenu}><Icon name="ic_hamburger_asymmetric" /></button>
    {#if orbHref}<a class="orb right" href={orbHref} aria-label="Configs"><Icon name="ic_wallet" /></a>{/if}
  {:else}
    <button class="tool left" aria-label="Open the main menu" data-testid="toolbar-menu" onclick={onMenu}><Icon name="ic_hamburger_asymmetric" /></button>
    {#if backHref !== null}<a class="tool right" href={backHref} aria-label="Back" data-testid="toolbar-back" onclick={goBack}><Icon name="ic_back" /></a>{/if}
  {/if}
  <div class="music"><canvas use:fxCanvas={{ draw: drawWaveLine, periodMs: WAVELINE_PERIOD_MS }}></canvas></div>
  {#if islandHref}
    <a class="island" href={islandHref} aria-label="Dynamic Island" data-testid="dynamic-island">
      <canvas use:fxCanvas={{ draw: drawIslandWave, periodMs: WAVE_PERIOD_MS }}></canvas>
      <canvas use:fxCanvas={{ draw: drawPrism, periodMs: PRISM_PERIOD_MS }}></canvas>
    </a>
  {/if}
</div>

<style>
  .top-row { position: absolute; left: 12px; right: 12px; top: var(--top-row-top, 26px); height: var(--shell-action-bar-size); z-index: 19; color: var(--role-text-primary); }
  .orb { position: absolute; top: 50%; width: 44px; height: 44px; margin-top: -22px; border-radius: 999px; box-sizing: border-box;
    /* NavTokens.topRowFill: the first row has NO fill and NO outline in any mode (no grey orbs), the page shows through */
    background: var(--nav-top-row-fill); border: 0;
    display: grid; place-items: center; color: inherit; padding: 0; cursor: pointer; }
  .top-row { transition: transform 220ms, opacity 220ms; }
  .top-row.away { transform: translateY(-100%); opacity: 0; pointer-events: none; }
  @media (prefers-reduced-motion: reduce) { .top-row { transition: none; } }
  .orb.left { left: 4px; } .orb.right { right: 4px; }
  .tool { position: absolute; top: 50%; width: 56px; height: 56px; margin-top: -28px; display: grid; place-items: center; background: none; border: 0; color: inherit; padding: 0; cursor: pointer; }
  .tool.left { left: 0; } .tool.right { right: 0; }
  .island { position: absolute; left: 50%; top: 50%; width: 120px; height: 22px; margin: -11px 0 0 -60px; border-radius: 999px;
    background: var(--shape-dynamic-island-fill); outline: var(--shape-dynamic-island-stroke-width) solid var(--shape-dynamic-island-stroke); outline-offset: -1px; overflow: hidden; }
  .island canvas, .music canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .music { position: absolute; left: 50%; top: 0; width: 90px; height: 16px; margin-left: -45px; pointer-events: none; }
  :global(html[data-theme='cloud_minimalist_black']) .top-row .music, :global(html[data-theme='cloud_minimalist_black']) .top-row .island { display: none; }
</style>
