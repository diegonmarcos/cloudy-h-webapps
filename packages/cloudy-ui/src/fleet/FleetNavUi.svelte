<script lang="ts">
  // Everything of the nav UI that is not needed to DRAW the shell: the Clean mode's left drawer and the Configs > UI dialog (with
  // the save). One lazy chunk, loaded the first time the Clean mode is on or the entry is tapped (the shell's up-front JS has a budget).
  import FleetCleanDrawer from './FleetCleanDrawer.svelte';
  import NavUiDialog from '../shell/NavUiDialog.svelte';
  import { saveNavUi } from '../shell/navUiSave';
  import type { NavUiSettings } from '../shell/navUi';
  type Page = { id: string; label: string; href: string | null };
  let { drawerOpen = $bindable(false), uiOpen = $bindable(false), clean, app, declared, ui, bottom, section, childPages, selectedChild, aiHref = null, profileHref = null, configsHref = null }: {
    drawerOpen?: boolean; uiOpen?: boolean; clean: boolean; app: string; declared: NavUiSettings; ui: NavUiSettings;
    bottom: Page[]; section: string | null; childPages: Page[]; selectedChild: string | null; aiHref?: string | null; profileHref?: string | null; configsHref?: string | null;
  } = $props();
</script>

{#if clean}<FleetCleanDrawer bind:open={drawerOpen} {bottom} {section} {childPages} {selectedChild} {aiHref} {profileHref} {configsHref} onConfigsUi={() => (uiOpen = true)} />{/if}
{#if uiOpen}<NavUiDialog bind:open={uiOpen} settings={ui} {declared} onChange={(n) => saveNavUi(app, declared, n)} />{/if}
