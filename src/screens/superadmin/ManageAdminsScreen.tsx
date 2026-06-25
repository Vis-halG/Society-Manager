import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppTheme } from '../../context/ThemeContext';
import { addAdminToSociety, removeAdminFromSociety } from '../../services/societies.service';
import { listAllUsersBySociety } from '../../services/users.service';
import type { AppUser } from '../../types';
import type { SuperAdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'ManageAdmins'>;

export function ManageAdminsScreen({ route }: Props) {
  const { societyId } = route.params;
  const { colors } = useAppTheme();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await listAllUsersBySociety(societyId);
    setUsers(data.filter((u) => u.approvalStatus === 'approved'));
  }, [societyId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleToggleAdmin = async (targetUser: AppUser) => {
    setActingId(targetUser.id);
    try {
      if (targetUser.role === 'admin') {
        await removeAdminFromSociety(societyId, targetUser.id);
      } else {
        await addAdminToSociety(societyId, targetUser.id);
      }
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <LoadingOverlay label="Loading members..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={users.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="account-group-outline" title="No members in this society" />}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderColor: colors.border }]}>
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.fullName}</Text>
              <Text style={{ color: colors.textMuted }}>{item.email}</Text>
            </View>
            <Chip
              selected={item.role === 'admin'}
              onPress={() => handleToggleAdmin(item)}
              disabled={actingId === item.id || item.role === 'security'}
            >
              {item.role === 'admin' ? 'Admin' : 'Make Admin'}
            </Chip>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1 },
  flex1: { flex: 1 },
});
