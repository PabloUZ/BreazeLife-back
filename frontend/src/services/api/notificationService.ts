import { httpClient } from "@/src/config/http";
import type { AppRole } from "@/src/context/AuthContext";
import type { MarkReadResponseDto, NotificationDto } from "@/src/dtos/notification/notification.dtos";

// Mapea el role de la app al segmento de ruta de la API
const ROLE_PATH: Record<Exclude<AppRole, "guest">, string> = {
  affiliate: "affiliate",
  employer:  "employer",
  admin:     "admin",
};

/**
 * Devuelve la lista de notificaciones del usuario autenticado.
 * Normaliza las distintas shapes que devuelve cada rol.
 */
export async function getNotifications(role: AppRole): Promise<NotificationDto[]> {
  const path = ROLE_PATH[role as Exclude<AppRole, "guest">];
  if (!path) return [];

  const response = await httpClient.get(`/api/v1/${path}/notifications`);
  const body = response.data;

  // Employer devuelve un array plano; affiliate y admin devuelven { data: { items } }
  if (Array.isArray(body)) return body as NotificationDto[];
  if (Array.isArray(body?.data?.items)) return body.data.items as NotificationDto[];
  return [];
}

/**
 * Dispara una notificación de prueba via el endpoint de test del backend.
 * Requiere que @RestController esté activo en NotificationTestController.java
 */
export async function fireTestNotification(): Promise<void> {
  await httpClient.post("/api/v1/test/notifications/fire");
}

/**
 * Marca una notificación como leída.
 */
export async function markNotificationAsRead(
  role: AppRole,
  notificationId: string
): Promise<MarkReadResponseDto> {
  const path = ROLE_PATH[role as Exclude<AppRole, "guest">];
  const response = await httpClient.patch<MarkReadResponseDto>(
    `/api/v1/${path}/notifications/${notificationId}/read`
  );
  return response.data;
}
