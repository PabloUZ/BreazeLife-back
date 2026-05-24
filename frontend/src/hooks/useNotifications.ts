import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/src/context/AuthContext";
import { notificationSocket } from "@/src/services/ws/notificationSocket";
import {
  deleteNotification as deleteNotificationApi,
  getNotifications,
  markNotificationAsRead,
} from "@/src/services/api/notificationService";
import type { NotificationDto } from "@/src/dtos/notification/notification.dtos";

type UseNotificationsReturn = {
  notifications: NotificationDto[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useNotifications(): UseNotificationsReturn {
  const { state } = useAuthContext();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Evita que el effect de cleanup intente desconectar si nunca llegó a conectar
  const didConnect = useRef(false);

  // ─── Cargar historial vía REST ─────────────────────────────────────────────

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getNotifications(state.role);
      setNotifications(items);
    } catch {
      // Si falla el historial, se muestra vacío; el WS sigue funcionando
    } finally {
      setIsLoading(false);
    }
  }, [state.role]);

  // ─── Conectar WebSocket ────────────────────────────────────────────────────

  useEffect(() => {
    if (!state.accessToken) return;

    loadNotifications();

    notificationSocket.connect(
      state.accessToken,
      // onMessage: anteponer la nueva notificación a la lista
      (incoming) => {
        setNotifications((prev) => {
          // Evitar duplicados si el backend envía el mismo id
          if (prev.some((n) => n.notification_id === incoming.notification_id)) {
            return prev;
          }
          return [incoming, ...prev];
        });
      },
      // onConnect
      () => {
        didConnect.current = true;
        setIsConnected(true);
      },
      // onError
      () => {
        setIsConnected(false);
      }
    );

    return () => {
      // Siempre desconectar al salir, aunque nunca llegara a conectar,
      // para evitar que el cliente STOMP quede reintentando en segundo plano.
      notificationSocket.disconnect();
      didConnect.current = false;
      setIsConnected(false);
    };
  }, [state.accessToken, state.role]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Marcar como leída ─────────────────────────────────────────────────────

  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === notificationId ? { ...n, read: true } : n
        )
      );

      try {
        await markNotificationAsRead(state.role, notificationId);
      } catch {
        // Revertir si falla
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === notificationId ? { ...n, read: false } : n
          )
        );
      }
    },
    [state.role]
  );

  // ─── Eliminar notificación ─────────────────────────────────────────────────

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      // Optimistic update: quitar de la lista inmediatamente
      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== notificationId)
      );

      try {
        await deleteNotificationApi(state.role, notificationId);
      } catch {
        // Si falla, recargar el historial desde el servidor
        loadNotifications();
      }
    },
    [state.role, loadNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    deleteNotification,
    refresh: loadNotifications,
  };
}
