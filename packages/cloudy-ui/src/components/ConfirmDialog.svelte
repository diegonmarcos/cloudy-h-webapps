<script lang="ts">
  // KitConfirmDialog: a Material3 AlertDialog (28dp corners, surfaceContainerHigh) with two text buttons; dismissing never confirms.
  let { open = $bindable(false), title, text, confirmLabel, dismissLabel, onconfirm }: {
    open?: boolean; title: string; text: string; confirmLabel: string; dismissLabel: string; onconfirm?: () => void;
  } = $props();
</script>
{#if open}
  <div class="scrim" onclick={() => (open = false)} aria-hidden="true"></div>
  <div class="dlg" role="alertdialog" aria-modal="true" aria-label={title}>
    <h2>{title}</h2><p>{text}</p>
    <div class="btns"><button onclick={() => (open = false)}>{dismissLabel}</button><button onclick={() => { open = false; onconfirm?.(); }}>{confirmLabel}</button></div>
  </div>
{/if}
<style>
  .scrim { position: fixed; inset: 0; background: #00000052; z-index: 60; }
  .dlg { position: fixed; z-index: 61; left: 50%; top: 50%; transform: translate(-50%, -50%); width: min(312px, calc(100% - 48px)); background: #2b2930; border-radius: 28px; padding: 24px; box-sizing: border-box; color: var(--role-text-primary); }
  h2 { margin: 0 0 16px; font: 400 var(--type-headline-small-size) / normal var(--type-family-sans); }
  p { margin: 0 0 24px; font: 400 var(--type-body-medium-size) / normal var(--type-family-sans); color: var(--role-text-secondary); }
  .btns { display: flex; justify-content: flex-end; gap: 8px; }
  button { background: none; border: 0; color: var(--role-accent); font: 500 var(--type-label-medium-size) / normal var(--type-family-sans); padding: 4px 10px; min-height: 30px; cursor: pointer; }
</style>
