import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { useAppTheme } from '../../context/ThemeContext';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onPickImage?: () => void;
  sending?: boolean;
}

export function ChatInputBar({ onSend, onPickImage, sending }: ChatInputBarProps) {
  const { colors } = useAppTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      {onPickImage ? <IconButton icon="image-outline" onPress={onPickImage} disabled={sending} /> : null}
      <TextInput
        mode="outlined"
        placeholder="Type a message"
        value={text}
        onChangeText={setText}
        style={styles.input}
        dense
        multiline
      />
      <IconButton icon="send" mode="contained" onPress={handleSend} disabled={sending || !text.trim()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: { flex: 1, maxHeight: 100 },
});
