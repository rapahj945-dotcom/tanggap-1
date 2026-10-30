<script lang="ts">
  import { enhance } from '$app/forms';
  import { JENIS_NOTIF, waktuLalu } from '$lib/format';
  let { data, form } = $props();
  const belum = $derived(data.daftar.filter((n: any) => !n.dibaca).length);
</script>

<svelte:head><title>Notifikasi – TANGGAP</title></svelte:head>
<header>
  <div><h1>Notifikasi</h1><p>{belum ? `${belum} belum dibaca.` : 'Semua sudah dibaca.'}</p></div>
  <div class="aksi">
    <form method="POST" action="?/semua" use:enhance><button class="btn kecil" disabled={!belum}>Tandai semua dibaca</button></form>
    <form method="POST" action="?/hapus" use:enhance><button class="btn kecil">Hapus yang sudah dibaca</button></form>
  </div>
</header>
<hr class="marka" />
{#if form?.ok}<p class="sukses" role="status">{form.ok}</p>{/if}

{#if data.daftar.length === 0}
  <p class="kosong">Belum ada pemberitahuan. Perubahan status, tugas baru, dan laporan masuk akan muncul di sini.</p>
{:else}
  <ul class="daftar">
    {#each data.daftar as n (n.id)}
      <li class:baru={!n.dibaca}>
        <a href={`/app/notifikasi/${n.id}`} data-sveltekit-reload>
          <span class="jenis">{JENIS_NOTIF[n.jenis] ?? 'Info'}</span>
          <span class="isi"><b>{n.judul}</b><span class="meta">{n.isi}</span></span>
          <span class="waktu meta">{waktuLalu(n.created_at)}</span>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  header { display: flex; justify-content: space-between; align-items: end; gap: 1rem; flex-wrap: wrap; padding-bottom: 1rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  header p, .meta { color: var(--senyap); font-size: var(--skala-1); }
  .aksi { display: flex; gap: 0.6rem; }
  .daftar { list-style: none; margin: 1rem 0 0; padding: 0; max-width: 60rem; }
  li { border-bottom: 1px dashed var(--senyap); }
  li a { display: grid; grid-template-columns: 7.5rem 1fr auto; gap: 1rem; align-items: baseline; padding: 0.85rem 0.75rem; border-left: 6px solid transparent; text-decoration: none; }
  li a:hover { background: var(--kapur-dalam); }
  li.baru a { border-left-color: var(--rambu); background: #fffdf0; }
  li.baru b::after { content: ''; display: inline-block; width: 0.55rem; height: 0.55rem; margin-left: 0.5rem; background: var(--rambu); border: 2px solid var(--aspal); border-radius: 50%; }
  li:not(.baru) b { font-weight: 600; }
  .jenis { font: 700 0.72rem var(--isi); letter-spacing: 0.06em; text-transform: uppercase; }
  .isi { display: grid; gap: 0.15rem; }
  .waktu { white-space: nowrap; }
  .kosong { margin-top: 2rem; max-width: 40rem; color: var(--senyap); }
  @media (max-width: 700px) { li a { grid-template-columns: 1fr auto; } .jenis { grid-column: 1 / -1; } }
</style>
