import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { KATALOG } from '../data/katalog/index.js';
import { buatToko } from '../data/toko.js';
import pTeh from '../merek/profil/kedai-teh-rasa.json';
import pFashion from '../merek/profil/rupa-wear.json';
import pBarber from '../merek/profil/garis-barbershop.json';
import pDetailing from '../merek/profil/kilap-auto.json';
import { bisaTersedia, cariProduk, gambarProduk, isHabis, pilihOpsi, pilihanAwal, semuaKombinasi } from './stok.js';
import { hargaSatuan, hitungTotal } from './harga.js';
import { BATAS_JUMLAH, hapusItem, kembalikanItem, tambahItem, ubahJumlah } from './keranjang.js';
import { buatPesan, linkWa, validasiPesanan } from './pesan.js';
import { bersihkanData, formAwal, perluAlamat } from './formulir.js';
import { formatTanggal, keMenit, slotJam, tanggalLokal } from './waktu.js';

const NOMOR = '6281234567890';
const SENIN_SIANG = new Date(2026, 10, 16, 13, 0); // 16 Nov 2026 13.00 waktu lokal
const fnb = buatToko(pTeh);
const fashion = buatToko(pFashion);
const barber = buatToko(pBarber);
const detailing = buatToko(pDetailing);
const DAFTAR_TOKO = [fnb, fashion, barber, detailing];
const PUBLIK = join(import.meta.dirname, '..', '..', 'public');
const p = (toko, id) => cariProduk(toko, id);

describe('data katalog (invarian)', () => {
  it('id toko dan produk unik, harga bulat ≥ 0', () => {
    expect(new Set(DAFTAR_TOKO.map((t) => t.id)).size).toBe(DAFTAR_TOKO.length);
    for (const t of Object.values(KATALOG)) {
      expect(new Set(t.produk.map((x) => x.id)).size).toBe(t.produk.length);
      for (const x of t.produk) expect(Number.isInteger(x.harga) && x.harga >= 0).toBe(true);
    }
  });
  it('setiap kunci tambah/habis/gambarPer merujuk opsi & nilai yang ada', () => {
    for (const t of Object.values(KATALOG))
      for (const x of t.produk) {
        const sah = new Set((x.opsi ?? []).flatMap((o) => o.nilai.map((v) => `${o.label}:${v}`)));
        for (const k of Object.keys(x.tambah ?? {})) expect(sah.has(k), `${x.id} tambah ${k}`).toBe(true);
        for (const kombo of x.habis ?? []) for (const k of kombo) expect(sah.has(k), `${x.id} habis ${k}`).toBe(true);
        for (const k of Object.keys(x.gambarPer ?? {})) expect(sah.has(k), `${x.id} gambarPer ${k}`).toBe(true);
      }
  });
  it('setiap gambar produk ada filenya di public/', () => {
    for (const t of Object.values(KATALOG))
      for (const x of t.produk)
        for (const g of [x.gambar, ...Object.values(x.gambarPer ?? {})]) {
          expect(g, x.id).toMatch(/^\/produk\/[\w-]+\/[\w-]+\.(svg|png|jpe?g|webp)$/);
          expect(existsSync(join(PUBLIK, g)), g).toBe(true);
        }
  });
  it('setiap produk punya minimal satu kombinasi tersedia', () => {
    for (const t of DAFTAR_TOKO) for (const x of t.produk) expect(isHabis(x, pilihanAwal(x)), x.id).toBe(false);
  });
  it('toko jasa: lokasi rumah ada di daftar lokasi; toko barang: metode antar ada di daftar metode', () => {
    for (const t of DAFTAR_TOKO) {
      if (t.tipe === 'jasa') expect(t.lokasi).toContain(t.lokasiRumah);
      else expect(t.metode).toContain(t.metodeAntar);
    }
  });
});

