import React from 'react';
import type { DrawerNavigationOptions } from '@react-navigation/drawer';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import { useAppTheme } from '../context/ThemeContext';

export function useGlassStackOptions(showLogout = true): NativeStackNavigationOptions {
  const { colors } = useAppTheme();

  return {
    headerRight: showLogout ? () => <LogoutHeaderButton /> : undefined,
    headerStyle: { backgroundColor: colors.surfaceGlass },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.background },
  };
}

export function useGlassDrawerOptions(): DrawerNavigationOptions {
  const { colors } = useAppTheme();

  return {
    headerRight: () => <LogoutHeaderButton />,
    drawerActiveTintColor: colors.primary,
    drawerInactiveTintColor: colors.textMuted,
    drawerActiveBackgroundColor: `${colors.primary}18`,
    drawerStyle: {
      backgroundColor: colors.surfaceStrong,
      borderRightColor: colors.borderStrong,
      width: 304,
    },
    drawerLabelStyle: { fontWeight: '600' },
    overlayColor: colors.overlay,
    sceneStyle: { backgroundColor: colors.background },
    headerStyle: { backgroundColor: colors.surfaceGlass },
    headerTintColor: colors.text,
    headerTitleStyle: { fontWeight: '700' },
    headerShadowVisible: false,
  };
}
