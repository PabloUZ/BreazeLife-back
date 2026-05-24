import type {
  AdminAlertSeverity,
  AdminNotificationDto,
} from "@/src/dtos/admin/admin.dtos";
import { formatDateTime } from "@/src/components/admin/quotes/quoteUtils";

export function formatNotificationDate(dateString?: string | null): string {
  return formatDateTime(dateString);
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
      return { backgroundColor: "#DBEAFE", color: "#1D4ED8" };
    case "WARNING":
      return { backgroundColor: "#FEF3C7", color: "#B45309" };
    case "ERROR":
      return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
    case "SUCCESS":
      return { backgroundColor: "#D1FAE5", color: "#166534" };
    default:
      return { backgroundColor: "#E5E7EB", color: "#374151" };
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
