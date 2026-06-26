import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Avatar, Button, Chip, Text } from 'react-native-paper';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  listAllUsersBySociety,
  listPendingResidents,
  setApprovalStatus,
  setUserRole,
} from '../../services/users.service';
import type { AppUser } from '../../types';

export function ResidentApprovalsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [pending, setPending] = useState<AppUser[]>([]);
  const [residents, setResidents] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.societyId) return;
    const [pendingList, allUsers] = await Promise.all([
      listPendingResidents(user.societyId),
      listAllUsersBySociety(user.societyId),
    ]);
    setPending(pendingList);
    setResidents(allUsers.filter((u) => u.approvalStatus === 'approved' && u.role !== 'admin'));
  }, [user?.societyId]);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleApproval = async (userId: string, approved: boolean) => {
    setActingId(userId);
    try {
      await setApprovalStatus(userId, approved ? 'approved' : 'rejected');
      await load();
    } finally {
      setActingId(null);
    }
  };

  const handleToggleSecurity = async (resident: AppUser) => {
    setActingId(resident.id);
    try {
      await setUserRole(resident.id, resident.role === 'security' ? 'resident' : 'security');
      await load();
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <LoadingOverlay label="Loading residents..." />;

  return (
    <ScreenContainer scroll refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        Pending Approvals ({pending.length})
      </Text>
      {pending.length === 0 ? (
        <EmptyState icon="account-check-outline" title="No pending requests" />
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <GlassSurface style={styles.rowShell} contentStyle={styles.row}>
              <Avatar.Text size={40} label={item.fullName.slice(0, 2).toUpperCase()} />
              <View style={styles.flex1}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>{item.fullName}</Text>
                <Text style={{ color: colors.textMuted }}>
                  {item.wing}-{item.flatNumber} • {item.email}
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                loading={actingId === item.id}
                onPress={() => handleApproval(item.id, true)}
                style={styles.smallBtn}
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                compact
                textColor={colors.danger}
                loading={actingId === item.id}
                onPress={() => handleApproval(item.id, false)}
              >
                Reject
              </Button>
            </GlassSurface>
          )}
        />
      )}

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        Residents & Security Staff
      </Text>
      <FlatList
        data={residents}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={<EmptyState icon="account-group-outline" title="No residents yet" />}
        renderItem={({ item }) => (
          <GlassSurface style={styles.rowShell} contentStyle={styles.row}>
            <Avatar.Text size={40} label={item.fullName.slice(0, 2).toUpperCase()} />
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.fullName}</Text>
              <Text style={{ color: colors.textMuted }}>
                {item.wing}-{item.flatNumber}
              </Text>
            </View>
            <Chip
              compact
              selected={item.role === 'security'}
              onPress={() => handleToggleSecurity(item)}
              disabled={actingId === item.id}
            >
              {item.role === 'security' ? 'Security' : 'Make Security'}
            </Chip>
          </GlassSurface>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  rowShell: { marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10 },
  flex1: { flex: 1 },
  smallBtn: { marginRight: 4 },
});
