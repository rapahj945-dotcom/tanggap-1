<script lang="ts">
  import { goto } from '$app/navigation';
  import Merek from '$lib/components/Merek.svelte';
  import Lajur from '$lib/components/Lajur.svelte';
  import { hariLalu, rupiahRingkas } from '$lib/format';
  let { data } = $props();
  let kode = $state('');
  const cari = (e: SubmitEvent) => {
    e.preventDefault();
    if (kode.trim()) goto(`/lacak/${encodeURIComponent(kode.trim().toUpperCase())}`);
  };
</script>

<header class="atas">
  <Merek />
  <nav>
    <a href="/masuk">Masuk</a>
    <a href="/daftar" class="btn kecil utama">Daftar</a>
  </nav>
</header>
<hr class="marka" />

<main>
  <section class="pembuka">
    <h1>Jalan berlubang? Lampu padam? Laporkan, lalu lihat siapa yang menanganinya.</h1>
    <form class="lacak" onsubmit={cari}>
      <div class="bidang">
        <label for="kode">Sudah punya nomor laporan?</label>
        <input id="kode" bind:value={kode} placeholder="TGP-261024-0001" autocomplete="off" />
      </div>
      <button class="btn utama">Lacak laporan</button>
    </form>
    <p class="aksi">Belum melapor? <a href="/daftar">Buat akun</a> dan kirim laporan pertama Anda dalam dua menit.</p>
  </section>

  <section class="angka" aria-label="Ringkasan layanan">
    <p><b class="num">{data.ringkas?.total}</b> laporan masuk</p>
    <p><b class="num">{data.ringkas?.selesai}</b> sudah selesai</p>
    <p><b class="num">{data.ringkas?.rerata_hari}</b> hari rata-rata penyelesaian</p>
    <p><b class="num">{rupiahRingkas(Number(data.ringkas?.dana ?? 0))}</b> dana perbaikan tercatat</p>
  </section>

  <section class="terbaru">
    <h2>Laporan terbaru di wilayah Anda</h2>
    <ul>
      {#each data.terbaru as l}
        <li>
          <a href={`/lacak/${l.kode}`}>
            <span class="judul">{l.judul}</span>
            <span class="meta">{l.kategori}{l.kecamatan ? ', ' + l.kecamatan : ''}, {hariLalu(l.created_at)}</span>
          </a>
          <Lajur status={l.status} />
        </li>
      {/each}
    </ul>
  </section>
</main>

<footer>
  <hr class="marka-tipis" />
  <p>TANGGAP, kanal pengaduan warga. Setiap laporan punya nomor dan riwayat yang bisa dibuka siapa saja.</p>
</footer>

<style>
  .atas { display: flex; justify-content: space-between; align-items: center; padding: 1rem clamp(1rem, 4vw, 3rem); }
  nav { display: flex; gap: 1.25rem; align-items: center; font-weight: 600; }
  main { padding: 0 clamp(1rem, 4vw, 3rem); max-width: 78rem; margin: 0 auto; }
  .pembuka { padding: clamp(2.5rem, 8vw, 6rem) 0 3rem; display: grid; gap: 2rem; max-width: 56rem; }
  h1 { font-size: var(--skala-6); font-weight: 800; font-variation-settings: 'wdth' 88; }
  .lacak { display: flex; gap: 1.25rem; align-items: end; flex-wrap: wrap; }
  .lacak .bidang { flex: 1 1 18rem; }
  .lacak input { font-size: var(--skala-4); font-family: var(--tampil); font-weight: 700; }
  .aksi { color: var(--senyap); }
  .angka { display: flex; flex-wrap: wrap; border-top: 3px solid var(--aspal); border-bottom: 1px dashed var(--garis); }
  .angka p { flex: 1 1 12rem; padding: 1.25rem 1.5rem 1.25rem 0; color: var(--senyap); font-size: var(--skala-1); }
  .angka p + p { padding-left: 1.5rem; border-left: 2px dashed var(--garis); }
  .angka b { display: block; font: 800 var(--skala-5)/1.05 var(--tampil); color: var(--aspal); }
  .terbaru { padding: 3rem 0; }
  .terbaru h2 { font-size: var(--skala-4); margin-bottom: 1rem; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 0.9rem 0; border-bottom: 1px dashed var(--garis); }
  li a { text-decoration: none; display: grid; }
  li a:hover .judul { text-decoration: underline; }
  .judul { font-weight: 600; font-size: var(--skala-3); }
  .meta { color: var(--senyap); font-size: var(--skala-1); }
  footer { padding: 0 clamp(1rem, 4vw, 3rem) 3rem; max-width: 78rem; margin: 0 auto; color: var(--senyap); font-size: var(--skala-1); }
  footer p { padding-top: 1rem; }
  @media (max-width: 640px) { .angka p + p { border-left: 0; padding-left: 0; } li { flex-direction: column; align-items: start; gap: 0.5rem; } }
</style>
