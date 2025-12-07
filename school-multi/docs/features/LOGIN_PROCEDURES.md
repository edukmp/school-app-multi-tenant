# 🔐 Prosedur Login Berdasarkan Role User

Dokumen ini menjelaskan alur login lengkap untuk setiap role user dalam sistem School Multi-Tenant Application.

---

## 📋 Daftar Role User

1. **Super Admin** - Pengelola platform utama
2. **Admin** - Administrator sekolah/tenant
3. **Guru/Staff** - Tenaga pendidik dan staff sekolah
4. **Orang Tua** - Wali murid
5. **Siswa** - Peserta didik

---

## 1️⃣ SUPER ADMIN

### 🎯 Karakteristik
- Role: `super_admin`
- Akses penuh ke seluruh sistem
- Dapat membuat dan mengelola tenant/sekolah
- Dapat membuat admin baru

### 📍 URL Login
```
/auth/super-admin
```

### 🔑 Metode Login
**HANYA Email & Password** (Google OAuth TIDAK tersedia untuk Super Admin)

### 📝 Prosedur Login

1. **Buka halaman login Super Admin**
   ```
   https://your-domain.com/auth/super-admin
   ```

2. **Masukkan kredensial**
   - Email: `superadmin@example.com`
   - Password: `[password yang telah dibuat]`

3. **Klik "Login as Super Admin"**

4. **Sistem akan:**
   - ✅ Validasi kredensial
   - ✅ Cek role di database
   - ✅ Redirect ke `/super-admin` (Dashboard Super Admin)

### ⚠️ Catatan Penting
- Akun Super Admin harus dibuat manual di Supabase Dashboard
- Role `super_admin` harus di-set di tabel `profiles`
- **Super Admin TIDAK bisa login dengan Google OAuth** - hanya Email/Password

### 🔧 Cara Membuat Super Admin Baru

**Via Supabase Dashboard:**

1. **Buat User di Authentication**
   - Buka Supabase Dashboard → Authentication → Users
   - Klik "Add user" atau "Invite user"
   - Masukkan email dan password
   - ✅ Centang "Auto Confirm User"

2. **Set Role di Database**
   ```sql
   -- Update role menjadi super_admin
   UPDATE public.profiles 
   SET role = 'super_admin' 
   WHERE email = 'superadmin@example.com';
   
   -- Verify
   SELECT id, email, role FROM public.profiles 
   WHERE email = 'superadmin@example.com';
   ```

---

## 2️⃣ ADMIN (Tenant Administrator)

### 🎯 Karakteristik
- Role: `admin`
- Mengelola satu sekolah/tenant tertentu
- Dibuat oleh Super Admin
- Akses ke fitur administrasi sekolah

### 📍 URL Login
```
/admin/login
```

### 🔑 Metode Login
**HANYA Email & Password** (Google OAuth TIDAK tersedia untuk admin)

### 📝 Prosedur Login

1. **Buka halaman login Admin**
   ```
   https://your-domain.com/admin/login
   ```

2. **Masukkan kredensial**
   - Email: `admin@school.edu`
   - Password: `[password yang diberikan Super Admin]`

3. **Klik "Sign in as Admin"**

4. **Sistem akan:**
   - ✅ Validasi kredensial
   - ✅ Ambil data user dari Supabase Auth
   - ✅ Cek role di tabel `profiles`
   - ✅ **Validasi role = `admin` atau `super_admin`**
   - ❌ Jika role bukan admin → Logout paksa + error message
   - ✅ Jika valid → Redirect ke `/tenant/onboarding`

### ⚠️ Validasi Ketat
```typescript
// Kode validasi di TenantLogin.tsx
if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    // ✅ Login berhasil
    window.location.href = '/tenant/onboarding'
} else {
    // ❌ Akses ditolak
    await supabase.auth.signOut()
    setError('Access denied. This login is restricted to administrators.')
}
```

### 🔧 Cara Membuat Admin Baru

**Opsi 1: Via Super Admin Dashboard (Recommended)**

1. Login sebagai Super Admin
2. Buka `/tenant/setup`
3. Isi form:
   - Email admin baru
   - Password
   - Nama sekolah/tenant
4. Klik "Create Tenant Admin"
5. Sistem otomatis membuat user dengan role `admin`

**Opsi 2: Manual via Supabase Dashboard**

1. **Buat User di Authentication**
   - Supabase Dashboard → Authentication → Users
   - Add user dengan email & password
   - ✅ Auto Confirm User

