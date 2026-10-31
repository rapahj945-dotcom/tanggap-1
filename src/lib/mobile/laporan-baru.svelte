<script lang="ts">
  import { enhance } from '$app/forms';
  import Peta from '$lib/components/Peta.svelte';
  import PeringatanGanda from '$lib/components/PeringatanGanda.svelte';
  import { Card, CardHeader, CardContent, List, ListInput } from 'framework7-svelte';
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

<div class="judul-halaman">
  <h1>Buat laporan</h1>
  <p>Semakin jelas lokasi dan fotonya, semakin cepat petugas menemukan masalahnya.</p>
</div>

<form method="POST" enctype="multipart/form-data" use:enhance={() => { kirim = true; return async ({ update }) => { await update(); kirim = false; }; }}>
  <Card>
    <CardHeader>1 · Apa masalahnya?</CardHeader>
    <List class="form-list">
      <ListInput label="Judul singkat" type="text" name="judul" required minlength="8" maxlength="120" value={form?.judul ?? ''} placeholder="Lubang besar di depan pasar" clearButton />
      <ListInput label="Jenis masalah" type="select" name="kategori_id" required value="">
        <option value="">Pilih jenis masalah</option>{#each data.kategori as k}<option value={String(k.id)}>{k.nama}</option>{/each}
      </ListInput>
      <ListInput label="Ceritakan apa yang terjadi" type="textarea" name="uraian" required minlength="20" maxlength="2000" resizable value={form?.uraian ?? ''} placeholder="Sudah berapa lama, seberapa parah, apakah membahayakan orang lain?" />
    </List>
    <CardContent padding>
      <div class="berkas">
        <label for="foto">Foto (JPG, PNG, atau WebP, maksimal 5 MB)</label>
        <input id="foto" name="foto" type="file" accept="image/jpeg,image/png,image/webp" onchange={fotoDipilih} />
        {#if pratinjau}<img src={pratinjau} alt="Pratinjau foto yang akan dikirim" class="pratinjau" />{/if}
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader>2 · Di mana lokasinya?</CardHeader>
    <Peta pilih bind:lat bind:lng tinggi="18rem" />
    <input type="hidden" name="lat" value={lat ?? ''} />
    <input type="hidden" name="lng" value={lng ?? ''} />
    <List class="form-list">
      <ListInput label="Alamat atau patokan" type="text" name="alamat" value={form?.alamat ?? ''} placeholder="Depan pasar, sebelah warung" />
      <ListInput label="Kecamatan" type="select" name="kecamatan_id" value={kec} onChange={(e: any) => (kec = e.target.value)}>
        <option value="">Pilih kecamatan</option>{#each data.kecamatan as k}<option value={String(k.id)}>{k.nama}</option>{/each}
      </ListInput>
      <ListInput label="Kelurahan/desa" type="select" name="desa_id" disabled={!kec} value="">
        <option value="">Pilih kelurahan/desa</option>{#each desaPilihan as d}<option value={String(d.id)}>{d.nama}</option>{/each}
      </ListInput>
    </List>
  </Card>

  {#if form?.serupa?.length}<PeringatanGanda serupa={form.serupa} />{/if}
  {#if form?.galat}<p class="pesan galat" role="alert">{form.galat}</p>{/if}
  <div class="bar-aksi"><button class="btn-besar" disabled={kirim}>{kirim ? 'Mengirim…' : 'Kirim laporan'}</button></div>
</form>

<style>
  .berkas { display: grid; gap: 0.4rem; font-size: var(--skala-1); color: var(--senyap); font-weight: 700; }
  .berkas input { font: inherit; }
  .pratinjau { max-height: 12rem; max-width: 100%; object-fit: cover; border: 2px solid var(--aspal); margin-top: 0.4rem; justify-self: start; }
</style>
