// Detail 3D kecil, semuanya CSS 3D (tanpa library), supaya ringan di HP murah.
//
//   Panggung : gambar produk ditumpuk 5 lapis di kedalaman berbeda → terlihat tebal saat berputar.
//              Bergoyang sendiri; bisa diputar dengan geser jari/mouse.

import { useEffect, useRef } from 'react';

/** Pasang geser horizontal, mengembalikan pembersih. */
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

const LAPIS = [-6, -3, 0, 3, 6];

export function Panggung({ gambar, alt, objRef }) {
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
      <div className="objek" ref={objRef}>
        {LAPIS.map((z, i) => (
          <img
            key={z}
            className="lapis"
            src={gambar}
            alt={i === LAPIS.length - 1 ? alt : ''}
            draggable={false}
            style={{ transform: `translateZ(${z}px)`, filter: i === LAPIS.length - 1 ? 'none' : `brightness(${(0.45 + (0.5 * i) / (LAPIS.length - 1)).toFixed(2)})` }}
          />
        ))}
      </div>
      <small>Geser untuk memutar</small>
    </div>
  );
}
