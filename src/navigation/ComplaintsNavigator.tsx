import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ComplaintListScreen } from '../screens/complaints/ComplaintListScreen';
import { ComplaintDetailScreen } from '../screens/complaints/ComplaintDetailScreen';
import { ComplaintFormScreen } from '../screens/complaints/ComplaintFormScreen';
import { ComplaintChatScreen } from '../screens/complaints/ComplaintChatScreen';
import { useGlassStackOptions } from './options';
import type { ComplaintsStackParamList } from './types';

const Stack = createNativeStackNavigator<ComplaintsStackParamList>();

export function ComplaintsNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ComplaintList" component={ComplaintListScreen} options={{ title: 'Complaints' }} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint' }} />
      <Stack.Screen name="ComplaintForm" component={ComplaintFormScreen} options={{ title: 'Raise Complaint' }} />
      <Stack.Screen name="ComplaintChat" component={ComplaintChatScreen} options={{ title: 'Chat' }} />
    </Stack.Navigator>
  );
}
