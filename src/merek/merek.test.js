// Diadaptasi dari kasir-stok-otomatis (frontend/src/merek/merek.test.js).
import { describe, expect, test } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { campur, hexKeRgb, kontras, sesuaikanKontras, tintaDiAtas } from './warna.js';
import { PROFIL_BAWAAN, pilihIdProfil, validasiProfil, variabelCss } from './profil.js';
import { JENIS_DATA } from '../data/katalog/index.js';

const FOLDER = join(import.meta.dirname, 'profil');
const PUBLIK = join(import.meta.dirname, '..', '..', 'public');
const semuaProfil = () => readdirSync(FOLDER).map((nama) => [nama, JSON.parse(readFileSync(join(FOLDER, nama), 'utf8'))]);

describe('warna', () => {
  test('hex → rgb dan menolak format lain', () => {
    expect(hexKeRgb('#2b3a8f')).toEqual([43, 58, 143]);
    expect(() => hexKeRgb('#fff')).toThrow();
  });
  test('kontras putih–hitam = 21; campur di ujung = warna asal', () => {
    expect(kontras('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(campur('#2b3a8f', '#ffffff', 0)).toBe('#2b3a8f');
    expect(() => campur('#2b3a8f', '#ffffff', 1.5)).toThrow();
  });
  test('tulisan di atas warna gelap = putih, di atas emas = gelap', () => {
    expect(tintaDiAtas('#9a3412')).toBe('#ffffff');
    expect(tintaDiAtas('#d4a24c')).not.toBe('#ffffff');
  });
  test('sesuaikanKontras mencapai target', () => {
    expect(kontras(sesuaikanKontras('#9a3412', '#1d1b19', 4.5), '#1d1b19')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('validasiProfil', () => {
  test('bukan objek / id rusak → profil bawaan', () => {
    for (const x of [null, 'teh', [], { nama: 'Toko' }, { id: 'Toko Maju' }]) expect(validasiProfil(x).profil).toBe(PROFIL_BAWAAN);
  });
  test('field salah diganti bawaan dan dicatat, field lain tetap dipakai', () => {
    const { profil, masalah } = validasiProfil({ id: 'kedai', nama: 'Kedai', warna: { utama: 'merah', aksen: '#ffcc00' }, data: 'bengkel' });
    expect(profil.warna.utama).toBe(PROFIL_BAWAAN.warna.utama);
    expect(profil.warna.aksen).toBe('#ffcc00');
    expect(profil.data).toBe(PROFIL_BAWAAN.data);
    expect(masalah).toEqual(expect.arrayContaining([expect.stringContaining('warna.utama'), expect.stringContaining('data')]));
  });
  test('field asing dicatat', () => {
    const { masalah } = validasiProfil({ id: 'kedai', warnaa: {}, teks: { judul: 'x' } });
    expect(masalah).toEqual(expect.arrayContaining(['warnaa: field tidak dikenal', 'teks.judul: field tidak dikenal']));
  });
  test('logo dan favicon hanya path lokal, bukan URL luar', () => {
    const { profil, masalah } = validasiProfil({ id: 'kedai', favicon: 'https://contoh.com/a.svg', logo: { gambar: '//contoh.com/a.svg' } });
    expect(profil.favicon).toBe(PROFIL_BAWAAN.favicon);
    expect(profil.logo.gambar).toBe(null);
    expect(masalah.length).toBe(2);
  });
  test('warna utama "tengah" diperingatkan', () => {
    expect(validasiProfil({ id: 'kedai', warna: { utama: '#777777', aksen: '#000000' } }).masalah.some((m) => m.startsWith('warna.utama'))).toBe(true);
  });
});

describe('pilihIdProfil', () => {
  const tersedia = new Set(['a', 'b', 'c']);
  test('demo: ?profil= → tersimpan → bawaan', () => {
    expect(pilihIdProfil({ bawaan: 'a', demo: true, dariUrl: 'c', dariPenyimpanan: 'b', tersedia })).toBe('c');
    expect(pilihIdProfil({ bawaan: 'a', demo: true, dariUrl: 'x', dariPenyimpanan: 'b', tersedia })).toBe('b');
    expect(pilihIdProfil({ bawaan: 'zz', demo: true, dariUrl: null, dariPenyimpanan: null, tersedia })).toBe('a');
  });
  test('situs klien (bukan demo): ?profil= diabaikan', () => {
    expect(pilihIdProfil({ bawaan: 'b', demo: false, dariUrl: 'c', dariPenyimpanan: 'a', tersedia })).toBe('b');
    expect(() => pilihIdProfil({ bawaan: 'a', demo: true, tersedia: new Set() })).toThrow();
  });
});

describe('profil di src/merek/profil', () => {
  test('semua profil valid tanpa masalah, id = nama file, id unik', () => {
    const ids = new Set();
    for (const [nama, mentah] of semuaProfil()) {
      const { profil, masalah } = validasiProfil(mentah);
      expect(masalah, nama).toEqual([]);
      expect(`${profil.id}.json`).toBe(nama);
      expect(ids.has(profil.id)).toBe(false);
      ids.add(profil.id);
    }
    expect(ids.size).toBeGreaterThanOrEqual(2);
  });
  test('setiap katalog dipakai minimal satu profil; logo & favicon ada filenya', () => {
    const dipakai = new Set(semuaProfil().map(([, m]) => m.data));
    for (const d of JENIS_DATA) expect(dipakai.has(d), d).toBe(true);
    for (const [, m] of semuaProfil()) for (const f of [m.favicon, m.logo.gambar]) expect(existsSync(join(PUBLIK, f)), f).toBe(true);
  });
  test('variabel CSS: tautan cukup kontras di atas kartu', () => {
    for (const [, m] of semuaProfil()) {
      const v = variabelCss(validasiProfil(m).profil);
      expect(kontras(v['--tautan'], v['--kartu']), m.id).toBeGreaterThanOrEqual(4.5);
      expect(kontras(v['--di-atas-utama'], v['--utama']), m.id).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('tata & hero', () => {
  test('tata/hero tidak dikenal → bawaan; hero yang butuh gambar tanpa gambar → tiang', () => {
    const a = validasiProfil({ id: 'kedai', gaya: { tata: 'galeri' }, hero: { bentuk: 'roket' } });
    expect(a.profil.gaya.tata).toBe(PROFIL_BAWAAN.gaya.tata);
    expect(a.profil.hero.bentuk).toBe(PROFIL_BAWAAN.hero.bentuk);
    const b = validasiProfil({ id: 'kedai', hero: { bentuk: 'melayang', gambar: null } });
    expect(b.profil.hero).toEqual({ bentuk: 'tiang', gambar: null });
    expect(b.masalah.join()).toMatch(/hero.gambar/);
  });
  test('gambar hero di profil contoh ada filenya; tiap usaha punya tata sendiri', () => {
    const tata = new Set();
    for (const [, m] of semuaProfil()) {
      if (m.hero.gambar) expect(existsSync(join(PUBLIK, m.hero.gambar)), m.hero.gambar).toBe(true);
      tata.add(m.gaya.tata);
    }
    expect(tata.size).toBe(semuaProfil().length);
  });
});
