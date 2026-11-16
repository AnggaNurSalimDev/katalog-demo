export const rupiah = (n) => (Number.isFinite(n) ? `Rp${Math.round(n).toLocaleString('id-ID')}` : '—');
export const kurangiGerak = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
