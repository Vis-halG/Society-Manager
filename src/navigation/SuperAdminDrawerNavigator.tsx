import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SuperAdminNavigator } from './SuperAdminNavigator';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { ProfileNavigator } from './ProfileNavigator';
import { CustomDrawerContent } from './CustomDrawerContent';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import { useAppTheme } from '../context/ThemeContext';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<Pick<RootDrawerParamList, 'ManageSocieties' | 'Reports' | 'ProfileStack'>>();

function drawerIcon(name: keyof typeof MaterialCommunityIcons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );
}

export function SuperAdminDrawerNavigator() {
  const { colors } = useAppTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerRight: () => <LogoutHeaderButton />,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
        drawerActiveBackgroundColor: `${colors.primary}14`,
        drawerStyle: {
          backgroundColor: colors.surfaceStrong,
          borderRightColor: colors.border,
          width: 304,
        },
        sceneContainerStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.surfaceGlass },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Drawer.Screen
        name="ManageSocieties"
        component={SuperAdminNavigator}
        options={{ title: 'Societies', headerShown: false, drawerIcon: drawerIcon('domain') }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports & Analytics', drawerIcon: drawerIcon('chart-bar') }}
      />
      <Drawer.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{ title: 'Profile', headerShown: false, drawerIcon: drawerIcon('account-circle-outline') }}
      />
    </Drawer.Navigator>
  );
}
