<script lang="ts">
  import KartuLaporan from '$lib/components/KartuLaporan.svelte';
  import { List, Card, CardHeader, CardContent, Block } from 'framework7-svelte';
  import Batang from '$lib/components/Batang.svelte';
  import Tren from '$lib/components/Tren.svelte';
  import { rupiahRingkas, WARNA_STATUS } from '$lib/format';
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
  <section class="hero">
    <h1>{berjalan.length ? `${berjalan.length} laporan Anda sedang ditangani.` : 'Tidak ada laporan yang berjalan.'}</h1>
    <p>{#if belumDinilai.length}Ada {belumDinilai.length} laporan selesai yang menunggu penilaian Anda.{:else}Halo, {data.user.nama.split(' ')[0]}. Lihat perkembangan terbaru di bawah.{/if}</p>
    <a class="btn-besar" href="/app/laporan/baru">Buat laporan baru</a>
  </section>
  <div class="block-title">Laporan Anda</div>
  {#if data.saya.length === 0}
    <Block><p class="kosong">Anda belum pernah melapor. Mulai dari masalah yang paling sering mengganggu di sekitar rumah.</p></Block>
  {:else}
    <List mediaList strong class="daftar-laporan">
      {#each data.saya as l (l.id)}<KartuLaporan {l} />{/each}
    </List>
  {/if}
{:else}
  {@const r = data.ringkas}
  <section class="hero">
    <h1>{r.aktif} laporan sedang berjalan.</h1>
    <p>
      {#if r.menunggu_lama > 0}<b class="peringatan">{r.menunggu_lama} laporan</b> menunggu lebih dari tiga hari.{:else}Tidak ada laporan yang tertahan lebih dari tiga hari.{/if}
      {#if data.peran === 'admin' && r.belum_ditugaskan > 0} {r.belum_ditugaskan} belum punya petugas.{/if}
    </p>
  </section>

  <section class="strip-angka" aria-label="Angka kunci">
    <p><b class="num">{r.masuk_bulan_ini}</b>masuk bulan ini</p>
    <p><b class="num">{r.selesai_bulan_ini}</b>selesai bulan ini</p>
    <p><b class="num">{r.rerata_hari}</b>hari rata-rata sampai selesai</p>
    <p><b class="num">{rupiahRingkas(Number(r.dana))}</b>dana perbaikan, {rupiahRingkas(Number(r.dana_bulan_ini))} bulan ini</p>
    <p><b class="num">{data.kepuasan?.rata ?? '–'}<small>/5</small></b>kepuasan dari {data.kepuasan?.n ?? 0} penilaian</p>
  </section>

  <div class="block-title">{data.peran === 'admin' ? 'Antrean terlama' : 'Tugas Anda, terlama dulu'}</div>
  {#if data.antrean.length === 0}
    <Block><p class="kosong">Antrean kosong. Semua laporan sudah selesai atau ditolak.</p></Block>
  {:else}
    <List mediaList strong class="daftar-laporan">
      {#each data.antrean as l (l.id)}
        <KartuLaporan {l} ekstra={data.peran === 'admin' ? ' · ' + (l.petugas ?? 'belum ada petugas') : ''} />
      {/each}
    </List>
  {/if}

  <Card>
    <CardHeader>Posisi saat ini</CardHeader>
    <CardContent padding>
      <div class="tumpuk" role="img" aria-label="Komposisi status laporan">
        {#each statusTersusun as s}<i style:flex={s.nilai} style:background={WARNA_STATUS[s.label]} title={`${s.label}: ${s.nilai}`}></i>{/each}
      </div>
      <ul class="legenda">
        {#each statusTersusun as s}<li><i style:background={WARNA_STATUS[s.label]}></i>{s.label}<b class="num">{s.nilai}</b></li>{/each}
      </ul>
      {#if total === 0}<p class="kosong">Belum ada laporan.</p>{/if}
    </CardContent>
  </Card>
  <Card><CardHeader>Enam bulan terakhir</CardHeader><CardContent padding><Tren data={data.tren} /></CardContent></Card>
  <Card><CardHeader>Jenis masalah</CardHeader><CardContent padding><Batang data={data.perKategori.map((k: any) => ({ label: k.label, nilai: k.nilai, warna: k.warna }))} /></CardContent></Card>
  <Card><CardHeader>Kecamatan</CardHeader><CardContent padding><Batang data={data.perKecamatan.map((k: any) => ({ ...k, label: k.label.replace(/ \(.*\)$/, '') }))} /></CardContent></Card>
  <Card><CardHeader>Dana per sumber</CardHeader><CardContent padding><Batang data={data.perSumber} format={(n) => rupiahRingkas(n).replace('Rp ', '')} /></CardContent></Card>
{/if}

<style>
  .hero { display: grid; gap: 0.8rem; justify-items: start; padding: 0.5rem 0.25rem 1.1rem; }
  h1 { font-size: clamp(1.9rem, 7vw, 2.6rem); font-weight: 800; font-variation-settings: 'wdth' 88; }
  .hero p { font-size: var(--skala-3); color: var(--senyap); }
  .hero .btn-besar { width: auto; padding-inline: 1.5rem; }
  .peringatan { color: var(--siaga); }
  .kosong { color: var(--senyap); }
  .tumpuk { display: flex; gap: 2px; height: 16px; border: 2px solid var(--aspal); padding: 2px; }
  .tumpuk i { display: block; }
  .legenda { list-style: none; padding: 0; margin: 0.9rem 0 0; display: grid; gap: 0.3rem; font-size: var(--skala-1); }
  .legenda li { display: grid; grid-template-columns: 0.8rem 1fr auto; gap: 0.6rem; align-items: center; }
  .legenda i { width: 0.8rem; height: 0.8rem; display: block; }
</style>
