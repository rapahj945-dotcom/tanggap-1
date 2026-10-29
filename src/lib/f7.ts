import { f7 } from 'framework7-svelte';

/** Dialog konfirmasi bawaan Framework7 sebagai pengganti confirm() browser. */
export const konfirm = (teks: string, judul = 'TANGGAP'): Promise<boolean> =>
  new Promise((ok) => f7.dialog.confirm(teks, judul, () => ok(true), () => ok(false)));
