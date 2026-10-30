<script lang="ts">
  // Live mode (#1320 B.7): snapshot by default; "live" asks the mesh first, then the public endpoint with a bearer the user
  // types here. The bearer stays in this tab's sessionStorage (gone when the tab closes), never in the repo or a cache.
  import { onMount } from 'svelte';
  import { SettingsRow, Segmented, Button } from '@cloudy/ui';
  import { BEARER_KEY, MODE_KEY, MESH_BASE, PUBLIC_BASE } from '../client';
  let mode = $state<string | null>('snapshot');
  let bearer = $state('');
  let saved = $state(false);
  onMount(() => { mode = sessionStorage.getItem(MODE_KEY) ?? 'snapshot'; saved = !!sessionStorage.getItem(BEARER_KEY); });
  $effect(() => { if (mode) sessionStorage.setItem(MODE_KEY, mode); });
  const save = () => { if (bearer.trim()) sessionStorage.setItem(BEARER_KEY, bearer.trim()); bearer = ''; saved = true; };
  const forget = () => { sessionStorage.removeItem(BEARER_KEY); saved = false; };
</script>

<div class="live" data-testid="c3-live">
  <SettingsRow title="Data" subtitle="Snapshot = the committed copy. Live = {MESH_BASE} (mesh), else {PUBLIC_BASE} with your bearer." />
  <Segmented options={[['snapshot', 'Snapshot'], ['live', 'Live']]} bind:selected={mode} />
  <form class="bearer" onsubmit={(e) => { e.preventDefault(); save(); }}>
    <input type="password" autocomplete="off" placeholder={saved ? 'Bearer set for this tab' : 'Public API bearer (this tab only)'} bind:value={bearer} aria-label="Bearer" />
    <Button>Use</Button>{#if saved}<Button variant="text" onclick={forget}>Forget</Button>{/if}
  </form>
</div>

<style>
  .live { display: flex; flex-direction: column; gap: 8px; padding: 8px 0; }
  .bearer { display: flex; gap: 8px; align-items: center; }
  input { flex: 1; min-width: 0; height: 30px; border-radius: 12px; border: 1px solid var(--f-island-border); background: var(--f-tab-strip); color: var(--f-ink); padding: 0 10px; font: 400 12px var(--type-family-sans); }
</style>
