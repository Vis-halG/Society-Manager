import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreScreen } from '../screens/dashboard/MoreScreen';
import { MaintenanceNavigator } from './MaintenanceNavigator';
import { VisitorsNavigator } from './VisitorsNavigator';
import { ParkingNavigator } from './ParkingNavigator';
import { PollsNavigator } from './PollsNavigator';
import { EventsNavigator } from './EventsNavigator';
import { DocumentsNavigator } from './DocumentsNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { ReportsNavigator } from './ReportsNavigator';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { EmergencyContactsScreen } from '../screens/emergency/EmergencyContactsScreen';
import { ResidentApprovalsScreen } from '../screens/admin/ResidentApprovalsScreen';
import { useAuth } from '../context/AuthContext';
import { useGlassStackOptions } from './options';
import type { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export function MoreNavigator() {
  const screenOptions = useGlassStackOptions();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MoreHome" component={MoreScreen} options={{ title: 'Menu' }} />
      <Stack.Screen name="Maintenance" component={MaintenanceNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Visitors" component={VisitorsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Parking" component={ParkingNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Polls" component={PollsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Events" component={EventsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Documents" component={DocumentsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProfileStack" component={ProfileNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen
        name="EmergencyContacts"
        component={EmergencyContactsScreen}
        options={{ title: 'Emergency Contacts' }}
      />
      {isAdmin ? (
        <Stack.Screen
          name="ResidentApprovals"
          component={ResidentApprovalsScreen}
          options={{ title: 'Resident Approvals' }}
        />
      ) : null}
      {isAdmin ? (
        <Stack.Screen name="Reports" component={ReportsNavigator} options={{ headerShown: false }} />
      ) : null}
    </Stack.Navigator>
  );
}
