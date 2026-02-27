export const colors = {
  background: {
    primary: '#0A0E1A',
    secondary: '#141B2D',
    tertiary: '#1A2235',
  },
  surface: {
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassHover: 'rgba(255, 255, 255, 0.1)',
    card: 'rgba(20, 27, 45, 0.8)',
  },
  accent: {
    blue: '#4A9EFF',
    violet: '#8B7FFF',
    cyan: '#5CE0D8',
    blueGlow: 'rgba(74, 158, 255, 0.15)',
    violetGlow: 'rgba(139, 127, 255, 0.15)',
  },
  text: {
    primary: '#F0F0F5',
    secondary: '#8E8EA0',
    tertiary: '#5A5A6E',
    inverse: '#0A0E1A',
  },
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
