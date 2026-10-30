<script lang="ts">
  // AggregatorStackFragment's collapsible card (stack_<page> entries: kind, title, subtitle): a KitCard with a chevron header;
  // the body is live device or fleet state on Android, so the web draws the declared rows/caption or says where it lives.
  import type { Snippet } from 'svelte';
  import Icon from '../shell/Icon.svelte';
  let { title, subtitle = '', open = $bindable(true), href = null, planned = false, mesh = false, external = false, children }: { title: string; subtitle?: string; open?: boolean; href?: string | null; planned?: boolean; mesh?: boolean; external?: boolean; children?: Snippet } = $props();
</script>
<section class="stack-card" class:planned data-testid="stack-card" data-planned={planned || undefined}>
  <button class="head" aria-expanded={open} onclick={() => (open = !open)}>
    <span class="txt"><span class="t">{title}</span>{#if subtitle}<span class="s">{subtitle}</span>{/if}</span>
    <span class="chev" class:open aria-hidden="true">⌄</span>
  </button>
  {#if open}<div class="body">{#if children}{@render children()}{/if}{#if href}<a class="open" href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener' : undefined} data-external={external || undefined}>Open{#if mesh}<span class="mesh" title="Private: needs the WireGuard mesh" data-testid="mesh-badge"><Icon name="ic_lock" size={12} /></span>{/if}</a>{/if}</div>{/if}
</section>
<style>
  .stack-card { border-radius: var(--shape-card-radius); background: var(--role-surface); margin: 0 12px 10px; }
  .stack-card.planned { opacity: 0.45; }
  .head { display: flex; align-items: center; width: 100%; background: none; border: 0; padding: var(--shape-card-padding); color: inherit; text-align: left; cursor: pointer; }
  .txt { flex: 1; display: flex; flex-direction: column; }
  .t { font: 500 var(--type-title-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .s { font: 400 var(--type-body-small-size) / normal var(--type-family-sans); color: var(--role-text-secondary); padding-top: 2px; }
  .chev { color: var(--role-text-secondary); transition: transform 180ms; transform: rotate(-90deg); }
  .chev.open { transform: none; }
  .body { padding: 0 var(--shape-card-padding) var(--shape-card-padding); display: flex; flex-direction: column; gap: 8px; }
  .mesh { margin-left: 4px; display: inline-flex; vertical-align: middle; }
  .open { align-self: flex-start; color: var(--role-accent); font: 500 var(--type-label-medium-size) / normal var(--type-family-sans); text-decoration: none; }
</style>
