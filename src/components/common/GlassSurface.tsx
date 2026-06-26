import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity?: number;
  variant?: 'subtle' | 'default' | 'strong';
}

export function GlassSurface({
  children,
  style,
  contentStyle,
  intensity = 58,
  variant = 'default',
}: GlassSurfaceProps) {
  const { colors, isDark } = useAppTheme();
  const backgroundColor =
    variant === 'strong'
      ? colors.surfaceStrong
      : variant === 'subtle'
        ? colors.surfaceSoft
        : colors.surfaceGlass;

  return (
    <View
      style={[
        styles.shadow,
        {
          shadowColor: colors.shadow,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.clip,
          {
            backgroundColor,
            borderColor: colors.borderStrong,
          },
        ]}
      >
        <BlurView
          intensity={intensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={[colors.glassHighlight, colors.glassLowlight] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={contentStyle}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 8,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 4,
  },
  clip: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
