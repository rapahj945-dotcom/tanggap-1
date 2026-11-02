<script lang="ts">
  import Merek from '$lib/components/Merek.svelte';
  let { form } = $props();
</script>

<svelte:head><title>Daftar – TANGGAP</title></svelte:head>
<header><Merek /><a href="/masuk">Masuk</a></header>
<hr class="marka" />
<main>
  <h1>Buat akun warga</h1>
  <p class="bantu">Akun dipakai untuk mengirim laporan dan memantau statusnya.</p>
  <form method="POST" class="isian">
    <div class="bidang"><label for="nama">Nama lengkap</label><input id="nama" name="nama" required value={form?.nama ?? ''} autocomplete="name" /></div>
    <div class="bidang"><label for="email">Email</label><input id="email" name="email" type="email" required value={form?.email ?? ''} autocomplete="email" /></div>
    <div class="bidang"><label for="no_hp">Nomor HP (opsional)</label><input id="no_hp" name="no_hp" inputmode="tel" value={form?.no_hp ?? ''} autocomplete="tel" /></div>
    <div class="bidang"><label for="sandi">Kata sandi</label><input id="sandi" name="sandi" type="password" required minlength="8" autocomplete="new-password" /><span class="bantu">Minimal 8 karakter.</span></div>
    {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
    <div><button class="btn utama">Daftar dan mulai melapor</button></div>
  </form>
</main>

<style>
  header { display: flex; justify-content: space-between; align-items: center; padding: 1rem clamp(1rem, 4vw, 3rem); font-weight: 600; }
  main { max-width: 34rem; margin: 0 auto; padding: 3rem clamp(1.25rem, 4vw, 2rem) 5rem; display: grid; gap: 1.5rem; }
  h1 { font-size: var(--skala-6); font-weight: 800; }
</style>
