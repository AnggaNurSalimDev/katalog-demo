/*
 * Menyambungkan profil ke dokumen dan ke tampilan. Diadaptasi dari kasir-stok-otomatis (ProfilContext.jsx).
 *
 *   VITE_PROFIL ─┐
 *   ?profil=     ├─ pilihIdProfil ─▶ id ─▶ DAFTAR.get(id) ─▶ terapkanProfil(document)
 *   localStorage ┘   (dua sumber terakhir hanya di mode demo)
 *
 * Bedanya dengan kasir: tidak ada backend/sesi, jadi ganti usaha tidak perlu memuat ulang halaman.
 */
import { aset } from '../format.js';
import { pilihIdProfil, PROFIL_BAWAAN, validasiProfil, variabelCss } from './profil.js';

const KUNCI_PILIHAN = 'katalog-profil';
const env = import.meta.env ?? {};
// Demo (pengalih usaha tampil) kecuali dimatikan eksplisit untuk situs klien.
export const MODE_DEMO = env.VITE_MODE_DEMO !== 'false';

// Semua file di ./profil dimuat saat build. Profil yang rusak dicatat dan dilewati.
const berkas = import.meta.glob('./profil/*.json', { eager: true, import: 'default' });
export const DAFTAR = new Map();
for (const [path, mentah] of Object.entries(berkas).sort(([a], [b]) => a.localeCompare(b))) {
  const { profil, masalah } = validasiProfil(mentah);
  if (masalah.length) console.warn(`[profil] ${path}:\n- ${masalah.join('\n- ')}`);
  if (profil === PROFIL_BAWAAN) continue; // id rusak → dilewati
  DAFTAR.set(profil.id, profil);
}
if (DAFTAR.size === 0) DAFTAR.set(PROFIL_BAWAAN.id, PROFIL_BAWAAN);

const URUTAN = ['kedai-teh-rasa', 'rupa-wear', 'garis-barbershop', 'kilap-auto'];
const posisi = (id) => (URUTAN.includes(id) ? URUTAN.indexOf(id) : URUTAN.length);
export const DAFTAR_URUT = [...DAFTAR.values()].sort((a, b) => posisi(a.id) - posisi(b.id));

function baca(kunci) {
  try {
    return window.localStorage.getItem(kunci);
  } catch {
    return null;
  }
}
export function ingatPilihan(id) {
  try {
    window.localStorage.setItem(KUNCI_PILIHAN, id);
  } catch {
    /* mode privat: pilihan hanya berlaku sampai refresh */
  }
}

/** Tulis profil ke dokumen: variabel CSS, tema, judul tab, favicon, warna bilah browser. */
export function terapkanProfil(profil, doc = document) {
  const akar = doc.documentElement;
  for (const [nama, nilai] of Object.entries(variabelCss(profil))) akar.style.setProperty(nama, nilai);
  akar.dataset.tema = profil.gaya.tema;
  akar.style.colorScheme = profil.gaya.tema === 'gelap' ? 'dark' : 'light';
  doc.title = `${profil.nama} · Pesan via WhatsApp`;
  doc.querySelector('link[rel="icon"]')?.setAttribute('href', aset(profil.favicon));
  doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', profil.warna.utama);
}

/** Profil saat halaman dibuka atau saat tombol kembali browser ditekan. */
export function profilDariAlamat() {
  const dariUrl = new URLSearchParams(window.location.search).get('profil');
  const id = pilihIdProfil({
    bawaan: env.VITE_PROFIL ?? URUTAN[0],
    demo: MODE_DEMO,
    dariUrl,
    dariPenyimpanan: baca(KUNCI_PILIHAN),
    tersedia: new Set(DAFTAR.keys()),
  });
  if (MODE_DEMO && id === dariUrl) ingatPilihan(id);
  return DAFTAR.get(id);
}

/** Pilihan usaha contoh (mode demo saja). */
export function PengalihProfil({ profil, onGanti }) {
  if (!MODE_DEMO || DAFTAR_URUT.length < 2) return null;
  return (
    <section className="pengalih" aria-label="Pilih usaha contoh">
      <strong>Usaha contoh</strong>
      <span className="redup"> · usaha fiktif, masing-masing dengan produk, gambar, dan tampilannya sendiri</span>
      <div className="pengalih-daftar">
        {DAFTAR_URUT.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === profil.id} onClick={() => p.id !== profil.id && onGanti(p.id)}>
            {p.logo.gambar && <img src={aset(p.logo.gambar)} alt="" />}
            {p.nama}
          </button>
        ))}
      </div>
    </section>
  );
}
