<script lang="ts">
  import Merek from '$lib/components/Merek.svelte';
  import Lajur from '$lib/components/Lajur.svelte';
  import { rupiah, tanggal, tanggalJam } from '$lib/format';
  let { data } = $props();
  const l = $derived(data.l);
</script>

<svelte:head><title>{l.kode} – TANGGAP</title></svelte:head>
<header class="atas"><Merek /><a href="/masuk">Masuk</a></header>
<hr class="marka" />

<main>
  <p class="kode num">{l.kode}</p>
  <h1>{l.judul}</h1>
  <div class="lajur"><Lajur status={l.status} besar /></div>

  <dl>
    <div><dt>Kategori</dt><dd>{l.kategori}</dd></div>
    <div><dt>Lokasi</dt><dd>{[l.alamat, l.desa, l.kecamatan].filter(Boolean).join(', ') || '–'}</dd></div>
    <div><dt>Dilaporkan</dt><dd>{tanggal(l.created_at)}</dd></div>
    <div><dt>Petugas</dt><dd>{l.petugas ?? 'Belum ditugaskan'}</dd></div>
    {#if l.dana}<div><dt>Dana perbaikan</dt><dd>{rupiah(l.dana)}{l.sumber_dana ? `, ${l.sumber_dana}` : ''}</dd></div>{/if}
  </dl>

  <p class="uraian">{l.uraian}</p>

  {#if l.foto || l.foto_sesudah}
    <div class="foto">
      {#if l.foto}<figure><img src={`/berkas/${l.foto}`} alt="Kondisi saat dilaporkan" /><figcaption>Saat dilaporkan</figcaption></figure>{/if}
      {#if l.foto_sesudah}<figure><img src={`/berkas/${l.foto_sesudah}`} alt="Kondisi setelah ditangani" /><figcaption>Setelah ditangani</figcaption></figure>{/if}
    </div>
  {/if}

  <h2>Riwayat</h2>
  <ol>
    {#each data.riwayat as r}
      <li>
        <span class="waktu num">{tanggalJam(r.created_at)}</span>
        <span><b>{r.status}</b>{#if r.catatan}, {r.catatan}{/if}<span class="oleh"> oleh {r.oleh}</span></span>
      </li>
    {/each}
  </ol>
</main>

<style>
  .atas { display: flex; justify-content: space-between; align-items: center; padding: 1rem clamp(1rem, 4vw, 3rem); font-weight: 600; }
  main { max-width: 50rem; margin: 0 auto; padding: 3rem clamp(1rem, 4vw, 2rem) 5rem; display: grid; gap: 1.5rem; }
  .kode { font: 700 var(--skala-3)/1 var(--tampil); color: var(--senyap); }
  h1 { font-size: var(--skala-6); font-weight: 800; }
  dl { display: grid; margin: 0.5rem 0 0; border-top: 3px solid var(--aspal); }
  dl > div { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px dashed var(--garis); }
  dt { color: var(--senyap); font-size: var(--skala-1); font-weight: 600; padding-top: 0.15rem; }
  dd { margin: 0; }
  .uraian { font-size: var(--skala-3); max-width: 60ch; }
  .foto { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
  figure { margin: 0; }
  img { width: 100%; max-height: 22rem; object-fit: cover; display: block; border: 2px solid var(--aspal); }
  figcaption { font-size: var(--skala-1); color: var(--senyap); margin-top: 0.3rem; }
  h2 { font-size: var(--skala-4); margin-top: 1rem; }
  ol { list-style: none; padding: 0; margin: 0; border-left: 3px dashed var(--aspal); }
  ol li { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.7rem 0 0.7rem 1.25rem; position: relative; }
  ol li::before { content: ''; position: absolute; left: -8px; top: 1.05rem; width: 13px; height: 13px; background: var(--rambu); border: 3px solid var(--aspal); border-radius: 50%; }
  .waktu { color: var(--senyap); font-size: var(--skala-1); padding-top: 0.15rem; }
  .oleh { color: var(--senyap); font-size: var(--skala-1); }
  @media (max-width: 560px) { dl > div, ol li { grid-template-columns: 1fr; gap: 0.1rem; } }
</style>
