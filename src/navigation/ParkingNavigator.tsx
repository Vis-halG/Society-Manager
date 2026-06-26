import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParkingOverviewScreen } from '../screens/parking/ParkingOverviewScreen';
import { VehicleFormScreen } from '../screens/parking/VehicleFormScreen';
import { MenuHeaderButton } from '../components/common/MenuHeaderButton';
import { useGlassStackOptions } from './options';
import type { ParkingStackParamList } from './types';

const Stack = createNativeStackNavigator<ParkingStackParamList>();

export function ParkingNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ParkingOverview"
        component={ParkingOverviewScreen}
        options={{ title: 'Parking', headerLeft: () => <MenuHeaderButton /> }}
      />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} options={{ title: 'Register Vehicle' }} />
    </Stack.Navigator>
  );
}
