<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Lajur from '$lib/components/Lajur.svelte';
  import Peta from '$lib/components/Peta.svelte';
  import { Card, CardHeader, CardContent, List, ListInput, Sheet } from 'framework7-svelte';
  import { konfirm } from '$lib/f7';
  import { f7 } from 'framework7-svelte';
  import { rupiah, tanggal, tanggalJam, WARNA_STATUS } from '$lib/format';
  let { data, form } = $props();
  const l = $derived(data.l);
  const staf = $derived(data.user.role !== 'warga');
  let statusBaru = $state('');
  $effect(() => { statusBaru = l.status; });
  let bintang = $state(0);
  let bukaUbah = $state(false);
  const admin = $derived(data.user.role === 'admin');
  const F = (q: string) => `/app/laporan?${q}`;

  const salin = async (teks: string, pesan: string) => {
    try { await navigator.clipboard.writeText(teks); } catch {
      const t = document.createElement('textarea'); t.value = teks; document.body.append(t); t.select(); document.execCommand('copy'); t.remove();
    }
    f7.toast.show({ text: pesan, position: 'bottom', closeTimeout: 2000 });
  };
  const bagikan = async () => {
    const url = `${location.origin}/lacak/${l.kode}`;
    if (navigator.share) { try { await navigator.share({ title: l.kode, text: l.judul, url }); return; } catch { return; } }
    salin(url, 'Tautan pelacakan disalin');
  };
  const peta = $derived(
    l.lat != null && l.lng != null
      ? `https://www.google.com/maps?q=${l.lat},${l.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([l.alamat, l.desa, l.kecamatan].filter(Boolean).join(', '))}`
  );
  const adaLokasi = $derived(l.lat != null || [l.alamat, l.desa, l.kecamatan].some(Boolean));
  const nomorWa = $derived(l.hp_pelapor ? String(l.hp_pelapor).replace(/\D/g, '').replace(/^0/, '62') : '');
  const fotoList = $derived([
    l.foto && { url: `/berkas/${l.foto}`, caption: 'Saat dilaporkan' },
    l.foto_sesudah && { url: `/berkas/${l.foto_sesudah}`, caption: 'Setelah ditangani' }
  ].filter(Boolean) as { url: string; caption: string }[]);
  const bukaFoto = (i: number) => {
    const pb = f7.photoBrowser.create({ photos: fotoList, type: 'popup', theme: 'dark', navbarShowCount: fotoList.length > 1, toolbar: false, routableModals: false, popupCloseLinkText: 'Tutup' });
    pb.open(i);
  };
  const detailRiwayat = (r: any) =>
    f7.dialog.alert(`${r.catatan ? r.catatan + '<br><br>' : ''}<small>${tanggalJam(r.created_at)} · oleh ${r.oleh}${r.peran ? ' (' + r.peran + ')' : ''}</small>`, r.status);
</script>

<svelte:head><title>{l.kode} – TANGGAP</title></svelte:head>

