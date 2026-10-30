<script lang="ts">
  // KitDeviceCard: glyph box (28dp, surface_selected, corner 8dp, accent glyph), id (head, semibold) + badge (caption, accent),
  // model (body, text_secondary), optional state pill, a state line, an action bar; surface, corner 12dp, 16dp padding, 8dp gaps.
  import type { KitState } from '../shell/types';
  import StatePill from './StatePill.svelte';
  import ActionBar from './ActionBar.svelte';
  let { id, model = '', state = '', glyph = '▣', badge = '', pill = null, actions = [], menu = false }: {
    id: string; model?: string; state?: string; glyph?: string; badge?: string; pill?: [string, KitState] | null; actions?: { label: string; href?: string }[]; menu?: boolean;
  } = $props();
</script>
<div class="dev">
  <div class="head">
    <span class="g">{glyph}</span>
    <div class="txt"><div class="idl"><span class="id">{id}</span>{#if badge}<span class="badge">{badge}</span>{/if}</div>{#if model}<div class="m">{model}</div>{/if}</div>
    {#if pill}<StatePill word={pill[0]} state={pill[1]} />{/if}
    {#if menu}<span class="more" aria-label="More">⋮</span>{/if}
  </div>
  {#if state}<div class="st">{state}</div>{/if}
  {#if actions.length}<ActionBar {actions} />{/if}
</div>
<style>
  .dev { border-radius: var(--density-corner); background: var(--role-surface); padding: var(--density-large); display: flex; flex-direction: column; gap: var(--density-small); }
  .head { display: flex; align-items: center; }
  .g { width: var(--density-glyph); height: var(--density-glyph); border-radius: var(--density-small); background: var(--role-surface-selected); color: var(--role-accent); display: grid; place-items: center; flex: none; font-size: var(--density-title); }
  .txt { flex: 1; min-width: 0; padding-left: var(--density-medium); }
  .idl { display: flex; align-items: center; }
  .id { font: 600 var(--density-head) / normal var(--type-family-sans); color: var(--role-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .badge { padding-left: var(--density-small); font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-accent); }
  .m, .st { font: 400 var(--density-body) / normal var(--type-family-sans); color: var(--role-text-secondary); }
  .more { color: var(--role-text-primary); font-size: var(--density-head); padding: 4px 10px; }
</style>
