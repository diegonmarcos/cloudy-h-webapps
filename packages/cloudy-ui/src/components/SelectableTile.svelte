<script lang="ts">
  // KitSelectableTile: "● label" / "○ label" + subtitle, surface_selected when selected, 8x6dp padding.
  let { label, subtitle = '', selected = false, onclick }: { label: string; subtitle?: string; selected?: boolean; onclick?: () => void } = $props();
</script>
<button class="sel" class:on={selected} role="radio" aria-checked={selected} {onclick}><span class="l">{selected ? '● ' : '○ '}{label}</span>{#if subtitle}<span class="s">{subtitle}</span>{/if}</button>
<style>
  .sel { display: flex; flex-direction: column; width: 100%; text-align: left; border: 0; background: var(--role-surface); padding: var(--density-row-pad-v) var(--density-row-pad-h); cursor: pointer; }
  .sel.on { background: var(--role-surface-selected); }
  .l { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .s { padding-top: 2px; font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); }
</style>