describe('stok & opsi', () => {
  it('kombinasi dihitung lengkap', () => {
    expect(semuaKombinasi(p(fashion, 'ks'))).toHaveLength(12);
    expect(semuaKombinasi(p(barber, 'cj'))).toEqual([{}]);
  });
  it('habis per kombinasi, bukan per nilai', () => {
    const kaos = p(fashion, 'ks');
    expect(isHabis(kaos, { Warna: 'Putih', Ukuran: 'S' })).toBe(true);
    expect(isHabis(kaos, { Warna: 'Putih', Ukuran: 'M' })).toBe(false);
    expect(bisaTersedia(kaos, 'Warna', 'Putih')).toBe(true);
    expect(bisaTersedia(p(fnb, 'gt'), 'Topping', 'Cheese foam')).toBe(false);
  });
  it('memilih warna yang habis di ukuran sekarang → ukuran disesuaikan', () => {
    const r = pilihOpsi(p(fashion, 'ks'), { Warna: 'Hitam', Ukuran: 'S' }, 'Warna', 'Putih');
    expect(r.pilihan.Warna).toBe('Putih');
    expect(r.pilihan.Ukuran).not.toBe('S');
    expect(r.diubah).toEqual(['Ukuran']);
  });
  it('gambar ikut pilihan warna, selain itu gambar utama', () => {
    const kaos = p(fashion, 'ks');
    expect(gambarProduk(kaos, { Warna: 'Putih', Ukuran: 'M' })).toBe('/produk/fashion/kaos-putih.svg');
    expect(gambarProduk(p(fnb, 'tt'), pilihanAwal(p(fnb, 'tt')))).toBe('/produk/teh/thai-tea.svg');
    expect(() => gambarProduk({ id: 'x' }, {})).toThrow(/Invarian/);
  });
  it('nilai yang tidak pernah tersedia / tidak dikenal → null', () => {
    const gt = p(fnb, 'gt');
    expect(pilihOpsi(gt, pilihanAwal(gt), 'Topping', 'Cheese foam')).toBeNull();
    expect(pilihOpsi(gt, pilihanAwal(gt), 'Topping', 'Keju')).toBeNull();
  });
});

describe('harga', () => {
  it('tambahan dari beberapa opsi dijumlahkan', () => {
    expect(hargaSatuan(p(fnb, 'tt'), { Ukuran: 'L', Gula: 'Less', Es: 'Normal', Topping: 'Boba' })).toBe(22000);
    expect(hargaSatuan(p(detailing, 'pb'), { 'Jenis mobil': 'SUV' })).toBe(550000);
  });
  it('total jasa menambah biaya home service; mulaiDari → perkiraan', () => {
    const isi = [{ produkId: 'hc', pilihan: { 'Panjang rambut': 'Panjang' }, jumlah: 1 }];
    expect(hitungTotal(barber, isi, { lokasi: 'Home service' })).toEqual({ subtotal: 250000, ekstra: 30000, total: 280000, perkiraan: true });
    expect(hitungTotal(barber, isi, { lokasi: 'Di barbershop' }).ekstra).toBe(0);
  });
  it('produk tidak dikenal di keranjang → invarian', () => {
    expect(() => hitungTotal(fnb, [{ produkId: 'xx', pilihan: {}, jumlah: 1 }], formAwal(fnb))).toThrow(/Invarian/);
  });
});

