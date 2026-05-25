import { Text } from "react-native";
import PlaceholderScreen from "@/src/components/placeholders/PlaceholderScreen";
import { spacing } from "@/src/theme";

export default function EmployerReportsScreen() {
  return (
    <PlaceholderScreen
      title="Reportes empresariales"
      subtitle="La generacion de reportes aun esta pendiente y se mostrara aqui."
      contentStyle={{ paddingTop: spacing.xxxl + spacing.md }}
    >
      <Text>Los filtros y exportaciones de reportes apareceran cuando el modulo este conectado.</Text>
    </PlaceholderScreen>
  );
}
