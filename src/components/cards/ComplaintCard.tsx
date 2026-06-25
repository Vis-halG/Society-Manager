import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatRelative } from '../../utils/date';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS_LABELS } from '../../constants';
import type { Complaint } from '../../types';

export function ComplaintCard({ complaint, onPress }: { complaint: Complaint; onPress: () => void }) {
  const { colors } = useAppTheme();
  const categoryMeta = COMPLAINT_CATEGORIES.find((c) => c.value === complaint.category);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.warning}1A` }]}>
          <MaterialCommunityIcons
            name={(categoryMeta?.icon ?? 'help-circle-outline') as never}
            size={20}
            color={colors.warning}
          />
        </View>
        <View style={styles.flex1}>
          <Text variant="titleMedium" numberOfLines={1} style={{ color: colors.text }}>
            {complaint.title}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textMuted, marginTop: 2 }}>
            {categoryMeta?.label} {complaint.flatNumber ? `• ${complaint.flatNumber}` : ''}
          </Text>
          <View style={styles.metaRow}>
            <StatusBadge status={complaint.status} label={COMPLAINT_STATUS_LABELS[complaint.status]} />
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              {formatRelative(complaint.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
});
