// Detail 3D kecil, semuanya CSS 3D (tanpa library), supaya ringan di HP murah.
//
//   Kubus     : 4 sisi = 4 toko, berputar sendiri, bisa digeser, ketuk = buka sisi depan
//   Panggung  : objek produk berlapis (6 lapis SVG di kedalaman berbeda) → terlihat tebal saat berputar

import { useEffect, useRef } from 'react';
import { kurangiGerak } from '../format.js';
import { svgIkon } from './Ikon.jsx';

/** Pasang geser horizontal: dipanggil terus saat jari/mouse bergerak, mengembalikan pembersih. */
function pasangGeser(el, { mulai, gerak, lepas }) {
  const turun = (e) => {
    const sx = e.clientX;
    mulai?.();
    const g = (ev) => gerak(ev.clientX - sx);
    const u = () => {
      window.removeEventListener('pointermove', g);
      window.removeEventListener('pointerup', u);
      window.removeEventListener('pointercancel', u);
      lepas?.();
    };
    window.addEventListener('pointermove', g);
    window.addEventListener('pointerup', u);
    window.addEventListener('pointercancel', u);
  };
  el.addEventListener('pointerdown', turun);
  return () => el.removeEventListener('pointerdown', turun);
}

export function Kubus({ daftarToko, onBuka }) {
  const wadah = useRef(null);
  const kubus = useRef(null);
  const sudut = useRef(20);
  const bukaRef = useRef(onBuka);
  bukaRef.current = onBuka;

  useEffect(() => {
    let tarik = false;
    let bergeser = false;
    let awal = 0;
    let terakhir = performance.now();
    let rafId;
    const jalan = (t) => {
      if (!tarik && !kurangiGerak()) sudut.current -= (t - terakhir) * 0.012;
      terakhir = t;
      if (kubus.current) kubus.current.style.transform = `rotateX(-16deg) rotateY(${sudut.current}deg)`;
      rafId = requestAnimationFrame(jalan);
    };
    rafId = requestAnimationFrame(jalan);
    const lepasGeser = pasangGeser(wadah.current, {
      mulai: () => { tarik = true; bergeser = false; awal = sudut.current; },
      gerak: (dx) => { if (Math.abs(dx) > 6) bergeser = true; sudut.current = awal + dx * 0.6; },
      lepas: () => { tarik = false; },
    });
    const depan = () => ((Math.round(-sudut.current / 90) % daftarToko.length) + daftarToko.length) % daftarToko.length;
    const klik = () => { if (!bergeser) bukaRef.current(daftarToko[depan()].id); };
    const tombol = (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bukaRef.current(daftarToko[depan()].id); }
      if (e.key === 'ArrowLeft') sudut.current += 90;
      if (e.key === 'ArrowRight') sudut.current -= 90;
    };
    const w = wadah.current;
    w.addEventListener('click', klik);
    w.addEventListener('keydown', tombol);
    return () => { cancelAnimationFrame(rafId); lepasGeser(); w.removeEventListener('click', klik); w.removeEventListener('keydown', tombol); };
  }, [daftarToko]);

  return (
    <div className="kubus-wadah" ref={wadah} role="button" tabIndex={0} aria-label="Buka toko di sisi depan kubus. Panah kiri/kanan untuk memutar.">
      <div className="kubus" ref={kubus}>
        {daftarToko.map((t, i) => (
          <div key={t.id} className="sisi" style={{ '--c': t.warna, transform: `rotateY(${i * 90}deg) translateZ(75px)` }}>
            <span dangerouslySetInnerHTML={{ __html: svgIkon(t.produk[0].ikon.bentuk, '#fff', 'rgba(255,255,255,.55)') }} />
            <span>{t.jenis}</span>
          </div>
        ))}
        <div className="sisi tutup-kubus" style={{ transform: 'rotateX(90deg) translateZ(75px)' }} />
        <div className="sisi tutup-kubus" style={{ transform: 'rotateX(-90deg) translateZ(75px)' }} />
      </div>
    </div>
  );
}

const LAPIS = [-8, -5, -2, 1, 4, 8];

export function Panggung({ svg, objRef }) {
  const panggung = useRef(null);
  useEffect(() => {
    const obj = objRef.current;
    return pasangGeser(panggung.current, {
      mulai: () => obj.classList.add('ditarik'),
      gerak: (dx) => { obj.style.transform = `rotateY(${Math.max(-60, Math.min(60, dx * 0.5))}deg) rotateX(4deg)`; },
      lepas: () => { obj.classList.remove('ditarik'); obj.style.transform = ''; },
    });
  }, [objRef]);

  return (
    <div className="panggung" ref={panggung}>
      <div className="lantai" />
      <div className="objek" ref={objRef}>
        {LAPIS.map((z, i) => (
          <div key={z} className="lapis" style={{ transform: `translateZ(${z}px)`, filter: `brightness(${(0.5 + (0.5 * i) / (LAPIS.length - 1)).toFixed(2)})` }} dangerouslySetInnerHTML={{ __html: svg }} />
        ))}
      </div>
      <small>Geser untuk memutar</small>
    </div>
  );
}
