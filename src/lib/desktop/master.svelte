<script lang="ts">
  import { enhance } from '$app/forms';
  let { data, form } = $props();
  const hapus = (apa: string) => ({ cancel }: { cancel: () => void }) => { if (!confirm(`Hapus ${apa}?`)) cancel(); };
</script>

<svelte:head><title>Data master – TANGGAP</title></svelte:head>
<header><h1>Data master</h1><p>Jenis masalah dan wilayah yang muncul di formulir laporan.</p></header>
<hr class="marka" />
{#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
{#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}

<div class="dua">
  <section>
    <h2>Jenis masalah</h2>
    <ul>
      {#each data.kategori as k}
        <li>
          <i style:background={k.warna}></i>
          <span><b>{k.nama}</b><br /><span class="meta">{k.deskripsi || 'Tanpa deskripsi'}, {k.dipakai} laporan</span></span>
          <form method="POST" action="?/hapusKategori" use:enhance={hapus(k.nama)}><input type="hidden" name="id" value={k.id} /><button class="btn kecil bahaya" aria-label={`Hapus ${k.nama}`}>Hapus</button></form>
        </li>
      {/each}
    </ul>
    <form method="POST" action="?/tambahKategori" use:enhance class="isian tambah">
      <div class="bidang"><label for="kn">Nama</label><input id="kn" name="nama" required /></div>
      <div class="bidang"><label for="kd">Deskripsi</label><input id="kd" name="deskripsi" /></div>
      <div class="bidang"><label for="kw">Warna di peta</label><input id="kw" name="warna" type="color" value="#c8501e" /></div>
      <div><button class="btn">Tambah jenis</button></div>
    </form>
  </section>

  <section>
    <h2>Wilayah</h2>
    {#each data.kecamatan as kc}
      <div class="kec">
        <div class="kepala-kec">
          <h3>{kc.nama}</h3>
          <form method="POST" action="?/hapusKecamatan" use:enhance={hapus(kc.nama)}><input type="hidden" name="id" value={kc.id} /><button class="btn kecil bahaya" aria-label={`Hapus ${kc.nama}`}>Hapus</button></form>
        </div>
        <ul class="desa">
          {#each data.desa.filter((d: any) => d.kecamatan_id === kc.id) as d}
            <li>
              <span>{d.nama}</span>
              <form method="POST" action="?/hapusDesa" use:enhance={hapus(d.nama)}><input type="hidden" name="id" value={d.id} /><button class="btn kecil bahaya" aria-label={`Hapus ${d.nama}`}>Hapus</button></form>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
    <form method="POST" action="?/tambahDesa" use:enhance class="isian tambah">
      <div class="bidang"><label for="dk">Kecamatan</label><select id="dk" name="kecamatan_id" required><option value="">Pilih</option>{#each data.kecamatan as kc}<option value={kc.id}>{kc.nama}</option>{/each}</select></div>
      <div class="bidang"><label for="dn">Kelurahan/desa baru</label><input id="dn" name="nama" required /></div>
      <div><button class="btn">Tambah kelurahan/desa</button></div>
    </form>
    <form method="POST" action="?/tambahKecamatan" use:enhance class="isian tambah">
      <div class="bidang"><label for="kcn">Kecamatan baru</label><input id="kcn" name="nama" required /></div>
      <div><button class="btn">Tambah kecamatan</button></div>
    </form>
  </section>
</div>

<style>
  header { display: grid; gap: 0.5rem; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  header p, .meta { color: var(--senyap); font-size: var(--skala-1); }
  .dua { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1.5rem, 4vw, 4rem); padding-top: 1.5rem; align-items: start; }
  h2 { font-size: var(--skala-4); margin-bottom: 1rem; }
  h3 { font-size: var(--skala-3); }
  ul { list-style: none; padding: 0; margin: 0; }
  li { display: grid; grid-template-columns: 0.9rem 1fr auto; gap: 0.9rem; align-items: center; padding: 0.7rem 0; border-bottom: 1px dashed var(--garis); }
  li i { width: 0.9rem; height: 0.9rem; border-radius: 50%; border: 2px solid var(--aspal); display: block; }
  .desa li { grid-template-columns: 1fr auto; padding-left: 1rem; }
  .kec { margin-bottom: 1.5rem; }
  .kepala-kec { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--aspal); padding-bottom: 0.4rem; }
  .tambah { margin-top: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); align-items: end; }
  input[type='color'] { height: 2.4rem; padding: 0; border: 2px solid var(--aspal); width: 4rem; cursor: pointer; }
  @media (max-width: 1000px) { .dua { grid-template-columns: 1fr; } }
</style>
