import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { formatRelative } from '../../utils/date';
import type { Notice } from '../../types';

const CATEGORY_ICON: Record<Notice['category'], keyof typeof MaterialCommunityIcons.glyphMap> = {
  general: 'bulletin-board',
  event: 'calendar-star',
  maintenance: 'wrench-outline',
  urgent: 'alert-octagon-outline',
};

export function NoticeCard({ notice, onPress }: { notice: Notice; onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {notice.isPinned ? (
        <MaterialCommunityIcons
          name="pin"
          size={16}
          color={colors.danger}
          style={styles.pinIcon}
        />
      ) : null}
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
          <MaterialCommunityIcons name={CATEGORY_ICON[notice.category]} size={20} color={colors.primary} />
        </View>
        <View style={styles.flex1}>
          <Text variant="titleMedium" numberOfLines={1} style={{ color: colors.text }}>
            {notice.title}
          </Text>
          <Text variant="bodySmall" numberOfLines={2} style={{ color: colors.textMuted, marginTop: 2 }}>
            {notice.description}
          </Text>
          <View style={styles.metaRow}>
            <Text variant="labelSmall" style={{ color: colors.textMuted }}>
              {notice.createdByName} • {formatRelative(notice.createdAt)}
            </Text>
            {notice.attachments?.length ? (
              <MaterialCommunityIcons name="paperclip" size={14} color={colors.textMuted} />
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  row: { flexDirection: 'row' },
  flex1: { flex: 1 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pinIcon: { position: 'absolute', top: 10, right: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
});
