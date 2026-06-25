import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabsNavigator } from './TabsNavigator';
import { VisitorsNavigator } from './VisitorsNavigator';
import { MaintenanceNavigator } from './MaintenanceNavigator';
import { ParkingNavigator } from './ParkingNavigator';
import { PollsNavigator } from './PollsNavigator';
import { EventsNavigator } from './EventsNavigator';
import { DocumentsNavigator } from './DocumentsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { EmergencyContactsScreen } from '../screens/emergency/EmergencyContactsScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ResidentApprovalsScreen } from '../screens/admin/ResidentApprovalsScreen';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { CustomDrawerContent } from './CustomDrawerContent';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import type { RootDrawerParamList } from './types';

const Drawer = createDrawerNavigator<RootDrawerParamList>();

function drawerIcon(name: keyof typeof MaterialCommunityIcons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
  );
}

export function MainDrawerNavigator() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const isAdmin = user?.role === 'admin';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textMuted,
      }}
    >
      <Drawer.Screen
        name="Tabs"
        component={TabsNavigator}
        options={{ title: 'Home', drawerIcon: drawerIcon('home-outline') }}
      />
      <Drawer.Screen
        name="Maintenance"
        component={MaintenanceNavigator}
        options={{ title: 'Maintenance', drawerIcon: drawerIcon('cash-multiple') }}
      />
      <Drawer.Screen
        name="Visitors"
        component={VisitorsNavigator}
        options={{ title: 'Visitors', drawerIcon: drawerIcon('account-question-outline') }}
      />
      <Drawer.Screen
        name="Parking"
        component={ParkingNavigator}
        options={{ title: 'Parking', drawerIcon: drawerIcon('car') }}
      />
      <Drawer.Screen
        name="Polls"
        component={PollsNavigator}
        options={{ title: 'Polls', drawerIcon: drawerIcon('poll') }}
      />
      <Drawer.Screen
        name="Events"
        component={EventsNavigator}
        options={{ title: 'Events', drawerIcon: drawerIcon('calendar-star') }}
      />
      <Drawer.Screen
        name="Documents"
        component={DocumentsNavigator}
        options={{ title: 'Documents', drawerIcon: drawerIcon('folder-outline') }}
      />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications', drawerIcon: drawerIcon('bell-outline'), headerShown: true }}
      />
      <Drawer.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Emergency Contacts', drawerIcon: drawerIcon('phone-alert-outline'), headerShown: true }}
      />
      {isAdmin ? (
        <Drawer.Screen
          name="ResidentApprovals"
          component={ResidentApprovalsScreen}
          options={{ title: 'Resident Approvals', drawerIcon: drawerIcon('account-check-outline'), headerShown: true }}
        />
      ) : null}
      {isAdmin ? (
        <Drawer.Screen
          name="Reports"
          component={ReportsScreen}
          options={{ title: 'Reports & Analytics', drawerIcon: drawerIcon('chart-bar'), headerShown: true }}
        />
      ) : null}
      <Drawer.Screen
        name="ProfileStack"
        component={ProfileNavigator}
        options={{ title: 'Profile', drawerIcon: drawerIcon('account-circle-outline') }}
      />
    </Drawer.Navigator>
  );
}
