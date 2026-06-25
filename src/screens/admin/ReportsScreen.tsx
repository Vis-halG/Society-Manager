import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatCard } from '../../components/cards/StatCard';
import { ComplaintBreakdownChart } from '../../components/cards/ComplaintBreakdownChart';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  getAdminDashboardStats,
  getComplaintStatusBreakdown,
  getPaymentCollectionThisMonth,
  getVisitorStatusBreakdown,
  getSuperAdminStats,
  type AdminDashboardStats,
} from '../../services/dashboard.service';

export function ReportsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);

  const [adminStats, setAdminStats] = useState<AdminDashboardStats | null>(null);
  const [complaintBreakdown, setComplaintBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [visitorBreakdown, setVisitorBreakdown] = useState<{ status: string; count: number }[]>([]);
  const [collection, setCollection] = useState(0);

  const [superStats, setSuperStats] = useState<{ totalSocieties: number; totalAdmins: number; totalResidents: number } | null>(
    null
  );

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    async function load() {
      if (isSuperAdmin) {
        setSuperStats(await getSuperAdminStats());
      } else if (user?.societyId) {
        const [stats, breakdown, visitors, paid] = await Promise.all([
          getAdminDashboardStats(user.societyId),
          getComplaintStatusBreakdown(user.societyId),
          getVisitorStatusBreakdown(user.societyId),
          getPaymentCollectionThisMonth(user.societyId),
        ]);
        setAdminStats(stats);
        setComplaintBreakdown(breakdown);
        setVisitorBreakdown(visitors);
        setCollection(paid);
      }
      setLoading(false);
    }
    load();
  }, [user?.societyId, isSuperAdmin]);

  if (loading) return <LoadingOverlay label="Loading reports..." />;

  if (isSuperAdmin && superStats) {
    return (
      <ScreenContainer scroll>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          Platform Overview
        </Text>
        <View style={styles.grid}>
          <StatCard icon="domain" label="Total Societies" value={superStats.totalSocieties} color={colors.primary} />
          <StatCard icon="account-tie" label="Total Admins" value={superStats.totalAdmins} color={colors.secondary} />
          <StatCard icon="account-group" label="Total Residents" value={superStats.totalResidents} color={colors.info} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
        Society Reports
      </Text>

      <View style={styles.grid}>
        <StatCard icon="cash-multiple" label="Collected This Month" value={`₹${collection}`} color={colors.success} />
        <StatCard icon="account-alert-outline" label="Defaulters" value={adminStats?.defaulterCount ?? 0} color={colors.danger} />
        <StatCard icon="account-group" label="Total Residents" value={adminStats?.totalResidents ?? 0} color={colors.info} />
        <StatCard icon="account-clock-outline" label="Pending Approvals" value={adminStats?.pendingApprovals ?? 0} color={colors.warning} />
      </View>

      {complaintBreakdown.some((b) => b.count > 0) ? (
        <ComplaintBreakdownChart data={complaintBreakdown} />
      ) : null}

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: colors.text }]}>
        Visitor Analytics
      </Text>
      <View style={styles.grid}>
        {visitorBreakdown.map((v) => (
          <StatCard key={v.status} icon="account-arrow-right-outline" label={v.status.replace('_', ' ')} value={v.count} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16 },
  sectionTitle: { fontWeight: '700', marginTop: 8, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
