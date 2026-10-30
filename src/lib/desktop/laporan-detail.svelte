<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Lajur from '$lib/components/Lajur.svelte';
  import Peta from '$lib/components/Peta.svelte';
  import { rupiah, tanggal, tanggalJam, WARNA_STATUS } from '$lib/format';
  let { data, form } = $props();
  const l = $derived(data.l);
  const staf = $derived(data.user.role !== 'warga');
  let statusBaru = $state('');
  $effect(() => { statusBaru = l.status; });
  let bintang = $state(0);
</script>

<svelte:head><title>{l.kode} – TANGGAP</title></svelte:head>

{#if page.url.searchParams.get('baru')}
  <p class="info" role="status">Laporan terkirim. Simpan nomor <b class="num">{l.kode}</b>, siapa saja bisa melacaknya lewat nomor ini.</p>
{/if}

<header class="kepala">
  <p class="kode num">{l.kode}</p>
  <h1>{l.judul}</h1>
  <Lajur status={l.status} besar />
</header>

<div class="dua">
  <div class="utama">
    <dl>
      <div><dt>Jenis</dt><dd>{l.kategori}</dd></div>
      <div><dt>Lokasi</dt><dd>{[l.alamat, l.desa, l.kecamatan].filter(Boolean).join(', ') || '–'}</dd></div>
      <div><dt>Pelapor</dt><dd>{l.pelapor}{l.hp_pelapor ? `, ${l.hp_pelapor}` : ''}</dd></div>
      <div><dt>Petugas</dt><dd>{l.petugas ?? 'Belum ditugaskan'}</dd></div>
      <div><dt>Dilaporkan</dt><dd>{tanggal(l.created_at)}</dd></div>
      <div><dt>Dana perbaikan</dt><dd>{l.dana ? `${rupiah(l.dana)}${l.sumber_dana ? ', ' + l.sumber_dana : ''}` : '–'}</dd></div>
    </dl>

    <p class="uraian">{l.uraian}</p>

    {#if l.foto || l.foto_sesudah}
      <div class="foto">
        {#if l.foto}<figure><img src={`/berkas/${l.foto}`} alt="Kondisi saat dilaporkan" /><figcaption>Saat dilaporkan</figcaption></figure>{/if}
        {#if l.foto_sesudah}<figure><img src={`/berkas/${l.foto_sesudah}`} alt="Kondisi setelah ditangani" /><figcaption>Setelah ditangani</figcaption></figure>{/if}
      </div>
    {/if}

    {#if l.lat != null && l.lng != null}
      <Peta titik={[{ id: l.id, kode: l.kode, judul: l.judul, lat: l.lat, lng: l.lng, warna: l.warna, status: l.status }]} tinggi="16rem" />
    {/if}

    <h2>Riwayat</h2>
    <ol>
      {#each data.riwayat as r}
        <li style:--w={WARNA_STATUS[r.status]}>
          <span class="waktu num">{tanggalJam(r.created_at)}</span>
          <span><b>{r.status}</b>{#if r.catatan}, {r.catatan}{/if}<span class="oleh"> oleh {r.oleh}</span></span>
        </li>
      {/each}
    </ol>
  </div>

  <aside class="tindakan">
    {#if staf}
      <h2>Perbarui laporan</h2>
      <form method="POST" action="?/status" enctype="multipart/form-data" class="isian" use:enhance>
        <div class="bidang">
          <label for="status">Status</label>
          <select id="status" name="status" bind:value={statusBaru}>{#each data.statusBoleh as s}<option value={s}>{s}</option>{/each}</select>
        </div>
        {#if data.user.role === 'admin'}
          <div class="bidang">
            <label for="petugas_id">Petugas</label>
            <select id="petugas_id" name="petugas_id"><option value="">Belum ditugaskan</option>{#each data.petugas as p}<option value={p.id} selected={p.id === l.petugas_id}>{p.nama}</option>{/each}</select>
          </div>
        {/if}
        <div class="bidang"><label for="catatan">Catatan untuk pelapor</label><textarea id="catatan" name="catatan" rows="3" placeholder={statusBaru === 'Ditolak' ? 'Alasan penolakan (wajib)' : 'Apa yang sudah atau akan dilakukan'}></textarea></div>
        <div class="bidang"><label for="dana">Dana perbaikan (Rp)</label><input id="dana" name="dana" inputmode="numeric" value={l.dana ?? ''} placeholder="12500000" /></div>
        <div class="bidang"><label for="sumber_dana">Sumber dana</label>
          <input id="sumber_dana" name="sumber_dana" list="sumber" value={l.sumber_dana ?? ''} />
          <datalist id="sumber"><option>APBD Kota</option><option>APBD Provinsi</option><option>Dana Desa</option><option>Dinas Lingkungan Hidup</option><option>Tanggap Darurat</option><option>CSR</option></datalist>
        </div>
        <div class="bidang"><label for="foto_sesudah">Foto setelah ditangani</label><input id="foto_sesudah" name="foto_sesudah" type="file" accept="image/jpeg,image/png,image/webp" /></div>
        {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
        {#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}
        <div><button class="btn utama">Simpan perubahan</button></div>
      </form>
      {#if data.user.role === 'admin'}
        <hr class="marka-tipis" />
        <form method="POST" action="?/hapus" use:enhance={({ cancel }) => { if (!confirm('Hapus laporan ini beserta riwayatnya? Tindakan ini tidak bisa dibatalkan.')) cancel(); }}>
          <button class="btn kecil bahaya">Hapus laporan</button>
        </form>
      {/if}
    {:else if l.status === 'Selesai'}
      <h2 id="nilai">Penilaian Anda</h2>
      {#if data.nilai}
        <p class="bintang" aria-label={`Nilai ${data.nilai.nilai} dari 5`}>{'★'.repeat(data.nilai.nilai)}{'☆'.repeat(5 - data.nilai.nilai)}</p>
        {#if data.nilai.komentar}<p>{data.nilai.komentar}</p>{/if}
      {:else}
        <form method="POST" action="?/nilai" class="isian" use:enhance>
          <fieldset>
            <legend class="bantu">Seberapa puas Anda dengan penanganannya?</legend>
            <div class="pilih">
              {#each [1, 2, 3, 4, 5] as n}
                <label class:aktif={bintang >= n}><input type="radio" name="nilai" value={n} bind:group={bintang} required /><span aria-hidden="true">★</span><span class="sr">{n} dari 5</span></label>
              {/each}
            </div>
          </fieldset>
          <div class="bidang"><label for="komentar">Komentar (opsional)</label><textarea id="komentar" name="komentar" rows="3"></textarea></div>
          {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
          {#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}
          <div><button class="btn utama">Kirim penilaian</button></div>
        </form>
      {/if}
    {:else}
      <h2>Apa selanjutnya?</h2>
      <p class="bantu">Anda akan tahu setiap perubahan status di riwayat. Setelah laporan selesai, Anda bisa memberi penilaian di sini.</p>
    {/if}
  </aside>
</div>

<style>
  .info { background: var(--rambu); padding: 0.9rem 1.1rem; margin-bottom: 1.5rem; font-weight: 600; border-left: 6px solid var(--aspal); }
  .kepala { display: grid; gap: 0.9rem; padding-bottom: 1.5rem; max-width: 52rem; }
  .kode { font: 700 var(--skala-3)/1 var(--tampil); color: var(--senyap); }
  h1 { font-size: var(--skala-6); font-weight: 800; font-variation-settings: 'wdth' 88; }
  h2 { font-size: var(--skala-4); margin: 1.5rem 0 0.75rem; }
  .tindakan h2 { margin-top: 0; font-size: var(--skala-3); }
  .dua { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 4rem); align-items: start; border-top: 3px solid var(--aspal); padding-top: 1.5rem; }
  .utama { display: grid; gap: 1.25rem; }
  dl { display: grid; margin: 0; }
  dl > div { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px dashed var(--garis); }
  dt { color: var(--senyap); font-size: var(--skala-1); font-weight: 600; padding-top: 0.15rem; }
  dd { margin: 0; }
  .uraian { font-size: var(--skala-3); max-width: 62ch; }
  .foto { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
  figure { margin: 0; }
  img { width: 100%; max-height: 22rem; object-fit: cover; display: block; border: 2px solid var(--aspal); }
  figcaption { font-size: var(--skala-1); color: var(--senyap); margin-top: 0.3rem; }
  ol { list-style: none; padding: 0; margin: 0; border-left: 3px dashed var(--aspal); }
  ol li { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.6rem 0 0.6rem 1.25rem; position: relative; }
  ol li::before { content: ''; position: absolute; left: -8px; top: 0.95rem; width: 13px; height: 13px; background: var(--w, var(--rambu)); border: 3px solid var(--aspal); border-radius: 50%; }
  .waktu { color: var(--senyap); font-size: var(--skala-1); padding-top: 0.15rem; }
  .oleh { color: var(--senyap); font-size: var(--skala-1); }
  .tindakan { border-left: 2px dashed var(--garis); padding-left: clamp(1.25rem, 3vw, 2.5rem); position: sticky; top: 1rem; }
  fieldset { border: 0; padding: 0; margin: 0; }
  .pilih { display: flex; gap: 0.25rem; margin-top: 0.4rem; }
  .pilih label { font-size: 2.2rem; line-height: 1; cursor: pointer; color: var(--garis); }
  .pilih label.aktif { color: var(--rambu); -webkit-text-stroke: 2px var(--aspal); }
  .pilih input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .pilih label:focus-within { outline: 3px solid var(--aspal); }
  .bintang { font-size: 1.8rem; color: var(--aspal); letter-spacing: 0.1em; }
  @media (max-width: 1000px) { .dua { grid-template-columns: 1fr; } .tindakan { border-left: 0; padding-left: 0; position: static; border-top: 2px dashed var(--garis); padding-top: 1.5rem; } }
  @media (max-width: 560px) { dl > div, ol li { grid-template-columns: 1fr; gap: 0.1rem; } }
</style>
