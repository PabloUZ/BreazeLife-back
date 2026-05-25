import { StyleSheet, Text, View } from "react-native";
import DashboardChartCard from "@/src/components/admin/charts/DashboardChartCard";
import { getPercent } from "@/src/components/admin/charts/chartUtils";
import type { QuoteStatusGraphItemDto } from "@/src/dtos/admin/admin.dtos";

type QuotesByStatusChartProps = {
  data: QuoteStatusGraphItemDto[];
};

const STATUS_META = {
  PENDING: { color: "#F59E0B", label: "Pendientes" },
  ACCEPTED: { color: "#16A34A", label: "Aceptadas" },
  REJECTED: { color: "#DC2626", label: "Rechazadas" },
} as const;

export default function QuotesByStatusChart({
  data,
}: QuotesByStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const isEmpty = data.length === 0 || total === 0;

  return (
    <DashboardChartCard
      title="Cotizaciones por estado"
      subtitle="Distribución general del flujo de cotizaciones registradas."
      isEmpty={isEmpty}
      emptyMessage="No hay cotizaciones para representar en este momento."
    >
      <View style={styles.container}>
        <View style={styles.segmentedBar}>
          {data.map((item) => (
            <View
              key={item.status}
              style={[
                styles.segment,
                {
                  backgroundColor: STATUS_META[item.status].color,
                  flex: Math.max(item.count, 1),
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.legendList}>
          {data.map((item) => {
            const percentage = getPercent(item.count, total);

            return (
              <View key={item.status} style={styles.legendRow}>
                <View style={styles.legendLabelGroup}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: STATUS_META[item.status].color },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {STATUS_META[item.status].label}
                  </Text>
                </View>
                <Text style={styles.legendValue}>
                  {item.count} ({percentage}%)
                </Text>
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
    gap: 10,
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
  legendValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
});
