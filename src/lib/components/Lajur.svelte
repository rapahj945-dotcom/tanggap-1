<script lang="ts">
  import { TAHAP, WARNA_STATUS } from '$lib/format';
  let { status, besar = false }: { status: string; besar?: boolean } = $props();
  const idx = $derived(TAHAP.indexOf(status));
  const ditolak = $derived(status === 'Ditolak');
  const warna = $derived(WARNA_STATUS[status]);
</script>

<span class="lajur" class:besar role="img" aria-label={`Status: ${status}`}>
  <span class="ruas">
    {#each TAHAP as t, i}
      <i
        style:background={ditolak ? (i === 0 ? warna : 'transparent') : i <= idx ? warna : 'transparent'}
        title={t}
      ></i>
    {/each}
  </span>
  <b style:color={warna}>{status}</b>
</span>

<style>
  .lajur { display: inline-flex; flex-direction: column; gap: 0.3rem; min-width: 7.5rem; }
  .ruas { display: flex; gap: 3px; }
  i { flex: 1; height: 6px; border: 1.5px solid var(--aspal); border-radius: 1px; }
  b { font-size: var(--skala-1); font-weight: 700; }
  .besar i { height: 12px; }
  .besar b { font-size: var(--skala-3); font-family: var(--tampil); }
  .besar { min-width: 100%; }
</style>
