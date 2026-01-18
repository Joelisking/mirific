/**
 * Mirific App Theme
 * Design: Soft/Organic with warm sage greens and beige undertones
 */

import { Platform } from 'react-native';

// Mirific Brand Colors (Soft Organic Theme)
export const theme = {
  colors: {
    // Backgrounds & Surfaces (Warm Beige Undertone)
    background: '#F5F0E8', // Warm beige
    surface: '#FAF6F0', // Light beige
    surfaceElevated: '#FFFCF7', // Cream white
    surfaceHighlight: '#EDE6DB', // Sandy beige

    // Primary & Accent
    primary: '#5B8A72', // Soft Sage
    primaryDark: '#426B59', // Deep Sage
    primaryLight: '#D4E7DC', // Light Sage
    accent: '#C4956A', // Warm Terracotta

    // Text colors (Warm tones)
    textPrimary: '#2D3128', // Warm dark
    textSecondary: '#7A7B6E', // Warm gray
    textTertiary: '#A8A99A', // Light warm gray
    textInverse: '#FFFCF7',

    // Status colors (Softer)
    success: '#6B9B7A', // Muted sage
    warning: '#E8A756', // Soft amber
    error: '#D97373', // Soft coral
    info: '#5B8A72', // Sage (same as primary)
    onTrack: '#6B9B7A', // Muted sage
    atRisk: '#D97373', // Soft coral

    // UI elements
    border: '#E0D9CF', // Warm beige border
    divider: '#EDE6DB', // Sandy beige
    overlay: 'rgba(45, 49, 40, 0.4)', // Warm dark overlay

    // Legacy support
    light: {
      text: '#2D3128',
      background: '#F5F0E8',
      tint: '#5B8A72',
      icon: '#7A7B6E',
      tabIconDefault: '#A8A99A',
      tabIconSelected: '#5B8A72',
    },
    dark: {
      text: '#2D3128',
      background: '#F5F0E8',
      tint: '#5B8A72',
      icon: '#7A7B6E',
      tabIconDefault: '#A8A99A',
      tabIconSelected: '#5B8A72',
    },
  },

  // Gradients for visual interest
  gradients: {
    warmBeige: ['#F5F0E8', '#FAF6F0'], // Screen backgrounds
    sage: ['#5B8A72', '#426B59'], // Buttons/CTAs
    success: ['#6B9B7A', '#5B8A72'], // Completions
    sunsetAccent: ['#E8A756', '#C4956A'], // Highlights/Streaks
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Softer corners
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 34,
      fontWeight: '700' as const,
      lineHeight: 40,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 22,
      fontWeight: '600' as const,
      lineHeight: 28,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
      letterSpacing: -0.4,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 0.2,
      fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
    },
  },

  // Warm-tinted shadows (sage-based)
  shadows: {
    small: {
      shadowColor: '#5B8A72',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#5B8A72',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    large: {
      shadowColor: '#5B8A72',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
      elevation: 8,
    },
    // Special glow effect for streaks
    streakGlow: {
      shadowColor: '#E8A756',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Legacy export for compatibility
export const Colors = theme.colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'System',
    rounded: 'System',
    mono: 'Courier New',
  },
  default: {
    sans: 'sans-serif',
    serif: 'sans-serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, -apple-system, sans-serif',
    serif: 'system-ui, -apple-system, sans-serif',
    rounded: 'system-ui, -apple-system, sans-serif',
    mono: 'monospace',
  },
});
