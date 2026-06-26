import React from 'react';
import { IconButton } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';

export function MenuHeaderButton() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  return (
    <IconButton
      icon="menu"
      iconColor={colors.text}
      size={22}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      accessibilityLabel="Open menu"
    />
  );
}
