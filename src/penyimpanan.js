// Keranjang & formulir disimpan di browser pengunjung, supaya tidak hilang saat halaman dimuat ulang.
// localStorage bisa melempar (mode privat, kuota penuh): demo tetap jalan, hanya tidak tersimpan.

import { DAFTAR_TOKO } from './data/toko.js';
import { bersihkanData } from './logika/formulir.js';

const KUNCI = 'katalog-demo-v1';

export function muatData() {
  let mentah = null;
  try {
    mentah = JSON.parse(globalThis.localStorage?.getItem(KUNCI) ?? 'null');
  } catch {
    mentah = null;
  }
  return bersihkanData(mentah, DAFTAR_TOKO);
}

export function simpanData(data) {
  try {
    globalThis.localStorage?.setItem(KUNCI, JSON.stringify(data));
  } catch {
    /* abaikan: data tetap ada di memori */
  }
}
