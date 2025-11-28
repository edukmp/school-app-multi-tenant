# 🔧 Fix Database Error - Tabel Profiles Sudah Ada

## Error yang Terjadi:
```
policy "Users can view own profile" for table "profiles" already exists
```

**Artinya**: Tabel `profiles` sudah ada di database, tapi mungkin strukturnya berbeda atau kolom yang dibutuhkan belum ada.

---

## ✅ Solusi: Update Tabel yang Ada

### Langkah 1: Cek Struktur Tabel Saat Ini

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy isi file: **`check-profiles-table.sql`**
3. Paste dan **Run**
4. Lihat hasilnya - akan menampilkan semua kolom yang ada

### Langkah 2: Tambahkan Kolom yang Kurang

1. Di **SQL Editor** yang sama
2. Copy isi file: **`update-profiles-table.sql`**
3. Paste dan **Run**
4. Script ini akan:
   - ✅ Menambahkan kolom `email` jika belum ada
   - ✅ Menambahkan kolom `name` jika belum ada
   - ✅ Menambahkan kolom `avatar_url` jika belum ada
   - ✅ Menambahkan kolom `created_at` jika belum ada
   - ✅ Menambahkan kolom `updated_at` jika belum ada
   - ✅ Membuat trigger untuk auto-update `updated_at`

**Script ini aman** - hanya menambahkan kolom yang belum ada, tidak akan menghapus data existing.

---

## 🎯 Setelah Update

### Test Aplikasi:

1. **Refresh browser** di aplikasi
2. **Logout** (jika sudah login)
3. **Login lagi** dengan Google
4. **Cek Console** - seharusnya tidak ada error lagi!

### Verify di Supabase:

1. Buka **Table Editor** → **profiles**
2. Pastikan kolom-kolom ini ada:
   - `id` (UUID)
   - `email` (text)
   - `name` (text)
   - `avatar_url` (text)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. Setelah login, cek data user:
   - Akan ada row baru dengan data dari Google
   - Email, nama, dan avatar akan terisi otomatis

---

## 📝 Catatan

### Kenapa Error Tadi?

Error `Could not find the 'email' column` terjadi karena:
- Tabel `profiles` sudah ada (dibuat sebelumnya)
- Tapi tidak punya kolom `email`, `name`, atau `avatar_url`
- AuthContext mencoba insert data ke kolom yang tidak ada

### Solusi yang Aman:

Script `update-profiles-table.sql` menggunakan conditional logic:
- Cek dulu apakah kolom sudah ada
- Hanya tambahkan jika belum ada
- Tidak akan error jika kolom sudah ada
- Tidak akan menghapus data existing

---

## 🚀 Quick Reference

**File yang Perlu Dijalankan:**
1. `check-profiles-table.sql` - Untuk cek struktur (optional)
2. `update-profiles-table.sql` - Untuk update tabel (WAJIB)

**Lokasi SQL Editor:**
https://supabase.com/dashboard/project/stywborxrxfullxmyycx/sql

**Setelah selesai:**
- Refresh aplikasi
- Login dengan Google
- Seharusnya tidak ada error! ✅

---

Silakan jalankan `update-profiles-table.sql` sekarang! 😊
