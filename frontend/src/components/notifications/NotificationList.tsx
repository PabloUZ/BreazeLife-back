import { useRef } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "@/src/components/common/AppCard";
import AppEmptyState from "@/src/components/common/AppEmptyState";
import AppHeader from "@/src/components/common/AppHeader";
import AppLoadingState from "@/src/components/common/AppLoadingState";
import AppStatusBadge from "@/src/components/common/AppStatusBadge";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import type { NotificationDto } from "@/src/dtos/notification/notification.dtos";
import { useNotifications } from "@/src/hooks/useNotifications";
import { colors, radius, shadows, spacing, typography } from "@/src/theme";

type SwipeableCardProps = {
  item: NotificationDto;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
};

function SwipeableCard({ item, onMarkRead, onDelete }: SwipeableCardProps) {
  const swipeRef = useRef<Swipeable>(null);

  function handleDelete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeRef.current?.close();
    onDelete(item.notification_id);
  }

  function renderRightActions(
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.7],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={22} color={colors.primaryText} />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.card, !item.read && styles.cardUnread]}
        activeOpacity={0.7}
        onPress={() => {
          if (!item.read) {
            onMarkRead(item.notification_id);
          }
        }}
      >
        {!item.read ? <View style={styles.unreadDot} /> : null}

        <View style={styles.cardContent}>
          <Text
            style={[styles.cardMessage, !item.read && styles.cardMessageUnread]}
          >
            {item.message}
          </Text>
          <Text style={styles.cardId}>{item.notification_id}</Text>
        </View>

        {!item.read ? (
          <Text style={styles.tapHint}>Toca para marcar como leida</Text>
        ) : null}
      </TouchableOpacity>
    </Swipeable>
  );
}

type NotificationListProps = {
  contentStyle?: StyleProp<ViewStyle>;
};

export default function NotificationList({ contentStyle }: NotificationListProps = {}) {
  return <NotificationListContent contentStyle={contentStyle} />;
}

export function NotificationListContent({ contentStyle }: NotificationListProps = {}) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();

  if (isLoading) {
    return <AppLoadingState message="Cargando notificaciones..." />;
  }

  return (
    <ScreenContainer contentStyle={contentStyle}>
      <AppHeader
        title="Notificaciones"
        subtitle="Consulta avisos recientes y mantente al dia con la actividad de tu cuenta."
        rightSlot={
          unreadCount > 0 ? (
            <AppStatusBadge label={String(unreadCount)} tone="danger" />
          ) : undefined
        }
      />

      <AppCard compact style={styles.connectionCard}>
        <View style={styles.connectionRow}>
          <View
            style={[
              styles.dot,
              isConnected ? styles.dotConnected : styles.dotDisconnected,
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? "Conexion en vivo" : "Sin conexion en tiempo real"}
          </Text>
        </View>
      </AppCard>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <AppEmptyState
            title="Sin notificaciones"
            description="Las notificaciones nuevas apareceran aqui en tiempo real."
          />
        }
        renderItem={({ item }) => (
          <SwipeableCard
            item={item}
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
          />
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  connectionCard: {
    ...shadows.soft,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: colors.success,
  },
  dotDisconnected: {
    backgroundColor: colors.textSubtle,
  },
  connectionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  listContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.section,
    gap: spacing.sm,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingTop: spacing.section,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
    position: "relative",
  },
  cardUnread: {
    backgroundColor: colors.surfaceTint,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  unreadDot: {
    position: "absolute",
    top: spacing.lg,
    right: spacing.lg,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardContent: {
    gap: spacing.xs,
    paddingRight: spacing.lg,
  },
  cardMessage: {
    ...typography.body,
    color: colors.neutralText,
  },
  cardMessageUnread: {
    fontWeight: "600",
    color: colors.text,
  },
  cardId: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  tapHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    borderRadius: radius.lg,
    marginLeft: spacing.sm,
  },
});
