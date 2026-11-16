// Data contoh. Satu bentuk untuk semua toko: mesin katalog tidak tahu toko apa yang sedang tampil.
// Untuk klien sungguhan, cukup tulis objek toko baru dengan bentuk yang sama.
// Semua nama toko dan harga di sini fiktif.

const UKURAN_MINUMAN = { label: 'Ukuran', nilai: ['M', 'L'] };
const GULA = { label: 'Gula', nilai: ['Normal', 'Less', 'Tanpa'] };
const ES = { label: 'Es', nilai: ['Normal', 'Less'] };
const TOPPING = { label: 'Topping', nilai: ['Tanpa', 'Boba', 'Cheese foam'] };
const TAMBAH_TEH = { 'Ukuran:L': 4000, 'Topping:Boba': 3000, 'Topping:Cheese foam': 5000 };
const KAPSTER = { label: 'Kapster', nilai: ['Bebas', 'Dimas', 'Rian'] };
const JENIS_MOBIL = { label: 'Jenis mobil', nilai: ['Kecil', 'Sedang', 'SUV'] };
const tambahMobil = (sedang, suv) => ({ 'Jenis mobil:Sedang': sedang, 'Jenis mobil:SUV': suv });

export const DAFTAR_TOKO = [
  {
    id: 'fnb',
    nama: 'Kedai Teh Rasa',
    jenis: 'Minuman',
    tipe: 'barang',
    warna: '#c2410c',
    tagline: 'Thai tea dan teh susu, diseduh saat dipesan.',
    metode: ['Ambil di outlet', 'Diantar'],
    metodeAntar: 'Diantar',
    waktuAmbil: true,
    buka: 10,
    tutup: 21,
    produk: [
      { id: 'tt', nama: 'Thai Tea Original', desk: 'Teh Thailand dengan susu, manis legit.', harga: 15000, ikon: { bentuk: 'gelas', warna: '#d9661f', aksen: '#fde7d4' }, opsi: [UKURAN_MINUMAN, GULA, ES, TOPPING], tambah: TAMBAH_TEH },
      { id: 'gt', nama: 'Green Tea Latte', desk: 'Matcha lembut dengan susu segar.', harga: 16000, ikon: { bentuk: 'gelas', warna: '#5f8f3e', aksen: '#e6f2dc' }, opsi: [UKURAN_MINUMAN, GULA, ES, TOPPING], tambah: TAMBAH_TEH, habis: [['Topping:Cheese foam']] },
      { id: 'tc', nama: 'Thai Coffee', desk: 'Kopi robusta gaya Thailand, pekat.', harga: 17000, ikon: { bentuk: 'gelas', warna: '#6b4226', aksen: '#f3e6da' }, opsi: [UKURAN_MINUMAN, GULA, ES], tambah: { 'Ukuran:L': 4000 } },
      { id: 'ch', nama: 'Chocolate Milk', desk: 'Cokelat kental dan creamy.', harga: 16000, ikon: { bentuk: 'gelas', warna: '#4a2c1d', aksen: '#f1e3d8' }, opsi: [UKURAN_MINUMAN, GULA, ES], tambah: { 'Ukuran:L': 4000 } },
      { id: 'lt', nama: 'Lemon Tea', desk: 'Teh melati dengan perasan lemon.', harga: 12000, ikon: { bentuk: 'gelas', warna: '#e0a400', aksen: '#fff6d6' }, opsi: [UKURAN_MINUMAN, ES], tambah: { 'Ukuran:L': 3000 } },
    ],
  },
  {
    id: 'fashion',
    nama: 'Rupa Wear',
    jenis: 'Fashion',
    tipe: 'barang',
    warna: '#3730a3',
    tagline: 'Pakaian basic harian, bahan adem.',
    metode: ['Ambil di toko', 'Dikirim'],
    metodeAntar: 'Dikirim',
    waktuAmbil: false,
    swatch: { Hitam: '#1f2937', Putih: '#f1f5f9', Navy: '#1e3a8a', Abu: '#9ca3af', Merah: '#b91c1c', Hijau: '#166534', Krem: '#d6c4a1' },
    produk: [
      { id: 'ks', nama: 'Kaos Polos Premium', desk: 'Cotton combed 30s, potongan regular.', harga: 79000, ikon: { bentuk: 'kaos', warna: '#1f2937', aksen: '#94a3b8' },
        opsi: [{ label: 'Warna', nilai: ['Hitam', 'Putih', 'Navy'] }, { label: 'Ukuran', nilai: ['S', 'M', 'L', 'XL'] }], tambah: { 'Ukuran:XL': 10000 }, habis: [['Warna:Putih', 'Ukuran:S'], ['Warna:Navy', 'Ukuran:XL']] },
      { id: 'hd', nama: 'Hoodie Basic', desk: 'Fleece tebal dengan kantong depan.', harga: 179000, ikon: { bentuk: 'hoodie', warna: '#9ca3af', aksen: '#e5e7eb' },
        opsi: [{ label: 'Warna', nilai: ['Abu', 'Hitam'] }, { label: 'Ukuran', nilai: ['M', 'L', 'XL'] }], tambah: { 'Ukuran:XL': 15000 }, habis: [['Warna:Abu', 'Ukuran:M']] },
      { id: 'kf', nama: 'Kemeja Flanel', desk: 'Motif kotak, lengan panjang.', harga: 149000, ikon: { bentuk: 'kemeja', warna: '#b91c1c', aksen: '#fecaca' },
        opsi: [{ label: 'Motif', nilai: ['Merah', 'Hijau'] }, { label: 'Ukuran', nilai: ['S', 'M', 'L', 'XL'] }] },
      { id: 'cc', nama: 'Celana Chino', desk: 'Slim fit, bahan stretch.', harga: 159000, ikon: { bentuk: 'celana', warna: '#d6c4a1', aksen: '#a8926a' },
        opsi: [{ label: 'Warna', nilai: ['Krem', 'Hitam'] }, { label: 'Ukuran', nilai: ['28', '30', '32', '34'] }], habis: [['Warna:Krem', 'Ukuran:34']] },
    ],
  },
  {
    id: 'barber',
    nama: 'Garis Barbershop',
    jenis: 'Barbershop',
    tipe: 'jasa',
    warna: '#9f1239',
    tagline: 'Potong rapi, booking dulu biar tidak antre.',
    buka: 10,
    tutup: 21,
    lokasi: ['Di barbershop', 'Home service'],
    lokasiRumah: 'Home service',
    biayaLokasi: { 'Home service': 30000 },
    produk: [
      { id: 'pr', nama: 'Potong Rambut', desk: 'Konsultasi gaya, potong, dan styling.', harga: 40000, ikon: { bentuk: 'gunting', warna: '#9f1239', aksen: '#94a3b8' }, opsi: [KAPSTER] },
      { id: 'pc', nama: 'Potong + Cuci + Pijat', desk: 'Paket lengkap, sekitar 50 menit.', harga: 60000, ikon: { bentuk: 'sisir', warna: '#334155', aksen: '#fda4af' }, opsi: [KAPSTER] },
      { id: 'cj', nama: 'Cukur Jenggot', desk: 'Handuk hangat dan pisau cukur.', harga: 25000, ikon: { bentuk: 'pisau', warna: '#475569', aksen: '#e2e8f0' } },
      { id: 'hc', nama: 'Hair Coloring', desk: 'Harga final tergantung kondisi rambut.', harga: 150000, mulaiDari: true, ikon: { bentuk: 'botol', warna: '#7c3aed', aksen: '#f5d0fe' },
        opsi: [{ label: 'Panjang rambut', nilai: ['Pendek', 'Sedang', 'Panjang'] }], tambah: { 'Panjang rambut:Sedang': 50000, 'Panjang rambut:Panjang': 100000 } },
    ],
  },
  {
    id: 'detailing',
    nama: 'Kilap Auto Detailing',
    jenis: 'Detailing mobil',
    tipe: 'jasa',
    warna: '#0f766e',
    tagline: 'Cuci, poles, dan coating. Bisa dikerjakan di rumah.',
    buka: 8,
    tutup: 17,
    lokasi: ['Datang ke workshop', 'Home service'],
    lokasiRumah: 'Home service',
    biayaLokasi: { 'Home service': 50000 },
    produk: [
      { id: 'cp', nama: 'Cuci Premium', desk: 'Cuci body, velg, semir ban, vakum.', harga: 75000, ikon: { bentuk: 'semprot', warna: '#0f766e', aksen: '#99f6e4' }, opsi: [JENIS_MOBIL], tambah: tambahMobil(15000, 30000) },
      { id: 'pb', nama: 'Poles Body', desk: 'Hilangkan baret halus dan jamur cat.', harga: 350000, ikon: { bentuk: 'poles', warna: '#334155', aksen: '#f59e0b' }, opsi: [JENIS_MOBIL], tambah: tambahMobil(100000, 200000) },
      { id: 'nc', nama: 'Nano Ceramic Coating', desk: 'Lapisan pelindung cat, kilap tahan lama.', harga: 1500000, mulaiDari: true, ikon: { bentuk: 'mobil', warna: '#0f766e', aksen: '#ccfbf1' }, opsi: [JENIS_MOBIL], tambah: tambahMobil(300000, 600000) },
      { id: 'it', nama: 'Interior Detailing', desk: 'Jok, plafon, dashboard, dan karpet.', harga: 300000, ikon: { bentuk: 'jok', warna: '#78350f', aksen: '#fcd34d' }, opsi: [JENIS_MOBIL], tambah: tambahMobil(75000, 150000) },
    ],
  },
];

export const cariToko = (id) => DAFTAR_TOKO.find((t) => t.id === id) ?? null;
