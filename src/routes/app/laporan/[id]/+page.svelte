<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/laporan-detail.svelte';
  import Desktop from '$lib/desktop/laporan-detail.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
