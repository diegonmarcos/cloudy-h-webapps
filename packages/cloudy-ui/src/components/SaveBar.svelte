<script lang="ts">
  // KitSaveBar: "<summary> · Discard · Save" on surface_selected, 16x8dp.
  import Button from './Button.svelte';
  let { summary, saving = false, onsave, ondiscard }: { summary: string; saving?: boolean; onsave?: () => void; ondiscard?: () => void } = $props();
</script>
<div class="save"><span class="s">{summary}</span><button class="dis" disabled={saving} onclick={ondiscard}>Discard</button><Button onclick={onsave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button></div>
<style>
  .save { display: flex; align-items: center; background: var(--role-surface-selected); padding: var(--density-small) var(--density-large); }
  .s { flex: 1; font: 400 var(--density-body) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .dis { background: none; border: 0; color: var(--role-text-secondary); font: 400 var(--density-title) / normal var(--type-family-sans); padding: 4px 10px; min-height: 30px; cursor: pointer; }
</style>
