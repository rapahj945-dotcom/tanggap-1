<script lang="ts">
  import { mobile, BATAS } from '$lib/mode';
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  let { data, children } = $props();
  const muat = mobile ? import('$lib/mobile/Kerangka.svelte') : import('$lib/desktop/Kerangka.svelte');
  // melewati batas lebar (mis. memutar tablet) → muat ulang agar CSS yang benar terpasang
  onMount(() => {
    const mq = matchMedia(`(max-width: ${BATAS}px)`);
    const f = () => { if (mq.matches !== mobile) location.reload(); };
    mq.addEventListener('change', f);
    // segarkan lencana notifikasi tiap 30 detik, dan saat tab kembali aktif
    const t = setInterval(() => { if (!document.hidden) invalidate('app:notif'); }, 30000);
    const v = () => { if (!document.hidden) invalidate('app:notif'); };
    document.addEventListener('visibilitychange', v);
    return () => { mq.removeEventListener('change', f); clearInterval(t); document.removeEventListener('visibilitychange', v); };
  });
</script>

{#await muat then { default: Kerangka }}
  <Kerangka {data} {children} />
{/await}
