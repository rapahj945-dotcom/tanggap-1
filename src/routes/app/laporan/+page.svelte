<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/laporan.svelte';
  import Desktop from '$lib/desktop/laporan.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
