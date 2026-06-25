import React, { createContext, useContext, useMemo } from 'react';
import {
  paperLightTheme,
  navLightTheme,
  lightColors,
  type AppColors,
} from '../theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppColors;
  paperTheme: typeof paperLightTheme;
  navTheme: typeof navLightTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<ThemeContextValue>(
    () => ({
      mode: 'light',
      isDark: false,
      colors: lightColors,
      paperTheme: paperLightTheme,
      navTheme: navLightTheme,
      setMode: () => undefined,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}
