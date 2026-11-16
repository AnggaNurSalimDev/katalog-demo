// Opsi produk dan ketersediaan kombinasi.
//
//   produk.opsi  = [{ label: 'Warna', nilai: ['Hitam','Putih'] }, { label: 'Ukuran', nilai: ['S','M'] }]
//   pilihan      = { Warna: 'Putih', Ukuran: 'S' }
//   produk.habis = [['Warna:Putih', 'Ukuran:S']]   → kombinasi ini tidak bisa dipesan

import { invarian } from './galat.js';

export const kunci = (label, nilai) => `${label}:${nilai}`;

function pecahKunci(k) {
  const i = typeof k === 'string' ? k.indexOf(':') : -1;
  invarian(i > 0, `kunci opsi tidak sah: ${k}`);
  return [k.slice(0, i), k.slice(i + 1)];
}

export const cariProduk = (toko, id) => toko?.produk.find((p) => p.id === id) ?? null;

/** Semua kombinasi pilihan. Produk tanpa opsi → [{}]. */
export function semuaKombinasi(produk) {
  return (produk.opsi ?? []).reduce((acc, o) => acc.flatMap((c) => o.nilai.map((v) => ({ ...c, [o.label]: v }))), [{}]);
}

/** Pilihan lengkap & setiap nilainya ada di daftar opsi. */
export function pilihanSah(produk, pilihan) {
  if (!pilihan || typeof pilihan !== 'object') return false;
  return (produk.opsi ?? []).every((o) => o.nilai.includes(pilihan[o.label]));
}

export function isHabis(produk, pilihan) {
  return (produk.habis ?? []).some((kombo) =>
    kombo.every((k) => {
      const [l, v] = pecahKunci(k);
      return pilihan[l] === v;
    }),
  );
}

/** Apakah nilai ini masih mungkin dipilih (ada minimal satu kombinasi yang tersedia)? */
export const bisaTersedia = (produk, label, nilai) => semuaKombinasi(produk).some((c) => c[label] === nilai && !isHabis(produk, c));

/** Kombinasi tersedia pertama, untuk pilihan awal di lembar detail. */
export function pilihanAwal(produk) {
  const semua = semuaKombinasi(produk);
  return semua.find((c) => !isHabis(produk, c)) ?? semua[0];
}

/**
 * Ganti satu opsi. Kalau kombinasinya habis, opsi LAIN disesuaikan seminimal mungkin
 * (dipilih kombinasi tersedia yang paling banyak sama dengan pilihan sebelumnya).
 * → { pilihan, diubah: ['Ukuran'] } atau null bila nilai itu tidak pernah tersedia.
 */
export function pilihOpsi(produk, pilihan, label, nilai) {
  const opsi = (produk.opsi ?? []).find((o) => o.label === label);
  if (!opsi || !opsi.nilai.includes(nilai)) return null;
  const berikut = { ...pilihan, [label]: nilai };
  if (!isHabis(produk, berikut)) return { pilihan: berikut, diubah: [] };

  let terbaik = null;
  let skor = -1;
  for (const c of semuaKombinasi(produk)) {
    if (c[label] !== nilai || isHabis(produk, c)) continue;
    const s = Object.keys(c).filter((x) => c[x] === berikut[x]).length;
    if (s > skor) {
      terbaik = c;
      skor = s;
    }
  }
  if (!terbaik) return null;
  return { pilihan: terbaik, diubah: Object.keys(terbaik).filter((x) => terbaik[x] !== berikut[x]) };
}

/**
 * Gambar yang tampil untuk pilihan ini: gambarPer['Warna:Putih'] bila ada, selain itu gambar utama.
 *   { gambar: '/produk/fashion/kaos-hitam.svg', gambarPer: { 'Warna:Putih': '/…/kaos-putih.svg' } }
 */
export function gambarProduk(produk, pilihan) {
  invarian(typeof produk?.gambar === 'string', `gambar ${produk?.id} wajib ada`);
  for (const o of produk.opsi ?? []) {
    const g = produk.gambarPer?.[kunci(o.label, pilihan?.[o.label])];
    if (g) return g;
  }
  return produk.gambar;
}

export const teksOpsi =(produk, pilihan) => (produk.opsi ?? []).map((o) => `${o.label}: ${pilihan[o.label]}`).join(', ');
