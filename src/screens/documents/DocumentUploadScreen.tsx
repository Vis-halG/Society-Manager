import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as DocumentPicker from 'expo-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { DOCUMENT_CATEGORIES } from '../../constants';
import { uploadDocument } from '../../services/documents.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import type { DocumentCategory } from '../../types';
import type { DocumentsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentUpload'>;

interface DocumentForm {
  title: string;
}

export function DocumentUploadScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<DocumentCategory>('circulars');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<DocumentForm>({ defaultValues: { title: '' } });

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (!result.canceled && result.assets[0]) setFile(result.assets[0]);
  };

  const onSubmit = async (values: DocumentForm) => {
    if (!user?.societyId || !file) return;
    setSubmitting(true);
    try {
      const fileUrl = await uploadFile(file.uri, buildStoragePath('documents', user.societyId, file.name));
      await uploadDocument({
        societyId: user.societyId,
        title: values.title.trim(),
        category,
        fileUrl,
        fileName: file.name,
        sizeBytes: file.size ?? 0,
        uploadedBy: user.id,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput control={control} name="title" label="Document Title" rules={{ required: 'Required' }} />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Category
      </Text>
      <View style={styles.categoryWrap}>
        {DOCUMENT_CATEGORIES.map((c) => (
          <Button
            key={c.value}
            mode={category === c.value ? 'contained' : 'outlined'}
            onPress={() => setCategory(c.value)}
            style={styles.categoryBtn}
            compact
          >
            {c.label}
          </Button>
        ))}
      </View>

      <Button mode="outlined" icon="file-upload-outline" onPress={pickFile} style={styles.fileBtn}>
        {file ? file.name : 'Choose File'}
      </Button>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        disabled={!file || submitting}
        style={styles.submit}
      >
        Upload Document
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 8 },
  categoryWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryBtn: { marginBottom: 4 },
  fileBtn: { marginBottom: 16 },
  submit: { marginTop: 8, marginBottom: 24 },
});
