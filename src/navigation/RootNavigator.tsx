import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { AuthNavigator } from './AuthNavigator';
import { TabsNavigator } from './TabsNavigator';
import { SecurityTabsNavigator } from './SecurityTabsNavigator';
import { SuperAdminTabsNavigator } from './SuperAdminTabsNavigator';
import { CompleteProfileScreen } from '../screens/auth/CompleteProfileScreen';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';
import { setUserOnlineStatus } from '../services/chat.service';
import { registerForPushNotificationsAsync } from '../services/notifications.service';

const Stack = createNativeStackNavigator();

function GateNavigator({ component }: { component: React.ComponentType }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Gate" component={component} />
    </Stack.Navigator>
  );
}

export function RootNavigator() {
  const { firebaseUser, user, initializing } = useAuth();
  const { navTheme } = useAppTheme();

  useEffect(() => {
    if (!user || user.approvalStatus !== 'approved') return;
    setUserOnlineStatus(user.id, true);
    registerForPushNotificationsAsync(user.id).catch(() => undefined);
    const subscription = AppState.addEventListener('change', (state) => {
      setUserOnlineStatus(user.id, state === 'active');
    });
    return () => {
      subscription.remove();
      setUserOnlineStatus(user.id, false);
    };
  }, [user?.id, user?.approvalStatus]);

  let content: React.ReactNode;

  if (initializing) {
    content = <LoadingOverlay label="Loading..." />;
  } else if (!firebaseUser) {
    content = <AuthNavigator />;
  } else if (!firebaseUser.emailVerified) {
    content = <GateNavigator component={EmailVerificationScreen} />;
  } else if (!user) {
    content = <GateNavigator component={CompleteProfileScreen} />;
  } else if (!user || user.approvalStatus !== 'approved') {
    content = <GateNavigator component={PendingApprovalScreen} />;
  } else if (user.role === 'security') {
    content = <SecurityTabsNavigator />;
  } else if (user.role === 'super_admin') {
    content = <SuperAdminTabsNavigator />;
  } else {
    content = <TabsNavigator />;
  }

  return <NavigationContainer theme={navTheme}>{content}</NavigationContainer>;
}
