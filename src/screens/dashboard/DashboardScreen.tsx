import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatCard } from '../../components/cards/StatCard';
import { ComplaintBreakdownChart } from '../../components/cards/ComplaintBreakdownChart';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  getAdminDashboardStats,
  getResidentDashboardStats,
  getComplaintStatusBreakdown,
  type AdminDashboardStats,
  type ResidentDashboardStats,
} from '../../services/dashboard.service';
import type { TabsParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<TabsParamList, 'Dashboard'>;

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [stats, setStats] = useState<ResidentDashboardStats | AdminDashboardStats | null>(null);
  const [breakdown, setBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isAdmin = user?.role === 'admin';

  const loadStats = useCallback(async () => {
    if (!user?.societyId) return;
    if (isAdmin) {
      const [data, complaintBreakdown] = await Promise.all([
        getAdminDashboardStats(user.societyId),
        getComplaintStatusBreakdown(user.societyId),
      ]);
      setStats(data);
      setBreakdown(complaintBreakdown);
    } else {
      const data = await getResidentDashboardStats(user.societyId, user.id);
      setStats(data);
    }
  }, [user?.societyId, user?.id, isAdmin]);

  useEffect(() => {
    loadStats().finally(() => setLoading(false));
  }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) return <LoadingOverlay label="Loading dashboard..." />;

  const adminStats = stats as AdminDashboardStats | null;

  return (
    <ScreenContainer
      scroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.greeting}>
        <Text variant="headlineSmall" style={[styles.greetingText, { color: colors.text }]}>
          Hi, {user?.fullName?.split(' ')[0]} 👋
        </Text>
        <Text style={{ color: colors.textMuted }}>
          {isAdmin ? "Here's your society overview" : "Here's what's happening today"}
        </Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          icon="bulletin-board"
          label="Total Notices"
          value={stats?.totalNotices ?? 0}
          color={colors.info}
          onPress={() => navigation.navigate('Notices')}
        />
        <StatCard
          icon="alert-circle-outline"
          label={isAdmin ? 'Open Complaints' : 'Pending Complaints'}
          value={isAdmin ? adminStats?.openComplaints ?? 0 : stats?.pendingComplaints ?? 0}
          color={colors.warning}
          onPress={() => navigation.navigate('Complaints')}
        />
        <StatCard
          icon="calendar-star"
          label="Upcoming Events"
          value={stats?.upcomingEvents ?? 0}
          color={colors.secondary}
        />
        <StatCard
          icon="cash-multiple"
          label={isAdmin ? 'Defaulters' : 'Maintenance Due'}
          value={isAdmin ? adminStats?.defaulterCount ?? 0 : stats?.unpaidBills ?? 0}
          color={colors.danger}
        />
        <StatCard
          icon="account-question-outline"
          label="Visitor Requests"
          value={stats?.pendingVisitors ?? 0}
          color={colors.primary}
        />
        <StatCard
          icon="poll"
          label="Active Polls"
          value={stats?.activePolls ?? 0}
          color={colors.success}
        />
        {isAdmin ? (
          <>
            <StatCard
              icon="account-group-outline"
              label="Total Residents"
              value={adminStats?.totalResidents ?? 0}
              color={colors.info}
            />
            <StatCard
              icon="account-clock-outline"
              label="Pending Approvals"
              value={adminStats?.pendingApprovals ?? 0}
              color={colors.warning}
            />
          </>
        ) : null}
      </View>

      {isAdmin && breakdown.some((b) => b.count > 0) ? (
        <ComplaintBreakdownChart data={breakdown} />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: { marginBottom: 20, marginTop: 4 },
  greetingText: { fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
