import { useCallback, useEffect, useState } from "react";
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

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const items = await getNotifications(state.role);
      setNotifications(items);
    } catch {
      // Si falla el historial, se mantiene el estado actual y el WS sigue activo.
    } finally {
      setIsLoading(false);
    }
  }, [state.role]);

  useEffect(() => {
    if (!state.accessToken) return;

    loadNotifications();

    const unsubscribe = notificationSocket.subscribe(
      (incoming) => {
        setNotifications((prev) => {
          if (prev.some((item) => item.notification_id === incoming.notification_id)) {
            return prev;
          }

          return [incoming, ...prev];
        });
      },
      (connected) => {
        setIsConnected(connected);
      },
      () => {
        setIsConnected(false);
      }
    );

    notificationSocket.connect(state.accessToken);

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [loadNotifications, state.accessToken]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      try {
        await markNotificationAsRead(state.role, notificationId);
      } catch {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.notification_id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );
      }
    },
    [state.role]
  );

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) =>
        prev.filter((notification) => notification.notification_id !== notificationId)
      );

      try {
        await deleteNotificationApi(state.role, notificationId);
      } catch {
        loadNotifications();
      }
    },
    [loadNotifications, state.role]
  );

  const unreadCount = notifications.filter((notification) => !notification.read).length;

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
