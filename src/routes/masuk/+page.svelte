<script lang="ts">
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import Merek from '$lib/components/Merek.svelte';
  let { data, form } = $props();
  let kirim = $state(false);
  let email = $state(form?.email ?? '');
  let sandi = $state('');
  let lihat = $state(false);
  let terisi = $state('');
  let tombol: HTMLButtonElement;

  const AKUN = [
    { peran: 'Administrator', ket: 'Kelola semua laporan', email: 'admin@tanggap.id', sandi: 'admin123' },
    { peran: 'Petugas', ket: 'Tangani tugas lapangan', email: 'ahmad@tanggap.id', sandi: 'petugas123' },
    { peran: 'Warga', ket: 'Buat & pantau laporan', email: 'siti@contoh.id', sandi: 'warga123' }
  ];
  const isi = (a: (typeof AKUN)[number]) => { email = a.email; sandi = a.sandi; terisi = a.email; lihat = false; tombol?.focus(); };
  // ingat email terakhir di perangkat ini
  onMount(() => { try { if (!email) email = localStorage.getItem('tanggap:email') ?? ''; } catch {} });
  const simpan = () => { try { localStorage.setItem('tanggap:email', email); } catch {} };
</script>

<svelte:head><title>Masuk – TANGGAP</title></svelte:head>
<div class="halaman">
  <aside>
    <Merek />
    <p>Setiap laporan punya nomor, petugas, dan riwayat. Masuk untuk melihat milik Anda.</p>
    <div class="jalan" aria-hidden="true"></div>
  </aside>
  <main>
    <header><h1>Masuk</h1><p class="bantu">Selamat datang kembali. Masukkan akun Anda untuk melanjutkan.</p></header>

    {#if data.contoh}
      <section class="contoh" aria-label="Akun contoh">
        <p class="label">Coba cepat — ketuk untuk mengisi otomatis</p>
        <div class="tiket-baris">
          {#each AKUN as a}
            <button type="button" class="tiket" class:aktif={terisi === a.email} onclick={() => isi(a)}>
              <b>{a.peran}</b><span>{a.ket}</span>
            </button>
          {/each}
        </div>
      </section>
    {/if}

    <form method="POST" class="isian" use:enhance={() => { kirim = true; simpan(); return async ({ update }) => { await update({ reset: false }); kirim = false; }; }}>
      <input type="hidden" name="lanjut" value={data.lanjut} />
      <div class="kolom">
        <label for="email">Email</label>
        <div class="kotak">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></svg>
          <input id="email" name="email" type="email" required autocomplete="username" placeholder="nama@contoh.id" bind:value={email} />
        </div>
      </div>
      <div class="kolom">
        <label for="sandi">Kata sandi</label>
        <div class="kotak">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3" /></svg>
          <input id="sandi" name="sandi" type={lihat ? 'text' : 'password'} required autocomplete="current-password" placeholder="••••••••" bind:value={sandi} />
          <button type="button" class="mata" onclick={() => (lihat = !lihat)} aria-label={lihat ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={lihat}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{#if lihat}<path d="M4 4l16 16" />{/if}</svg>
          </button>
        </div>
      </div>
      {#if form?.galat}<p class="galat" role="alert">{form.galat}</p>{/if}
      <button class="masuk" bind:this={tombol} disabled={kirim}>{kirim ? 'Memeriksa…' : 'Masuk'}<span aria-hidden="true">→</span></button>
    </form>
    <p class="bantu">Belum punya akun? <a href="/daftar">Daftar sebagai warga</a></p>
  </main>
</div>

<style>
  .halaman { min-height: 100vh; display: grid; grid-template-columns: minmax(16rem, 5fr) 7fr; }
  aside { background: var(--rambu); padding: 2rem clamp(1.25rem, 4vw, 3.5rem); display: flex; flex-direction: column; gap: 2rem; position: relative; }
  aside p { font: 800 var(--skala-5)/1.05 var(--tampil); max-width: 14ch; margin-top: auto; }
  .jalan { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; background: repeating-linear-gradient(180deg, var(--aspal) 0 22px, transparent 22px 40px); }
  main { padding: clamp(2rem, 7vw, 5rem) clamp(1.25rem, 5vw, 5rem); max-width: 40rem; width: 100%; display: grid; gap: 1.5rem; align-content: start; }
  h1 { font-size: var(--skala-6); font-weight: 800; }
  header .bantu { margin-top: 0.4rem; }
  .label { font: 700 0.75rem var(--isi); letter-spacing: 0.07em; text-transform: uppercase; color: var(--senyap); margin-bottom: 0.55rem; }
  .tiket-baris { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
  /* kartu tiket: tepi tebal bergaya rambu, tersorot saat dipilih */
  .tiket { all: unset; box-sizing: border-box; cursor: pointer; display: grid; gap: 0.15rem; padding: 0.7rem 0.8rem; background: var(--kertas, #fbfbf6); border: 2px solid var(--aspal); border-top: 6px solid var(--rambu); box-shadow: 3px 3px 0 var(--aspal); transition: transform 120ms, box-shadow 120ms, background 120ms; }
  .tiket b { font: 800 0.95rem var(--tampil); }
  .tiket span { font-size: 0.72rem; line-height: 1.25; color: var(--senyap); }
  .tiket:hover { transform: translate(-1px, -1px); box-shadow: 4px 4px 0 var(--aspal); }
  .tiket:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--aspal); }
  .tiket:focus-visible { outline: 3px solid var(--aspal); outline-offset: 2px; }
  .tiket.aktif { background: var(--rambu); }
  .isian { display: grid; gap: 1.1rem; }
  .kolom { display: grid; gap: 0.4rem; }
  .kolom label { font: 700 0.8125rem var(--isi); letter-spacing: 0.04em; text-transform: uppercase; }
  .kotak { display: flex; align-items: center; gap: 0.6rem; padding: 0 0.4rem 0 0.9rem; background: var(--kertas, #fbfbf6); border: 2px solid var(--aspal); box-shadow: 3px 3px 0 var(--aspal); transition: box-shadow 120ms, background 120ms; }
  .kotak:focus-within { background: #fffdf0; box-shadow: 3px 3px 0 var(--rambu), 0 0 0 3px var(--aspal); }
  .kotak svg { width: 1.25rem; height: 1.25rem; flex: none; fill: none; stroke: var(--aspal); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .kotak input { flex: 1; min-width: 0; border: 0 !important; background: transparent !important; box-shadow: none !important; outline: 0; padding: 0.95rem 0; font-size: 1.05rem; }
  .mata { all: unset; cursor: pointer; display: grid; place-items: center; padding: 0.6rem; }
  .mata:hover svg { stroke: var(--senyap); }
  .mata:focus-visible { outline: 3px solid var(--aspal); }
  .masuk { all: unset; box-sizing: border-box; cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; background: var(--rambu); border: 2px solid var(--aspal); box-shadow: 4px 4px 0 var(--aspal); font: 800 1.1rem var(--tampil); transition: transform 120ms, box-shadow 120ms; }
  .masuk:hover:not(:disabled) { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--aspal); }
  .masuk:active:not(:disabled) { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--aspal); }
  .masuk:focus-visible { outline: 3px solid var(--aspal); outline-offset: 3px; }
  .masuk:disabled { opacity: 0.6; cursor: progress; }
  @media (max-width: 760px) { .halaman { grid-template-columns: 1fr; } aside { padding: 1.1rem 1.25rem; gap: 0.9rem; } aside p { font-size: 1.3rem; max-width: none; margin-top: 0; } .jalan { display: none; } .tiket-baris { grid-template-columns: 1fr; } .tiket { grid-template-columns: auto 1fr; align-items: baseline; gap: 0.2rem 0.8rem; border-top-width: 2px; border-left: 8px solid var(--rambu); } }
</style>
