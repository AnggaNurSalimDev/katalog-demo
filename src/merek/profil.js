/*
 * Profil usaha: satu file JSON → tampilan seluruh katalog + data katalog yang dipakai.
 * Diadaptasi dari kasir-stok-otomatis (frontend/src/merek/profil.js).
 *
 *   profil/<id>.json ──validasiProfil──▶ { profil, masalah[] }
 *                                          │
 *                         variabelCss ◀────┘
 *                              │
 *          { '--utama': '#…', '--radius': '16px', … } ──▶ <html style="…">
 *
 * Field yang salah tidak membuat aplikasi mati: diganti nilai bawaan dan dicatat di `masalah`.
 * `data` memilih katalog (produk, opsi, harga) di src/data/katalog.
 */

import { campur, hexValid, kontras, sesuaikanKontras, tintaDiAtas } from './warna.js';
import { JENIS_DATA } from '../data/katalog/index.js';

export const HURUF = {
  jakarta: "'Plus Jakarta Sans Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fraunces: "'Fraunces Variable', Georgia, 'Times New Roman', serif",
  grotesk: "'Space Grotesk Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const SUDUT = {
  tajam: { kecil: '2px', besar: '4px' },
  sedang: { kecil: '8px', besar: '14px' },
  bulat: { kecil: '12px', besar: '22px' },
};

// Warna netral & status. Status (galat) sengaja tidak ikut warna merek.
const TEMA = {
  terang: {
    '--latar': '#f6f4ef',
    '--kartu': '#ffffff',
    '--tinta': '#1b1916',
    '--redup': '#5f5a52',
    '--garis': '#e3ded4',
    '--galat': '#b42318',
    '--wa': '#15803d',
    '--pratinjau': '#e7f6ec',
  },
  gelap: {
    '--latar': '#121110',
    '--kartu': '#1d1b19',
    '--tinta': '#f2eee7',
    '--redup': '#a8a196',
    '--garis': '#34302b',
    '--galat': '#f07a70',
    '--wa': '#16a34a',
    '--pratinjau': '#10291a',
  },
};

export const PROFIL_BAWAAN = Object.freeze({
  id: 'katalog',
  nama: 'Katalog WA',
  logo: Object.freeze({ teks: 'Katalog WA', gambar: null }),
  favicon: '/favicon.svg',
  warna: Object.freeze({ utama: '#334155', aksen: '#e2e8f0' }),
  huruf: 'jakarta',
  gaya: Object.freeze({ tema: 'terang', sudut: 'sedang' }),
  teks: Object.freeze({ jenis: 'Toko', slogan: 'Pesan lebih gampang, langsung masuk WhatsApp.', alamat: null }),
  data: JENIS_DATA[0],
  fiktif: false,
});

const POLA_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KUNCI = ['id', 'nama', 'logo', 'favicon', 'warna', 'huruf', 'gaya', 'teks', 'data', 'fiktif'];

const objekBiasa = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const teksPendek = (x, maks) => typeof x === 'string' && x.trim().length > 0 && x.length <= maks;

/** Path di folder public (diawali satu "/"), bukan URL luar. */
export function pathPublik(x) {
  return typeof x === 'string' && /^\/(?!\/)[\w\-./]+$/.test(x) && !x.includes('..');
}

function ambil(mentah, kunci, cek, bawaan, masalah, pesan, jalur) {
  if (!(kunci in mentah)) return bawaan;
  if (cek(mentah[kunci])) return mentah[kunci];
  masalah.push(`${jalur}${kunci}: ${pesan}`);
  return bawaan;
}

function validasiBagian(mentah, bawaan, aturan, jalur, masalah) {
  if (mentah === undefined) return { ...bawaan };
  if (!objekBiasa(mentah)) {
    masalah.push(`${jalur.slice(0, -1)}: harus objek`);
    return { ...bawaan };
  }
  for (const k of Object.keys(mentah)) if (!(k in aturan)) masalah.push(`${jalur}${k}: field tidak dikenal`);
  const hasil = {};
  for (const [k, [cek, pesan]] of Object.entries(aturan)) hasil[k] = ambil(mentah, k, cek, bawaan[k], masalah, pesan, jalur);
  return hasil;
}

