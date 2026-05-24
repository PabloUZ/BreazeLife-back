import { StyleSheet, Text, View } from "react-native";
import DashboardChartCard from "@/src/components/admin/charts/DashboardChartCard";
import { getPercent } from "@/src/components/admin/charts/chartUtils";
import type { AffiliateFundTypeGraphItemDto } from "@/src/dtos/admin/admin.dtos";

type AffiliatesByFundTypeChartProps = {
  data: AffiliateFundTypeGraphItemDto[];
};

const FUND_TYPE_META = {
  CONSERVATIVE: { color: "#2563EB", label: "Conservador" },
  MODERATE: { color: "#369BC9", label: "Moderado" },
  RISKY: { color: "#F97316", label: "Riesgoso" },
} as const;

export default function AffiliatesByFundTypeChart({
  data,
}: AffiliatesByFundTypeChartProps) {
  const maxValue = data.reduce((highest, item) => Math.max(highest, item.count), 0);
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const isEmpty = data.length === 0 || maxValue === 0;

  return (
    <DashboardChartCard
      title="Afiliados por tipo de fondo"
      subtitle="Comparativo de afiliados distribuidos según su perfil de fondo."
      isEmpty={isEmpty}
      emptyMessage="No hay afiliados por tipo de fondo para mostrar."
    >
      <View style={styles.list}>
        {data.map((item) => {
          const fillWidth: `${number}%` =
            maxValue > 0 ? `${(item.count / maxValue) * 100}%` : "0%";
          const percentage = getPercent(item.count, total);

          return (
            <View key={item.fundType} style={styles.row}>
              <View style={styles.headerRow}>
                <View style={styles.labelGroup}>
                  <View
                    style={[
                      styles.dot,
                      { backgroundColor: FUND_TYPE_META[item.fundType].color },
                    ]}
                  />
                  <Text style={styles.label}>
                    {FUND_TYPE_META[item.fundType].label}
                  </Text>
                </View>
                <Text style={styles.value}>
                  {item.count} afiliados ({percentage}%)
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: FUND_TYPE_META[item.fundType].color,
                      width: fillWidth,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </DashboardChartCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },
  row: {
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  track: {
    height: 14,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
