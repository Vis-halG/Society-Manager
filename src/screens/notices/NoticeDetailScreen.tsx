import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants';
import { deleteNotice, togglePin } from '../../services/notices.service';
import { formatDateTime } from '../../utils/date';
import type { Notice } from '../../types';
import type { NoticesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<NoticesStackParamList, 'NoticeDetail'>;

export function NoticeDetailScreen({ route, navigation }: Props) {
  const { noticeId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    getDoc(doc(db, COLLECTIONS.NOTICES, noticeId)).then((snap) => {
      if (snap.exists()) setNotice({ id: snap.id, ...snap.data() } as Notice);
      setLoading(false);
    });
  }, [noticeId]);

  const canManage = user?.role === 'admin';

  const handleDelete = async () => {
    await deleteNotice(noticeId);
    setConfirmDelete(false);
    navigation.goBack();
  };

  const handleTogglePin = async () => {
    if (!notice) return;
    await togglePin(notice.id, !notice.isPinned);
    setNotice({ ...notice, isPinned: !notice.isPinned });
  };

  if (loading) return <LoadingOverlay />;
  if (!notice) return <Text style={styles.notFound}>Notice not found.</Text>;

  return (
    <ScreenContainer scroll>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          {notice.title}
        </Text>
        {canManage ? (
          <IconButton
            icon={notice.isPinned ? 'pin' : 'pin-outline'}
            iconColor={notice.isPinned ? colors.danger : colors.textMuted}
            onPress={handleTogglePin}
          />
        ) : null}
      </View>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        {notice.createdByName} • {formatDateTime(notice.createdAt)}
      </Text>

      <Text variant="bodyLarge" style={[styles.description, { color: colors.text }]}>
        {notice.description}
      </Text>

      {notice.attachments?.length ? (
        <View style={styles.attachments}>
          <Text variant="titleSmall" style={{ color: colors.text, marginBottom: 8 }}>
            Attachments
          </Text>
          {notice.attachments.map((att, idx) => (
            <Button
              key={idx}
              mode="outlined"
              icon={att.type === 'pdf' ? 'file-pdf-box' : 'file-image-outline'}
              onPress={() => Linking.openURL(att.url)}
              style={styles.attachmentBtn}
            >
              {att.name}
            </Button>
          ))}
        </View>
      ) : null}

      {canManage ? (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="pencil-outline"
            style={styles.actionBtn}
            onPress={() => navigation.navigate('NoticeForm', { noticeId: notice.id })}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            icon="delete-outline"
            textColor={colors.danger}
            style={styles.actionBtn}
            onPress={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        </View>
      ) : null}

      <Portal>
        <Dialog visible={confirmDelete} onDismiss={() => setConfirmDelete(false)}>
          <Dialog.Title>Delete Notice</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this notice?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDelete(false)}>Cancel</Button>
            <Button onPress={handleDelete} textColor={colors.danger}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  title: { fontWeight: '700', flex: 1 },
  description: { lineHeight: 22 },
  attachments: { marginTop: 24 },
  attachmentBtn: { marginBottom: 8, alignSelf: 'flex-start' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  actionBtn: { flex: 1 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
