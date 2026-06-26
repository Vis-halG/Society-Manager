import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors } from '../../theme';

export function ErrorScreen({ message }: { message: string }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <LinearGradient
        colors={[lightColors.backgroundTop, lightColors.backgroundMiddle, lightColors.backgroundBottom] as const}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.panel}>
        <Text variant="titleLarge" style={styles.title}>
          Something went wrong
        </Text>
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      </View>
    </ScrollView>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error);
  }

  render() {
    if (this.state.error) {
      return <ErrorScreen message={this.state.error.message} />;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.borderStrong,
    backgroundColor: lightColors.surfaceGlass,
    padding: 18,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: lightColors.text,
  },
  message: {
    textAlign: 'center',
    color: lightColors.textMuted,
  },
});
