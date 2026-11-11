<script lang="ts">
  import 'framework7/css/bundle';
  import '../../mobile.css';
  import Framework7 from 'framework7/bundle';
  import Framework7Svelte, { App, View, Page, Navbar, NavTitle, NavRight, Toolbar, Link } from 'framework7-svelte';
  import { page } from '$app/state';
  import { onNavigate } from '$app/navigation';
  import { ROLE_LABEL } from '$lib/format';
  Framework7.use(Framework7Svelte); // daftarkan plugin Svelte sebelum <App> dirender
  let { data, children } = $props();

  const menu = $derived(
    data.user.role === 'warga'
      ? [['/app', 'Ringkasan'], ['/app/laporan', 'Laporan'], ['/app/laporan/baru', 'Buat']]
      : data.user.role === 'petugas'
        ? [['/app', 'Ringkasan'], ['/app/laporan', 'Tugas'], ['/app/peta', 'Peta']]
        : [['/app', 'Ringkasan'], ['/app/laporan', 'Laporan'], ['/app/peta', 'Peta'], ['/app/pengguna', 'Pengguna'], ['/app/master', 'Master']]
  );
  const IKON: Record<string, string> = {
    '/app': 'M3 11l9-8 9 8M5 9.5V20h5v-6h4v6h5V9.5',
    '/app/laporan': 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    '/app/laporan/baru': 'M12 5v14M5 12h14',
    '/app/peta': 'M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
    '/app/pengguna': 'M16 20v-1.5a3.5 3.5 0 00-3.5-3.5h-5A3.5 3.5 0 004 18.5V20M10 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM20 20v-1.5a3.5 3.5 0 00-2.6-3.4M15 4.7a3.5 3.5 0 010 6.6',
    '/app/master': 'M5 21v-7M5 10V3M12 21v-9M12 8V3M19 21v-5M19 12V3M2 14h6M9 8h6M16 16h6'
  };
  const aktif = (h: string) => (h === '/app' ? page.url.pathname === '/app' : page.url.pathname.startsWith(h) && !(h === '/app/laporan' && page.url.pathname === '/app/laporan/baru'));

  onNavigate((nav) => {
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return new Promise((resolve) => { document.startViewTransition(async () => { resolve(); await nav.complete; }); });
  });
</script>

<App theme="auto" name="TANGGAP">
  <View main router={false} init={false}>
    <Page>
      <Navbar>
        <NavTitle><a class="beranda external" href="/app" aria-label="Ke ringkasan">TANGGAP <small>{ROLE_LABEL[data.user.role]}</small></a></NavTitle>
        <NavRight>
          <a class="lonceng external" href="/app/notifikasi" aria-label={`Notifikasi${data.belum ? `, ${data.belum} belum dibaca` : ''}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9a6 6 0 1112 0c0 5 2 6.5 2 6.5H4S6 14 6 9zM10 19a2 2 0 004 0" /></svg>
            {#if data.belum}<span class="titik">{data.belum > 99 ? '99+' : data.belum}</span>{/if}
          </a>
          <form method="POST" action="/keluar"><button class="keluar" aria-label="Keluar" title="Keluar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
          </button></form>
        </NavRight>
      </Navbar>
      <Toolbar tabbar icons bottom>
        {#each menu as [href, label]}
          <Link class="external" tabLink tabLinkActive={aktif(href)} {href}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={IKON[href]} /></svg>
            <span class="tabbar-label">{label}</span>
          </Link>
        {/each}
      </Toolbar>
      <div class="isi-tanggap">{@render children()}</div>
    </Page>
  </View>
</App>

<style>
  .beranda { color: inherit; text-decoration: none; }
  .keluar { background: none; border: 0; color: inherit; padding: 0.5rem; cursor: pointer; display: grid; place-items: center; }
  .keluar svg, :global(.toolbar .tab-link svg) { width: 1.5rem; height: 1.5rem; fill: none; stroke: currentColor; stroke-width: 2.1; stroke-linecap: round; stroke-linejoin: round; }
  small { font: 700 0.65rem var(--isi); letter-spacing: 0.08em; text-transform: uppercase; color: var(--rambu); margin-left: 0.5rem; }
  .isi-tanggap { padding: 1rem clamp(0.75rem, 3vw, 2rem) 2rem; max-width: 64rem; margin-inline: auto; }
</style>
