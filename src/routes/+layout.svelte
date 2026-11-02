<script lang="ts">
  import '../app.css';
  import KoneksiPwa from '$lib/components/KoneksiPwa.svelte';
  let { children } = $props();
</script>

<svelte:head><title>TANGGAP – Lapor, pantau, tuntas</title></svelte:head>
{@render children()}
<KoneksiPwa />
