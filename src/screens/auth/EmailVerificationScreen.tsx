import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export function EmailVerificationScreen() {
  const { firebaseUser, resendVerificationEmail, refreshUser, logout } = useAuth();
  const { colors } = useAppTheme();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await firebaseUser?.reload();
      await refreshUser();
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <MaterialCommunityIcons name="email-check-outline" size={72} color={colors.primary} />
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Verify your email
        </Text>
        <Text variant="bodyMedium" style={[styles.body, { color: colors.textMuted }]}>
          We've sent a verification link to {firebaseUser?.email}. Please verify your email to
          continue.
        </Text>

        {sent ? (
          <Text style={{ color: colors.success, marginBottom: 12 }}>Verification email sent.</Text>
        ) : null}

        <Button mode="contained" onPress={handleCheck} loading={checking} style={styles.button}>
          I've verified, continue
        </Button>
        <Button mode="outlined" onPress={handleResend} loading={sending} style={styles.button}>
          Resend Email
        </Button>
        <Button mode="text" onPress={logout}>
          Logout
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  title: { fontWeight: '700', marginTop: 16, marginBottom: 8 },
  body: { textAlign: 'center', marginBottom: 24 },
  button: { width: '100%', marginBottom: 8 },
});
