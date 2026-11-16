// Operasi keranjang. Semua fungsi mengembalikan array BARU (tidak mengubah yang lama),
// supaya React tahu ada perubahan dan "urungkan" cukup menyimpan array lama.
//
//   isi = [{ produkId: 'tt', pilihan: { Ukuran: 'L', ... }, jumlah: 2 }, ...]

import { isHabis, pilihanSah } from './stok.js';

export const BATAS_JUMLAH = 99;

export const kunciItem = (produk, pilihan) => `${produk.id}|${(produk.opsi ?? []).map((o) => pilihan[o.label]).join('/')}`;

/** → { isi, hasil } dengan hasil: DITAMBAH | DIGABUNG | SUDAH_ADA | HABIS | TIDAK_SAH */
export function tambahItem(toko, isi, produk, pilihan, jumlah) {
  if (!produk || !pilihanSah(produk, pilihan)) return { isi, hasil: 'TIDAK_SAH' };
  if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > BATAS_JUMLAH) return { isi, hasil: 'TIDAK_SAH' };
  if (isHabis(produk, pilihan)) return { isi, hasil: 'HABIS' };

  const k = kunciItem(produk, pilihan);
  const i = isi.findIndex((it) => it.produkId === produk.id && kunciItem(produk, it.pilihan) === k);

  if (toko.tipe === 'jasa') {
    // Jasa: satu layanan cukup sekali per booking.
    if (i >= 0) return { isi, hasil: 'SUDAH_ADA' };
    return { isi: [...isi, { produkId: produk.id, pilihan: { ...pilihan }, jumlah: 1 }], hasil: 'DITAMBAH' };
  }
  if (i >= 0) {
    return { isi: isi.map((it, j) => (j === i ? { ...it, jumlah: Math.min(BATAS_JUMLAH, it.jumlah + jumlah) } : it)), hasil: 'DIGABUNG' };
  }
  return { isi: [...isi, { produkId: produk.id, pilihan: { ...pilihan }, jumlah }], hasil: 'DITAMBAH' };
}

export function ubahJumlah(isi, indeks, selisih) {
  if (!isi[indeks] || !Number.isInteger(selisih)) return isi;
  return isi.map((it, j) => (j === indeks ? { ...it, jumlah: Math.max(1, Math.min(BATAS_JUMLAH, it.jumlah + selisih)) } : it));
}

export function hapusItem(isi, indeks) {
  if (!isi[indeks]) return { isi, dihapus: null };
  return { isi: isi.filter((_, j) => j !== indeks), dihapus: isi[indeks] };
}

export function kembalikanItem(isi, item, indeks) {
  const i = Math.max(0, Math.min(indeks, isi.length));
  return [...isi.slice(0, i), item, ...isi.slice(i)];
}

export const jumlahItem = (isi) => isi.reduce((t, it) => t + it.jumlah, 0);
