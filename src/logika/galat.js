// Pelanggaran invarian = bug di kode atau data, bukan kesalahan pengguna.
// Kesalahan pengguna (nama kosong, jam lewat) dikembalikan sebagai daftar pesan, bukan dilempar.

export function invarian(syarat, pesan) {
  if (!syarat) throw new Error(`Invarian dilanggar: ${pesan}`);
}
