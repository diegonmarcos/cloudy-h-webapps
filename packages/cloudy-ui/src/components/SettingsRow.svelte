<script lang="ts">
  // KitSettingsRow: title (bodySmall, text_primary) + optional subtitle (bodySmall, text_secondary), trailing slot; 6dp vertical.
  import type { Snippet } from 'svelte';
  let { title, subtitle = '', href = null, onclick, trailing }: { title: string; subtitle?: string; href?: string | null; onclick?: () => void; trailing?: Snippet } = $props();
</script>
<svelte:element this={href ? 'a' : onclick ? 'button' : 'div'} class="srow" {href} {onclick}>
  <span class="txt"><span class="t">{title}</span>{#if subtitle}<span class="s">{subtitle}</span>{/if}</span>
  {#if trailing}{@render trailing()}{/if}
</svelte:element>
<style>
  .srow { display: flex; align-items: center; width: 100%; padding: var(--density-row-pad-v) 0; background: none; border: 0; color: inherit; text-align: left; text-decoration: none; font: inherit; cursor: default; }
  a.srow, button.srow { cursor: pointer; }
  .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .t { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .s { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); }
</style>
