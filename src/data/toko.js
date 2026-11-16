// Toko = katalog (isi & aturan) + nama dari profil (tampilan).
//
//   profil { id: 'kedai-teh-rasa', nama, data: 'teh', ... } ─┐
//   KATALOG.teh { tipe, produk, metode, ... }               ─┴─▶ toko { ...katalog, id: profil.id, nama }
//
// id toko = id profil, supaya dua profil yang memakai katalog sama punya keranjang sendiri-sendiri.

import { KATALOG } from './katalog/index.js';
import { invarian } from '../logika/galat.js';

export function buatToko(profil) {
  const katalog = KATALOG[profil?.data];
  invarian(katalog, `katalog "${profil?.data}" tidak ada`);
  return { ...katalog, katalog: katalog.id, id: profil.id, nama: profil.nama };
}
