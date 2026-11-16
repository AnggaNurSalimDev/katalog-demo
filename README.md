# Katalog Demo

Katalog online untuk **usaha kecil** yang pesanannya langsung tersusun rapi di **WhatsApp penjual**: pelanggan pilih produk atau layanan, isi nama, lalu tekan kirim. Tanpa install, tanpa daftar, tanpa chat bolak-balik soal menu dan total harga.

> **Demo:** data contoh di browser · empat usaha fiktif · pesanan diteruskan ke nomor WA demo.
>
> Langsung ke usaha tertentu: `?profil=kedai-teh-rasa` · `?profil=rupa-wear` · `?profil=garis-barbershop` (tema gelap) · `?profil=kilap-auto`

## Masalah yang diselesaikan

```
Pelanggan: "ada menu apa?"      ─┐
Penjual  : (kirim foto menu)      │  5–10 chat
Pelanggan: "thai tea L berapa?"   │  per pesanan,
Penjual  : "19rb kak"             │  rawan salah hitung
Pelanggan: "totalnya jadi?"      ─┘
```

Dengan katalog, pelanggan langsung mengirim satu pesan lengkap:

```
Halo Kedai Teh Rasa, saya mau pesan:

1. Thai Tea Original x2
   Ukuran: L, Gula: Less, Es: Normal, Topping: Boba
   Rp44.000

Total: Rp44.000

Nama: Sari
Pengambilan: Ambil di outlet, secepatnya
```

## Usaha di demo

Setiap usaha tampil seperti toko sungguhan: **logo, warna, huruf, tema terang/gelap, dan sudut** sendiri, **produk dan gambar produk** sendiri. Pindah usaha lewat bagian "Usaha contoh" di bawah halaman atau `?profil=` di alamat.

| Usaha | Profil | Tampilan | Yang bisa dicoba |
|---|---|---|---|
| Kedai Teh Rasa | `kedai-teh-rasa` | oranye bata, Plus Jakarta Sans, bulat | ukuran, gula, es, topping (harga ikut berubah); waktu ambil hari ini; topping yang habis |
| Rupa Wear | `rupa-wear` | hitam, Fraunces (serif), tajam | warna & ukuran; gambar berganti sesuai warna; kombinasi habis → ukuran disesuaikan otomatis |
| Garis Barbershop | `garis-barbershop` | emas di atas gelap, Space Grotesk | booking tanggal + jam, pilih kapster, home service (+biaya) |
| Kilap Auto Detailing | `kilap-auto` | hijau toska, Space Grotesk | harga per jenis mobil, booking, home service |

Detail kecil: gambar produk 3D yang bisa diputar, kartu miring mengikuti mouse, gambar terbang ke keranjang, urungkan hapus, keranjang per usaha tersimpan saat halaman dimuat ulang. Efek 3D memakai CSS (tanpa library) dan otomatis mati bila perangkat diatur "kurangi gerakan".

## Membuat katalog untuk klien

```
src/merek/profil/<id>.json   tampilan: nama, logo, 2 warna, huruf, tema, sudut, slogan, alamat, "data"
src/data/katalog/<data>.js   isi: produk, harga, opsi, gambar, aturan antar/booking
public/merek/<id>.svg        logo & favicon
public/produk/<data>/*.svg   gambar produk (ganti dengan foto asli: .jpg/.png/.webp)
```

1. Salin satu profil, ganti `id`, `nama`, `warna`, `logo`, `teks`, dan `data`.
2. Salin satu katalog yang paling mirip (barang atau jasa), isi produknya.
3. Taruh foto produk di `public/produk/<data>/`, tulis path-nya di `gambar` (dan `gambarPer` bila foto beda per warna).
4. Situs klien: `VITE_PROFIL=<id>`, `VITE_MODE_DEMO=false` (pengalih usaha disembunyikan), `VITE_NOMOR_WA=62…`.
5. `npm test`: profil yang salah, warna yang kurang kontras, atau gambar yang filenya tidak ada langsung ketahuan.

Gambar produk di demo adalah ilustrasi SVG, bukan foto.

## Cara kerja

```
merek/profil/*.json ──→ tampilan (variabel CSS)
data/katalog/*.js ──→ halaman (satu mesin untuk semua usaha)
                   │ pilih opsi        → logika/stok.js    (habis per kombinasi)
                   │ hitung harga      → logika/harga.js   (dasar + Σ tambahan)
                   │ keranjang         → logika/keranjang.js
                   ▼
           logika/pesan.js: validasi → susun pesan → https://wa.me/62…?text=…
```

- **Satu mesin, data berbeda.** Usaha baru = profil + katalog baru; tidak ada kode khusus per usaha.
- **Harga opsi dijumlahkan**, jadi ukuran L + topping boba tidak butuh daftar harga per kombinasi.
- **Tanpa backend.** Jadwal booking tidak mencegah bentrok; penjual mengonfirmasi di WA.

## Menjalankan

Butuh Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 48 tes: logika, data katalog & gambar, profil, tampilan
npm run build
```

Nomor WA tujuan diatur lewat `VITE_NOMOR_WA` (lihat `.env.example`). Tanpa itu, dipakai nomor contoh.

## Deploy ke Vercel

1. Di Vercel: **Add New → Project → Import** repo `katalog-demo`.
2. Framework terdeteksi **Vite**; biarkan pengaturan bawaan.
3. **Environment Variables:** `VITE_NOMOR_WA` = nomor WA kamu (format `62…`). Tekan **Deploy**.

| Variabel | Fungsi | Bawaan |
|---|---|---|
| `VITE_NOMOR_WA` | nomor tujuan pesanan | `6281234567890` (contoh) |
| `VITE_PROFIL` | usaha yang tampil pertama | `kedai-teh-rasa` |
| `VITE_MODE_DEMO` | `false` = situs satu klien, tanpa pengalih usaha | demo |

## Struktur

```
src/
  merek/                profil.js (validasi profil → variabel CSS), warna.js (kontras), daftar.jsx, profil/*.json
  data/katalog/         isi katalog per jenis usaha; data/toko.js menggabungkan profil + katalog
  logika/               fungsi murni + tes (stok & gambar, harga, keranjang, waktu, pesan, formulir)
  komponen/             Tiga (panggung 3D), umum (lembar, toast, penghitung, animasi terbang)
  halaman/              Toko, DetailProduk, Keranjang
  penyimpanan.js        localStorage (dibersihkan saat dibaca)
public/merek, public/produk   logo dan gambar produk
docs/rancangan.md       sumber kebenaran: aturan, bentuk data, penjaga, batasan
```

Sistem profil diadaptasi dari kasir-stok-otomatis (`frontend/src/merek`).

Semua nama usaha dan harga di demo adalah fiktif.
