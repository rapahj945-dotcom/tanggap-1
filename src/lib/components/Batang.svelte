<script lang="ts">
  type Item = { label: string; nilai: number; warna?: string };
  let { data, format = (n: number) => String(n) }: { data: Item[]; format?: (n: number) => string } = $props();
  const maks = $derived(Math.max(1, ...data.map((d) => d.nilai)));
</script>

<ul>
  {#each data as d}
    <li>
      <span class="nama">{d.label}</span>
      <span class="rel"><span class="isi" style:width="{(d.nilai / maks) * 100}%" style:background={d.warna ?? 'var(--aspal)'}></span></span>
      <span class="n num">{format(d.nilai)}</span>
    </li>
  {/each}
  {#if data.length === 0}<li class="kosong">Belum ada data.</li>{/if}
</ul>

<style>
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; }
  li { display: grid; grid-template-columns: 9.5rem minmax(3rem, 1fr) auto; align-items: center; gap: 0.75rem; font-size: var(--skala-2); }
  .nama { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rel { height: 10px; background: repeating-linear-gradient(90deg, var(--garis) 0 6px, transparent 6px 9px); }
  .isi { display: block; height: 100%; }
  .n { text-align: right; font-weight: 700; white-space: nowrap; min-width: 2.5rem; }
  .kosong { color: var(--senyap); display: block; }
  @media (max-width: 520px) { li { grid-template-columns: 6.5rem minmax(2rem, 1fr) auto; } }
</style>
