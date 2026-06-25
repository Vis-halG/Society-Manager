import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Chip, FAB, Searchbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { NoticeCard } from '../../components/cards/NoticeCard';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { noticesQuery } from '../../services/notices.service';
import { NOTICE_CATEGORIES } from '../../constants';
import type { Notice } from '../../types';
import type { NoticesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<NoticesStackParamList, 'NoticeList'>;

export function NoticeListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const query = useMemo(
    () => (user?.societyId ? noticesQuery(user.societyId) : null),
    [user?.societyId]
  );
  const { data: notices, loading } = useCollection<Notice>(query);

  const filtered = notices.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || n.category === category;
    return matchesSearch && matchesCategory;
  });

  const canManage = user?.role === 'admin';

  if (loading) return <LoadingOverlay label="Loading notices..." />;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.searchWrap}>
        <Searchbar placeholder="Search notices" value={search} onChangeText={setSearch} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={NOTICE_CATEGORIES}
        keyExtractor={(item) => item.value}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => (
          <Chip
            selected={category === item.value}
            onPress={() => setCategory(category === item.value ? null : item.value)}
            style={styles.chip}
          >
            {item.label}
          </Chip>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="bulletin-board" title="No notices found" />}
        renderItem={({ item }) => (
          <NoticeCard notice={item} onPress={() => navigation.navigate('NoticeDetail', { noticeId: item.id })} />
        )}
      />

      {canManage ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('NoticeForm')} />
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
