<script lang="ts">
  import Lajur from '$lib/components/Lajur.svelte';
  import Batang from '$lib/components/Batang.svelte';
  import Tren from '$lib/components/Tren.svelte';
  import { hariLalu, rupiah, rupiahRingkas, WARNA_STATUS } from '$lib/format';
  let { data } = $props();

  const total = $derived(data.mode === 'staf' ? data.perStatus.reduce((a: number, s: any) => a + s.nilai, 0) : 0);
  const urutStatus = ['Diterima', 'Diverifikasi', 'Ditangani', 'Survei', 'Perbaikan', 'Selesai', 'Ditolak'];
  const statusTersusun = $derived(
    data.mode === 'staf' ? urutStatus.map((s) => data.perStatus.find((x: any) => x.label === s)).filter(Boolean) as any[] : []
  );
</script>

<svelte:head><title>Ringkasan – TANGGAP</title></svelte:head>

{#if data.mode === 'warga'}
  {@const berjalan = data.saya.filter((l: any) => !['Selesai', 'Ditolak'].includes(l.status))}
  {@const belumDinilai = data.saya.filter((l: any) => l.status === 'Selesai' && !l.dinilai)}
  <header class="kepala">
    <h1>{berjalan.length ? `${berjalan.length} laporan Anda sedang ditangani.` : 'Tidak ada laporan yang berjalan.'}</h1>
    <p>
      {#if belumDinilai.length}Ada {belumDinilai.length} laporan selesai yang menunggu penilaian Anda.{:else}Halo, {data.user.nama.split(' ')[0]}. Lihat perkembangan terbaru di bawah.{/if}
    </p>
    <a class="btn utama" href="/app/laporan/baru">Buat laporan baru</a>
  </header>
  <hr class="marka" />
  <section class="daftar">
    <h2>Laporan Anda</h2>
    {#if data.saya.length === 0}
      <p class="kosong">Anda belum pernah melapor. Mulai dari masalah yang paling sering mengganggu di sekitar rumah.</p>
    {/if}
    <ul>
      {#each data.saya as l}
        <li>
          <a href={`/app/laporan/${l.id}`}>
            <span class="judul">{l.judul}</span>
            <span class="meta"><span class="num">{l.kode}</span>, {l.kategori}, diperbarui {hariLalu(l.updated_at)}</span>
          </a>
          <span class="kanan">
            {#if l.status === 'Selesai' && !l.dinilai}<a class="btn kecil" href={`/app/laporan/${l.id}#nilai`}>Beri nilai</a>{/if}
            <Lajur status={l.status} />
          </span>
        </li>
      {/each}
    </ul>
  </section>
{:else}
  {@const r = data.ringkas}
  <header class="kepala">
    <h1>{r.aktif} laporan sedang berjalan.</h1>
    <p>
      {#if r.menunggu_lama > 0}<b class="peringatan">{r.menunggu_lama} laporan</b> menunggu lebih dari tiga hari.{:else}Tidak ada laporan yang tertahan lebih dari tiga hari.{/if}
      {#if data.peran === 'admin' && r.belum_ditugaskan > 0} {r.belum_ditugaskan} belum punya petugas.{/if}
    </p>
  </header>

  <section class="strip" aria-label="Angka kunci">
    <p><b class="num">{r.masuk_bulan_ini}</b>masuk bulan ini</p>
    <p><b class="num">{r.selesai_bulan_ini}</b>selesai bulan ini</p>
    <p><b class="num">{r.rerata_hari}</b>hari rata-rata sampai selesai</p>
    <p><b class="num">{rupiahRingkas(Number(r.dana))}</b>dana perbaikan, {rupiahRingkas(Number(r.dana_bulan_ini))} bulan ini</p>
    <p><b class="num">{data.kepuasan?.rata ?? '–'}<small>/5</small></b>kepuasan dari {data.kepuasan?.n ?? 0} penilaian</p>
  </section>

  <div class="dua">
    <section class="antrean">
      <h2>{data.peran === 'admin' ? 'Antrean terlama' : 'Tugas Anda, terlama dulu'}</h2>
      {#if data.antrean.length === 0}
        <p class="kosong">Antrean kosong. Semua laporan sudah selesai atau ditolak.</p>
      {:else}
        <table>
          <thead><tr><th>Laporan</th><th>Status</th><th class="num">Umur</th></tr></thead>
          <tbody>
            {#each data.antrean as l}
              <tr>
                <td>
                  <a class="judul" href={`/app/laporan/${l.id}`}>{l.judul}</a><br />
                  <span class="meta"><span class="num">{l.kode}</span>, {l.kategori}{l.kecamatan ? ', ' + l.kecamatan : ''}{data.peran === 'admin' ? ', ' + (l.petugas ?? 'belum ada petugas') : ''}</span>
                </td>
                <td><Lajur status={l.status} /></td>
                <td class="num umur" class:lama={(Date.now() - new Date(l.created_at).getTime()) / 86400000 > 3}>{hariLalu(l.created_at)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </section>

    <div class="rel">
      <section>
        <h2>Posisi saat ini</h2>
        <div class="tumpuk" role="img" aria-label="Komposisi status laporan">
          {#each statusTersusun as s}<i style:flex={s.nilai} style:background={WARNA_STATUS[s.label]} title={`${s.label}: ${s.nilai}`}></i>{/each}
        </div>
        <ul class="legenda">
          {#each statusTersusun as s}
            <li><i style:background={WARNA_STATUS[s.label]}></i>{s.label}<b class="num">{s.nilai}</b></li>
          {/each}
        </ul>
        {#if total === 0}<p class="kosong">Belum ada laporan.</p>{/if}
      </section>
      <hr class="marka-tipis" />
      <section><h2>Enam bulan terakhir</h2><Tren data={data.tren} /></section>
      <hr class="marka-tipis" />
      <section><h2>Jenis masalah</h2><Batang data={data.perKategori.map((k: any) => ({ label: k.label, nilai: k.nilai, warna: k.warna }))} /></section>
      <hr class="marka-tipis" />
      <section><h2>Kecamatan</h2><Batang data={data.perKecamatan} /></section>
      <hr class="marka-tipis" />
      <section><h2>Dana per sumber</h2><Batang data={data.perSumber} format={(n) => rupiahRingkas(n).replace('Rp ', '')} /></section>
    </div>
  </div>
{/if}

<style>
  .kepala { display: grid; gap: 0.9rem; justify-items: start; padding-bottom: 1.5rem; max-width: 52rem; }
  h1 { font-size: var(--skala-6); font-weight: 800; font-variation-settings: 'wdth' 88; }
  .kepala p { font-size: var(--skala-3); color: var(--senyap); }
  .peringatan { color: var(--siaga); }
  h2 { font-size: var(--skala-3); font-weight: 700; margin-bottom: 0.85rem; font-variation-settings: 'wdth' 100; letter-spacing: 0; }

  .strip { display: flex; flex-wrap: wrap; border-top: 3px solid var(--aspal); border-bottom: 1px dashed var(--garis); margin-bottom: 2.5rem; }
  .strip p { flex: 1 1 11rem; padding: 1.1rem 1.25rem 1.1rem 0; font-size: var(--skala-1); color: var(--senyap); line-height: 1.35; }
  .strip p + p { padding-left: 1.25rem; border-left: 2px dashed var(--garis); }
  .strip b { display: block; font: 800 clamp(1.6rem, 2.4vw, 2.25rem)/1.05 var(--tampil); color: var(--aspal); margin-bottom: 0.25rem; white-space: nowrap; }
  .strip small { font-size: var(--skala-3); color: var(--senyap); font-weight: 600; }

  .dua { display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 4rem); align-items: start; }
  .rel { display: grid; gap: 1.5rem; border-left: 2px dashed var(--garis); padding-left: clamp(1.25rem, 3vw, 2.5rem); }
  .judul { font-weight: 600; font-size: var(--skala-3); }
  .meta { color: var(--senyap); font-size: var(--skala-1); }
  .umur { white-space: nowrap; font-size: var(--skala-1); color: var(--senyap); }
  .umur.lama { color: var(--siaga); font-weight: 700; }
  .kosong { color: var(--senyap); }

  .tumpuk { display: flex; gap: 2px; height: 16px; border: 2px solid var(--aspal); padding: 2px; }
  .tumpuk i { display: block; }
  .legenda { list-style: none; padding: 0; margin: 0.9rem 0 0; display: grid; gap: 0.3rem; font-size: var(--skala-1); }
  .legenda li { display: grid; grid-template-columns: 0.8rem 1fr auto; gap: 0.6rem; align-items: center; }
  .legenda i { width: 0.8rem; height: 0.8rem; display: block; }

  .daftar ul { list-style: none; padding: 0; margin: 0; }
  .daftar li { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 0.95rem 0; border-bottom: 1px dashed var(--garis); }
  .daftar li > a { text-decoration: none; display: grid; }
  .daftar li > a:hover .judul { text-decoration: underline; }
  .kanan { display: flex; align-items: center; gap: 1rem; }
  .daftar h2 { font-size: var(--skala-4); }

  @media (max-width: 1000px) { .dua { grid-template-columns: 1fr; } .rel { border-left: 0; padding-left: 0; } }
  @media (max-width: 640px) { .strip { display: grid; grid-template-columns: 1fr 1fr; } .strip p, .strip p + p { padding: 1rem 0.75rem 1rem 0; border-left: 0; border-bottom: 1px dashed var(--garis); } .strip p:last-child { grid-column: 1 / -1; } .daftar li { flex-direction: column; align-items: start; gap: 0.5rem; } }
</style>
