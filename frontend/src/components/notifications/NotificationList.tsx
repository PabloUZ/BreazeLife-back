import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNotifications } from "@/src/hooks/useNotifications";
import { fireTestNotification } from "@/src/services/api/notificationService";

export default function NotificationList() {
  const { notifications, unreadCount, isLoading, isConnected, markAsRead, refresh } =
    useNotifications();

  const [firing, setFiring] = useState(false);

  async function handleFireTest() {
    try {
      setFiring(true);
      await fireTestNotification();
    } catch {
      // El error no es crítico; el botón vuelve a su estado normal
    } finally {
      setFiring(false);
    }
  }

  // ─── Estados de carga y vacío ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#369BC9" />
        <Text style={styles.loadingText}>Cargando notificaciones…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {/* Indicador de conexión */}
        <View style={styles.connectionRow}>
          <View
            style={[
              styles.dot,
              isConnected ? styles.dotConnected : styles.dotDisconnected,
            ]}
          />
          <Text style={styles.connectionText}>
            {isConnected ? "En vivo" : "Sin conexión"}
          </Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.notification_id}
        contentContainerStyle={
          notifications.length === 0 ? styles.emptyContainer : styles.listContent
        }
        onRefresh={refresh}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>Sin notificaciones</Text>
            <Text style={styles.emptySubtitle}>
              Las notificaciones nuevas aparecerán aquí en tiempo real.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.read && styles.cardUnread]}
            activeOpacity={0.7}
            onPress={() => {
              if (!item.read) markAsRead(item.notification_id);
            }}
          >
            {/* Punto de no leída */}
            {!item.read && <View style={styles.unreadDot} />}

            <View style={styles.cardContent}>
              <Text
                style={[styles.cardMessage, !item.read && styles.cardMessageUnread]}
              >
                {item.message}
              </Text>
              <Text style={styles.cardId}>{item.notification_id}</Text>
            </View>

            {!item.read && (
              <Text style={styles.tapHint}>Toca para marcar como leída</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Botón de prueba flotante */}
      <TouchableOpacity
        style={[styles.fabTest, firing && styles.fabTestDisabled]}
        onPress={handleFireTest}
        disabled={firing}
        activeOpacity={0.8}
      >
        {firing
          ? <ActivityIndicator size="small" color="#FFFFFF" />
          : <Text style={styles.fabTestText}>🧪 Disparar notif</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: "#16A34A",
  },
  dotDisconnected: {
    backgroundColor: "#9CA3AF",
  },
  connectionText: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Lista
  listContent: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    maxWidth: 260,
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    position: "relative",
  },
  cardUnread: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: "#369BC9",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#369BC9",
  },
  cardContent: {
    gap: 4,
    paddingRight: 16,
  },
  cardMessage: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  cardMessageUnread: {
    fontWeight: "600",
    color: "#111827",
  },
  cardId: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  tapHint: {
    fontSize: 11,
    color: "#369BC9",
    marginTop: 8,
  },

  // Botón flotante de prueba
  fabTest: {
    position: "absolute",
    bottom: 24,
    right: 20,
    backgroundColor: "#6366F1",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  fabTestDisabled: {
    backgroundColor: "#A5B4FC",
  },
  fabTestText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
