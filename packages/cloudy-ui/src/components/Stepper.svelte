<script lang="ts">
  // KitStepper: ○ ● ✓ ✗ on a vertical rail (glyph column 28dp, 1dp x 16dp hairline joints), title (title, medium), detail
  // (body; bad ink when FAILED; hidden when DONE), one trailing text action; surface, corner 12dp, 16x8dp padding.
  import type { KitState } from '../shell/types';
  import { stateColor } from './state';
  type Step = { id: string; title: string; detail: string; state: 'todo' | 'running' | 'done' | 'failed'; action?: string };
  let { steps }: { steps: Step[] } = $props();
  const G: Record<Step['state'], [string, KitState]> = { todo: ['○', 'idle'], running: ['●', 'busy'], done: ['✓', 'ok'], failed: ['✗', 'bad'] };
</script>
<div class="stepper">
  {#each steps as s, i (s.id)}
    <div class="step">
      <div class="rail"><span class="g" style:color={stateColor(G[s.state][1])}>{G[s.state][0]}</span>{#if i < steps.length - 1}<i></i>{/if}</div>
      <div class="txt"><div class="t">{s.title}</div>{#if s.state !== 'done' && s.detail}<div class="d" class:bad={s.state === 'failed'}>{s.detail}</div>{/if}</div>
      {#if s.action}<button class="act">{s.action}</button>{/if}
    </div>
  {/each}
</div>
<style>
  .stepper { border-radius: var(--density-corner); background: var(--role-surface); padding: var(--density-small) var(--density-large); }
  .step { display: flex; }
  .rail { width: var(--density-glyph); flex: none; display: flex; flex-direction: column; align-items: center; }
  .g { font: 400 var(--density-head) / normal var(--type-family-sans); padding-top: var(--density-small); }
  .rail i { width: var(--density-rule); height: var(--density-large); background: var(--role-hairline); }
  .txt { flex: 1; padding: var(--density-small) 0 var(--density-small) var(--density-small); }
  .t { font: 500 var(--density-title) / normal var(--type-family-sans); color: var(--role-text-primary); }
  .d { font: 400 var(--density-body) / normal var(--type-family-sans); color: var(--role-text-secondary); }
  .d.bad { color: var(--color-state-bad); }
  .act { align-self: center; background: none; border: 0; color: var(--role-accent); font: 400 var(--density-title) / normal var(--type-family-sans); padding: 4px 10px; min-height: 30px; cursor: pointer; }
</style>
