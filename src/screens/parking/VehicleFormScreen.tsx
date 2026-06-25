import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { VEHICLE_TYPES } from '../../constants';
import { registerVehicle } from '../../services/parking.service';
import type { Vehicle } from '../../types';
import type { ParkingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ParkingStackParamList, 'VehicleForm'>;

interface VehicleForm {
  vehicleNumber: string;
  ownerName: string;
}

export function VehicleFormScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [vehicleType, setVehicleType] = useState<Vehicle['vehicleType']>('four_wheeler');
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<VehicleForm>({
    defaultValues: { vehicleNumber: '', ownerName: user?.fullName ?? '' },
  });

  const onSubmit = async (values: VehicleForm) => {
    if (!user?.societyId) return;
    setSubmitting(true);
    try {
      await registerVehicle({
        societyId: user.societyId,
        ownerUserId: user.id,
        ownerName: values.ownerName.trim(),
        vehicleNumber: values.vehicleNumber.trim().toUpperCase(),
        vehicleType,
      });
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
        Vehicle Type
      </Text>
      <SegmentedButtons
        value={vehicleType}
        onValueChange={(v) => setVehicleType(v as Vehicle['vehicleType'])}
        buttons={VEHICLE_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        style={styles.segmented}
      />

      <FormInput
        control={control}
        name="vehicleNumber"
        label="Vehicle Number"
        autoCapitalize="characters"
        rules={{ required: 'Required' }}
      />
      <FormInput control={control} name="ownerName" label="Owner Name" rules={{ required: 'Required' }} />

      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={submitting} style={styles.submit}>
        Register Vehicle
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8 },
  segmented: { marginBottom: 16 },
  submit: { marginTop: 16 },
});
