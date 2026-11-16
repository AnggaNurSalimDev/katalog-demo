import { useRef, useState } from 'react';
import { aset, rupiah } from '../format.js';
import { Lembar, terbang, useMiring, useToast } from '../komponen/umum.jsx';
import { adaVariasiHarga, hitungTotal } from '../logika/harga.js';
import { jumlahItem, tambahItem } from '../logika/keranjang.js';
import { gambarProduk, pilihanAwal } from '../logika/stok.js';
import Hero3D from '../komponen/Hero3D.jsx';
import DetailProduk from './DetailProduk.jsx';
import Keranjang from './Keranjang.jsx';

const jam = (j) => `${String(j).padStart(2, '0')}.00`;

export default function Toko({ profil, toko, isi, form, ubahIsi, ubahForm }) {
  // Lembar detail: produk disimpan terpisah dari "terbuka" supaya isinya tetap ada saat animasi menutup.
  const [detail, setDetail] = useState({ produk: null, terbuka: false, ke: 0 });
  const [keranjangTerbuka, setKeranjangTerbuka] = useState(false);
  const hitunganRef = useRef(null);
  const tombolRef = useRef(null);
  const toast = useToast();
  const miring = useMiring();
  const jasa = toko.tipe === 'jasa';
  const n = jumlahItem(isi);

  function tambah(pilihan, jumlah, dari, gambar) {
    const r = tambahItem(toko, isi, detail.produk, pilihan, jumlah);
    setDetail((d) => ({ ...d, terbuka: false }));
    if (r.hasil === 'SUDAH_ADA') return toast('Layanan ini sudah ada di booking.');
    if (r.hasil === 'HABIS' || r.hasil === 'TIDAK_SAH') return toast('Pilihan ini tidak bisa dipesan.');
    ubahIsi(() => r.isi);
    toast(jasa ? 'Layanan ditambahkan ke booking.' : 'Ditambahkan ke keranjang.');
    // Tunggu tombol keranjang muncul (bila sebelumnya kosong), lalu terbangkan gambar ke sana.
    requestAnimationFrame(() =>
      terbang(dari, aset(gambar), hitunganRef.current).then(() => {
        const b = tombolRef.current;
        if (!b) return;
        b.classList.remove('loncat');
        void b.offsetWidth;
        b.classList.add('loncat');
      }),
    );
  }

  return (
    <>
      <section className="kepala-toko">
        <span className="kata-latar" aria-hidden="true">{profil.logo.teks}</span>
        <div className="teks-kepala">
          <p className="jenis">{profil.teks.jenis}</p>
          <h1>{profil.nama}</h1>
          <p className="slogan">{profil.teks.slogan}</p>
          <div className="meta">
            {toko.buka != null && <span>Buka {jam(toko.buka)}–{jam(toko.tutup)}</span>}
            {profil.teks.alamat && <span>{profil.teks.alamat}</span>}
            <span>{jasa ? 'Booking via WhatsApp' : 'Pesan via WhatsApp'}</span>
          </div>
        </div>
        <Hero3D hero={profil.hero} />
      </section>

      <h2 className="judul-bagian">{jasa ? 'Layanan' : 'Produk'}</h2>
      <div className="kisi">
        {toko.produk.map((p) => (
          <button key={p.id} type="button" className="kartu miring" {...miring} onClick={() => setDetail((d) => ({ produk: p, terbuka: true, ke: d.ke + 1 }))}>
            <div className="wadah-gambar">
              <img src={aset(gambarProduk(p, pilihanAwal(p)))} alt="" loading="lazy" draggable={false} />
            </div>
            <span className="info">
              <b>{p.nama}</b>
              <span className="sub">{p.desk}</span>
            </span>
            <span className="harga">{adaVariasiHarga(p) && <small>mulai </small>}{rupiah(p.harga)}</span>
          </button>
        ))}
      </div>

      <button ref={tombolRef} type="button" className="tombol-keranjang" hidden={n === 0} onClick={() => setKeranjangTerbuka(true)}>
        <span className="hitungan" ref={hitunganRef}>{n}</span>
        <span>{jasa ? 'Lihat booking' : 'Lihat keranjang'}</span>
        <span className="jumlah-harga">{n ? rupiah(hitungTotal(toko, isi, form).subtotal) : ''}</span>
      </button>

      <Lembar terbuka={detail.terbuka} judul={jasa ? 'Detail layanan' : 'Detail produk'} onTutup={() => setDetail((d) => ({ ...d, terbuka: false }))}>
        {detail.produk && <DetailProduk key={detail.ke} toko={toko} produk={detail.produk} onTambah={tambah} />}
      </Lembar>
      <Lembar terbuka={keranjangTerbuka} judul={jasa ? 'Booking kamu' : 'Keranjang'} onTutup={() => setKeranjangTerbuka(false)}>
        {keranjangTerbuka && <Keranjang toko={toko} isi={isi} form={form} ubahIsi={ubahIsi} ubahForm={ubahForm} onTutup={() => setKeranjangTerbuka(false)} />}
      </Lembar>
    </>
  );
}
