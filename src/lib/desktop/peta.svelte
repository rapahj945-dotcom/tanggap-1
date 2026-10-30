<script lang="ts">
  import Peta from '$lib/components/Peta.svelte';
  import { WARNA_STATUS } from '$lib/format';
  let { data } = $props();
</script>

<svelte:head><title>Peta – TANGGAP</title></svelte:head>
<header>
  <h1>{data.user.role === 'admin' ? 'Peta sebaran' : 'Peta tugas'}</h1>
  <p>{data.titik.length} laporan punya koordinat. Warna titik mengikuti status.</p>
</header>
<hr class="marka" />
{#key data.titik.length}<Peta titik={data.titik} tinggi="min(70vh, 40rem)" />{/key}
<ul class="legenda">
  {#each Object.entries(WARNA_STATUS) as [s, w]}<li><i style:background={w}></i>{s}</li>{/each}
</ul>

<style>
  header { display: grid; gap: 0.5rem; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  header p { color: var(--senyap); }
  .legenda { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; list-style: none; padding: 1rem 0; margin: 0; font-size: var(--skala-1); }
  .legenda li { display: flex; align-items: center; gap: 0.5rem; }
  .legenda i { width: 0.9rem; height: 0.9rem; border-radius: 50%; border: 2px solid var(--aspal); display: block; }
</style>
