import React, { useMemo, useState } from 'react';
import { FlatList, Linking, StyleSheet, View } from 'react-native';
import { Button, Dialog, FAB, IconButton, Portal, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useCollection } from '../../hooks/useCollection';
import {
  addEmergencyContact,
  deleteEmergencyContact,
  emergencyContactsQuery,
} from '../../services/emergencyContacts.service';
import type { EmergencyContact } from '../../types';

const ICON_OPTIONS = [
  'shield-account',
  'account-tie',
  'account-star',
  'lightning-bolt',
  'water-pump',
  'ambulance',
  'fire-truck',
];

interface ContactForm {
  label: string;
  name: string;
  phone: string;
}

export function EmergencyContactsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'admin';

  const query = useMemo(
    () => (user?.societyId ? emergencyContactsQuery(user.societyId) : null),
    [user?.societyId]
  );
  const { data: contacts, loading } = useCollection<EmergencyContact>(query);

  const { control, handleSubmit, reset } = useForm<ContactForm>({
    defaultValues: { label: '', name: '', phone: '' },
  });

  const onSubmit = async (values: ContactForm) => {
    if (!user?.societyId) return;
    setSaving(true);
    try {
      await addEmergencyContact({ societyId: user.societyId, icon, ...values });
      reset();
      setDialogVisible(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingOverlay label="Loading emergency contacts..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={contacts.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="phone-alert-outline" title="No emergency contacts yet" />}
        renderItem={({ item }) => (
          <GlassSurface style={styles.rowShell} contentStyle={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.danger}1A` }]}>
              <MaterialCommunityIcons name={item.icon as never} size={22} color={colors.danger} />
            </View>
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.label}</Text>
              <Text style={{ color: colors.textMuted }}>{item.name}</Text>
            </View>
            <IconButton
              icon="phone"
              mode="contained"
              containerColor={colors.success}
              iconColor="#fff"
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
            />
            {isAdmin ? (
              <IconButton icon="delete-outline" onPress={() => deleteEmergencyContact(item.id)} />
            ) : null}
          </GlassSurface>
        )}
      />

      {isAdmin ? (
        <FAB icon="plus" style={styles.fab} onPress={() => setDialogVisible(true)} />
      ) : null}

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Emergency Contact</Dialog.Title>
          <Dialog.Content>
            <FormInput control={control} name="label" label="Label (e.g. Security)" rules={{ required: 'Required' }} />
            <FormInput control={control} name="name" label="Contact Name" rules={{ required: 'Required' }} />
            <FormInput control={control} name="phone" label="Phone Number" keyboardType="phone-pad" rules={{ required: 'Required' }} />
            <View style={styles.iconRow}>
              {ICON_OPTIONS.map((opt) => (
                <IconButton
                  key={opt}
                  icon={opt}
                  mode={icon === opt ? 'contained' : 'outlined'}
                  onPress={() => setIcon(opt)}
                />
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSubmit(onSubmit)} loading={saving}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  rowShell: { marginBottom: 10 },
  flex1: { flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
});
