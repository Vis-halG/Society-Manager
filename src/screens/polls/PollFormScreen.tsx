import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, IconButton, Text, TextInput } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { createPoll } from '../../services/polls.service';
import type { PollsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PollsStackParamList, 'PollForm'>;

interface PollForm {
  question: string;
}

export function PollFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [options, setOptions] = useState<string[]>(['', '']);
  const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<PollForm>({ defaultValues: { question: '' } });

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: PollForm) => {
    if (!user?.societyId) return;
    const optionTexts = options.map((o) => o.trim()).filter(Boolean);
    if (optionTexts.length < 2) {
      setOptionsError('Add at least 2 options');
      return;
    }
    setOptionsError(null);
    setSubmitting(true);
    try {
      await createPoll({
        societyId: user.societyId,
        question: values.question.trim(),
        optionTexts,
        deadline,
        createdBy: user.id,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput control={control} name="question" label="Poll Question" rules={{ required: 'Required' }} />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Options
      </Text>
      {options.map((opt, idx) => (
        <View key={idx} style={styles.optionRow}>
          <TextInput
            mode="outlined"
            label={`Option ${idx + 1}`}
            value={opt}
            onChangeText={(text) => updateOption(idx, text)}
            style={styles.flex1}
          />
          {options.length > 2 ? (
            <IconButton icon="close" onPress={() => removeOption(idx)} />
          ) : null}
        </View>
      ))}
      {optionsError ? <HelperText type="error">{optionsError}</HelperText> : null}

      <Button mode="text" icon="plus" onPress={() => setOptions((prev) => [...prev, ''])} style={styles.addOptionBtn}>
        Add Option
      </Button>

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Voting Deadline
      </Text>
      <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.dateBtn}>
        {deadline.toDateString()}
      </Button>
      {showPicker ? (
        <DateTimePicker
          value={deadline}
          mode="date"
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setDeadline(date);
          }}
        />
      ) : null}

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submit}>
        Create Poll
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flex1: { flex: 1 },
  addOptionBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  dateBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  submit: { marginTop: 8, marginBottom: 24 },
});
