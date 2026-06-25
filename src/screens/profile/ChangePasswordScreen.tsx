import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

interface ChangePasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordScreen() {
  const { changePassword } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { control, handleSubmit, reset } = useForm<ChangePasswordForm>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ChangePasswordForm) => {
    setError(null);
    setSuccess(false);
    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    try {
      await changePassword(values.newPassword);
      setSuccess(true);
      reset();
    } catch {
      setError('Could not update password. Please log in again and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <FormInput
        control={control}
        name="newPassword"
        label="New Password"
        secureTextEntry
        autoCapitalize="none"
        rules={{ required: 'Required', minLength: { value: 6, message: 'Minimum 6 characters' } }}
      />
      <FormInput
        control={control}
        name="confirmPassword"
        label="Confirm New Password"
        secureTextEntry
        autoCapitalize="none"
        rules={{ required: 'Required' }}
      />
      {error ? <Text style={{ color: colors.danger, marginBottom: 8 }}>{error}</Text> : null}
      {success ? <Text style={{ color: colors.success, marginBottom: 8 }}>Password updated.</Text> : null}
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.button}>
        Update Password
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 8 },
});
