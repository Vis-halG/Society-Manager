import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { Avatar, Button, Divider, Text } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { ROLE_LABELS } from '../constants';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();

  if (!user) return null;

  return (
    <View style={styles.flex}>
      <DrawerContentScrollView {...props}>
        <View style={styles.header}>
          {user.profileImageUrl ? (
            <Avatar.Image size={56} source={{ uri: user.profileImageUrl }} />
          ) : (
            <Avatar.Text size={56} label={user.fullName.slice(0, 2).toUpperCase()} />
          )}
          <Text variant="titleMedium" style={[styles.name, { color: colors.text }]}>
            {user.fullName}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.primary }}>
            {ROLE_LABELS[user.role]}
          </Text>
        </View>
        <Divider />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button mode="outlined" icon="logout" onPress={logout} textColor={colors.danger}>
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { padding: 20, paddingBottom: 12 },
  name: { fontWeight: '700', marginTop: 10 },
  footer: { padding: 16, borderTopWidth: 1 },
});
