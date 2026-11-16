// Katalog per jenis usaha (produk, opsi, harga, aturan terima). Tampilan ada di src/merek/profil.
import teh from './teh.js';
import fashion from './fashion.js';
import barber from './barber.js';
import detailing from './detailing.js';

export const KATALOG = Object.freeze({ teh, fashion, barber, detailing });
export const JENIS_DATA = Object.keys(KATALOG);
