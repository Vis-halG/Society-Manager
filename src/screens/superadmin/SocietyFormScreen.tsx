import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { createSociety } from '../../services/societies.service';
import type { SuperAdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'SocietyForm'>;

interface SocietyForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalWings: string;
  totalFlats: string;
}

export function SocietyFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit } = useForm<SocietyForm>({
    defaultValues: { name: '', address: '', city: '', state: '', pincode: '', totalWings: '', totalFlats: '' },
  });

  const onSubmit = async (values: SocietyForm) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createSociety({
        name: values.name.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        pincode: values.pincode.trim(),
        totalWings: Number(values.totalWings) || 0,
        totalFlats: Number(values.totalFlats) || 0,
        createdBy: user.id,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <FormInput control={control} name="name" label="Society Name" rules={{ required: 'Required' }} />
      <FormInput control={control} name="address" label="Address" rules={{ required: 'Required' }} />
      <FormInput control={control} name="city" label="City" rules={{ required: 'Required' }} />
      <FormInput control={control} name="state" label="State" />
      <FormInput control={control} name="pincode" label="Pincode" keyboardType="numeric" />
      <FormInput control={control} name="totalWings" label="Total Wings" keyboardType="numeric" />
      <FormInput control={control} name="totalFlats" label="Total Flats" keyboardType="numeric" />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submit}>
        Create Society
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: 8, marginBottom: 24 },
});
