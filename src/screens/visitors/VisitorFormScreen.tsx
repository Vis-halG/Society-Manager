import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { createVisitor } from '../../services/visitors.service';
import type { VisitorsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<VisitorsStackParamList, 'VisitorForm'>;

interface VisitorForm {
  visitorName: string;
  visitorPhone: string;
  purpose: string;
}

export function VisitorFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [preApproved, setPreApproved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit } = useForm<VisitorForm>({
    defaultValues: { visitorName: '', visitorPhone: '', purpose: '' },
  });

  const onSubmit = async (values: VisitorForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      const visitorId = await createVisitor({
        societyId: user.societyId,
        hostUserId: user.id,
        hostFlatNumber: user.wing ? `${user.wing}-${user.flatNumber}` : user.flatNumber ?? '',
        visitorName: values.visitorName.trim(),
        visitorPhone: values.visitorPhone.trim(),
        purpose: values.purpose.trim(),
        preApproved,
      });
      navigation.replace('VisitorDetail', { visitorId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput control={control} name="visitorName" label="Visitor Name" rules={{ required: 'Required' }} />
      <FormInput
        control={control}
        name="visitorPhone"
        label="Visitor Phone"
        keyboardType="phone-pad"
        rules={{ required: 'Required' }}
      />
      <FormInput control={control} name="purpose" label="Purpose of Visit" rules={{ required: 'Required' }} />

      <Checkbox.Item
        label="Pre-approve this visitor"
        status={preApproved ? 'checked' : 'unchecked'}
        onPress={() => setPreApproved(!preApproved)}
        style={styles.checkbox}
      />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submit}>
        Generate Visitor Pass
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  checkbox: { paddingHorizontal: 0, marginTop: 8 },
  submit: { marginTop: 16 },
});
