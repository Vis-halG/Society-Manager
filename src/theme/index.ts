import {
  MD3LightTheme,
  MD3DarkTheme,
  type MD3Theme,
} from 'react-native-paper';
import {
  DefaultTheme as NavLightTheme,
  DarkTheme as NavDarkTheme,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { lightColors, darkColors } from './colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 8,
  lg: 8,
  full: 999,
};

function createPaperTheme(baseTheme: MD3Theme, colors: AppColors, isDark: boolean): MD3Theme {
  return {
    ...baseTheme,
    roundness: 8,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      onPrimary: isDark ? colors.background : '#FFFFFF',
      primaryContainer: `${colors.primary}1F`,
      onPrimaryContainer: colors.primaryDark,
      secondary: colors.secondary,
      secondaryContainer: `${colors.secondary}1F`,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceGlass,
      surfaceDisabled: `${colors.textMuted}1F`,
      onSurface: colors.text,
      onSurfaceVariant: colors.textMuted,
      outline: colors.border,
      outlineVariant: colors.borderStrong,
      error: colors.danger,
      onError: '#FFFFFF',
      errorContainer: `${colors.danger}18`,
      backdrop: colors.overlay,
      elevation: {
        ...baseTheme.colors.elevation,
        level0: 'transparent',
        level1: colors.surfaceSoft,
        level2: colors.surfaceGlass,
        level3: colors.surface,
        level4: colors.surfaceStrong,
        level5: colors.elevated,
      },
    },
  };
}

export const paperLightTheme: MD3Theme = createPaperTheme(MD3LightTheme, lightColors, false);

export const paperDarkTheme: MD3Theme = createPaperTheme(MD3DarkTheme, darkColors, true);

export const navLightTheme: NavTheme = {
  ...NavLightTheme,
  colors: {
    ...NavLightTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surfaceGlass,
    text: lightColors.text,
    border: lightColors.border,
    notification: lightColors.notification,
  },
};

export const navDarkTheme: NavTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surfaceGlass,
    text: darkColors.text,
    border: darkColors.border,
    notification: darkColors.notification,
  },
};

export { lightColors, darkColors };
export type AppColors = typeof lightColors;
