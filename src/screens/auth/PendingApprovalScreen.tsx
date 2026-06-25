import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export function PendingApprovalScreen() {
  const { user, refreshUser, logout } = useAuth();
  const { colors } = useAppTheme();
  const [checking, setChecking] = useState(false);

  const rejected = user?.approvalStatus === 'rejected';

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <MaterialCommunityIcons
          name={rejected ? 'close-circle-outline' : 'clock-outline'}
          size={72}
          color={rejected ? colors.danger : colors.warning}
        />
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          {rejected ? 'Registration Rejected' : 'Awaiting Approval'}
        </Text>
        <Text variant="bodyMedium" style={[styles.body, { color: colors.textMuted }]}>
          {rejected
            ? 'Your society admin has rejected this registration. Please contact your society office for details.'
            : "Your registration is pending approval from your society admin. You'll be able to sign in once approved."}
        </Text>

        <Button mode="contained" onPress={handleCheck} loading={checking} style={styles.button}>
          Check Status
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
