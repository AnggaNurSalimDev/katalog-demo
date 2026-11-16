// Ikon produk digambar sebagai SVG dari data (bentuk + 2 warna), tanpa file gambar.
// Untuk klien sungguhan, ganti dengan foto produk.

const WARNA_SAH = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,]+\))$/i;
const GARIS = 'stroke="rgba(0,0,0,.2)" stroke-width="1.5"';
const KILAP = 'fill="#fff" opacity=".25"';

const BENTUK = {
  gelas: (a, b) => `<rect x="55" y="2" width="6" height="26" rx="2" fill="${b}" ${GARIS} transform="rotate(14 58 15)"/><path d="M27 30h46l-6 58a5 5 0 0 1-5 4H38a5 5 0 0 1-5-4z" fill="${a}" ${GARIS}/><path d="M34 35h6l-3 48h-3z" ${KILAP}/><circle cx="44" cy="83" r="3.4" fill="#000" opacity=".3"/><circle cx="53" cy="85" r="3.4" fill="#000" opacity=".3"/><circle cx="60" cy="80" r="3.4" fill="#000" opacity=".3"/><rect x="22" y="22" width="56" height="10" rx="4" fill="${b}" ${GARIS}/>`,
  kaos: (a, b) => `<path d="M34 16L44 12Q50 20 56 12L66 16L88 32L78 46L70 40V88H30V40L22 46L12 32Z" fill="${a}" ${GARIS}/><path d="M44 12Q50 20 56 12" fill="none" stroke="${b}" stroke-width="3"/><path d="M36 24V84" stroke="#fff" stroke-opacity=".2" stroke-width="5"/>`,
  hoodie: (a, b) => `<path d="M32 22L20 28L12 80L22 82L30 46V88H70V46L78 82L88 80L80 28L68 22Z" fill="${a}" ${GARIS}/><path d="M34 24Q34 6 50 6Q66 6 66 24Q58 31 50 31Q42 31 34 24Z" fill="${a}" ${GARIS}/><path d="M40 22Q50 28 60 22" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/><path d="M38 62H62L66 76H34Z" fill="#000" opacity=".14"/><path d="M45 28V44M55 28V44" stroke="${b}" stroke-width="2.5" stroke-linecap="round"/>`,
  kemeja: (a, b) => `<path d="M32 20L20 26L12 80L22 82L30 46V88H70V46L78 82L88 80L80 26L68 20Z" fill="${a}" ${GARIS}/><path d="M38 40V88M62 40V88M30 56H70M30 74H70" stroke="${b}" stroke-opacity=".55" stroke-width="3"/><path d="M50 32V88" stroke="#000" stroke-opacity=".25" stroke-width="2"/><path d="M38 20L50 34L62 20L57 15H43Z" fill="${b}" ${GARIS}/>`,
  celana: (a, b) => `<path d="M30 10H70L76 92H56L50 40L44 92H24Z" fill="${a}" ${GARIS}/><path d="M30 10H70V18H30Z" fill="#000" opacity=".15"/><path d="M34 20Q36 30 44 30M66 20Q64 30 56 30" fill="none" stroke="${b}" stroke-width="2.5"/>`,
  gunting: (a, b) => `<path d="M38 60L72 8M62 60L28 8" stroke="${b}" stroke-width="8" stroke-linecap="round"/><circle cx="32" cy="74" r="13" fill="none" stroke="${a}" stroke-width="8"/><circle cx="68" cy="74" r="13" fill="none" stroke="${a}" stroke-width="8"/><circle cx="50" cy="38" r="4.5" fill="${a}"/>`,
  pisau: (a, b) => `<rect x="44" y="40" width="12" height="54" rx="5" fill="${a}" ${GARIS}/><path d="M30 14H70Q72 14 72 17V34Q72 38 68 38H32Q28 38 28 34V17Q28 14 30 14Z" fill="${b}" stroke="${a}" stroke-width="2.5"/><path d="M28 18H72" stroke="${a}" stroke-width="3"/>`,
  sisir: (a, b) => `${Array.from({ length: 12 }, (_, i) => `<rect x="${16 + i * 6}" y="40" width="3.2" height="34" rx="1.5" fill="${a}"/>`).join('')}<rect x="12" y="26" width="76" height="18" rx="6" fill="${a}" ${GARIS}/><rect x="18" y="31" width="64" height="4" rx="2" fill="${b}"/>`,
  botol: (a, b) => `<rect x="40" y="8" width="20" height="16" rx="3" fill="${b}" ${GARIS}/><path d="M36 22H64L70 40V86Q70 92 64 92H36Q30 92 30 86V40Z" fill="${a}" ${GARIS}/><rect x="36" y="50" width="28" height="22" rx="4" fill="${b}" opacity=".85"/><path d="M36 30V84" stroke="#fff" stroke-opacity=".22" stroke-width="4"/>`,
  mobil: (a, b) => `<path d="M8 58Q8 48 20 46L32 32Q36 28 42 28H64Q70 28 74 34L82 46Q92 48 92 58V66Q92 70 88 70H12Q8 70 8 66Z" fill="${a}" ${GARIS}/><path d="M39 34L32 46H50V34ZM54 34V46H76L69 36Q68 34 65 34Z" fill="${b}"/><path d="M14 54H86" stroke="#fff" stroke-opacity=".25" stroke-width="3"/><circle cx="28" cy="70" r="10" fill="#111"/><circle cx="72" cy="70" r="10" fill="#111"/><circle cx="28" cy="70" r="4" fill="#cbd5e1"/><circle cx="72" cy="70" r="4" fill="#cbd5e1"/>`,
  semprot: (a, b) => `<path d="M38 14H66L72 22H56V32H44V22H38Z" fill="${b}" ${GARIS}/><path d="M58 30L64 42" stroke="${b}" stroke-width="5" stroke-linecap="round"/><path d="M36 40H62L66 52V88Q66 92 62 92H36Q32 92 32 88V52Z" fill="${a}" ${GARIS}/><rect x="40" y="32" width="18" height="9" fill="${a}"/><circle cx="80" cy="16" r="2.5" fill="${b}"/><circle cx="86" cy="22" r="2" fill="${b}"/><circle cx="84" cy="10" r="2" fill="${b}"/><path d="M38 56V84" stroke="#fff" stroke-opacity=".25" stroke-width="4"/>`,
  poles: (a, b) => `<ellipse cx="50" cy="78" rx="36" ry="11" fill="#000" opacity=".25"/><ellipse cx="50" cy="72" rx="36" ry="11" fill="${b}" ${GARIS}/><rect x="30" y="34" width="40" height="34" rx="10" fill="${a}" ${GARIS}/><rect x="10" y="40" width="26" height="11" rx="5" fill="${a}"/><rect x="42" y="24" width="16" height="12" rx="4" fill="${b}"/>`,
  jok: (a, b) => `<rect x="38" y="2" width="24" height="12" rx="5" fill="${a}" ${GARIS}/><path d="M33 14Q29 14 29 20L34 64H66L71 20Q71 14 67 14Z" fill="${a}" ${GARIS}/><path d="M42 20V60M58 20V60" stroke="${b}" stroke-width="2" stroke-dasharray="3 3"/><path d="M24 62H76Q82 62 82 70V78Q82 84 76 84H24Q18 84 18 78V70Q18 62 24 62Z" fill="${a}" ${GARIS}/><path d="M30 92V84M70 92V84" stroke="#333" stroke-width="5"/>`,
};

/** String SVG. Warna divalidasi karena disisipkan sebagai HTML. */
export function svgIkon(bentuk, warna, aksen) {
  const gambar = BENTUK[bentuk];
  if (!gambar || !WARNA_SAH.test(warna) || !WARNA_SAH.test(aksen)) return '<svg viewBox="0 0 100 100" aria-hidden="true"></svg>';
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${gambar(warna, aksen)}</svg>`;
}

/** Warna ikon mengikuti pilihan Warna/Motif bila toko punya swatch. */
export function svgProduk(toko, produk, pilihan) {
  const w = pilihan && toko.swatch && (toko.swatch[pilihan.Warna] || toko.swatch[pilihan.Motif]);
  return svgIkon(produk.ikon.bentuk, w || produk.ikon.warna, produk.ikon.aksen);
}

export default function Ikon({ svg, className = 'ikon' }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}
