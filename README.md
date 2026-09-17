# Sinar Jaya SAE — Corporate Website

Website statis corporate untuk **Sinar Jaya SAE**, industri pupuk fosfat alam dan mineral pertanian dari Gresik, Jawa Timur.

## Struktur halaman

- `/` — Beranda
- `/tentang-kami/` — Profil, visi, dan misi
- `/produk/` — Portofolio produk
- `/produk/sjs-multy-blanding/`
- `/produk/sp-36/`
- `/produk/sjs-agrophos/`
- `/produk/sawit-mas-13-6-27-te/`
- `/produk/golden-premium/`
- `/solusi/`, `/distribusi/`, `/artikel/`, dan `/kontak/`

## Pengembangan lokal

```bash
npm run lint
npm run build
npm start
```

Server lokal tersedia di `http://localhost:8788`. Hasil build ada di `dist/` dan tidak dilacak Git.

## Deploy ke Cloudflare Pages

1. Buat project baru di **Cloudflare Pages** dan hubungkan ke repository ini (bukan repository lama `Pupuksjs`).
2. Pilih branch produksi yang diinginkan. Saat ini perubahan dikerjakan pada branch aktif repository.
3. Atur **Build command** menjadi `npm run build`.
4. Atur **Build output directory** menjadi `dist`.
5. Deploy. Cloudflare Pages akan menyajikan file statis beserta `_headers`, `robots.txt`, dan `sitemap.xml`.
6. Setelah domain final tersedia, isi `siteUrl` pada `site.config.json` atau set environment variable `SITE_URL` saat build, misalnya `SITE_URL=https://domain-anda.tld npm run build`. Build akan menghasilkan canonical URL absolut, `og:url`, URL structured data, sitemap absolut, dan referensi sitemap di `robots.txt`. Domain tidak diisi sekarang agar tidak mengarang domain perusahaan.

## Aset yang masih diperlukan

- Logo asli Sinar Jaya SAE, ditempatkan sebagai `public/assets/logo/logo-sinar-jaya-sae.svg` (atau format final yang disetujui), kemudian tautkan pada komponen header/footer di `scripts/generate-pages.mjs`.
- Foto kemasan asli untuk kelima produk, ditempatkan di `public/assets/products/`.
- Domain final untuk canonical URL, sitemap absolut, dan metadata sosial produksi.
- Detail produk yang sudah disetujui (spesifikasi, cara aplikasi, dan materi pendukung) bila ingin ditampilkan.

Jangan gunakan ilustrasi atau placeholder pada proyek ini sebagai pengganti logo maupun foto kemasan asli.
