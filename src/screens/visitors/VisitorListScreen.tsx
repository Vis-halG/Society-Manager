import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { VisitorCard } from '../../components/cards/VisitorCard';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { visitorsQuery } from '../../services/visitors.service';
import type { Visitor } from '../../types';
import type { VisitorsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<VisitorsStackParamList, 'VisitorList'>;

export function VisitorListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isResident = user?.role === 'resident';
  const isSecurity = user?.role === 'security';

  const query = useMemo(
    () => (user?.societyId ? visitorsQuery(user.societyId, isResident ? user.id : undefined) : null),
    [user?.societyId, user?.id, isResident]
  );
  const { data: visitors, loading } = useCollection<Visitor>(query);

  if (loading) return <LoadingOverlay label="Loading visitors..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={visitors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={visitors.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="account-question-outline" title="No visitor records" />}
        renderItem={({ item }) => (
          <VisitorCard visitor={item} onPress={() => navigation.navigate('VisitorDetail', { visitorId: item.id })} />
        )}
      />

      {isResident ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('VisitorForm')} />
      ) : null}
      {isSecurity ? (
        <FAB icon="qrcode-scan" style={styles.fab} onPress={() => navigation.navigate('SecurityScan')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
