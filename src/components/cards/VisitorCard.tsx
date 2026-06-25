import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { GlassSurface } from '../common/GlassSurface';
import { StatusBadge } from '../common/StatusBadge';
import { formatRelative } from '../../utils/date';
import type { Visitor } from '../../types';

export function VisitorCard({ visitor, onPress }: { visitor: Visitor; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={styles.touch}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <GlassSurface contentStyle={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.info}18`, borderColor: `${colors.info}32` }]}>
          <MaterialCommunityIcons name="account-arrow-right-outline" size={20} color={colors.info} />
        </View>
        <View style={styles.flex1}>
          <Text variant="titleMedium" style={{ color: colors.text }}>
            {visitor.visitorName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.textMuted }}>
            {visitor.hostFlatNumber} • {visitor.purpose}
          </Text>
          <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 4 }}>
            {formatRelative(visitor.createdAt)}
          </Text>
        </View>
        <StatusBadge status={visitor.status} />
      </GlassSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: { marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex1: { flex: 1 },
});
