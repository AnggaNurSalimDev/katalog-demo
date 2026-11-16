// Kedai minuman. Semua harga contoh, bukan harga usaha mana pun.
const UKURAN = { label: 'Ukuran', nilai: ['M', 'L'] };
const GULA = { label: 'Gula', nilai: ['Normal', 'Less', 'Tanpa'] };
const ES = { label: 'Es', nilai: ['Normal', 'Less'] };
const TOPPING = { label: 'Topping', nilai: ['Tanpa', 'Boba', 'Cheese foam'] };
const TAMBAH_TEH = { 'Ukuran:L': 4000, 'Topping:Boba': 3000, 'Topping:Cheese foam': 5000 };
const g = (nama) => `/produk/teh/${nama}.svg`;

export default {
  id: 'teh',
  tipe: 'barang',
  metode: ['Ambil di outlet', 'Diantar'],
  metodeAntar: 'Diantar',
  waktuAmbil: true,
  buka: 10,
  tutup: 21,
  produk: [
    { id: 'tt', nama: 'Thai Tea Original', desk: 'Teh Thailand dengan susu, manis legit.', harga: 15000, gambar: g('thai-tea'), opsi: [UKURAN, GULA, ES, TOPPING], tambah: TAMBAH_TEH },
    { id: 'gt', nama: 'Green Tea Latte', desk: 'Matcha lembut dengan susu segar.', harga: 16000, gambar: g('green-tea-latte'), opsi: [UKURAN, GULA, ES, TOPPING], tambah: TAMBAH_TEH, habis: [['Topping:Cheese foam']] },
    { id: 'tc', nama: 'Thai Coffee', desk: 'Kopi robusta gaya Thailand, pekat.', harga: 17000, gambar: g('thai-coffee'), opsi: [UKURAN, GULA, ES], tambah: { 'Ukuran:L': 4000 } },
    { id: 'ch', nama: 'Chocolate Milk', desk: 'Cokelat kental dengan krim di atasnya.', harga: 16000, gambar: g('chocolate-milk'), opsi: [UKURAN, GULA, ES], tambah: { 'Ukuran:L': 4000 } },
    { id: 'lt', nama: 'Lemon Tea', desk: 'Teh melati dengan perasan lemon segar.', harga: 12000, gambar: g('lemon-tea'), opsi: [UKURAN, ES], tambah: { 'Ukuran:L': 3000 } },
  ],
};
