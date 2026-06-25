import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { EmptyState } from '../../components/common/EmptyState';
import { useAppTheme } from '../../context/ThemeContext';
import { listSocieties } from '../../services/societies.service';
import type { Society } from '../../types';
import type { SuperAdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'ManageSocieties'>;

export function ManageSocietiesScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await listSocieties();
    setSocieties(data);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  if (loading) return <LoadingOverlay label="Loading societies..." />;

  return (
    <ScreenContainer>
      <FlatList
        data={societies}
        keyExtractor={(item) => item.id}
        contentContainerStyle={societies.length === 0 ? styles.flex : undefined}
        ListEmptyComponent={<EmptyState icon="domain" title="No societies yet" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ManageAdmins', { societyId: item.id, societyName: item.name })}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
              <MaterialCommunityIcons name="domain" size={22} color={colors.primary} />
            </View>
            <View style={styles.flex1}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: colors.textMuted }}>{item.city}</Text>
            </View>
            <Text style={{ color: colors.textMuted }}>{item.adminIds.length} admin(s)</Text>
          </TouchableOpacity>
        )}
      />

      <FAB icon="plus" style={styles.fab} onPress={() => navigation.navigate('SocietyForm')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  flex1: { flex: 1 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
