<script lang="ts">
  import SectionHeader from './SectionHeader.svelte';
  let { text }: { text: string } = $props();
</script>
<SectionHeader title={text} eyebrow />
