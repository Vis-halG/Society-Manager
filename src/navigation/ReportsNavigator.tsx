import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { useGlassStackOptions } from './options';

const Stack = createNativeStackNavigator();

export function ReportsNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports & Analytics' }} />
    </Stack.Navigator>
  );
}
