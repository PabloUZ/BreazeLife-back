import { ScrollView, StyleSheet, Text, View } from "react-native";
import DashboardChartCard from "@/src/components/admin/charts/DashboardChartCard";
import {
  formatCurrency,
  formatMonthLabel,
} from "@/src/components/admin/charts/chartUtils";
import type { MonthlyContributionGraphItemDto } from "@/src/dtos/admin/admin.dtos";

type MonthlyContributionsChartProps = {
  data: MonthlyContributionGraphItemDto[];
};

export default function MonthlyContributionsChart({
  data,
}: MonthlyContributionsChartProps) {
  const maxValue = data.reduce(
    (highest, item) => Math.max(highest, item.totalContribution),
    0
  );
  const isEmpty = data.length === 0 || maxValue === 0;

  return (
    <DashboardChartCard
      title="Aportes mensuales"
      subtitle="Evolución de los aportes consolidados por mes."
      isEmpty={isEmpty}
      emptyMessage="No hay aportes mensuales para graficar todavía."
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContent}>
          {data.map((item) => {
            const barHeight = maxValue > 0 ? (item.totalContribution / maxValue) * 140 : 0;

            return (
              <View key={item.month} style={styles.barColumn}>
                <Text style={styles.valueText}>
                  {formatCurrency(item.totalContribution)}
                </Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: Math.max(barHeight, 8) }]} />
                </View>
                <Text style={styles.monthText}>{formatMonthLabel(item.month)}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </DashboardChartCard>
  );
}

const styles = StyleSheet.create({
  chartContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 14,
    paddingRight: 12,
  },
  barColumn: {
    width: 78,
    alignItems: "center",
    gap: 8,
  },
  valueText: {
    fontSize: 11,
    color: "#4B5563",
    textAlign: "center",
    minHeight: 32,
  },
  barTrack: {
    width: 30,
    height: 140,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: "#369BC9",
    borderRadius: 999,
  },
  monthText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
});
