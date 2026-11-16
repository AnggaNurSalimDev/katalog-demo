// @vitest-environment jsdom
// Tes asap: setiap usaha bisa dirender dengan produk & gambarnya, dan alur pesan utama bisa diklik sampai link WA siap.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App.jsx';
import { DAFTAR_URUT } from './merek/daftar.jsx';
import { SEMUA_TOKO } from './penyimpanan.js';

beforeEach(() => {
  localStorage.clear();
  history.replaceState(null, '', '/');
  window.scrollTo = () => {}; // jsdom belum mendukung
  globalThis.matchMedia ??= () => ({ matches: true }); // jsdom tidak punya matchMedia; anggap "kurangi gerak"
});
afterEach(cleanup);

const bukaUsaha = (nama) => fireEvent.click(within(screen.getByRole('region', { name: 'Pilih usaha contoh' })).getByRole('button', { name: nama }));

describe('tampilan demo', () => {
  it('pengalih menampilkan keempat usaha; tiap usaha punya produk dengan gambarnya sendiri', () => {
    render(<App />);
    const gambarDilihat = new Set();
    for (const [i, p] of DAFTAR_URUT.entries()) {
      bukaUsaha(p.nama);
      if (i > 0) expect(window.location.search).toBe(`?profil=${p.id}`); // usaha pertama sudah aktif
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(p.nama);
      expect(document.documentElement.dataset.tema).toBe(p.gaya.tema);
      for (const x of SEMUA_TOKO[i].produk) expect(screen.getByText(x.nama)).toBeTruthy();
      for (const img of document.querySelectorAll('.wadah-gambar img')) gambarDilihat.add(img.getAttribute('src'));
    }
    const jumlahProduk = SEMUA_TOKO.reduce((t, toko) => t + toko.produk.length, 0);
    expect(gambarDilihat.size).toBe(jumlahProduk); // tidak ada dua produk dengan gambar sama
  });

  it('?profil= di alamat membuka usaha itu langsung', () => {
    history.replaceState(null, '', '/?profil=kilap-auto');
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Kilap Auto Detailing');
  });

  it('F&B: pilih ukuran L + boba → keranjang → isi nama → link WA siap', () => {
    history.replaceState(null, '', '/?profil=kedai-teh-rasa');
    render(<App />);
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
    expect(kirim.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/62\d+\?text=Halo%20Kedai%20Teh%20Rasa/);
    expect(screen.getByTestId('pratinjau').textContent).toContain('1. Thai Tea Original x2');
  });

  it('fashion: gambar ikut warna; warna yang habis di ukuran sekarang menyesuaikan ukuran', () => {
    history.replaceState(null, '', '/?profil=rupa-wear');
    render(<App />);
    fireEvent.click(screen.getByText('Kaos Polos Premium'));
    const detail = screen.getByRole('dialog', { name: 'Detail produk' });
    fireEvent.click(within(detail).getByRole('button', { name: 'S' }));
    fireEvent.click(within(detail).getByRole('button', { name: 'Putih' }));
    expect(within(detail).getByRole('button', { name: 'Putih' }).getAttribute('aria-pressed')).toBe('true');
    expect(within(detail).getByRole('button', { name: 'S' }).getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByRole('status').textContent).toMatch(/Ukuran diganti/);
    expect(within(detail).getByRole('img', { name: 'Kaos Polos Premium' }).getAttribute('src')).toBe('/produk/fashion/kaos-putih.svg');
  });

  it('keranjang tiap usaha terpisah dan tersimpan setelah dimuat ulang', () => {
    history.replaceState(null, '', '/?profil=garis-barbershop');
    const { unmount } = render(<App />);
    fireEvent.click(screen.getByText('Cukur Jenggot'));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Detail layanan' })).getByRole('button', { name: /Pilih layanan/ }));
    bukaUsaha('Kilap Auto Detailing');
    expect(screen.queryByRole('button', { name: /Lihat booking/ })).toBeNull();
    unmount();
    history.replaceState(null, '', '/?profil=garis-barbershop');
    render(<App />);
    expect(screen.getByRole('button', { name: /Lihat booking/ }).textContent).toMatch(/^1/);
  });
});
