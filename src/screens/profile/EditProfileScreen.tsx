import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { updateProfile } from '../../services/users.service';
import { uploadFile, buildStoragePath } from '../../services/storage.service';

interface EditProfileForm {
  fullName: string;
  mobileNumber: string;
  wing: string;
  flatNumber: string;
}

export function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(user?.profileImageUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const { control, handleSubmit } = useForm<EditProfileForm>({
    defaultValues: {
      fullName: user?.fullName ?? '',
      mobileNumber: user?.mobileNumber ?? '',
      wing: user?.wing ?? '',
      flatNumber: user?.flatNumber ?? '',
    },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0] && user) {
      setUploading(true);
      try {
        const path = buildStoragePath('profile-images', user.societyId ?? 'global', `${user.id}.jpg`);
        const url = await uploadFile(result.assets[0].uri, path);
        setImageUri(url);
      } finally {
        setUploading(false);
      }
    }
  };

  const onSubmit = async (values: EditProfileForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await updateProfile(user.id, { ...values, profileImageUrl: imageUri });
      await refreshUser();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.avatarWrap}>
        <TouchableOpacity onPress={pickImage} disabled={uploading}>
          {imageUri ? (
            <Avatar.Image size={96} source={{ uri: imageUri }} />
          ) : (
            <Avatar.Text size={96} label={(user?.fullName ?? '?').slice(0, 2).toUpperCase()} />
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        {uploading ? <Text style={{ color: colors.textMuted, marginTop: 8 }}>Uploading...</Text> : null}
      </View>

      <FormInput control={control} name="fullName" label="Full Name" rules={{ required: 'Required' }} />
      <FormInput
        control={control}
        name="mobileNumber"
        label="Mobile Number"
        keyboardType="phone-pad"
        rules={{ required: 'Required' }}
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <FormInput control={control} name="wing" label="Wing" rules={{ required: 'Required' }} />
        </View>
        <View style={styles.half}>
          <FormInput control={control} name="flatNumber" label="Flat Number" rules={{ required: 'Required' }} />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        disabled={submitting || uploading}
        style={styles.button}
      >
        Save Changes
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  button: { marginTop: 8 },
});
