# Logout Button Fix - Troubleshooting

## Issue
Logout button tidak berfungsi ketika diklik.

## Root Cause Analysis
Kemungkinan masalah:
1. Event handler tidak ter-attach dengan benar
2. `logout()` function dari AuthContext error
3. Browser console menunjukkan error

## Solution Applied

### 1. Created Separate Handler Function
```tsx
const handleLogout = async () => {
  console.log('Logout handler called')
  try {
    await logout()
    console.log('Logout completed successfully')
    closeSidebarOnMobile()
    window.location.href = '/'
  } catch (error) {
    console.error('Error during logout:', error)
    alert('Logout failed. Please try again.')
  }
}
```

### 2. Simplified Button onClick
```tsx
<button
  className="sidebar__nav-item sidebar__nav-item--bottom"
  onClick={handleLogout}  // Simple reference, not inline function
  aria-label="Logout"
>
```

## Debugging Steps

### Check Browser Console
Open browser DevTools (F12) dan cek console saat klik Logout:

**Expected output:**
```
Logout handler called
Logout completed successfully
```

**If error occurs:**
```
Error during logout: [error message]
```

### Check Network Tab
- Pastikan ada request ke logout endpoint
- Status harus 200 OK

### Verify AuthContext
Check if `logout` function exists:
```tsx
const { logout } = useAuth()
console.log('logout function:', logout) // Should not be undefined
```

## Testing

1. **Click Logout Button**
   - Button harus clickable (cursor: pointer)
   - Console log harus muncul
   
2. **Check Redirect**
   - Setelah logout, harus redirect ke `/`
   - Page harus reload completely
   
3. **Verify Session Cleared**
   - User state harus null
   - LocalStorage/SessionStorage harus cleared

## Alternative Solutions

### Option 1: Force Reload Without Logout
```tsx
onClick={() => {
  window.location.href = '/'
}}
```

### Option 2: Use navigate Instead
```tsx
onClick={async () => {
  await logout()
  navigate('/', { replace: true })
}}
```

### Option 3: Simple Anchor Link
```tsx
<a href="/" onClick={(e) => {
  e.preventDefault()
  logout().then(() => {
    window.location.href = '/'
  })
}}>
  Logout
</a>
```

## Current Implementation Status

✅ Handler function created
✅ Console logging added
✅ Error handling added
✅ Alert on failure
✅ Force redirect with window.location.href

## Next Steps if Still Not Working

1. Check browser console untuk error messages
2. Verify `useAuth()` hook returns valid `logout` function
3. Test dengan simple `console.log` di button onClick
4. Check CSS jika ada `pointer-events: none`
5. Verify button tidak disabled

## Files Modified
- `src/components/layout/MainLayout.tsx`

## Testing Checklist
- [ ] Button clickable
- [ ] Console shows "Logout handler called"
- [ ] Console shows "Logout completed successfully"
- [ ] Page redirects to `/`
- [ ] User session cleared
- [ ] No errors in console
