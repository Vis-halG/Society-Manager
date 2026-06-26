import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VisitorListScreen } from '../screens/visitors/VisitorListScreen';
import { VisitorFormScreen } from '../screens/visitors/VisitorFormScreen';
import { VisitorDetailScreen } from '../screens/visitors/VisitorDetailScreen';
import { SecurityScanScreen } from '../screens/visitors/SecurityScanScreen';
import { useGlassStackOptions } from './options';
import type { VisitorsStackParamList } from './types';

const Stack = createNativeStackNavigator<VisitorsStackParamList>();

export function VisitorsNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="VisitorList" component={VisitorListScreen} options={{ title: 'Visitors' }} />
      <Stack.Screen name="VisitorForm" component={VisitorFormScreen} options={{ title: 'Add Visitor' }} />
      <Stack.Screen name="VisitorDetail" component={VisitorDetailScreen} options={{ title: 'Visitor Pass' }} />
      <Stack.Screen name="SecurityScan" component={SecurityScanScreen} options={{ title: 'Scan QR' }} />
    </Stack.Navigator>
  );
}
