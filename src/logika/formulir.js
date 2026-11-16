// Formulir pemesan per toko, dan pembersih data yang dibaca dari penyimpanan.
//
//   barang: { nama, metode, jam, alamat, catatan }
//   jasa  : { nama, tanggal, jam, lokasi, alamat, catatan }

import { BATAS_JUMLAH } from './keranjang.js';
import { cariProduk, pilihanSah } from './stok.js';

export function formAwal(toko) {
  if (toko.tipe === 'jasa') return { nama: '', tanggal: '', jam: '', lokasi: toko.lokasi[0], alamat: '', catatan: '' };
  return { nama: '', metode: toko.metode[0], jam: 'Secepatnya', alamat: '', catatan: '' };
}

/** Barang: alamat wajib bila diantar/dikirim. Jasa: wajib bila home service. */
export function perluAlamat(toko, form) {
  return toko.tipe === 'barang' ? form.metode === toko.metodeAntar : form.lokasi === toko.lokasiRumah;
}

/**
 * Data dari localStorage tidak dipercaya: bisa rusak, versi lama, atau diubah tangan.
 * Item yang tidak cocok dengan katalog sekarang dibuang; kolom formulir yang aneh kembali ke awal.
 */
export function bersihkanData(mentah, daftarToko) {
  const d = mentah && typeof mentah === 'object' ? mentah : {};
  const keranjang = {};
  const formulir = {};
  for (const toko of daftarToko) {
    const isi = Array.isArray(d.keranjang?.[toko.id]) ? d.keranjang[toko.id] : [];
    keranjang[toko.id] = isi.filter((it) => {
      const p = it && cariProduk(toko, it.produkId);
      return p && pilihanSah(p, it.pilihan) && Number.isInteger(it.jumlah) && it.jumlah >= 1 && it.jumlah <= BATAS_JUMLAH;
    });

    const f = formAwal(toko);
    const simpan = d.formulir?.[toko.id] ?? {};
    for (const k of Object.keys(f)) if (typeof simpan[k] === 'string') f[k] = simpan[k];
    if (toko.tipe === 'jasa' && !toko.lokasi.includes(f.lokasi)) f.lokasi = toko.lokasi[0];
    if (toko.tipe === 'barang' && !toko.metode.includes(f.metode)) f.metode = toko.metode[0];
    formulir[toko.id] = f;
  }
  return { keranjang, formulir };
}
