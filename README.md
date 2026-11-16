# Katalog Demo

Katalog online untuk **usaha kecil** yang pesanannya langsung tersusun rapi di **WhatsApp penjual**: pelanggan pilih produk atau layanan, isi nama, lalu tekan kirim. Tanpa install, tanpa daftar, tanpa chat bolak-balik soal menu dan total harga.

> **Demo:** data contoh di browser · empat toko fiktif · pesanan diteruskan ke nomor WA demo.

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

## Toko di demo

| Toko | Jenis | Yang bisa dicoba |
|---|---|---|
| Kedai Teh Rasa | Minuman | ukuran, gula, es, topping (harga ikut berubah); waktu ambil hari ini; topping yang habis |
| Rupa Wear | Fashion | warna & ukuran; kombinasi yang habis (ukuran disesuaikan otomatis); warna produk ikut pilihan |
| Garis Barbershop | Jasa | booking tanggal + jam, pilih kapster, home service (+biaya) |
| Kilap Auto Detailing | Jasa | harga per jenis mobil, booking, home service |

Detail kecil: kubus 3D di beranda, produk 3D yang bisa diputar, ikon terbang ke keranjang, urungkan hapus, keranjang tersimpan saat halaman dimuat ulang. Semua efek 3D memakai CSS (tanpa library) dan otomatis mati bila perangkat diatur "kurangi gerakan".

## Cara kerja

```
data/toko.js ──→ halaman (satu mesin untuk semua toko)
                   │ pilih opsi        → logika/stok.js    (habis per kombinasi)
                   │ hitung harga      → logika/harga.js   (dasar + Σ tambahan)
                   │ keranjang         → logika/keranjang.js
                   ▼
           logika/pesan.js: validasi → susun pesan → https://wa.me/62…?text=…
```

- **Satu mesin, data berbeda.** Toko baru = objek data baru; tidak ada kode khusus per toko.
- **Harga opsi dijumlahkan**, jadi ukuran L + topping boba tidak butuh daftar harga per kombinasi.
- **Tanpa backend.** Jadwal booking tidak mencegah bentrok; penjual mengonfirmasi di WA.

## Menjalankan

Butuh Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # 31 tes: logika, data katalog, tampilan
npm run build
```

Nomor WA tujuan diatur lewat `VITE_NOMOR_WA` (lihat `.env.example`). Tanpa itu, dipakai nomor contoh.

## Deploy ke Vercel

1. Di Vercel: **Add New → Project → Import** repo `katalog-demo`.
2. Framework terdeteksi **Vite**; biarkan pengaturan bawaan.
3. **Environment Variables:** `VITE_NOMOR_WA` = nomor WA kamu (format `62…`). Tekan **Deploy**.

## Struktur

```
src/
  data/toko.js          data 4 toko contoh
  logika/               fungsi murni + tes (stok, harga, keranjang, waktu, pesan, formulir)
  komponen/             Ikon (SVG), Tiga (kubus & panggung 3D), umum (lembar, toast, penghitung)
  halaman/              Beranda, Toko, DetailProduk, Keranjang
  penyimpanan.js        localStorage (dibersihkan saat dibaca)
docs/rancangan.md       sumber kebenaran: aturan, bentuk data, penjaga, batasan
```

Semua nama usaha dan harga di demo adalah fiktif.
