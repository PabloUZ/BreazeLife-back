import { Text, View } from "react-native";

import PlaceholderLinkButton from "@/src/components/navigation/PlaceholderLinkButton";
import PlaceholderScreen from "@/src/components/placeholders/PlaceholderScreen";

export default function LoginScreen() {
  return (
    <PlaceholderScreen
      title="Auth Login"
      subtitle="Temporary entry point for the authentication module."
    >
      <View style={{ gap: 12 }}>
        <Text>
          TODO: Implement form handling, JWT auth flow and role guards.
        </Text>
        <PlaceholderLinkButton href="/(auth)/register" label="Go to Register" />
        <PlaceholderLinkButton
          href="/(auth)/forgot-password"
          label="Go to Forgot Password"
        />
        <PlaceholderLinkButton
          href="/(tabs)/(affiliate)/dashboard"
          label="Open Affiliate Module"
        />
        <PlaceholderLinkButton
          href="/(tabs)/(employer)/dashboard"
          label="Open Employer Module"
        />
        <PlaceholderLinkButton
          href="/(tabs)/(admin)/dashboard"
          label="Open Admin Module"
        />
      </View>
    </PlaceholderScreen>
  );
}
