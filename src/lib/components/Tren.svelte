<script lang="ts">
  let { data }: { data: { label: string; nilai: number; href?: string }[] } = $props();
  const maks = $derived(Math.max(1, ...data.map((d) => d.nilai)));
  const W = $derived(100 / Math.max(1, data.length));
</script>

<svg viewBox="0 0 100 52" preserveAspectRatio="none" role="img" aria-label="Jumlah laporan per bulan" class="grafik">
  <line x1="0" x2="100" y1="40" y2="40" stroke="var(--aspal)" stroke-width="0.6" vector-effect="non-scaling-stroke" />
  {#each data as d, i}
    {@const h = (d.nilai / maks) * 34}
    {#if d.href}
      <a href={d.href} aria-label={`${d.label}: ${d.nilai} laporan`}>
        <rect x={i * W} y="0" width={W} height="52" fill="transparent" />
        <rect x={i * W + W * 0.18} y={40 - h} width={W * 0.64} height={Math.max(h, 0.4)} fill={i === data.length - 1 ? 'var(--rambu)' : 'var(--aspal)'} />
      </a>
    {:else}
      <rect x={i * W + W * 0.18} y={40 - h} width={W * 0.64} height={Math.max(h, 0.4)} fill={i === data.length - 1 ? 'var(--rambu)' : 'var(--aspal)'} />
    {/if}
  {/each}
</svg>
<div class="sumbu" style:grid-template-columns="repeat({data.length}, 1fr)">
  {#each data as d}
    {#if d.href}<a class="sb" href={d.href}><b class="num">{d.nilai}</b>{d.label}</a>{:else}<span><b class="num">{d.nilai}</b>{d.label}</span>{/if}
  {/each}
</div>

<style>
  .grafik { width: 100%; height: 9rem; display: block; }
  .sumbu { display: grid; text-align: center; font-size: var(--skala-1); color: var(--senyap); margin-top: 0.35rem; }
  .sumbu span, .sumbu .sb { display: grid; }
  .sumbu .sb { color: inherit; text-decoration: none; padding: 0.3rem 0; min-height: 2.75rem; }
  .sumbu .sb:active { background: var(--garis); }
  .sumbu b { color: var(--aspal); }
</style>
