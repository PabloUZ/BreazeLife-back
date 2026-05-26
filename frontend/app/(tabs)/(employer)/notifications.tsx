import NotificationList from "@/src/components/notifications/NotificationList";
import { spacing } from "@/src/theme";

export default function EmployerNotificationsScreen() {
  return <NotificationList contentStyle={{ paddingTop: spacing.xxxl + spacing.md }} />;
}
