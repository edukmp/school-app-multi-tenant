# Style Cleanup Instructions

## Issue
Ada konflik antara style sidebar lama di `global.scss` dan style baru di `enhanced-sidebar.scss`.

## Solution
Hapus style sidebar lama (lines 44-101) di `src/styles/global.scss`.

### Lines to Remove:
```scss
&__sidebar {
    width: 80px;
    background: $dark-bg;
    // ... (all sidebar styles)
    // ... (all .sidebar nested styles)
}
```

### Keep Only:
```scss
.app-shell {
    display: flex;
    min-height: 100vh;
    height: 100vh;
    
    &__content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
    }
}
```

## Why:
- Old sidebar used `width: 44px` (circular buttons, no labels)
- New enhanced-sidebar uses `width: 100%` (full width with labels)
- Both targeting `.sidebar__nav-item` causes conflicts
- Enhanced-sidebar.scss now handles all sidebar styling

## Current Status:
✅ `enhanced-sidebar.scss` has correct `width: 100%`  
⚠️ `global.scss` still has old `width: 44px` (should be removed)

## CSS Cascade:
Since `enhanced-sidebar.scss` is imported AFTER `global.scss`, the `width: 100%` should win.
However, removing the old styles is cleaner and prevents confusion.
