/**
 * Mirific App Theme
 * Design inspired by UI mockups with dark theme and warm accent colors
 */

import { Platform } from 'react-native';

// Mirific Brand Colors (Dark Theme with Warm Accents)
export const theme = {
  colors: {
    // Primary dark theme
    background: '#0F0F0F',
    surface: '#1A1A1A',
    surfaceElevated: '#242424',
    surfaceHighlight: '#2A2A2A',

    // Warm accent colors
    primary: '#D4B896',
    primaryDark: '#B89968',
    primaryLight: '#E8D4B8',
    accent: '#FFD700',

    // Text colors
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textTertiary: '#666666',
    textInverse: '#0F0F0F',

    // Status colors
    success: '#4CAF50',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
    onTrack: '#4CAF50',
    atRisk: '#FFA726',

    // UI elements
    border: '#2A2A2A',
    divider: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Legacy support
    light: {
      text: '#11181C',
      background: '#fff',
      tint: '#D4B896',
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: '#D4B896',
    },
    dark: {
      text: '#FFFFFF',
      background: '#0F0F0F',
      tint: '#D4B896',
      icon: '#A0A0A0',
      tabIconDefault: '#666666',
      tabIconSelected: '#D4B896',
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
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },

  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

// Legacy export for compatibility
export const Colors = theme.colors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
