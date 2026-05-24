import { StyleSheet, Text, View } from "react-native";

type NotificationStatusBadgeProps = {
  isRead: boolean;
};

export default function NotificationStatusBadge({
  isRead,
}: NotificationStatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        isRead ? styles.badgeRead : styles.badgeUnread,
      ]}
    >
      <Text
        style={[
          styles.label,
          isRead ? styles.labelRead : styles.labelUnread,
        ]}
      >
        {isRead ? "Leida" : "No leida"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  badgeUnread: {
    backgroundColor: "#DBEAFE",
  },
  badgeRead: {
    backgroundColor: "#E5E7EB",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  labelUnread: {
    color: "#1D4ED8",
  },
  labelRead: {
    color: "#4B5563",
  },
});
