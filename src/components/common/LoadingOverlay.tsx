import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppTheme } from '../../context/ThemeContext';
import { ScreenContainer } from './ScreenContainer';

export function LoadingOverlay({ label }: { label?: string }) {
  const { colors } = useAppTheme();
  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        {label ? <Text style={{ marginTop: 12, color: colors.textMuted }}>{label}</Text> : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
