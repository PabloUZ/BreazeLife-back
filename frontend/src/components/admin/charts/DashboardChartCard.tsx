import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

type DashboardChartCardProps = PropsWithChildren<{
  emptyMessage?: string;
  isEmpty?: boolean;
  subtitle: string;
  title: string;
}>;

export default function DashboardChartCard({
  children,
  emptyMessage = "Sin datos disponibles para esta gráfica.",
  isEmpty = false,
  subtitle,
  title,
}: DashboardChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {isEmpty ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
  },
  emptyState: {
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
  },
});
