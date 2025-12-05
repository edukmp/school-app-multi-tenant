/**
 * Color Theming Utility
 * Generates a comprehensive color palette from primary and secondary colors
 */

interface RGB {
    r: number
    g: number
    b: number
}

interface HSL {
    h: number
    s: number
    l: number
}

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        }
        : null
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }).join('')
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q

        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

/**
 * Calculate relative luminance (for contrast calculation)
 */
function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c /= 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(rgb1: RGB, rgb2: RGB): number {
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Generate tint (lighter version)
 */
function generateTint(hex: string, amount: number = 30): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hsl.l = Math.min(100, hsl.l + amount)

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Generate shade (darker version)
 */
function generateShade(hex: string, amount: number = 30): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hsl.l = Math.max(0, hsl.l - amount)

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Generate complementary color (opposite on color wheel)
 */
function generateComplement(hex: string): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    hsl.h = (hsl.h + 180) % 360

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
function generateAnalogous(hex: string): { color1: string; color2: string } {
    const rgb = hexToRgb(hex)
    if (!rgb) return { color1: hex, color2: hex }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    const hsl1 = { ...hsl, h: (hsl.h + 30) % 360 }
    const hsl2 = { ...hsl, h: (hsl.h - 30 + 360) % 360 }

    const rgb1 = hslToRgb(hsl1.h, hsl1.s, hsl1.l)
    const rgb2 = hslToRgb(hsl2.h, hsl2.s, hsl2.l)

    return {
        color1: rgbToHex(rgb1.r, rgb1.g, rgb1.b),
        color2: rgbToHex(rgb2.r, rgb2.g, rgb2.b)
    }
}

/**
 * Get contrast color (black or white) for text on a given background
 */
function getContrastColor(hex: string): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return '#ffffff'

    const white = { r: 255, g: 255, b: 255 }
    const black = { r: 0, g: 0, b: 0 }

    const whiteContrast = getContrastRatio(rgb, white)
    const blackContrast = getContrastRatio(rgb, black)

    return whiteContrast > blackContrast ? '#ffffff' : '#000000'
}

/**
 * Generate complete theme palette
 */
export interface ThemePalette {
    // Base colors
    primary: string
    primaryLight: string
    primaryDark: string
    secondary: string
    secondaryLight: string
    secondaryDark: string

    // Status colors
    success: string
    successLight: string
    danger: string
    dangerLight: string
    warning: string
    warningLight: string
    info: string
    infoLight: string

    // Neutral colors
    light: string
    dark: string
    muted: string

    // Derived colors
    complement: string
    analogous1: string
    analogous2: string
    tint: string
    shade: string

    // Contrast colors
    primaryContrast: string
    secondaryContrast: string

    // Inverse (swap primary and secondary)
    inverse: string
}

export function generateThemePalette(primaryColor: string, secondaryColor: string): ThemePalette {
    // Generate analogous colors
    const primaryAnalogous = generateAnalogous(primaryColor)

    return {
        // Base colors
        primary: primaryColor,
        primaryLight: generateTint(primaryColor, 25),
        primaryDark: generateShade(primaryColor, 15),
        secondary: secondaryColor,
        secondaryLight: generateTint(secondaryColor, 25),
        secondaryDark: generateShade(secondaryColor, 15),

        // Status colors (semantic)
        success: '#10b981', // Green
        successLight: '#d1fae5',
        danger: '#ef4444', // Red
        dangerLight: '#fee2e2',
        warning: '#f59e0b', // Orange/Yellow
        warningLight: '#fef3c7',
        info: '#3b82f6', // Blue
        infoLight: '#dbeafe',

        // Neutral colors
        light: '#f8fafc',
        dark: '#1e293b',
        muted: '#64748b',

        // Derived colors
        complement: generateComplement(primaryColor),
        analogous1: primaryAnalogous.color1,
        analogous2: primaryAnalogous.color2,
        tint: generateTint(primaryColor, 40),
        shade: generateShade(primaryColor, 25),

        // Contrast colors
        primaryContrast: getContrastColor(primaryColor),
        secondaryContrast: getContrastColor(secondaryColor),

        // Inverse
        inverse: secondaryColor
    }
}

/**
 * Apply theme palette to CSS variables via <style> tag in <head>
 * This avoids cluttering the <html> tag with inline styles
 */
export function applyThemePalette(palette: ThemePalette, logo?: string): void {
    // Find or create our dedicated style tag
    const styleId = 'tenant-theme-variables'
    let styleTag = document.getElementById(styleId) as HTMLStyleElement

    if (!styleTag) {
        styleTag = document.createElement('style')
        styleTag.id = styleId
        styleTag.type = 'text/css'
        document.head.appendChild(styleTag)
    }

    // Build CSS content
    const cssVariables = `
:root {
  /* Base Colors */
  --primary-color: ${palette.primary};
  --primary-light: ${palette.primaryLight};
  --primary-dark: ${palette.primaryDark};
  --secondary-color: ${palette.secondary};
  --secondary-light: ${palette.secondaryLight};
  --secondary-dark: ${palette.secondaryDark};
  
  /* Status Colors */
  --success-color: ${palette.success};
  --success-light: ${palette.successLight};
  --danger-color: ${palette.danger};
  --danger-light: ${palette.dangerLight};
  --warning-color: ${palette.warning};
  --warning-light: ${palette.warningLight};
  --info-color: ${palette.info};
  --info-light: ${palette.infoLight};
  
  /* Neutral Colors */
  --color-light: ${palette.light};
  --color-dark: ${palette.dark};
  --color-muted: ${palette.muted};
  
  /* Derived Colors */
  --complement-color: ${palette.complement};
  --analogous-color-1: ${palette.analogous1};
  --analogous-color-2: ${palette.analogous2};
  --tint-color: ${palette.tint};
  --shade-color: ${palette.shade};
  
  /* Contrast Colors */
  --primary-contrast: ${palette.primaryContrast};
  --secondary-contrast: ${palette.secondaryContrast};
  
  /* Inverse */
  --inverse-color: ${palette.inverse};
  
  /* Legacy Support (camelCase) */
  --primaryColor: ${palette.primary};
  --secondaryColor: ${palette.secondary};
  ${logo ? `\n  /* Logo */\n  --tenant-logo: url(${logo});` : ''}
}
    `.trim()

    // Set the style content
    styleTag.textContent = cssVariables
}

