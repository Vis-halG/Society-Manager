import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParkingOverviewScreen } from '../screens/parking/ParkingOverviewScreen';
import { VehicleFormScreen } from '../screens/parking/VehicleFormScreen';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import type { ParkingStackParamList } from './types';

const Stack = createNativeStackNavigator<ParkingStackParamList>();

export function ParkingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutHeaderButton /> }}>
      <Stack.Screen name="ParkingOverview" component={ParkingOverviewScreen} options={{ title: 'Parking' }} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{ title: 'Register Vehicle' }} />
    </Stack.Navigator>
  );
}
