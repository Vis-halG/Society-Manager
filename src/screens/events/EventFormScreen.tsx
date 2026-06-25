import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { createEvent } from '../../services/events.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import type { EventsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventForm'>;

interface EventForm {
  title: string;
  description: string;
  location: string;
}

export function EventFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [startAt, setStartAt] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [endAt, setEndAt] = useState(new Date(Date.now() + 26 * 60 * 60 * 1000));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<EventForm>({
    defaultValues: { title: '', description: '', location: '' },
  });

  const pickBanner = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted || !user?.societyId) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      aspect: [16, 9],
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const url = await uploadFile(
          result.assets[0].uri,
          buildStoragePath('event-banners', user.societyId, `${Date.now()}.jpg`)
        );
        setBannerUrl(url);
      } finally {
        setUploading(false);
      }
    }
  };

  const onSubmit = async (values: EventForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      await createEvent({
        societyId: user.societyId,
        title: values.title.trim(),
        description: values.description.trim(),
        location: values.location.trim(),
        startAt,
        endAt,
        bannerUrl,
        createdBy: user.id,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      {bannerUrl ? <Image source={{ uri: bannerUrl }} style={styles.banner} /> : null}
      <Button mode="outlined" icon="image-outline" onPress={pickBanner} loading={uploading} style={styles.bannerBtn}>
        {bannerUrl ? 'Change Banner' : 'Add Banner Image'}
      </Button>

      <FormInput control={control} name="title" label="Event Title" rules={{ required: 'Required' }} />
      <FormInput control={control} name="location" label="Location" rules={{ required: 'Required' }} />
      <FormInput
        control={control}
        name="description"
        label="Description"
        multiline
        numberOfLines={4}
        rules={{ required: 'Required' }}
      />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Starts At
      </Text>
      <Button mode="outlined" onPress={() => setShowStartPicker(true)} style={styles.dateBtn}>
        {startAt.toLocaleString()}
      </Button>
      {showStartPicker ? (
        <DateTimePicker
          value={startAt}
          mode="datetime"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowStartPicker(false);
            if (date) setStartAt(date);
          }}
        />
      ) : null}

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Ends At
      </Text>
      <Button mode="outlined" onPress={() => setShowEndPicker(true)} style={styles.dateBtn}>
        {endAt.toLocaleString()}
      </Button>
      {showEndPicker ? (
        <DateTimePicker
          value={endAt}
          mode="datetime"
          minimumDate={startAt}
          onChange={(_, date) => {
            setShowEndPicker(false);
            if (date) setEndAt(date);
          }}
        />
      ) : null}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submit}>
        Create Event
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 160, borderRadius: 12, marginBottom: 12 },
  bannerBtn: { marginBottom: 16 },
  label: { marginTop: 8, marginBottom: 8 },
  dateBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  submit: { marginTop: 8, marginBottom: 24 },
});
