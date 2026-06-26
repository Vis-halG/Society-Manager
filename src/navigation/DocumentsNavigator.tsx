import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentListScreen } from '../screens/documents/DocumentListScreen';
import { DocumentUploadScreen } from '../screens/documents/DocumentUploadScreen';
import { useGlassStackOptions } from './options';
import type { DocumentsStackParamList } from './types';

const Stack = createNativeStackNavigator<DocumentsStackParamList>();

export function DocumentsNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="DocumentList" component={DocumentListScreen} options={{ title: 'Documents' }} />
      <Stack.Screen name="DocumentUpload" component={DocumentUploadScreen} options={{ title: 'Upload Document' }} />
    </Stack.Navigator>
  );
}
