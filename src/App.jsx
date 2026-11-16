// Alur data:
//
//   localStorage ──muatData()──→ data { keranjang: {fnb: [...], ...}, formulir: {fnb: {...}, ...} }
//        ▲                              │
//        └──────simpanData()────────────┤ (setiap berubah)
//                                       ▼
//   #fnb (alamat) ──→ cariToko ──→ <Toko toko isi form ubahIsi ubahForm>

import { useCallback, useEffect, useState } from 'react';
import { cariToko } from './data/toko.js';
import { muatData, simpanData } from './penyimpanan.js';
import { PenyediaToast } from './komponen/umum.jsx';
import Beranda from './halaman/Beranda.jsx';
import Toko from './halaman/Toko.jsx';

function useHash() {
  const baca = () => decodeURIComponent(window.location.hash.slice(1));
  const [hash, setHash] = useState(baca);
  useEffect(() => {
    const ubah = () => setHash(baca());
    window.addEventListener('hashchange', ubah);
    return () => window.removeEventListener('hashchange', ubah);
  }, []);
  return hash;
}

export default function App() {
  const toko = cariToko(useHash());
  const [data, setData] = useState(muatData);

  useEffect(() => simpanData(data), [data]);
  useEffect(() => {
    document.documentElement.style.setProperty('--aksen', toko ? toko.warna : '#334155');
    window.scrollTo(0, 0);
  }, [toko]);

  const ubahIsi = useCallback(
    (fn) => setData((d) => ({ ...d, keranjang: { ...d.keranjang, [toko.id]: fn(d.keranjang[toko.id]) } })),
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
          {toko && (
            <a className="ib" href="#" aria-label="Kembali ke daftar toko">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
            </a>
          )}
          <span className="merek">Katalog WA <small>· demo</small></span>
        </div>
      </header>
      <main className="isi">
        {toko ? (
          <Toko key={toko.id} toko={toko} isi={data.keranjang[toko.id]} form={data.formulir[toko.id]} ubahIsi={ubahIsi} ubahForm={ubahForm} />
        ) : (
          <Beranda />
        )}
      </main>
    </PenyediaToast>
  );
}
