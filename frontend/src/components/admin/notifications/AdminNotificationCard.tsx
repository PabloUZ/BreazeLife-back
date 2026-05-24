import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NotificationStatusBadge from "@/src/components/admin/notifications/NotificationStatusBadge";
import { formatNotificationDate } from "@/src/components/admin/notifications/notificationUtils";
import type { AdminNotificationDto } from "@/src/dtos/admin/admin.dtos";

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
    <View
      style={[
        styles.card,
        notification.isRead ? styles.cardRead : styles.cardUnread,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {!notification.isRead ? <View style={styles.unreadDot} /> : null}
          <NotificationStatusBadge isRead={notification.isRead} />
        </View>
        <Text style={styles.createdAt}>
          {formatNotificationDate(notification.createdAt)}
        </Text>
      </View>

      <Text
        style={[styles.message, !notification.isRead && styles.messageUnread]}
      >
        {notification.message}
      </Text>

      <Text style={styles.notificationId}>{notification.id}</Text>

      {!notification.isRead ? (
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
      ) : (
        <Text style={styles.readHint}>Notificacion leida</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    gap: 12,
  },
  cardUnread: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  cardRead: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#369BC9",
  },
  createdAt: {
    fontSize: 12,
    color: "#6B7280",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 21,
  },
  messageUnread: {
    color: "#111827",
    fontWeight: "600",
  },
  notificationId: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  markButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#369BC9",
    justifyContent: "center",
    alignItems: "center",
  },
  markButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  readHint: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
