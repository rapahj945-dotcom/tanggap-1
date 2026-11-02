<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/master.svelte';
  import Desktop from '$lib/desktop/master.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
