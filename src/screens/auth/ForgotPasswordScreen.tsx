import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { mapAuthError } from './LoginScreen';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<{ email: string }>({ defaultValues: { email: '' } });

  const onSubmit = async (values: { email: string }) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await resetPassword(values.email.trim());
      setSent(true);
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
        Reset your password
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.textMuted, marginBottom: 24 }}>
        Enter your account email and we'll send you a reset link.
      </Text>

      {sent ? (
        <View>
          <Text style={{ color: colors.success, marginBottom: 16 }}>
            A password reset link has been sent to your email.
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Login')}>
            Back to Login
          </Button>
        </View>
      ) : (
        <View>
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
            Send Reset Link
          </Button>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginTop: 16 },
  error: { textAlign: 'center', marginBottom: 8 },
  button: { marginTop: 8, paddingVertical: 4 },
});
