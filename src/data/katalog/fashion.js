// Toko pakaian. Gambar produk berganti mengikuti pilihan Warna/Motif (gambarPer).
const g = (nama) => `/produk/fashion/${nama}.svg`;
const perWarna = (dasar, label, daftar) => Object.fromEntries(daftar.map((w) => [`${label}:${w}`, g(`${dasar}-${w.toLowerCase()}`)]));

export default {
  id: 'fashion',
  tipe: 'barang',
  metode: ['Ambil di toko', 'Dikirim'],
  metodeAntar: 'Dikirim',
  waktuAmbil: false,
  swatch: { Hitam: '#1f2937', Putih: '#f4f4f2', Navy: '#1e3a8a', Abu: '#9ca3af', Merah: '#b91c1c', Hijau: '#166534', Krem: '#d6c4a1' },
  produk: [
    { id: 'ks', nama: 'Kaos Polos Premium', desk: 'Cotton combed 30s, potongan regular.', harga: 79000, gambar: g('kaos-hitam'), gambarPer: perWarna('kaos', 'Warna', ['Hitam', 'Putih', 'Navy']),
      opsi: [{ label: 'Warna', nilai: ['Hitam', 'Putih', 'Navy'] }, { label: 'Ukuran', nilai: ['S', 'M', 'L', 'XL'] }], tambah: { 'Ukuran:XL': 10000 }, habis: [['Warna:Putih', 'Ukuran:S'], ['Warna:Navy', 'Ukuran:XL']] },
    { id: 'hd', nama: 'Hoodie Basic', desk: 'Fleece tebal dengan kantong depan.', harga: 179000, gambar: g('hoodie-abu'), gambarPer: perWarna('hoodie', 'Warna', ['Abu', 'Hitam']),
      opsi: [{ label: 'Warna', nilai: ['Abu', 'Hitam'] }, { label: 'Ukuran', nilai: ['M', 'L', 'XL'] }], tambah: { 'Ukuran:XL': 15000 }, habis: [['Warna:Abu', 'Ukuran:M']] },
    { id: 'kf', nama: 'Kemeja Flanel', desk: 'Motif kotak, lengan panjang.', harga: 149000, gambar: g('kemeja-merah'), gambarPer: perWarna('kemeja', 'Motif', ['Merah', 'Hijau']),
      opsi: [{ label: 'Motif', nilai: ['Merah', 'Hijau'] }, { label: 'Ukuran', nilai: ['S', 'M', 'L', 'XL'] }] },
    { id: 'cc', nama: 'Celana Chino', desk: 'Slim fit, bahan stretch.', harga: 159000, gambar: g('celana-krem'), gambarPer: perWarna('celana', 'Warna', ['Krem', 'Hitam']),
      opsi: [{ label: 'Warna', nilai: ['Krem', 'Hitam'] }, { label: 'Ukuran', nilai: ['28', '30', '32', '34'] }], habis: [['Warna:Krem', 'Ukuran:34']] },
  ],
};
