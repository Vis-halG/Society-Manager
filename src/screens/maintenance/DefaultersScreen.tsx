import React, { useMemo } from 'react';
import { FlatList, Share, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants';
import { formatDate } from '../../utils/date';
import type { MaintenanceBill } from '../../types';

export function DefaultersScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const defaultersQuery = useMemo(() => {
    if (!user?.societyId) return null;
    return query(
      collection(db, COLLECTIONS.MAINTENANCE_BILLS),
      where('societyId', '==', user.societyId),
      where('status', 'in', ['unpaid', 'overdue']),
      orderBy('dueDate', 'asc')
    );
  }, [user?.societyId]);

  const { data: bills, loading } = useCollection<MaintenanceBill>(defaultersQuery);

  const handleExport = async () => {
    const lines = bills.map(
      (b) => `${b.flatNumber} | ${b.billMonth} | Due ${formatDate(b.dueDate)} | ₹${b.totalAmount}`
    );
    await Share.share({ message: `Defaulters Report\n\n${lines.join('\n')}` });
  };

  if (loading) return <LoadingOverlay label="Loading defaulters..." />;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={{ color: colors.text }}>
          {bills.length} Defaulter{bills.length === 1 ? '' : 's'}
        </Text>
        {bills.length > 0 ? (
          <Button mode="text" icon="export-variant" onPress={handleExport}>
            Export
          </Button>
        ) : null}
      </View>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={bills.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="check-circle-outline" title="No defaulters" description="Everyone is up to date." />}
        renderItem={({ item }) => (
          <GlassSurface style={styles.rowShell} contentStyle={styles.row}>
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.flatNumber}</Text>
              <Text style={{ color: colors.textMuted }}>
                {item.billMonth} • Due {formatDate(item.dueDate)}
              </Text>
            </View>
            <Text style={{ color: colors.danger, fontWeight: '700' }}>₹{item.totalAmount}</Text>
          </GlassSurface>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  rowShell: { marginBottom: 10 },
  flex1: { flex: 1 },
});
