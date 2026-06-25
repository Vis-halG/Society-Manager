import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaintenanceListScreen } from '../screens/maintenance/MaintenanceListScreen';
import { BillDetailScreen } from '../screens/maintenance/BillDetailScreen';
import { BillGenerateScreen } from '../screens/maintenance/BillGenerateScreen';
import { DefaultersScreen } from '../screens/maintenance/DefaultersScreen';
import type { MaintenanceStackParamList } from './types';

const Stack = createNativeStackNavigator<MaintenanceStackParamList>();

export function MaintenanceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MaintenanceList" component={MaintenanceListScreen} options={{ title: 'Maintenance' }} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} options={{ title: 'Bill Details' }} />
      <Stack.Screen name="BillGenerate" component={BillGenerateScreen} options={{ title: 'Generate Bills' }} />
      <Stack.Screen name="Defaulters" component={DefaultersScreen} options={{ title: 'Defaulters' }} />
    </Stack.Navigator>
  );
}
