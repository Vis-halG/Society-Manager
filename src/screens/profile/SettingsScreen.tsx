import React from 'react';
import { List } from 'react-native-paper';
import { ScreenContainer } from '../../components/common/ScreenContainer';

export function SettingsScreen() {
  return (
    <ScreenContainer>
      <List.Section title="Appearance">
        <List.Item
          title="Light Theme"
          description="Enabled"
          left={(props) => <List.Icon {...props} icon="white-balance-sunny" />}
        />
      </List.Section>
    </ScreenContainer>
  );
}