describe('keranjang', () => {
  const pilihTt = { Ukuran: 'M', Gula: 'Normal', Es: 'Normal', Topping: 'Tanpa' };
  it('barang sama + opsi sama → jumlah digabung, dibatasi 99', () => {
    let r = tambahItem(fnb, [], p(fnb, 'tt'), pilihTt, 2);
    r = tambahItem(fnb, r.isi, p(fnb, 'tt'), pilihTt, 98);
    expect(r.hasil).toBe('DIGABUNG');
    expect(r.isi).toHaveLength(1);
    expect(r.isi[0].jumlah).toBe(BATAS_JUMLAH);
  });
  it('opsi beda → baris baru', () => {
    let r = tambahItem(fnb, [], p(fnb, 'tt'), pilihTt, 1);
    r = tambahItem(fnb, r.isi, p(fnb, 'tt'), { ...pilihTt, Ukuran: 'L' }, 1);
    expect(r.isi).toHaveLength(2);
  });
  it('jasa: layanan sama tidak dobel, jumlah selalu 1', () => {
    let r = tambahItem(barber, [], p(barber, 'pr'), { Kapster: 'Dimas' }, 5);
    expect(r.isi[0].jumlah).toBe(1);
    r = tambahItem(barber, r.isi, p(barber, 'pr'), { Kapster: 'Dimas' }, 1);
    expect(r.hasil).toBe('SUDAH_ADA');
  });
  it('menolak kombinasi habis, pilihan tak lengkap, jumlah tidak sah', () => {
    expect(tambahItem(fashion, [], p(fashion, 'ks'), { Warna: 'Putih', Ukuran: 'S' }, 1).hasil).toBe('HABIS');
    expect(tambahItem(fashion, [], p(fashion, 'ks'), { Warna: 'Putih' }, 1).hasil).toBe('TIDAK_SAH');
    expect(tambahItem(fnb, [], p(fnb, 'tt'), pilihTt, 0).hasil).toBe('TIDAK_SAH');
    expect(tambahItem(fnb, [], p(fnb, 'tt'), pilihTt, 1.5).hasil).toBe('TIDAK_SAH');
  });
  it('ubah jumlah tetap di 1..99; hapus lalu kembalikan ke posisi semula', () => {
    const isi = [{ produkId: 'tt', pilihan: pilihTt, jumlah: 1 }, { produkId: 'lt', pilihan: { Ukuran: 'M', Es: 'Normal' }, jumlah: 3 }];
    expect(ubahJumlah(isi, 0, -1)[0].jumlah).toBe(1);
    expect(ubahJumlah(isi, 5, 1)).toBe(isi);
    const { isi: sisa, dihapus } = hapusItem(isi, 0);
    expect(sisa).toHaveLength(1);
    expect(kembalikanItem(sisa, dihapus, 0)).toEqual(isi);
    expect(isi).toHaveLength(2); // array lama tidak berubah
  });
});

describe('waktu', () => {
  it('slot hari ini yang sudah lewat ditandai', () => {
    const s = slotJam(barber, tanggalLokal(SENIN_SIANG), SENIN_SIANG, 30);
    expect(s[0]).toEqual({ jam: '10:00', lewat: true });
    expect(s.find((x) => x.jam === '13:30').lewat).toBe(true);
    expect(s.find((x) => x.jam === '14:00').lewat).toBe(false);
    expect(s.at(-1).jam).toBe('20:00');
  });
  it('hari lain tidak ada slot lewat; format tanggal & jam', () => {
    expect(slotJam(barber, '2026-11-17', SENIN_SIANG, 30).some((x) => x.lewat)).toBe(false);
    expect(keMenit('14:30')).toBe(870);
    expect(keMenit('jam 2')).toBeNaN();
    expect(formatTanggal('2026-11-18')).toMatch(/Rabu/);
    expect(formatTanggal('kemarin')).toBe('-');
  });
});

