# Password Reset Troubleshooting Guide

## ✅ Perubahan yang Sudah Dilakukan

Saya telah mengupdate aplikasi untuk menangani password reset dengan benar:

1. **GoogleAuthCallback.tsx** - Mendeteksi recovery token dan redirect ke halaman reset password
2. **ResetPasswordPage.tsx** - Menangani token dari URL hash dan redirect ke Super Admin login setelah berhasil

## 🔧 Cara Menggunakan Password Reset

### Metode 1: Melalui Supabase Dashboard (Recommended)

1. **Buka Supabase Dashboard**
   - Login ke https://app.supabase.com
   - Pilih project Anda

2. **Reset Password User**
   - Klik **Authentication** → **Users**
   - Cari user: `ekamamgif@gmail.com`
   - Klik pada user tersebut
   - Klik **"Send password reset email"**
   - **PENTING**: Pastikan email template di Supabase menggunakan redirect URL yang benar

3. **Update Email Template (PENTING!)**
   - Klik **Authentication** → **Email Templates**
   - Pilih **"Reset Password"**
   - Pastikan `{{ .ConfirmationURL }}` menggunakan format:
     ```
     {{ .SiteURL }}/auth/reset-password#access_token={{ .Token }}&type=recovery
     ```
   - Atau update **Site URL** di **Authentication** → **URL Configuration**:
     ```
     https://hyetal-unfiscally-voncile.ngrok-free.dev
     ```

### Metode 2: Manual Reset via Dashboard

Jika email tidak berfungsi, Anda bisa set password langsung:

1. **Buka Supabase Dashboard**
2. **Authentication** → **Users**
3. Cari user `ekamamgif@gmail.com`
4. Klik user tersebut
5. Scroll ke bawah, cari **"Reset Password"** atau **"Update User"**
6. Set password baru langsung (tanpa email)

## 🎯 Cara Login Setelah Reset Password

Setelah password berhasil di-reset:

1. **Buka halaman Super Admin Login**:
   ```
   https://hyetal-unfiscally-voncile.ngrok-free.dev/auth/super-admin
   ```

2. **Login dengan**:
   - Email: `ekamamgif@gmail.com`
   - Password: [password baru yang Anda set]

3. **JANGAN** login di:
   - `/login` (User login)
   - `/admin/login` (Tenant admin login)

## ⚠️ Troubleshooting

### Problem: Link reset menuju ke `/#` (halaman kosong)

**Penyebab**: Supabase redirect URL tidak dikonfigurasi dengan benar

**Solusi**:
1. Update **Site URL** di Supabase Dashboard:
   - **Authentication** → **URL Configuration**
   - **Site URL**: `https://hyetal-unfiscally-voncile.ngrok-free.dev`

2. Tambahkan ke **Redirect URLs**:
   ```
   https://hyetal-unfiscally-voncile.ngrok-free.dev/auth/reset-password
   https://hyetal-unfiscally-voncile.ngrok-free.dev/auth/google-callback
   ```

3. Generate link reset baru dari Dashboard

### Problem: "Invalid or expired reset link"

**Solusi**:
- Token reset password hanya valid 1 jam
- Generate link baru dari Supabase Dashboard
- Atau gunakan Metode 2 (Manual Reset)

### Problem: Setelah reset, tidak bisa login

**Solusi**:
1. Pastikan login di halaman yang benar: `/auth/super-admin`
2. Cek apakah role masih `super_admin`:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'ekamamgif@gmail.com';
   ```
3. Jika role hilang, jalankan:
   ```sql
   UPDATE profiles 
   SET role = 'super_admin' 
   WHERE email = 'ekamamgif@gmail.com';
   ```

## 📋 Checklist Konfigurasi Supabase

- [ ] Site URL di-set ke ngrok URL
- [ ] Redirect URLs mencakup `/auth/reset-password` dan `/auth/google-callback`
- [ ] Email template menggunakan `{{ .SiteURL }}` yang benar
- [ ] User sudah confirmed (Auto Confirm User dicentang saat buat user)
- [ ] Role user adalah `super_admin` di tabel profiles

## 🚀 Quick Fix: Set Password Langsung

Jika semua cara di atas tidak berhasil, gunakan cara tercepat:

1. **Buka Supabase SQL Editor**
2. **Jalankan query ini** (ganti dengan password yang Anda inginkan):
   ```sql
   -- CATATAN: Ini hanya untuk development/testing
   -- Untuk production, gunakan Supabase Dashboard
   
   -- Cek user ID
   SELECT id, email FROM auth.users WHERE email = 'ekamamgif@gmail.com';
   
   -- Kemudian gunakan Supabase Dashboard untuk set password
   -- karena password harus di-hash dengan bcrypt
   ```

3. **Set password via Dashboard** (lihat Metode 2 di atas)

## 📞 Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Cek console browser untuk error messages
2. Cek Supabase logs di Dashboard → Logs
3. Pastikan ngrok tunnel masih running (`npm run tunnel`)
4. Pastikan dev server masih running (`npm run dev`)
