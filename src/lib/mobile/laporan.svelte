<script lang="ts">
  import KartuLaporan from '$lib/components/KartuLaporan.svelte';
  import { Searchbar, List, ListGroup, ListItem, ListInput, Sheet, Block, f7 } from 'framework7-svelte';
  import { invalidateAll } from '$app/navigation';
  import { deserialize } from '$app/forms';
  import { tanggal, rupiah, hariLalu } from '$lib/format';
  let { data } = $props();
  let bukaFilter = $state(false);
  const jumlahFilter = $derived([data.filter.status, data.filter.kategori, data.filter.kecamatan].filter(Boolean).length);
  // Filter tambahan dari ringkasan/detail/master/pengguna; tiap chip bisa diketuk untuk dilepas.
  const NAMA_FILTER: Record<string, string> = {
    aktif: 'Sedang berjalan', lama: 'Menunggu > 3 hari', belum: 'Belum ada petugas', selesaibln: 'Selesai bulan ini',
    masukbln: 'Masuk bulan ini', berdana: 'Ada dana perbaikan'
  };
  const chip = $derived.by(() => {
    const f = data.filter as Record<string, string>;
    const out: { k: string; teks: string }[] = [];
    if (f.status) out.push({ k: 'status', teks: `Status: ${f.status}` });
    if (f.kategori) out.push({ k: 'kategori', teks: `Jenis: ${data.kategoriList.find((x: any) => String(x.id) === f.kategori)?.nama ?? f.kategori}` });
    if (f.kecamatan) out.push({ k: 'kecamatan', teks: `Kecamatan: ${(data.kecamatanList.find((x: any) => String(x.id) === f.kecamatan)?.nama ?? f.kecamatan).replace(/ \(.*\)$/, '')}` });
    if (f.desa) out.push({ k: 'desa', teks: 'Kelurahan/desa dipilih' });
    if (f.petugas) out.push({ k: 'petugas', teks: 'Petugas dipilih' });
    if (f.pelapor) out.push({ k: 'pelapor', teks: 'Pelapor dipilih' });
    if (f.bulan) out.push({ k: 'bulan', teks: `Bulan ${f.bulan}` });
    if (f.sumber) out.push({ k: 'sumber', teks: `Sumber dana: ${f.sumber}` });
    for (const k of Object.keys(NAMA_FILTER)) if (f[k]) out.push({ k, teks: NAMA_FILTER[k] });
    return out;
  });
  const tanpa = (k: string) => {
    const p = new URLSearchParams();
    for (const [kk, v] of Object.entries(data.filter)) if (v && kk !== k) p.set(kk, v as string);
    return `?${p}`;
  };
  const tersembunyiKeys = ['desa', 'petugas', 'pelapor', 'bulan', 'sumber', ...Object.keys(NAMA_FILTER)];
  const judul = $derived(data.user.role === 'warga' ? 'Laporan saya' : data.user.role === 'petugas' ? 'Tugas saya' : 'Semua laporan');
  const tautan = (hal: number) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(data.filter)) if (v) p.set(k, v as string);
    if (hal > 1) p.set('hal', String(hal));
    return `?${p}`;
  };
  // Hapus dengan geser: sembunyikan dulu, hapus sungguhan setelah 4 detik kecuali dibatalkan (Urungkan).
  let tersembunyi = $state<number[]>([]);
  let menunggu: { id: number; timer: ReturnType<typeof setTimeout>; toast: { close: () => void } } | null = null;
  const tampil = $derived(data.baris.filter((b: { id: number }) => !tersembunyi.includes(b.id)));
  const kirimHapus = async (id: number) => {
    const fd = new FormData(); fd.set('id', String(id));
    const r = await fetch('?/hapus', { method: 'POST', body: fd, headers: { 'x-sveltekit-action': 'true' } });
    const hasil = deserialize(await r.text());
    if (hasil.type !== 'success') tersembunyi = tersembunyi.filter((x) => x !== id);
    await invalidateAll();
    tersembunyi = tersembunyi.filter((x) => x !== id);
  };
  // Hapus ditunda 4 detik; toast bawaan Framework7 menyediakan tombol Urungkan.
  const hapusGeser = (l: { id: number; judul: string }) => {
    if (menunggu) { clearTimeout(menunggu.timer); kirimHapus(menunggu.id); menunggu.toast.close(); }
    tersembunyi = [...tersembunyi, l.id];
    const t = f7.toast.create({
      text: `“${l.judul}” dihapus`, position: 'bottom', closeButton: true, closeButtonText: 'Urungkan', closeButtonColor: 'yellow', closeTimeout: 4000,
      on: { closeButtonClick: () => { if (menunggu) clearTimeout(menunggu.timer); tersembunyi = tersembunyi.filter((x) => x !== l.id); menunggu = null; } }
    });
    t.open();
    menunggu = { id: l.id, toast: t, timer: setTimeout(() => { kirimHapus(l.id); menunggu = null; }, 4000) };
  };
  // Kelompokkan per periode; pergantian periode ditandai pembatas marka.
  const kelompok = $derived.by(() => {
    const out: { label: string; items: any[] }[] = [];
    let n = 0;
    for (const l of tampil) {
      const h = Math.floor((Date.now() - new Date(l.created_at).getTime()) / 86400000);
      const label = h <= 7 ? 'Pekan ini' : h <= 31 ? 'Bulan ini' : 'Lebih lama';
      let g = out.find((x) => x.label === label);
      if (!g) out.push((g = { label, items: [] }));
      g.items.push({ ...l, n: n++ });
    }
    return out;
  });
  const eksporSp4n = $derived(`/app/laporan/ekspor-sp4n?${new URLSearchParams(Object.entries(data.filter).filter(([k, v]) => v && k !== 'q') as [string, string][])}`);
  const ekspor = $derived(`/app/laporan/ekspor?${new URLSearchParams(Object.entries(data.filter).filter(([, v]) => v) as [string, string][])}`);
