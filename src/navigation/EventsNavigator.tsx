import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventListScreen } from '../screens/events/EventListScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { EventFormScreen } from '../screens/events/EventFormScreen';
import { MenuHeaderButton } from '../components/common/MenuHeaderButton';
import { useGlassStackOptions } from './options';
import type { EventsStackParamList } from './types';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="EventList"
        component={EventListScreen}
        options={{ title: 'Events', headerLeft: () => <MenuHeaderButton /> }}
      />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
      <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: 'New Event' }} />
    </Stack.Navigator>
  );
}
