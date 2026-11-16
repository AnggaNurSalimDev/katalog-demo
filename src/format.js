export const rupiah = (n) => (Number.isFinite(n) ? `Rp${Math.round(n).toLocaleString('id-ID')}` : '—');
export const kurangiGerak = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Path di folder public ("/produk/a.svg") → alamat yang benar walau situs dipasang di sub-folder (base Vite). */
export function aset(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return path;
  const dasar = import.meta.env?.BASE_URL ?? '/';
  return dasar.endsWith('/') ? dasar + path.slice(1) : `${dasar}${path}`;
}
