import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary, ErrorScreen } from './src/components/common/ErrorBoundary';
import { firebaseInitError } from './src/config/firebase';

function ThemedApp() {
  const { paperTheme, isDark } = useAppTheme();
  return (
    <PaperProvider theme={paperTheme}>
      <RootNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </PaperProvider>
  );
}

export default function App() {
  if (firebaseInitError) {
    return (
      <ErrorScreen
        message={`Firebase failed to initialize: ${firebaseInitError.message}\n\nSet the EXPO_PUBLIC_FIREBASE_* environment variables (see .env.example) wherever this app is built/deployed, then redeploy.`}
      />
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <ThemedApp />
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
