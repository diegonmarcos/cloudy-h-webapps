<script lang="ts">
  import { base } from '$app/paths';
  import { joinBase } from '@cloudy/ui';
</script>

<svelte:head><title>Cloud SuperApp</title></svelte:head>

<!-- M0 placeholder: the SuperApp Home (TileGrid) replaces this in M2. Not published until the M7 cut-over. -->
<main data-site="cloudy-webapps">
  <h1>Cloud SuperApp</h1>
  <p>cloudy-webapps workspace skeleton (#1320 M0).</p>
  <a href={joinBase(base, '')}>Home</a>
</main>
