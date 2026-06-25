import React from 'react';
import { StyleSheet, View, ScrollView, type ViewStyle, type RefreshControlProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  padded?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function ScreenContainer({
  children,
  scroll = false,
  style,
  padded = true,
  refreshControl,
}: ScreenContainerProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom] as const}
        locations={[0, 0.52, 1] as const}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[
          styles.lightBand,
          {
            backgroundColor: colors.scrim,
            borderColor: colors.borderStrong,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.deepBand,
          {
            backgroundColor: `${colors.primary}12`,
            borderColor: colors.border,
          },
        ]}
      />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[padded && styles.padded, style]}
            refreshControl={refreshControl}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, padded && styles.padded, style]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  padded: { padding: 18, paddingBottom: 96 },
  lightBand: {
    position: 'absolute',
    top: -90,
    left: -40,
    right: -40,
    height: 250,
    borderBottomWidth: 1,
    transform: [{ rotate: '-8deg' }],
  },
  deepBand: {
    position: 'absolute',
    left: -80,
    right: -80,
    bottom: -120,
    height: 260,
    borderTopWidth: 1,
    transform: [{ rotate: '7deg' }],
  },
});