2. **Set Role**
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@school.edu';
   ```

---

## 3️⃣ GURU / STAFF / ORANG TUA / SISWA

### 🎯 Karakteristik
- Role: `user` (di database) → `registered_user` (di frontend)
- Atau role spesifik: `guru`, `parent`, `student`
- User biasa dengan akses terbatas
- Harus melengkapi profil setelah login pertama kali

### 📍 URL Login
```
/login
```

### 🔑 Metode Login
1. **Google OAuth** (Primary - Recommended)
2. **Email & Password** (Alternative)

### 📝 Prosedur Login

#### A. Login dengan Google (Recommended)

1. **Buka halaman login User**
   ```
   https://your-domain.com/login
   ```

2. **Klik tombol "Login dengan Google"**

3. **Pilih akun Google Anda**
   - Jika pertama kali → Akun otomatis terdaftar
   - Jika sudah pernah → Langsung login

4. **Sistem akan redirect ke `/auth/google-callback`**

5. **Proses di Google Callback:**
   ```typescript
   // 1. Cek role user
   if (user.role === 'super_admin') {
       navigate('/super-admin')
   } else if (user.role === 'admin') {
       navigate('/tenant/onboarding')
   } else {
       // 2. Cek kelengkapan profil
       const isProfileComplete = 
           profile.is_profile_completed ||
           (profile.phone && profile.address)
       
       if (!isProfileComplete) {
           // ⚠️ Profil belum lengkap
           navigate('/complete-profile')
       } else {
           // ✅ Profil lengkap
           navigate('/')
       }
   }
   ```

6. **Jika profil belum lengkap:**
   - Redirect paksa ke `/complete-profile`
   - User HARUS mengisi:
     - ✅ Full Name
     - ✅ Phone Number
     - ✅ Address
   - Klik "Save and Continue"
   - Redirect ke `/` (Home/Dashboard)

7. **Jika profil sudah lengkap:**
   - Langsung redirect ke `/` (Home/Dashboard)

#### B. Login dengan Email & Password

1. **Buka halaman login User**
   ```
   https://your-domain.com/login
   ```

2. **Klik "Sign in with Email"**

3. **Masukkan kredensial**
   - Email: `user@example.com`
   - Password: `[password Anda]`

4. **Klik "Sign In"**

5. **Sistem akan:**
   - ✅ Validasi kredensial
   - ✅ Login berhasil
   - ✅ Redirect ke `/` (Home)

### 🆕 Registrasi User Baru

**Via Google OAuth (Otomatis):**

1. Klik "Login dengan Google" di `/login`
2. Pilih akun Google
3. Sistem otomatis:
   - Buat user di Supabase Auth
   - Buat profile di tabel `profiles` dengan role default `user`
   - Redirect ke `/complete-profile`

**Via Email & Password (Manual):**

1. Buat user di Supabase Dashboard
2. Atau implementasikan halaman Sign Up (belum ada saat ini)

---

## 📊 Ringkasan Alur Login

| Role | URL Login | Metode | Validasi Role | Redirect Setelah Login |
|------|-----------|--------|---------------|------------------------|
| **Super Admin** | `/auth/super-admin` | **Email/Password ONLY** | ✅ Cek `super_admin` | `/super-admin` |
| **Admin** | `/admin/login` | **Email/Password ONLY** | ✅ Cek `admin` atau `super_admin`, tolak lainnya | `/tenant/onboarding` |
| **User Biasa** | `/login` | Google (Primary) + Email/Password | ❌ Tidak ada validasi khusus | `/complete-profile` (jika belum lengkap) atau `/` |

---

## 🔒 Keamanan & Validasi

### 1. Admin Login Security
```typescript
// Di TenantLogin.tsx
// Setelah login, WAJIB cek role
const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

if (profile?.role === 'admin' || profile?.role === 'super_admin') {
    // ✅ Allowed
} else {
    // ❌ Logout paksa
    await supabase.auth.signOut()
    setError('Access denied.')
}
```

### 2. Profile Completion Enforcement
```typescript
// Di GoogleAuthCallback.tsx
// User biasa HARUS lengkapi profil
if (!isProfileComplete) {
    navigate('/complete-profile') // Redirect paksa
}
```

### 3. Route Protection
```typescript
// Di App.tsx
<Route path="/complete-profile" element={
    user ? <CompleteProfilePage /> : <Navigate to="/login" replace />
} />
```

---

## 🛠️ Troubleshooting

### ❌ "Invalid login credentials"
**Penyebab:**
- Email/password salah
- User belum terdaftar
- Akun dibuat via Google (tidak punya password)

**Solusi:**
- Cek kredensial
- Jika akun dibuat via Google, gunakan Google login
- Reset password jika lupa

### ❌ "Access denied. This login is restricted to administrators."
**Penyebab:**
- Login di `/admin/login` tapi role bukan `admin`

**Solusi:**
- User biasa harus login di `/login`
- Cek role di database:
  ```sql
  SELECT email, role FROM public.profiles WHERE email = 'your@email.com';
  ```

### ❌ "Could not find the 'address' column"
**Penyebab:**
- Database belum diupdate dengan kolom baru

**Solusi:**
- Jalankan migration `03_add_profile_fields.sql`:
  ```sql
  -- Lihat file: database/migrations/03_add_profile_fields.sql
  ```

### ❌ Stuck di `/complete-profile`
**Penyebab:**
- Kolom `phone` atau `address` belum diisi
- Database belum punya kolom tersebut

**Solusi:**
1. Isi semua field yang required
2. Pastikan migration sudah dijalankan
3. Cek console browser untuk error detail

---

## 📞 Kontak & Support

Jika mengalami masalah login:
1. Cek console browser (F12) untuk error detail
2. Cek Supabase Dashboard → Authentication → Users
3. Cek tabel `profiles` untuk memastikan role sudah benar
4. Hubungi Super Admin untuk bantuan

---

**Terakhir diupdate:** 3 Desember 2024
**Versi:** 1.0.0
