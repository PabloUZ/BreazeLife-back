import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import MoreMenuList, { type MoreMenuItem } from "@/src/components/common/MoreMenuList";

const MORE_ITEMS: MoreMenuItem[] = [
  {
    title: "Alertas",
    description: "Supervisa notificaciones y alertas administrativas.",
    href: "/(tabs)/(admin)/notifications",
    iconName: "notifications-outline",
  },
  {
    title: "Graficas",
    description: "Consulta la vista de reportes y tendencias del sistema.",
    href: "/(tabs)/(admin)/reports",
    iconName: "bar-chart-outline",
  },
  {
    title: "Rentabilidad",
    description: "Revisa el modulo de seguimiento de rentabilidad.",
    href: "/(tabs)/(admin)/profitability",
    iconName: "trending-up-outline",
  },
  {
    title: "Configuracion",
    description: "Administra los parametros globales del sistema.",
    href: "/(tabs)/(admin)/settings",
    iconName: "settings-outline",
  },
];

export default function AdminIndexScreen() {
  return (
    <AdminScreenContainer>
      <MoreMenuList
        title="Mas opciones"
        subtitle="Accede a secciones secundarias del panel sin saturar la barra principal."
        items={MORE_ITEMS}
      />
    </AdminScreenContainer>
  );
}
