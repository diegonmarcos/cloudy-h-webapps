<script lang="ts">
  // KitHero: 56dp avatar (accent, initials in tile_ink, head size semibold), name on the display scale, lines in text_secondary.
  let { name, lines = [], initials }: { name: string; lines?: string[]; initials: string } = $props();
</script>
<div class="hero">
  <span class="av">{initials.slice(0, 2).toUpperCase()}</span>
  <div class="txt"><div class="n">{name}</div>{#each lines.filter(Boolean) as l}<div class="l">{l}</div>{/each}</div>
</div>
<style>
  .hero { display: flex; align-items: center; padding: var(--density-large) 0; }
  .av { width: var(--density-avatar); height: var(--density-avatar); border-radius: 50%; background: var(--role-accent); color: var(--role-tile-ink); display: grid; place-items: center; flex: none;
    font: 600 var(--density-head) / 1 var(--type-family-sans); }
  .txt { flex: 1; min-width: 0; padding-left: var(--density-large); }
  .n { font: 600 var(--density-display) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .l { font: 400 var(--density-body) / normal var(--type-family-sans); color: var(--role-text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
