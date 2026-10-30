<script lang="ts">
  // KitStatePill: dot (8dp, state colour) + caption word, on surface_selected, corner 12dp, 8x2dp padding.
  import type { KitState } from '../shell/types';
  import { stateColor } from './state';
  let { word, state }: { word: string; state: KitState } = $props();
</script>
<span class="pill"><i style:background={stateColor(state)}></i><span>{word}</span></span>
<style>
  .pill { display: inline-flex; align-items: center; border-radius: var(--density-corner); background: var(--role-surface-selected); padding: calc(var(--density-small) / 4) var(--density-small); }
  i { width: var(--density-dot); height: var(--density-dot); border-radius: 50%; flex: none; }
  span span { padding-left: calc(var(--density-small) / 2); font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-primary); white-space: nowrap; }
</style>
