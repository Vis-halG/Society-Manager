import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Dialog, FAB, Menu, Portal, SegmentedButtons, Text, TouchableRipple } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { StatCard } from '../../components/cards/StatCard';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import {
  allocateSlot,
  createParkingSlot,
  parkingSlotsQuery,
  vehiclesQuery,
} from '../../services/parking.service';
import type { ParkingSlot, Vehicle } from '../../types';
import type { ParkingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ParkingStackParamList, 'ParkingOverview'>;

interface SlotForm {
  slotNumber: string;
}

export function ParkingOverviewScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const isAdmin = user?.role === 'admin';
  const [slotType, setSlotType] = useState<ParkingSlot['type']>('four_wheeler');
  const [addSlotVisible, setAddSlotVisible] = useState(false);
  const [allocateMenuVehicleId, setAllocateMenuVehicleId] = useState<string | null>(null);
  const { control, handleSubmit, reset } = useForm<SlotForm>({ defaultValues: { slotNumber: '' } });

  const vehiclesQ = useMemo(
    () => (user?.societyId ? vehiclesQuery(user.societyId, isAdmin ? undefined : user.id) : null),
    [user?.societyId, user?.id, isAdmin]
  );
  const slotsQ = useMemo(() => (user?.societyId ? parkingSlotsQuery(user.societyId) : null), [user?.societyId]);

  const { data: vehicles, loading: loadingVehicles } = useCollection<Vehicle>(vehiclesQ);
  const { data: slots, loading: loadingSlots } = useCollection<ParkingSlot>(slotsQ);

  const availableSlots = slots.filter((s) => !s.isAllocated);
  const unallocatedVehicles = vehicles.filter((v) => !v.parkingSlotId);

  const onAddSlot = async (values: SlotForm) => {
    if (!user?.societyId) return;
    await createParkingSlot({ societyId: user.societyId, slotNumber: values.slotNumber.trim(), type: slotType });
    reset();
    setAddSlotVisible(false);
  };

  const handleAllocate = async (vehicle: Vehicle, slot: ParkingSlot) => {
    await allocateSlot(slot.id, vehicle.id, vehicle.ownerUserId);
    setAllocateMenuVehicleId(null);
  };

  if (loadingVehicles || loadingSlots) return <LoadingOverlay label="Loading parking data..." />;

  return (
    <ScreenContainer scroll>
      <View style={styles.statsRow}>
        <StatCard icon="car-multiple" label="Total Slots" value={slots.length} color={colors.primary} />
        <StatCard icon="car" label="Available" value={availableSlots.length} color={colors.success} />
      </View>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        {isAdmin ? 'All Registered Vehicles' : 'My Vehicles'}
      </Text>
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState icon="car-off" title="No vehicles registered" />}
        renderItem={({ item }) => (
          <GlassSurface style={styles.vehicleRowShell} contentStyle={styles.vehicleRow}>
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.vehicleNumber}</Text>
              <Text style={{ color: colors.textMuted }}>
                {item.ownerName} • {item.vehicleType === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'}
              </Text>
            </View>
            {item.parkingSlotId ? (
              <Text style={{ color: colors.success, fontWeight: '600' }}>
                Slot {slots.find((s) => s.id === item.parkingSlotId)?.slotNumber}
              </Text>
            ) : isAdmin ? (
              <Menu
                visible={allocateMenuVehicleId === item.id}
                onDismiss={() => setAllocateMenuVehicleId(null)}
                anchor={
                  <TouchableRipple onPress={() => setAllocateMenuVehicleId(item.id)}>
                    <Text style={{ color: colors.primary, fontWeight: '600' }}>Allocate</Text>
                  </TouchableRipple>
                }
              >
                {availableSlots.length === 0 ? (
                  <Menu.Item title="No slots available" disabled />
                ) : (
                  availableSlots.map((slot) => (
                    <Menu.Item key={slot.id} title={slot.slotNumber} onPress={() => handleAllocate(item, slot)} />
                  ))
                )}
              </Menu>
            ) : (
              <Text style={{ color: colors.textMuted }}>Unassigned</Text>
            )}
          </GlassSurface>
        )}
      />

      {isAdmin ? (
        <Button mode="outlined" icon="plus" onPress={() => setAddSlotVisible(true)} style={styles.addSlotBtn}>
          Add Parking Slot
        </Button>
      ) : null}

      <Portal>
        <Dialog visible={addSlotVisible} onDismiss={() => setAddSlotVisible(false)}>
          <Dialog.Title>Add Parking Slot</Dialog.Title>
          <Dialog.Content>
            <FormInput control={control} name="slotNumber" label="Slot Number" rules={{ required: 'Required' }} />
            <SegmentedButtons
              value={slotType}
              onValueChange={(v) => setSlotType(v as ParkingSlot['type'])}
              buttons={[
                { value: 'two_wheeler', label: 'Two Wheeler' },
                { value: 'four_wheeler', label: 'Four Wheeler' },
                { value: 'visitor', label: 'Visitor' },
              ]}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddSlotVisible(false)}>Cancel</Button>
            <Button onPress={handleSubmit(onAddSlot)}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {!isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('VehicleForm')} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sectionTitle: { fontWeight: '700', marginTop: 8, marginBottom: 12 },
  flex1: { flex: 1 },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  vehicleRowShell: { marginBottom: 10 },
  addSlotBtn: { marginTop: 16, marginBottom: 80 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
