<script lang="ts">
  import { iconHref, fleetIconHref } from '../lib/icons';
  // set 'sa' = the SuperApp's resolution (drawable, then catalog); 'fleet' = libs:ui-icons only (UiIcons + FALLBACK).
  let { name, size = 24, set = 'sa', class: cls = '', style = '' }: { name: string | null | undefined; size?: number; set?: 'sa' | 'fleet'; class?: string; style?: string } = $props();
</script>

<svg class="icon {cls}" width={size} height={size} {style} aria-hidden="true" focusable="false"><use href={set === 'fleet' ? fleetIconHref(name) : iconHref(name)} /></svg>

<style>
  .icon { display: block; flex: none; color: inherit; }
</style>
