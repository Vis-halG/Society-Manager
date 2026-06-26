import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { markNotificationRead, notificationsQuery } from '../../services/notifications.service';
import { formatRelative } from '../../utils/date';
import type { AppNotification, NotificationType } from '../../types';

const TYPE_ICON: Record<NotificationType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  notice: 'bulletin-board',
  complaint: 'alert-circle-outline',
  visitor: 'account-question-outline',
  maintenance: 'cash-multiple',
  poll: 'poll',
  event: 'calendar-star',
  chat: 'chat-outline',
};

export function NotificationsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  const query = useMemo(() => (user ? notificationsQuery(user.id) : null), [user?.id]);
  const { data: notifications, loading } = useCollection<AppNotification>(query);

  if (loading) return <LoadingOverlay label="Loading notifications..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="bell-outline" title="No notifications yet" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.rowShell}
            onPress={() => !item.isRead && markNotificationRead(item.id)}
            activeOpacity={0.7}
          >
            <GlassSurface variant={item.isRead ? 'subtle' : 'default'} contentStyle={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
                <MaterialCommunityIcons name={TYPE_ICON[item.type]} size={20} color={colors.primary} />
              </View>
              <View style={styles.flex1}>
                <Text style={{ color: colors.text, fontWeight: item.isRead ? '400' : '700' }}>{item.title}</Text>
                <Text style={{ color: colors.textMuted }} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text variant="labelSmall" style={{ color: colors.textMuted, marginTop: 4 }}>
                  {formatRelative(item.createdAt)}
                </Text>
              </View>
              {!item.isRead ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}
            </GlassSurface>
          </TouchableOpacity>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowShell: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12 },
  flex1: { flex: 1 },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
});
