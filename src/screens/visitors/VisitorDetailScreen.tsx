import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  checkInVisitor,
  checkOutVisitor,
  getVisitorById,
  setVisitorApproval,
} from '../../services/visitors.service';
import { formatDateTime } from '../../utils/date';
import type { Visitor } from '../../types';
import type { VisitorsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<VisitorsStackParamList, 'VisitorDetail'>;

export function VisitorDetailScreen({ route }: Props) {
  const { visitorId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isSecurity = user?.role === 'security';

  const load = () => getVisitorById(visitorId).then(setVisitor);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [visitorId]);

  const handleApprove = async (approved: boolean) => {
    setActing(true);
    try {
      await setVisitorApproval(visitorId, approved);
      await load();
    } finally {
      setActing(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user || !visitor) return;
    setActing(true);
    try {
      await checkInVisitor(visitor, user.id);
      await load();
    } finally {
      setActing(false);
    }
  };

  const handleCheckOut = async () => {
    setActing(true);
    try {
      await checkOutVisitor(visitorId);
      await load();
    } finally {
      setActing(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!visitor) return <Text style={styles.notFound}>Visitor not found.</Text>;

  return (
    <ScreenContainer scroll>
      <View style={styles.qrWrap}>
        <View style={styles.qrCard}>
          <QRCode value={visitor.qrCode || visitor.id} size={180} />
        </View>
        <StatusBadge status={visitor.status} />
      </View>

      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Name</Text>
        <Text style={{ color: colors.text }}>{visitor.visitorName}</Text>
      </View>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Phone</Text>
        <Text style={{ color: colors.text }}>{visitor.visitorPhone}</Text>
      </View>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Purpose</Text>
        <Text style={{ color: colors.text }}>{visitor.purpose}</Text>
      </View>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Host Flat</Text>
        <Text style={{ color: colors.text }}>{visitor.hostFlatNumber}</Text>
      </View>
      {visitor.entryTime ? (
        <View style={[styles.row, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Entry Time</Text>
          <Text style={{ color: colors.text }}>{formatDateTime(visitor.entryTime)}</Text>
        </View>
      ) : null}
      {visitor.exitTime ? (
        <View style={[styles.row, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Exit Time</Text>
          <Text style={{ color: colors.text }}>{formatDateTime(visitor.exitTime)}</Text>
        </View>
      ) : null}

      {isAdmin && visitor.status === 'pending' ? (
        <View style={styles.actionsRow}>
          <Button mode="contained" style={styles.actionBtn} onPress={() => handleApprove(true)} loading={acting}>
            Approve
          </Button>
          <Button mode="outlined" textColor={colors.danger} style={styles.actionBtn} onPress={() => handleApprove(false)} loading={acting}>
            Reject
          </Button>
        </View>
      ) : null}

      {isSecurity && visitor.status === 'approved' ? (
        <Button mode="contained" style={styles.submit} onPress={handleCheckIn} loading={acting}>
          Approve Entry
        </Button>
      ) : null}
      {isSecurity && visitor.status === 'checked_in' ? (
        <Button mode="contained" style={styles.submit} onPress={handleCheckOut} loading={acting}>
          Log Exit
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  qrWrap: { alignItems: 'center', marginBottom: 24, gap: 12 },
  qrCard: { padding: 16, backgroundColor: '#fff', borderRadius: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  actionBtn: { flex: 1 },
  submit: { marginTop: 24 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
