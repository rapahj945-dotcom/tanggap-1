<script lang="ts">
  import { onMount } from 'svelte';
  import { dev } from '$app/environment';

  let offline = $state(false);
  let pasang = $state<any>(null);

  onMount(() => {
    offline = !navigator.onLine;
    const naik = () => (offline = false);
    const turun = () => (offline = true);
    const sebelumPasang = (e: Event) => { e.preventDefault(); pasang = e; };
    const terpasang = () => (pasang = null);
    addEventListener('online', naik);
    addEventListener('offline', turun);
    addEventListener('beforeinstallprompt', sebelumPasang);
    addEventListener('appinstalled', terpasang);
    // Service worker hanya didaftarkan pada build produksi agar tidak mengganggu mode dev.
    if (!dev && 'serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    return () => {
      removeEventListener('online', naik);
      removeEventListener('offline', turun);
      removeEventListener('beforeinstallprompt', sebelumPasang);
      removeEventListener('appinstalled', terpasang);
    };
  });

  async function pasangSekarang() {
    if (!pasang) return;
    pasang.prompt();
    await pasang.userChoice;
    pasang = null;
  }
</script>

{#if offline}
  <div class="spanduk" role="status">Anda sedang offline. Halaman yang pernah dibuka tetap bisa dilihat; mengirim data butuh internet.</div>
{/if}
{#if pasang}
  <button class="pasang" type="button" onclick={pasangSekarang}>Pasang aplikasi</button>
{/if}

<style>
  .spanduk { position: fixed; inset: auto 0 0 0; z-index: 99999; background: #1b1f23; color: #fff; padding: 0.7rem 1rem; font: 600 0.85rem/1.4 system-ui, sans-serif; text-align: center; padding-bottom: calc(0.7rem + env(safe-area-inset-bottom, 0px)); }
  .pasang { position: fixed; right: 1rem; bottom: 5rem; z-index: 99998; padding: 0.65rem 1.1rem; background: #f5c400; color: #1b1f23; border: 2px solid #1b1f23; font: 700 0.9rem system-ui, sans-serif; cursor: pointer; }
</style>
