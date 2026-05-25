import { Text } from "react-native";
import PlaceholderScreen from "@/src/components/placeholders/PlaceholderScreen";
import { spacing } from "@/src/theme";

export default function EmployerDashboardScreen() {
  return (
    <PlaceholderScreen
      title="Dashboard empresarial"
      subtitle="El resumen empresarial aun esta pendiente de integracion y se mostrara aqui."
      contentStyle={{ paddingTop: spacing.xxxl + spacing.md }}
    >
      <Text>Los indicadores y tarjetas del dashboard apareceran cuando el modulo este conectado.</Text>
    </PlaceholderScreen>
  );
}
