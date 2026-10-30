<script lang="ts">
  // Cloud C3 sections: Home = the fleet at a glance (KitStatTile grid); every other page a dense KitListRow list with the
  // state pill; Containers is list-detail at the medium window class and up (nav-overlay list_detail).
  import { StatTile, ListRow, EmptyState, StatusBanner, SettingsRow } from '@cloudy/ui';
  type Row = { title: string; subtitle: string; meta: string; state: 'ok' | 'warn' | 'bad' | 'idle' | 'busy'; lead: string; detail?: [string, string][] };
  let { data }: { data: { section: string; page: string | null; home: { stats: { value: string; caption: string; state: 'ok' | 'warn' }[] } | null; rows: Row[]; listDetail: boolean; snapshot: string } } = $props();
  let pick = $state(0);
</script>

<div class="c3" data-testid="app-body">
  <div class="banner"><StatusBanner text="Read from the {data.snapshot}." state="idle" /></div>
  {#if data.home}
    <div class="stats">{#each data.home.stats as s (s.caption)}<StatTile value={s.value} caption={s.caption} state={s.state} />{/each}</div>
  {:else if data.section === 'configs'}
    <div class="list"><SettingsRow title="API" subtitle="https://c3-pvt.diegonmarcos.com/c3-infra-api (mesh), public bearer fallback" /><SettingsRow title="App" subtitle="Cloud C3 · web mimic (#1320)" /></div>
  {:else if data.rows.length}
    <div class="ld" class:split={data.listDetail}>
      <div class="list" data-testid="c3-list">
        {#each data.rows as r, i (i)}
          <button class="pick" class:on={data.listDetail && i === pick} onclick={() => (pick = i)}><ListRow label={r.title} secondary={r.subtitle} leading={r.lead} pill={[r.meta || r.state, r.state]} /></button>
        {/each}
      </div>
      {#if data.listDetail}
        <aside class="detail" data-testid="c3-detail">
          {#if data.rows[pick]}<h2>{data.rows[pick].title}</h2>{#each data.rows[pick].detail ?? [['Detail', data.rows[pick].subtitle]] as [k, v]}<SettingsRow title={k} subtitle={v} />{/each}{/if}
        </aside>
      {/if}
    </div>
  {:else}
    <EmptyState title={null} caption="Live on the device: this page reads the c3-infra-api." />
  {/if}
</div>

<style>
  .c3 { padding: 0 12px 12px; }
  .banner { padding-bottom: 8px; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .pick { display: block; width: 100%; background: none; border: 0; padding: 0 8px; text-align: left; color: inherit; border-radius: 12px; cursor: pointer; }
  .pick.on { background: var(--role-surface-selected, #7c3aed44); }
  .detail { display: none; }
  @container pane (min-width: 600px) {
    .ld.split { display: grid; grid-template-columns: 360px 1fr; gap: 12px; }
    .ld.split .detail { display: block; border-left: 1px solid var(--f-island-border); padding-left: 12px; }
    .stats { grid-template-columns: repeat(4, 1fr); }
  }
  h2 { margin: 8px 0; font: 500 var(--type-title-medium-size) / normal var(--type-family-sans); }
</style>
