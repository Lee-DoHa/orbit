// ---------------------------------------------------------------------------
// ORBIT Theme Tokens — Refined Cosmic Journaling
// ---------------------------------------------------------------------------

const darkColors = {
  background: {
    primary: '#0C0F1A',
    secondary: '#111528',
    tertiary: '#181D33',
  },
  surface: {
    card: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    cardHover: 'rgba(255, 255, 255, 0.09)',
    elevated: 'rgba(22, 26, 48, 0.92)',
  },
  accent: {
    blue: '#6366F1',
    blueSubtle: 'rgba(99, 102, 241, 0.14)',
    violet: '#8B7FFF',
    cyan: '#5CE0D8',
    gold: '#E8B951',
    goldSubtle: 'rgba(232, 185, 81, 0.12)',
  },
  glow: {
    indigo: 'rgba(99, 102, 241, 0.25)',
    violet: 'rgba(139, 127, 255, 0.20)',
    gold: 'rgba(232, 185, 81, 0.15)',
    cyan: 'rgba(92, 224, 216, 0.18)',
  },
  text: {
    primary: '#EEEEF2',
    secondary: '#9196AB',
    tertiary: '#5E6380',
    inverse: '#1A1A2E',
  },
  divider: 'rgba(255, 255, 255, 0.06)',
  shadow: 'transparent',
} as const;

const lightColors = {
  background: {
    primary: '#F8F7F4',
    secondary: '#F1F0EC',
    tertiary: '#E9E8E3',
  },
  surface: {
    card: '#FFFFFF',
    cardBorder: 'rgba(26, 26, 46, 0.08)',
    cardHover: '#FDFCFA',
    elevated: '#FFFFFF',
  },
  accent: {
    blue: '#4F46E5',
    blueSubtle: 'rgba(79, 70, 229, 0.07)',
    violet: '#7C6BFF',
    cyan: '#14B8A6',
    gold: '#D4A030',
    goldSubtle: 'rgba(212, 160, 48, 0.08)',
  },
  glow: {
    indigo: 'rgba(79, 70, 229, 0.10)',
    violet: 'rgba(124, 107, 255, 0.08)',
    gold: 'rgba(212, 160, 48, 0.06)',
    cyan: 'rgba(20, 184, 166, 0.08)',
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#5C5C72',
    tertiary: '#9191A8',
    inverse: '#EEEEF2',
  },
  divider: 'rgba(26, 26, 46, 0.08)',
  shadow: 'rgba(26, 26, 46, 0.08)',
} as const;

// Shared tokens that don't change between themes
const sharedColors = {
  emotion: {
    긴장: '#F6AD49',
    불안: '#F06060',
    피로: '#7E8A98',
    안정: '#4DD9CF',
    설렘: '#F48BA6',
    무기력: '#6E7582',
    집중: '#5B8DEF',
    만족: '#6DDC8C',
    외로움: '#A78BFA',
    혼란: '#EFA020',
  },
  intensity: {
    1: '#4DD9CF',
    2: '#6DDC8C',
    3: '#F5C842',
    4: '#F5A142',
    5: '#F06060',
  },
  status: {
    success: '#6DDC8C',
    warning: '#F5C842',
    error: '#F06060',
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

export const letterSpacing = {
  tight: -0.4,
  normal: 0,
  wide: 0.6,
  wider: 1.2,
  widest: 2.0,
} as const;

export const shadow = {
  light: {
    sm: {
      shadowColor: 'rgba(26, 26, 46, 0.06)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 1,
    },
    md: {
      shadowColor: 'rgba(26, 26, 46, 0.08)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: 'rgba(26, 26, 46, 0.10)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 6,
    },
  },
  dark: {
    sm: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    md: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    lg: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
} as const;

export const animation = {
  duration: {
    fast: 120,
    normal: 220,
    slow: 360,
    spring: 500,
  },
  easing: {
    default: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;
