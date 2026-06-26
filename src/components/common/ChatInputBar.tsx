import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';

interface ChatInputBarProps {
  onSend: (text: string) => void;
  onPickImage?: () => void;
  sending?: boolean;
}

export function ChatInputBar({ onSend, onPickImage, sending }: ChatInputBarProps) {
  const { colors, isDark } = useAppTheme();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <View style={[styles.shell, { borderTopColor: colors.borderStrong, backgroundColor: colors.surfaceGlass }]}>
      <BlurView intensity={68} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={[colors.glassHighlight, colors.glassLowlight] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.container}>
        {onPickImage ? <IconButton icon="image-outline" onPress={onPickImage} disabled={sending} /> : null}
        <TextInput
          mode="outlined"
          placeholder="Type a message"
          value={text}
          onChangeText={setText}
          style={[styles.input, { backgroundColor: colors.input }]}
          textColor={colors.text}
          placeholderTextColor={colors.textMuted}
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          dense
          multiline
        />
        <IconButton icon="send" mode="contained" onPress={handleSend} disabled={sending || !text.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  input: { flex: 1, maxHeight: 100 },
});
