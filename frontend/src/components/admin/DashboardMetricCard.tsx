import { StyleSheet, Text, View } from "react-native";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

export default function DashboardMetricCard({
  label,
  value,
  fullWidth,
}: DashboardMetricCardProps) {
  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 120,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFullWidth: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
});
