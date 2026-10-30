<script lang="ts">
  // The component gallery (#1320 C.2): every Kit* port and the shell parts in both launcher themes, with libs:ui-kit's own
  // KitSamples.All() data so the M4 Roborazzi baseline of KitSamples renders the same content. Excluded from the sitemap.
  import { Hero, DeviceCard, StatTile, ActionBar, StatusBanner, ListRow, Fingerprint, Segmented, Stepper, SaveBar, Card, SectionHeader,
    GroupTitle, SettingsRow, SwitchRow, SelectableTile, Chip, StatePill, Button, SearchBar, EmptyState, StackCard, BottomNavIsland, PageTabs, Tiles, Icon, THEME_IDS } from '@cloudy/ui';
  const steps = [
    { id: 'connected', title: 'Connected', detail: 'GitHub · fetched 12:05', state: 'done' as const },
    { id: 'profile', title: 'Profile', detail: 'galaxy-s21 loaded', state: 'running' as const },
    { id: 'shell', title: 'Shell', detail: 'no channel yet', state: 'failed' as const, action: 'Retry' },
    { id: 'store', title: 'Store', detail: 'Cloud Store not installed', state: 'todo' as const, action: 'Install' },
  ];
  const nav5 = ['Notify:ic_p_inbox', 'Boards:ic_pm_boards', 'Home:ic_home', 'Cloud:ic_suite', 'Phone:ic_p_dialer'].map((s) => { const [label, icon] = s.split(':'); return { id: label.toLowerCase(), label, icon, href: '#' }; });
  const nav8 = ['Inbox:inbox', 'RSS:rss_feed', 'Tasks:checklist', 'Home:home', 'Chat:chat', 'Video:videocam', 'People:contacts', 'More:apps'].map((s) => { const [label, icon] = s.split(':'); return { id: label.toLowerCase(), label, icon, href: '#' }; });
  const tabs = ['App', 'WebApps', 'Linktree', 'Configs'].map((l) => ({ id: l.toLowerCase(), label: l, href: '#' }));
  let seg = $state<string | null>('github');
  let sw = $state(true);
</script>

<svelte:head><title>@cloudy/ui gallery</title><meta name="robots" content="noindex" /></svelte:head>

<div class="gallery">
  {#each THEME_IDS as theme}
    <section class="theme" data-theme={theme} data-testid="gallery-{theme}">
      <h2>{theme}</h2>
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
        <Card><SectionHeader title="Section header" subtitle="Caption under the title" /><GroupTitle text="This phone" />
          <SettingsRow title="Settings row" subtitle="secondary line" /><SwitchRow title="Switch row" subtitle="the whole row toggles" bind:checked={sw} /></Card>
        <SelectableTile label="Selected tile" subtitle="radio" selected /><SelectableTile label="Idle tile" subtitle="radio" />
        <div class="row"><Chip label="read-only" /><Chip label="removable" onremove={() => {}} /><StatePill word="busy" state="busy" /><StatePill word="bad" state="bad" /><Fingerprint length={32} /></div>
        <div class="row"><Button>Filled</Button><Button variant="tonal">Tonal</Button><Button variant="outlined">Outlined</Button><Button variant="text">Text</Button></div>
        <SearchBar />
        <StackCard title="Stack card" subtitle="kind: stats"><ListRow label="Rooms">{#snippet trailing()}14{/snippet}</ListRow></StackCard>
        <div class="empty"><EmptyState title="Empty state" caption="Select an item" /></div>
        <PageTabs {tabs} selected="app" flushTop={false} />
        <div class="light-bg"><PageTabs {tabs} selected="webapps" surface="light" flushTop={false} /></div>
        <Tiles groups={[{ title: 'Tiles', tiles: [{ id: 'm', label: 'Mail', icon: 'ic_mail', href: '#' }, { id: 'c', label: 'Calc', icon: 'ic_calc', href: '#', separatorAfter: true }, { id: 'x', label: 'Not installed', icon: 'ic_camera', href: '#', missing: true }] }]} />
        <div class="icons">{#each ['ic_mail', 'ic_calc', 'calendar_month', 'assistant', 'nope-unknown'] as n}<Icon name={n} />{/each}</div>
        <div class="nav"><BottomNavIsland items={nav5} selected="home" /></div>
        <div class="nav narrow"><BottomNavIsland items={nav8} selected="home" /></div>
      </div>
    </section>
  {/each}
</div>

<style>
  .gallery { display: flex; flex-wrap: wrap; }
  .theme { flex: 1 1 380px; min-width: 0; background: var(--role-window); color: var(--role-text-primary); padding: 12px; }
  h2 { font: 700 12px var(--type-family-mono); margin: 0 0 8px; }
  .col { display: flex; flex-direction: column; gap: 12px; }
  .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .empty { height: 90px; }
  .light-bg { background: #fff; }
  .icons { display: flex; gap: 12px; }
  .nav { position: relative; height: 96px; }
  .nav.narrow { width: 360px; }
</style>
