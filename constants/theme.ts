/**
 * Mirific App Theme
 * Design inspired by UI mockups with dark theme and warm accent colors
 */

import { Platform } from 'react-native';

// Mirific Brand Colors (Minimalist Indigo)
export const theme = {
  colors: {
    // Primary theme (Crisp White & Electric Indigo)
    background: '#FFFFFF', // Pure White
    surface: '#F9FAFB', // Cool Gray 50 (Very subtle contrast)
    surfaceElevated: '#FFFFFF',
    surfaceHighlight: '#F3F4F6', // Cool Gray 100

    // Accents
    primary: '#4F46E5', // Electric Indigo
    primaryDark: '#3730A3', // Deep Indigo
    primaryLight: '#C7D2FE', // Soft Indigo
    accent: '#10B981', // Emerald Green (Digital success color)

    // Text colors
    textPrimary: '#111827', // Gray 900 (Almost Black)
    textSecondary: '#6B7280', // Gray 500
    textTertiary: '#9CA3AF', // Gray 400
    textInverse: '#FFFFFF',

    // Status colors
    success: '#10B981', // Emerald
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red 500
    info: '#4F46E5', // Indigo
    onTrack: '#10B981',
    atRisk: '#EF4444',

    // UI elements
    border: '#E5E7EB', // Gray 200
    divider: '#F3F4F6',
    overlay: 'rgba(17, 24, 39, 0.4)', // Darker overlay

    // Legacy support
    light: {
      text: '#111827',
      background: '#FFFFFF',
      tint: '#4F46E5',
      icon: '#6B7280',
      tabIconDefault: '#9CA3AF',
      tabIconSelected: '#4F46E5',
    },
    dark: {
      text: '#111827',
      background: '#FFFFFF',
      tint: '#4F46E5',
      icon: '#6B7280',
      tabIconDefault: '#9CA3AF',
      tabIconSelected: '#4F46E5',
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16, // Sharper corners for modern feel
    xxl: 24,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 34, // iOS Title 1 size
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

  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
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
