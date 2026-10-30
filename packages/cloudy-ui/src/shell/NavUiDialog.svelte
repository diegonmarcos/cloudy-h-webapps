<script lang="ts">
  // "Configs > UI": the card in a dialog (the entry of the first row's dropdown and of the Clean drawer).
  import NavUiCard from './NavUiCard.svelte';
  import { CONFIGS_UI_LABEL, type NavUiSettings } from './navUi';
  let { open = $bindable(false), settings, declared, onChange }: { open?: boolean; settings: NavUiSettings; declared: NavUiSettings; onChange: (s: NavUiSettings) => void } = $props();
</script>

<svelte:window onkeydown={(e) => { if (open && e.key === 'Escape') open = false; }} />

{#if open}
  <div class="scrim" onclick={() => (open = false)} aria-hidden="true"></div>
  <div class="dlg" role="dialog" aria-modal="true" aria-label={CONFIGS_UI_LABEL} data-testid="navui-dialog">
    <div class="h">{CONFIGS_UI_LABEL}</div>
    <NavUiCard {settings} {declared} {onChange} />
    <button class="close" onclick={() => (open = false)}>Close</button>
  </div>
{/if}

<style>
  .scrim { position: fixed; inset: 0; z-index: 60; background: #00000099; }
  .dlg { position: fixed; z-index: 61; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(92vw, 360px); box-sizing: border-box; padding: 16px;
    display: flex; flex-direction: column; gap: 12px; border-radius: 16px; background: var(--role-window-solid, #1c1b1f); color: var(--role-text-primary); }
  .h { font: 600 var(--type-title-medium-size) / normal var(--type-family-sans); }
  .close { align-self: flex-end; background: none; border: 0; color: var(--role-accent); font: 500 var(--type-label-large-size) var(--type-family-sans); cursor: pointer; padding: 8px 12px; }
</style>
