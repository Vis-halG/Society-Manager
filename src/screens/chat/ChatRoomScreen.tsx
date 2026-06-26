import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ChatBubble } from '../../components/common/ChatBubble';
import { ChatInputBar } from '../../components/common/ChatInputBar';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { useUserProfile } from '../../hooks/useUserProfile';
import { markMessagesRead, messagesQuery, sendMessage } from '../../services/chat.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import { formatRelative } from '../../utils/date';
import type { ChatMessage } from '../../types';
import type { ChatStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const { chatRoomId, otherUserId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const otherUser = useUserProfile(otherUserId);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const query = useMemo(() => messagesQuery(chatRoomId), [chatRoomId]);
  const { data: messages, loading } = useCollection<ChatMessage>(query);

  useEffect(() => {
    navigation.setOptions({ title: otherUser?.fullName ?? 'Chat' });
  }, [navigation, otherUser]);

  useEffect(() => {
    if (!user) return;
    const unread = messages.filter((m) => m.senderId !== user.id && !m.readBy?.includes(user.id));
    if (unread.length) markMessagesRead(unread.map((m) => m.id), user.id);
  }, [messages, user]);

  const handleSend = async (text: string) => {
    if (!user) return;
    setSending(true);
    try {
      await sendMessage({ chatRoomId, senderId: user.id, senderName: user.fullName, text });
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted || !user) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      setSending(true);
      try {
        const url = await uploadFile(
          result.assets[0].uri,
          buildStoragePath('chat-images', chatRoomId, `${Date.now()}.jpg`)
        );
        await sendMessage({ chatRoomId, senderId: user.id, senderName: user.fullName, imageUrl: url });
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {otherUser ? (
          <View style={[styles.statusBar, { borderBottomColor: colors.border }]}>
            <Text variant="labelSmall" style={{ color: otherUser.isOnline ? colors.success : colors.textMuted }}>
              {otherUser.isOnline ? 'Online' : `Last seen ${formatRelative(otherUser.lastSeen)}`}
            </Text>
          </View>
        ) : null}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={!loading ? <EmptyState icon="chat-outline" title="No messages yet" /> : null}
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              imageUrl={item.imageUrl}
              isOwn={item.senderId === user?.id}
              createdAt={item.createdAt}
              isRead={item.readBy?.includes(otherUserId)}
            />
          )}
        />
        <ChatInputBar onSend={handleSend} onPickImage={handlePickImage} sending={sending} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, flexGrow: 1 },
  statusBar: { paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, alignItems: 'center' },
});
