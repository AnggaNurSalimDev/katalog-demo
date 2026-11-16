// Alur data:
//
//   ?profil=kedai-teh-rasa ──profilDariAlamat──▶ profil (tampilan) ──terapkanProfil──▶ <html style="--utama…">
//                                                   │
//                                         buatToko(profil) ──▶ toko { ...KATALOG[profil.data], id, nama }
//
//   localStorage ──muatData()──▶ data { keranjang: { [toko.id]: [...] }, formulir: { [toko.id]: {...} } }
//        ▲                              │
//        └──────simpanData()────────────┘ (setiap berubah)

import { useCallback, useEffect, useMemo, useState } from 'react';
import { buatToko } from './data/toko.js';
import { DAFTAR, PengalihProfil, ingatPilihan, profilDariAlamat, terapkanProfil } from './merek/daftar.jsx';
import { muatData, simpanData } from './penyimpanan.js';
import { PenyediaToast } from './komponen/umum.jsx';
import Toko from './halaman/Toko.jsx';
import { aset } from './format.js';

export default function App() {
  const [profil, setProfil] = useState(profilDariAlamat);
  const toko = useMemo(() => buatToko(profil), [profil]);
  const [data, setData] = useState(muatData);

  useEffect(() => simpanData(data), [data]);
  useEffect(() => terapkanProfil(profil), [profil]);
  useEffect(() => {
    const kembali = () => setProfil(profilDariAlamat());
    window.addEventListener('popstate', kembali);
    return () => window.removeEventListener('popstate', kembali);
  }, []);

  const ganti = useCallback((id) => {
    if (!DAFTAR.has(id)) return;
    ingatPilihan(id);
    try {
      window.history.pushState(null, '', `?profil=${encodeURIComponent(id)}`);
    } catch {
      /* bingkai tertentu (pratinjau) menolak ubah alamat: usaha tetap berganti */
    }
    setProfil(DAFTAR.get(id));
    window.scrollTo(0, 0);
  }, []);

  const ubahIsi = useCallback(
    (fn) => setData((d) => ({ ...d, keranjang: { ...d.keranjang, [toko.id]: fn(d.keranjang[toko.id] ?? []) } })),
    [toko],
  );
  const ubahForm = useCallback(
    (perubahan) => setData((d) => ({ ...d, formulir: { ...d.formulir, [toko.id]: { ...d.formulir[toko.id], ...perubahan } } })),
    [toko],
  );

  return (
    <PenyediaToast>
      <header className="bar-atas">
        <div>
          {profil.logo.gambar && <img className="logo" src={aset(profil.logo.gambar)} alt="" />}
          <span className="merek">{profil.logo.teks}</span>
        </div>
      </header>
      <main className="isi" data-tata={profil.gaya.tata}>
        <Toko key={toko.id} profil={profil} toko={toko} isi={data.keranjang[toko.id] ?? []} form={data.formulir[toko.id]} ubahIsi={ubahIsi} ubahForm={ubahForm} />
        <PengalihProfil profil={profil} onGanti={ganti} />
        <p className="halus">{profil.fiktif ? 'Usaha, produk, dan harga di demo ini fiktif. Pesanan diteruskan ke nomor WA demo.' : ''}</p>
      </main>
    </PenyediaToast>
  );
}