{#if page.url.searchParams.get('baru')}
  <p class="pesan sukses" role="status">Laporan terkirim. Simpan nomor <b class="num">{l.kode}</b>, siapa saja bisa melacaknya lewat nomor ini.</p>
{/if}

<header class="kepala">
  <p class="kode num">
    <button type="button" class="chip" onclick={() => salin(l.kode, 'Nomor laporan disalin')} aria-label={`Salin nomor laporan ${l.kode}`}>{l.kode} <span aria-hidden="true">⧉</span></button>
    <button type="button" class="chip" onclick={bagikan}>Bagikan</button>
    <a class="chip external" href={`/lacak/${l.kode}`}>Halaman publik</a>
  </p>
  <h1>{l.judul}</h1>
  <a class="lajur-tap external" href={F(`status=${l.status}`)} aria-label={`Lihat semua laporan berstatus ${l.status}`}><Lajur status={l.status} besar /></a>
</header>

<Card>
  <CardHeader>Rincian</CardHeader>
  <CardContent padding>
    <ul class="rincian">
      <li><span>Jenis</span><b><a class="tap external" href={F(`kategori=${l.kategori_id}`)}>{l.kategori}</a></b></li>
      <li><span>Lokasi</span><b>
        {#if adaLokasi}<a class="tap external" href={peta} target="_blank" rel="noopener">{[l.alamat, l.desa, l.kecamatan].filter(Boolean).join(', ') || 'Buka di peta'} ↗</a>{:else}–{/if}
        {#if l.kecamatan_id}<br /><a class="kecil external" href={F(`kecamatan=${l.kecamatan_id}`)}>Laporan lain di {l.kecamatan.replace(/ \(.*\)$/, '')}</a>{/if}
      </b></li>
      <li><span>Pelapor</span><b>
        {#if admin}<a class="tap external" href={F(`pelapor=${l.pelapor_id}`)}>{l.pelapor}</a>{:else}{l.pelapor}{/if}
        {#if l.hp_pelapor}<br /><span class="kontak"><a class="chip external" href={`tel:${l.hp_pelapor}`}>Telepon {l.hp_pelapor}</a> <a class="chip external" href={`https://wa.me/${nomorWa}`} target="_blank" rel="noopener">WhatsApp</a></span>{/if}
      </b></li>
      <li><span>Petugas</span><b>
        {#if l.petugas && admin}<a class="tap external" href={F(`petugas=${l.petugas_id}`)}>{l.petugas}</a>
        {:else if l.petugas}{l.petugas}
        {:else if admin}<button type="button" class="tap-tombol" onclick={() => (bukaUbah = true)}>Belum ditugaskan, ketuk untuk menugaskan</button>
        {:else}Belum ditugaskan{/if}
      </b></li>
      <li><span>Dilaporkan</span><b><a class="tap external" href={F(`bulan=${new Date(l.created_at).toISOString().slice(0, 7)}`)}>{tanggal(l.created_at)}</a></b></li>
      <li><span>Dana perbaikan</span><b>
        {#if l.dana}<a class="tap external" href={F(`sumber=${encodeURIComponent(l.sumber_dana || 'Tanpa keterangan')}`)}>{rupiah(l.dana)}{l.sumber_dana ? ', ' + l.sumber_dana : ''}</a>
        {:else if staf}<button type="button" class="tap-tombol" onclick={() => (bukaUbah = true)}>Belum ada, ketuk untuk mengisi</button>{:else}–{/if}
      </b></li>
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
        {#if l.foto}<figure><button type="button" class="foto-tap" onclick={() => bukaFoto(0)} aria-label="Perbesar foto saat dilaporkan"><img src={`/berkas/${l.foto}`} alt="Kondisi saat dilaporkan" /></button><figcaption>Saat dilaporkan · ketuk untuk memperbesar</figcaption></figure>{/if}
        {#if l.foto_sesudah}<figure><button type="button" class="foto-tap" onclick={() => bukaFoto(l.foto ? 1 : 0)} aria-label="Perbesar foto setelah ditangani"><img src={`/berkas/${l.foto_sesudah}`} alt="Kondisi setelah ditangani" /></button><figcaption>Setelah ditangani · ketuk untuk memperbesar</figcaption></figure>{/if}
      </div>
    </CardContent>
  </Card>
{/if}

{#if l.lat != null && l.lng != null}
  <Card>
    <CardHeader>Lokasi di peta <a class="buka-peta external" href={peta} target="_blank" rel="noopener">Buka di aplikasi peta ↗</a></CardHeader>
    <Peta titik={[{ id: l.id, kode: l.kode, judul: l.judul, lat: l.lat, lng: l.lng, warna: l.warna, status: l.status }]} tinggi="15rem" />
  </Card>
{/if}

<Card>
  <CardHeader>Riwayat</CardHeader>
  <CardContent padding>
    <ol class="linimasa">
      {#each data.riwayat as r}
        <li style:--w={WARNA_STATUS[r.status]}>
          <button type="button" class="riwayat-tap" onclick={() => detailRiwayat(r)} aria-label={`Rincian status ${r.status}`}>
            <time class="num">{tanggalJam(r.created_at)}</time>
            <span><b>{r.status}</b>{#if r.catatan}, {r.catatan}{/if}</span>
            <em>oleh {r.oleh}</em>
          </button>
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
  .kode { font: 700 var(--skala-2)/1 var(--tampil); color: var(--senyap); display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; }
  .chip { display: inline-flex; align-items: center; gap: 0.3rem; min-height: 2.25rem; padding: 0 0.7rem; border: 2px solid var(--aspal); background: var(--kertas); color: var(--aspal); font: 700 0.75rem var(--isi); text-decoration: none; cursor: pointer; }
  .chip:active { background: var(--rambu); }
  .lajur-tap { display: block; color: inherit; text-decoration: none; }
  .tap { color: inherit; text-decoration: underline dotted; text-underline-offset: 0.25em; }
  .tap-tombol { background: none; border: 0; padding: 0; font: inherit; color: var(--rambu-tua, var(--aspal)); text-decoration: underline; text-align: left; cursor: pointer; min-height: 2rem; }
  .kecil { font-size: var(--skala-1); font-weight: 600; }
  .kontak { display: inline-flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem; }
  .foto-tap { display: block; width: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
  .buka-peta { margin-left: auto; font: 700 0.7rem var(--isi); text-transform: none; letter-spacing: 0; color: var(--aspal); }
  .riwayat-tap { display: grid; gap: 0.1rem; width: 100%; text-align: left; background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; min-height: 2.75rem; }
  .riwayat-tap:active { background: var(--garis); }
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
