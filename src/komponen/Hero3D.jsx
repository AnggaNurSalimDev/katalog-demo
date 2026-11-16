// Benda 3D di kepala toko, dipilih dari profil (hero.bentuk). Semuanya CSS 3D, tanpa library.
//
//   melayang : gambar berlapis bergoyang di atas tatakan yang berputar, gelembung naik
//   gantung  : gambar tergantung di hanger, berayun maju-mundur (rotateY dari titik atas)
//   tiang    : tiang barbershop: tabung kaca, garis spiral naik, bayangan silinder
//   putar    : gambar di atas meja putar (piringan miring berputar) + pantulan di lantai
//
// Dekoratif saja (aria-hidden): isi penting tetap di teks kepala toko.

import { aset } from '../format.js';

const LAPIS = [-9, -6, -3, 0];

/** Satu gambar ditumpuk beberapa lapis di kedalaman berbeda → terlihat tebal saat diputar. */
function Berlapis({ gambar }) {
  return LAPIS.map((z, i) => (
    <img
      key={z}
      className="lapis"
      src={aset(gambar)}
      alt=""
      draggable={false}
      style={{ transform: `translateZ(${z}px)`, filter: i === LAPIS.length - 1 ? 'none' : `brightness(${(0.45 + 0.15 * i).toFixed(2)})` }}
    />
  ));
}

export default function Hero3D({ hero }) {
  if (!hero) return null;
  const { bentuk, gambar } = hero;
  if (bentuk !== 'tiang' && !gambar) return null; // validasiProfil sudah menjaga ini; jaga-jaga

  if (bentuk === 'tiang') {
    return (
      <div className="hero3d tiang" aria-hidden="true">
        <span className="tiang-tutup" />
        <span className="tiang-kaca"><span className="tiang-garis" /></span>
        <span className="tiang-tutup bawah" />
        <span className="tiang-dudukan" />
      </div>
    );
  }
  if (bentuk === 'gantung') {
    return (
      <div className="hero3d gantung" aria-hidden="true">
        <div className="ayun">
          <svg className="hanger" viewBox="0 0 160 70">
            <path d="M80 30V22q0-6 6-8t6-8-8-6-8 6" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M80 30L10 64h140z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          </svg>
          <div className="objek-ayun"><Berlapis gambar={gambar} /></div>
        </div>
      </div>
    );
  }
  if (bentuk === 'putar') {
    return (
      <div className="hero3d putar" aria-hidden="true">
        <div className="meja-putar" />
        <div className="objek-putar"><Berlapis gambar={gambar} /></div>
        <img className="pantulan" src={aset(gambar)} alt="" draggable={false} />
      </div>
    );
  }
  // melayang
  return (
    <div className="hero3d melayang" aria-hidden="true">
      <div className="tatakan" />
      <div className="objek-melayang"><Berlapis gambar={gambar} /></div>
      {[0, 1, 2, 3, 4].map((i) => <span key={i} className="gelembung" style={{ '--i': i }} />)}
    </div>
  );
}
