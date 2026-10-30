<script lang="ts">
  // A fleet page whose body is live on the device (an account, a camera, a mailbox): the declared navigation is exact, the
  // body says where the content lives (KitEmptyState), and a vendor-UI app links its service.
  import { EmptyState, Button } from '@cloudy/ui';
  import type { AppView } from '$lib/server/nav';
  let { view }: { view: AppView } = $props();
</script>

<div class="generic" data-testid="app-body">
  {#if view.portalInfo}
    <EmptyState title={view.app.label} caption="A vendor web app: it opens on its own site, behind the fleet sign-in." />
    <div class="act"><Button href={view.portalInfo.url}>Open {view.app.label}</Button><Button variant="outlined" href={view.portalInfo.serviceHref}>Access help</Button></div>
  {:else if !view.sections.length}
    <EmptyState title={view.app.label} caption="This app has no web pages: it runs on the phone." />
  {:else}
    <EmptyState title={view.title.split(' · ')[0]} caption="Live on the device: this page reads phone or fleet state a browser cannot reach." />
  {/if}
</div>

<style>
  .generic { min-height: 60vh; display: flex; flex-direction: column; justify-content: center; }
  .act { display: flex; gap: 8px; justify-content: center; padding-bottom: 24px; }
</style>
