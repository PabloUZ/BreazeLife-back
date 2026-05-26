import { Text } from "react-native";

import PlaceholderScreen from "@/src/components/placeholders/PlaceholderScreen";
import { spacing } from "@/src/theme";

export default function AdminEmployersScreen() {
  return (
    <PlaceholderScreen
      contentStyle={{ paddingTop: spacing.xxxl }}
      title="Admin Employers"
      subtitle="Admin employers management placeholder."
    >
      <Text>TODO: Implement employers listing and moderation actions.</Text>
    </PlaceholderScreen>
  );
}
