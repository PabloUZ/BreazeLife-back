import { StyleSheet, Text, View } from "react-native";
import DashboardChartCard from "@/src/components/admin/charts/DashboardChartCard";
import {
  formatCurrency,
  getPercent,
} from "@/src/components/admin/charts/chartUtils";
import type { FundDistributionGraphItemDto } from "@/src/dtos/admin/admin.dtos";

type FundDistributionChartProps = {
  data: FundDistributionGraphItemDto[];
};

const FUND_META = {
  PAYROLL: { color: "#0F766E", label: "Payroll" },
  PENSION: { color: "#4F46E5", label: "Pensión" },
} as const;

export default function FundDistributionChart({
  data,
}: FundDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.totalBalance, 0);
  const isEmpty = data.length === 0 || total === 0;

  return (
    <DashboardChartCard
      title="Distribución de fondos"
      subtitle="Participación del saldo administrado por tipo de fondo."
      isEmpty={isEmpty}
      emptyMessage="No hay distribución de fondos para representar."
    >
      <View style={styles.container}>
        <View style={styles.segmentedBar}>
          {data.map((item) => (
            <View
              key={item.fundType}
              style={[
                styles.segment,
                {
                  backgroundColor: FUND_META[item.fundType].color,
                  flex: Math.max(item.totalBalance, 1),
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.legendList}>
          {data.map((item) => {
            const percentage = getPercent(item.totalBalance, total);

            return (
              <View key={item.fundType} style={styles.legendRow}>
                <View style={styles.legendLabelGroup}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: FUND_META[item.fundType].color },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {FUND_META[item.fundType].label}
                  </Text>
                </View>
                <View style={styles.valuesGroup}>
                  <Text style={styles.legendValue}>
                    {formatCurrency(item.totalBalance)}
                  </Text>
                  <Text style={styles.legendPercent}>{percentage}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </DashboardChartCard>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  segmentedBar: {
    flexDirection: "row",
    height: 24,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  segment: {
    height: "100%",
  },
  legendList: {
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  legendLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  valuesGroup: {
    alignItems: "flex-end",
  },
  legendValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  legendPercent: {
    fontSize: 12,
    color: "#6B7280",
  },
});
