# 🏢 Multi-Tenant Architecture - Data Isolation Guide

## Pertanyaan: Apakah data setiap tenant terisolasi?

**JAWABAN: YA! ✅**

Setiap tenant (sekolah) memiliki data yang **100% terisolasi** dan **tidak bisa mengakses data tenant lain**.

---

## 🔒 Bagaimana Isolasi Data Bekerja?

### 1. **Row Level Security (RLS) di Database**

Setiap tabel di Supabase menggunakan **Row Level Security (RLS)** yang memastikan:
- User hanya bisa melihat data dari `tenant_id` mereka sendiri
- User tidak bisa membuat, edit, atau hapus data dari tenant lain
- Isolasi terjadi di **level database**, bukan hanya di aplikasi

#### Contoh RLS Policy (dari `events` table):

```sql
-- 1. Users can view events from their tenant
CREATE POLICY "Users can view events from their tenant"
    ON public.events
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 2. Users can create events for their tenant
CREATE POLICY "Users can create events for their tenant"
    ON public.events
    FOR INSERT
    WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 3. Users can update events from their tenant
CREATE POLICY "Users can update events from their tenant"
    ON public.events
    FOR UPDATE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );

-- 4. Users can delete events from their tenant
CREATE POLICY "Users can delete events from their tenant"
    ON public.events
    FOR DELETE
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
        )
    );
```

### 2. **Tenant ID di Setiap Tabel**

Setiap tabel memiliki kolom `tenant_id`:

```sql
CREATE TABLE public.events (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    -- ... kolom lainnya
);
```

**Keuntungan**:
- ✅ Data otomatis ter-filter berdasarkan tenant
- ✅ Foreign key constraint memastikan referential integrity
- ✅ CASCADE DELETE: Jika tenant dihapus, semua data terkait ikut terhapus

### 3. **User Profile dengan Tenant ID**

Setiap user memiliki `tenant_id` di tabel `profiles`:

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    tenant_id UUID REFERENCES public.tenants(id),
    email TEXT,
    name TEXT,
    role TEXT,
    -- ...
);
```

**Cara Kerja**:
1. User login → Supabase auth memberikan `auth.uid()`
2. System lookup `tenant_id` dari `profiles` berdasarkan `auth.uid()`
3. Semua query otomatis di-filter dengan `tenant_id` tersebut

---

## 🛡️ Lapisan Keamanan Multi-Tenant

### Level 1: Database (RLS Policies)
```
┌─────────────────────────────────────┐
│  PostgreSQL Row Level Security      │
│  ✅ Enforced at database level      │
│  ✅ Cannot be bypassed by app code  │
└─────────────────────────────────────┘
```

**Contoh**: User dari Sekolah A mencoba query:
```sql
SELECT * FROM events;
```

**Yang terjadi di database**:
```sql
-- RLS otomatis menambahkan WHERE clause
SELECT * FROM events 
WHERE tenant_id = 'sekolah-a-uuid';
```

### Level 2: Application (Service Layer)
```typescript
// eventsService.ts
export const fetchEvents = async (): Promise<EventData[]> => {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        // RLS otomatis filter berdasarkan tenant_id user
    
    if (error) throw error
    return data.map(transformEvent)
}
```

### Level 3: Authentication
```
User Login → Supabase Auth → JWT Token
                                  ↓
                            Contains user_id
                                  ↓
                    Lookup tenant_id from profiles
                                  ↓
                        All queries filtered
```

---

## 📊 Contoh Skenario

### Skenario 1: Dua Sekolah Berbeda

**Sekolah A (tenant_id: `aaa-111`)**:
- User: `guru-a@sekolah-a.com`
- Events: 10 events dengan `tenant_id = aaa-111`

**Sekolah B (tenant_id: `bbb-222`)**:
- User: `guru-b@sekolah-b.com`
- Events: 15 events dengan `tenant_id = bbb-222`

**Ketika `guru-a@sekolah-a.com` login dan fetch events**:
```typescript
const events = await fetchEvents()
// Result: Hanya 10 events dari Sekolah A
// Events dari Sekolah B TIDAK MUNCUL
```

**Ketika `guru-b@sekolah-b.com` login dan fetch events**:
```typescript
const events = await fetchEvents()
// Result: Hanya 15 events dari Sekolah B
// Events dari Sekolah A TIDAK MUNCUL
```

### Skenario 2: Mencoba Akses Data Tenant Lain

**Jika user Sekolah A mencoba akses data Sekolah B**:
```typescript
// Bahkan jika kode mencoba query dengan tenant_id lain
const { data } = await supabase
    .from('events')
    .select('*')
    .eq('tenant_id', 'bbb-222') // Tenant B

