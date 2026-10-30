<script lang="ts">
  // KitButton / KitTonalButton / KitOutlinedButton / KitTextButton: Material3 shapes (fully rounded) at the kit's dense size:
  // min height 30dp, min width 36dp, 10x4dp padding, labelMedium. Colours from CloudKitTheme's scheme: primary = accent,
  // onPrimary = tile_ink, outline = hairline; tonal = Material3 dark secondaryContainer.
  import type { Snippet } from 'svelte';
  let { variant = 'filled', href = null, disabled = false, onclick, children }: {
    variant?: 'filled' | 'tonal' | 'outlined' | 'text'; href?: string | null; disabled?: boolean; onclick?: (e: MouseEvent) => void; children: Snippet;
  } = $props();
</script>
<svelte:element this={href ? 'a' : 'button'} class="kit-btn {variant}" {href} {onclick} disabled={href ? undefined : disabled} aria-disabled={disabled}>
  {@render children()}
</svelte:element>
<style>
  .kit-btn { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; min-height: var(--density-button-height); min-width: 36px;
    padding: var(--density-button-pad-v) var(--density-button-pad-h); border-radius: 999px; border: 1px solid transparent; cursor: pointer; text-decoration: none;
    font: 500 var(--type-label-medium-size) / normal var(--type-family-sans); }
  .filled { background: var(--role-accent); color: var(--role-tile-ink); }
  .tonal { background: #4a4458; color: #e8def8; }
  .outlined { background: transparent; color: var(--role-accent); border-color: var(--role-hairline); }
  .text { background: transparent; color: var(--role-accent); }
  .kit-btn[aria-disabled='true'] { opacity: 0.38; pointer-events: none; }
</style>
