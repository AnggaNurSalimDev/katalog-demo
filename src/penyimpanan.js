// Keranjang & formulir disimpan di browser pengunjung, per usaha, supaya tidak hilang saat dimuat ulang.
// localStorage bisa melempar (mode privat, kuota penuh): demo tetap jalan, hanya tidak tersimpan.

import { buatToko } from './data/toko.js';
import { DAFTAR_URUT } from './merek/daftar.jsx';
import { bersihkanData } from './logika/formulir.js';

const KUNCI = 'katalog-demo-v2';
export const SEMUA_TOKO = DAFTAR_URUT.map(buatToko);

export function muatData() {
  let mentah = null;
  try {
    mentah = JSON.parse(globalThis.localStorage?.getItem(KUNCI) ?? 'null');
  } catch {
    mentah = null;
  }
  return bersihkanData(mentah, SEMUA_TOKO);
}

export function simpanData(data) {
  try {
    globalThis.localStorage?.setItem(KUNCI, JSON.stringify(data));
  } catch {
    /* abaikan: data tetap ada di memori */
  }
}
