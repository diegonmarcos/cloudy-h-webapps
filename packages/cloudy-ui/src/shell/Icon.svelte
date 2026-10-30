<script lang="ts">
  import { iconHref } from '../lib/icons';
  let { name, size = 24, class: cls = '', style = '' }: { name: string | null | undefined; size?: number; class?: string; style?: string } = $props();
</script>

<svg class="icon {cls}" width={size} height={size} {style} aria-hidden="true" focusable="false"><use href={iconHref(name)} /></svg>

<style>
  .icon { display: block; flex: none; color: inherit; }
</style>
