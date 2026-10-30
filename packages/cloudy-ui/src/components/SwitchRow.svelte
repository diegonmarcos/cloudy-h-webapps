<script lang="ts">
  // KitSwitchRow: a settings row that IS a switch (the whole row toggles).
  import Switch from './Switch.svelte';
  let { title, subtitle = '', checked = $bindable(false) }: { title: string; subtitle?: string; checked?: boolean } = $props();
</script>
<label class="swrow"><span class="txt"><span class="t">{title}</span>{#if subtitle}<span class="s">{subtitle}</span>{/if}</span><Switch bind:checked label={title} /></label>
<style>
  .swrow { display: flex; align-items: center; padding: var(--density-row-pad-v) 0; cursor: pointer; }
  .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .t { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .s { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); }
</style>
