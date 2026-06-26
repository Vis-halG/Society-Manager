import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, RadioButton, Text } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { GlassSurface } from '../../components/common/GlassSurface';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants';
import { recalculateFineIfOverdue, recordPayment } from '../../services/maintenance.service';
import { formatDate, formatDateTime } from '../../utils/date';
import type { MaintenanceBill, Payment } from '../../types';
import type { MaintenanceStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<MaintenanceStackParamList, 'BillDetail'>;

const PAYMENT_METHODS: { value: Payment['method']; label: string }[] = [
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
];

export function BillDetailScreen({ route }: Props) {
  const { billId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [bill, setBill] = useState<MaintenanceBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [payDialogVisible, setPayDialogVisible] = useState(false);
  const [method, setMethod] = useState<Payment['method']>('upi');
  const [paying, setPaying] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    getDoc(doc(db, COLLECTIONS.MAINTENANCE_BILLS, billId)).then(async (snap) => {
      if (snap.exists()) {
        let data = { id: snap.id, ...snap.data() } as MaintenanceBill;
        data = await recalculateFineIfOverdue(data);
        setBill(data);
      }
      setLoading(false);
    });
  }, [billId]);

  const handlePay = async () => {
    if (!bill) return;
    setPaying(true);
    try {
      await recordPayment({ bill, method });
      setBill({ ...bill, status: 'paid' });
      setPayDialogVisible(false);
    } finally {
      setPaying(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!bill) return;
    await Share.share({
      message:
        `Maintenance Receipt\nFlat: ${bill.flatNumber}\nMonth: ${bill.billMonth}\n` +
        `Amount: ₹${bill.amount}\nFine: ₹${bill.fineAmount}\nTotal Paid: ₹${bill.totalAmount}\n` +
        `Status: ${bill.status.toUpperCase()}\nPaid On: ${bill.paidAt ? formatDateTime(bill.paidAt) : '-'}`,
    });
  };

  if (loading) return <LoadingOverlay />;
  if (!bill) return <Text style={styles.notFound}>Bill not found.</Text>;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          ₹{bill.totalAmount}
        </Text>
        <StatusBadge status={bill.status} />
      </View>
      <Text style={{ color: colors.textMuted, marginBottom: 24 }}>
        {bill.billMonth} maintenance for {bill.flatNumber}
      </Text>

      <GlassSurface contentStyle={styles.detailsCard}>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Base Amount</Text>
        <Text style={{ color: colors.text }}>₹{bill.amount}</Text>
      </View>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Fine</Text>
        <Text style={{ color: colors.danger }}>₹{bill.fineAmount}</Text>
      </View>
      <View style={[styles.row, { borderColor: colors.border }]}>
        <Text style={{ color: colors.textMuted }}>Due Date</Text>
        <Text style={{ color: colors.text }}>{formatDate(bill.dueDate)}</Text>
      </View>
      {bill.paidAt ? (
        <View style={[styles.row, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Paid On</Text>
          <Text style={{ color: colors.text }}>{formatDateTime(bill.paidAt)}</Text>
        </View>
      ) : null}
      </GlassSurface>

      {bill.status !== 'paid' ? (
        <Button mode="contained" style={styles.actionBtn} onPress={() => setPayDialogVisible(true)}>
          {isAdmin ? 'Mark as Paid' : 'Pay Now'}
        </Button>
      ) : (
        <Button mode="outlined" icon="download-outline" style={styles.actionBtn} onPress={handleShareReceipt}>
          Download Receipt
        </Button>
      )}

      <Portal>
        <Dialog visible={payDialogVisible} onDismiss={() => setPayDialogVisible(false)}>
          <Dialog.Title>{isAdmin ? 'Mark Payment' : 'Choose Payment Method'}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(v) => setMethod(v as Payment['method'])} value={method}>
              {PAYMENT_METHODS.map((m) => (
                <RadioButton.Item key={m.value} label={m.label} value={m.value} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPayDialogVisible(false)}>Cancel</Button>
            <Button onPress={handlePay} loading={paying}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontWeight: '700' },
  detailsCard: { paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actionBtn: { marginTop: 24 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
