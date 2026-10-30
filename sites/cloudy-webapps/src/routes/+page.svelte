<script lang="ts">
  import { SuperAppShell, NeonCube, Tiles } from '@cloudy/ui';
  let { data } = $props();
  const v = $derived(data.view);
</script>

<svelte:head><title>{v.title}</title></svelte:head>

<SuperAppShell shell={data.shell} section="home" sectionLabel="Home" atHome>
  <!-- Home: the neon cube (Home3DFragment). Embedded in the APK's Cloud > WebApps pane the same URL is the Cloud > Apps grid. -->
  <div class="home"><NeonCube /></div>
  <div class="embed-apps"><Tiles groups={v.body.groups ?? []} quickmarks /></div>
</SuperAppShell>

<style>
  .home { position: absolute; inset: 0; }
  .embed-apps { display: none; }
  :global(html.embed) .home { display: none; }
  :global(html.embed) .embed-apps { display: block; }
  :global(html[data-theme='cloud_minimalist_black']) .home { display: none; }
  :global(html[data-theme='cloud_minimalist_black']) .embed-apps { display: block; font-family: var(--type-family-mono); }
</style>
