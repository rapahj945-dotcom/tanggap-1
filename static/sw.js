/* Service worker TANGGAP: ringan dan aman.
   - aset statis dan foto: cache-first
   - halaman: network-first, salinan terakhir saat offline, lalu /offline.html
   - POST (kirim laporan, ubah status) tidak pernah ditangani/di-cache
   - salinan halaman dihapus saat keluar (logout) */
const VERSI = 'v1';
const STATIS = `tanggap-statis-${VERSI}`;
const HALAMAN = `tanggap-halaman-${VERSI}`;
const PRACACHE = ['/offline.html', '/manifest.webmanifest', '/ikon-192.png', '/ikon-512.png', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIS).then((c) => c.addAll(PRACACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => ![STATIS, HALAMAN].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const asetStatis = (u) =>
  u.pathname.startsWith('/_app/immutable/') || u.pathname.startsWith('/berkas/') || /\.(png|svg|woff2?|webmanifest)$/.test(u.pathname);
// jangan simpan unduhan atau tautan notifikasi (yang menandai dibaca lalu mengalihkan)
const jangan = (u) => u.pathname.startsWith('/app/laporan/ekspor') || /^\/app\/notifikasi\/\d+/.test(u.pathname);

self.addEventListener('message', (e) => {
  if (e.data === 'bersihkan') e.waitUntil(caches.delete(HALAMAN));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.method === 'POST') {
    if (url.pathname === '/keluar') e.waitUntil(caches.delete(HALAMAN));
    return; // biarkan lewat jaringan apa adanya
  }
  if (req.method !== 'GET' || jangan(url)) return;

  if (asetStatis(url)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const salin = res.clone(); caches.open(STATIS).then((c) => c.put(req, salin)); }
        return res;
      }))
    );
    return;
  }

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && !res.redirected) { const salin = res.clone(); caches.open(HALAMAN).then((c) => c.put(req, salin)); }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        if (req.mode === 'navigate') return (await caches.match('/offline.html')) || Response.error();
        return Response.error();
      })
  );
});
