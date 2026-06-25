import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { useAppTheme } from '../../context/ThemeContext';

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  rules?: Record<string, unknown>;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  left?: React.ReactNode;
  disabled?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  secureTextEntry,
  keyboardType = 'default',
  multiline,
  numberOfLines,
  left,
  disabled,
  autoCapitalize = 'sentences',
}: FormInputProps<T>) {
  const { colors } = useAppTheme();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.wrapper}>
          <TextInput
            mode="outlined"
            label={label}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            left={left}
            disabled={disabled}
            autoCapitalize={autoCapitalize}
            error={!!error}
            textColor={colors.text}
            placeholderTextColor={colors.textMuted}
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            outlineStyle={styles.outline}
            style={[styles.input, { backgroundColor: colors.input }]}
            theme={{
              colors: {
                background: colors.input,
                onSurfaceVariant: colors.textMuted,
                surfaceVariant: colors.input,
              },
            }}
          />
          {error?.message ? (
            <HelperText type="error">{String(error.message)}</HelperText>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  input: {
    overflow: 'hidden',
  },
  outline: {
    borderRadius: 8,
    borderWidth: 1,
  },
});
