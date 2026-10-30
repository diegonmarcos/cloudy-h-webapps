<script lang="ts">
  // toolbar_island (activity_main.xml): 12dp side margins, 64dp tall (?attr/actionBarSize), seated 6dp under the status strip.
  // At the Home root the row draws the two liquid-glass corner orbs (44dp, bg_liquid_glass_pill: #1A0033 fill, 1dp #55B794F4
  // stroke) — menu (ic_hamburger_asymmetric) and the top_orbs.right target (ic_wallet); elsewhere ShellToolbarRow:
  // hamburger | Back, 56dp touch boxes, 24dp glyphs in text_primary. The Dynamic Island (120x22) sits in the centre.
  import Icon from './Icon.svelte';
  import { fxCanvas, drawIslandWave, drawPrism, drawWaveLine, WAVE_PERIOD_MS, PRISM_PERIOD_MS, WAVELINE_PERIOD_MS } from './fx';
  let { atHome, backHref = null, orbHref = null, islandHref = null, onMenu }: {
    atHome: boolean; backHref?: string | null; orbHref?: string | null; islandHref?: string | null; onMenu: () => void;
  } = $props();
</script>

<div class="app-top-bar top-row" data-testid="top-row">
  {#if atHome}
    <button class="orb left" aria-label="Open the main menu" onclick={onMenu}><Icon name="ic_hamburger_asymmetric" /></button>
    {#if orbHref}<a class="orb right" href={orbHref} aria-label="Configs"><Icon name="ic_wallet" /></a>{/if}
  {:else}
    <button class="tool left" aria-label="Open the main menu" data-testid="toolbar-menu" onclick={onMenu}><Icon name="ic_hamburger_asymmetric" /></button>
    {#if backHref !== null}<a class="tool right" href={backHref} aria-label="Back" data-testid="toolbar-back"><Icon name="ic_back" /></a>{/if}
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
    background: var(--shape-liquid-glass-pill-fill); border: var(--shape-liquid-glass-pill-stroke-width) solid var(--shape-liquid-glass-pill-stroke);
    display: grid; place-items: center; color: inherit; padding: 0; cursor: pointer; }
  .orb.left { left: 4px; } .orb.right { right: 4px; }
  .tool { position: absolute; top: 50%; width: 56px; height: 56px; margin-top: -28px; display: grid; place-items: center; background: none; border: 0; color: inherit; padding: 0; cursor: pointer; }
  .tool.left { left: 0; } .tool.right { right: 0; }
  .island { position: absolute; left: 50%; top: 50%; width: 120px; height: 22px; margin: -11px 0 0 -60px; border-radius: 999px;
    background: var(--shape-dynamic-island-fill); outline: var(--shape-dynamic-island-stroke-width) solid var(--shape-dynamic-island-stroke); outline-offset: -1px; overflow: hidden; }
  .island canvas, .music canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
  .music { position: absolute; left: 50%; top: 0; width: 90px; height: 16px; margin-left: -45px; pointer-events: none; }
  :global(html[data-theme='cloud_minimalist_black']) .top-row .music, :global(html[data-theme='cloud_minimalist_black']) .top-row .island { display: none; }
</style>
