import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface LoginForm {
  email: string;
  password: string;
}

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setServerError(null);
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>SM</Text>
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
            Society Manager
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.textMuted }}>
            Sign in to continue
          </Text>
        </View>

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
          name="password"
          label="Password"
          secureTextEntry
          autoCapitalize="none"
          rules={{ required: 'Password is required' }}
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
          Login
        </Button>

        <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot Password?
        </Button>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>Don't have an account?</Text>
          <Button mode="text" compact onPress={() => navigation.navigate('Register')}>
            Register
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

export function mapAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 32, marginTop: 24 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  title: { fontWeight: '700' },
  button: { marginTop: 8, paddingVertical: 4 },
  error: { textAlign: 'center', marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
