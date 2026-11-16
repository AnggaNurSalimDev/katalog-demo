import { useRef, useState } from 'react';
import { rupiah } from '../format.js';
import Ikon, { svgProduk } from '../komponen/Ikon.jsx';
import { Lembar, terbang, useMiring, useToast } from '../komponen/umum.jsx';
import { adaVariasiHarga, hitungTotal } from '../logika/harga.js';
import { jumlahItem, tambahItem } from '../logika/keranjang.js';
import { pilihanAwal } from '../logika/stok.js';
import DetailProduk from './DetailProduk.jsx';
import Keranjang from './Keranjang.jsx';

export default function Toko({ toko, isi, form, ubahIsi, ubahForm }) {
  // Lembar detail: produk disimpan terpisah dari "terbuka" supaya isinya tetap ada saat animasi menutup.
  const [detail, setDetail] = useState({ produk: null, terbuka: false, ke: 0 });
  const [keranjangTerbuka, setKeranjangTerbuka] = useState(false);
  const hitunganRef = useRef(null);
  const tombolRef = useRef(null);
  const toast = useToast();
  const miring = useMiring();
  const jasa = toko.tipe === 'jasa';
  const n = jumlahItem(isi);

  function tambah(pilihan, jumlah, dari, svg) {
    const r = tambahItem(toko, isi, detail.produk, pilihan, jumlah);
    setDetail((d) => ({ ...d, terbuka: false }));
    if (r.hasil === 'SUDAH_ADA') return toast('Layanan ini sudah ada di booking.');
    if (r.hasil === 'HABIS' || r.hasil === 'TIDAK_SAH') return toast('Pilihan ini tidak bisa dipesan.');
    ubahIsi(() => r.isi);
    toast(jasa ? 'Layanan ditambahkan ke booking.' : 'Ditambahkan ke keranjang.');
    // Tunggu tombol keranjang muncul (bila sebelumnya kosong), lalu terbangkan ikon ke sana.
    requestAnimationFrame(() =>
      terbang(dari, svg, hitunganRef.current).then(() => {
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
        <p className="jenis">{toko.jenis}</p>
        <h1>{toko.nama}</h1>
        <p>{toko.tagline}</p>
        <span className="meta">
          {toko.buka != null && `Buka ${String(toko.buka).padStart(2, '0')}.00–${toko.tutup}.00 · `}
          {jasa ? 'Booking via WhatsApp' : 'Pesan via WhatsApp'}
        </span>
      </section>

      <div className="kisi">
        {toko.produk.map((p) => (
          <button key={p.id} type="button" className="kartu miring" {...miring} onClick={() => setDetail((d) => ({ produk: p, terbuka: true, ke: d.ke + 1 }))}>
            <div className="wadah-ikon"><Ikon svg={svgProduk(toko, p, pilihanAwal(p))} /></div>
            <b>{p.nama}</b>
            <span className="sub">{p.desk}</span>
            <span className="harga">{adaVariasiHarga(p) && <small>mulai </small>}{rupiah(p.harga)}</span>
          </button>
        ))}
      </div>
      <p className="halus">Toko dan harga fiktif. Pesanan diteruskan ke nomor WA demo.</p>

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
