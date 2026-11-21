# Lokawear — PRD & Konsep Estetik

Nov 21, 2026 · @revan

## Ringkasan

Lokawear adalah toko demo fashion lokal fiktif dengan theme Online Store 2.0 yang ditulis dari nol. Tujuannya satu: membuktikan ke Ryvo bahwa kamu bisa membangun theme Shopify utuh, bukan sekadar mengubah template.

- **Untuk siapa:** HR dan tech lead Ryvo yang menilai lamaran Shopify Developer
- **Yang dibuktikan:** arsitektur theme (Liquid, JSON templates, sections & blocks, metafields), kualitas visual, performa, dan disiplin QA
- **Platform:** development store gratis di Shopify Dev Dashboard, kode di GitHub
- **Satu baris untuk email:** *Full custom OS 2.0 theme built from scratch (Liquid, JSON templates, metafields), Lighthouse 90+, E2E-tested.*
- **Bukan target:** transaksi nyata, domain custom, atau app pihak ketiga (itu bagian toko ke-3)

## Brand & positioning

Lokawear menjual pakaian sehari-hari yang memakai motif dan kain Nusantara (tenun, lurik, batik cap) dengan potongan modern dan minimalis.

- **Tagline:** *Rooted in craft. Cut for today.*
- **Target pembeli:** urban, 22–35 tahun, kerja kreatif/kantoran, ingin tampil lokal tanpa terlihat "pakaian adat"
- **Value proposition:** setiap produk punya cerita asal kain (daerah, teknik, perajin), ditampilkan lewat metafields
- **Kategori produk:** Outer & Kemeja, Atasan, Bawahan, Aksesoris (tote, scarf)
- **Bahasa toko:** Inggris (sesuai bahasa email Ryvo), harga dalam IDR
- **Nada tulisan:** tenang, hangat, singkat. Contoh: *Handwoven in Troso. Washed soft. Made to be worn every week.*

Catatan: Lokawear adalah brand fiktif. Pastikan tidak ada nama atau logo yang mirip brand asli.

## Konsep estetik

Arah visualnya **"Modern Nusantara Minimal"**: banyak ruang kosong, warna tanah yang hangat, aksen indigo seperti kain celup, dan tipografi editorial ala majalah fashion.

**Mood kata kunci:** calm, crafted, editorial, warm, honest.

### Palet warna

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| `--color-bg` Kapas | #F6F1E9 | Background utama |
| `--color-surface` Pasir | #EAE1D3 | Kartu, section selang-seling |
| `--color-text` Arang | #1F1B17 | Teks utama |
| `--color-muted` Abu Batu | #6E655C | Teks sekunder, caption |
| `--color-primary` Indigo Celup | #2E3A5C | Tombol utama, link, header |
| `--color-accent` Terakota | #B5562F | Badge sale, highlight, hover |
| `--color-line` Garis | #D6CCBC | Border, divider |

Semua warna dijadikan CSS variables dari `settings_schema.json` supaya bisa diganti lewat theme editor. Cek kontras teks minimal 4.5:1 (WCAG AA).

### Tipografi

- **Heading:** serif editorial, misalnya Fraunces atau Cormorant Garamond, dipakai besar dengan letter-spacing rapat
- **Body & UI:** sans-serif bersih, misalnya Inter atau DM Sans, 16px, line-height 1.6
- **Label kecil:** uppercase, letter-spacing 0.12em, 12px (untuk kategori, badge, nav)
- Pakai `font_picker` di settings bila font tersedia di library Shopify; kalau tidak, self-host file woff2 di `assets/`

### Fotografi & grafis

- Foto model dan flat lay dengan cahaya alami, tone hangat, background polos (Unsplash/Pexels, cek lisensi)
- Close-up tekstur kain di halaman produk untuk menonjolkan sisi craft
- Satu motif garis tipis (terinspirasi lurik) sebagai divider dan pola background, dibuat sebagai SVG sendiri
- Ikon garis 1.5px, tanpa ilustrasi berwarna

### Komponen UI

- Tombol: sudut tegas (radius 0–2px), primary indigo terisi, secondary outline arang
- Kartu produk: rasio gambar 4:5, gambar kedua muncul saat hover, nama + harga rata kiri tanpa border
- Grid: max-width 1320px, 12 kolom, gutter 24px; mobile 2 kolom produk
- Animasi halus saja: fade-up saat scroll (hormati `prefers-reduced-motion`), transisi 200ms

### Referensi suasana

Cari inspirasi di Pinterest/Dribbble dengan kata kunci *minimal fashion editorial*, *slow fashion ecommerce*, *warm neutral website*. Ambil arah rasanya saja, jangan menyalin layout satu brand tertentu.

## Sitemap & halaman

Navigasi dibuat dangkal: semua produk bisa dicapai maksimal dua klik dari Home.

