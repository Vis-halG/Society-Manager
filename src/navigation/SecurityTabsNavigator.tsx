import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VisitorsNavigator } from './VisitorsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { useGlassTabOptions } from './options';
import type { SecurityTabsParamList } from './types';

const Tab = createBottomTabNavigator<SecurityTabsParamList>();

const ICONS: Record<keyof SecurityTabsParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Visitors: 'qrcode-scan',
  ProfileStack: 'account-circle-outline',
};

export function SecurityTabsNavigator() {
  const tabOptions = useGlassTabOptions();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabOptions,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={ICONS[route.name as keyof SecurityTabsParamList]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen name="Visitors" component={VisitorsNavigator} options={{ title: 'Visitor Gate' }} />
      <Tab.Screen name="ProfileStack" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
