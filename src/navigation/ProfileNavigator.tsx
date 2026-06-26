import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { ChangePasswordScreen } from '../screens/profile/ChangePasswordScreen';
import { FamilyMembersScreen } from '../screens/profile/FamilyMembersScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { useGlassStackOptions } from './options';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  const screenOptions = useGlassStackOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />
      <Stack.Screen
        name="FamilyMembers"
        component={FamilyMembersScreen}
        options={{ title: 'Family Members' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
