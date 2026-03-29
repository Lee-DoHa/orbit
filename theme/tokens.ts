// ---------------------------------------------------------------------------
// ORBIT Theme Tokens
// ---------------------------------------------------------------------------

const darkColors = {
  background: {
    primary: '#111318',
    secondary: '#191D27',
    tertiary: '#1F2430',
  },
  surface: {
    card: 'rgba(255, 255, 255, 0.06)',
    cardBorder: 'rgba(255, 255, 255, 0.09)',
    cardHover: 'rgba(255, 255, 255, 0.10)',
    elevated: 'rgba(30, 35, 50, 0.85)',
  },
  accent: {
    blue: '#4A9EFF',
    blueSubtle: 'rgba(74, 158, 255, 0.12)',
    violet: '#8B7FFF',
    cyan: '#5CE0D8',
  },
  text: {
    primary: '#F5F5F7',
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#1F2937',
  },
  divider: 'rgba(255, 255, 255, 0.07)',
  shadow: 'transparent',
} as const;

const lightColors = {
  background: {
    primary: '#FAFBFC',
    secondary: '#F3F4F6',
    tertiary: '#EBEDF0',
  },
  surface: {
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    cardHover: '#F9FAFB',
    elevated: '#FFFFFF',
  },
  accent: {
    blue: '#3B82F6',
    blueSubtle: 'rgba(59, 130, 246, 0.08)',
    violet: '#7C6BFF',
    cyan: '#14B8A6',
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#F5F5F7',
  },
  divider: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.06)',
} as const;

// Shared tokens that don't change between themes
const sharedColors = {
  emotion: {
    긴장: '#FFB84D',
    불안: '#FF6B6B',
    피로: '#7B8794',
    안정: '#5CE0D8',
    설렘: '#FF8FAB',
    무기력: '#6B7280',
    집중: '#4A9EFF',
    만족: '#7FE5A0',
    외로움: '#A78BFA',
    혼란: '#F59E0B',
  },
  intensity: {
    1: '#5CE0D8',
    2: '#7FE5A0',
    3: '#FFD166',
    4: '#FF9F43',
    5: '#FF6B6B',
  },
  status: {
    success: '#7FE5A0',
    warning: '#FFD166',
    error: '#FF6B6B',
  },
} as const;

export type ThemeColors = typeof darkColors & typeof sharedColors;

export function getColors(isDark: boolean): ThemeColors {
  const base = isDark ? darkColors : lightColors;
  return { ...base, ...sharedColors } as ThemeColors;
}

// Legacy export for gradual migration — defaults to dark
export const colors = getColors(true);

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  hero: 36,
} as const;

export const fontWeight = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
