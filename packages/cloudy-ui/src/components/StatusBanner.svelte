<script lang="ts">
  // KitStatusBanner: dot + sentence (body) + an optional text action; surface, 1dp state-coloured border, corner 12dp, 16x12dp.
  import type { KitState } from '../shell/types';
  import { stateColor } from './state';
  let { text, state, action = null }: { text: string; state: KitState; action?: { label: string; href?: string; onclick?: () => void } | null } = $props();
</script>
<div class="banner" style:border-color={stateColor(state)}>
  <i style:background={stateColor(state)}></i><span class="t">{text}</span>
  {#if action}<svelte:element this={action.href ? 'a' : 'button'} class="act" href={action.href} onclick={action.onclick}>{action.label}</svelte:element>{/if}
</div>
<style>
  .banner { display: flex; align-items: center; border-radius: var(--density-corner); background: var(--role-surface); border: var(--density-rule) solid; padding: var(--density-medium) var(--density-large); }
  i { width: var(--density-dot); height: var(--density-dot); border-radius: 50%; flex: none; }
  .t { flex: 1; padding-left: var(--density-medium); font: 400 var(--density-body) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .act { background: none; border: 0; color: var(--role-accent); font: 400 var(--density-title) / normal var(--type-family-sans); padding: 4px 10px; min-height: 30px; text-decoration: none; cursor: pointer; }
</style>
