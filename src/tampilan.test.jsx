// @vitest-environment jsdom
// Tes asap: setiap toko bisa dirender, dan alur pesan utama bisa diklik sampai link WA siap.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App.jsx';
import { DAFTAR_TOKO } from './data/toko.js';

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
  window.scrollTo = () => {}; // jsdom belum mendukung
  globalThis.matchMedia ??= () => ({ matches: true }); // jsdom tidak punya matchMedia; anggap "kurangi gerak"
});
afterEach(cleanup);

const keHash = (h) => act(() => {
  window.location.hash = h;
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});

describe('tampilan demo', () => {
  it('beranda menampilkan keempat toko, tiap toko menampilkan produknya', () => {
    render(<App />);
    for (const t of DAFTAR_TOKO) expect(screen.getByText(t.nama)).toBeTruthy();
    for (const t of DAFTAR_TOKO) {
      keHash(t.id);
      for (const p of t.produk) expect(screen.getByText(p.nama)).toBeTruthy();
    }
  });

  it('F&B: pilih ukuran L + boba → keranjang → isi nama → link WA siap', () => {
    render(<App />);
    keHash('fnb');
    fireEvent.click(screen.getByText('Thai Tea Original'));
    const detail = screen.getByRole('dialog', { name: 'Detail produk' });
    fireEvent.click(within(detail).getByRole('button', { name: /^L ?\+Rp/ }));
    fireEvent.click(within(detail).getByRole('button', { name: /^Boba/ }));
    fireEvent.click(within(detail).getByRole('button', { name: 'Tambah' }));
    fireEvent.click(within(detail).getByRole('button', { name: /Tambah · Rp44\.000/ }));

    fireEvent.click(screen.getByRole('button', { name: /Lihat keranjang/ }));
    const keranjang = screen.getByRole('dialog', { name: 'Keranjang' });
    const kirim = within(keranjang).getByRole('link', { name: /Kirim pesanan/ });
    expect(kirim.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(kirim);
    expect(within(keranjang).getByRole('alert').textContent).toMatch(/Isi nama pemesan/);

    fireEvent.change(within(keranjang).getByLabelText('Nama pemesan'), { target: { value: 'Sari' } });
    expect(kirim.getAttribute('aria-disabled')).toBe('false');
    expect(kirim.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/62\d+\?text=/);
    expect(screen.getByTestId('pratinjau').textContent).toContain('1. Thai Tea Original x2');
    expect(screen.getByTestId('pratinjau').textContent).toContain('Ukuran: L, Gula: Normal, Es: Normal, Topping: Boba');
  });

  it('fashion: memilih warna yang habis di ukuran sekarang menyesuaikan ukuran', () => {
    render(<App />);
    keHash('fashion');
    fireEvent.click(screen.getByText('Kaos Polos Premium'));
    const detail = screen.getByRole('dialog', { name: 'Detail produk' });
    fireEvent.click(within(detail).getByRole('button', { name: 'S' }));
    fireEvent.click(within(detail).getByRole('button', { name: 'Putih' }));
    expect(within(detail).getByRole('button', { name: 'Putih' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(detail).getByRole('button', { name: 'S' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('status').textContent).toMatch(/Ukuran diganti/);
  });

  it('keranjang tersimpan setelah halaman dimuat ulang', () => {
    const { unmount } = render(<App />);
    keHash('barber');
    fireEvent.click(screen.getByText('Cukur Jenggot'));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Detail layanan' })).getByRole('button', { name: /Pilih layanan/ }));
    unmount();
    render(<App />);
    expect(screen.getByRole('button', { name: /Lihat booking/ }).textContent).toMatch(/^1/);
  });
});
