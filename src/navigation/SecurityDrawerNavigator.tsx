import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VisitorsNavigator } from './VisitorsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { CustomDrawerContent } from './CustomDrawerContent';
import { useGlassDrawerOptions } from './options';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<Pick<RootDrawerParamList, 'Visitors' | 'ProfileStack'>>();

function drawerIcon(name: keyof typeof MaterialCommunityIcons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );
}

export function SecurityDrawerNavigator() {
  const drawerOptions = useGlassDrawerOptions();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ ...drawerOptions, headerShown: true }}
    >
      <Drawer.Screen
        name="Visitors"
        component={VisitorsNavigator}
        options={{ title: 'Visitor Gate', headerShown: false, drawerIcon: drawerIcon('qrcode-scan') }}
      />
      <Drawer.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{ title: 'Profile', headerShown: false, drawerIcon: drawerIcon('account-circle-outline') }}
      />
    </Drawer.Navigator>
  );
}
