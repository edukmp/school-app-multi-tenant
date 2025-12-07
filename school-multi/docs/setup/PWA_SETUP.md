# PWA Setup & Troubleshooting

## 📱 Features
Aplikasi ini sekarang sudah menjadi Progressive Web App (PWA) dengan fitur:
- **Installable**: Bisa diinstall di desktop dan mobile.
- **Offline Support**: Bisa berjalan tanpa koneksi internet (caching assets).
- **Auto Update**: Otomatis update ketika ada versi baru.
- **Theme Color**: Menyesuaikan warna toolbar browser dengan brand (`#4f46e5`).

## ⚠️ Common Issues

### 1. Manifest Syntax Error (Ngrok)
**Error**: `manifest.webmanifest:1 Manifest: Line: 1, column: 1, Syntax error.`

**Penyebab**:
Saat menggunakan Ngrok versi free, Ngrok menampilkan halaman peringatan ("You are about to visit..."). Browser mencoba mengambil file `manifest.webmanifest` di background, tapi malah mendapatkan halaman HTML peringatan tersebut, sehingga terjadi syntax error (karena browser mengharapkan JSON).

**Solusi**:
1. Buka URL aplikasi di browser.
2. Klik tombol **"Visit Site"** pada halaman peringatan Ngrok.
3. Ini akan menyimpan cookie di browser.
4. Refresh halaman. Error manifest akan hilang karena browser sekarang bisa mengakses file manifest yang sebenarnya.

### 2. Icon Tidak Muncul
Pastikan file `public/pwa-icon.svg` ada dan valid.

### 3. Tidak Bisa Install
- Pastikan aplikasi berjalan di `https` (Ngrok sudah menyediakan ini).
- Pastikan `manifest.webmanifest` terload dengan benar (cek tab Network di DevTools).

## 🛠️ Configuration
Konfigurasi PWA ada di `vite.config.ts` bagian `VitePWA`.
