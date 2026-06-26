import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Menu, Text, TouchableRipple } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { FormInput } from '../../components/common/FormInput';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { listSocieties } from '../../services/societies.service';
import type { Society } from '../../types';

interface CompleteProfileForm {
  fullName: string;
  mobileNumber: string;
  flatNumber: string;
  wing: string;
}

export function CompleteProfileScreen() {
  const { firebaseUser, completeProfile, logout } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [societyError, setSocietyError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { control, handleSubmit } = useForm<CompleteProfileForm>({
    defaultValues: {
      fullName: firebaseUser?.displayName ?? '',
      mobileNumber: '',
      flatNumber: '',
      wing: '',
    },
  });

  useEffect(() => {
    listSocieties().then(setSocieties).catch(() => undefined);
  }, []);

  const onSubmit = async (values: CompleteProfileForm) => {
    setServerError(null);
    setSocietyError(null);
    if (!selectedSociety) {
      setSocietyError('Please select your society');
      return;
    }
    setSubmitting(true);
    try {
      await completeProfile({
        fullName: values.fullName.trim(),
        mobileNumber: values.mobileNumber.trim(),
        flatNumber: values.flatNumber.trim(),
        wing: values.wing.trim(),
        societyId: selectedSociety.id,
      });
    } catch {
      setServerError('Could not save your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
              Complete your profile
            </Text>
            <Text style={{ color: colors.textMuted }}>
              Add your society and flat details for admin approval.
            </Text>
            {firebaseUser?.email ? (
              <Text style={[styles.email, { color: colors.primary }]}>{firebaseUser.email}</Text>
            ) : null}
          </View>

          <FormInput
            control={control}
            name="fullName"
            label="Full Name"
            rules={{ required: 'Full name is required' }}
          />
          <FormInput
            control={control}
            name="mobileNumber"
            label="Mobile Number"
            keyboardType="phone-pad"
            rules={{
              required: 'Mobile number is required',
              minLength: { value: 10, message: 'Enter a valid 10-digit number' },
            }}
          />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setMenuVisible(true)} style={styles.societyPicker}>
                <View
                  style={[
                    styles.societyBox,
                    {
                      backgroundColor: colors.input,
                      borderColor: societyError ? colors.danger : colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: selectedSociety ? colors.text : colors.textMuted }}>
                    {selectedSociety ? selectedSociety.name : 'Select Society'}
                  </Text>
                </View>
              </TouchableRipple>
            }
          >
            {societies.length === 0 ? (
              <Menu.Item title="No societies available yet" disabled />
            ) : (
              societies.map((society) => (
                <Menu.Item
                  key={society.id}
                  title={society.name}
                  onPress={() => {
                    setSelectedSociety(society);
                    setMenuVisible(false);
                    setSocietyError(null);
                  }}
                />
              ))
            )}
          </Menu>
          {societyError ? <HelperText type="error">{societyError}</HelperText> : null}

          <View style={styles.row}>
            <View style={styles.half}>
              <FormInput
                control={control}
                name="wing"
                label="Wing"
                rules={{ required: 'Required' }}
              />
            </View>
            <View style={styles.half}>
              <FormInput
                control={control}
                name="flatNumber"
                label="Flat Number"
                rules={{ required: 'Required' }}
              />
            </View>
          </View>

          {serverError ? (
            <Text style={[styles.error, { color: colors.danger }]}>{serverError}</Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            disabled={submitting}
            style={styles.button}
          >
            Send for Approval
          </Button>
          <Button mode="text" onPress={logout}>
            Logout
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20, marginTop: 24 },
  title: { fontWeight: '700' },
  email: { marginTop: 8, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  societyPicker: { marginBottom: 4 },
  societyBox: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  error: { textAlign: 'center', marginBottom: 8 },
  button: { marginTop: 8, marginBottom: 4, paddingVertical: 4 },
});
