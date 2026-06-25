import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
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
import type { RootDrawerParamList, TabsParamList } from '../../navigation/types';

type Props = BottomTabScreenProps<TabsParamList, 'Dashboard'>;

interface QuickAction {
  title: string;
  description: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  onPress: () => void;
}

export function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const drawerNavigation = navigation.getParent<DrawerNavigationProp<RootDrawerParamList>>();
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
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const quickActions: QuickAction[] = isAdmin
    ? [
        {
          title: 'Approvals',
          description: `${adminStats?.pendingApprovals ?? 0} pending`,
          icon: 'account-check-outline',
          color: colors.warning,
          onPress: () => drawerNavigation?.navigate('ResidentApprovals'),
        },
        {
          title: 'Maintenance',
          description: 'Bills and dues',
          icon: 'cash-multiple',
          color: colors.danger,
          onPress: () => drawerNavigation?.navigate('Maintenance'),
        },
        {
          title: 'Visitors',
          description: 'Gate requests',
          icon: 'account-question-outline',
          color: colors.primary,
          onPress: () => drawerNavigation?.navigate('Visitors'),
        },
        {
          title: 'Notices',
          description: 'Post updates',
          icon: 'bulletin-board',
          color: colors.info,
          onPress: () => navigation.navigate('Notices'),
        },
      ]
    : [
        {
          title: 'Maintenance',
          description: `${stats?.unpaidBills ?? 0} unpaid`,
          icon: 'cash-multiple',
          color: colors.danger,
          onPress: () => drawerNavigation?.navigate('Maintenance'),
        },
        {
          title: 'Complaints',
          description: 'Raise or track',
          icon: 'alert-circle-outline',
          color: colors.warning,
          onPress: () => navigation.navigate('Complaints'),
        },
        {
          title: 'Visitors',
          description: 'Create a pass',
          icon: 'account-question-outline',
          color: colors.primary,
          onPress: () => drawerNavigation?.navigate('Visitors'),
        },
        {
          title: 'Notices',
          description: 'Society updates',
          icon: 'bulletin-board',
          color: colors.info,
          onPress: () => navigation.navigate('Notices'),
        },
      ];

  return (
    <ScreenContainer
      scroll
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Hello, {firstName}
        </Text>
        <Text style={{ color: colors.textMuted }}>
          {isAdmin ? 'Start with the work that needs attention.' : 'Choose what you need today.'}
        </Text>
      </View>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.actionGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.78}
            accessibilityRole="button"
          >
            <GlassSurface contentStyle={styles.actionContent}>
              <View style={[styles.actionIcon, { backgroundColor: `${action.color}18`, borderColor: `${action.color}32` }]}>
                <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
              </View>
              <Text numberOfLines={1} style={[styles.actionTitle, { color: colors.text }]}>
                {action.title}
              </Text>
              <Text numberOfLines={1} style={{ color: colors.textMuted }}>
                {action.description}
              </Text>
            </GlassSurface>
          </TouchableOpacity>
        ))}
      </View>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        At A Glance
      </Text>
      <View style={styles.grid}>
        <StatCard
          icon="bulletin-board"
          label="Notices"
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
          label="Events"
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
          label="Visitors"
          value={stats?.pendingVisitors ?? 0}
          color={colors.primary}
        />
        <StatCard
          icon="poll"
          label="Polls"
          value={stats?.activePolls ?? 0}
          color={colors.success}
        />
        {isAdmin ? (
          <>
            <StatCard
              icon="account-group-outline"
              label="Residents"
              value={adminStats?.totalResidents ?? 0}
              color={colors.info}
            />
            <StatCard
              icon="account-clock-outline"
              label="Approvals"
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
  header: { marginBottom: 20, marginTop: 4 },
  title: { fontWeight: '700' },
  sectionTitle: { fontWeight: '700', marginBottom: 10 },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    flexBasis: '48%',
    minHeight: 104,
    marginBottom: 12,
  },
  actionContent: { minHeight: 104, padding: 14 },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
