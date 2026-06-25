import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import { Button, Menu, Text, TouchableRipple } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormInput } from '../../components/common/FormInput';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  assignComplaint,
  getComplaint,
  updateComplaintStatus,
} from '../../services/complaints.service';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES, COMPLAINT_STATUS_LABELS } from '../../constants';
import { formatDateTime } from '../../utils/date';
import type { Complaint } from '../../types';
import type { ComplaintsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ComplaintsStackParamList, 'ComplaintDetail'>;

interface AssignForm {
  assignedToName: string;
}

export function ComplaintDetailScreen({ route, navigation }: Props) {
  const { complaintId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const { control, handleSubmit } = useForm<AssignForm>({ defaultValues: { assignedToName: '' } });

  const isAdmin = user?.role === 'admin';

  const load = () => getComplaint(complaintId).then((c) => setComplaint(c));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [complaintId]);

  const categoryMeta = COMPLAINT_CATEGORIES.find((c) => c.value === complaint?.category);

  const handleStatusChange = async (status: Complaint['status']) => {
    if (!complaint) return;
    setStatusMenuVisible(false);
    setSavingStatus(true);
    try {
      await updateComplaintStatus(complaint, status);
      await load();
    } finally {
      setSavingStatus(false);
    }
  };

  const onAssign = async (values: AssignForm) => {
    if (!values.assignedToName.trim()) return;
    setAssigning(true);
    try {
      await assignComplaint(complaintId, 'staff', values.assignedToName.trim());
      await load();
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (!complaint) return <Text style={styles.notFound}>Complaint not found.</Text>;

  return (
    <ScreenContainer scroll>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={[styles.title, { color: colors.text }]}>
          {complaint.title}
        </Text>
        <StatusBadge status={complaint.status} label={COMPLAINT_STATUS_LABELS[complaint.status]} />
      </View>
      <Text style={{ color: colors.textMuted, marginBottom: 4 }}>
        {categoryMeta?.label} {complaint.flatNumber ? `• ${complaint.flatNumber}` : ''}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>
        Raised by {complaint.raisedByName} • {formatDateTime(complaint.createdAt)}
      </Text>

      <Text variant="bodyLarge" style={[styles.description, { color: colors.text }]}>
        {complaint.description}
      </Text>

      {complaint.images?.length ? (
        <FlatList
          horizontal
          data={complaint.images}
          keyExtractor={(_, i) => `${i}`}
          style={styles.imageList}
          renderItem={({ item }) => (
            <Image source={{ uri: item.url }} style={styles.image} />
          )}
        />
      ) : null}

      {complaint.assignedToName ? (
        <View style={[styles.infoBox, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Assigned to</Text>
          <Text style={{ color: colors.text, fontWeight: '600' }}>{complaint.assignedToName}</Text>
        </View>
      ) : null}

      {complaint.remarks ? (
        <View style={[styles.infoBox, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Remarks</Text>
          <Text style={{ color: colors.text }}>{complaint.remarks}</Text>
        </View>
      ) : null}

      <Button
        mode="outlined"
        icon="chat-outline"
        style={styles.chatBtn}
        onPress={() => navigation.navigate('ComplaintChat', { complaintId })}
      >
        Open Chat
      </Button>

      {isAdmin ? (
        <View style={styles.adminSection}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <TouchableRipple onPress={() => setStatusMenuVisible(true)}>
                <Button mode="contained" loading={savingStatus} style={styles.statusBtn}>
                  Update Status
                </Button>
              </TouchableRipple>
            }
          >
            {COMPLAINT_STATUSES.map((s) => (
              <Menu.Item key={s} title={COMPLAINT_STATUS_LABELS[s]} onPress={() => handleStatusChange(s)} />
            ))}
          </Menu>

          <Text variant="labelLarge" style={[styles.label, { color: colors.text }]}>
            Assign To
          </Text>
          <FormInput control={control} name="assignedToName" label="Staff / Vendor Name" />
          <Button mode="outlined" onPress={handleSubmit(onAssign)} loading={assigning} style={styles.assignBtn}>
            Assign
          </Button>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  title: { fontWeight: '700', flex: 1 },
  description: { lineHeight: 22, marginBottom: 16 },
  imageList: { marginBottom: 16 },
  image: { width: 96, height: 96, borderRadius: 10, marginRight: 8 },
  infoBox: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 },
  chatBtn: { marginTop: 8, marginBottom: 8 },
  adminSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'transparent' },
  statusBtn: { marginBottom: 16 },
  label: { marginBottom: 8 },
  assignBtn: { marginTop: 4, marginBottom: 24 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
