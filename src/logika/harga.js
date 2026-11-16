// Harga = harga dasar + jumlah semua tambahan dari opsi yang dipilih.
//
//   Thai Tea 15.000  + Ukuran:L 4.000 + Topping:Boba 3.000 = 22.000
//
// Sengaja menjumlahkan (bukan mengganti harga), supaya dua opsi yang
// sama-sama mengubah harga bisa digabung tanpa daftar harga per kombinasi.

import { invarian } from './galat.js';
import { cariProduk, kunci } from './stok.js';

const uangSah = (n) => Number.isInteger(n) && n >= 0;

export function hargaSatuan(produk, pilihan) {
  invarian(uangSah(produk.harga), `harga dasar ${produk.id}`);
  let h = produk.harga;
  for (const o of produk.opsi ?? []) {
    const t = produk.tambah?.[kunci(o.label, pilihan[o.label])] ?? 0;
    invarian(uangSah(t), `tambahan harga ${produk.id}`);
    h += t;
  }
  return h;
}

/** Hanya harga dasar + tambahan termurah: yang ditampilkan "mulai Rp…" di kartu. */
export const adaVariasiHarga = (produk) => Boolean(produk.mulaiDari) || Object.keys(produk.tambah ?? {}).length > 0;

export function hitungTotal(toko, isi, form) {
  let subtotal = 0;
  let perkiraan = false;
  for (const it of isi) {
    const p = cariProduk(toko, it.produkId);
    invarian(p, `produk ${it.produkId} tidak ada di ${toko.id}`);
    invarian(Number.isInteger(it.jumlah) && it.jumlah >= 1, `jumlah ${it.produkId}`);
    subtotal += hargaSatuan(p, it.pilihan) * it.jumlah;
    if (p.mulaiDari) perkiraan = true;
  }
  const ekstra = toko.tipe === 'jasa' ? (toko.biayaLokasi?.[form?.lokasi] ?? 0) : 0;
  invarian(uangSah(ekstra), 'biaya lokasi');
  const total = subtotal + ekstra;
  invarian(uangSah(total), 'total');
  return { subtotal, ekstra, total, perkiraan };
}
