import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { eventsQuery } from '../../services/events.service';
import { formatDate } from '../../utils/date';
import type { SocietyEvent } from '../../types';
import type { EventsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventList'>;

export function EventListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const isAdmin = user?.role === 'admin';

  const query = useMemo(() => (user?.societyId ? eventsQuery(user.societyId) : null), [user?.societyId]);
  const { data: events, loading } = useCollection<SocietyEvent>(query);

  if (loading) return <LoadingOverlay label="Loading events..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={events.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="calendar-star" title="No upcoming events" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            activeOpacity={0.7}
          >
            {item.bannerUrl ? <Image source={{ uri: item.bannerUrl }} style={styles.banner} /> : null}
            <View style={styles.cardBody}>
              <Text variant="titleMedium" style={{ color: colors.text }}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 4 }}>
                {formatDate(item.startAt)} • {item.location}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('EventForm')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  banner: { width: '100%', height: 120 },
  cardBody: { padding: 14 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
