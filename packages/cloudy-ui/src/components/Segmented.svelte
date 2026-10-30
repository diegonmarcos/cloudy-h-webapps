<script lang="ts">
  // KitSegmented: joined segments in a 12dp-corner hairline frame; selected = surface_selected + semibold text_primary.
  let { options, selected = $bindable(null) }: { options: [string, string][]; selected?: string | null } = $props();
</script>
<div class="seg" role="radiogroup">
  {#each options as [id, label]}<button role="radio" aria-checked={id === selected} class:on={id === selected} onclick={() => (selected = id)}>{label}</button>{/each}
</div>
<style>
  .seg { display: flex; border-radius: var(--density-corner); border: var(--density-rule) solid var(--role-hairline); overflow: hidden; }
  button { flex: 1; border: 0; background: var(--role-surface); color: var(--role-text-secondary); padding: var(--density-row-pad-v) 0; font: 400 var(--density-title) / normal var(--type-family-sans); cursor: pointer; }
  button.on { background: var(--role-surface-selected); color: var(--role-text-primary); font-weight: 600; }
</style>
