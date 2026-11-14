/**
 * P8 Harum Manis — konfigurasi laman awam.
 * Tukar nilai di sini sebelum deploy.
 */
window.P8_CONFIG = {
  // URL Web App GAS (sistem inventori — perlu log masuk Google)
  appUrl: 'https://script.google.com/macros/s/AKfycbxNF5gpJyvnTslfvRBGBKiGKA8OogheisbU1IbzvhqoL1mfwuQgTCD-mYlQFZNENXkh/exec',

  // API awam produk (deployment berasingan, akses "Anyone") — baca status & stok
  apiUrl: 'https://script.google.com/macros/s/AKfycbwr7XU1PvjtsIgoPdqv30mZRAt3vaVXHXfuoieSEPg0hHWbARzq_rgdYJERbvoN_-gt/exec',

  // Token pesanan (mesti sama dengan WEB_ORDER_TOKEN dalam Kode.gs)
  orderToken: 'P8WEB-hm26-x7k9q',

  // Caj penghantaran laman web (RM)
  shippingFee: 8,

  // Maklumat bayaran yang dipaparkan selepas pesanan
  payMethod: 'DuitNow QR (GXBank)',
  payQr: 'assets/payment-qr.jpg',
  payName: 'Ahmad Bukhori Bin Yusof',
  bankName: 'Maybank',
  bankAccount: '',
  bankHolder: 'PRECISION 8 ENTERPRISE',


  // Domain/subdomain selepas deploy (contoh Netlify Drop)
  siteUrl: 'https://p8-harum-manis.vercel.app',

  // Hubungi / pesanan
  whatsapp: '60173794337',
  email: 'preightenterprise@gmail.com',
  location: 'Jalan Harumanis, 01000 Perlis, Malaysia',

  // Nama paparan
  brand: 'P8 Harum Manis'
};
