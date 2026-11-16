# Katalog Demo

Sumber kebenaran: **`docs/rancangan.md`**. Baca seluruhnya sebelum menulis kode.

- Yang dibangun: **web demo** React + Vite, frontend saja, data keranjang di localStorage, deploy Vercel.
- Tidak ada backend: pesanan dikirim dengan membuka link `wa.me` berisi pesan tersusun.

## Aturan kerja

- Ikuti rancangan. Jika ada yang ambigu atau bertentangan, **tanyakan dulu**, jangan menebak diam-diam.
- Jangan menambah fitur di luar rancangan (bagian 7 "Di luar ruang lingkup").
- Satu mesin, data berbeda: halaman tidak boleh punya `if (toko.id === 'kedai-teh-rasa')`. Perbedaan antar usaha hanya lewat profil (`src/merek/profil/*.json`, tampilan) dan katalog (`src/data/katalog/*.js`, isi).
- Warna, huruf, dan sudut di CSS selalu lewat variabel profil (`--utama`, `--di-atas-utama`, `--tautan`, `--radius`, …), bukan warna tetap.
- Path aset di data ditulis dari akar public (`/produk/…`) dan ditampilkan lewat `aset()` supaya tetap benar bila base URL berubah.
- Logika di `src/logika/` sebagai fungsi murni: tanpa localStorage, DOM, atau `Date.now()` langsung (waktu dikirim sebagai argumen `sekarang`).
- Selalu sertakan guard clause dan invariant check.
- Uang: bilangan bulat rupiah. Harga opsi dijumlahkan (`tambah`), tidak mengganti harga dasar.
- Operasi keranjang mengembalikan array baru; jangan mengubah array lama.
- Bahasa antarmuka dan nama di kode: Indonesia.

## Saat menjelaskan perubahan ke pemilik proyek

- Bagian sensitif (hitung harga/total, validasi pesanan, isi pesan WA, data tersimpan): beri konteks singkat — aturan yang disentuh, lokasi file, titik rawan — lalu tanyakan apakah perlu penelusuran detail.
- Bagian lain: jelaskan hanya jika diminta.
- Sertakan diagram sederhana (kotak/garis) yang menunjukkan alur data atau perubahan bentuk data.
