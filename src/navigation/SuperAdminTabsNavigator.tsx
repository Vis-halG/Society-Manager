import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminNavigator } from './SuperAdminNavigator';
import { ReportsNavigator } from './ReportsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useGlassTabOptions } from './options';
import type { SuperAdminTabsParamList } from './types';

const Tab = createBottomTabNavigator<SuperAdminTabsParamList>();

const ICONS: Record<keyof SuperAdminTabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  ManageSocieties: 'domain',
  Reports: 'chart-bar',
  ProfileStack: 'account-circle-outline',
};

export function SuperAdminTabsNavigator() {
  const tabOptions = useGlassTabOptions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={ICONS[route.name as keyof SuperAdminTabsParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="ManageSocieties" component={SuperAdminNavigator} options={{ title: 'Societies' }} />
      <Tab.Screen name="Reports" component={ReportsNavigator} options={{ title: 'Reports' }} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
