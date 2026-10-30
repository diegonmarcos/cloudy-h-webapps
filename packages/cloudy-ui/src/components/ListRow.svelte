<script lang="ts">
  // KitListRow: optional leading glyph box (28dp, surface_selected, corner 8dp), label (title size), secondary (caption, 2 lines),
  // optional state pill, trailing slot; 8dp vertical padding.
  import type { Snippet } from 'svelte';
  import type { KitState } from '../shell/types';
  import StatePill from './StatePill.svelte';
  let { label, secondary = '', leading = null, pill = null, href = null, trailing }: {
    label: string; secondary?: string; leading?: string | null; pill?: [string, KitState] | null; href?: string | null; trailing?: Snippet;
  } = $props();
</script>
<svelte:element this={href ? 'a' : 'div'} class="row" {href} data-testid="list-row">
  {#if leading !== null}<span class="lead">{leading}</span>{/if}
  <span class="txt" class:pad={leading !== null}><span class="l">{label}</span>{#if secondary}<span class="s">{secondary}</span>{/if}</span>
  {#if pill}<span class="end"><StatePill word={pill[0]} state={pill[1]} /></span>{/if}
  {#if trailing}<span class="end">{@render trailing()}</span>{/if}
</svelte:element>
<style>
  .row { display: flex; align-items: center; padding: var(--density-small) 0; color: inherit; text-decoration: none; }
  .lead { width: var(--density-glyph); height: var(--density-glyph); flex: none; border-radius: var(--density-small); background: var(--role-surface-selected); display: grid; place-items: center;
    font: 400 var(--density-body) / 1 var(--type-family-sans); color: var(--role-text-primary); }
  .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .txt.pad { padding-left: var(--density-medium); }
  .l { font: 400 var(--density-title) / normal var(--type-family-sans); color: var(--role-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .s { font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .end { padding-left: var(--density-small); flex: none; }
</style>
