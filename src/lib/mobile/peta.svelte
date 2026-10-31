<script lang="ts">
  import Peta from '$lib/components/Peta.svelte';
  import { List } from 'framework7-svelte';
  import KartuLaporan from '$lib/components/KartuLaporan.svelte';
  import { WARNA_STATUS } from '$lib/format';
  let { data } = $props();
</script>

<svelte:head><title>Peta – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>{data.user.role === 'admin' ? 'Peta sebaran' : 'Peta tugas'}</h1><span class="lencana num">{data.titik.length}</span>
  <p>Jabodetabek · laporan yang punya koordinat. Warna titik mengikuti status; ketuk titik untuk membuka laporan.</p>
</div>

<div class="kotak-peta">
  {#key data.titik.length}<Peta titik={data.titik} tinggi="min(62vh, 38rem)" />{/key}
</div>
<ul class="legenda" aria-label="Legenda status">
  {#each Object.entries(WARNA_STATUS) as [s, w]}<li><i style:background={w}></i>{s}</li>{/each}
</ul>

<div class="block-title">Laporan di peta</div>
<List mediaList strong class="daftar-laporan">
  {#each data.titik as l (l.id)}<KartuLaporan {l} />{/each}
</List>

<style>
  .kotak-peta { border: 2px solid var(--aspal); box-shadow: 4px 4px 0 var(--aspal); }
  .kotak-peta :global(.peta) { border: 0; }
  .legenda { display: flex; gap: 0.5rem; overflow-x: auto; list-style: none; padding: 0.9rem 0.25rem 0.25rem; margin: 0; scrollbar-width: none; }
  .legenda::-webkit-scrollbar { display: none; }
  .legenda li { flex: none; display: flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.7rem; border: 2px solid var(--aspal); background: var(--kertas); font: 700 0.75rem var(--isi); }
  .legenda i { width: 0.8rem; height: 0.8rem; border-radius: 50%; border: 2px solid var(--aspal); display: block; }
</style>
