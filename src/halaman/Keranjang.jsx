import { useEffect, useMemo, useState } from 'react';
import { NOMOR_WA } from '../konfigurasi.js';
import { aset, rupiah } from '../format.js';
import { Langkah, useToast } from '../komponen/umum.jsx';
import { perluAlamat } from '../logika/formulir.js';
import { hargaSatuan, hitungTotal } from '../logika/harga.js';
import { hapusItem, kembalikanItem, ubahJumlah } from '../logika/keranjang.js';
import { buatPesan, linkWa, validasiPesanan } from '../logika/pesan.js';
import { cariProduk, gambarProduk, teksOpsi } from '../logika/stok.js';
import { JEDA_AMBIL, JEDA_BOOKING, formatJam, slotJam, tanggalLokal } from '../logika/waktu.js';

/** Jam sekarang, diperbarui tiap 30 detik supaya slot yang lewat ikut tertutup. */
function useSekarang() {
  const [sekarang, setSekarang] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setSekarang(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return sekarang;
}

function PilihanJam({ toko, form, sekarang, onUbah }) {
  if (toko.tipe === 'jasa') {
    if (!form.tanggal) return <select className="isian" id="f-jam" disabled><option>Pilih tanggal dulu</option></select>;
    const slot = slotJam(toko, form.tanggal, sekarang, JEDA_BOOKING);
    if (slot.every((s) => s.lewat)) return <select className="isian" id="f-jam" disabled><option>Jam hari ini sudah habis, pilih tanggal lain</option></select>;
    return (
      <select className="isian" id="f-jam" value={form.jam} onChange={(e) => onUbah({ jam: e.target.value })}>
        <option value="">Pilih jam</option>
        {slot.map((s) => <option key={s.jam} value={s.jam} disabled={s.lewat}>{formatJam(s.jam)}{s.lewat ? ' (lewat)' : ''}</option>)}
      </select>
    );
  }
  const slot = slotJam(toko, tanggalLokal(sekarang), sekarang, JEDA_AMBIL).filter((s) => !s.lewat || s.jam === form.jam);
  return (
    <select className="isian" id="f-jam" value={form.jam} onChange={(e) => onUbah({ jam: e.target.value })}>
      <option value="Secepatnya">Secepatnya</option>
      {slot.map((s) => <option key={s.jam} value={s.jam}>Hari ini {formatJam(s.jam)}</option>)}
    </select>
  );
}

function Segmen({ nilai, daftar, onPilih, biaya }) {
  return (
    <div className="chips">
      {daftar.map((v) => (
        <button key={v} type="button" className="chip" aria-pressed={nilai === v} onClick={() => onPilih(v)}>
          {v}{biaya?.[v] ? <small>+{rupiah(biaya[v])}</small> : null}
        </button>
      ))}
    </div>
  );
}

export default function Keranjang({ toko, isi, form, ubahIsi, ubahForm, onTutup }) {
  const sekarang = useSekarang();
  const [dicoba, setDicoba] = useState(false);
  const toast = useToast();
  const jasa = toko.tipe === 'jasa';
  const antar = perluAlamat(toko, form);

  const kesalahan = validasiPesanan(toko, isi, form, sekarang, NOMOR_WA);
  const siap = kesalahan.length === 0;
  const total = useMemo(() => hitungTotal(toko, isi, form), [toko, isi, form]);
  const pesan = isi.length ? buatPesan(toko, isi, form) : '';

  if (!isi.length) {
    return (
      <div className="kosong">
        <p>{jasa ? 'Belum ada layanan dipilih.' : 'Keranjang masih kosong.'}</p>
        <button type="button" className="tombol" onClick={onTutup}>Lihat {jasa ? 'layanan' : 'katalog'}</button>
      </div>
    );
  }

  function hapus(i) {
    const { isi: sisa, dihapus } = hapusItem(isi, i);
    if (!dihapus) return;
    ubahIsi(() => sisa);
    toast(`${cariProduk(toko, dihapus.produkId).nama} dihapus.`, { label: 'Urungkan', jalankan: () => ubahIsi((kini) => kembalikanItem(kini, dihapus, i)) });
  }
  function kosongkan() {
    const lama = isi;
    ubahIsi(() => []);
    toast(`${jasa ? 'Booking' : 'Keranjang'} dikosongkan.`, { label: 'Urungkan', jalankan: () => ubahIsi(() => lama) });
  }
  function kirim(e) {
    if (!siap) {
      e.preventDefault();
      setDicoba(true);
      return;
    }
    toast('Membuka WhatsApp…');
  }

  return (
    <div>
      {isi.map((it, i) => {
        const p = cariProduk(toko, it.produkId);
        return (
          <div className="baris-item" key={`${it.produkId}-${i}`}>
            <img className="mini" src={aset(gambarProduk(p, it.pilihan))} alt="" />
            <div>
              <div className="nm">{p.nama}</div>
              <div className="op">{teksOpsi(p, it.pilihan)}</div>
              {!jasa && <Langkah kecil nilai={it.jumlah} onUbah={(d) => ubahIsi((kini) => ubahJumlah(kini, i, d))} />}
            </div>
            <div className="kanan">
              <b>{p.mulaiDari && <small>mulai </small>}{rupiah(hargaSatuan(p, it.pilihan) * it.jumlah)}</b>
              <button type="button" className="tautan" onClick={() => hapus(i)}>Hapus</button>
            </div>
          </div>
        );
      })}

      <form onSubmit={(e) => e.preventDefault()} noValidate>
        <label htmlFor="f-nama">Nama pemesan</label>
        <input className="isian" id="f-nama" autoComplete="name" placeholder="mis. Budi" value={form.nama} onChange={(e) => ubahForm({ nama: e.target.value })} />

        {jasa ? (
          <>
            <label htmlFor="f-tgl">Tanggal</label>
            <input className="isian" type="date" id="f-tgl" min={tanggalLokal(sekarang)} value={form.tanggal} onChange={(e) => ubahForm({ tanggal: e.target.value, jam: '' })} />
            <label htmlFor="f-jam">Jam</label>
            <PilihanJam toko={toko} form={form} sekarang={sekarang} onUbah={ubahForm} />
            <label>Lokasi</label>
            <Segmen nilai={form.lokasi} daftar={toko.lokasi} biaya={toko.biayaLokasi} onPilih={(v) => ubahForm({ lokasi: v })} />
          </>
        ) : (
          <>
            <label>Cara terima</label>
            <Segmen nilai={form.metode} daftar={toko.metode} onPilih={(v) => ubahForm({ metode: v })} />
            {toko.waktuAmbil && !antar && (
              <>
                <label htmlFor="f-jam">Waktu ambil</label>
                <PilihanJam toko={toko} form={form} sekarang={sekarang} onUbah={ubahForm} />
              </>
            )}
          </>
        )}

        {antar && (
          <>
            <label htmlFor="f-alamat">Alamat lengkap</label>
            <textarea className="isian" id="f-alamat" autoComplete="street-address" placeholder="Jalan, nomor rumah, patokan" value={form.alamat} onChange={(e) => ubahForm({ alamat: e.target.value })} />
          </>
        )}
        <label htmlFor="f-catatan">Catatan <small className="redup">(opsional)</small></label>
        <textarea className="isian" id="f-catatan" placeholder={jasa ? 'mis. model rambut, warna mobil' : 'mis. tanpa sedotan'} value={form.catatan} onChange={(e) => ubahForm({ catatan: e.target.value })} />
      </form>

      {total.ekstra > 0 && (
        <>
          <div className="garis-harga"><span>Subtotal</span><span>{rupiah(total.subtotal)}</span></div>
          <div className="garis-harga"><span>{form.lokasi}</span><span>+{rupiah(total.ekstra)}</span></div>
        </>
      )}
      <div className="total"><span>Total{total.perkiraan ? ' (perkiraan)' : ''}</span><span>{rupiah(total.total)}</span></div>

      <h3 className="judul-kecil">Pratinjau pesan WhatsApp</h3>
      <pre className="pratinjau" data-testid="pratinjau">{pesan}</pre>

      {dicoba && !siap && (
        <ul className="kesalahan" role="alert">
          {kesalahan.map((k) => <li key={k}>{k}</li>)}
        </ul>
      )}
      <a className="tombol wa" href={siap ? linkWa(NOMOR_WA, pesan) : '#'} target="_blank" rel="noopener noreferrer" aria-disabled={!siap} onClick={kirim}>
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
        Kirim {jasa ? 'booking' : 'pesanan'} via WhatsApp
      </a>
      <p className="halus">WhatsApp akan terbuka dengan pesan di atas. Pesanan baru terkirim setelah kamu menekan kirim di WhatsApp.</p>
      <div className="tengah"><button type="button" className="tautan" onClick={kosongkan}>Kosongkan {jasa ? 'booking' : 'keranjang'}</button></div>
    </div>
  );
}
