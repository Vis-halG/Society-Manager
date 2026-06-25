import React from 'react';
import { StyleSheet } from 'react-native';
import { List, RadioButton } from 'react-native-paper';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useAppTheme } from '../../context/ThemeContext';

export function SettingsScreen() {
  const { mode, setMode } = useAppTheme();

  return (
    <ScreenContainer>
      <List.Section title="Appearance">
        <RadioButton.Group onValueChange={(value) => setMode(value as typeof mode)} value={mode}>
          <RadioButton.Item label="Use System Setting" value="system" style={styles.item} />
          <RadioButton.Item label="Light Mode" value="light" style={styles.item} />
          <RadioButton.Item label="Dark Mode" value="dark" style={styles.item} />
        </RadioButton.Group>
      </List.Section>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  item: { paddingHorizontal: 0 },
});
