import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
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

export function useGlassTabOptions(): BottomTabNavigationOptions {
  const { colors, isDark } = useAppTheme();

  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textMuted,
    sceneStyle: { backgroundColor: colors.background },
    tabBarLabelStyle: { fontWeight: '600' },
    tabBarBackground: () => (
      <BlurView intensity={72} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    ),
    tabBarStyle: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 12,
      height: 64,
      paddingTop: 8,
      paddingBottom: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderTopWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceGlass,
      overflow: 'hidden',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 6,
    },
  };
}
