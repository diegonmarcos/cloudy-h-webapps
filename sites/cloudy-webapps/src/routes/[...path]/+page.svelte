<script lang="ts">
  import { SuperAppShell, FleetShell } from '@cloudy/ui';
  import PageBody from '$lib/PageBody.svelte';
  import AboutBody from '$lib/AboutBody.svelte';
  let { data } = $props();
  const v = $derived(data.view);
</script>

<svelte:head><title>{v.title}</title></svelte:head>

{#if v.kind === 'superapp' && data.shell}
  <SuperAppShell shell={data.shell} section={v.section} sectionLabel={v.sectionLabel} backHref={v.backHref}
    tabs={v.tabs} tabSelected={v.tabSelected} subtabs={v.subtabs} subSelected={v.subSelected} tabHrefs={v.tabHrefs}>
    <PageBody body={v.body} />
  </SuperAppShell>
{:else if v.kind === 'about' && data.shell}
  <SuperAppShell shell={data.shell} section="home" sectionLabel="About" backHref={v.backHref} historyBack>
    <AboutBody about={v} />
    {#snippet detail()}<div></div>{/snippet}
  </SuperAppShell>
{:else if v.kind === 'app'}
  <FleetShell app={v.app.id} background={v.background} crumbs={v.crumbs} related={v.related} sections={v.sections} section={v.section}
    tabs={v.tabs} tab={v.tabSelected} subtabs={v.subtabs} subtab={v.subSelected} aiHref={v.aiHref} profileHref={v.profileHref} configsHref={v.configsHref} mode={v.mode} groups={v.groups} sideItems={v.sideItems}>
    {#if data.body}{@const Body = data.body}<Body view={v} data={v.data} />{/if}
  </FleetShell>
{/if}
