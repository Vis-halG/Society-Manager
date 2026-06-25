import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

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
    marginBottom: 8,
  },
});
