<script lang="ts">
  import { enhance } from '$app/forms';
  import { tanggal, ROLE_LABEL } from '$lib/format';
  let { data, form } = $props();
</script>

<svelte:head><title>Pengguna – TANGGAP</title></svelte:head>
<header><h1>Pengguna</h1><p>{data.daftar.length} akun terdaftar.</p></header>
<hr class="marka" />

{#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
{#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}

<div class="gulir">
  <table>
    <thead><tr><th>Nama</th><th>Peran</th><th>Aktif</th><th class="num">Laporan</th><th>Bergabung</th><th></th></tr></thead>
    <tbody>
      {#each data.daftar as u}
        <tr>
          <td><b>{u.nama}</b><br /><span class="meta">{u.email}{u.no_hp ? ', ' + u.no_hp : ''}</span></td>
          <td colspan="3" class="sel">
            <form method="POST" action="?/ubah" use:enhance class="baris">
              <input type="hidden" name="id" value={u.id} />
              <select name="role" aria-label={`Peran ${u.nama}`}>{#each Object.entries(ROLE_LABEL) as [k, v]}<option value={k} selected={u.role === k}>{v}</option>{/each}</select>
              <label class="cek"><input type="checkbox" name="aktif" checked={u.aktif} /> Aktif</label>
              <span class="num meta">{u.laporan}</span>
              <button class="btn kecil">Simpan</button>
            </form>
          </td>
          <td class="meta">{tanggal(u.created_at)}</td>
          <td></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<h2>Tambah akun</h2>
<form method="POST" action="?/tambah" use:enhance class="isian tambah">
  <div class="bidang"><label for="nama">Nama</label><input id="nama" name="nama" required /></div>
  <div class="bidang"><label for="email">Email</label><input id="email" name="email" type="email" required /></div>
  <div class="bidang"><label for="no_hp">Nomor HP</label><input id="no_hp" name="no_hp" /></div>
  <div class="bidang"><label for="role">Peran</label><select id="role" name="role"><option value="petugas">Petugas lapangan</option><option value="admin">Administrator</option><option value="warga">Warga</option></select></div>
  <div class="bidang"><label for="sandi">Kata sandi awal</label><input id="sandi" name="sandi" type="password" minlength="8" required autocomplete="new-password" /></div>
  <div><button class="btn utama">Buat akun</button></div>
</form>

<style>
  header { display: grid; gap: 0.5rem; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  header p, .meta { color: var(--senyap); font-size: var(--skala-1); }
  .gulir { overflow-x: auto; margin-top: 1rem; }
  .sel { padding-right: 0; }
  .baris { display: flex; gap: 1rem; align-items: center; }
  .baris select { width: auto; min-width: 10rem; padding: 0.3rem 0; }
  .cek { display: flex; gap: 0.4rem; align-items: center; }
  h2 { font-size: var(--skala-4); margin: 3rem 0 1rem; }
  .tambah { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); align-items: end; max-width: 60rem; }
</style>
