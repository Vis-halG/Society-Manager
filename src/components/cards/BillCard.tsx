import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/date';
import type { MaintenanceBill } from '../../types';

export function BillCard({ bill, onPress }: { bill: MaintenanceBill; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
        <MaterialCommunityIcons name="receipt" size={20} color={colors.primary} />
      </View>
      <View style={styles.flex1}>
        <Text variant="titleMedium" style={{ color: colors.text }}>
          {bill.billMonth} • {bill.flatNumber}
        </Text>
        <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 2 }}>
          Due {formatDate(bill.dueDate)}
        </Text>
      </View>
      <View style={styles.right}>
        <Text variant="titleMedium" style={{ color: colors.text }}>
          ₹{bill.totalAmount}
        </Text>
        <StatusBadge status={bill.status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex1: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
});
