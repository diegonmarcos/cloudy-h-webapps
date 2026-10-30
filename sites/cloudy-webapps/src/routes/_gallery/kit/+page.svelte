<script lang="ts">
  // The web side of the M4 baseline pair "kit-<theme>": KitSamples.All() exactly as BaselineShots renders it (full width,
  // 12dp padding, KitDensity.medium between the parts) on the theme's window. ?theme=cloud | cloud_minimalist_black.
  import { Hero, DeviceCard, StatTile, ActionBar, StatusBanner, ListRow, Fingerprint, Segmented, Stepper, SaveBar } from '@cloudy/ui';
  const steps = [
    { id: 'connected', title: 'Connected', detail: 'GitHub · fetched 12:05', state: 'done' as const },
    { id: 'profile', title: 'Profile', detail: 'galaxy-s21 loaded', state: 'running' as const },
    { id: 'shell', title: 'Shell', detail: 'no channel yet', state: 'failed' as const, action: 'Retry' },
    { id: 'store', title: 'Store', detail: 'Cloud Store not installed', state: 'todo' as const, action: 'Install' },
  ];
  let seg = $state<string | null>('github');
</script>

<svelte:head><title>KitSamples</title><meta name="robots" content="noindex" /></svelte:head>
<div class="win" data-testid="kit-samples">
  <div class="col">
    <Hero name="Ada Lovelace" lines={['ada@example.org', 'London/UK · Analytical']} initials="AL" />
    <DeviceCard id="phone-a" model="Pixel 9 · Android 16" state="profile loaded · backed up 10:48" badge="this phone" menu />
    <div class="two"><StatTile value="247" caption="apps installed" state="ok" /><StatTile value="12" caption="keys drift" state="warn" /></div>
    <ActionBar actions={[{ label: 'Backup now' }, { label: 'Restore' }]} />
    <StatusBanner text="Connected · GitHub · fetched 12:05" state="ok" />
    <ListRow label="Company" secondary="about › profile › company" pill={['set', 'ok']}>{#snippet trailing()}<Fingerprint fingerprint="3fa9c1d2e4b5" />{/snippet}</ListRow>
    <Segmented options={[['github', 'GitHub'], ['gitea', 'Gitea']]} bind:selected={seg} />
    <Stepper {steps} />
    <SaveBar summary="3 changes" />
  </div>
</div>

<style>
  .win { position: fixed; inset: 0; overflow: auto; background: var(--role-window); color: var(--role-text-primary); }
  .col { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
  .two { display: flex; gap: 8px; } .two > :global(*) { flex: 1; }
</style>
