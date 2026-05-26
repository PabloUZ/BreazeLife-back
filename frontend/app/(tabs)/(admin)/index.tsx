import AdminScreenContainer from "@/src/components/layout/AdminScreenContainer";
import MoreMenuList, { type MoreMenuItem } from "@/src/components/common/MoreMenuList";

const MORE_ITEMS: MoreMenuItem[] = [
  {
    title: "Graficas",
    description: "Consulta la vista de reportes y tendencias del sistema.",
    href: "/(tabs)/(admin)/reports",
    iconName: "bar-chart-outline",
  },
  {
    title: "Perfil",
    description: "Accede a la informacion del administrador y a sus datos de sesion.",
    href: "/(tabs)/(admin)/profile",
    iconName: "person-outline",
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
  {
    title: "Empleadores",
    description: "Consulta la vista secundaria de empleadores registrados.",
    href: "/(tabs)/(admin)/employers",
    iconName: "business-outline",
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
