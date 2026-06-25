import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';
import { useAppTheme } from '../../context/ThemeContext';
import { COMPLAINT_STATUS_LABELS } from '../../constants';

interface Props {
  data: { status: string; count: number }[];
}

export function ComplaintBreakdownChart({ data }: Props) {
  const { colors } = useAppTheme();
  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 0,
          color: () => colors.primary,
          labelColor: () => colors.textMuted,
          barPercentage: 0.6,
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 16 },
  title: { fontWeight: '700', marginBottom: 4 },
  chart: { borderRadius: 12 },
});
