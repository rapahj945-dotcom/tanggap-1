<script lang="ts">
  let { data }: { data: { label: string; nilai: number }[] } = $props();
  const maks = $derived(Math.max(1, ...data.map((d) => d.nilai)));
  const W = $derived(100 / Math.max(1, data.length));
</script>

<svg viewBox="0 0 100 52" preserveAspectRatio="none" role="img" aria-label="Jumlah laporan per bulan" class="grafik">
  <line x1="0" x2="100" y1="40" y2="40" stroke="var(--aspal)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
  {#each data as d, i}
    {@const h = (d.nilai / maks) * 34}
    <rect x={i * W + W * 0.18} y={40 - h} width={W * 0.64} height={Math.max(h, 0.4)} fill={i === data.length - 1 ? 'var(--rambu)' : 'var(--aspal)'} />
  {/each}
</svg>
<div class="sumbu" style:grid-template-columns="repeat({data.length}, 1fr)">
  {#each data as d}<span><b class="num">{d.nilai}</b>{d.label}</span>{/each}
</div>

<style>
  .grafik { width: 100%; height: 9rem; display: block; }
  .sumbu { display: grid; text-align: center; font-size: var(--skala-1); color: var(--senyap); margin-top: 0.35rem; }
  .sumbu span { display: grid; }
  .sumbu b { color: var(--aspal); }
</style>
