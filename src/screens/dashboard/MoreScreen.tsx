import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, List, Text } from 'react-native-paper';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import type { TabsParamList, RootDrawerParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<TabsParamList, 'More'>;

export function MoreScreen(_props: Props) {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const isAdmin = user?.role === 'admin';

  return (
    <ScreenContainer scroll>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Menu
        </Text>
        <IconButton
          icon="menu"
          iconColor={colors.text}
          size={24}
          onPress={() => drawerNavigation.openDrawer()}
          accessibilityLabel="Open menu"
        />
      </View>
      <GlassSurface style={styles.sectionShell} contentStyle={styles.sectionContent}>
        <List.Section title="Daily">
          <List.Item
            title="Maintenance"
            left={(p) => <List.Icon {...p} icon="cash-multiple" />}
            onPress={() => drawerNavigation.navigate('Maintenance')}
          />
          <List.Item
            title="Visitors"
            left={(p) => <List.Icon {...p} icon="account-question-outline" />}
            onPress={() => drawerNavigation.navigate('Visitors')}
          />
          <List.Item
            title="Parking"
            left={(p) => <List.Icon {...p} icon="car" />}
            onPress={() => drawerNavigation.navigate('Parking')}
          />
          <List.Item
            title="Emergency Contacts"
            left={(p) => <List.Icon {...p} icon="phone-alert-outline" />}
            onPress={() => drawerNavigation.navigate('EmergencyContacts')}
          />
        </List.Section>
      </GlassSurface>

      <GlassSurface style={styles.sectionShell} contentStyle={styles.sectionContent}>
        <List.Section title="Community">
          <List.Item
            title="Polls"
            left={(p) => <List.Icon {...p} icon="poll" />}
            onPress={() => drawerNavigation.navigate('Polls')}
          />
          <List.Item
            title="Events"
            left={(p) => <List.Icon {...p} icon="calendar-star" />}
            onPress={() => drawerNavigation.navigate('Events')}
          />
          <List.Item
            title="Documents"
            left={(p) => <List.Icon {...p} icon="folder-outline" />}
            onPress={() => drawerNavigation.navigate('Documents')}
          />
          <List.Item
            title="Notifications"
            left={(p) => <List.Icon {...p} icon="bell-outline" />}
            onPress={() => drawerNavigation.navigate('Notifications')}
          />
        </List.Section>
      </GlassSurface>

      {isAdmin ? (
        <GlassSurface style={styles.sectionShell} contentStyle={styles.sectionContent}>
          <List.Section title="Admin">
            <List.Item
              title="Resident Approvals"
              left={(p) => <List.Icon {...p} icon="account-check-outline" />}
              onPress={() => drawerNavigation.navigate('ResidentApprovals')}
            />
            <List.Item
              title="Reports"
              left={(p) => <List.Icon {...p} icon="chart-bar" />}
              onPress={() => drawerNavigation.navigate('Reports')}
            />
          </List.Section>
        </GlassSurface>
      ) : null}

      <GlassSurface style={styles.sectionShell} contentStyle={styles.sectionContent}>
        <List.Section title="Account">
          <List.Item
            title="Profile & Settings"
            left={(p) => <List.Icon {...p} icon="account-circle-outline" />}
            onPress={() => drawerNavigation.navigate('ProfileStack')}
          />
          <List.Item
            title="Logout"
            left={(p) => <List.Icon {...p} icon="logout" />}
            onPress={logout}
          />
        </List.Section>
      </GlassSurface>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: { fontWeight: '700' },
  sectionShell: { marginBottom: 14 },
  sectionContent: { overflow: 'hidden' },
});
