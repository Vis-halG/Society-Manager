import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Button, Card, List, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { ROLE_LABELS } from '../../constants';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();

  if (!user) return null;

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        {user.profileImageUrl ? (
          <Avatar.Image size={88} source={{ uri: user.profileImageUrl }} />
        ) : (
          <Avatar.Text size={88} label={user.fullName.slice(0, 2).toUpperCase()} />
        )}
        <Text variant="titleLarge" style={[styles.name, { color: colors.text }]}>
          {user.fullName}
        </Text>
        <Text style={{ color: colors.textMuted }}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: `${colors.primary}1A` }]}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>
            {ROLE_LABELS[user.role]}
          </Text>
        </View>
      </View>

      <Card style={styles.card} mode="outlined">
        <List.Item title="Mobile Number" description={user.mobileNumber} left={(p) => <List.Icon {...p} icon="phone" />} />
        {user.wing ? (
          <List.Item
            title="Wing / Flat"
            description={`${user.wing} - ${user.flatNumber}`}
            left={(p) => <List.Icon {...p} icon="home-city-outline" />}
          />
        ) : null}
      </Card>

      <Card style={styles.card} mode="outlined">
        <List.Item
          title="Edit Profile"
          left={(p) => <List.Icon {...p} icon="account-edit-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="Change Password"
          left={(p) => <List.Icon {...p} icon="lock-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => navigation.navigate('ChangePassword')}
        />
        <List.Item
          title="Family Members"
          left={(p) => <List.Icon {...p} icon="account-group-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => navigation.navigate('FamilyMembers')}
        />
        <List.Item
          title="Settings"
          left={(p) => <List.Icon {...p} icon="cog-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => navigation.navigate('Settings')}
        />
      </Card>

      <Button mode="outlined" onPress={logout} style={styles.logout} textColor={colors.danger}>
        Logout
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: 16, marginTop: 8 },
  name: { fontWeight: '700', marginTop: 12 },
  roleBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  card: { marginBottom: 16 },
  logout: { marginTop: 8, borderColor: '#C62828' },
});