/** @returns {{ profil: object, masalah: string[] }} profil selalu lengkap dan aman dipakai. */
export function validasiProfil(mentah) {
  const masalah = [];
  const B = PROFIL_BAWAAN;
  if (!objekBiasa(mentah)) return { profil: B, masalah: ['profil harus objek JSON'] };

  for (const k of Object.keys(mentah)) if (!KUNCI.includes(k)) masalah.push(`${k}: field tidak dikenal`);

  // id wajib dan tidak diganti bawaan: dua profil ber-id sama akan saling menimpa keranjangnya.
  if (!(typeof mentah.id === 'string' && POLA_ID.test(mentah.id))) {
    return { profil: B, masalah: [...masalah, 'id: wajib, huruf kecil/angka/tanda hubung (contoh "kedai-maju")'] };
  }

  const nama = ambil(mentah, 'nama', (x) => teksPendek(x, 60), B.nama, masalah, '1–60 karakter', '');
  const profil = {
    id: mentah.id,
    nama,
    favicon: ambil(mentah, 'favicon', pathPublik, B.favicon, masalah, 'path di folder public (contoh "/merek/kedai.svg")', ''),
    huruf: ambil(mentah, 'huruf', (x) => x in HURUF, B.huruf, masalah, `salah satu: ${Object.keys(HURUF).join(', ')}`, ''),
    data: ambil(mentah, 'data', (x) => JENIS_DATA.includes(x), B.data, masalah, `salah satu: ${JENIS_DATA.join(', ')}`, ''),
    fiktif: ambil(mentah, 'fiktif', (x) => typeof x === 'boolean', false, masalah, 'true/false', ''),
    logo: validasiBagian(
      mentah.logo,
      { ...B.logo, teks: nama.length <= 40 ? nama : B.logo.teks },
      {
        teks: [(x) => teksPendek(x, 40), '1–40 karakter'],
        gambar: [(x) => x === null || pathPublik(x), 'null atau path di folder public'],
      },
      'logo.',
      masalah,
    ),
    warna: validasiBagian(mentah.warna, B.warna, { utama: [hexValid, 'format #rrggbb'], aksen: [hexValid, 'format #rrggbb'] }, 'warna.', masalah),
    gaya: validasiBagian(
      mentah.gaya,
      B.gaya,
      { tema: [(x) => x in TEMA, 'terang | gelap'], sudut: [(x) => x in SUDUT, 'tajam | sedang | bulat'] },
      'gaya.',
      masalah,
    ),
    teks: validasiBagian(
      mentah.teks,
      B.teks,
      {
        jenis: [(x) => teksPendek(x, 30), '1–30 karakter'],
        slogan: [(x) => teksPendek(x, 160), '1–160 karakter'],
        alamat: [(x) => x === null || teksPendek(x, 120), 'null atau 1–120 karakter'],
      },
      'teks.',
      masalah,
    ),
  };

  // Invariant keterbacaan: tulisan di atas warna utama (kepala, tombol) minimal 4.5:1.
  if (kontras(tintaDiAtas(profil.warna.utama), profil.warna.utama) < 4.5) {
    masalah.push(`warna.utama: ${profil.warna.utama} terlalu "tengah": tulisan putih maupun hitam di atasnya kurang terbaca (< 4.5:1).`);
  }
  return { profil, masalah };
}

/** Profil → variabel CSS. Klien cukup menulis dua warna; turunannya dihitung dengan cek kontras. */
export function variabelCss(profil) {
  if (!objekBiasa(profil) || !objekBiasa(profil.warna) || !objekBiasa(profil.gaya)) {
    throw new TypeError('variabelCss butuh profil hasil validasiProfil');
  }
  const tema = TEMA[profil.gaya.tema];
  const sudut = SUDUT[profil.gaya.sudut];
  if (!tema || !sudut || !HURUF[profil.huruf]) throw new TypeError('gaya profil tidak dikenal');

  const { utama, aksen } = profil.warna;
  const kartu = tema['--kartu'];
  const diAtasUtama = tintaDiAtas(utama);
  return {
    ...tema,
    '--utama': utama,
    '--di-atas-utama': diAtasUtama,
    '--utama-pudar': campur(utama, kartu, 0.86),
    // Teks/garis berwarna utama di atas kartu (pilihan aktif, fokus).
    '--tautan': sesuaikanKontras(utama, kartu, 4.5),
    // Aksen dipakai di atas kepala berwarna utama; kalau tidak kontras, pakai warna tulisan kepala.
    '--aksen': kontras(aksen, utama) >= 3 ? aksen : diAtasUtama,
    '--huruf': HURUF[profil.huruf],
    '--radius-kecil': sudut.kecil,
    '--radius': sudut.besar,
  };
}

/** Id profil saat dibuka: ?profil= → pilihan tersimpan → bawaan. Di luar mode demo hanya `bawaan`. */
export function pilihIdProfil({ bawaan, demo, dariUrl, dariPenyimpanan, tersedia }) {
  if (!(tersedia instanceof Set) || tersedia.size === 0) throw new TypeError('tersedia harus Set id profil yang tidak kosong');
  const awal = tersedia.has(bawaan) ? bawaan : [...tersedia][0];
  if (!demo) return awal;
  if (tersedia.has(dariUrl)) return dariUrl;
  if (tersedia.has(dariPenyimpanan)) return dariPenyimpanan;
  return awal;
}
