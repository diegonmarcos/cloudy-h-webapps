<script lang="ts">
  import '@cloudy/ui/src/styles.ts';
  import { onNavigate } from '$app/navigation';
  let { children } = $props();
  onNavigate((nav) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise((resolve) => { document.startViewTransition(async () => { resolve(); await nav.complete; }); });
  });
</script>

{@render children()}
