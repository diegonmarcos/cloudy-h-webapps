<script lang="ts">
  import { FleetShell } from '@cloudy/ui';
  import C3Body from '@cloudy/c3-data/ui/C3Body.svelte';
  import PortalPanels from '@cloudy/c3-data/ui/PortalPanels.svelte';
  let { data } = $props();
  const v = $derived(data.view);
</script>

<svelte:head><title>{v.title}</title></svelte:head>

<FleetShell app="cloud-c3" background={v.background} crumbs={v.crumbs} related={v.related} sections={v.sections} section={v.section}
  tabs={v.tabs} tab={v.tabSelected} subtabs={v.subtabs} subtab={v.subSelected} aiHref={v.aiHref} profileHref={v.profileHref} configsHref={v.configsHref}
  mode={v.mode} groups={v.groups} sideItems={v.sideItems}>
  <div data-site="cloudy-c3">
    {#if data.body === 'portal'}<PortalPanels {...data.data} />{:else}<C3Body data={data.data} />{/if}
  </div>
</FleetShell>
