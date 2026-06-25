import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentListScreen } from '../screens/documents/DocumentListScreen';
import { DocumentUploadScreen } from '../screens/documents/DocumentUploadScreen';
import { LogoutHeaderButton } from '../components/common/LogoutHeaderButton';
import type { DocumentsStackParamList } from './types';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

export function DocumentsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerRight: () => <LogoutHeaderButton /> }}>
      <Stack.Screen name="DocumentList" component={DocumentListScreen} options={{ title: 'Documents' }} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ title: 'Upload Document' }} />
    </Stack.Navigator>
  );
}
