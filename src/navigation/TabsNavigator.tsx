import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
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
