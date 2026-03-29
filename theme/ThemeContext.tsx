import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { type MMKV, createMMKV } from 'react-native-mmkv';
import { getColors, type ThemeColors } from './tokens';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'orbit.theme-mode';

let storage: MMKV | null = null;
try {
  storage = createMMKV({ id: 'orbit-theme' });
} catch {
  // MMKV unavailable (e.g. web) — fall back to in-memory only
}

function loadPersistedMode(): ThemeMode {
  try {
    const raw = storage?.getString(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    // ignore
  }
  return 'system';
}

function persistMode(mode: ThemeMode) {
  try {
    storage?.set(STORAGE_KEY, mode);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Zustand store (raw preference, no system resolution)
// ---------------------------------------------------------------------------

export const useThemeStore = create<ThemeState>((set) => ({
  mode: loadPersistedMode(),
  setMode: (mode) => {
    persistMode(mode);
    set({ mode });
  },
}));

// ---------------------------------------------------------------------------
// React Context (resolved theme)
// ---------------------------------------------------------------------------

const ThemeCtx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const { mode, setMode } = useThemeStore();

  const isDark = useMemo(() => {
    if (mode === 'system') return systemScheme !== 'light';
    return mode === 'dark';
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const colors = getColors(isDark);
    return {
      colors,
      isDark,
      mode,
      setTheme: setMode,
      toggleTheme: () => setMode(isDark ? 'light' : 'dark'),
    };
  }, [isDark, mode, setMode]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    // Fallback when used outside provider (e.g. tests) — dark by default
    const colors = getColors(true);
    return {
      colors,
      isDark: true,
      mode: 'dark',
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return ctx;
}
