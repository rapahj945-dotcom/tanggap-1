<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/laporan-baru.svelte';
  import Desktop from '$lib/desktop/laporan-baru.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
