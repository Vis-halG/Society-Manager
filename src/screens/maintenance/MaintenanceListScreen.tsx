import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Button, FAB } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { BillCard } from '../../components/cards/BillCard';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { billsQuery } from '../../services/maintenance.service';
import type { MaintenanceBill } from '../../types';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MaintenanceStackParamList, 'MaintenanceList'>;

export function MaintenanceListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const query = useMemo(
    () => (user?.societyId ? billsQuery(user.societyId, isAdmin ? undefined : user.id) : null),
    [user?.societyId, user?.id, isAdmin]
  );
  const { data: bills, loading } = useCollection<MaintenanceBill>(query);

  if (loading) return <LoadingOverlay label="Loading bills..." />;

  return (
    <ScreenContainer>
      {isAdmin ? (
        <Button mode="outlined" icon="account-alert-outline" onPress={() => navigation.navigate('Defaulters')} style={styles.defaultersBtn}>
          View Defaulters
        </Button>
      ) : null}

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={bills.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="cash-multiple" title="No maintenance bills" />}
        renderItem={({ item }) => (
          <BillCard bill={item} onPress={() => navigation.navigate('BillDetail', { billId: item.id })} />
        )}
      />

      {isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('BillGenerate')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  defaultersBtn: { marginBottom: 12 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
