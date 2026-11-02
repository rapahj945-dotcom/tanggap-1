<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/notifikasi.svelte';
  import Desktop from '$lib/desktop/notifikasi.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
