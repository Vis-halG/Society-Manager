import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { pollsQuery } from '../../services/polls.service';
import { formatDate, isOverdue } from '../../utils/date';
import type { Poll } from '../../types';
import type { PollsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PollsStackParamList, 'PollList'>;

export function PollListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const isAdmin = user?.role === 'admin';

  const query = useMemo(() => (user?.societyId ? pollsQuery(user.societyId) : null), [user?.societyId]);
  const { data: polls, loading } = useCollection<Poll>(query);

  if (loading) return <LoadingOverlay label="Loading polls..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={polls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={polls.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="poll" title="No polls yet" />}
        renderItem={({ item }) => {
          const closed = !item.isActive || isOverdue(item.deadline);
          return (
            <TouchableOpacity
              style={styles.cardShell}
              onPress={() => navigation.navigate('PollDetail', { pollId: item.id })}
              activeOpacity={0.7}
            >
              <GlassSurface contentStyle={styles.card}>
              <View style={styles.headerRow}>
                <Text variant="titleMedium" style={[styles.flex1, { color: colors.text }]} numberOfLines={2}>
                  {item.question}
                </Text>
                <StatusBadge status={closed ? 'closed' : 'active'} />
              </View>
              <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 6 }}>
                {item.totalVotes} votes • Closes {formatDate(item.deadline)}
              </Text>
              </GlassSurface>
            </TouchableOpacity>
          );
        }}
      />

      {isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('PollForm')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  cardShell: { marginBottom: 12 },
  card: { padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
