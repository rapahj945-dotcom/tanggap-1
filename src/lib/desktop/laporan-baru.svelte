<script lang="ts">
  import { enhance } from '$app/forms';
  import Peta from '$lib/components/Peta.svelte';
  import PeringatanGanda from '$lib/components/PeringatanGanda.svelte';
  let { data, form } = $props();
  let kec = $state('');
  let lat = $state<number | null>(null);
  let lng = $state<number | null>(null);
  let kirim = $state(false);
  let pratinjau = $state<string | null>(null);
  const desaPilihan = $derived(data.desa.filter((d: any) => String(d.kecamatan_id) === kec));

  function fotoDipilih(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    pratinjau = f ? URL.createObjectURL(f) : null;
  }
</script>

<svelte:head><title>Buat laporan – TANGGAP</title></svelte:head>

<header class="kepala">
  <h1>Buat laporan</h1>
  <p>Semakin jelas lokasi dan fotonya, semakin cepat petugas menemukan masalahnya.</p>
</header>
<hr class="marka" />

<form method="POST" enctype="multipart/form-data" class="isian" use:enhance={() => { kirim = true; return async ({ update }) => { await update(); kirim = false; }; }}>
  <div class="lajur-dua">
    <div class="isian">
      <div class="bidang"><label for="judul">Judul singkat</label><input id="judul" name="judul" required minlength="8" maxlength="120" value={form?.judul ?? ''} placeholder="Lubang besar di depan pasar" /></div>
      <div class="bidang">
        <label for="kategori_id">Jenis masalah</label>
        <select id="kategori_id" name="kategori_id" required>
          <option value="">Pilih jenis masalah</option>
          {#each data.kategori as k}<option value={k.id}>{k.nama}</option>{/each}
        </select>
      </div>
      <div class="bidang"><label for="uraian">Ceritakan apa yang terjadi</label><textarea id="uraian" name="uraian" required minlength="20" maxlength="2000" placeholder="Sudah berapa lama, seberapa parah, apakah membahayakan orang lain?">{form?.uraian ?? ''}</textarea></div>
      <div class="bidang">
        <label for="foto">Foto (JPG, PNG, atau WebP, maksimal 5 MB)</label>
        <input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" onchange={fotoDipilih} />
        {#if pratinjau}<img src={pratinjau} alt="Pratinjau foto yang akan dikirim" class="pratinjau" />{/if}
      </div>
    </div>

    <div class="isian">
      <div class="bidang">
        <span class="label">Tandai lokasi di peta</span>
        <Peta pilih bind:lat bind:lng tinggi="20rem" />
        <input type="hidden" name="lat" value={lat ?? ''} />
        <input type="hidden" name="lng" value={lng ?? ''} />
      </div>
      <div class="bidang"><label for="alamat">Alamat atau patokan</label><input id="alamat" name="alamat" value={form?.alamat ?? ''} placeholder="Depan Pasar Amahami, sebelah warung" /></div>
      <div class="dua">
        <div class="bidang">
          <label for="kecamatan_id">Kecamatan</label>
          <select id="kecamatan_id" name="kecamatan_id" bind:value={kec}><option value="">Pilih</option>{#each data.kecamatan as k}<option value={String(k.id)}>{k.nama}</option>{/each}</select>
        </div>
        <div class="bidang">
          <label for="desa_id">Kelurahan/desa</label>
          <select id="desa_id" name="desa_id" disabled={!kec}><option value="">Pilih</option>{#each desaPilihan as d}<option value={d.id}>{d.nama}</option>{/each}</select>
        </div>
      </div>
    </div>
  </div>

  {#if form?.serupa?.length}<PeringatanGanda serupa={form.serupa} />{/if}
  {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
  <div><button class="btn utama" disabled={kirim}>{kirim ? 'Mengirim…' : 'Kirim laporan'}</button></div>
</form>

<style>
  .kepala { display: grid; gap: 0.6rem; padding-bottom: 1.25rem; }
  h1 { font-size: var(--skala-5); font-weight: 800; }
  .kepala p { color: var(--senyap); }
  form { padding-top: 2rem; }
  .lajur-dua { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(1.5rem, 4vw, 4rem); align-items: start; }
  .dua { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .pratinjau { max-height: 12rem; max-width: 100%; object-fit: cover; border: 2px solid var(--aspal); margin-top: 0.5rem; justify-self: start; }
  input[type='file'] { padding: 0.6rem 0; font: inherit; border-bottom: 2px solid var(--aspal); }
  @media (max-width: 900px) { .lajur-dua { grid-template-columns: 1fr; } }
</style>
