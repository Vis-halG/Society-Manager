import React from 'react';
import { List } from 'react-native-paper';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAuth } from '../../context/AuthContext';
import type { TabsParamList, RootDrawerParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<TabsParamList, 'More'>;

export function MoreScreen(_props: Props) {
  const { user, logout } = useAuth();
  const drawerNavigation = useNavigation<DrawerNavigationProp<RootDrawerParamList>>();
  const isAdmin = user?.role === 'admin';

  return (
    <ScreenContainer>
      <List.Section>
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
        <List.Item
          title="Emergency Contacts"
          left={(p) => <List.Icon {...p} icon="phone-alert-outline" />}
          onPress={() => drawerNavigation.navigate('EmergencyContacts')}
        />
        {isAdmin ? (
          <List.Item
            title="Resident Approvals"
            left={(p) => <List.Icon {...p} icon="account-check-outline" />}
            onPress={() => drawerNavigation.navigate('ResidentApprovals')}
          />
        ) : null}
        {isAdmin ? (
          <List.Item
            title="Reports & Analytics"
            left={(p) => <List.Icon {...p} icon="chart-bar" />}
            onPress={() => drawerNavigation.navigate('Reports')}
          />
        ) : null}
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
    </ScreenContainer>
  );
}
