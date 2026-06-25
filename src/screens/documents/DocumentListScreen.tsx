import React, { useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';
import { Chip, Dialog, FAB, IconButton, Portal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import { deleteDocument, documentsQuery } from '../../services/documents.service';
import { DOCUMENT_CATEGORIES } from '../../constants';
import { formatDate } from '../../utils/date';
import type { SocietyDocument } from '../../types';
import type { DocumentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentList'>;

export function DocumentListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocietyDocument | null>(null);

  const isAdmin = user?.role === 'admin';

  const query = useMemo(
    () => (user?.societyId ? documentsQuery(user.societyId, category as never) : null),
    [user?.societyId, category]
  );
  const { data: documents, loading } = useCollection<SocietyDocument>(query);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteDocument(deleteTarget.id);
    setDeleteTarget(null);
  };

  if (loading) return <LoadingOverlay label="Loading documents..." />;

  return (
    <ScreenContainer padded={false}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={DOCUMENT_CATEGORIES}
        keyExtractor={(item) => item.value}
        style={styles.chipsList}
        contentContainerStyle={styles.chipsContent}
        renderItem={({ item }) => (
          <Chip
            selected={category === item.value}
            onPress={() => setCategory(category === item.value ? null : item.value)}
            style={styles.chip}
          >
            {item.label}
          </Chip>
        )}
      />

      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState icon="folder-outline" title="No documents found" />}
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="file-pdf-box" size={28} color={colors.primary} />
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ color: colors.textMuted }} variant="bodySmall">
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <IconButton icon="download-outline" onPress={() => Linking.openURL(item.fileUrl)} />
            {isAdmin ? (
              <IconButton icon="delete-outline" onPress={() => setDeleteTarget(item)} />
            ) : null}
          </View>
        )}
      />

      {isAdmin ? (
        <FAB icon="upload" style={styles.fab} onPress={() => navigation.navigate('DocumentUpload')} />
      ) : null}

      <Portal>
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>Delete Document</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete "{deleteTarget?.title}"?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <IconButton icon="close" onPress={() => setDeleteTarget(null)} />
            <IconButton icon="check" onPress={handleDelete} />
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  chipsList: { flexGrow: 0, marginTop: 12 },
  chipsContent: { paddingHorizontal: 16, gap: 8 },
  chip: { marginRight: 8 },
  listContent: { padding: 16, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  flex1: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
