<script lang="ts">
  import { enhance } from '$app/forms';
  import { List, ListItem, ListInput, Sheet, Toggle } from 'framework7-svelte';
  import { tanggal, ROLE_LABEL } from '$lib/format';
  let { data, form } = $props();
  let edit = $state<any | null>(null);
  let tambah = $state(false);
  const WARNA: Record<string, string> = { admin: '#1b1f23', petugas: '#1f6f9c', warga: '#2f6b4f' };
</script>

<svelte:head><title>Pengguna – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>Pengguna</h1><span class="lencana num">{data.daftar.length}</span>
  <button class="tombol-tambah" onclick={() => (tambah = true)}>+ Tambah akun</button>
</div>

{#if form?.galat}<p class="pesan galat" role="alert">{form.galat}</p>{/if}
{#if form?.ok}<p class="pesan sukses" role="status">{form.ok}</p>{/if}

<List mediaList strong class="daftar-akun">
  {#each data.daftar as u (u.id)}
    <ListItem
      link="#"
      title={u.nama}
      subtitle={`${u.email}${u.no_hp ? ' · ' + u.no_hp : ''}`}
      text={`${u.laporan} laporan · bergabung ${tanggal(u.created_at)}`}
      after={ROLE_LABEL[u.role]}
      class={u.aktif ? 'akun' : 'akun nonaktif'}
      style={`--w:${WARNA[u.role]}`}
      onClick={(e: Event) => { e.preventDefault(); edit = u; }}
    />
  {/each}
</List>

<Sheet opened={!!edit} onSheetClosed={() => (edit = null)} swipeToClose backdrop style="height:auto">
  {#if edit}
    <form method="POST" action="?/ubah" class="sheet-isi" use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') edit = null; }}>
      <input type="hidden" name="id" value={edit.id} />
      <div class="sheet-judul"><b>{edit.nama}</b><span>{edit.email}</span></div>
      <List class="form-list" strong>
        <ListInput label="Peran" type="select" name="role" value={edit.role}>
          {#each Object.entries(ROLE_LABEL) as [k, v]}<option value={k}>{v}</option>{/each}
        </ListInput>
        <li><div class="item-content"><div class="item-inner"><div class="item-title">Akun aktif</div><div class="item-after"><Toggle name="aktif" checked={edit.aktif} /></div></div></div></li>
      </List>
      <div class="sheet-tombol"><button class="btn-besar">Simpan</button></div>
    </form>
  {/if}
</Sheet>

<Sheet opened={tambah} onSheetClosed={() => (tambah = false)} swipeToClose backdrop style="height:auto">
  <form method="POST" action="?/tambah" class="sheet-isi" use:enhance={() => async ({ result, update }) => { await update(); if (result.type === 'success') tambah = false; }}>
    <div class="sheet-judul"><b>Tambah akun</b></div>
    <List class="form-list" strong>
      <ListInput label="Nama" type="text" name="nama" required />
      <ListInput label="Email" type="email" name="email" required />
      <ListInput label="Nomor HP" type="tel" name="no_hp" />
      <ListInput label="Peran" type="select" name="role" value="petugas">
        <option value="petugas">Petugas lapangan</option><option value="admin">Administrator</option><option value="warga">Warga</option>
      </ListInput>
      <ListInput label="Kata sandi awal" type="password" name="sandi" minlength="8" required autocomplete="new-password" />
    </List>
    <div class="sheet-tombol"><button class="btn-besar">Buat akun</button></div>
  </form>
</Sheet>

<style>
  .tombol-tambah { margin-left: auto; background: var(--rambu); border: 2px solid var(--aspal); padding: 0.5rem 0.9rem; font: 800 0.8125rem var(--tampil); cursor: pointer; box-shadow: 3px 3px 0 var(--aspal); }
  .sheet-isi { padding: 0.25rem 1rem 1.25rem; }
  .sheet-judul { padding: 0.9rem 0.25rem; display: grid; gap: 0.1rem; font: 800 1.15rem var(--tampil); }
  .sheet-judul span { font: 400 0.8125rem var(--isi); color: var(--senyap); }
  .sheet-tombol { padding: 0.9rem 0.25rem 0; }
  :global(.akun .item-link) { border-left: 8px solid var(--w); }
  :global(.akun.nonaktif) { opacity: 0.5; }
  :global(.akun .item-title) { font: 800 1.05rem var(--tampil); }
</style>
