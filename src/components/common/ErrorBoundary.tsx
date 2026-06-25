import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';

export function ErrorScreen({ message }: { message: string }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Something went wrong
      </Text>
      <Text variant="bodyMedium" style={styles.message}>
        {message}
      </Text>
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
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    color: '#666',
  },
});
