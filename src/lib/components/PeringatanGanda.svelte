<script lang="ts">
  let { serupa }: { serupa: { kode: string; judul: string; alamat: string; status: string; jarak: number | null }[] } = $props();
</script>

<section class="ganda" role="alert" aria-labelledby="ganda-judul">
  <h2 id="ganda-judul">Sepertinya masalah ini sudah dilaporkan</h2>
  <p>Laporan ganda memperlambat penanganan. Periksa dulu laporan berikut. Bila itu masalah yang sama, cukup pantau laporan tersebut.</p>
  <ul>
    {#each serupa as s}
      <li>
        <a href={`/lacak/${s.kode}`} target="_blank" rel="noopener"><b class="num">{s.kode}</b> · {s.judul}</a>
        <span>{s.status}{s.jarak != null ? ` · ±${s.jarak} m dari titik Anda` : ''}{s.alamat ? ` · ${s.alamat}` : ''}</span>
      </li>
    {/each}
  </ul>
  <button class="btn" type="submit" name="abaikan_ganda" value="1">Ini masalah berbeda, tetap kirim</button>
</section>

<style>
  .ganda { background: #fff4c2; border: 2px solid var(--aspal, #1b1f23); padding: 1rem 1.1rem; display: grid; gap: 0.6rem; margin: 1rem 0; }
  h2 { font-size: 1.05rem; margin: 0; }
  p { margin: 0; font-size: 0.9rem; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
  li { display: grid; gap: 0.1rem; font-size: 0.9rem; }
  li span { color: var(--senyap, #5b6168); font-size: 0.8rem; }
  .btn { justify-self: start; }
</style>