&#91;embedded content: sitemap Lokawear · 5 area utama\]

Collections dan Journal turun ke halaman detail; header, search, cart drawer, dan footer hadir di semua halaman.

## Kebutuhan fungsional

Setiap halaman disusun dari section yang bisa ditambah, dihapus, dan diurutkan dari theme editor. Itulah yang dinilai reviewer.

### Section global

| Section | Fitur utama | Prioritas |
| --- | --- | --- |
| Announcement bar | Teks berganti otomatis, link, bisa ditutup | Wajib |
| Header | Logo, mega menu dengan gambar kategori, search, ikon akun & cart, sticky saat scroll | Wajib |
| Cart drawer | Update qty via Cart AJAX API, progress bar gratis ongkir, catatan order | Wajib |
| Predictive search | Hasil produk + koleksi saat mengetik (Predictive Search API) | Wajib |
| Footer | Menu, newsletter (form customer Shopify), sosial media, pilihan mata uang | Wajib |

### Halaman Home

| Section | Fitur utama | Prioritas |
| --- | --- | --- |
| Hero editorial | Gambar/video, judul, 2 tombol, pilihan posisi teks | Wajib |
| Featured collection | Grid atau slider produk, jumlah produk diatur dari editor | Wajib |
| Shop by category | Kartu kategori dengan gambar, block per kategori | Wajib |
| Craft story | Gambar + teks berselang (image with text), motif lurik | Wajib |
| Lookbook shoppable | Foto dengan hotspot yang menampilkan produk saat diklik | Nilai plus |
| Testimoni | Slider kutipan pelanggan (fiktif, diberi label demo) | Opsional |
| Newsletter | Form signup dengan pesan sukses/gagal | Wajib |

### Halaman Collection

- Filter (ukuran, warna, harga, ketersediaan) dan sorting memakai Search & Discovery
- Filter berjalan tanpa reload halaman (Section Rendering API), URL ikut berubah
- Banner koleksi, jumlah produk, pagination atau tombol "Load more"
- Badge otomatis: Sale, Sold out, New (berdasarkan tag)

### Halaman Product

- Galeri gambar dengan zoom, thumbnail, dan gambar berganti sesuai varian warna
- Pemilih varian berupa swatch warna dan tombol ukuran, harga dan stok ikut berubah
- Size chart di modal, isinya dari metaobject
- Blok **Fabric story** dari metafields: asal daerah, teknik, perajin, perawatan
- Sticky add-to-cart bar di mobile
- Rekomendasi "You may also like" (Product Recommendations API)
- Semua bagian di atas berupa blocks yang bisa diurutkan di editor

### Halaman lain

- **About / Our Craft:** halaman cerita brand dengan section image with text dan timeline
- **Blog (Journal):** daftar artikel dan template artikel
- **Halaman standar:** Contact (form), FAQ (accordion), Search results, 404, Cart page, halaman akun customer

### Metafields & metaobjects

| Nama | Tipe | Dipakai di |
| --- | --- | --- |
| `custom.fabric_origin` | Teks satu baris | Fabric story |
| `custom.technique` | Teks satu baris | Fabric story |
| `custom.care_instructions` | Rich text | Tab perawatan |
| `custom.size_chart` | Referensi metaobject `size_chart` | Modal size chart |
| `custom.artisan` | Referensi metaobject `artisan` (nama, daerah, foto) | Fabric story |

## Kebutuhan teknis & non-fungsional

Theme ditulis tanpa framework CSS dan tanpa jQuery, supaya ringan dan menunjukkan kamu paham dasar-dasarnya.

### Arsitektur theme

- Struktur standar: `layout/`, `templates/` (JSON), `sections/`, `snippets/`, `blocks/`, `assets/`, `config/`, `locales/`
- Semua template berupa JSON, kecuali `gift_card.liquid` dan halaman akun bila diperlukan
- Snippet yang dipakai ulang: `product-card`, `price`, `icon`, `responsive-image`, `swatch`
- JavaScript: vanilla JS dalam bentuk Web Components (`<cart-drawer>`, `<variant-picker>`, `<predictive-search>`), dimuat dengan `defer`
- CSS: satu file base + file per section yang dimuat hanya saat section dipakai
- Teks di theme memakai `locales/en.default.json`, siap ditambah bahasa Indonesia
- Pengembangan pakai Shopify CLI (`shopify theme dev`) dan GitHub integration

### Performa

| Metrik (mobile) | Target |
| --- | --- |
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Largest Contentful Paint | < 2,5 detik |
| Cumulative Layout Shift | < 0,1 |

Caranya: `image_url` + `srcset` + `loading="lazy"` (kecuali gambar hero), preload font utama, JS dan CSS per section, tanpa app pihak ketiga.

### Aksesibilitas

