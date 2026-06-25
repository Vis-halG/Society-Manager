import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { formatDateTime } from '../../utils/date';
import type { Timestamp } from 'firebase/firestore';

interface ChatBubbleProps {
  text?: string;
  imageUrl?: string | null;
  isOwn: boolean;
  senderName?: string;
  createdAt?: Timestamp | null;
  isRead?: boolean;
}

export function ChatBubble({ text, imageUrl, isOwn, senderName, createdAt, isRead }: ChatBubbleProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      <View
        style={[
          styles.bubble,
          isOwn
            ? { backgroundColor: colors.primary, borderTopRightRadius: 4 }
            : {
                backgroundColor: colors.surfaceGlass,
                borderColor: colors.borderStrong,
                borderWidth: 1,
                borderTopLeftRadius: 4,
              },
        ]}
      >
        {!isOwn && senderName ? (
          <Text variant="labelSmall" style={[styles.senderName, { color: colors.primary }]}>
            {senderName}
          </Text>
        ) : null}
        {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
        {text ? (
          <Text style={{ color: isOwn ? '#fff' : colors.text }}>{text}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text variant="labelSmall" style={{ color: isOwn ? '#E3F2FD' : colors.textMuted }}>
            {createdAt ? formatDateTime(createdAt).split(',')[1]?.trim() : ''}
          </Text>
          {isOwn ? (
            <MaterialCommunityIcons
              name={isRead ? 'check-all' : 'check'}
              size={14}
              color={isRead ? '#90CAF9' : '#E3F2FD'}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: 10, flexDirection: 'row' },
  rowOwn: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  senderName: { marginBottom: 2, fontWeight: '600' },
  image: { width: 180, height: 180, borderRadius: 10, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 },
});
