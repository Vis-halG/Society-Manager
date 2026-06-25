import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { formatRelative } from '../../utils/date';
import type { ChatRoom } from '../../types';

export function ChatRoomListItem({ room, onPress }: { room: ChatRoom; onPress: () => void }) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const otherUserId = room.participantIds.find((id) => id !== user?.id);
  const otherUser = useUserProfile(otherUserId);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View>
        {otherUser?.profileImageUrl ? (
          <Avatar.Image size={48} source={{ uri: otherUser.profileImageUrl }} />
        ) : (
          <Avatar.Text size={48} label={(otherUser?.fullName ?? '?').slice(0, 2).toUpperCase()} />
        )}
        {otherUser?.isOnline ? (
          <View style={[styles.onlineDot, { backgroundColor: colors.success, borderColor: colors.surface }]} />
        ) : null}
      </View>
      <View style={styles.flex1}>
        <Text variant="titleMedium" numberOfLines={1} style={{ color: colors.text }}>
          {otherUser?.fullName ?? 'Loading...'}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.textMuted }}>
          {room.lastMessage || 'Start the conversation'}
        </Text>
      </View>
      <Text variant="labelSmall" style={{ color: colors.textMuted }}>
        {formatRelative(room.lastMessageAt)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  flex1: { flex: 1 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
