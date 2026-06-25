import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NoticeListScreen } from '../screens/notices/NoticeListScreen';
import { NoticeDetailScreen } from '../screens/notices/NoticeDetailScreen';
import { NoticeFormScreen } from '../screens/notices/NoticeFormScreen';
import type { NoticesStackParamList } from './types';

const Stack = createNativeStackNavigator<NoticesStackParamList>();

export function NoticesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NoticeList" component={NoticeListScreen} options={{ title: 'Notices' }} />
      <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} options={{ title: 'Notice' }} />
      <Stack.Screen
        name="NoticeForm"
        component={NoticeFormScreen}
        options={({ route }) => ({ title: route.params?.noticeId ? 'Edit Notice' : 'New Notice' })}
      />
    </Stack.Navigator>
  );
}
