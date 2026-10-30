<script lang="ts">
  // KitSectionHeader: titleSmall + bodySmall subtitle; eyebrow = caption CAPS, 0.08em tracking, text_secondary (GroupTitle).
  let { title, subtitle = '', eyebrow = false }: { title: string; subtitle?: string; eyebrow?: boolean } = $props();
</script>
{#if eyebrow}
  <div class="eyebrow">{title.toUpperCase()}</div>
{:else}
  <div class="hdr"><div class="t">{title}</div>{#if subtitle}<div class="s">{subtitle}</div>{/if}</div>
{/if}
<style>
  .eyebrow { padding: var(--density-medium) 0 var(--density-small); font: 400 var(--density-caption) / normal var(--type-family-sans); letter-spacing: var(--density-eyebrow-tracking); color: var(--role-text-secondary); }
  .t { font: 500 var(--type-title-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); padding-bottom: 8px; }
  .s { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); padding-bottom: 16px; }
</style>
