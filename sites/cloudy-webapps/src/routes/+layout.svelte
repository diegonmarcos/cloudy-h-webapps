<script lang="ts">
  import '@cloudy/ui/src/styles.ts';
  import { onNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  let { children } = $props();
  // Test hook for the visual mutation run (mutation.yml MUTATION=island-width): ?wf=<0..1> overrides nav.widthFraction.
  onMount(() => { const wf = new URLSearchParams(location.search).get('wf'); if (wf && /^0?\.\d+$/.test(wf)) document.documentElement.style.setProperty('--nav-width-fraction', wf); });
  // Section changes fade through (fade_in/fade_out 220 ms, ShellActivity setCustomAnimations) via the View Transitions API.
  onNavigate((nav) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise((resolve) => { document.startViewTransition(async () => { resolve(); await nav.complete; }); });
  });
</script>

{@render children()}
