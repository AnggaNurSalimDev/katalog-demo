import { DAFTAR_TOKO } from '../data/toko.js';
import Ikon, { svgProduk } from '../komponen/Ikon.jsx';
import { Kubus } from '../komponen/Tiga.jsx';
import { useMiring } from '../komponen/umum.jsx';

export default function Beranda() {
  const miring = useMiring();
  return (
    <>
      <section className="pembuka">
        <h1>Pesan lebih gampang, langsung masuk WhatsApp</h1>
        <p>Contoh katalog untuk empat jenis usaha. Pilih menu atau layanan, lalu pesanannya tersusun rapi di WA penjual.</p>
      </section>
      <Kubus daftarToko={DAFTAR_TOKO} onBuka={(id) => { window.location.hash = id; }} />
      <p className="petunjuk">Geser kubus untuk memutar, ketuk untuk membuka</p>
      <div className="kisi">
        {DAFTAR_TOKO.map((t) => (
          <a key={t.id} className="kartu miring" href={`#${t.id}`} style={{ '--c': t.warna }} {...miring}>
            <div className="wadah-ikon"><Ikon svg={svgProduk(t, t.produk[0])} /></div>
            <b>{t.nama}</b>
            <span className="sub">{t.jenis} · {t.produk.length} {t.tipe === 'jasa' ? 'layanan' : 'produk'}</span>
          </a>
        ))}
      </div>
      <p className="halus">Semua toko, produk, dan harga di demo ini fiktif.</p>
    </>
  );
}
