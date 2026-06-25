import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const { login, signInWithGoogle } = useAuth();
  const { colors } = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
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

  const handleGoogleLogin = async () => {
    setServerError(null);
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setServerError(mapAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={[styles.brandMark, { backgroundColor: `${colors.primary}14`, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="home-city-outline" size={28} color={colors.primary} />
          </View>
          <Text variant="headlineMedium" style={[styles.title, { color: colors.text }]}>
            Welcome back
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: colors.textMuted }]}>
            Sign in to manage your society account.
          </Text>
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {Platform.OS === 'web' ? (
            <>
              <Button
                mode="outlined"
                icon="google"
                onPress={handleGoogleLogin}
                loading={googleSubmitting}
                disabled={googleSubmitting || submitting}
                style={styles.googleButton}
                contentStyle={styles.buttonContent}
              >
                Continue with Google
              </Button>
              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={{ color: colors.textMuted }}>or</Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>
            </>
          ) : null}

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
            disabled={submitting || googleSubmitting}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Login
          </Button>

          <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')}>
            Forgot Password?
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={{ color: colors.textMuted }}>New resident?</Text>
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
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email. Use your email login.';
    case 'auth/operation-not-allowed':
      return 'Google login is not enabled for this Firebase project yet.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google login in Firebase.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Google login was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Allow popups and try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', flexGrow: 1 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 24 },
  brandMark: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontWeight: '700' },
  subtitle: { textAlign: 'center' },
  panel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  googleButton: { marginBottom: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  divider: { flex: 1, height: 1 },
  button: { marginTop: 8 },
  buttonContent: { minHeight: 46 },
  error: { textAlign: 'center', marginBottom: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
});
