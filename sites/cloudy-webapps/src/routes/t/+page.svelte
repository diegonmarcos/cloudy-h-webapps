<script lang="ts">
  // /cloud-webapps/t/<android target>: 1:1 parity link. `page:cloud/apps`, `extapp:cloud-me#page:health/home`,
  // `?section:mail`. The path form reaches this page through the Pages root 404.html rule (M7); the query and fragment
  // forms work as they are. Unknown or device-only targets land on Home.
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { resolveTarget, targetFromLocation, joinBase } from '@cloudy/ui';
  let msg = $state('Resolving…');
  onMount(async () => {
    const targets = (await import('@cloudy/ui/nav/targets.json')).default.targets as Record<string, string>;
    const t = targetFromLocation(location.pathname, location.search, location.hash, base);
    const r = resolveTarget(t, targets);
    const to = r.kind === 'path' ? joinBase(base, r.path) : r.kind === 'url' ? r.url : joinBase(base, '');
    msg = `${t || '(no target)'} → ${to}`;
    location.replace(to);
  });
</script>

<svelte:head><title>Cloud SuperApp target</title><meta name="robots" content="noindex" /></svelte:head>
<p class="t" data-testid="resolver">{msg}</p>

<style>.t { padding: 24px; font: 400 12px var(--type-family-mono); color: #fff; }</style>
