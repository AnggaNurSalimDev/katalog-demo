// Waktu dalam jam lokal perangkat. Fungsi menerima `sekarang` (Date) sebagai argumen,
// tidak memanggil Date.now() sendiri, supaya bisa diuji dengan jam tetap.

import { invarian } from './galat.js';

export const JEDA_BOOKING = 30; // menit: booking minimal 30 menit dari sekarang
export const JEDA_AMBIL = 15; // menit: pesanan F&B butuh waktu dibuat

const dua = (n) => String(n).padStart(2, '0');

/** Date → "2026-11-16" (tanggal lokal, bukan UTC). */
export const tanggalLokal = (d) => `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
export const menitHariIni = (d) => d.getHours() * 60 + d.getMinutes();

/** "14:30" → 870; format salah → NaN. */
export function keMenit(jam) {
  const m = /^(\d{2}):(\d{2})$/.exec(jam ?? '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
}

/** Slot tiap 30 menit dari jam buka sampai 1 jam sebelum tutup. */
export function slotJam(toko, tanggal, sekarang, jedaMenit) {
  invarian(Number.isInteger(toko.buka) && Number.isInteger(toko.tutup) && toko.buka < toko.tutup, `jam buka ${toko.id}`);
  const hariIni = tanggal === tanggalLokal(sekarang);
  const kini = menitHariIni(sekarang);
  const hasil = [];
  for (let m = toko.buka * 60; m <= (toko.tutup - 1) * 60; m += 30) {
    hasil.push({ jam: `${dua(Math.floor(m / 60))}:${dua(m % 60)}`, lewat: hariIni && m <= kini + jedaMenit });
  }
  return hasil;
}

export function formatTanggal(t) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t ?? '')) return '-';
  const d = new Date(`${t}T00:00`);
  return Number.isNaN(d.getTime()) ? '-' : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export const formatJam = (j) => (j ? j.replace(':', '.') : '-');
