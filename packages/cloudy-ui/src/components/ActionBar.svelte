<script lang="ts">
  // KitActionBar: the first action filled (primary), the rest outlined; wraps; 8dp gaps.
  import Button from './Button.svelte';
  let { actions, filledFirst = true }: { actions: { label: string; href?: string; onclick?: () => void; disabled?: boolean }[]; filledFirst?: boolean } = $props();
</script>
<div class="bar">
  {#each actions as a, i}<Button variant={i === 0 && filledFirst ? 'filled' : 'outlined'} href={a.href ?? null} onclick={a.onclick} disabled={a.disabled}>{a.label}</Button>{/each}
</div>
<style>
  .bar { display: flex; flex-wrap: wrap; gap: var(--density-small); }
</style>
