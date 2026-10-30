<script lang="ts">
  // The Configs > UI card (libs:ui-nav-bars NavUiConfigCard): the nav mode, Classic or Clean, and the scroll-hide toggle. The choice is
  // the app's own (persisted per app, navUiStore); the app's declared default (build.json::ui.nav_ui) is marked "(default)".
  import Segmented from '../components/Segmented.svelte';
  import SwitchRow from '../components/SwitchRow.svelte';
  import { NAV_UI_MODES, type NavUiMode, type NavUiSettings } from './navUi';
  let { settings, declared, onChange }: { settings: NavUiSettings; declared: NavUiSettings; onChange: (s: NavUiSettings) => void } = $props();
  let mode = $state<string | null>(settings.mode);
  let hide = $state(settings.scrollHide);
  const label = (m: string) => (m === 'clean' ? 'Clean' : 'Classic') + (m === declared.mode ? ' (default)' : '');
  const options = $derived(NAV_UI_MODES.map((m) => [m, label(m)] as [string, string]));
  $effect(() => {
    const next = { mode: (mode ?? settings.mode) as NavUiMode, scrollHide: hide };
    if (next.mode !== settings.mode || next.scrollHide !== settings.scrollHide) onChange(next);
  });
</script>

<div class="navui" data-testid="navui-card">
  <div class="t">Navigation</div>
  <Segmented {options} bind:selected={mode} />
  <SwitchRow title="Hide the bars while scrolling down" bind:checked={hide} />
</div>

<style>
  .navui { display: flex; flex-direction: column; gap: 10px; }
  .t { font: 600 var(--type-title-small-size) / normal var(--type-family-sans); color: var(--role-text-primary); }
</style>
