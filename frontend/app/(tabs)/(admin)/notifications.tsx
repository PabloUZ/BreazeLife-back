import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminAlertCard from "@/src/components/admin/notifications/AdminAlertCard";
import AdminNotificationCard from "@/src/components/admin/notifications/AdminNotificationCard";
import { sortNotifications } from "@/src/components/admin/notifications/notificationUtils";
import ScreenContainer from "@/src/components/layout/ScreenContainer";
import type {
  AdminAlertItemDto,
  AdminNotificationDto,
} from "@/src/dtos/admin/admin.dtos";
import type { ApiErrorResponseDto } from "@/src/dtos/auth/auth.dtos";
import { useAuth } from "@/src/hooks/useAuth";
import { useFocusEffect, useRouter } from "expo-router";
import { getAdminDashboardAlerts } from "@/src/services/api/adminDashboardService";
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
} from "@/src/services/api/adminNotificationService";

const NOTIFICATIONS_PAGE_SIZE = 20;

function mapErrorToMessage(error: ApiErrorResponseDto): string {
  if (error.status_code === 401) {
    return "Tu sesion expiro. Inicia sesion nuevamente.";
  }
  if (error.status_code === 403) {
    return "No tienes permisos para ver esta informacion administrativa.";
  }
  if (error.status_code === 404) {
    return "El recurso solicitado no fue encontrado.";
  }

  return error.message || "No se pudo cargar la informacion. Intenta de nuevo.";
}

export default function AdminNotificationsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [alerts, setAlerts] = useState<AdminAlertItemDto[]>([]);
  const [notifications, setNotifications] = useState<AdminNotificationDto[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  const sortedNotifications = useMemo(
    () => sortNotifications(notifications),
    [notifications]
  );
  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const handleUnauthorized = useCallback(async () => {
    Alert.alert(
      "Sesion expirada",
      "Tu sesion expiro. Inicia sesion nuevamente para continuar."
    );
    await signOut();
    router.replace("/(auth)/login");
  }, [router, signOut]);

  const loadAlerts = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setAlertsLoading(true);
        }
        setAlertsError(null);

        const response = await getAdminDashboardAlerts();
        setAlerts(response.alerts ?? []);
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (apiError.status_code === 401) {
          await handleUnauthorized();
          return;
        }

        setAlertsError(mapErrorToMessage(apiError));
      } finally {
        setAlertsLoading(false);
      }
    },
    [handleUnauthorized]
  );

  const loadNotifications = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setNotificationsLoading(true);
        }
        setNotificationsError(null);

        const response = await getAdminNotifications({
          page: 1,
          limit: NOTIFICATIONS_PAGE_SIZE,
        });
        setNotifications(response.notifications ?? []);
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (apiError.status_code === 401) {
          await handleUnauthorized();
          return;
        }

        setNotificationsError(mapErrorToMessage(apiError));
      } finally {
        setNotificationsLoading(false);
      }
    },
    [handleUnauthorized]
  );

  const loadAll = useCallback(
    async (silent = false) => {
      if (silent && hasLoadedOnceRef.current) {
        setIsRefreshing(true);
      }

      await Promise.all([loadAlerts(silent), loadNotifications(silent)]);
      hasLoadedOnceRef.current = true;
      setIsRefreshing(false);
    },
    [loadAlerts, loadNotifications]
  );

  useFocusEffect(
    useCallback(() => {
      loadAll(hasLoadedOnceRef.current);
    }, [loadAll])
  );

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      try {
        setMarkingReadId(notificationId);

        const updatedNotification = await markAdminNotificationAsRead(notificationId);
        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === notificationId ? updatedNotification : notification
          )
        );

        await loadAlerts(true);
      } catch (rawError) {
        const apiError = rawError as ApiErrorResponseDto;

        if (apiError.status_code === 401) {
          await handleUnauthorized();
          return;
        }

        Alert.alert("Error", mapErrorToMessage(apiError));
      } finally {
        setMarkingReadId(null);
      }
    },
    [handleUnauthorized, loadAlerts]
  );

  const isInitialLoading =
    !hasLoadedOnceRef.current && alertsLoading && notificationsLoading;

  if (isInitialLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#369BC9" />
          <Text style={styles.loadingText}>Cargando alertas y notificaciones...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadAll(true)} />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Alertas y notificaciones</Text>
            <Text style={styles.subtitle}>
              Revisa eventos administrativos, pendientes y avisos recientes desde
              la app.
            </Text>
          </View>

          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas del dashboard</Text>

          {alertsLoading ? (
            <View style={styles.sectionCentered}>
              <ActivityIndicator size="small" color="#369BC9" />
              <Text style={styles.sectionLoadingText}>Cargando alertas...</Text>
            </View>
          ) : alertsError ? (
            <View style={styles.sectionCentered}>
              <Text style={styles.errorText}>{alertsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadAlerts(false)}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : alerts.length === 0 ? (
            <View style={styles.sectionCentered}>
              <Text style={styles.emptyTitle}>No hay alertas disponibles</Text>
              <Text style={styles.emptySubtitle}>
                No hay alertas administrativas activas en este momento.
              </Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <AdminAlertCard
                key={`${alert.type}-${alert.message}`}
                alert={alert}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificaciones del administrador</Text>

          {notificationsLoading ? (
            <View style={styles.sectionCentered}>
              <ActivityIndicator size="small" color="#369BC9" />
              <Text style={styles.sectionLoadingText}>
                Cargando notificaciones...
              </Text>
            </View>
          ) : notificationsError ? (
            <View style={styles.sectionCentered}>
              <Text style={styles.errorText}>{notificationsError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadNotifications(false)}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : sortedNotifications.length === 0 ? (
            <View style={styles.sectionCentered}>
              <Text style={styles.emptyTitle}>No hay notificaciones</Text>
              <Text style={styles.emptySubtitle}>
                No hay notificaciones para mostrar en este momento.
              </Text>
            </View>
          ) : (
            sortedNotifications.map((notification) => (
              <AdminNotificationCard
                key={notification.id}
                notification={notification}
                isMarkingRead={markingReadId === notification.id}
                onMarkAsRead={() => handleMarkAsRead(notification.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  content: {
    paddingBottom: 24,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  unreadBadge: {
    minWidth: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionCentered: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5EEF5",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLoadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#369BC9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});
