import { Text } from "react-native";

import PlaceholderScreen from "@/src/components/placeholders/PlaceholderScreen";
import { spacing } from "@/src/theme";

export default function AdminSettingsScreen() {
  return (
    <PlaceholderScreen
      contentStyle={{ paddingTop: spacing.xxxl }}
      title="Admin Settings"
      subtitle="Admin settings module placeholder."
    >
      <Text>TODO: Implement settings forms and API integration.</Text>
    </PlaceholderScreen>
  );
}