describe('validasi & pesan WA', () => {
  const isiBarber = [{ produkId: 'pr', pilihan: { Kapster: 'Rian' }, jumlah: 1 }];
  const formBarber = { ...formAwal(barber), nama: 'Budi', tanggal: '2026-11-16', jam: '15:00' };

  it('booking lengkap → tidak ada kesalahan', () => {
    expect(validasiPesanan(barber, isiBarber, formBarber, SENIN_SIANG, NOMOR)).toEqual([]);
  });
  it('kesalahan yang bisa diperbaiki pengguna dikumpulkan semua', () => {
    const e = validasiPesanan(barber, [], { ...formAwal(barber), lokasi: 'Home service' }, SENIN_SIANG, '0812');
    expect(e).toEqual(expect.arrayContaining([
      expect.stringMatching(/Nomor WA/), expect.stringMatching(/layanan/), expect.stringMatching(/nama/),
      expect.stringMatching(/Alamat/), expect.stringMatching(/tanggal/), expect.stringMatching(/jam/),
    ]));
  });
  it('tanggal lewat dan jam mepet ditolak', () => {
    expect(validasiPesanan(barber, isiBarber, { ...formBarber, tanggal: '2026-11-15' }, SENIN_SIANG, NOMOR)).toContain('Tanggal booking sudah lewat.');
    expect(validasiPesanan(barber, isiBarber, { ...formBarber, jam: '13:30' }, SENIN_SIANG, NOMOR).join()).toMatch(/mepet/);
  });
  it('F&B: jam ambil lewat ditolak, "Secepatnya" boleh, diantar wajib alamat', () => {
    const isi = [{ produkId: 'lt', pilihan: { Ukuran: 'M', Es: 'Normal' }, jumlah: 1 }];
    const f = { ...formAwal(fnb), nama: 'Sari' };
    expect(validasiPesanan(fnb, isi, f, SENIN_SIANG, NOMOR)).toEqual([]);
    expect(validasiPesanan(fnb, isi, { ...f, jam: '12:00' }, SENIN_SIANG, NOMOR).join()).toMatch(/lewat/);
    expect(perluAlamat(fnb, { ...f, metode: 'Diantar' })).toBe(true);
    expect(validasiPesanan(fnb, isi, { ...f, metode: 'Diantar', alamat: 'dekat' }, SENIN_SIANG, NOMOR).join()).toMatch(/Alamat/);
  });
  it('item yang belakangan jadi habis tetap ditangkap saat kirim', () => {
    const isi = [{ produkId: 'ks', pilihan: { Warna: 'Putih', Ukuran: 'S' }, jumlah: 1 }];
    expect(validasiPesanan(fashion, isi, { ...formAwal(fashion), nama: 'Rina' }, SENIN_SIANG, NOMOR).join()).toMatch(/habis/);
  });
  it('isi pesan booking tersusun rapi', () => {
    const isi = [{ produkId: 'hc', pilihan: { 'Panjang rambut': 'Panjang' }, jumlah: 1 }];
    const teks = buatPesan(barber, isi, { ...formBarber, tanggal: '2026-11-18', jam: '14:00', lokasi: 'Home service', alamat: 'Jl. Merdeka No. 10, Bandung' });
    expect(teks).toBe([
      'Halo Garis Barbershop, saya mau booking:', '',
      '1. Hair Coloring', '   Panjang rambut: Panjang', '   mulai Rp250.000', '',
      'Subtotal: Rp250.000', 'Home service: +Rp30.000', 'Total: Rp280.000 (perkiraan)', '',
      'Nama: Budi', `Tanggal: ${formatTanggal('2026-11-18')}`, 'Jam: 14.00', 'Lokasi: Home service',
      'Alamat: Jl. Merdeka No. 10, Bandung',
    ].join('\n'));
  });
  it('isi pesan barang: jumlah, ongkir bila dikirim', () => {
    const isi = [{ produkId: 'ks', pilihan: { Warna: 'Hitam', Ukuran: 'XL' }, jumlah: 2 }];
    const teks = buatPesan(fashion, isi, { ...formAwal(fashion), nama: 'Rina', metode: 'Dikirim', alamat: 'Jl. Dago 12, Bandung' });
    expect(teks).toContain('1. Kaos Polos Premium x2');
    expect(teks).toContain('   Rp178.000');
    expect(teks).toContain('Ongkir: mohon diinfokan');
    expect(teks).toContain('Pengiriman: Dikirim');
  });
  it('link WA ter-encode; nomor salah → invarian', () => {
    expect(linkWa(NOMOR, 'Halo & 1x\nTeh')).toBe('https://wa.me/6281234567890?text=Halo%20%26%201x%0ATeh');
    expect(() => linkWa('08123', 'x')).toThrow(/Invarian/);
  });
});

describe('data tersimpan dibersihkan', () => {
  it('item rusak dibuang, kolom aneh kembali ke awal', () => {
    const mentah = {
      keranjang: {
        'kedai-teh-rasa': [{ produkId: 'tt', pilihan: { Ukuran: 'M', Gula: 'Normal', Es: 'Normal', Topping: 'Tanpa' }, jumlah: 2 }, { produkId: 'hilang', pilihan: {}, jumlah: 1 }, { produkId: 'lt', pilihan: { Ukuran: 'XXL', Es: 'Normal' }, jumlah: 1 }, { produkId: 'lt', pilihan: { Ukuran: 'M', Es: 'Normal' }, jumlah: 500 }],
        'garis-barbershop': 'bukan array',
      },
      formulir: { 'kedai-teh-rasa': { nama: 'Sari', metode: 'Teleportasi', jam: 7 } },
    };
    const d = bersihkanData(mentah, DAFTAR_TOKO);
    expect(d.keranjang['kedai-teh-rasa']).toHaveLength(1);
    expect(d.keranjang['garis-barbershop']).toEqual([]);
    expect(d.formulir['kedai-teh-rasa']).toEqual({ ...formAwal(fnb), nama: 'Sari' });
    expect(bersihkanData(null, DAFTAR_TOKO).formulir['kilap-auto']).toEqual(formAwal(detailing));
  });
});
