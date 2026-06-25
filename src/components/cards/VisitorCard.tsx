import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatRelative } from '../../utils/date';
import type { Visitor } from '../../types';

export function VisitorCard({ visitor, onPress }: { visitor: Visitor; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.info}1A` }]}>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex1: { flex: 1 },
});
