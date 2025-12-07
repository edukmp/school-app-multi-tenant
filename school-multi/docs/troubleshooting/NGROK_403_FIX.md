# Mengatasi Error 403 dari Ngrok

## Penyebab
Error 403 terjadi karena ngrok free tier menampilkan warning page sebelum mengakses aplikasi Anda.

## Solusi

### Cara 1: Manual Click "Visit Site" (Paling Mudah)
1. Buka `https://hyetal-unfiscally-voncile.ngrok-free.dev` di browser
2. Akan muncul halaman warning dari ngrok
3. Klik tombol **"Visit Site"**
4. Halaman akan ter-bookmark dan tidak akan muncul lagi untuk beberapa waktu

### Cara 2: Gunakan Ngrok Agent Config (Advanced)
Buat/edit file ngrok config untuk skip warning:

**Windows**: `%USERPROFILE%\.ngrok2\ngrok.yml`

Tambahkan:
```yaml
tunnels:
  school-app:
    proto: http
    addr: 5173
    domain: hyetal-unfiscally-voncile.ngrok-free.dev
    inspect: false
```

Kemudian jalankan:
```bash
ngrok start school-app
```

### Cara 3: Upgrade Ngrok (Recommended untuk Production)
Ngrok paid plan tidak memiliki warning page:
- **Personal Plan**: $8/bulan - No warning page
- **Pro Plan**: $20/bulan - Custom domains + no warning

## Untuk Development Sekarang

**Lakukan ini:**
1. Buka browser baru (atau incognito)
2. Akses: `https://hyetal-unfiscally-voncile.ngrok-free.dev`
3. Klik "Visit Site" saat muncul warning
4. Browser akan mengingat pilihan Anda
5. Test login Google

## Catatan Penting

⚠️ Warning page ini **TIDAK** akan muncul di production jika Anda:
- Deploy ke Vercel/Netlify/hosting lain
- Menggunakan domain sendiri
- Upgrade ngrok ke paid plan

Untuk development, cukup klik "Visit Site" sekali dan browser akan mengingatnya.
