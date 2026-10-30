<script lang="ts">
  import { page } from '$app/state';
  import Merek from '$lib/components/Merek.svelte';
  import { ROLE_LABEL } from '$lib/format';
  let { data, children } = $props();

  const menu = $derived(
    data.user.role === 'warga'
      ? [['/app', 'Ringkasan'], ['/app/laporan', 'Laporan saya'], ['/app/laporan/baru', 'Buat laporan']]
      : data.user.role === 'petugas'
        ? [['/app', 'Ringkasan'], ['/app/laporan', 'Tugas saya'], ['/app/peta', 'Peta tugas']]
        : [['/app', 'Ringkasan'], ['/app/laporan', 'Semua laporan'], ['/app/peta', 'Peta sebaran'], ['/app/pengguna', 'Pengguna'], ['/app/master', 'Data master']]
  );
  const aktif = (h: string) => (h === '/app' ? page.url.pathname === '/app' : page.url.pathname.startsWith(h) && !(h === '/app/laporan' && page.url.pathname === '/app/laporan/baru'));
</script>

<div class="kerangka">
  <aside>
    <Merek />
    <nav aria-label="Menu utama">
      {#each menu as [href, label]}
        <a {href} aria-current={aktif(href) ? 'page' : undefined}>{label}</a>
      {/each}
      <a href="/app/notifikasi" aria-current={page.url.pathname.startsWith('/app/notifikasi') ? 'page' : undefined}>Notifikasi{#if data.belum}<span class="lencana" aria-label={`${data.belum} belum dibaca`}>{data.belum > 99 ? '99+' : data.belum}</span>{/if}</a>
    </nav>
    <div class="akun">
      <hr class="marka-tipis" />
      <p><b>{data.user.nama}</b><br /><span>{ROLE_LABEL[data.user.role]}</span></p>
      <form method="POST" action="/keluar"><button class="btn kecil">Keluar</button></form>
    </div>
  </aside>
  <main>{@render children()}</main>
</div>

<style>
  .kerangka { display: grid; grid-template-columns: 15rem 1fr; min-height: 100vh; }
  aside { position: sticky; top: 0; height: 100vh; padding: 1.5rem 1.25rem; display: flex; flex-direction: column; gap: 2rem; border-right: 3px dashed var(--aspal); }
  nav { display: grid; gap: 0.15rem; }
  nav a { text-decoration: none; padding: 0.55rem 0.75rem; margin: 0 -0.75rem; font-weight: 600; border-left: 5px solid transparent; }
  .lencana { margin-left: 0.5rem; padding: 0.05rem 0.5rem; border-radius: 999px; background: var(--aspal); color: var(--rambu); font: 800 0.75rem var(--tampil); }
  nav a:hover { background: var(--kapur-dalam); }
  nav a[aria-current='page'] { border-left-color: var(--rambu); background: var(--kapur-dalam); }
  .akun { margin-top: auto; display: grid; gap: 0.75rem; font-size: var(--skala-1); }
  .akun span { color: var(--senyap); }
  main { padding: clamp(1.25rem, 3vw, 3rem); min-width: 0; max-width: 84rem; width: 100%; }
  @media (max-width: 860px) {
    .kerangka { grid-template-columns: 1fr; }
    aside { position: static; height: auto; border-right: 0; border-bottom: 3px dashed var(--aspal); flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0.75rem 1.5rem; padding: 1rem; }
    nav { display: flex; flex-wrap: wrap; gap: 0 0.5rem; order: 3; width: 100%; }
    nav a { margin: 0; border-left: 0; border-bottom: 4px solid transparent; padding: 0.4rem 0.25rem; }
    nav a[aria-current='page'] { border-bottom-color: var(--rambu); background: none; }
    .akun { margin: 0 0 0 auto; display: flex; align-items: center; gap: 1rem; }
    .akun hr, .akun span { display: none; }
  }
</style>
