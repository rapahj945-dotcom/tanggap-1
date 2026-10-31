<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Lajur from '$lib/components/Lajur.svelte';
  import Peta from '$lib/components/Peta.svelte';
  import { Card, CardHeader, CardContent, List, ListInput, Sheet } from 'framework7-svelte';
  import { konfirm } from '$lib/f7';
  import { rupiah, tanggal, tanggalJam, WARNA_STATUS } from '$lib/format';
  let { data, form } = $props();
  const l = $derived(data.l);
  const staf = $derived(data.user.role !== 'warga');
  let statusBaru = $state('');
  $effect(() => { statusBaru = l.status; });
  let bintang = $state(0);
  let bukaUbah = $state(false);
</script>

<svelte:head><title>{l.kode} – TANGGAP</title></svelte:head>

{#if page.url.searchParams.get('baru')}
  <p class="pesan sukses" role="status">Laporan terkirim. Simpan nomor <b class="num">{l.kode}</b>, siapa saja bisa melacaknya lewat nomor ini.</p>
{/if}

<header class="kepala">
  <p class="kode num">{l.kode}</p>
  <h1>{l.judul}</h1>
  <Lajur status={l.status} besar />
</header>

<Card>
  <CardHeader>Rincian</CardHeader>
  <CardContent padding>
    <ul class="rincian">
      <li><span>Jenis</span><b>{l.kategori}</b></li>
      <li><span>Lokasi</span><b>{[l.alamat, l.desa, l.kecamatan].filter(Boolean).join(', ') || '–'}</b></li>
      <li><span>Pelapor</span><b>{l.pelapor}{l.hp_pelapor ? `, ${l.hp_pelapor}` : ''}</b></li>
      <li><span>Petugas</span><b>{l.petugas ?? 'Belum ditugaskan'}</b></li>
      <li><span>Dilaporkan</span><b>{tanggal(l.created_at)}</b></li>
      <li><span>Dana perbaikan</span><b>{l.dana ? `${rupiah(l.dana)}${l.sumber_dana ? ', ' + l.sumber_dana : ''}` : '–'}</b></li>
    </ul>
  </CardContent>
</Card>

<Card>
  <CardHeader>Uraian</CardHeader>
  <CardContent padding><p class="uraian">{l.uraian}</p></CardContent>
</Card>

{#if l.foto || l.foto_sesudah}
  <Card>
    <CardHeader>Foto</CardHeader>
    <CardContent padding>
      <div class="foto">
        {#if l.foto}<figure><img src={`/berkas/${l.foto}`} alt="Kondisi saat dilaporkan" /><figcaption>Saat dilaporkan</figcaption></figure>{/if}
        {#if l.foto_sesudah}<figure><img src={`/berkas/${l.foto_sesudah}`} alt="Kondisi setelah ditangani" /><figcaption>Setelah ditangani</figcaption></figure>{/if}
      </div>
    </CardContent>
  </Card>
{/if}

{#if l.lat != null && l.lng != null}
  <Card>
    <CardHeader>Lokasi di peta</CardHeader>
    <Peta titik={[{ id: l.id, kode: l.kode, judul: l.judul, lat: l.lat, lng: l.lng, warna: l.warna, status: l.status }]} tinggi="15rem" />
  </Card>
{/if}

<Card>
  <CardHeader>Riwayat</CardHeader>
  <CardContent padding>
    <ol class="linimasa">
      {#each data.riwayat as r}
        <li style:--w={WARNA_STATUS[r.status]}>
          <time class="num">{tanggalJam(r.created_at)}</time>
          <span><b>{r.status}</b>{#if r.catatan}, {r.catatan}{/if}</span>
          <em>oleh {r.oleh}</em>
        </li>
      {/each}
    </ol>
  </CardContent>
</Card>

{#if !staf}
  {#if l.status === 'Selesai'}
    <Card>
      <CardHeader>Penilaian Anda</CardHeader>
      <CardContent padding>
        <span id="nilai"></span>
        {#if data.nilai}
          <p class="bintang" aria-label={`Nilai ${data.nilai.nilai} dari 5`}>{'★'.repeat(data.nilai.nilai)}{'☆'.repeat(5 - data.nilai.nilai)}</p>
          {#if data.nilai.komentar}<p>{data.nilai.komentar}</p>{/if}
        {:else}
          <form method="POST" action="?/nilai" use:enhance class="isian">
            <fieldset>
              <legend class="bantu">Seberapa puas Anda dengan penanganannya?</legend>
              <div class="pilih">
                {#each [1, 2, 3, 4, 5] as n}
                  <label class:aktif={bintang >= n}><input type="radio" name="nilai" value={n} bind:group={bintang} required /><span aria-hidden="true">★</span><span class="sr">{n} dari 5</span></label>
                {/each}
              </div>
            </fieldset>
            <List class="form-list" strong><ListInput label="Komentar (opsional)" type="textarea" name="komentar" resizable /></List>
            {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
            {#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}
            <button class="btn-besar">Kirim penilaian</button>
          </form>
        {/if}
      </CardContent>
    </Card>
  {:else}
    <p class="bantu catatan">Anda akan tahu setiap perubahan status di riwayat. Setelah laporan selesai, Anda bisa memberi penilaian di sini.</p>
  {/if}
{:else}
  <div class="bar-aksi statis">
    <button class="btn-besar" onclick={() => (bukaUbah = true)}>Perbarui laporan</button>
    {#if data.user.role === 'admin'}
      <form method="POST" action="?/hapus" use:enhance={async ({ cancel }) => { if (!(await konfirm('Hapus laporan ini beserta riwayatnya? Tindakan ini tidak bisa dibatalkan.'))) cancel(); }}>
        <button class="btn-besar bahaya">Hapus laporan</button>
      </form>
    {/if}
  </div>

  <Sheet class="sheet-ubah" opened={bukaUbah} onSheetClosed={() => (bukaUbah = false)} swipeToClose backdrop style="height:85%">
    <div class="sheet-scroll">
      <form method="POST" action="?/status" enctype="multipart/form-data" class="sheet-isi" use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') bukaUbah = false; }}>
        <div class="sheet-judul"><b>Perbarui laporan</b></div>
        <List class="form-list" strong>
          <ListInput label="Status" type="select" name="status" value={statusBaru} onChange={(e: any) => (statusBaru = e.target.value)}>
            {#each data.statusBoleh as s}<option value={s}>{s}</option>{/each}
          </ListInput>
          {#if data.user.role === 'admin'}
            <ListInput label="Petugas" type="select" name="petugas_id" value={l.petugas_id ?? ''}>
              <option value="">Belum ditugaskan</option>{#each data.petugas as p}<option value={p.id}>{p.nama}</option>{/each}
            </ListInput>
          {/if}
          <ListInput label="Catatan untuk pelapor" type="textarea" name="catatan" resizable placeholder={statusBaru === 'Ditolak' ? 'Alasan penolakan (wajib)' : 'Apa yang sudah atau akan dilakukan'} />
          <ListInput label="Dana perbaikan (Rp)" type="text" name="dana" inputmode="numeric" value={l.dana ?? ''} placeholder="12500000" />
          <ListInput label="Sumber dana" type="text" name="sumber_dana" value={l.sumber_dana ?? ''} placeholder="APBD Kota, Dana Desa, CSR…" />
        </List>
        <div class="berkas"><label for="foto_sesudah">Foto setelah ditangani</label><input id="foto_sesudah" name="foto_sesudah" type="file" accept="image/jpeg,image/png,image/webp" /></div>
        {#if form?.galat}<p class="pesan galat" role="alert">{form.galat}</p>{/if}
        {#if form?.ok}<p class="pesan sukses" role="status">{form.ok}</p>{/if}
        <div class="sheet-tombol"><button class="btn-besar">Simpan perubahan</button></div>
      </form>
    </div>
  </Sheet>
{/if}

<style>
  .kepala { display: grid; gap: 0.7rem; padding: 0.5rem 0.25rem 0.75rem; }
  .kode { font: 700 var(--skala-2)/1 var(--tampil); color: var(--senyap); }
  h1 { font-size: clamp(1.8rem, 7vw, 2.5rem); font-weight: 800; font-variation-settings: 'wdth' 88; }
  .rincian b { font-weight: 600; }
  .uraian { font-size: var(--skala-3); margin: 0; }
  .foto { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem; }
  figure { margin: 0; }
  img { width: 100%; max-height: 18rem; object-fit: cover; display: block; border: 2px solid var(--aspal); }
  figcaption { font-size: var(--skala-1); color: var(--senyap); margin-top: 0.3rem; }
  fieldset { border: 0; padding: 0; margin: 0; }
  .pilih { display: flex; gap: 0.25rem; margin-top: 0.4rem; }
  .pilih label { font-size: 2.4rem; line-height: 1; cursor: pointer; color: var(--garis); }
  .pilih label.aktif { color: var(--rambu); -webkit-text-stroke: 2px var(--aspal); }
  .pilih input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .bintang { font-size: 1.8rem; color: var(--aspal); letter-spacing: 0.1em; }
  .catatan { padding: 0.5rem 0.25rem 1rem; }
  .sheet-scroll { height: 100%; overflow-y: auto; }
  .sheet-isi { padding: 0.25rem 1rem 1.5rem; }
  .sheet-judul { padding: 0.9rem 0.25rem; font: 800 1.15rem var(--tampil); }
  .sheet-tombol { padding: 0.9rem 0.25rem 0; }
  .berkas { display: grid; gap: 0.4rem; padding: 0.9rem 0.25rem 0; font-size: var(--skala-1); color: var(--senyap); font-weight: 700; }
  .berkas input { font: inherit; }
</style>