- Navigasi penuh dengan keyboard, focus terlihat jelas, skip-to-content link
- Drawer dan modal mengunci fokus dan bisa ditutup dengan Esc
- Semua gambar punya alt text, swatch punya label teks
- Kontras warna sesuai WCAG 2.1 AA

### QA (nilai pembeda)

- **Theme Check** tanpa error di setiap push
- **Playwright E2E** untuk alur utama: buka home, filter koleksi, pilih varian, add to cart, ubah qty di drawer, menuju checkout
- **GitHub Actions** yang menjalankan Theme Check, Playwright, dan Lighthouse CI
- Uji lintas browser (Chrome, Safari, Firefox) dan perangkat (375px, 768px, 1440px)
- Test case dan bug log sederhana di README, sesuai latar belakangmu sebagai QA

## Data dummy & konten

Cukup 16–20 produk di 4 koleksi supaya grid, filter, dan pagination terlihat hidup.

| Koleksi | Jumlah produk | Contoh produk | Rentang harga |
| --- | --- | --- | --- |
| Outer & Shirts | 5 | Lurik Overshirt, Tenun Chore Jacket | Rp450.000–Rp850.000 |
| Tops | 5 | Batik Cap Boxy Tee, Linen Camp Shirt | Rp220.000–Rp390.000 |
| Bottoms | 4 | Indigo Wide Trousers, Sarong Pants | Rp350.000–Rp520.000 |
| Accessories | 4 | Tenun Tote Bag, Batik Scarf | Rp120.000–Rp280.000 |

- **Varian:** setiap pakaian punya 2–3 warna dan ukuran S–XL; buat beberapa varian sold out untuk menguji badge
- **Diskon:** 3–4 produk diberi compare-at price supaya badge Sale muncul
- **Tag:** `new`, `bestseller`, `handwoven` untuk badge dan filter
- **Metafields:** isi asal kain, teknik, dan perawatan di semua produk; buat 3 metaobject artisan
- **Gambar:** minimal 3 per produk (depan, belakang/detail, tekstur), rasio 4:5, dikompres ke < 300 KB
- **Journal:** 3 artikel pendek, misalnya *What is Lurik?*, *Caring for Handwoven Fabric*, *Meet the Weavers of Troso*
- **Import:** siapkan CSV produk sesuai format Shopify supaya data bisa di-import ulang ke toko lain
- Tandai jelas di footer: *Demo store for portfolio purposes. No real orders.*

## Milestone & rencana kerja

Perkiraan 10–14 hari kerja kalau dikerjakan paruh waktu. Kalau waktunya mepet, kerjakan semua yang berlabel Wajib dulu, lalu kirim lamaran.

1. **Setup (hari 1):** buat development store, repo GitHub, Shopify CLI, struktur folder theme, settings warna & font
2. **Fondasi (hari 2–3):** layout, header + mega menu, footer, announcement bar, snippet produk & harga
3. **Produk & koleksi (hari 4–6):** template product lengkap dengan varian, metafields, size chart; collection dengan filter AJAX
4. **Home & cart (hari 7–8):** semua section Home, cart drawer, predictive search
5. **Konten (hari 9):** import produk, gambar, metaobjects, artikel Journal, halaman About
6. **QA & performa (hari 10–12):** Theme Check, Playwright, GitHub Actions, Lighthouse, perbaikan aksesibilitas, uji di HP
7. **Rilis portfolio (hari 13–14):** README dengan screenshot & GIF, video walkthrough 1–2 menit, kirim ke Ryvo

- [ ] Store dan repo siap
- [ ] Semua section Wajib selesai dan bisa diatur di editor
- [ ] Konten dummy lengkap
- [ ] Lighthouse mobile ≥ 90 dan test E2E lulus di CI
- [ ] README, screenshot, dan password storefront siap dikirim

## Kriteria sukses & deliverable

Toko dianggap siap kirim kalau reviewer bisa memahami kualitas kerjamu dalam 2 menit, tanpa perlu bertanya.

**Kriteria sukses**

- Semua halaman jalan mulus di mobile dan desktop, tanpa error di console
- Reviewer bisa membuka theme editor (lewat video atau screenshot) dan melihat section yang fleksibel
- Lighthouse mobile ≥ 90 untuk Performance, ≥ 95 untuk Accessibility
- Theme Check bersih dan CI hijau

**Yang dikirim di email**

| Item | Isi |
| --- | --- |
| Link toko | `lokawear-demo.myshopify.com` + password storefront |
| Satu baris peran | *Full custom OS 2.0 theme built from scratch (Liquid, JSON templates, metafields), Lighthouse 90+, E2E-tested.* |
| GitHub | Repo theme dengan README: fitur, screenshot, skor Lighthouse, cara menjalankan, badge CI |
| Bukti visual | 3–5 screenshot (home, collection, product, cart drawer, theme editor) atau video Loom 1–2 menit |
