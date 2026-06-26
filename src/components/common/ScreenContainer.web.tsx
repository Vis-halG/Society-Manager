import React from 'react';
import { StyleSheet, View, ScrollView, type ViewStyle, type RefreshControlProps } from 'react-native';
import { IonContent, IonPage } from '@ionic/react';
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
    <IonPage className="sm-ionic-page">
      <IonContent fullscreen scrollY={false} className="sm-ionic-content">
        <View style={styles.root}>
          <LinearGradient
            colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom] as const}
            locations={[0, 0.52, 1] as const}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[`${colors.primary}20`, `${colors.secondary}14`, 'transparent'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.topPrism}
          />
          <LinearGradient
            pointerEvents="none"
            colors={[`${colors.info}18`, `${colors.warning}10`, 'transparent'] as const}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.bottomPrism}
          />
          <View
            pointerEvents="none"
            style={[
              styles.lightBand,
              {
                backgroundColor: colors.surfaceSoft,
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
      </IonContent>
    </IonPage>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  padded: { padding: 18, paddingBottom: 96 },
  topPrism: {
    position: 'absolute',
    top: -120,
    left: -80,
    right: -40,
    height: 340,
    transform: [{ rotate: '-12deg' }],
  },
  bottomPrism: {
    position: 'absolute',
    left: -90,
    right: -90,
    bottom: -150,
    height: 360,
    transform: [{ rotate: '9deg' }],
  },
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
