import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, IconButton, SegmentedButtons, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { COLLECTIONS, NOTICE_CATEGORIES } from '../../constants';
import { createNotice, updateNotice } from '../../services/notices.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import type { Attachment, Notice } from '../../types';
import type { NoticesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<NoticesStackParamList, 'NoticeForm'>;

interface NoticeForm {
  title: string;
  description: string;
}

export function NoticeFormScreen({ route, navigation }: Props) {
  const noticeId = route.params?.noticeId;
  const isEdit = !!noticeId;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<Notice['category']>('general');
  const [isPinned, setIsPinned] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const { control, handleSubmit, reset } = useForm<NoticeForm>({
    defaultValues: { title: '', description: '' },
  });

  useEffect(() => {
    if (!noticeId) return;
    getDoc(doc(db, COLLECTIONS.NOTICES, noticeId)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as Notice;
        reset({ title: data.title, description: data.description });
        setCategory(data.category);
        setIsPinned(data.isPinned);
        setAttachments(data.attachments ?? []);
      }
      setLoading(false);
    });
  }, [noticeId, reset]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled && result.assets[0] && user?.societyId) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const name = asset.fileName ?? `image_${Date.now()}.jpg`;
        const url = await uploadFile(asset.uri, buildStoragePath('notice-attachments', user.societyId, name));
        setAttachments((prev) => [...prev, { url, name, type: 'image' }]);
      } finally {
        setUploading(false);
      }
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.assets[0] && user?.societyId) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const url = await uploadFile(asset.uri, buildStoragePath('notice-attachments', user.societyId, asset.name));
        setAttachments((prev) => [...prev, { url, name: asset.name, type: 'pdf', sizeBytes: asset.size }]);
      } finally {
        setUploading(false);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: NoticeForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      if (isEdit && noticeId) {
        await updateNotice(noticeId, {
          title: values.title,
          description: values.description,
          category,
          isPinned,
          attachments,
        });
      } else {
        await createNotice({
          societyId: user.societyId,
          title: values.title,
          description: values.description,
          category,
          isPinned,
          attachments,
          createdBy: user.id,
          createdByName: user.fullName,
        });
      }
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <ScreenContainer scroll>
      <FormInput control={control} name="title" label="Title" rules={{ required: 'Required' }} />
      <FormInput
        control={control}
        name="description"
        label="Description"
        multiline
        numberOfLines={5}
        rules={{ required: 'Required' }}
      />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Category
      </Text>
      <SegmentedButtons
        value={category}
        onValueChange={(v) => setCategory(v as Notice['category'])}
        buttons={NOTICE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
        style={styles.segmented}
      />

      <Checkbox.Item
        label="Pin this notice"
        status={isPinned ? 'checked' : 'unchecked'}
        onPress={() => setIsPinned(!isPinned)}
        style={styles.checkbox}
      />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Attachments
      </Text>
      {attachments.map((att, idx) => (
        <View key={idx} style={[styles.attachmentRow, { borderColor: colors.border }]}>
          <Text numberOfLines={1} style={[styles.attachmentName, { color: colors.text }]}>
            {att.name}
          </Text>
          <IconButton icon="close" size={18} onPress={() => removeAttachment(idx)} />
        </View>
      ))}
      <View style={styles.attachActions}>
        <Button mode="outlined" icon="image-outline" onPress={pickImage} loading={uploading} style={styles.attachBtn}>
          Add Image
        </Button>
        <Button mode="outlined" icon="file-pdf-box" onPress={pickDocument} loading={uploading} style={styles.attachBtn}>
          Add PDF
        </Button>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        disabled={submitting || uploading}
        style={styles.submit}
      >
        {isEdit ? 'Save Changes' : 'Publish Notice'}
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 8 },
  segmented: { marginBottom: 8 },
  checkbox: { paddingHorizontal: 0 },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  attachmentName: { flex: 1 },
  attachActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  attachBtn: { flex: 1 },
  submit: { marginTop: 8, marginBottom: 24 },
});
