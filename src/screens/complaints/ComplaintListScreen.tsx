import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Chip, FAB, Searchbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { ComplaintCard } from '../../components/cards/ComplaintCard';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { complaintsQuery } from '../../services/complaints.service';
import { COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from '../../constants';
import type { Complaint } from '../../types';
import type { ComplaintsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ComplaintsStackParamList, 'ComplaintList'>;

export function ComplaintListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const query = useMemo(
    () =>
      user?.societyId ? complaintsQuery(user.societyId, isAdmin ? undefined : user.id) : null,
    [user?.societyId, user?.id, isAdmin]
  );
  const { data: complaints, loading } = useCollection<Complaint>(query);

  const filtered = complaints.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || c.status === status;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingOverlay label="Loading complaints..." />;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.searchWrap}>
        <Searchbar placeholder="Search complaints" value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={COMPLAINT_STATUSES}
        keyExtractor={(item) => item}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => (
          <Chip
            selected={status === item}
            onPress={() => setStatus(status === item ? null : item)}
            style={styles.chip}
          >
            {COMPLAINT_STATUS_LABELS[item]}
          </Chip>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="alert-circle-outline" title="No complaints found" />}
        renderItem={({ item }) => (
          <ComplaintCard
            complaint={item}
            onPress={() => navigation.navigate('ComplaintDetail', { complaintId: item.id })}
          />
        )}
      />

      {!isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('ComplaintForm')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchWrap: { paddingHorizontal: 16, paddingTop: 12 },
  chipsList: { flexGrow: 0, marginTop: 12 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: { marginRight: 8 },
  listContent: { padding: 16, flexGrow: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
