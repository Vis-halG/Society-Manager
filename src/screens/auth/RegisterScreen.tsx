import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Menu, TouchableRipple, HelperText } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { listSocieties } from '../../services/societies.service';
import { mapAuthError } from './LoginScreen';
import type { AuthStackParamList } from '../../navigation/types';
import type { Society } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface RegisterForm {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  flatNumber: string;
  wing: string;
}

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedSociety, setSelectedSociety] = useState<Society | null>(null);
  const [societyError, setSocietyError] = useState<string | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { control, handleSubmit } = useForm<RegisterForm>({
    defaultValues: {
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      flatNumber: '',
      wing: '',
    },
  });

  useEffect(() => {
    listSocieties().then(setSocieties).catch(() => undefined);
  }, []);

  const onSubmit = async (values: RegisterForm) => {
    setServerError(null);
    setSocietyError(null);
    if (!selectedSociety) {
      setSocietyError('Please select your society');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setServerError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        mobileNumber: values.mobileNumber.trim(),
        flatNumber: values.flatNumber.trim(),
        wing: values.wing.trim(),
        societyId: selectedSociety.id,
      });
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Create your account
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.textMuted, marginBottom: 16 }}>
          Your registration will need admin approval before you can sign in.
        </Text>

        <FormInput
          control={control}
          name="fullName"
          label="Full Name"
          rules={{ required: 'Full name is required' }}
        />
        <FormInput
          control={control}
          name="email"
          label="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          rules={{
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          }}
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
              <View style={[styles.societyBox, { borderColor: societyError ? colors.danger : colors.border }]}>
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

        <FormInput
          control={control}
          name="password"
          label="Password"
          secureTextEntry
          autoCapitalize="none"
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Minimum 6 characters' },
          }}
        />
        <FormInput
          control={control}
          name="confirmPassword"
          label="Confirm Password"
          secureTextEntry
          autoCapitalize="none"
          rules={{ required: 'Please confirm your password' }}
        />

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
          Register
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')}>
          Already have an account? Login
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  societyPicker: { marginBottom: 4 },
  societyBox: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  error: { textAlign: 'center', marginBottom: 8 },
  button: { marginTop: 8, marginBottom: 4, paddingVertical: 4 },
});
