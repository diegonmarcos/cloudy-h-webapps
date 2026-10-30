<script lang="ts">
  // A fleet page with no web mimic body: the declared navigation is exact; the body says where the content lives
  // (KitEmptyState). /<app>/portal/ frames the app instead: its live Kotlin/Wasm page (same origin, until the mimic
  // ships) or its vendor UI when that site allows framing, else the app card with Open + Access help.
  import { EmptyState, Button, Portal } from '@cloudy/ui';
  import type { AppView } from '$lib/server/nav';
  let { view, data }: { view: AppView; data?: { wasmHref?: string | null } } = $props();
</script>

{#if view.portal}
  <div class="frame" data-testid="app-body">
    {#if view.portalInfo}
      <Portal src={view.portalInfo.url} title={view.app.name} embeddable={view.portalInfo.embeddable} openHref={view.portalInfo.url} helpHref={view.portalInfo.serviceHref} />
    {:else if view.wasmHref}
      <Portal src={view.wasmHref} title="{view.app.name} (Kotlin/Wasm)" embeddable openHref={view.wasmHref} />
    {/if}
  </div>
{:else}
  <div class="generic" data-testid="app-body">
    {#if view.portalInfo}
      <EmptyState title={view.app.name} caption="A vendor web app: it opens on its own site, behind the fleet sign-in." />
      <div class="act"><Button href={view.portalHref}>Open here</Button><Button variant="outlined" href={view.portalInfo.serviceHref}>Access help</Button></div>
    {:else if !view.sections.length}
      <EmptyState title={view.app.name} caption="This app has no web pages: it runs on the phone." />
    {:else}
      <EmptyState title={view.title.split(' · ')[0]} caption="Live on the device: this page reads phone or fleet state a browser cannot reach." />
      {#if view.portalHref}<div class="act"><Button variant="outlined" href={view.portalHref}>Kotlin/Wasm page</Button></div>{/if}
    {/if}
  </div>
{/if}

<style>
  .generic { min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
  .frame { position: relative; height: calc(100dvh - 220px); min-height: 360px; margin: 0 8px; border-radius: 12px; overflow: hidden; }
  .act { display: flex; gap: 8px; justify-content: center; padding-bottom: 24px; }
</style>
