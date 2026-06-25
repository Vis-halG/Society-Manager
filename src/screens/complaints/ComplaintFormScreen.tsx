import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, SegmentedButtons, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { COMPLAINT_CATEGORIES } from '../../constants';
import { createComplaint } from '../../services/complaints.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import type { Attachment, Complaint } from '../../types';
import type { ComplaintsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ComplaintsStackParamList, 'ComplaintForm'>;

interface ComplaintForm {
  title: string;
  description: string;
}

export function ComplaintFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [category, setCategory] = useState<Complaint['category']>('plumbing');
  const [images, setImages] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ComplaintForm>({
    defaultValues: { title: '', description: '' },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled && result.assets[0] && user?.societyId) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const name = asset.fileName ?? `complaint_${Date.now()}.jpg`;
        const url = await uploadFile(asset.uri, buildStoragePath('complaint-images', user.societyId, name));
        setImages((prev) => [...prev, { url, name, type: 'image' }]);
      } finally {
        setUploading(false);
      }
    }
  };

  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (values: ComplaintForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      await createComplaint({
        societyId: user.societyId,
        raisedBy: user.id,
        raisedByName: user.fullName,
        flatNumber: user.flatNumber ? `${user.wing ?? ''}-${user.flatNumber}` : undefined,
        category,
        title: values.title,
        description: values.description,
        images,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Category
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        <SegmentedButtons
          value={category}
          onValueChange={(v) => setCategory(v as Complaint['category'])}
          buttons={COMPLAINT_CATEGORIES.map((c) => ({ value: c.value, label: c.label, icon: c.icon }))}
        />
      </ScrollView>

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
        Photos
      </Text>
      <View style={styles.imageRow}>
        {images.map((img, idx) => (
          <View key={idx} style={styles.imageWrap}>
            <Image source={{ uri: img.url }} style={styles.image} />
            <IconButton
              icon="close-circle"
              size={20}
              style={styles.removeBtn}
              onPress={() => removeImage(idx)}
            />
          </View>
        ))}
        <IconButton
          icon="camera-plus-outline"
          mode="outlined"
          size={28}
          onPress={pickImage}
          loading={uploading}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        disabled={submitting || uploading}
        style={styles.submit}
      >
        Submit Complaint
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 4, marginBottom: 8 },
  categoryScroll: { marginBottom: 16 },
  imageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  imageWrap: { position: 'relative' },
  image: { width: 64, height: 64, borderRadius: 8 },
  removeBtn: { position: 'absolute', top: -10, right: -10 },
  submit: { marginTop: 8, marginBottom: 24 },
});
