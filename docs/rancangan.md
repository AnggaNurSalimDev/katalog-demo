# Rancangan: Katalog Online + Pesan via WhatsApp

## 1. Masalah

Banyak usaha kecil sudah menerima pesanan lewat WhatsApp, tapi masih dengan chat manual bolak-balik:
"ada menu apa?", "harganya berapa?", "totalnya jadi berapa?". Pemilik usaha lebih peduli pada
**penjualan** daripada efisiensi kerja, jadi produk ini dijual sebagai "pesanan lebih gampang masuk".

**Batasan yang disampaikan jujur ke klien:** katalog tidak mendatangkan pelanggan baru dengan sendirinya.
Fungsinya membuat pelanggan yang sudah ada (follower IG, kontak WA, orang lewat outlet) lebih gampang
dan lebih sering memesan.

## 2. Cara pelanggan memakai

```
 Bio IG/TikTok ─┐
 Status/broadcast WA ─┤
 Google Maps ─┼──► 1 link katalog ──► pilih produk/layanan ──► pesan WA tersusun ──► penjual
 QR di meja/kasir ─┘
```

1. Klik link atau scan QR. Tanpa install, tanpa daftar.
2. Pilih produk/layanan dan opsinya; isi nama dan detail.
3. Tekan "Kirim via WhatsApp": WA terbuka dengan pesan rapi, pelanggan menekan kirim.
4. Penjual membalas di WA seperti biasa.

## 3. Ruang lingkup demo

Satu link, empat toko contoh:

Setiap usaha punya **profil** sendiri (logo, warna, huruf, tema, sudut, slogan, **tata letak** dan **benda 3D** di kepala toko) dan **katalog** sendiri
(produk dengan gambar masing-masing). Dipilih lewat `?profil=<id>` atau pengalih "Usaha contoh"; tidak ada
halaman beranda umum, karena klien harus melihat demo sebagai toko sungguhan.

| Usaha | Tipe | Yang diuji |
|---|---|---|
| F&B (Kedai Teh Rasa) | barang | varian + opsi, harga berubah sesuai pilihan, waktu ambil |
| Fashion (Rupa Wear) | barang | warna & ukuran, stok habis per kombinasi, warna ikon ikut pilihan |
| Barbershop (Garis) | jasa | booking tanggal + jam, kapster, home service |
| Detailing (Kilap Auto) | jasa | harga per jenis mobil, booking, home service |

## 4. Prinsip: satu mesin, data berbeda

Mesin katalog tidak tahu toko apa yang tampil. Untuk klien sungguhan cukup menulis data toko baru.

### 4.1 Bentuk data

```
profil (src/merek/profil/<id>.json)          katalog (src/data/katalog/<data>.js)
{ id, nama, data: 'teh', logo, favicon,  ─┐   { id: 'teh', tipe, produk, ... }
  warna: { utama, aksen }, huruf,         │          │
  gaya: { tema, sudut }, teks }           └──────────┴─▶ toko = { ...katalog, id: profil.id, nama: profil.nama }
```

id toko = id profil: keranjang dan formulir disimpan per usaha.

Tata letak (`gaya.tata`) dan benda 3D (`hero.bentuk`) dipilih dari daftar tetap; markup sama, hanya CSS yang berubah:

| tata | susunan | hero.bentuk | benda 3D |
|---|---|---|---|
| kafe | kartu dengan piring bulat, harga stiker | melayang | gambar di atas tatakan berputar |
| lookbook | gambar tinggi, produk pertama besar | gantung | gambar berayun di hanger |
| daftar | daftar harga seperti papan dinding | tiang | tiang barbershop (tanpa gambar) |
| garasi | kartu mendatar, kilap logam | putar | gambar di meja putar + pantulan |

