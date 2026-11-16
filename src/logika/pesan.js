// Dari keranjang + formulir → pesan WhatsApp.
//
//   isi [{produkId, pilihan, jumlah}] ─┐
//   form {nama, metode/lokasi, ...}  ──┼─→ validasiPesanan → [] (siap) / ['Isi nama…', …]
//   toko (data)                      ──┘
//                                      └─→ buatPesan → "Halo …, saya mau pesan:\n1. …"
//                                                     └─→ linkWa → https://wa.me/62…?text=…

import { invarian } from './galat.js';
import { hargaSatuan, hitungTotal } from './harga.js';
import { cariProduk, isHabis, pilihanSah, teksOpsi } from './stok.js';
import { BATAS_JUMLAH } from './keranjang.js';
import { JEDA_AMBIL, JEDA_BOOKING, formatJam, formatTanggal, keMenit, menitHariIni, tanggalLokal } from './waktu.js';
import { perluAlamat } from './formulir.js';

export const nomorWaSah = (n) => /^62\d{8,13}$/.test(n ?? '');

const rp = (n) => `Rp${n.toLocaleString('id-ID')}`;

/** Kesalahan yang bisa diperbaiki pengguna. Kosong = siap dikirim. */
export function validasiPesanan(toko, isi, form, sekarang, nomorWa) {
  const e = [];
  if (!nomorWaSah(nomorWa)) e.push('Nomor WA toko belum benar (harus format 62xxx).');
  if (!isi.length) e.push(toko.tipe === 'jasa' ? 'Belum ada layanan yang dipilih.' : 'Keranjang masih kosong.');
  for (const it of isi) {
    const p = cariProduk(toko, it.produkId);
    if (!p || !pilihanSah(p, it.pilihan)) {
      e.push('Ada item yang tidak dikenal. Hapus lalu pilih ulang.');
      continue;
    }
    if (isHabis(p, it.pilihan)) e.push(`${p.nama} (${teksOpsi(p, it.pilihan)}) sedang habis.`);
    if (!Number.isInteger(it.jumlah) || it.jumlah < 1 || it.jumlah > BATAS_JUMLAH) e.push(`Jumlah ${p.nama} tidak valid.`);
  }
  if ((form.nama ?? '').trim().length < 2) e.push('Isi nama pemesan.');
  if (perluAlamat(toko, form) && (form.alamat ?? '').trim().length < 10) e.push('Alamat belum lengkap (minimal 10 huruf).');

  const hariIni = tanggalLokal(sekarang);
  const kini = menitHariIni(sekarang);
  if (toko.tipe === 'jasa') {
    if (!form.tanggal) e.push('Pilih tanggal booking.');
    else if (form.tanggal < hariIni) e.push('Tanggal booking sudah lewat.');
    if (!form.jam) e.push('Pilih jam booking.');
    else if (Number.isNaN(keMenit(form.jam))) e.push('Jam booking tidak valid.');
    else if (form.tanggal === hariIni && keMenit(form.jam) <= kini + JEDA_BOOKING) e.push('Jam itu sudah lewat atau terlalu mepet. Pilih jam lain.');
  } else if (toko.waktuAmbil && !perluAlamat(toko, form) && form.jam !== 'Secepatnya') {
    if (Number.isNaN(keMenit(form.jam))) e.push('Waktu ambil tidak valid.');
    else if (keMenit(form.jam) <= kini + JEDA_AMBIL) e.push('Jam ambil sudah lewat. Pilih jam lain atau "Secepatnya".');
  }
  return e;
}

export function buatPesan(toko, isi, form) {
  const jasa = toko.tipe === 'jasa';
  const antar = perluAlamat(toko, form);
  const { subtotal, ekstra, total, perkiraan } = hitungTotal(toko, isi, form);
  const L = [`Halo ${toko.nama}, saya mau ${jasa ? 'booking' : 'pesan'}:`, ''];

  isi.forEach((it, i) => {
    const p = cariProduk(toko, it.produkId);
    invarian(p, `produk ${it.produkId}`);
    const opsi = teksOpsi(p, it.pilihan);
    L.push(`${i + 1}. ${p.nama}${jasa ? '' : ` x${it.jumlah}`}`);
    if (opsi) L.push(`   ${opsi}`);
    L.push(`   ${p.mulaiDari ? 'mulai ' : ''}${rp(hargaSatuan(p, it.pilihan) * it.jumlah)}`);
  });

  L.push('');
  if (ekstra) L.push(`Subtotal: ${rp(subtotal)}`, `${form.lokasi}: +${rp(ekstra)}`);
  L.push(`Total: ${rp(total)}${perkiraan ? ' (perkiraan)' : ''}`);
  if (!jasa && antar) L.push('Ongkir: mohon diinfokan');

  L.push('', `Nama: ${(form.nama ?? '').trim() || '-'}`);
  if (jasa) {
    L.push(`Tanggal: ${formatTanggal(form.tanggal)}`, `Jam: ${formatJam(form.jam)}`, `Lokasi: ${form.lokasi}`);
  } else {
    const waktu = toko.waktuAmbil && !antar ? (form.jam === 'Secepatnya' ? ', secepatnya' : `, jam ${formatJam(form.jam)}`) : '';
    L.push(`${antar ? 'Pengiriman' : 'Pengambilan'}: ${form.metode}${waktu}`);
  }
  if (antar) L.push(`Alamat: ${(form.alamat ?? '').trim() || '-'}`);
  if ((form.catatan ?? '').trim()) L.push(`Catatan: ${form.catatan.trim()}`);
  return L.join('\n');
}

export function linkWa(nomorWa, teks) {
  invarian(nomorWaSah(nomorWa), 'nomor WA harus diperiksa sebelum membuat link');
  invarian(typeof teks === 'string' && teks.length > 0, 'teks pesan kosong');
  return `https://wa.me/${nomorWa}?text=${encodeURIComponent(teks)}`;
}
