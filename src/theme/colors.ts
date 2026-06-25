export const palette = {
  primary: '#1565C0',
  primaryDark: '#0D47A1',
  primaryLight: '#5E92F3',
  secondary: '#00897B',
  success: '#2E7D32',
  warning: '#F9A825',
  danger: '#C62828',
  info: '#0277BD',
};

export const lightColors = {
  ...palette,
  background: '#F4F6F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1C1E',
  textMuted: '#5F6368',
  border: '#E1E4E8',
  notification: palette.danger,
};

export const darkColors = {
  ...palette,
  primary: '#5E92F3',
  background: '#101316',
  surface: '#1B1F23',
  card: '#1F242A',
  text: '#ECEFF1',
  textMuted: '#9AA4AD',
  border: '#2B3036',
  notification: '#EF5350',
};
