<script lang="ts">
  import { enhance, deserialize } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { List, ListGroup, ListItem, ListInput, Sheet, SwipeoutActions, SwipeoutButton, Block } from 'framework7-svelte';
  import { konfirm } from '$lib/f7';
  let { data, form } = $props();
  let mode = $state<'' | 'jenis' | 'kecamatan' | 'desa'>('');
  let info = $state('');

  // Hapus lewat geser: konfirmasi dulu, lalu kirim ke aksi server yang sama dengan versi desktop.
  const hapus = async (aksi: string, id: number, nama: string) => {
    if (!(await konfirm(`Hapus ${nama}?`))) return;
    const fd = new FormData(); fd.set('id', String(id));
    const r = await fetch(`?/${aksi}`, { method: 'POST', body: fd, headers: { 'x-sveltekit-action': 'true' } });
    const h = deserialize(await r.text());
    info = h.type === 'failure' ? String((h.data as any)?.galat ?? 'Gagal menghapus.') : h.type === 'success' ? String((h.data as any)?.ok ?? 'Terhapus.') : '';
    await invalidateAll();
  };
  const tutup = () => (mode = '');
  const kirim = () => async ({ result, update }: any) => { await update(); if (result.type === 'success') tutup(); };
</script>

<svelte:head><title>Data master – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>Data master</h1>
  <p>Jenis masalah dan wilayah yang muncul di formulir laporan. Geser ke kiri untuk menghapus.</p>
</div>

{#if form?.galat || info}<p class="pesan galat" role="alert">{form?.galat ?? info}</p>{/if}
{#if form?.ok}<p class="pesan sukses" role="status">{form.ok}</p>{/if}

<div class="block-title baris-judul">Jenis masalah <button class="tambah" onclick={() => (mode = 'jenis')}>+ Tambah</button></div>
<List mediaList strong>
  {#each data.kategori as k (k.id)}
    <ListItem swipeout title={k.nama} subtitle={k.deskripsi || 'Tanpa deskripsi'} text={`${k.dipakai} laporan`} class="jenis" style={`--w:${k.warna}`}>
      <SwipeoutActions right><SwipeoutButton overswipe color="red" onClick={() => hapus('hapusKategori', k.id, k.nama)}>Hapus</SwipeoutButton></SwipeoutActions>
    </ListItem>
  {/each}
</List>

<div class="block-title baris-judul">Wilayah
  <span><button class="tambah" onclick={() => (mode = 'kecamatan')}>+ Kecamatan</button> <button class="tambah" onclick={() => (mode = 'desa')}>+ Kelurahan</button></span>
</div>
<List strong class="wilayah">
  {#each data.kecamatan as kc (kc.id)}
    <ListGroup>
      <ListItem swipeout groupTitle title={kc.nama}>
        <SwipeoutActions right><SwipeoutButton overswipe color="red" onClick={() => hapus('hapusKecamatan', kc.id, kc.nama)}>Hapus</SwipeoutButton></SwipeoutActions>
      </ListItem>
      {#each data.desa.filter((d: any) => d.kecamatan_id === kc.id) as d (d.id)}
        <ListItem swipeout title={d.nama}>
          <SwipeoutActions right><SwipeoutButton overswipe color="red" onClick={() => hapus('hapusDesa', d.id, d.nama)}>Hapus</SwipeoutButton></SwipeoutActions>
        </ListItem>
      {/each}
    </ListGroup>
  {/each}
</List>
{#if data.kecamatan.length === 0}<Block><p>Belum ada wilayah.</p></Block>{/if}

<Sheet opened={mode === 'jenis'} onSheetClosed={tutup} swipeToClose backdrop style="height:auto">
  <form method="POST" action="?/tambahKategori" class="sheet-isi" use:enhance={kirim}>
    <div class="sheet-judul"><b>Tambah jenis masalah</b></div>
    <List class="form-list" strong>
      <ListInput label="Nama" type="text" name="nama" required />
      <ListInput label="Deskripsi" type="text" name="deskripsi" />
      <ListInput label="Warna di peta" type="color" name="warna" value="#c8501e" />
    </List>
    <div class="sheet-tombol"><button class="btn-besar">Tambah jenis</button></div>
  </form>
</Sheet>
<Sheet opened={mode === 'kecamatan'} onSheetClosed={tutup} swipeToClose backdrop style="height:auto">
  <form method="POST" action="?/tambahKecamatan" class="sheet-isi" use:enhance={kirim}>
    <div class="sheet-judul"><b>Tambah kecamatan</b></div>
    <List class="form-list" strong><ListInput label="Nama kecamatan" type="text" name="nama" required placeholder="Contoh: Menteng (Jakarta Pusat)" /></List>
    <div class="sheet-tombol"><button class="btn-besar">Tambah kecamatan</button></div>
  </form>
</Sheet>
<Sheet opened={mode === 'desa'} onSheetClosed={tutup} swipeToClose backdrop style="height:auto">
  <form method="POST" action="?/tambahDesa" class="sheet-isi" use:enhance={kirim}>
    <div class="sheet-judul"><b>Tambah kelurahan/desa</b></div>
    <List class="form-list" strong>
      <ListInput label="Kecamatan" type="select" name="kecamatan_id" required value="">
        <option value="">Pilih</option>{#each data.kecamatan as kc}<option value={String(kc.id)}>{kc.nama}</option>{/each}
      </ListInput>
      <ListInput label="Kelurahan/desa baru" type="text" name="nama" required />
    </List>
    <div class="sheet-tombol"><button class="btn-besar">Tambah kelurahan/desa</button></div>
  </form>
</Sheet>

<style>
  .baris-judul { display: flex; justify-content: space-between; align-items: center; }
  .tambah { background: var(--rambu); border: 2px solid var(--aspal); padding: 0.3rem 0.65rem; font: 800 0.75rem var(--tampil); cursor: pointer; box-shadow: 2px 2px 0 var(--aspal); text-transform: none; letter-spacing: 0; }
  .sheet-isi { padding: 0.25rem 1rem 1.25rem; }
  .sheet-judul { padding: 0.9rem 0.25rem; font: 800 1.15rem var(--tampil); }
  .sheet-tombol { padding: 0.9rem 0.25rem 0; }
  :global(.jenis .item-link), :global(.jenis .item-content) { border-left: 8px solid var(--w); }
  :global(.jenis .item-title) { font: 800 1.05rem var(--tampil); }
</style>
