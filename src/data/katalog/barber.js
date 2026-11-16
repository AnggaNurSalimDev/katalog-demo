// Barbershop (jasa, booking).
const g = (nama) => `/produk/barber/${nama}.svg`;
const KAPSTER = { label: 'Kapster', nilai: ['Bebas', 'Dimas', 'Rian'] };

export default {
  id: 'barber',
  tipe: 'jasa',
  buka: 10,
  tutup: 21,
  lokasi: ['Di barbershop', 'Home service'],
  lokasiRumah: 'Home service',
  biayaLokasi: { 'Home service': 30000 },
  produk: [
    { id: 'pr', nama: 'Potong Rambut', desk: 'Konsultasi gaya, potong, dan styling.', harga: 40000, gambar: g('potong-rambut'), opsi: [KAPSTER] },
    { id: 'pc', nama: 'Potong + Cuci + Pijat', desk: 'Paket lengkap, sekitar 50 menit.', harga: 60000, gambar: g('potong-cuci-pijat'), opsi: [KAPSTER] },
    { id: 'cj', nama: 'Cukur Jenggot', desk: 'Handuk hangat dan pisau cukur.', harga: 25000, gambar: g('cukur-jenggot') },
    { id: 'hc', nama: 'Hair Coloring', desk: 'Harga final tergantung kondisi rambut.', harga: 150000, mulaiDari: true, gambar: g('hair-coloring'),
      opsi: [{ label: 'Panjang rambut', nilai: ['Pendek', 'Sedang', 'Panjang'] }], tambah: { 'Panjang rambut:Sedang': 50000, 'Panjang rambut:Panjang': 100000 } },
  ],
};
