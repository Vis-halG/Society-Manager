import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { GlassSurface } from '../common/GlassSurface';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/date';
import type { MaintenanceBill } from '../../types';

export function BillCard({ bill, onPress }: { bill: MaintenanceBill; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={styles.touch}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <GlassSurface contentStyle={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}32` }]}>
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
      </GlassSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: { marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconWrap: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  flex1: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
});