// Result: EMPTY ARRAY []
// RLS policy memblokir akses
```

---

## 🔍 Tabel yang Sudah Memiliki Multi-Tenant Support

### ✅ Events Table
- File: `database/setup/02_events_setup.sql`
- RLS: 4 policies (SELECT, INSERT, UPDATE, DELETE)
- Isolasi: Berdasarkan `tenant_id`

### ✅ Profiles Table
- File: `database/setup/01_profiles_setup.sql`
- RLS: User hanya bisa akses profile mereka sendiri
- Tenant: Setiap profile punya `tenant_id`

### 📋 Tabel Lain yang Perlu RLS

Jika Anda menambahkan tabel baru, pastikan:
1. ✅ Ada kolom `tenant_id UUID REFERENCES public.tenants(id)`
2. ✅ Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
3. ✅ Buat 4 policies: SELECT, INSERT, UPDATE, DELETE
4. ✅ Semua policy filter berdasarkan `tenant_id`

---

## 🧪 Cara Test Multi-Tenancy

### Test 1: Buat 2 User dari Tenant Berbeda

```sql
-- Tenant A
INSERT INTO tenants (id, name) VALUES ('tenant-a', 'Sekolah A');

-- Tenant B
INSERT INTO tenants (id, name) VALUES ('tenant-b', 'Sekolah B');

-- User A (Sekolah A)
INSERT INTO profiles (id, tenant_id, email, name)
VALUES ('user-a-id', 'tenant-a', 'user-a@sekolah-a.com', 'User A');

-- User B (Sekolah B)
INSERT INTO profiles (id, tenant_id, email, name)
VALUES ('user-b-id', 'tenant-b', 'user-b@sekolah-b.com', 'User B');
```

### Test 2: Buat Data untuk Masing-masing Tenant

```sql
-- Event untuk Tenant A
INSERT INTO events (tenant_id, title, event_date, event_time, location, event_type)
VALUES ('tenant-a', 'Event Sekolah A', '2024-12-10', '09:00', 'Room A', 'class');

-- Event untuk Tenant B
INSERT INTO events (tenant_id, title, event_date, event_time, location, event_type)
VALUES ('tenant-b', 'Event Sekolah B', '2024-12-10', '09:00', 'Room B', 'class');
```

### Test 3: Login dan Verify

1. **Login sebagai User A**
   - Fetch events → Hanya muncul "Event Sekolah A"
   - "Event Sekolah B" TIDAK MUNCUL ✅

2. **Login sebagai User B**
   - Fetch events → Hanya muncul "Event Sekolah B"
   - "Event Sekolah A" TIDAK MUNCUL ✅

---

## 🚨 Troubleshooting

### Issue: User bisa lihat data tenant lain

**Penyebab**:
- RLS tidak enabled
- RLS policy salah
- `tenant_id` tidak di-set dengan benar

**Solusi**:
```sql
-- 1. Pastikan RLS enabled
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 2. Cek policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- 3. Verify tenant_id di profiles
SELECT id, email, tenant_id FROM profiles WHERE id = auth.uid();
```

### Issue: User tidak bisa lihat data apapun

**Penyebab**:
- User tidak punya `tenant_id` di profiles
- `tenant_id` tidak match dengan data

**Solusi**:
```sql
-- Update tenant_id user
UPDATE profiles 
SET tenant_id = 'correct-tenant-id' 
WHERE id = 'user-id';
```

---

## 📚 Best Practices

### 1. Selalu Gunakan RLS
```sql
-- WAJIB untuk setiap tabel
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 2. Buat 4 Policy Standar
```sql
-- SELECT, INSERT, UPDATE, DELETE
-- Semua filter berdasarkan tenant_id
```

### 3. Test dengan Multiple Tenants
- Buat minimal 2 tenant untuk testing
- Verify data isolation
- Test CRUD operations

### 4. Gunakan Service Layer
```typescript
// Jangan query langsung, gunakan service
import { fetchEvents } from './services/eventsService'

// RLS otomatis diterapkan
const events = await fetchEvents()
```

### 5. Audit Logs (Optional)
```sql
-- Track siapa mengakses data apa
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    tenant_id UUID,
    user_id UUID,
    action TEXT,
    table_name TEXT,
    created_at TIMESTAMP
);
```

---

## ✅ Kesimpulan

**Apakah data setiap tenant terisolasi?**

### YA! 100% Terisolasi ✅

1. ✅ **Database Level**: RLS policies memastikan isolasi di PostgreSQL
2. ✅ **Application Level**: Service layer menggunakan Supabase client dengan RLS
3. ✅ **Authentication Level**: JWT token membawa user_id → tenant_id
4. ✅ **Cannot be bypassed**: Bahkan dengan SQL injection, RLS tetap enforce

**Tenant A tidak bisa**:
- ❌ Lihat data Tenant B
- ❌ Edit data Tenant B
- ❌ Hapus data Tenant B
- ❌ Buat data untuk Tenant B

**Keamanan Multi-Tenant**:
- 🔒 Enforced at database level
- 🔒 Automatic filtering
- 🔒 No code changes needed
- 🔒 Production-ready

---

## 📞 Need Help?

Jika ada pertanyaan tentang multi-tenancy:
1. Cek RLS policies di Supabase Dashboard
2. Verify `tenant_id` di tabel `profiles`
3. Test dengan 2 user dari tenant berbeda
4. Review SQL files di `database/setup/`

**File Referensi**:
- `database/setup/02_events_setup.sql` - Contoh RLS implementation
- `src/services/eventsService.ts` - Service layer dengan RLS
- `src/contexts/AuthContext.tsx` - User authentication
