import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { useAppTheme } from '../../context/ThemeContext';
import { GlassSurface } from '../common/GlassSurface';
import { COMPLAINT_STATUS_LABELS } from '../../constants';

interface Props {
  data: { status: string; count: number }[];
}

export function ComplaintBreakdownChart({ data }: Props) {
  const { colors } = useAppTheme();
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <GlassSurface style={styles.shell} contentStyle={styles.card}>
      <Text variant="titleMedium" style={[styles.title, { color: colors.text }]}>
        Complaints by Status
      </Text>
      <BarChart
        data={{
          labels: data.map((d) => COMPLAINT_STATUS_LABELS[d.status]?.split(' ')[0] ?? d.status),
          datasets: [{ data: data.map((d) => d.count) }],
        }}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        showValuesOnTopOfBars
        chartConfig={{
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          backgroundColor: 'transparent',
          decimalPlaces: 0,
          color: () => colors.primary,
          labelColor: () => colors.textMuted,
          barPercentage: 0.6,
        }}
        style={styles.chart}
      />
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  shell: { marginBottom: 16 },
  card: { padding: 12 },
  title: { fontWeight: '700', marginBottom: 4 },
  chart: { borderRadius: 8 },
});
