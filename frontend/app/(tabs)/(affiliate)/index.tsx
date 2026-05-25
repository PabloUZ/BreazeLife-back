import AffiliateScreenContainer from "@/src/components/layout/AffiliateScreenContainer";
import MoreMenuList, { type MoreMenuItem } from "@/src/components/common/MoreMenuList";

const MORE_ITEMS: MoreMenuItem[] = [
  {
    title: "Cotizaciones",
    description: "Revisa el historial y estado de tus cotizaciones.",
    href: "/(tabs)/(affiliate)/quotes",
    iconName: "document-text-outline",
  },
  {
    title: "Simulador",
    description: "Proyecta tu pension con tus datos actuales.",
    href: "/(tabs)/(affiliate)/simulator",
    iconName: "calculator-outline",
  },
  {
    title: "Documentos",
    description: "Genera certificados, extractos y soportes.",
    href: "/(tabs)/(affiliate)/documents",
    iconName: "folder-outline",
  },
  {
    title: "Alertas",
    description: "Consulta notificaciones y novedades de tu cuenta.",
    href: "/(tabs)/(affiliate)/notifications",
    iconName: "notifications-outline",
  },
];

export default function AffiliateIndexScreen() {
  return (
    <AffiliateScreenContainer>
      <MoreMenuList
        title="Mas opciones"
        subtitle="Accede rapidamente a las herramientas y secciones secundarias de tu cuenta."
        items={MORE_ITEMS}
      />
    </AffiliateScreenContainer>
  );
}
