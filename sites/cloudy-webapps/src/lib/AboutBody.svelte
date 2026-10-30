<script lang="ts">
  // The About page of a phone-only fleet app (#1322): icon, name, the fixed phone-only line, what it does (nav.json, i.e. the
  // app's build.json), where to get it. The back arrow lives in the shell's toolbar (history back, falls back to the grid).
  import { Icon } from '@cloudy/ui';
  import type { AboutView } from '$lib/server/nav';
  let { about }: { about: AboutView } = $props();
</script>

<article class="about" data-testid="about" data-app={about.app.id}>
  <div class="glyph"><Icon name={about.app.icon ?? 'ic_settings'} size={64} /></div>
  <h1 data-testid="about-name">{about.app.label}</h1>
  <p class="line" data-testid="about-line">This app is part of the cloudy APK fleet and runs on the phone only.</p>
  <h2>What it does</h2>
  <p data-testid="about-what">{about.app.what}</p>
  <h2>Where to get it</h2>
  <p data-testid="about-get">
    Install it on your phone from the Cloud Store app, or from the Store tile in the Cloud SuperApp.
    {#if about.app.id !== 'cloud-store'}<a href={about.storeHref}>About the Store</a>.{/if}
  </p>
  <p><a href={about.gridHref} data-testid="about-grid">All apps</a></p>
</article>

<style>
  .about { padding: 12px 20px 24px; max-width: 560px; margin: 0 auto; color: var(--role-text-primary); font-family: var(--type-family-sans); }
  .glyph { display: grid; place-items: center; margin: 16px 0 8px; filter: grayscale(1); opacity: 0.6; line-height: 0; }
  h1 { margin: 0 0 8px; text-align: center; font: 500 var(--type-title-small-size) / normal var(--type-family-sans); font-size: 22px; }
  h2 { margin: 18px 0 4px; font: 500 14px / normal var(--type-family-sans); color: var(--role-text-secondary); }
  p { margin: 0 0 6px; font: 400 15px / 1.45 var(--type-family-sans); }
  .line { text-align: center; color: var(--role-text-secondary); }
  a { color: var(--role-accent); }
</style>
