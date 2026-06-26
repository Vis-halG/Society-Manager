import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { MoreScreen } from '../screens/dashboard/MoreScreen';
import { NoticesNavigator } from './NoticesNavigator';
import { ComplaintsNavigator } from './ComplaintsNavigator';
import { ChatNavigator } from './ChatNavigator';
import { useAppTheme } from '../context/ThemeContext';
import type { TabsParamList } from './types';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICONS: Record<keyof TabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Dashboard: 'view-dashboard-outline',
  Notices: 'bulletin-board',
  Complaints: 'alert-circle-outline',
  Chat: 'chat-outline',
  More: 'dots-horizontal-circle-outline',
};

export function TabsNavigator() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        sceneStyle: { backgroundColor: colors.background },
        tabBarLabelStyle: { fontWeight: '600' },
        tabBarBackground: () => (
          <BlurView
            intensity={72}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
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
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={ICONS[route.name as keyof TabsParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Notices" component={NoticesNavigator} />
      <Tab.Screen name="Complaints" component={ComplaintsNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'Menu' }} />
    </Tab.Navigator>
  );
}