```js
katalog = {
  id, tipe: 'barang' | 'jasa',
  // barang
  metode: ['Ambil di outlet', 'Diantar'], metodeAntar: 'Diantar', waktuAmbil: true,
  // jasa
  lokasi: ['Di barbershop', 'Home service'], lokasiRumah: 'Home service', biayaLokasi: { 'Home service': 30000 },
  buka: 10, tutup: 21,          // jam, untuk slot booking/ambil
  swatch: { Hitam: '#1f2937' }, // opsional: titik warna di tombol pilihan Warna/Motif
  produk: [{
    id, nama, desk, harga,                   // harga dasar, rupiah bulat
    gambar: '/produk/teh/thai-tea.svg',      // wajib, file harus ada di public/
    gambarPer: { 'Warna:Putih': '/produk/fashion/kaos-putih.svg' },  // opsional
    opsi: [{ label: 'Ukuran', nilai: ['M', 'L'] }],
    tambah: { 'Ukuran:L': 4000 },            // DIJUMLAHKAN ke harga dasar
    habis: [['Warna:Putih', 'Ukuran:S']],    // kombinasi yang tidak tersedia
    mulaiDari: true,                         // harga final dikonfirmasi penjual
  }],
}
```

### 4.2 Harga

```
harga satuan = harga dasar + Σ tambah[opsi terpilih]
subtotal     = Σ harga satuan × jumlah
total        = subtotal + biayaLokasi[lokasi]   (jasa saja)
```

Tambahan **dijumlahkan**, bukan mengganti harga, karena dua opsi yang sama-sama mengubah harga
(mis. ukuran L + topping boba) harus bisa digabung tanpa daftar harga per kombinasi.

### 4.3 Stok habis

- Habis dicatat per **kombinasi**, bukan per nilai (Putih tersedia, tapi Putih + S habis).
- Nilai yang tidak pernah tersedia di kombinasi mana pun: tombolnya mati.
- Memilih nilai yang habis di kombinasi sekarang: opsi lain disesuaikan seminimal mungkin, dan pelanggan diberi tahu.

### 4.4 Barang vs jasa

| Barang | Jasa |
|---|---|
| jumlah 1–99 | selalu 1, layanan sama tidak boleh dobel |
| ambil / antar (alamat wajib bila antar) | tanggal + jam booking, lokasi (alamat wajib bila home service) |
| waktu ambil hari ini (F&B) | slot 30 menit, jam buka sampai 1 jam sebelum tutup |

## 5. Penjaga (guard & invarian)

Kesalahan pengguna dikembalikan sebagai daftar pesan; pelanggaran invarian (bug/data rusak) dilempar.

- Jumlah bilangan bulat 1–99.
- Kombinasi habis tidak bisa masuk keranjang, dan dicek ulang saat kirim.
- Booking tidak boleh di tanggal lewat atau jam < 30 menit dari sekarang; ambil F&B minimal 15 menit.
- Pesan tidak bisa dikirim bila keranjang kosong, nama < 2 huruf, atau alamat < 10 huruf saat dibutuhkan.
- Nomor WA toko harus format `62` + 8–13 digit sebelum link dibuat.
- Harga & total: bilangan bulat ≥ 0.
- Data dari localStorage tidak dipercaya: item yang tidak cocok dengan katalog dibuang.
- Profil divalidasi: field salah diganti bawaan dan dicatat; logo/favicon hanya path lokal; tulisan di atas warna utama ≥ 4.5:1.
- Setiap path gambar produk dicek ada filenya (tes).

## 6. Batasan demo

- Tanpa backend: jadwal **tidak bisa mencegah bentrok**. Pelanggan mengajukan jam, penjual konfirmasi di WA.
  Slot otomatis = paket upgrade.
- Stok habis statis (diatur di data).
- Ongkir tidak dihitung; pesan meminta penjual menginfokan.
- Gambar produk di demo adalah ilustrasi SVG; untuk klien sungguhan diganti foto produk.

## 7. Di luar ruang lingkup

Pembayaran online, akun pelanggan, dashboard penjual, notifikasi, stok real-time.
Produk turunan (dijual setelah klien percaya): kartu member/stempel digital, pre-order, QR promo terukur.

## 8. Validasi (masih asumsi)

Asumsi: pemilik usaha mau membayar untuk merapikan pesanan WA.
Cara cek: tunjukkan demo ke minimal 5 pemilik usaha dan tanya "mau bayar berapa?".
