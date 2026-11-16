import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { kurangiGerak } from '../format.js';
import { BATAS_JUMLAH } from '../logika/keranjang.js';

/* ---------- Penghitung jumlah ---------- */
export function Langkah({ nilai, onUbah, kecil }) {
  return (
    <div className={`langkah${kecil ? ' kecil' : ''}`}>
      <button type="button" aria-label="Kurangi" disabled={nilai <= 1} onClick={() => onUbah(-1)}>−</button>
      <span aria-live="polite">{nilai}</span>
      <button type="button" aria-label="Tambah" disabled={nilai >= BATAS_JUMLAH} onClick={() => onUbah(1)}>+</button>
    </div>
  );
}

/* ---------- Kartu miring mengikuti mouse (layar sentuh: efek tekan lewat CSS) ---------- */
export function useMiring() {
  return {
    onPointerMove(e) {
      if (e.pointerType !== 'mouse' || kurangiGerak()) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 16}deg`);
      el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 16}deg`);
    },
    onPointerLeave(e) {
      e.currentTarget.style.removeProperty('--rx');
      e.currentTarget.style.removeProperty('--ry');
    },
  };
}

/* ---------- Toast ---------- */
const KonteksToast = createContext(() => {});
export const useToast = () => useContext(KonteksToast);

export function PenyediaToast({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();
  const tampilkan = useCallback((pesan, aksi) => {
    clearTimeout(timer.current);
    setToast({ pesan, aksi, id: Math.random() });
    timer.current = setTimeout(() => setToast(null), aksi ? 5000 : 3000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <KonteksToast.Provider value={tampilkan}>
      {children}
      <div className={`toast${toast ? ' on' : ''}`} role="status" aria-live="polite">
        {toast && <span>{toast.pesan}</span>}
        {toast?.aksi && (
          <button type="button" onClick={() => { toast.aksi.jalankan(); setToast(null); }}>
            {toast.aksi.label}
          </button>
        )}
      </div>
    </KonteksToast.Provider>
  );
}

/* ---------- Lembar bawah (bottom sheet) ---------- */
export function Lembar({ terbuka, judul, onTutup, children }) {
  const ref = useRef(null);
  const tutupRef = useRef(onTutup);
  tutupRef.current = onTutup;

  useEffect(() => {
    if (!terbuka) return undefined;
    const kembali = document.activeElement;
    document.body.classList.add('kunci');
    ref.current.scrollTop = 0;
    const t = setTimeout(() => ref.current?.querySelector('.tutup')?.focus({ preventScroll: true }), 60);
    const esc = (e) => e.key === 'Escape' && tutupRef.current();
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('kunci');
      window.removeEventListener('keydown', esc);
      if (kembali?.isConnected) kembali.focus({ preventScroll: true });
    };
  }, [terbuka]);

  return (
    <>
      <div className={`tirai${terbuka ? ' on' : ''}`} onClick={onTutup} />
      <section ref={ref} className={`lembar${terbuka ? ' on' : ''}`} role="dialog" aria-modal="true" aria-label={judul} aria-hidden={!terbuka}>
        <div className="pegangan">
          <span>{judul}</span>
          <button type="button" className="ib tutup" aria-label="Tutup" onClick={onTutup}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {children}
      </section>
    </>
  );
}

/* ---------- Animasi ikon terbang ke tombol keranjang ---------- */
export function terbang(dari, gambar, ke) {
  if (!dari || !ke || kurangiGerak()) return Promise.resolve();
  const b = ke.getBoundingClientRect();
  const x0 = dari.left + dari.width / 2;
  const y0 = dari.top + dari.height / 2;
  const el = document.createElement('div');
  el.className = 'terbang';
  const img = document.createElement('img');
  img.src = gambar;
  img.alt = '';
  el.appendChild(img);
  el.style.left = `${x0 - 28}px`;
  el.style.top = `${y0 - 28}px`;
  document.body.appendChild(el);
  return new Promise((selesai) => {
    const akhiri = () => {
      if (!el.isConnected) return;
      el.remove();
      selesai();
    };
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.transform = `translate(${b.left + b.width / 2 - x0}px,${b.top + b.height / 2 - y0}px) rotateY(540deg) scale(.35)`;
        el.style.opacity = '.5';
      }),
    );
    el.addEventListener('transitionend', akhiri, { once: true });
    setTimeout(akhiri, 900);
  });
}