</script>

<svelte:head><title>{judul} – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>{judul}</h1>
  <span class="lencana num">{data.total}</span>
  <span class="aksi">
    {#if data.user.role === 'warga'}<a class="btn utama" href="/app/laporan/baru">Buat laporan</a>{/if}
    {#if data.user.role !== 'warga'}<a class="btn kecil" href={ekspor} download>Unduh CSV</a>{/if}
    {#if data.user.role === 'admin'}<a class="btn kecil" href={eksporSp4n} download>Ekspor SP4N-LAPOR!</a>{/if}
  </span>
</div>

<div class="cari-baris">
  <Searchbar searchContainer=".daftar-laporan" searchIn=".item-title, .item-header, .item-subtitle" placeholder="Cari judul, nomor, atau alamat" disableButton={false} />
  <button type="button" class="tombol-filter" class:aktif={jumlahFilter > 0} onclick={() => (bukaFilter = true)}>
    Filter{#if jumlahFilter}<i class="num">{jumlahFilter}</i>{/if}
  </button>
</div>
{#if chip.length}
  <div class="chips" aria-label="Filter aktif">
    {#each chip as c}<a href={tanpa(c.k)} aria-label={`Lepas filter ${c.teks}`}>{c.teks}<b aria-hidden="true">×</b></a>{/each}
    {#if chip.length > 1}<a class="semua" href="/app/laporan">Hapus semua</a>{/if}
  </div>
{/if}
<List class="searchbar-not-found" strong inset><ListItem title="Tidak ada laporan yang cocok" /></List>

{#if data.baris.length === 0}
  <Block><p class="kosong">Tidak ada laporan yang cocok. {#if data.user.role === 'warga'}<a href="/app/laporan/baru">Buat laporan baru</a>.{:else}Longgarkan filter.{/if}</p></Block>
{:else}
  <List mediaList class="daftar-laporan search-list searchbar-found" strong>
    {#each kelompok as g (g.label)}
      <ListGroup>
        <ListItem groupTitle title={g.label} />
        {#each g.items as l (l.id)}
          <KartuLaporan {l} onHapus={data.user.role === 'admin' ? hapusGeser : undefined} />
        {/each}
      </ListGroup>
    {/each}
  </List>
  {#if data.jumlahHal > 1}
    <nav class="hal" aria-label="Halaman">
      {#if data.hal > 1}<a href={tautan(data.hal - 1)}>Sebelumnya</a>{/if}
      <span class="num">Halaman {data.hal} dari {data.jumlahHal}</span>
      {#if data.hal < data.jumlahHal}<a href={tautan(data.hal + 1)}>Berikutnya</a>{/if}
    </nav>
  {/if}
{/if}

<Sheet class="sheet-filter" opened={bukaFilter} onSheetClosed={() => (bukaFilter = false)} swipeToClose backdrop style="height:auto">
  <form method="GET" class="sheet-isi" onsubmit={() => (bukaFilter = false)}>
    {#each tersembunyiKeys as k}{#if (data.filter as any)[k]}<input type="hidden" name={k} value={(data.filter as any)[k]} />{/if}{/each}
    <div class="sheet-judul"><b>Saring laporan</b><a class="reset external" href="/app/laporan" onclick={() => (bukaFilter = false)}>Atur ulang</a></div>
    <List class="form-list">
      <ListInput label="Status" type="select" name="status" value={data.filter.status}>
        <option value="">Semua</option>{#each data.statusList as s}<option value={s}>{s}</option>{/each}
      </ListInput>
      <ListInput label="Jenis" type="select" name="kategori" value={data.filter.kategori}>
        <option value="">Semua</option>{#each data.kategoriList as k}<option value={String(k.id)}>{k.nama}</option>{/each}
      </ListInput>
      <ListInput label="Kecamatan" type="select" name="kecamatan" value={data.filter.kecamatan}>
        <option value="">Semua</option>{#each data.kecamatanList as k}<option value={String(k.id)}>{k.nama}</option>{/each}
      </ListInput>
    </List>
    <div class="sheet-tombol"><button class="btn-besar">Terapkan</button></div>
    {#if data.user.role !== 'warga'}
      <div class="unduh">
        <a class="btn-besar" href={ekspor} download>Unduh CSV</a>
        {#if data.user.role === 'admin'}<a class="btn-besar" href={eksporSp4n} download>Ekspor SP4N-LAPOR!</a>{/if}
      </div>
    {/if}
  </form>
</Sheet>

<style>
  .aksi { margin-left: auto; }
  @media (max-width: 600px) { .aksi { display: none; } }
  .chips { display: flex; gap: 0.4rem; flex-wrap: wrap; padding: 0.6rem 0.25rem 0; }
  .chips a { display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2.25rem; padding: 0 0.7rem; border: 2px solid var(--aspal); background: var(--rambu); color: var(--aspal); font: 700 0.75rem var(--isi); text-decoration: none; }
  .chips a b { font-size: 1rem; line-height: 1; }
  .chips a.semua { background: var(--kertas); }
  .unduh { display: grid; gap: 0.5rem; padding: 0.5rem 0.25rem 0; }
  .unduh a { text-align: center; }
  .kosong { color: var(--senyap); }
  .hal { display: flex; gap: 1.5rem; align-items: center; padding: 1rem 0.25rem; font-weight: 600; }
  .cari-baris { display: flex; align-items: center; gap: 0.5rem; }
  .cari-baris :global(.searchbar) { flex: 1; min-width: 0; }
  .tombol-filter { flex: none; display: inline-flex; align-items: center; gap: 0.4rem; background: var(--aspal); color: var(--kapur); border: 2px solid var(--aspal); padding: 0 0.9rem; height: 2.6rem; font: 700 0.8125rem var(--isi); cursor: pointer; box-shadow: 3px 3px 0 var(--rambu); }
  .tombol-filter.aktif { background: var(--rambu); color: var(--aspal); box-shadow: 3px 3px 0 var(--aspal); }
  .tombol-filter i { font-style: normal; background: var(--aspal); color: var(--rambu); border-radius: 999px; min-width: 1.15rem; height: 1.15rem; display: grid; place-items: center; font-size: 0.7rem; }
  .sheet-isi { padding: 0.5rem 1rem 1rem; }
  .sheet-judul { display: flex; justify-content: space-between; align-items: baseline; padding: 0.75rem 0.25rem; font: 800 1.1rem var(--tampil); }
  .reset { font: 600 0.8125rem var(--isi); }
  .sheet-tombol { padding: 0.75rem 0.25rem 0; }
</style>
