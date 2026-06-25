import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PollListScreen } from '../screens/polls/PollListScreen';
import { PollDetailScreen } from '../screens/polls/PollDetailScreen';
import { PollFormScreen } from '../screens/polls/PollFormScreen';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import type { PollsStackParamList } from './types';

const Stack = createNativeStackNavigator<PollsStackParamList>();

export function PollsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutHeaderButton /> }}>
      <Stack.Screen name="PollList" component={PollListScreen} options={{ title: 'Polls' }} />
      <Stack.Screen name="PollDetail" component={PollDetailScreen} options={{ title: 'Poll' }} />
      <Stack.Screen name="PollForm" component={PollFormScreen} options={{ title: 'New Poll' }} />
    </Stack.Navigator>
  );
}
