<script lang="ts">
  import { base } from '$app/paths';
  import { joinBase } from '@cloudy/ui';
</script>

<svelte:head><title>Cloud C3</title></svelte:head>

<!-- M0 placeholder: the C3 home (Android Cloud C3 app look) replaces this in M6. Not published until the M7 cut-over. -->
<main data-site="cloudy-c3">
  <h1>Cloud C3</h1>
  <p>cloudy-c3 workspace skeleton (#1320 M0).</p>
  <a href={joinBase(base, '')}>Home</a>
</main>
