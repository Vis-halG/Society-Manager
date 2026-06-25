import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { GlassSurface } from '../common/GlassSurface';

interface StatCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: number | string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({ icon, label, value, color, onPress }: StatCardProps) {
  const { colors } = useAppTheme();
  const accent = color ?? colors.primary;

  return (
    <TouchableOpacity
      style={styles.touch}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.78}
    >
      <GlassSurface style={styles.card} contentStyle={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18`, borderColor: `${accent}36` }]}>
          <MaterialCommunityIcons name={icon} size={22} color={accent} />
        </View>
        <Text variant="headlineSmall" style={[styles.value, { color: colors.text }]}>
          {value}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textMuted }}>
          {label}
        </Text>
      </GlassSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    flexBasis: '48%',
    marginBottom: 12,
  },
  card: {
    width: '100%',
  },
  content: { padding: 14 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: { fontWeight: '700' },
});
