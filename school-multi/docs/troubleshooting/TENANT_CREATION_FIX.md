# FIXED: Tenant Creation & Profile Management

## ✅ ROOT CAUSE IDENTIFIED

**Problem:** Admin tenant tidak otomatis punya profile di table `profiles` setelah tenant creation, menyebabkan RLS policy gagal.

## 🔧 FIXES APPLIED

### 1. **TenantOnboarding.tsx** (CRITICAL FIX)
**Before:**
```typescript
// ❌ BAD: Assume profile already exists
.update({
    tenant_id: savedTenant.id,
    role: 'admin'
})
.eq('id', user.id)
```

**After:**
```typescript
// ✅ GOOD: Create profile if not exists
.upsert({
    id: user.id,
    email: user.email,
    tenant_id: savedTenant.id,
    role: 'admin',
    is_profile_completed: true
}, {
    onConflict: 'id'
})
```

**Impact:** Setiap kali admin complete onboarding, profile akan **auto-created** atau **updated** dengan tenant_id yang benar.

---

### 2. **TenantSetup.tsx** (Improvement)
**Added:**
- `is_profile_completed: false` untuk consistency
- Error handling yang lebih strict (throw error instead of warning)

**Impact:** Super admin creation dari `/tenant/setup` akan create profile dengan flag yang jelas untuk onboarding completion.

---

## 📊 FLOW COMPARISON

### **Before (BROKEN):**
```
Super Admin creates Tenant
   ↓
Admin user created in auth.users
   ↓
❌ Profile NOT created in profiles table
   ↓
Admin logs in & does onboarding
   ↓
TenantOnboarding tries to UPDATE profile
   ↓
❌ UPDATE fails (profile doesn't exist!)
   ↓
Admin can access dashboard but...
   ↓
❌ RLS checks fail (no profile = no tenant_id)
   ↓
❌ Cannot create students!
```

### **After (FIXED):**
```
Super Admin creates Tenant
   ↓
Admin user created in auth.users
   ↓
✅ Profile created with is_profile_completed: false
   ↓
Admin logs in & does onboarding
   ↓
TenantOnboarding UPSERTS profile
   ↓
✅ Profile created/updated with tenant_id + role
   ↓
Admin can access dashboard
   ↓
✅ RLS checks pass (has profile with tenant_id)
   ↓
✅ Can create students successfully!
```

---

## 🧪 TESTING CHECKLIST

### For Existing Users (Manual Fix Required):
- [ ] Run `database/debug/create_profile_manual.sql`
- [ ] Fill in user_id, email, tenant_id from query results
- [ ] Logout & login again
- [ ] Test student creation

### For New Users (Auto-Fixed):
- [ ] Super admin creates new tenant via `/tenant/setup`
- [ ] New admin receives email & logs in
- [ ] Complete onboarding at `/tenant/onboarding`
- [ ] Profile should auto-create with tenant link
- [ ] Test student creation immediately

---

## 📝 ADDITIONAL IMPROVEMENTS NEEDED

### Database Level (TODO):
1. **Create Trigger** to auto-create profile on auth.users INSERT:
```sql
CREATE FUNCTION auto_create_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'parent'))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_profile();
```

### Application Level (TODO):
1. Add profile existence check in AuthLayout/AdminDashboard
2. Redirect to profile completion if missing
3. Show clear error messages if RLS fails

---

## 🎯 IMMEDIATE ACTION ITEMS

### For Current User (You):
1. ✅ **Run manual profile creation** using `create_profile_manual.sql`
2. ✅ **Logout and login** again  
3. ✅ **Test adding student** - should work now!

### For Future Users:
- ✅ **Auto-fixed** by TenantOnboarding.tsx changes
- No manual intervention needed

---

## 📚 RELATED FILES MODIFIED

1. `/src/pages/tenant/TenantOnboarding.tsx` - UPSERT profile logic
2. `/src/pages/tenant/TenantSetup.tsx` - Added is_profile_completed
3. `/database/debug/create_profile_manual.sql` - Manual fix for existing users
4. `/docs/TENANT_CREATION_FIX.md` - This document

---

**Status:** ✅ **FIXED for future users**  
**Action Required:** Manual fix for existing users without profiles

---

Last Updated: 2025-12-06
