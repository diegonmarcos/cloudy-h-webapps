<script lang="ts">
  // The window: the theme's `window` role (cloud: bg_gradient_black_purple, a 270deg purple-black-purple gradient) and, for
  // the cloud theme, the galaxy backdrop ComposeView behind everything (ShellFx GalaxyBackdrop).
  import { fxCanvas, drawGalaxy, GALAXY_PERIOD_MS } from './fx';
  let { stars = true }: { stars?: boolean } = $props();
</script>

<div class="window" aria-hidden="true">
  {#if stars}<canvas class="galaxy" use:fxCanvas={{ draw: drawGalaxy, periodMs: GALAXY_PERIOD_MS }}></canvas>{/if}
</div>

<style>
  .window { position: fixed; inset: 0; z-index: 0; background: var(--role-window); }
  .galaxy { position: absolute; inset: 0; width: 100%; height: 100%; }
  :global(html[data-theme='cloud_minimalist_black']) .galaxy { display: none; }
</style>
