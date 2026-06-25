import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants';
import { addGalleryImage, rsvpCounts, setRsvp } from '../../services/events.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';
import { formatDateTime } from '../../utils/date';
import type { SocietyEvent } from '../../types';
import type { EventsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<EventsStackParamList, 'EventDetail'>;

export function EventDetailScreen({ route }: Props) {
  const { eventId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [event, setEvent] = useState<SocietyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () =>
    getDoc(doc(db, COLLECTIONS.EVENTS, eventId)).then((snap) => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as SocietyEvent);
    });

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [eventId]);

  const myRsvp = user ? event?.rsvps?.[user.id] : undefined;

  const handleRsvp = async (status: 'going' | 'not_going' | 'maybe') => {
    if (!user) return;
    setRsvping(true);
    try {
      await setRsvp(eventId, user.id, status);
      await load();
    } finally {
      setRsvping(false);
    }
  };

  const handleAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted || !user?.societyId) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      try {
        const url = await uploadFile(
          result.assets[0].uri,
          buildStoragePath('event-gallery', user.societyId, `${Date.now()}.jpg`)
        );
        await addGalleryImage(eventId, url);
        await load();
      } finally {
        setUploading(false);
      }
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!event) return <Text style={styles.notFound}>Event not found.</Text>;

  const counts = rsvpCounts(event);

  return (
    <ScreenContainer scroll>
      {event.bannerUrl ? <Image source={{ uri: event.bannerUrl }} style={styles.banner} /> : null}
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
        {event.title}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>{event.location}</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        {formatDateTime(event.startAt)} - {formatDateTime(event.endAt)}
      </Text>

      <Text variant="bodyLarge" style={[styles.description, { color: colors.text }]}>
        {event.description}
      </Text>

      <View style={styles.rsvpCounts}>
        <Text style={{ color: colors.success }}>Going: {counts.going}</Text>
        <Text style={{ color: colors.warning }}>Maybe: {counts.maybe}</Text>
        <Text style={{ color: colors.danger }}>Not Going: {counts.notGoing}</Text>
      </View>

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Your RSVP
      </Text>
      <SegmentedButtons
        value={myRsvp ?? ''}
        onValueChange={(v) => handleRsvp(v as 'going' | 'not_going' | 'maybe')}
        buttons={[
          { value: 'going', label: 'Going' },
          { value: 'maybe', label: 'Maybe' },
          { value: 'not_going', label: 'Not Going' },
        ]}
        style={styles.segmented}
      />
      {rsvping ? <Text style={{ color: colors.textMuted }}>Updating...</Text> : null}

      <View style={styles.galleryHeader}>
        <Text variant="labelLarge" style={{ color: colors.text }}>
          Gallery
        </Text>
        <Button mode="text" icon="camera-plus-outline" onPress={handleAddPhoto} loading={uploading}>
          Add Photo
        </Button>
      </View>
      {event.gallery.length > 0 ? (
        <FlatList
          horizontal
          data={event.gallery}
          keyExtractor={(item, i) => `${i}`}
          renderItem={({ item }) => <Image source={{ uri: item }} style={styles.galleryImage} />}
        />
      ) : (
        <Text style={{ color: colors.textMuted }}>No photos yet.</Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: { width: '100%', height: 180, borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: '700' },
  description: { lineHeight: 22, marginBottom: 16 },
  rsvpCounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label: { marginBottom: 8 },
  segmented: { marginBottom: 24 },
  galleryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  galleryImage: { width: 120, height: 120, borderRadius: 10, marginRight: 8, marginTop: 8 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
