# PWA Installation Guide

## ✅ Perubahan yang Sudah Dilakukan

### 1. Konfigurasi PWA (`vite.config.ts`)
- ✅ Manifest dengan `name`, `short_name`, `description`
- ✅ `theme_color` dan `background_color`
- ✅ `display: 'standalone'` untuk tampilan fullscreen
- ✅ `start_url` dan `scope` untuk routing
- ✅ Icons 192x192 dan 512x512 (SVG)
- ✅ Service Worker auto-update

### 2. Service Worker Registration (`main.tsx`)
- ✅ Explicit registration dengan `virtual:pwa-register`
- ✅ Auto-update prompt saat ada konten baru
- ✅ Offline ready notification

### 3. Type Definitions (`vite-env.d.ts`)
- ✅ Reference ke `vite-plugin-pwa/client`

## 📱 Cara Install PWA

### Di Desktop (Chrome/Edge)
1. Buka aplikasi di browser
2. Lihat **icon Install** (➕ atau ⬇️) di address bar (kanan atas)
3. Klik icon tersebut
4. Klik **"Install"** pada dialog yang muncul
5. Aplikasi akan terbuka di window terpisah seperti aplikasi native

**Alternatif:**
- Klik menu browser (⋮) → **"Install School App..."**

### Di Mobile (Android)
1. Buka aplikasi di Chrome
2. Tap menu (⋮) di kanan atas
3. Pilih **"Add to Home screen"** atau **"Install app"**
4. Tap **"Install"**
5. Icon aplikasi akan muncul di home screen

### Di Mobile (iOS/Safari)
1. Buka aplikasi di Safari
2. Tap tombol **Share** (kotak dengan panah ke atas)
3. Scroll dan pilih **"Add to Home Screen"**
4. Tap **"Add"**

## ⚠️ Troubleshooting: Icon Install Tidak Muncul

### Checklist Installability
Browser hanya menampilkan icon install jika **SEMUA** kriteria terpenuhi:

#### 1. ✅ HTTPS
- Aplikasi harus diakses via `https://` (Ngrok sudah menyediakan ini)
- Atau `localhost` (untuk development)

#### 2. ✅ Manifest Valid
Cek di **DevTools → Application → Manifest**:
- Name: "School App Multi-Tenant" ✅
- Short name: "School App" ✅
- Icons: 192x192 dan 512x512 ✅
- Start URL: "/" ✅
- Display: "standalone" ✅

#### 3. ✅ Service Worker Registered
Cek di **DevTools → Application → Service Workers**:
- Harus ada entry `sw.js` dengan status **"activated"**
- Jika tidak ada, refresh halaman (Ctrl+F5)

#### 4. ⚠️ Ngrok Warning Page
**PENTING**: Jika menggunakan Ngrok free, Anda HARUS:
1. Klik **"Visit Site"** pada halaman peringatan Ngrok
2. Refresh halaman setelah klik
3. Baru icon install akan muncul

**Mengapa?** Browser tidak bisa register service worker jika halaman pertama yang dimuat adalah halaman peringatan HTML (bukan aplikasi Anda).

#### 5. Browser Support
- ✅ Chrome/Edge (Desktop & Android)
- ✅ Safari (iOS 11.3+)
- ❌ Firefox Desktop (tidak support install prompt, tapi bisa bookmark)

### Cara Cek Manual

1. **Buka DevTools** (F12)
2. **Console Tab** → Ketik:
   ```javascript
   navigator.serviceWorker.getRegistrations()
   ```
   Harus return array dengan 1 service worker.

3. **Application Tab** → **Manifest**:
   - Pastikan tidak ada error merah
   - Lihat preview icon (harus muncul)

4. **Application Tab** → **Service Workers**:
   - Status harus "activated and is running"

### Force Install (Manual)

Jika icon tidak muncul otomatis, Anda bisa install manual:

**Chrome/Edge:**
1. Klik menu (⋮) → **More tools** → **Create shortcut...**
2. Centang **"Open as window"**
3. Klik **Create**

**Atau via DevTools:**
1. F12 → **Console**
2. Ketik:
   ```javascript
   window.location.reload()
   ```
3. Tunggu 5 detik, icon install akan muncul

## 🔧 Debugging

### Lihat PWA Installability
1. Buka DevTools (F12)
2. **Application** tab
3. Klik **Manifest** di sidebar kiri
4. Scroll ke bawah, lihat **"Installability"**
5. Jika ada error, akan ditampilkan di sini

### Common Errors

| Error | Solusi |
|-------|--------|
| "Page is not served from a secure origin" | Gunakan HTTPS (Ngrok sudah HTTPS) |
| "No matching service worker detected" | Refresh halaman, tunggu SW register |
| "Manifest start_url is not cached" | Tunggu beberapa detik, SW sedang cache |
| "No supplied icon is at least 192px" | Sudah diperbaiki (pakai SVG 192 & 512) |

## 🎯 Testing

### Test Offline Mode
1. Install PWA
2. Buka aplikasi yang sudah diinstall
3. DevTools → **Network** tab
4. Centang **"Offline"**
5. Refresh halaman
6. Aplikasi tetap bisa dibuka (dengan cache)

### Test Update Prompt
1. Ubah kode aplikasi
2. Build ulang (`npm run build`)
3. Deploy/refresh
4. Aplikasi akan tampilkan prompt: "New content available. Reload?"

## 📝 Catatan

- **Dev Mode**: Service worker aktif di dev mode (`devOptions.enabled: true`)
- **Production**: Build dengan `npm run build`, SW akan di-generate otomatis
- **Cache**: SW akan cache semua assets (CSS, JS, images)
- **Update**: Auto-update saat ada versi baru (dengan prompt)

## 🚀 Next Steps

Jika icon install masih tidak muncul setelah semua langkah di atas:
1. Pastikan Anda sudah klik "Visit Site" di Ngrok warning
2. Hard refresh (Ctrl+Shift+R)
3. Tunggu 5-10 detik
4. Cek DevTools → Console untuk error
5. Screenshot error dan kirim untuk troubleshooting lebih lanjut
