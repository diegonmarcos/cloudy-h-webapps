<script lang="ts">
  // KitEmptyState: optional title (titleSmall) over a caption (bodySmall, text_secondary), centred in the pane, 24dp padding.
  let { title = null, caption }: { title?: string | null; caption: string } = $props();
</script>
<div class="kit-empty" data-testid="empty-state">
  {#if title}<div class="t">{title}</div>{/if}
  <div class="c" class:gap={!!title}>{caption}</div>
</div>
<style>
  .kit-empty { min-height: 100%; box-sizing: border-box; padding: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .t { font: 500 var(--type-title-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .c { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); }
  .c.gap { padding-top: 8px; }
</style>
