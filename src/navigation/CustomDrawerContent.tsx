import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { Avatar, Button, Divider, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useAppTheme } from '../context/ThemeContext';
import { ROLE_LABELS } from '../constants';
import { GlassSurface } from '../components/common/GlassSurface';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();

  if (!user) return null;

  return (
    <View style={styles.flex}>
      <LinearGradient
        colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom] as const}
        style={StyleSheet.absoluteFill}
      />
      <DrawerContentScrollView {...props}>
        <GlassSurface style={styles.headerShell} contentStyle={styles.header}>
          <View style={styles.headerRow}>
            {user.profileImageUrl ? (
              <Avatar.Image size={54} source={{ uri: user.profileImageUrl }} />
            ) : (
              <Avatar.Text
                size={54}
                label={user.fullName.slice(0, 2).toUpperCase()}
                style={{ backgroundColor: colors.primary }}
              />
            )}
            <View style={styles.userCopy}>
              <Text variant="titleMedium" style={[styles.name, { color: colors.text }]}>
                {user.fullName}
              </Text>
              <Text variant="bodySmall" style={{ color: colors.primary }}>
                {ROLE_LABELS[user.role]}
              </Text>
            </View>
          </View>
        </GlassSurface>
        <Divider style={{ backgroundColor: colors.border }} />
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Button mode="contained-tonal" icon="logout" onPress={logout} textColor={colors.danger}>
          Logout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerShell: { margin: 14, marginBottom: 10 },
  header: { padding: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  userCopy: { flex: 1, marginLeft: 12 },
  name: { fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, backgroundColor: 'transparent' },
});
