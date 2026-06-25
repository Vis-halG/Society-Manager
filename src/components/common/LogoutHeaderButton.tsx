import React from 'react';
import { IconButton } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';

export function LogoutHeaderButton() {
  const { logout } = useAuth();
  const { colors } = useAppTheme();

  return (
    <IconButton
      icon="logout"
      iconColor={colors.danger}
      size={22}
      onPress={logout}
      accessibilityLabel="Logout"
    />
  );
}
