<script lang="ts">
  // Portal (#1320 B.4, WebPageFragment's role): a sandboxed frame of an app that is not mimicked (yet): a same-origin
  // Kotlin/Wasm page, or a vendor UI whose site allows framing (portal probe). No camera/mic/geolocation; no credential
  // crosses the frame; if it does not load in 8 s (or errors) the card with the Open link and the access help shows instead.
  import { onMount } from 'svelte';
  import EmptyState from './EmptyState.svelte';
  import Button from './Button.svelte';
  let { src, title, embeddable, openHref = null, helpHref = null }: { src: string; title: string; embeddable: boolean; openHref?: string | null; helpHref?: string | null } = $props();
  let state = $state<'loading' | 'ok' | 'failed'>(embeddable ? 'loading' : 'failed');
  onMount(() => { if (!embeddable) return; const t = setTimeout(() => { if (state === 'loading') state = 'failed'; }, 8000); return () => clearTimeout(t); });
</script>

<div class="portal" data-testid="portal" data-state={state}>
  {#if embeddable && state !== 'failed'}
    <iframe {src} {title} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="strict-origin" loading="lazy" allow=""
      onload={() => (state = 'ok')} onerror={() => (state = 'failed')}></iframe>
  {:else}
    <div class="card"><EmptyState {title} caption="This app opens on its own site." /><div class="act">{#if openHref}<Button href={openHref}>Open {title}</Button>{/if}{#if helpHref}<Button variant="outlined" href={helpHref}>Access help</Button>{/if}</div></div>
  {/if}
</div>

<style>
  .portal { position: absolute; inset: 0; }
  iframe { width: 100%; height: 100%; border: 0; display: block; background: #000; }
  .card { height: 100%; display: flex; flex-direction: column; justify-content: center; }
  .act { display: flex; gap: 8px; justify-content: center; padding-bottom: 24px; }
</style>
