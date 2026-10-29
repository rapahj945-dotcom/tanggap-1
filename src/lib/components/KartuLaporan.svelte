<script lang="ts">
  import { ListItem, SwipeoutActions, SwipeoutButton } from 'framework7-svelte';
  import Lajur from './Lajur.svelte';
  import { hariLalu, WARNA_STATUS } from '$lib/format';
  type L = { id: number; kode: string; judul: string; kategori: string; kecamatan?: string | null; warna?: string; status: string; created_at: string };
  let { l, onHapus, ekstra = '' }: { l: L; onHapus?: (l: L) => void; ekstra?: string } = $props();
</script>

<ListItem
  swipeout={!!onHapus}
  header={l.kode}
  title={l.judul}
  subtitle={`${l.kategori}${l.kecamatan ? ' · ' + l.kecamatan.replace(/ \(.*\)$/, '') : ''}${ekstra}`}
  after={hariLalu(l.created_at)}
  link={`/app/laporan/${l.id}`}
  class="kartu-laporan"
  style={`--w:${l.warna ?? WARNA_STATUS[l.status] ?? 'var(--aspal)'}`}
>
  {#snippet inner()}<div class="status-baris"><Lajur status={l.status} /></div>{/snippet}
  {#if onHapus}
    <SwipeoutActions right>
      <SwipeoutButton overswipe color="red" onClick={() => onHapus!(l)}>Hapus</SwipeoutButton>
    </SwipeoutActions>
  {/if}
</ListItem>
