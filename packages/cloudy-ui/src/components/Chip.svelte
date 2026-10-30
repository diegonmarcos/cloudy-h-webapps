<script lang="ts">
  // KitChip: label (caption) on surface_selected, corner 12dp, 8dp start / 4dp end; an × when removable.
  let { label, onremove = null }: { label: string; onremove?: (() => void) | null } = $props();
</script>
<span class="chip"><span>{label}</span>{#if onremove}<button onclick={onremove} aria-label="Remove {label}">×</button>{/if}</span>
<style>
  .chip { display: inline-flex; align-items: center; border-radius: var(--density-corner); background: var(--role-surface-selected); padding: 0 calc(var(--density-small) / 2) 0 var(--density-small); min-height: 18px; }
  span span { font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-primary); }
  button { background: none; border: 0; color: var(--role-text-secondary); font-size: var(--density-title); padding: calc(var(--density-small) / 4) calc(var(--density-small) / 2); cursor: pointer; }
</style>
