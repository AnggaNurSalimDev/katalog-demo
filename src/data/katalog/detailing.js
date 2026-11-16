// Detailing mobil (jasa, booking). Harga naik sesuai jenis mobil.
const g = (nama) => `/produk/detailing/${nama}.svg`;
const JENIS_MOBIL = { label: 'Jenis mobil', nilai: ['Kecil', 'Sedang', 'SUV'] };
const per = (sedang, suv) => ({ 'Jenis mobil:Sedang': sedang, 'Jenis mobil:SUV': suv });

export default {
  id: 'detailing',
  tipe: 'jasa',
  buka: 8,
  tutup: 17,
  lokasi: ['Datang ke workshop', 'Home service'],
  lokasiRumah: 'Home service',
  biayaLokasi: { 'Home service': 50000 },
  produk: [
    { id: 'cp', nama: 'Cuci Premium', desk: 'Cuci body, velg, semir ban, vakum.', harga: 75000, gambar: g('cuci-premium'), opsi: [JENIS_MOBIL], tambah: per(15000, 30000) },
    { id: 'pb', nama: 'Poles Body', desk: 'Hilangkan baret halus dan jamur cat.', harga: 350000, gambar: g('poles-body'), opsi: [JENIS_MOBIL], tambah: per(100000, 200000) },
    { id: 'nc', nama: 'Nano Ceramic Coating', desk: 'Lapisan pelindung cat, kilap tahan lama.', harga: 1500000, mulaiDari: true, gambar: g('nano-ceramic'), opsi: [JENIS_MOBIL], tambah: per(300000, 600000) },
    { id: 'it', nama: 'Interior Detailing', desk: 'Jok, plafon, dashboard, dan karpet.', harga: 300000, gambar: g('interior'), opsi: [JENIS_MOBIL], tambah: per(75000, 150000) },
  ],
};
