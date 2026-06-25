import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { ChatRoomListItem } from '../../components/cards/ChatRoomListItem';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { chatRoomsQuery, findOrCreateDirectChatRoom } from '../../services/chat.service';
import { getSocietyAdmins } from '../../services/users.service';
import type { ChatRoom } from '../../types';
import type { ChatStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatList'>;

export function ChatListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [startingChat, setStartingChat] = useState(false);
  const [hasAdmin, setHasAdmin] = useState(true);

  const query = useMemo(() => (user ? chatRoomsQuery(user.id) : null), [user]);
  const { data: rooms, loading } = useCollection<ChatRoom>(query);

  useEffect(() => {
    if (user?.role === 'resident' && user.societyId) {
      getSocietyAdmins(user.societyId).then((admins) => setHasAdmin(admins.length > 0));
    }
  }, [user?.role, user?.societyId]);

  const handleStartChatWithAdmin = async () => {
    if (!user?.societyId) return;
    setStartingChat(true);
    try {
      const admins = await getSocietyAdmins(user.societyId);
      if (!admins[0]) return;
      const chatRoomId = await findOrCreateDirectChatRoom(user.societyId, user.id, admins[0].id);
      navigation.navigate('ChatRoom', { chatRoomId, otherUserId: admins[0].id });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) return <LoadingOverlay label="Loading chats..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        contentContainerStyle={rooms.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={
          <EmptyState
            icon="chat-outline"
            title="No conversations yet"
            description={
              user?.role === 'resident' && hasAdmin
                ? 'Start a conversation with your society admin.'
                : undefined
            }
          />
        }
        renderItem={({ item }) => (
          <ChatRoomListItem
            room={item}
            onPress={() => {
              const otherUserId = item.participantIds.find((id) => id !== user?.id) ?? '';
              navigation.navigate('ChatRoom', { chatRoomId: item.id, otherUserId });
            }}
          />
        )}
      />

      {user?.role === 'resident' && hasAdmin && rooms.length === 0 ? (
        <Button mode="contained" onPress={handleStartChatWithAdmin} loading={startingChat} style={styles.button}>
          Message Society Admin
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  button: { marginTop: 12 },
});
