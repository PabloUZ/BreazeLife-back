import { StyleSheet, Text, View } from "react-native";
import type { AdminAlertItemDto } from "@/src/dtos/admin/admin.dtos";
import {
  formatAlertType,
  getAlertSeverityColors,
  getAlertSeverityLabel,
} from "@/src/components/admin/notifications/notificationUtils";

type AdminAlertCardProps = {
  alert: AdminAlertItemDto;
};

export default function AdminAlertCard({ alert }: AdminAlertCardProps) {
  const colors = getAlertSeverityColors(alert.severity);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={[styles.type, { color: colors.color }]}>
            {formatAlertType(alert.type)}
          </Text>
          <Text style={styles.message}>{alert.message}</Text>
        </View>

        <View style={styles.badgesColumn}>
          <View style={[styles.severityBadge, { backgroundColor: "#FFFFFF99" }]}>
            <Text style={[styles.severityText, { color: colors.color }]}>
              {getAlertSeverityLabel(alert.severity)}
            </Text>
          </View>
          {alert.count !== undefined ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{alert.count}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
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
    gap: 6,
  },
  type: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  message: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    fontWeight: "600",
  },
  badgesColumn: {
    alignItems: "flex-end",
    gap: 8,
  },
  severityBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  severityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
});
