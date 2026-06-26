import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ChatBubble } from '../../components/common/ChatBubble';
import { ChatInputBar } from '../../components/common/ChatInputBar';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import { complaintMessagesQuery, sendComplaintMessage, type ComplaintMessage } from '../../services/complaints.service';
import type { ComplaintsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ComplaintsStackParamList, 'ComplaintChat'>;

export function ComplaintChatScreen({ route }: Props) {
  const { complaintId } = route.params;
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const query = useMemo(() => complaintMessagesQuery(complaintId), [complaintId]);
  const { data: messages, loading } = useCollection<ComplaintMessage>(query);

  const handleSend = async (text: string) => {
    if (!user) return;
    setSending(true);
    try {
      await sendComplaintMessage({ complaintId, senderId: user.id, senderName: user.fullName, text });
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            !loading ? <EmptyState icon="chat-outline" title="No messages yet" /> : null
          }
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              imageUrl={item.imageUrl}
              isOwn={item.senderId === user?.id}
              senderName={item.senderName}
              createdAt={item.createdAt}
            />
          )}
        />
        <ChatInputBar onSend={handleSend} sending={sending} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { padding: 16, flexGrow: 1 },
});
