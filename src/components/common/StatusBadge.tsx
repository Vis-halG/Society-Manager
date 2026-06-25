import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../../context/ThemeContext';

const STATUS_COLOR_KEY: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
  open: 'info',
  pending: 'warning',
  assigned: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'success',
  paid: 'success',
  unpaid: 'warning',
  overdue: 'danger',
  approved: 'success',
  rejected: 'danger',
  checked_in: 'success',
  checked_out: 'info',
  active: 'success',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const { colors } = useAppTheme();
  const colorKey = STATUS_COLOR_KEY[status] ?? 'primary';
  const color = colors[colorKey];

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
      <Text style={[styles.text, { color }]} variant="labelSmall">
        {label ?? status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
