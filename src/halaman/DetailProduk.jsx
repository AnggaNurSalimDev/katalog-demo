import { useRef, useState } from 'react';
import { rupiah } from '../format.js';
import { svgProduk } from '../komponen/Ikon.jsx';
import { Panggung } from '../komponen/Tiga.jsx';
import { Langkah, useToast } from '../komponen/umum.jsx';
import { hargaSatuan } from '../logika/harga.js';
import { bisaTersedia, isHabis, kunci, pilihOpsi, pilihanAwal } from '../logika/stok.js';

export default function DetailProduk({ toko, produk, onTambah }) {
  const [pilihan, setPilihan] = useState(() => pilihanAwal(produk));
  const [jumlah, setJumlah] = useState(1);
  const objRef = useRef(null);
  const toast = useToast();
  const jasa = toko.tipe === 'jasa';
  const habis = isHabis(produk, pilihan);
  const harga = hargaSatuan(produk, pilihan);
  const svg = svgProduk(toko, produk, pilihan);

  function pilih(label, nilai) {
    const r = pilihOpsi(produk, pilihan, label, nilai);
    if (!r) return;
    setPilihan(r.pilihan);
    if (r.diubah.length) toast(`${r.diubah.map((x) => `${x} diganti ke ${r.pilihan[x]}`).join(', ')}, karena pilihan tadi habis.`);
  }

  return (
    <>
      <Panggung svg={svg} objRef={objRef} />
      <h2 className="nama-detail">{produk.nama}</h2>
      <p className="desk">{produk.desk}</p>

      {(produk.opsi ?? []).map((o) => (
        <div className="grup-opsi" key={o.label}>
          <h3>{o.label}</h3>
          <div className="chips">
            {o.nilai.map((v) => {
              const tambahan = produk.tambah?.[kunci(o.label, v)];
              const mungkin = bisaTersedia(produk, o.label, v);
              const sekarang = !isHabis(produk, { ...pilihan, [o.label]: v });
              const swatch = toko.swatch && (o.label === 'Warna' || o.label === 'Motif') ? toko.swatch[v] : null;
              return (
                <button key={v} type="button" className={`chip${mungkin && !sekarang ? ' coret' : ''}`} aria-pressed={pilihan[o.label] === v} disabled={!mungkin} onClick={() => pilih(o.label, v)}>
                  {swatch && <i className="swatch" style={{ background: swatch }} />}
                  {v}
                  {tambahan ? <small>+{rupiah(tambahan)}</small> : null}
                  {!mungkin && <small>habis</small>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {habis && <p className="peringatan">Pilihan ini sedang habis.</p>}
      <div className="kaki-detail">
        {!jasa && <Langkah nilai={jumlah} onUbah={(d) => setJumlah((j) => Math.max(1, Math.min(99, j + d)))} />}
        <button type="button" className="tombol" disabled={habis} onClick={() => onTambah(pilihan, jasa ? 1 : jumlah, objRef.current?.getBoundingClientRect(), svg)}>
          {jasa ? 'Pilih layanan' : 'Tambah'} · {produk.mulaiDari ? 'mulai ' : ''}{rupiah(harga * (jasa ? 1 : jumlah))}
        </button>
      </div>
    </>
  );
}
