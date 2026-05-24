import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { AdminNotificationDto } from "@/src/dtos/admin/admin.dtos";
import NotificationStatusBadge from "@/src/components/admin/notifications/NotificationStatusBadge";
import { formatNotificationDate } from "@/src/components/admin/notifications/notificationUtils";

type AdminNotificationCardProps = {
  isMarkingRead: boolean;
  notification: AdminNotificationDto;
  onMarkAsRead: () => void;
};

export default function AdminNotificationCard({
  isMarkingRead,
  notification,
  onMarkAsRead,
}: AdminNotificationCardProps) {
  return (
    <View style={[styles.card, !notification.isRead && styles.cardUnread]}>
      <View style={styles.header}>
        <NotificationStatusBadge isRead={notification.isRead} />
        <Text style={styles.createdAt}>
          {formatNotificationDate(notification.createdAt)}
        </Text>
      </View>

      <Text
        style={[styles.message, !notification.isRead && styles.messageUnread]}
      >
        {notification.message}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.notificationId}>{notification.id}</Text>

        {!notification.isRead && (
          <TouchableOpacity
            style={[styles.markButton, isMarkingRead && styles.buttonDisabled]}
            disabled={isMarkingRead}
            onPress={onMarkAsRead}
            activeOpacity={0.8}
          >
            {isMarkingRead ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.markButtonText}>Marcar como leida</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
    gap: 12,
  },
  cardUnread: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: "#369BC9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  createdAt: {
    fontSize: 12,
    color: "#6B7280",
  },
  message: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  messageUnread: {
    color: "#111827",
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  notificationId: {
    fontSize: 11,
    color: "#9CA3AF",
    flex: 1,
  },
  markButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#369BC9",
    justifyContent: "center",
    alignItems: "center",
  },
  markButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
