import { StyleSheet, Text, View } from "react-native";
import type { AdminAlertItemDto } from "@/src/dtos/admin/admin.dtos";
import {
  getAlertSeverityColors,
  getAlertSeverityLabel,
} from "@/src/components/admin/notifications/notificationUtils";

type AdminAlertCardProps = {
  alert: AdminAlertItemDto;
};

export default function AdminAlertCard({ alert }: AdminAlertCardProps) {
  const colors = getAlertSeverityColors(alert.severity);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.type}>{alert.type}</Text>
          <Text style={styles.message}>{alert.message}</Text>
        </View>

        <View style={[styles.severityBadge, { backgroundColor: colors.backgroundColor }]}>
          <Text style={[styles.severityText, { color: colors.color }]}>
            {getAlertSeverityLabel(alert.severity)}
          </Text>
        </View>
      </View>

      {alert.count !== undefined && (
        <Text style={styles.countText}>Cantidad: {alert.count}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  message: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    fontWeight: "500",
  },
  severityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  countText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
  },
});
