import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { FlatList } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { EmptyState } from '../../components/common/EmptyState';
import { FormInput } from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { setFamilyMembers } from '../../services/users.service';
import type { FamilyMember } from '../../types';

interface MemberForm {
  name: string;
  relation: string;
  age: string;
  phone: string;
}

export function FamilyMembersScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, reset } = useForm<MemberForm>({
    defaultValues: { name: '', relation: '', age: '', phone: '' },
  });

  const members = user?.familyMembers ?? [];

  const openAdd = () => {
    reset({ name: '', relation: '', age: '', phone: '' });
    setDialogVisible(true);
  };

  const onSubmit = async (values: MemberForm) => {
    if (!user) return;
    setSaving(true);
    try {
      const newMember: FamilyMember = {
        id: `${Date.now()}`,
        name: values.name.trim(),
        relation: values.relation.trim(),
        age: values.age ? Number(values.age) : undefined,
        phone: values.phone.trim() || undefined,
      };
      await setFamilyMembers(user.id, [...members, newMember]);
      await refreshUser();
      setDialogVisible(false);
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id: string) => {
    if (!user) return;
    await setFamilyMembers(user.id, members.filter((m) => m.id !== id));
    await refreshUser();
  };

  return (
    <ScreenContainer>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={members.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={
          <EmptyState icon="account-group-outline" title="No family members added" />
        }
        renderItem={({ item }) => (
          <GlassSurface style={styles.card} contentStyle={styles.cardRow}>
            <View style={styles.flex1}>
              <Text variant="titleMedium" style={{ color: colors.text }}>{item.name}</Text>
              <Text style={{ color: colors.textMuted }}>
                {item.relation}
                {item.age ? ` - ${item.age} yrs` : ''}
                {item.phone ? ` - ${item.phone}` : ''}
              </Text>
            </View>
            <IconButton icon="delete-outline" onPress={() => removeMember(item.id)} />
          </GlassSurface>
        )}
      />

      <Button mode="contained" onPress={openAdd} style={styles.addButton}>
        Add Family Member
      </Button>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Add Family Member</Dialog.Title>
          <Dialog.Content>
            <FormInput control={control} name="name" label="Name" rules={{ required: 'Required' }} />
            <FormInput control={control} name="relation" label="Relation" rules={{ required: 'Required' }} />
            <FormInput control={control} name="age" label="Age" keyboardType="numeric" />
            <FormInput control={control} name="phone" label="Phone (optional)" keyboardType="phone-pad" />
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
  flex1: { flex: 1 },
  card: { marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  addButton: { marginTop: 8 },
});
