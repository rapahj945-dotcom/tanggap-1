<script lang="ts">
  import Lajur from '$lib/components/Lajur.svelte';
  import { tanggal, rupiah } from '$lib/format';
  let { data } = $props();
  const judul = $derived(data.user.role === 'warga' ? 'Laporan saya' : data.user.role === 'petugas' ? 'Tugas saya' : 'Semua laporan');
  const tautan = (hal: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(data.filter)) if (v) p.set(k, v as string);
    if (hal > 1) p.set('hal', String(hal));
    return `?${p}`;
  };
  const eksporSp4n = $derived(`/app/laporan/ekspor-sp4n?${new URLSearchParams(Object.entries(data.filter).filter(([k, v]) => v && k !== 'q') as [string, string][])}`);
  const ekspor = $derived(`/app/laporan/ekspor?${new URLSearchParams(Object.entries(data.filter).filter(([, v]) => v) as [string, string][])}`);
</script>

<svelte:head><title>{judul} – TANGGAP</title></svelte:head>

<header class="kepala">
  <h1>{judul}</h1>
  <p>{data.total} laporan{data.total ? ' ditemukan' : ''}.</p>
  <span class="aksi">
    {#if data.user.role === 'warga'}<a class="btn utama" href="/app/laporan/baru">Buat laporan</a>{/if}
    {#if data.user.role !== 'warga'}<a class="btn" href={ekspor} download>Unduh CSV</a>{/if}
    {#if data.user.role === 'admin'}<a class="btn" href={eksporSp4n} download>Ekspor SP4N-LAPOR!</a>{/if}
  </span>
</header>
<hr class="marka" />

<form class="saring" method="GET">
  <div class="bidang"><label for="q">Cari</label><input id="q" name="q" value={data.filter.q} placeholder="Judul, nomor, atau alamat" /></div>
  <div class="bidang"><label for="status">Status</label>
    <select id="status" name="status"><option value="">Semua</option>{#each data.statusList as s}<option value={s} selected={data.filter.status === s}>{s}</option>{/each}</select></div>
  <div class="bidang"><label for="kategori">Jenis</label>
    <select id="kategori" name="kategori"><option value="">Semua</option>{#each data.kategoriList as k}<option value={k.id} selected={data.filter.kategori === String(k.id)}>{k.nama}</option>{/each}</select></div>
  <div class="bidang"><label for="kecamatan">Kecamatan</label>
    <select id="kecamatan" name="kecamatan"><option value="">Semua</option>{#each data.kecamatanList as k}<option value={k.id} selected={data.filter.kecamatan === String(k.id)}>{k.nama}</option>{/each}</select></div>
  <button class="btn">Terapkan</button>
</form>

{#if data.baris.length === 0}
  <p class="kosong">Tidak ada laporan yang cocok. {#if data.user.role === 'warga'}<a href="/app/laporan/baru">Buat laporan baru</a>.{:else}Longgarkan filter di atas.{/if}</p>
{:else}
  <div class="gulir">
    <table>
      <thead><tr><th>Laporan</th><th>Status</th><th>Petugas</th><th class="num">Dana</th><th class="num">Tanggal</th></tr></thead>
      <tbody>
        {#each data.baris as l}
          <tr>
            <td>
              <a class="judul" href={`/app/laporan/${l.id}`}>{l.judul}</a><br />
              <span class="meta"><i class="titik" style:background={l.warna}></i><span class="num">{l.kode}</span>, {l.kategori}{l.kecamatan ? ', ' + l.kecamatan : ''}</span>
            </td>
            <td><Lajur status={l.status} /></td>
            <td class="meta">{l.petugas ?? '–'}</td>
            <td class="num meta">{l.dana ? rupiah(l.dana) : '–'}</td>
            <td class="num meta">{tanggal(l.created_at)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if data.jumlahHal > 1}
    <nav class="hal" aria-label="Halaman">
      {#if data.hal > 1}<a href={tautan(data.hal - 1)}>Sebelumnya</a>{/if}
      <span class="num">Halaman {data.hal} dari {data.jumlahHal}</span>
      {#if data.hal < data.jumlahHal}<a href={tautan(data.hal + 1)}>Berikutnya</a>{/if}
    </nav>
  {/if}
{/if}

<style>
  .kepala { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem 1.5rem; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  .kepala p { color: var(--senyap); }
  .aksi { margin-left: auto; display: flex; gap: 0.75rem; }
  .saring { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 1.25rem; align-items: end; padding: 1.25rem 0 1.75rem; }
  .gulir { overflow-x: auto; }
  .judul { font-weight: 600; font-size: var(--skala-3); }
  .meta { color: var(--senyap); font-size: var(--skala-1); }
  .titik { display: inline-block; width: 0.6rem; height: 0.6rem; margin-right: 0.45rem; border-radius: 50%; }
  .kosong { color: var(--senyap); padding: 2rem 0; }
  .hal { display: flex; gap: 1.5rem; align-items: center; padding: 1.5rem 0; font-weight: 600; }
  .hal span { color: var(--senyap); font-weight: 400; }
  @media (max-width: 900px) { .saring { grid-template-columns: 1fr 1fr; } .saring .bidang:first-child { grid-column: 1 / -1; } }
</style>
