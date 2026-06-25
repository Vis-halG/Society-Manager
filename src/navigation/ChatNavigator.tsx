import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from '../screens/chat/ChatListScreen';
import { ChatRoomScreen } from '../screens/chat/ChatRoomScreen';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import type { ChatStackParamList } from './types';

const Stack = createNativeStackNavigator<ChatStackParamList>();

export function ChatNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutHeaderButton /> }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
