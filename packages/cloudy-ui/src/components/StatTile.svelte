<script lang="ts">
  // KitStatTile: value (display, semibold) with its state dot, caption under; surface, corner 12dp, 16dp padding, 4dp gap.
  import type { KitState } from '../shell/types';
  import { stateColor } from './state';
  let { value, caption, state }: { value: string; caption: string; state: KitState } = $props();
</script>
<div class="stat"><div class="top"><span class="v">{value}</span><i style:background={stateColor(state)}></i></div><div class="c">{caption}</div></div>
<style>
  .stat { border-radius: var(--density-corner); background: var(--role-surface); padding: var(--density-large); display: flex; flex-direction: column; gap: calc(var(--density-small) / 2); min-width: 0; }
  .top { display: flex; align-items: center; }
  .v { flex: 1; min-width: 0; font: 600 var(--density-display) / normal var(--type-family-sans); color: var(--role-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  i { width: var(--density-dot); height: var(--density-dot); border-radius: 50%; flex: none; }
  .c { font: 400 var(--density-caption) / normal var(--type-family-sans); color: var(--role-text-secondary); }
</style>
