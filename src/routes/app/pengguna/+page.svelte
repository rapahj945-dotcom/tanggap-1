<script lang="ts">
  import { mobile } from '$lib/mode';
  import Mobile from '$lib/mobile/pengguna.svelte';
  import Desktop from '$lib/desktop/pengguna.svelte';
  let props = $props();
</script>

{#if mobile}<Mobile {...props} />{:else}<Desktop {...props} />{/if}
