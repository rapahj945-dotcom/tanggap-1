<script lang="ts">
  import { enhance } from '$app/forms';
  import { List, ListGroup, ListItem } from 'framework7-svelte';
  import { JENIS_NOTIF, waktuLalu } from '$lib/format';
  let { data, form } = $props();
  const belum = $derived(data.daftar.filter((n: any) => !n.dibaca));
  const dibaca = $derived(data.daftar.filter((n: any) => n.dibaca));
</script>

<svelte:head><title>Notifikasi – TANGGAP</title></svelte:head>

<div class="judul-halaman">
  <h1>Notifikasi</h1>{#if belum.length}<span class="lencana num">{belum.length}</span>{/if}
  <form method="POST" action="?/semua" use:enhance class="tombol-tambah-form"><button class="tombol-tambah" disabled={!belum.length}>Tandai dibaca</button></form>
</div>
{#if form?.ok}<p class="pesan sukses" role="status">{form.ok}</p>{/if}

{#if data.daftar.length === 0}
  <p class="pesan">Belum ada pemberitahuan. Perubahan status, tugas baru, dan laporan masuk akan muncul di sini.</p>
{:else}
  <List mediaList strong class="daftar-notif">
    {#if belum.length}
      <ListGroup>
        <ListItem groupTitle title="Belum dibaca" />
        {#each belum as n (n.id)}
          <ListItem external link={`/app/notifikasi/${n.id}`} header={JENIS_NOTIF[n.jenis] ?? 'Info'} title={n.judul} text={n.isi} after={waktuLalu(n.created_at)} class="notif baru" />
        {/each}
      </ListGroup>
    {/if}
    {#if dibaca.length}
      <ListGroup>
        <ListItem groupTitle title="Sudah dibaca" />
        {#each dibaca as n (n.id)}
          <ListItem external link={`/app/notifikasi/${n.id}`} header={JENIS_NOTIF[n.jenis] ?? 'Info'} title={n.judul} text={n.isi} after={waktuLalu(n.created_at)} class="notif" />
        {/each}
      </ListGroup>
    {/if}
  </List>
  {#if dibaca.length}
    <form method="POST" action="?/hapus" use:enhance class="hapus-dibaca"><button>Hapus yang sudah dibaca</button></form>
  {/if}
{/if}
