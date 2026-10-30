<script lang="ts">
  // KitFingerprint: a secret as a chip, never the value: ◆ + the first 12 characters of the fingerprint, or "hidden · <length>".
  let { fingerprint = null, length = null }: { fingerprint?: string | null; length?: number | null } = $props();
  const word = $derived(fingerprint ? fingerprint.slice(0, 12) : length != null ? `hidden · ${length}` : 'hidden');
</script>
<span class="fp"><b>◆</b><span>{word}</span></span>
<style>
  .fp { display: inline-flex; align-items: center; border-radius: var(--density-corner); background: var(--role-surface-selected); padding: calc(var(--density-small) / 4) var(--density-small); }
  b { font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-accent); }
  span span { padding-left: calc(var(--density-small) / 2); font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-secondary); white-space: nowrap; }
</style>
