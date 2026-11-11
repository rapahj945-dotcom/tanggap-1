<script lang="ts">
  import { enhance, deserialize } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import { List, ListGroup, ListItem, ListInput, Sheet, SwipeoutActions, SwipeoutButton, Block } from 'framework7-svelte';
  import { konfirm } from '$lib/f7';
  import { f7 } from 'framework7-svelte';
  import { goto } from '$app/navigation';
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
  // Ketuk baris: menu aksi (lihat laporan terkait / hapus), supaya tidak hanya bergantung pada geser.
  const menu = (judul: string, lihat: string, aksi: string, id: number, e?: Event) => {
    e?.preventDefault();
    f7.actions.create({
      buttons: [
        { text: judul, label: true },
        { text: 'Lihat laporan terkait', onClick: () => goto(`/app/laporan?${lihat}`) },
        { text: 'Hapus', color: 'red', onClick: () => hapus(aksi, id, judul) },
        { text: 'Batal', color: 'red' }
      ]
    }).open();
  };
  const tutup = () => (mode = '');
  const kirim = () => async ({ result, update }: any) => { await update(); if (result.type === 'success') tutup(); };
</script>

<svelte:head><title>Data master – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>Data master</h1>
  <p>Jenis masalah dan wilayah yang muncul di formulir laporan. Ketuk baris untuk membuka laporan terkait atau menghapus.</p>
</div>

{#if form?.galat || info}<p class="pesan galat" role="alert">{form?.galat ?? info}</p>{/if}
{#if form?.ok}<p class="pesan sukses" role="status">{form.ok}</p>{/if}

<div class="block-title baris-judul">Jenis masalah <button class="tambah" onclick={() => (mode = 'jenis')}>+ Tambah</button></div>
<List mediaList strong>
  {#each data.kategori as k (k.id)}
    <ListItem swipeout link="#" onClick={(e: Event) => menu(k.nama, `kategori=${k.id}`, 'hapusKategori', k.id, e)} title={k.nama} subtitle={k.deskripsi || 'Tanpa deskripsi'} text={`${k.dipakai} laporan`} class="jenis" style={`--w:${k.warna}`}>
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
      <li class="list-group-title judul-kec"><button type="button" onclick={(e) => menu(kc.nama, `kecamatan=${kc.id}`, 'hapusKecamatan', kc.id, e)}>{kc.nama} <span aria-hidden="true">⋯</span></button></li>
      {#each data.desa.filter((d: any) => d.kecamatan_id === kc.id) as d (d.id)}
        <ListItem swipeout link="#" onClick={(e: Event) => menu(d.nama, `desa=${d.id}`, 'hapusDesa', d.id, e)} title={d.nama}>
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
  .judul-kec button { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: 0; padding: 0.5rem 0; font: inherit; color: inherit; text-align: left; cursor: pointer; min-height: 2.75rem; }
  .baris-judul { display: flex; justify-content: space-between; align-items: center; }
  .tambah { background: var(--rambu); border: 2px solid var(--aspal); padding: 0.3rem 0.65rem; font: 800 0.75rem var(--tampil); cursor: pointer; box-shadow: 2px 2px 0 var(--aspal); text-transform: none; letter-spacing: 0; }
  .sheet-isi { padding: 0.25rem 1rem 1.25rem; }
  .sheet-judul { padding: 0.9rem 0.25rem; font: 800 1.15rem var(--tampil); }
  .sheet-tombol { padding: 0.9rem 0.25rem 0; }
  :global(.jenis .item-link), :global(.jenis .item-content) { border-left: 8px solid var(--w); }
  :global(.jenis .item-title) { font: 800 1.05rem var(--tampil); }
</style>
