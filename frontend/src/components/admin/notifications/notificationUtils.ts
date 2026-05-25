import { formatDateTime } from "@/src/components/admin/quotes/quoteUtils";
import type {
  AdminAlertSeverity,
  AdminNotificationDto,
} from "@/src/dtos/admin/admin.dtos";

export function formatNotificationDate(dateString?: string | null): string {
  return formatDateTime(dateString);
}

export function formatAlertType(type: string): string {
  switch (type) {
    case "PENDING_QUOTES":
      return "Cotizaciones pendientes";
    case "UNREAD_NOTIFICATIONS":
      return "Notificaciones sin leer";
    default:
      return type
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
  }
}

export function getAlertSeverityLabel(severity: AdminAlertSeverity): string {
  switch (severity) {
    case "INFO":
      return "Info";
    case "WARNING":
      return "Advertencia";
    case "ERROR":
      return "Error";
    case "SUCCESS":
      return "Exito";
    default:
      return severity;
  }
}

export function getAlertSeverityColors(severity: AdminAlertSeverity) {
  switch (severity) {
    case "INFO":
      return { backgroundColor: "#DBEAFE", borderColor: "#93C5FD", color: "#1D4ED8" };
    case "WARNING":
      return { backgroundColor: "#FEF3C7", borderColor: "#FCD34D", color: "#B45309" };
    case "ERROR":
      return { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5", color: "#B91C1C" };
    case "SUCCESS":
      return { backgroundColor: "#D1FAE5", borderColor: "#6EE7B7", color: "#166534" };
    default:
      return { backgroundColor: "#E5E7EB", borderColor: "#D1D5DB", color: "#374151" };
  }
}

export function sortNotifications(
  notifications: AdminNotificationDto[]
): AdminNotificationDto[] {
  return [...notifications].sort((left, right) => {
    if (left.isRead !== right.isRead) {
      return left.isRead ? 1 : -1;
    }

    return (
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  });
}
