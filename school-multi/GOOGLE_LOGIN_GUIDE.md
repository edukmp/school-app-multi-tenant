# Panduan Login dengan Google menggunakan Ngrok

## Status Konfigurasi

✅ **Ngrok Tunnel**: Aktif di `https://hyetal-unfiscally-voncile.ngrok-free.dev`  
✅ **Environment Variable**: VITE_APP_URL sudah dikonfigurasi  
✅ **AuthContext**: Sudah diupdate untuk menggunakan ngrok URL  

## Langkah-langkah untuk Testing

### 1. Pastikan Supabase sudah dikonfigurasi

Buka **Supabase Dashboard** → **Authentication** → **URL Configuration**

Tambahkan URL berikut ke **Redirect URLs**:
```
https://hyetal-unfiscally-voncile.ngrok-free.dev/auth/google-callback
```

### 2. Restart Development Server

Karena ada perubahan di `.env`, restart server:

```bash
# Tekan Ctrl+C di terminal yang menjalankan npm run dev
# Kemudian jalankan lagi:
npm run dev
```

### 3. Akses Aplikasi

Buka browser dan akses:
```
https://hyetal-unfiscally-voncile.ngrok-free.dev
```

**PENTING**: Jangan gunakan `localhost` atau IP lokal. Harus menggunakan URL ngrok.

### 4. Test Login

1. Klik tombol "Sign in with Google"
2. Pilih akun Google Anda
3. Setelah berhasil, akan redirect ke `/auth/google-callback`
4. Kemudian otomatis redirect ke dashboard

## Troubleshooting

### Jika masih gagal:

1. **Cek Console Browser** (F12) untuk error messages
2. **Cek Supabase Logs**: Dashboard → Logs → Auth Logs
3. **Pastikan Redirect URL benar** di Supabase
4. **Clear Browser Cache** atau gunakan Incognito Mode

### Ngrok Warning Page

Jika muncul halaman warning dari ngrok, klik "Visit Site" untuk melanjutkan.

## Secret untuk Supabase (jika diperlukan)

Jika diminta JWT Secret di Supabase:
```
shool-multi-secret
```

## Catatan

- Ngrok free tier akan generate URL baru setiap restart
- Jika restart ngrok, update Redirect URL di Supabase lagi
- Untuk URL tetap, upgrade ke ngrok paid plan
