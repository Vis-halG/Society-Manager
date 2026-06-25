import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { generateMonthlyBills } from '../../services/maintenance.service';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MaintenanceStackParamList, 'BillGenerate'>;

interface GenerateForm {
  billMonth: string;
  amount: string;
}

export function BillGenerateScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  const { control, handleSubmit } = useForm<GenerateForm>({
    defaultValues: { billMonth: '', amount: '' },
  });

  const onSubmit = async (values: GenerateForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      const res = await generateMonthlyBills({
        societyId: user.societyId,
        billMonth: values.billMonth.trim(),
        amount: Number(values.amount),
        dueDate,
      });
      setResult(res);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text variant="bodyMedium" style={{ color: colors.textMuted, marginBottom: 16 }}>
        Generates a bill for every approved resident in your society for the selected month.
      </Text>

      <FormInput
        control={control}
        name="billMonth"
        label="Bill Month (e.g. 2026-06)"
        rules={{ required: 'Required', pattern: { value: /^\d{4}-\d{2}$/, message: 'Use format YYYY-MM' } }}
      />
      <FormInput
        control={control}
        name="amount"
        label="Amount (₹)"
        keyboardType="numeric"
        rules={{ required: 'Required' }}
      />

      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Due Date
      </Text>
      <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.dateBtn}>
        {dueDate.toDateString()}
      </Button>
      {showPicker ? (
        <DateTimePicker
          value={dueDate}
          mode="date"
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setDueDate(date);
          }}
        />
      ) : null}

      {result ? (
        <View style={[styles.resultBox, { borderColor: colors.success }]}>
          <Text style={{ color: colors.success }}>
            Created {result.created} bills. Skipped {result.skipped} (already existed).
          </Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
        style={styles.submit}
      >
        Generate Bills
      </Button>
      {result ? (
        <Button mode="text" onPress={() => navigation.goBack()}>
          Done
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 8, marginBottom: 8 },
  dateBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  resultBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 },
  submit: { marginTop: 8 },
});
