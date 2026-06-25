import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '../../context/ThemeContext';
import { getVisitorById } from '../../services/visitors.service';
import type { VisitorsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<VisitorsStackParamList, 'SecurityScan'>;

export function SecurityScanScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setError(null);
    const visitor = await getVisitorById(data);
    if (!visitor) {
      setError('Invalid or unknown visitor QR code.');
      setTimeout(() => setScanned(false), 1500);
      return;
    }
    navigation.replace('VisitorDetail', { visitorId: visitor.id });
  };

  if (!permission) return <View style={styles.center} />;

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, marginBottom: 16, textAlign: 'center' }}>
          Camera access is needed to scan visitor QR codes.
        </Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={styles.flex}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <View style={[styles.frame, { borderColor: colors.primary }]} />
        <Text style={styles.instructions}>Align the visitor's QR code within the frame</Text>
        {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: { width: 240, height: 240, borderWidth: 3, borderRadius: 16 },
  instructions: { color: '#fff', marginTop: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  errorText: { marginTop: 12, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8, borderRadius: 8 },
});
