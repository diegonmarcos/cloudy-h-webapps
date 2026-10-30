<script lang="ts">
  // KitCard: full width, 12dp corners, palette surface, 14dp padding, 8dp between children.
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>
<div class="kit-card">{@render children()}</div>
<style>
  .kit-card { border-radius: var(--shape-card-radius); background: var(--role-surface); padding: var(--shape-card-padding); display: flex; flex-direction: column; gap: 8px; }
</style>
