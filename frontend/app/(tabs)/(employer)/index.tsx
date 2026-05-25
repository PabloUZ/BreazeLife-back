import EmployerScreenContainer from "@/src/components/layout/EmployerScreenContainer";
import MoreMenuList, { type MoreMenuItem } from "@/src/components/common/MoreMenuList";

const MORE_ITEMS: MoreMenuItem[] = [
  {
    title: "Fondos",
    description: "Consulta saldos, movimientos y recargas de fondos.",
    href: "/(tabs)/(employer)/funds",
    iconName: "wallet-outline",
  },
  {
    title: "Alertas",
    description: "Revisa novedades operativas y notificaciones del empleador.",
    href: "/(tabs)/(employer)/notifications",
    iconName: "notifications-outline",
  },
  {
    title: "Reportes",
    description: "Consulta el resumen financiero y operativo del modulo empresarial.",
    href: "/(tabs)/(employer)/reports",
    iconName: "bar-chart-outline",
  },
];

export default function EmployerIndexScreen() {
  return (
    <EmployerScreenContainer>
      <MoreMenuList
        title="Mas opciones"
        subtitle="Mantén a mano las rutas secundarias sin recargar la navegacion principal."
        items={MORE_ITEMS}
      />
    </EmployerScreenContainer>
  );
}
