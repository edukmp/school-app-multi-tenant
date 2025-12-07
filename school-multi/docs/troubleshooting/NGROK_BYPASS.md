# Ngrok Warning Bypass Guide

## 🔴 Masalah

Saat mengakses aplikasi via Ngrok (`https://hyetal-unfiscally-voncile.ngrok-free.dev`), muncul:
1. Halaman peringatan "You are about to visit..."
2. Error manifest PWA: `Manifest: Line: 1, column: 1, Syntax error`

**Penyebab**: Ngrok free menampilkan halaman HTML peringatan, sehingga browser gagal mengambil file `manifest.webmanifest` (karena dapat HTML, bukan JSON).

## ✅ Solusi

### Cara 1: Manual (Paling Mudah) ⭐ RECOMMENDED

1. Buka `https://hyetal-unfiscally-voncile.ngrok-free.dev`
2. Klik tombol **"Visit Site"**
3. Refresh halaman (Ctrl+R)
4. ✅ Error hilang, PWA bisa diinstall

**Catatan**: Cukup dilakukan **SEKALI** per browser. Cookie akan disimpan.

---

### Cara 2: Bypass Landing Page

Gunakan halaman bypass yang sudah saya buat:

1. Buka: `https://hyetal-unfiscally-voncile.ngrok-free.dev/ngrok-bypass.html`
2. Halaman akan auto-redirect ke aplikasi
3. Klik "Visit Site" jika diminta
4. ✅ Selesai

File: `public/ngrok-bypass.html`

---

### Cara 3: Browser Extension (Permanent)

Install **ModHeader** extension:

#### Chrome/Edge:
1. Install [ModHeader](https://chrome.google.com/webstore/detail/modheader/idgpnmonknjnojddfkpgkljpfnnfcklj)
2. Buka extension
3. Tambah **Request Header**:
   - Name: `ngrok-skip-browser-warning`
   - Value: `true`
4. Aktifkan untuk domain `*.ngrok-free.dev`
5. ✅ Tidak akan ada peringatan lagi

#### Firefox:
1. Install [ModHeader](https://addons.mozilla.org/en-US/firefox/addon/modheader-firefox/)
2. Ikuti langkah yang sama

---

### Cara 4: Bookmarklet (Quick Access)

Simpan bookmark ini di browser:

**Nama**: `Open School App (Bypass)`

**URL**:
```javascript
javascript:(function(){fetch('https://hyetal-unfiscally-voncile.ngrok-free.dev',{headers:{'ngrok-skip-browser-warning':'true'}}).then(()=>window.location.href='https://hyetal-unfiscally-voncile.ngrok-free.dev').catch(()=>window.location.href='https://hyetal-unfiscally-voncile.ngrok-free.dev')})();
```

**Cara pakai**:
1. Klik bookmark
2. Langsung redirect ke aplikasi (bypass warning)

---

### Cara 5: Upgrade Ngrok (Permanent, No Warning)

Jika Anda sering develop dan terganggu dengan warning ini:

1. Daftar akun Ngrok (gratis)
2. Upgrade ke **Ngrok Personal** ($8/bulan) atau **Pro** ($20/bulan)
3. ✅ Tidak ada warning page lagi
4. ✅ Custom domain (bisa pakai domain sendiri)
5. ✅ Lebih stabil dan cepat

**Link**: https://ngrok.com/pricing

---

## 🎯 Rekomendasi

Untuk **development**:
- Gunakan **Cara 1** (Manual click "Visit Site") - Paling simple
- Atau **Cara 3** (ModHeader) - Sekali setup, permanent

Untuk **production**:
- Jangan pakai Ngrok free
- Gunakan **Cloudflare Tunnel** (gratis, tanpa warning)
- Atau **Ngrok paid plan**
- Atau deploy ke **Vercel/Netlify** (gratis, production-ready)

---

## 📝 Catatan Teknis

**Mengapa tidak bisa bypass dari server?**

Header `ngrok-skip-browser-warning` harus dikirim dari **client (browser)** ke Ngrok, bukan dari Vite server. Jadi kita tidak bisa menambahkannya di `vite.config.ts`.

**Mengapa manifest error?**

Browser request `manifest.webmanifest` → Ngrok intercept → Return HTML warning page → Browser expect JSON → Syntax error at line 1 column 1 (karena `<!DOCTYPE html>` bukan `{`).

**Apakah aman?**

Ya, header `ngrok-skip-browser-warning` adalah fitur resmi Ngrok untuk developer. Tidak ada security risk.

---

## 🚀 Alternative: Cloudflare Tunnel

Jika Anda ingin **gratis tanpa warning**, gunakan Cloudflare Tunnel:

```bash
# Install cloudflared
npm install -g cloudflared

# Run tunnel
cloudflared tunnel --url http://localhost:5173
```

Output:
```
Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):
https://random-name.trycloudflare.com
```

**Kelebihan**:
- ✅ Gratis selamanya
- ✅ Tidak ada warning page
- ✅ HTTPS otomatis
- ✅ Lebih cepat dari Ngrok free

**Kekurangan**:
- ❌ URL random setiap restart
- ❌ Harus update Google OAuth redirect URL setiap kali URL berubah

---

## 📞 Need Help?

Jika masih ada masalah:
1. Screenshot error yang muncul
2. Cek DevTools → Console untuk error detail
3. Pastikan sudah klik "Visit Site" minimal sekali
