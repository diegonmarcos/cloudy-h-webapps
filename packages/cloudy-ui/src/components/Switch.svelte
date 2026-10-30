<script lang="ts">
  // Material3 Switch (dark scheme from CloudKitTheme): 52x32 track, 16dp thumb off / 24dp on; on = primary (accent) track with
  // onPrimary (tile_ink) thumb, off = surfaceContainerHighest track, outline border and thumb.
  let { checked = $bindable(false), label = '' }: { checked?: boolean; label?: string } = $props();
</script>
<button class="sw" role="switch" aria-checked={checked} aria-label={label} onclick={() => (checked = !checked)}><i></i></button>
<style>
  .sw { position: relative; width: 52px; height: 32px; flex: none; border-radius: 16px; box-sizing: border-box; border: 2px solid var(--role-hairline); background: #36343b; padding: 0; cursor: pointer; }
  .sw i { position: absolute; top: 50%; left: 6px; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; background: var(--role-text-secondary); transition: all 150ms; }
  .sw[aria-checked='true'] { background: var(--role-accent); border-color: var(--role-accent); }
  .sw[aria-checked='true'] i { left: 22px; width: 24px; height: 24px; margin-top: -12px; background: var(--role-tile-ink); }
</style>
