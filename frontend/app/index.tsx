import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuthContext } from "@/src/context/AuthContext";

const ROLE_ROUTES = {
  affiliate: "/(tabs)/(affiliate)/dashboard",
  employer:  "/(tabs)/(employer)/dashboard",
  admin:     "/(tabs)/(admin)/dashboard",
  guest:     "/(auth)/login",
} as const;

export default function Index() {
  const { isLoading, state } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#369BC9" />
      </View>
    );
  }

  return <Redirect href={ROLE_ROUTES[state.role] as never} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
