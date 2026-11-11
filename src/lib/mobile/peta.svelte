<script lang="ts">
  import Peta from '$lib/components/Peta.svelte';
  import { List } from 'framework7-svelte';
  import KartuLaporan from '$lib/components/KartuLaporan.svelte';
  import { WARNA_STATUS } from '$lib/format';
  let { data } = $props();
  // Ketuk legenda untuk menyaring titik per status (ketuk lagi untuk melepas).
  let pilih = $state<string[]>([]);
  const alih = (st: string) => (pilih = pilih.includes(st) ? pilih.filter((x) => x !== st) : [...pilih, st]);
  const tampil = $derived(pilih.length ? data.titik.filter((t: any) => pilih.includes(t.status)) : data.titik);
  const hitung = (st: string) => data.titik.filter((t: any) => t.status === st).length;
</script>

<svelte:head><title>Peta – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>{data.user.role === 'admin' ? 'Peta sebaran' : 'Peta tugas'}</h1><span class="lencana num">{tampil.length}</span>
  <p>Jabodetabek · laporan yang punya koordinat. Warna titik mengikuti status; ketuk titik untuk membuka laporan.</p>
</div>

<div class="kotak-peta">
  {#key tampil.map((t: any) => t.id).join()}<Peta titik={tampil} tinggi="min(62vh, 38rem)" />{/key}
</div>
<ul class="legenda" aria-label="Legenda status">
  {#each Object.entries(WARNA_STATUS) as [s, w]}
    <li><button type="button" class:aktif={pilih.includes(s)} aria-pressed={pilih.includes(s)} onclick={() => alih(s)}><i style:background={w}></i>{s}<span class="num">{hitung(s)}</span></button></li>
  {/each}
  {#if pilih.length}<li><button type="button" class="reset" onclick={() => (pilih = [])}>Tampilkan semua</button></li>{/if}
</ul>

<div class="block-title">Laporan di peta</div>
<List mediaList strong class="daftar-laporan">
  {#each tampil as l (l.id)}<KartuLaporan {l} />{/each}
</List>

<style>
  .kotak-peta { border: 2px solid var(--aspal); box-shadow: 4px 4px 0 var(--aspal); }
  .kotak-peta :global(.peta) { border: 0; }
  .legenda { display: flex; gap: 0.5rem; overflow-x: auto; list-style: none; padding: 0.9rem 0.25rem 0.25rem; margin: 0; scrollbar-width: none; }
  .legenda::-webkit-scrollbar { display: none; }
  .legenda li { flex: none; }
  .legenda button { display: flex; align-items: center; gap: 0.4rem; min-height: 2.5rem; padding: 0.3rem 0.7rem; border: 2px solid var(--aspal); background: var(--kertas); color: var(--aspal); font: 700 0.75rem var(--isi); cursor: pointer; }
  .legenda button.aktif { background: var(--rambu); box-shadow: 2px 2px 0 var(--aspal); }
  .legenda button.reset { background: var(--aspal); color: var(--kapur); }
  .legenda .num { opacity: 0.6; }
  .legenda i { width: 0.8rem; height: 0.8rem; border-radius: 50%; border: 2px solid var(--aspal); display: block; }
</style>
