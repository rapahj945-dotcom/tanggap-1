<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/ringkasan.svelte';
  import Desktop from '$lib/desktop/ringkasan.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
