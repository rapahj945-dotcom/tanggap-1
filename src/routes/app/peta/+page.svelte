<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/peta.svelte';
  import Desktop from '$lib/desktop/peta.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
