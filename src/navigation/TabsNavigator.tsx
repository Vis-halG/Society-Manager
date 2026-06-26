import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { NoticesNavigator } from './NoticesNavigator';
import { ComplaintsNavigator } from './ComplaintsNavigator';
import { ChatNavigator } from './ChatNavigator';
import { MoreNavigator } from './MoreNavigator';
import { useGlassTabOptions } from './options';
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
  const tabOptions = useGlassTabOptions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={ICONS[route.name as keyof TabsParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Notices" component={NoticesNavigator} />
      <Tab.Screen name="Complaints" component={ComplaintsNavigator} />
      <Tab.Screen name="Chat" component={ChatNavigator} />
      <Tab.Screen name="More" component={MoreNavigator} options={{ title: 'Menu' }} />
    </Tab.Navigator>
  );
}
