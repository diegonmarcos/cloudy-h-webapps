<script lang="ts">
  import { SuperAppShell } from '@cloudy/ui';
  import PageBody from '$lib/PageBody.svelte';
  import AppFrame from '$lib/AppFrame.svelte';
  let { data } = $props();
  const v = $derived(data.view);
</script>

<svelte:head><title>{v.title}</title></svelte:head>

{#if v.kind === 'superapp'}
  <SuperAppShell shell={data.shell} section={v.section} sectionLabel={v.sectionLabel} backHref={v.backHref}
    tabs={v.tabs} tabSelected={v.tabSelected} subtabs={v.subtabs} subSelected={v.subSelected} tabHrefs={v.tabHrefs}>
    <PageBody body={v.body} />
  </SuperAppShell>
{:else}
  <AppFrame view={v} />
{/if}
