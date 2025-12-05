# Color Theming System Documentation

## Overview
Sistem theming color yang komprehensif dengan automatic palette generation dari primary dan secondary colors tenant.

## Available CSS Variables

### Base Colors
```css
--primary-color          /* Primary brand color */
--primary-light          /* Lighter variant (+25% lightness) */
--primary-dark           /* Darker variant (-15% lightness) */
--secondary-color        /* Secondary brand color */
--secondary-light        /* Lighter variant */
--secondary-dark         /* Darker variant */
```

### Status Colors (Semantic)
```css
--success-color          /* #10b981 (Green) */
--success-light          /* #d1fae5 (Light green background) */
--danger-color           /* #ef4444 (Red) */
--danger-light           /* #fee2e2 (Light red background) */
--warning-color          /* #f59e0b (Orange/Yellow) */
--warning-light          /* #fef3c7 (Light warning background) */
--info-color             /* #3b82f6 (Blue) */
--info-light             /* #dbeafe (Light blue background) */
```

### Neutral Colors
```css
--color-light            /* #f8fafc (Background light) */
--color-dark             /* #1e293b (Text dark) */
--color-muted            /* #64748b (Muted text) */
```

### Derived Colors (Auto-generated)
```css
--complement-color       /* Complementary color (180° on color wheel) */
--analogous-color-1      /* Analogous color (+30° on color wheel) */
--analogous-color-2      /* Analogous color (-30° on color wheel) */
--tint-color             /* Very light tint (+40% lightness) */
--shade-color            /* Deep shade (-25% lightness) */
```

### Contrast Colors (Auto-calculated)
```css
--primary-contrast       /* Black or White (optimized for readability on primary) */
--secondary-contrast     /* Black or White (optimized for readability on secondary) */
```

### Inverse & Legacy Support
```css
--inverse-color          /* Swap (secondary becomes primary) */
--primaryColor           /* Legacy camelCase */
--secondaryColor         /* Legacy camelCase */
```

## Usage Examples

### In SCSS/CSS
```scss
.button-primary {
  background: var(--primary-color);
  color: var(--primary-contrast); // Automatically white or black
  
  &:hover {
    background: var(--primary-dark);
  }
}

.alert-success {
  background: var(--success-light);
  color: var(--success-color);
  border-left: 4px solid var(--success-color);
}

.card-gradient {
  background: linear-gradient(135deg, 
    var(--primary-color) 0%, 
    var(--secondary-color) 100%
  );
}
```

### In React/TypeScript
```tsx
import { generateThemePalette, applyThemePalette } from '../utils/colorTheming'

// Generate palette
const palette = generateThemePalette('#00778f', '#ffc800')

// Apply to DOM
applyThemePalette(palette)

// Or use CSS variables directly
<div style={{ 
  background: 'var(--primary-color)',
  color: 'var(--primary-contrast)' 
}}>
  Content
</div>
```

## Color Theory Applied

### 1. **Complementary Colors**
- Opposite on color wheel (180°)
- Creates maximum contrast
- Use for: CTAs, highlights

### 2. **Analogous Colors**
- Adjacent colors (±30°)
- Harmonious, visually pleasing
- Use for: Illustrations, backgrounds

### 3. **Tints & Shades**
- Tint: Add white (increase lightness)
- Shade: Add black (decrease lightness)
- Use for: Hover states, disabled states

### 4. **Contrast Calculation**
- Uses WCAG (Web Content Accessibility Guidelines)
- Calculates relative luminance
- Auto-selects white or black text
- Ensures minimum 4.5:1 contrast ratio

## Best Practices

### 1. **Use Semantic Colors**
```scss
// ✅ Good - semantic meaning
.error-message {
  color: var(--danger-color);
}

// ❌ Avoid - hardcoded
.error-message {
  color: #ef4444;
}
```

### 2. **Use Contrast Colors for Text**
```scss
// ✅ Good - automatic contrast
.badge {
  background: var(--primary-color);
  color: var(--primary-contrast);
}

// ❌ Avoid - might have low contrast
.badge {
  background: var(--primary-color);
  color: white;
}
```

### 3. **Leverage Derived Colors**
```scss
// ✅ Good - uses analogous for harmony
.illustration {
  color: var(--primary-color);
  accent-color: var(--analogous-color-1);
}

// Use tints for backgrounds
.card {
  background: var(--tint-color);
  border: 1px solid var(--primary-light);
}
```

## Algorithm Details

### Color Conversion Pipeline
```
HEX → RGB → HSL → [Manipulation] → RGB → HEX
```

### Tint Generation
```typescript
// Increases lightness by specified amount
lightness = min(100, currentLightness + amount)
```

### Shade Generation
```typescript
// Decreases lightness by specified amount
lightness = max(0, currentLightness - amount)
```

### Complement Calculation
```typescript
// Rotate hue by 180 degrees
hue = (currentHue + 180) % 360
```

### Contrast Ratio Formula (WCAG)
```typescript
L1 = relativeLuminance(color1)
L2 = relativeLuminance(color2)
contrast = (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
// Ratio ≥ 4.5 = AA (normal text)
// Ratio ≥ 7.0 = AAA (enhanced)
```

## Integration with Tenant Context

When tenant data loads, the system:
1. Extracts `primaryColor` and `secondaryColor`
2. Generates comprehensive 20+ color palette
3. Applies all colors as CSS variables
4. Automatically calculates contrast for accessibility

## Migration Guide

### From Hardcoded Colors
```scss
// Before
.button {
  background: #667eea;
  color: white;
}

// After
.button {
  background: var(--primary-color);
  color: var(--primary-contrast); // Auto-calculated
}
```

### From Limited Palette
```scss
// Before (only 2 colors)
:root {
  --primary: #00778f;
  --secondary: #ffc800;
}

// After (20+ colors auto-generated)
// All colors available after tenant loads
```

## Performance

- Colors calculated once on tenant load
- All values cached as CSS variables
- Zero runtime recalculation
- Minimal bundle size (~4KB gzipped)

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Custom Properties required
- Fallback: Default colors in SCSS

## Future Enhancements

- [ ] Dark mode support (auto-inverse)
- [ ] Gradient generation
- [ ] Color blindness simulation
- [ ] Material Design 3 token export
- [ ] Tailwind config export
