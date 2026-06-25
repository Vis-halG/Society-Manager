import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ManageSocietiesScreen } from '../screens/superadmin/ManageSocietiesScreen';
import { SocietyFormScreen } from '../screens/superadmin/SocietyFormScreen';
import { ManageAdminsScreen } from '../screens/superadmin/ManageAdminsScreen';
import type { SuperAdminStackParamList } from './types';

const Stack = createNativeStackNavigator<SuperAdminStackParamList>();

export function SuperAdminNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManageSocieties" component={ManageSocietiesScreen} options={{ title: 'Societies' }} />
      <Stack.Screen name="SocietyForm" component={SocietyFormScreen} options={{ title: 'New Society' }} />
      <Stack.Screen
        name="ManageAdmins"
        component={ManageAdminsScreen}
        options={({ route }) => ({ title: route.params.societyName })}
      />
    </Stack.Navigator>
  );
}
